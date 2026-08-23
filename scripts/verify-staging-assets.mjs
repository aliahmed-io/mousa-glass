import { createHash } from "node:crypto";

const origin = process.env.STAGING_ASSET_ORIGIN ?? "http://127.0.0.1:3000";
const assets = [
  ["مزهرية كهرمانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-amber-vase-960_a1759e41.webp"],
  ["مرآة بيضاوية دخانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-smoked-mirror-960_2bbc7cec.webp"],
  ["حاملات شموع زجاجية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-candleholders-960_c3670fc6.webp"],
  ["صينية تقديم دخانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-serving-tray-960_a43d0762.webp"],
  ["طقم أكواب بحافة كهرمانية — نموذج تجريبي", "/manus-storage/mousa-glass-staging-amber-glassware-960_e4bd2db3.webp"],
  ["مزهرية كهرمانية — مصدر بطاقة متجاوب 480px", "/manus-storage/mousa-glass-staging-amber-vase-480_2b5a53c5.webp"],
  ["مرآة بيضاوية دخانية — مصدر بطاقة متجاوب 480px", "/manus-storage/mousa-glass-staging-smoked-mirror-480_6da90960.webp"],
  ["حاملات شموع زجاجية — مصدر بطاقة متجاوب 480px", "/manus-storage/mousa-glass-staging-candleholders-480_bdd88b58.webp"],
  ["صينية تقديم دخانية — مصدر بطاقة متجاوب 480px", "/manus-storage/mousa-glass-staging-serving-tray-480_19cc5b9e.webp"],
  ["طقم أكواب بحافة كهرمانية — مصدر بطاقة متجاوب 480px", "/manus-storage/mousa-glass-staging-amber-glassware-480_0fabe6c3.webp"],
  ["طقم أكواب بحافة كهرمانية — مصدر بطاقة متجاوب 720px", "/manus-storage/mousa-glass-staging-amber-glassware-720_441c281f.webp"],
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
