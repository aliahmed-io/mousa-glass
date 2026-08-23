import { readFile } from "node:fs/promises";

const reportPath = process.argv[2];

if (!reportPath) {
  console.error("Usage: node scripts/summarize-lighthouse.mjs <report.json>");
  process.exit(1);
}

const report = JSON.parse(await readFile(reportPath, "utf8"));
const categories = Object.fromEntries(
  Object.entries(report.categories ?? {}).map(([key, category]) => [
    key,
    Math.round((category.score ?? 0) * 100),
  ]),
);

const metrics = [
  "first-contentful-paint",
  "largest-contentful-paint",
  "total-blocking-time",
  "cumulative-layout-shift",
  "speed-index",
].map((id) => ({ id, value: report.audits?.[id]?.displayValue ?? "unavailable" }));

const opportunities = Object.values(report.audits ?? {})
  .filter((audit) => audit?.details?.type === "opportunity" && typeof audit.details.overallSavingsMs === "number")
  .map((audit) => ({
    id: audit.id,
    title: audit.title,
    score: audit.score,
    savingsMs: Math.round(audit.details.overallSavingsMs),
    displayValue: audit.displayValue,
  }))
  .filter((audit) => (audit.score ?? 1) < 1)
  .sort((left, right) => right.savingsMs - left.savingsMs);

const diagnostics = Object.values(report.audits ?? {})
  .filter((audit) => audit?.details?.type === "table" && (audit.score ?? 1) < 1)
  .map((audit) => ({
    id: audit.id,
    title: audit.title,
    score: audit.score,
    displayValue: audit.displayValue,
  }));

const detailRows = (auditId) => {
  const audit = report.audits?.[auditId];
  if (!audit?.details?.items) return [];
  return audit.details.items.slice(0, 10);
};

const focusedEvidence = {
  consoleErrors: detailRows("errors-in-console"),
  layoutShifts: detailRows("layout-shifts"),
  backForwardCache: detailRows("bf-cache"),
  colorContrast: detailRows("color-contrast"),
  ariaAllowedRole: detailRows("aria-allowed-role"),
  ariaRoles: detailRows("aria-roles"),
  imageDelivery: detailRows("image-delivery-insight"),
  unusedJavaScript: detailRows("unused-javascript"),
};

console.log(JSON.stringify({
  requestedUrl: report.requestedUrl,
  finalUrl: report.finalUrl,
  categories,
  metrics,
  opportunities,
  diagnostics,
  focusedEvidence,
}, null, 2));
