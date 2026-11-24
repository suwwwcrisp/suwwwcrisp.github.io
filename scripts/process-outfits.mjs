import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const BRAIN_ROOT = 'C:\\Users\\Akira\\.gemini\\antigravity\\brain';
const OUTFITS_OUT_DIR = path.join(process.cwd(), 'public', 'images', 'outfits');
const BG_OUT_DIR = path.join(process.cwd(), 'public', 'images', 'bg');
const TEMP_DIR = path.join(process.cwd(), '.tmp', 'outfit_tmp');

fs.mkdirSync(OUTFITS_OUT_DIR, { recursive: true });
fs.mkdirSync(BG_OUT_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

const OUTFIT_SOURCES = [
  {
    id: 'miku-v2',
    src: path.join(
      BRAIN_ROOT,
      '0b2ed46f-7da5-4ec5-8dde-840c877d8c58',
      'hatsune_miku_pixel_sprite_1795437531443.jpg',
    ),
  },
  {
    id: 'miku-snow',
    src: path.join(
      BRAIN_ROOT,
      '0b2ed46f-7da5-4ec5-8dde-840c877d8c58',
      'snow_miku_pixel_sprite_wish_pose_v3_1795439398758.jpg',
    ),
  },
  {
    id: 'miku-sakura',
    src: path.join(
      BRAIN_ROOT,
      '0b2ed46f-7da5-4ec5-8dde-840c877d8c58',
      'sakura_miku_pixel_pose_1795439352609.jpg',
    ),
  },
  {
    id: 'miku-cyber',
    src: path.join(
      BRAIN_ROOT,
      '0b2ed46f-7da5-4ec5-8dde-840c877d8c58',
      'cyber_miku_singing_pose_1795439358617.jpg',
    ),
  },
];

const WALLPAPER_SRC = path.join(
  BRAIN_ROOT,
  '0b2ed46f-7da5-4ec5-8dde-840c877d8c58',
  'miku_sky_glass_stage_wallpaper_1795437537916.jpg',
);

function jpgToTempPng(srcJpg, dstPng) {
  const psScript = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${srcJpg.replace(/'/g, "''")}')
$img.Save('${dstPng.replace(/'/g, "''")}', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
`;
  execFileSync('powershell', ['-NoProfile', '-Command', psScript], {
    stdio: 'pipe',
  });
}

function isNearWhiteBackground(data, pixelIdx) {
  const i = pixelIdx * 4;
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  return min >= 230 && max - min <= 26;
}

function removeExteriorWhiteAndNormalize(id, pngBuffer, targetSize = 384) {
  const src = PNG.sync.read(pngBuffer);
  const { width, height, data } = src;
  const total = width * height;
  const visited = new Uint8Array(total);
  const removed = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const tryPush = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    visited[p] = 1;
    if (isNearWhiteBackground(data, p)) {
      removed[p] = 1;
      queue[tail++] = p;
    }
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = (p - x) / width;
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  for (let p = 0; p < total; p++) {
    if (removed[p]) {
      data[p * 4 + 3] = 0;
    }
  }

  // 1px soft anti-halo cleanup along cut border
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      if (removed[p]) continue;
      const hasRemovedNeighbor =
        removed[p - 1] ||
        removed[p + 1] ||
        removed[p - width] ||
        removed[p + width];
      if (!hasRemovedNeighbor) continue;

      const i = p * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const min = Math.min(r, g, b);
      const max = Math.max(r, g, b);
      if (min >= 188 && max - min <= 30) {
        const lum = (r + g + b) / 3;
        data[i + 3] = lum >= 220 ? 0 : Math.round(((228 - lum) / 40) * 200);
      }
    }
  }

  // Tight bounding box
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropW = Math.max(1, maxX - minX + 1);
  const cropH = Math.max(1, maxY - minY + 1);
  const out = new PNG({ width: targetSize, height: targetSize });

  // Height-locked scaling so all 4 outfits match standing height and visual weight
  const targetHeight = targetSize * 0.84;
  let scale = targetHeight / cropH;
  if (cropW * scale > targetSize * 0.94) {
    scale = (targetSize * 0.94) / cropW;
  }

  const drawW = Math.round(cropW * scale);
  const drawH = Math.round(cropH * scale);
  const offsetX = Math.floor((targetSize - drawW) / 2);
  const offsetY = Math.floor(targetSize * 0.93 - drawH);

  for (let dy = 0; dy < drawH; dy++) {
    const sy = Math.min(cropH - 1, Math.floor(dy / scale)) + minY;
    for (let dx = 0; dx < drawW; dx++) {
      const sx = Math.min(cropW - 1, Math.floor(dx / scale)) + minX;
      const dstX = offsetX + dx;
      const dstY = offsetY + dy;
      if (dstX < 0 || dstX >= targetSize || dstY < 0 || dstY >= targetSize) continue;

      const sIdx = (sy * width + sx) * 4;
      const dIdx = (dstY * targetSize + dstX) * 4;
      out.data[dIdx] = data[sIdx];
      out.data[dIdx + 1] = data[sIdx + 1];
      out.data[dIdx + 2] = data[sIdx + 2];
      out.data[dIdx + 3] = data[sIdx + 3];
    }
  }

  console.log(`${id}: crop ${cropW}x${cropH} -> normalized ${drawW}x${drawH} in ${targetSize}x${targetSize}`);
  return PNG.sync.write(out);
}

const EXTRA_POCKET_SEEDS_384 = {
  'miku-v2': [
    [138, 171],
    [207, 210],
  ],
  'miku-snow': [
    [87, 203],
    [288, 204],
  ],
  'miku-sakura': [
    [145, 155],
    [135, 207],
    [207, 196],
  ],
  'miku-cyber': [
    [232, 153],
    [147, 162],
    [133, 218],
  ],
};

function clearEnclosedPockets(id, pngBuffer) {
  const seeds = EXTRA_POCKET_SEEDS_384[id];
  if (!seeds || seeds.length === 0) return pngBuffer;

  const png = PNG.sync.read(pngBuffer);
  const { width, height, data } = png;
  const total = width * height;
  const visited = new Uint8Array(total);
  const removed = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const isWhitePocket = (p) => {
    const i = p * 4;
    if (data[i + 3] === 0) return false;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    return Math.min(r, g, b) >= 228 && Math.max(r, g, b) - Math.min(r, g, b) <= 28;
  };

  const tryPush = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    visited[p] = 1;
    if (isWhitePocket(p)) {
      removed[p] = 1;
      queue[tail++] = p;
    }
  };

  for (const [sx, sy] of seeds) {
    tryPush(sx, sy);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    const y = (p - x) / width;
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  for (let p = 0; p < total; p++) {
    if (removed[p]) {
      data[p * 4 + 3] = 0;
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p = y * width + x;
      if (removed[p] || data[p * 4 + 3] === 0) continue;
      if (
        removed[p - 1] ||
        removed[p + 1] ||
        removed[p - width] ||
        removed[p + width]
      ) {
        const i = p * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (Math.min(r, g, b) >= 188 && Math.max(r, g, b) - Math.min(r, g, b) <= 30) {
          const lum = (r + g + b) / 3;
          data[i + 3] = lum >= 220 ? 0 : Math.round(((228 - lum) / 40) * 200);
        }
      }
    }
  }

  return PNG.sync.write(png);
}

for (const item of OUTFIT_SOURCES) {
  const tmpPng = path.join(TEMP_DIR, `${item.id}.png`);
  jpgToTempPng(item.src, tmpPng);
  const rawBuf = fs.readFileSync(tmpPng);
  const processed = clearEnclosedPockets(
    item.id,
    removeExteriorWhiteAndNormalize(item.id, rawBuf, 384),
  );
  const outPath = path.join(OUTFITS_OUT_DIR, `${item.id}.png`);
  fs.writeFileSync(outPath, processed);
}

const bgOutPath = path.join(BG_OUT_DIR, 'miku-stage-bg.png');
jpgToTempPng(WALLPAPER_SRC, bgOutPath);
console.log('Saved stage wallpaper -> public/images/bg/miku-stage-bg.png');

fs.rmSync(TEMP_DIR, { recursive: true, force: true });
