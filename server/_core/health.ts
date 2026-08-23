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
