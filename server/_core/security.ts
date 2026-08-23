import { createHmac, randomUUID } from "node:crypto";
import type { Request, RequestHandler } from "express";
import { consumeSharedRateLimit, type SharedRateLimitConsumeInput } from "../db";
import { ENV } from "./env";

type RateLimitOptions = {
  name: string;
  windowMs: number;
  max: number;
};

type RateLimitBucket = { count: number; resetAt: number };

type SharedRateLimitOptions = {
  name: string;
  windowMs: number;
  max: number;
  keySecret?: string;
  consume?: (input: SharedRateLimitConsumeInput) => Promise<{ count: number }>;
};

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const requestIdPattern = /^[A-Za-z0-9_-]{8,128}$/;

/**
 * Provides a short, non-sensitive identifier that can be shared between a
 * customer-support report and deployment logs. Untrusted header values are
 * never reflected unless they meet a deliberately narrow identifier format.
 */
export function requestCorrelation(): RequestHandler {
  return (req, res, next) => {
    const supplied = req.header("x-request-id");
    const requestId = supplied && requestIdPattern.test(supplied) ? supplied : randomUUID();
    res.locals.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
  };
}

function requestProtocol(req: Request) {
  const forwarded = req.header("x-forwarded-proto")?.split(",")[0]?.trim();
  return forwarded === "https" ? "https" : req.protocol === "https" ? "https" : "http";
}

function additionalTrustedOrigins() {
  return (process.env.TRUSTED_WEB_ORIGINS ?? "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);
}

export function isAllowedBrowserOrigin(origin: string, host: string, protocol: string, additionalOrigins = additionalTrustedOrigins()) {
  return origin === `${protocol}://${host}` || additionalOrigins.includes(origin);
}

function requestClientKey(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function hashRateLimitClientKey(clientKey: string, secret = ENV.cookieSecret) {
  if (!secret) throw new Error("Rate-limit key secret is unavailable");
  return createHmac("sha256", secret).update(clientKey).digest("hex");
}

export function securityHeaders(): RequestHandler {
  return (req, res, next) => {
    const development = process.env.NODE_ENV === "development";
    const scriptSource = development ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self'";
    const connectSource = development ? "'self' ws: wss:" : "'self'";
    res.setHeader("Content-Security-Policy", [
      "default-src 'self'",
      `script-src ${scriptSource}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      `connect-src ${connectSource}`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "));
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Vary", "Origin");
    if (requestProtocol(req) === "https") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  };
}

/** Same-origin by default; optional trusted origins are read from a comma-separated deployment setting. */
export function corsPolicy(): RequestHandler {
  return (req, res, next) => {
    const origin = req.header("origin");
    const host = req.header("host");
    const allowed = Boolean(origin && host && isAllowedBrowserOrigin(origin, host, requestProtocol(req)));

    if (req.method === "OPTIONS") {
      if (!allowed) {
        res.status(403).json({ error: "Cross-origin preflight is not allowed." });
        return;
      }
      res.setHeader("Access-Control-Allow-Origin", origin!);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-TRPC-Source");
      res.setHeader("Access-Control-Max-Age", "600");
      res.status(204).end();
      return;
    }

    if (allowed) {
      res.setHeader("Access-Control-Allow-Origin", origin!);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    next();
  };
}

/**
 * Cookie-authenticated mutations accept only the deployed site origin (or an
 * explicitly configured trusted origin). This is the CSRF boundary for tRPC.
 */
export function requireTrustedMutationOrigin(): RequestHandler {
  return (req, res, next) => {
    if (safeMethods.has(req.method)) return next();
    const origin = req.header("origin");
    const host = req.header("host");
    if (!origin || !host || !isAllowedBrowserOrigin(origin, host, requestProtocol(req))) {
      res.status(403).json({ error: "Cross-site requests are not allowed." });
      return;
    }
    next();
  };
}

/**
 * Low-maintenance per-process rate limiter. Managed edge protection should be
 * added before a high-traffic launch; this still limits bursts on every live
 * instance and protects costly checkout/upload code paths.
 */
export function createRateLimiter({ name, windowMs, max }: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, RateLimitBucket>();
  return (req, res, next) => {
    const now = Date.now();
    const key = `${name}:${requestClientKey(req)}`;
    const previous = buckets.get(key);
    const bucket = !previous || previous.resetAt <= now ? { count: 0, resetAt: now + windowMs } : previous;
    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}

/**
 * Shared, fixed-window control for infrequent high-risk operations. It is
 * intentionally not applied to all requests, avoiding a database round-trip
 * on public reads while making checkout and proof-upload limits consistent
 * across autoscaled instances. Storage errors fail closed for these writes.
 */
export function createSharedRateLimiter({ name, windowMs, max, keySecret, consume = consumeSharedRateLimit }: SharedRateLimitOptions): RequestHandler {
  return async (req, res, next) => {
    const now = Date.now();
    const windowStartMs = Math.floor(now / windowMs) * windowMs;
    let count: number;
    try {
      count = (await consume({
        scope: name,
        keyHash: hashRateLimitClientKey(requestClientKey(req), keySecret),
        windowStartMs,
      })).count;
    } catch (error) {
      console.warn("[RateLimit] Shared limiter unavailable", { scope: name, error: error instanceof Error ? error.name : "unknown" });
      res.status(503).json({ error: "Unable to process this request right now. Please try again shortly." });
      return;
    }

    const resetAt = windowStartMs + windowMs;
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - count)));
    res.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
    if (count > max) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((resetAt - now) / 1000))));
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }
    next();
  };
}
