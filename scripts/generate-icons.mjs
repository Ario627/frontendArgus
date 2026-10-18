import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] === undefined ? resolve(scriptDir, "../public/icons") : resolve(process.argv[2]);

const INK = [0x17, 0x19, 0x1c];
const KERTAS = [0xf7, 0xf7, 0xf5];
const KUNYIT = [0xa8, 0x72, 0x1f];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) === 1 ? (0xedb88320 ^ (c >>> 1)) >>> 0 : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = (CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(4);
  head.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([head, body, tail]);
}

function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function coverage(distance, radius) {
  return Math.min(1, Math.max(0, radius + 0.5 - distance));
}

function mix(base, over, alpha) {
  return [
    Math.round(base[0] * (1 - alpha) + over[0] * alpha),
    Math.round(base[1] * (1 - alpha) + over[1] * alpha),
    Math.round(base[2] * (1 - alpha) + over[2] * alpha)
  ];
}

function segmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  const t = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function drawIcon(size, contentScale) {
  const rgba = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const scale = size * contentScale;
  const ringRadius = scale * 0.3;
  const ringHalf = Math.max(1, scale * 0.029);
  const needleHalf = Math.max(0.9, scale * 0.022);
  const hubRadius = Math.max(1.5, scale * 0.068);
  const angle = (-38 * Math.PI) / 180;
  const tipX = cx + Math.cos(angle) * ringRadius * 0.74;
  const tipY = cy + Math.sin(angle) * ringRadius * 0.74;
  const tickOuter = ringRadius + ringHalf + scale * 0.02;
  const tickInner = ringRadius - ringHalf - scale * 0.02;
  const ticks = [0, Math.PI, Math.PI / 2];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      let color = INK;
      const distance = Math.hypot(px - cx, py - cy);

      const ringCoverage = coverage(Math.abs(distance - ringRadius), ringHalf);
      if (ringCoverage > 0) color = mix(color, KERTAS, ringCoverage);

      for (const tick of ticks) {
        const tx1 = cx + Math.cos(tick) * tickInner;
        const ty1 = cy + Math.sin(tick) * tickInner;
        const tx2 = cx + Math.cos(tick) * tickOuter;
        const ty2 = cy + Math.sin(tick) * tickOuter;
        const tickCoverage = coverage(segmentDistance(px, py, tx1, ty1, tx2, ty2), needleHalf * 0.8);
        if (tickCoverage > 0) color = mix(color, KERTAS, tickCoverage);
      }

      const needleCoverage = coverage(segmentDistance(px, py, cx, cy, tipX, tipY), needleHalf);
      if (needleCoverage > 0) color = mix(color, KUNYIT, needleCoverage);

      const hubCoverage = coverage(distance, hubRadius);
      if (hubCoverage > 0) color = mix(color, KUNYIT, hubCoverage);

      const offset = (y * size + x) * 4;
      rgba[offset] = color[0];
      rgba[offset + 1] = color[1];
      rgba[offset + 2] = color[2];
      rgba[offset + 3] = 255;
    }
  }
  return encodePng(size, rgba);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "icon-192.png"), drawIcon(192, 0.88));
writeFileSync(resolve(outDir, "icon-512.png"), drawIcon(512, 0.88));
writeFileSync(resolve(outDir, "icon-maskable-512.png"), drawIcon(512, 0.68));
console.log("icons written to", outDir);