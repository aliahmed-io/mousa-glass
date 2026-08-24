# Independent Monitoring Authority Assessment

## Decision

Mousa Glass intentionally does **not** create an external uptime-monitoring service in the current project state. The application already exposes the suitable public probe route, `GET /api/healthz`, which returns a non-sensitive JSON body and opaque request identifier. What remains absent is an authorized monitoring account, an approved alert recipient, escalation ownership, and a retention policy for incident evidence. Creating an unowned monitor or sending alerts to an assumed address would create a false operational control rather than a reliable one.

## Viable approaches

| Approach | What it would monitor | Authority needed before setup | Why it is not configured automatically |
| --- | --- | --- | --- |
| Independent external uptime service | Periodic `GET /api/healthz`, HTTP success, non-empty JSON body, and alert delivery | A merchant-owned account, confirmed alert recipients, acceptable monitoring interval, and escalation owner | No external service account or approved destination is available in the project. |
| Repository-hosted scheduled probe | A scheduled request to `/api/healthz` with an issue, notification, or webhook on failure | Explicit approval for a scheduled automation, notification destination, and incident-record owner | It still needs an owned notification channel and introduces an operational job that the cost-conscious autoscale design currently avoids. |

Both approaches can use the existing public health endpoint and should retain the response body as well as HTTP status when deciding success. Neither makes an unavailable alert recipient safe, and neither substitutes for real-user performance data, external error aggregation, or a backup-and-restore rehearsal.

## Preserved boundary

The independent-monitoring checklist item remains open. The project preserves its low-cost serverless architecture, does not enable a persistent worker, does not fabricate an alert contact, and does not claim a monitoring service has been configured. When an authorized owner and recipient exist, the implementation should monitor `/api/healthz`, validate a non-empty JSON body, retain timestamp/route/request-ID evidence, and follow the incident response procedure in `PRODUCTION_OPERATIONS.md`.
