import { createHash } from "node:crypto";

const origin = process.env.STAGING_ASSET_ORIGIN ?? "http://127.0.0.1:3000";
const assets = [
  ["مزهرية كهرمانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-amber-vase-2026-08-23_64fec273.jpg"],
  ["مرآة بيضاوية دخانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-smoked-mirror-v2-2026-08-23_d8905769.jpg"],
  ["حاملات شموع زجاجية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-candleholders-v2-2026-08-23_0ac47a14.jpg"],
  ["صينية تقديم دخانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-serving-tray-v2-2026-08-23_3c786ad2.jpg"],
  ["طقم أكواب بحافة كهرمانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-amber-glassware-v2-2026-08-23_5eb5cd91.jpg"],
];

function isJpeg(bytes) {
  return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isWebp(bytes) {
  return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
}

const results = await Promise.all(
  assets.map(async ([product, assetPath]) => {
    const response = await fetch(new URL(assetPath, origin));
    const bytes = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? "";
    const failedMarker = bytes.toString("utf8").includes("Image generation failed");
    const valid = response.ok && contentType.startsWith("image/") && bytes.length >= 10_000 && (isJpeg(bytes) || isWebp(bytes)) && !failedMarker;
    return {
      product,
      assetPath,
      status: response.status,
      contentType,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      valid,
    };
  }),
);

for (const result of results) {
  console.log(JSON.stringify(result));
}

if (results.some(result => !result.valid)) {
  process.exitCode = 1;
}
