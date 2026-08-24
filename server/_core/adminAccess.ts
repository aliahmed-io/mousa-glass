import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { ENV } from "./env";

export const ADMIN_ACCESS_COOKIE = "mousa_admin_access";
export const ADMIN_ACCESS_DURATION_MS = 8 * 60 * 60 * 1000;

type AdminAccessPayload = {
  expiresAt: number;
  userId: number;
};

function sign(value: string) {
  return createHmac("sha256", ENV.cookieSecret).update(value).digest("base64url");
}

function parseCookie(header: string | undefined, name: string) {
  if (!header) return null;
  const prefix = `${name}=`;
  return header.split(";").map(part => part.trim()).find(part => part.startsWith(prefix))?.slice(prefix.length) ?? null;
}

export function verifyAdminPassphrase(candidate: string) {
  const expected = ENV.adminAccessPassphrase;
  if (!expected || !candidate || candidate.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));
}

export function createAdminAccessToken(userId: number, now = Date.now()) {
  const payload: AdminAccessPayload = { userId, expiresAt: now + ADMIN_ACCESS_DURATION_MS };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function hasAdminPassphraseAccess(req: Request, userId: number, now = Date.now()) {
  const token = parseCookie(req.headers.cookie, ADMIN_ACCESS_COOKIE);
  if (!token) return false;
  const [encoded, signature, ...extra] = token.split(".");
  if (!encoded || !signature || extra.length || !ENV.cookieSecret) return false;

  const expectedSignature = sign(encoded);
  if (signature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return false;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<AdminAccessPayload>;
    const expiresAt = payload.expiresAt;
    return payload.userId === userId && Number.isSafeInteger(expiresAt) && typeof expiresAt === "number" && expiresAt > now;
  } catch {
    return false;
  }
}
