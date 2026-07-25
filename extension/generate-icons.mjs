// Generates the extension icons (16/48/128) with no dependencies: an amber
// rounded square with dark "receipt" lines. Writes RGBA PNGs into icons/.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("icons", { recursive: true });

const AMBER = [224, 164, 74];
const INK = [26, 20, 8];

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function png(size) {
  const r = size * 0.22; // corner radius
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let color = [0, 0, 0];
      let alpha = 0;
      if (insideRounded(x, y, size, r)) {
        color = AMBER;
        alpha = 255;
        if (isReceiptLine(x, y, size)) color = INK;
      }
      raw[p++] = color[0];
      raw[p++] = color[1];
      raw[p++] = color[2];
      raw[p++] = alpha;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function insideRounded(x, y, size, r) {
  const nx = Math.min(x, size - 1 - x);
  const ny = Math.min(y, size - 1 - y);
  if (nx >= r || ny >= r) return true;
  const dx = r - nx;
  const dy = r - ny;
  return dx * dx + dy * dy <= r * r;
}

function isReceiptLine(x, y, size) {
  const inX = x >= size * 0.3 && x <= size * 0.7;
  if (!inX) return false;
  const th = Math.max(1, Math.round(size * 0.055));
  for (const cy of [0.4, 0.52, 0.64]) {
    const yc = Math.round(size * cy);
    if (Math.abs(y - yc) < th / 2 + 0.5) return true;
  }
  return false;
}

for (const size of [16, 48, 128]) {
  writeFileSync(`icons/${size}.png`, png(size));
  console.log(`icons/${size}.png`);
}
