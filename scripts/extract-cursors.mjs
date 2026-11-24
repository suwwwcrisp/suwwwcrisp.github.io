import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const SOURCE_DIR = 'C:\\Windows\\Cursors\\Miku';
const OUT_DIR = path.join(process.cwd(), 'public', 'cursors', 'miku');

const TARGET_CURSORS = [
  { key: 'normal', file: 'Normal.ani' },
  { key: 'link', file: 'Link.ani' },
  { key: 'move', file: 'Move.ani' },
  { key: 'text', file: 'Text.ani' },
  { key: 'working', file: 'Working.ani' },
];

fs.mkdirSync(OUT_DIR, { recursive: true });

function parseIconChunk(buf) {
  const reserved = buf.readUInt16LE(0);
  const type = buf.readUInt16LE(2);
  const count = buf.readUInt16LE(4);
  if (reserved !== 0 || (type !== 1 && type !== 2) || count < 1) {
    throw new Error(`Invalid CUR/ICO header: reserved=${reserved}, type=${type}, count=${count}`);
  }

  const entries = [];
  for (let i = 0; i < count; i++) {
    const off = 6 + i * 16;
    const widthByte = buf.readUInt8(off);
    const heightByte = buf.readUInt8(off + 1);
    const width = widthByte === 0 ? 256 : widthByte;
    const height = heightByte === 0 ? 256 : heightByte;
    const hotspotX = buf.readUInt16LE(off + 4);
    const hotspotY = buf.readUInt16LE(off + 6);
    const bytesInRes = buf.readUInt32LE(off + 8);
    const imageOffset = buf.readUInt32LE(off + 12);
    entries.push({ width, height, hotspotX, hotspotY, bytesInRes, imageOffset });
  }

  // Prefer crisp 32-64px entry (or largest available <= 128)
  entries.sort((a, b) => b.width - a.width);
  const chosen = entries.find((e) => e.width <= 96) ?? entries[0];
  const imgSlice = buf.subarray(chosen.imageOffset, chosen.imageOffset + chosen.bytesInRes);

  // Embedded PNG payload?
  if (
    imgSlice.length > 8 &&
    imgSlice[0] === 0x89 &&
    imgSlice[1] === 0x50 &&
    imgSlice[2] === 0x4e &&
    imgSlice[3] === 0x47
  ) {
    const png = PNG.sync.read(imgSlice);
    return {
      width: png.width,
      height: png.height,
      hotspotX: chosen.hotspotX,
      hotspotY: chosen.hotspotY,
      pngBuffer: imgSlice,
    };
  }

  // BMP DIB payload
  const biSize = imgSlice.readUInt32LE(0);
  const width = imgSlice.readInt32LE(4);
  const heightTotal = imgSlice.readInt32LE(8);
  const height = Math.abs(heightTotal) / 2;
  const bitCount = imgSlice.readUInt16LE(14);
  const clrUsed = imgSlice.readUInt32LE(32);

  const paletteCount = bitCount <= 8 ? clrUsed || 1 << bitCount : 0;
  const paletteOffset = biSize;
  const xorOffset = paletteOffset + paletteCount * 4;
  const xorRowStride = Math.floor((width * bitCount + 31) / 32) * 4;
  const andOffset = xorOffset + xorRowStride * height;
  const andRowStride = Math.floor((width + 31) / 32) * 4;

  const png = new PNG({ width, height });
  let hasNonZeroAlpha = false;

  if (bitCount === 32) {
    for (let y = 0; y < height; y++) {
      const srcY = height - 1 - y;
      for (let x = 0; x < width; x++) {
        const a = imgSlice[xorOffset + srcY * xorRowStride + x * 4 + 3];
        if (a !== 0) {
          hasNonZeroAlpha = true;
          break;
        }
      }
      if (hasNonZeroAlpha) break;
    }
  }

  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y;
    const xorRow = xorOffset + srcY * xorRowStride;
    const andRow = andOffset + srcY * andRowStride;

    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      const andByte = andOffset < imgSlice.length ? imgSlice[andRow + (x >> 3)] : 0;
      const isMaskedTransparent = ((andByte >> (7 - (x & 7))) & 1) === 1;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 255;

      if (bitCount === 32) {
        const p = xorRow + x * 4;
        b = imgSlice[p];
        g = imgSlice[p + 1];
        r = imgSlice[p + 2];
        a = hasNonZeroAlpha ? imgSlice[p + 3] : isMaskedTransparent ? 0 : 255;
      } else if (bitCount === 24) {
        const p = xorRow + x * 3;
        b = imgSlice[p];
        g = imgSlice[p + 1];
        r = imgSlice[p + 2];
        a = isMaskedTransparent ? 0 : 255;
      } else if (bitCount === 8) {
        const idx = imgSlice[xorRow + x];
        const pal = paletteOffset + idx * 4;
        b = imgSlice[pal];
        g = imgSlice[pal + 1];
        r = imgSlice[pal + 2];
        a = isMaskedTransparent ? 0 : 255;
      } else if (bitCount === 4) {
        const byte = imgSlice[xorRow + (x >> 1)];
        const idx = x % 2 === 0 ? (byte >> 4) & 0x0f : byte & 0x0f;
        const pal = paletteOffset + idx * 4;
        b = imgSlice[pal];
        g = imgSlice[pal + 1];
        r = imgSlice[pal + 2];
        a = isMaskedTransparent ? 0 : 255;
      } else if (bitCount === 1) {
        const byte = imgSlice[xorRow + (x >> 3)];
        const idx = (byte >> (7 - (x & 7))) & 1;
        const pal = paletteOffset + idx * 4;
        b = imgSlice[pal];
        g = imgSlice[pal + 1];
        r = imgSlice[pal + 2];
        a = isMaskedTransparent ? 0 : 255;
      }

      png.data[dstIdx] = r;
      png.data[dstIdx + 1] = g;
      png.data[dstIdx + 2] = b;
      png.data[dstIdx + 3] = a;
    }
  }

  return {
    width,
    height,
    hotspotX: chosen.hotspotX,
    hotspotY: chosen.hotspotY,
    pngBuffer: PNG.sync.write(png),
  };
}

function parseAniFile(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'ACON') {
    throw new Error(`Not a valid Windows ANI file: ${filePath}`);
  }

  let dispRate = 4; // default 4 jiffies (~66ms)
  let rates = null;
  let seq = null;
  const iconChunks = [];

  let offset = 12;
  while (offset + 8 <= buf.length) {
    const id = buf.toString('ascii', offset, offset + 4);
    const size = buf.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = Math.min(buf.length, dataStart + size);

    if (id === 'anih') {
      dispRate = buf.readUInt32LE(dataStart + 28) || 4;
    } else if (id === 'rate') {
      rates = [];
      for (let p = dataStart; p + 4 <= dataEnd; p += 4) {
        rates.push(buf.readUInt32LE(p));
      }
    } else if (id === 'seq ') {
      seq = [];
      for (let p = dataStart; p + 4 <= dataEnd; p += 4) {
        seq.push(buf.readUInt32LE(p));
      }
    } else if (id === 'LIST') {
      const listType = buf.toString('ascii', dataStart, dataStart + 4);
      if (listType === 'fram') {
        let sub = dataStart + 4;
        while (sub + 8 <= dataEnd) {
          const subId = buf.toString('ascii', sub, sub + 4);
          const subSize = buf.readUInt32LE(sub + 4);
          const subStart = sub + 8;
          const subEnd = Math.min(dataEnd, subStart + subSize);
          if (subId === 'icon') {
            iconChunks.push(buf.subarray(subStart, subEnd));
          }
          sub = subStart + subSize + (subSize & 1);
        }
      }
    }

    offset = dataStart + size + (size & 1);
  }

  const frames = iconChunks.map((chunk) => parseIconChunk(chunk));
  const stepOrder = seq && seq.length > 0 ? seq : frames.map((_, i) => i);
  const steps = stepOrder.map((frameIdx, stepIdx) => {
    const jiffies = rates && rates[stepIdx] ? rates[stepIdx] : dispRate;
    return {
      frame: Math.min(frames.length - 1, Math.max(0, frameIdx)),
      delayMs: Math.max(30, Math.round((jiffies * 1000) / 60)),
    };
  });

  return { frames, steps };
}

const manifest = {};

for (const item of TARGET_CURSORS) {
  const srcPath = path.join(SOURCE_DIR, item.file);
  if (!fs.existsSync(srcPath)) {
    console.warn(`Skipping missing cursor: ${srcPath}`);
    continue;
  }

  const parsed = parseAniFile(srcPath);
  const frameUrls = [];
  parsed.frames.forEach((frame, idx) => {
    const fileName = `${item.key}-${idx}.png`;
    fs.writeFileSync(path.join(OUT_DIR, fileName), frame.pngBuffer);
    frameUrls.push(`cursors/miku/${fileName}`);
  });

  const first = parsed.frames[0];
  manifest[item.key] = {
    width: first?.width ?? 32,
    height: first?.height ?? 32,
    hotspotX: first?.hotspotX ?? 0,
    hotspotY: first?.hotspotY ?? 0,
    frames: frameUrls,
    steps: parsed.steps,
  };
  console.log(
    `Extracted ${item.file} -> ${parsed.frames.length} frames (${first?.width}x${first?.height}, hotspot ${first?.hotspotX},${first?.hotspotY})`,
  );
}

fs.writeFileSync(
  path.join(OUT_DIR, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8',
);
console.log('Saved public/cursors/miku/manifest.json');
