import type { RequestHandler } from "express";

export type HealthPayload = {
  status: "ok";
  service: "mousa-glass";
  timestamp: string;
};

export function healthPayload(now: Date = new Date()): HealthPayload {
  return {
    status: "ok",
    service: "mousa-glass",
    timestamp: now.toISOString(),
  };
}

type HealthRouteRegistrar = {
  get: (path: string, handler: RequestHandler) => unknown;
};

export function registerHealthRoutes(app: HealthRouteRegistrar) {
  const handler: RequestHandler = (_req, res) => res.status(200).json(healthPayload());
  app.get("/healthz", handler);
  app.get("/api/healthz", handler);
}
