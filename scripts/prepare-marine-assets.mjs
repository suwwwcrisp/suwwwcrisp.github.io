import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const PORTAL_SOURCE_DIR = 'D:/AI agents/gemini antigravity/miku素材';
const ARTIFACT_DIR =
  'C:/Users/Akira/.gemini/antigravity/brain/0b2ed46f-7da5-4ec5-8dde-840c877d8c58';
const TARGET_DIR = path.resolve('public/images/marine');

fs.mkdirSync(TARGET_DIR, { recursive: true });

function isNearWhite(r, g, b, threshold = 240) {
  return r >= threshold && g >= threshold && b >= threshold;
}

function resizeWithDotNet(srcPath, destPath, maxDim) {
  const psScript = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${srcPath.replace(/'/g, "''")}')
$ratio = [Math]::Min(1.0, ${maxDim} / [double][Math]::Max($img.Width, $img.Height))
$nw = [Math]::Max(1, [int][Math]::Round($img.Width * $ratio))
$nh = [Math]::Max(1, [int][Math]::Round($img.Height * $ratio))
$bmp = New-Object System.Drawing.Bitmap($nw, $nh, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($img, 0, 0, $nw, $nh)
$bmp.Save('${destPath.replace(/'/g, "''")}', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
`;
  execFileSync('powershell', ['-NoProfile', '-Command', psScript], {
    encoding: 'utf8',
  });
}

function extractTransparentFromPng(
  srcPng,
  rect,
  destPath,
  { threshold = 240, keepMainOnly = false, minComponentPx = 18 } = {},
) {
  const w = rect.x1 - rect.x0;
  const h = rect.y1 - rect.y0;
  const crop = new PNG({ width: w, height: h });

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = ((rect.y0 + y) * srcPng.width + (rect.x0 + x)) * 4;
      const di = (y * w + x) * 4;
      crop.data[di] = srcPng.data[si];
      crop.data[di + 1] = srcPng.data[si + 1];
      crop.data[di + 2] = srcPng.data[si + 2];
      crop.data[di + 3] = srcPng.data[si + 3];
    }
  }

  // Border-only flood fill removes exterior white while keeping interior white pearls & eye glints
  const visited = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const tryPush = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    const di = idx * 4;
    if (
      crop.data[di + 3] === 0 ||
      isNearWhite(crop.data[di], crop.data[di + 1], crop.data[di + 2], threshold)
    ) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < w; x++) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }

  while (head < tail) {
    const cur = queue[head++];
    crop.data[cur * 4 + 3] = 0;
    const cx = cur % w;
    const cy = Math.floor(cur / w);
    tryPush(cx + 1, cy);
    tryPush(cx - 1, cy);
    tryPush(cx, cy + 1);
    tryPush(cx, cy - 1);
  }

  // Filter connected foreground components
  const compVisited = new Uint8Array(w * h);
  const components = [];
  for (let i = 0; i < w * h; i++) {
    if (compVisited[i] || crop.data[i * 4 + 3] === 0) continue;
    const comp = [];
    let qh = 0;
    let qt = 0;
    queue[qt++] = i;
    compVisited[i] = 1;
    while (qh < qt) {
      const cur = queue[qh++];
      comp.push(cur);
      const cx = cur % w;
      const cy = Math.floor(cur / w);
      for (const [nx, ny] of [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ]) {
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const nIdx = ny * w + nx;
        if (!compVisited[nIdx] && crop.data[nIdx * 4 + 3] > 0) {
          compVisited[nIdx] = 1;
          queue[qt++] = nIdx;
        }
      }
    }
    components.push(comp);
  }

  const keepMask = new Uint8Array(w * h);
  if (keepMainOnly && components.length > 0) {
    components.sort((a, b) => b.length - a.length);
    for (const idx of components[0]) keepMask[idx] = 1;
  } else {
    for (const comp of components) {
      if (comp.length >= minComponentPx) {
        for (const idx of comp) keepMask[idx] = 1;
      }
    }
  }

  // Feather & de-halo exterior fringe pixels so dark mode shows crisp colored edges
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const di = idx * 4;
      if (!keepMask[idx]) {
        crop.data[di + 3] = 0;
        continue;
      }

      const touchesTransparent =
        x === 0 ||
        x === w - 1 ||
        y === 0 ||
        y === h - 1 ||
        !keepMask[idx - 1] ||
        !keepMask[idx + 1] ||
        !keepMask[idx - w] ||
        !keepMask[idx + w];

      if (touchesTransparent) {
        const minC = Math.min(
          crop.data[di],
          crop.data[di + 1],
          crop.data[di + 2],
        );
        if (minC >= 205) {
          const factor = Math.max(0.15, (244 - minC) / 39);
          crop.data[di + 3] = Math.round(crop.data[di + 3] * factor);
        }
      }

      if (crop.data[di + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const pad = 6;
  const tw = Math.max(1, maxX - minX + 1 + pad * 2);
  const th = Math.max(1, maxY - minY + 1 + pad * 2);
  const out = new PNG({ width: tw, height: th });

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const si = (y * w + x) * 4;
      const dx = x - minX + pad;
      const dy = y - minY + pad;
      const di = (dy * tw + dx) * 4;
      out.data[di] = crop.data[si];
      out.data[di + 1] = crop.data[si + 1];
      out.data[di + 2] = crop.data[si + 2];
      out.data[di + 3] = crop.data[si + 3];
    }
  }

  fs.writeFileSync(destPath, PNG.sync.write(out));
  console.log(`Saved ${path.basename(destPath)}: ${tw}x${th}`);
}

const MARINE_SOURCES = [
  {
    src: path.join(ARTIFACT_DIR, 'tako_miku_mascot_sticker_v2_1795491262508.jpg'),
    dest: path.join(TARGET_DIR, 'octopus.png'),
    keepMainOnly: true,
  },
  {
    src: path.join(ARTIFACT_DIR, 'chibi_seashell_pearl_1795499070348.jpg'),
    dest: path.join(TARGET_DIR, 'shell.png'),
    keepMainOnly: true,
  },
  {
    src: path.join(ARTIFACT_DIR, 'chibi_starfish_1795499078477.jpg'),
    dest: path.join(TARGET_DIR, 'starfish.png'),
    keepMainOnly: true,
  },
  {
    src: path.join(ARTIFACT_DIR, 'chibi_conch_shell_1795499070006.jpg'),
    dest: path.join(TARGET_DIR, 'conch.png'),
    keepMainOnly: true,
  },
];

for (const item of MARINE_SOURCES) {
  const tempPngA = path.join(os.tmpdir(), `miku-marine-a-${Date.now()}.png`);
  const tempPngB = path.join(os.tmpdir(), `miku-marine-b-${Date.now()}.png`);
  try {
    resizeWithDotNet(item.src, tempPngA, 480);
    const pngData = PNG.sync.read(fs.readFileSync(tempPngA));
    extractTransparentFromPng(
      pngData,
      { x0: 0, y0: 0, x1: pngData.width, y1: pngData.height },
      tempPngB,
      {
        threshold: 238,
        keepMainOnly: Boolean(item.keepMainOnly),
        minComponentPx: item.minComponentPx ?? 16,
      },
    );
    resizeWithDotNet(tempPngB, item.dest, 220);
    const finalPng = PNG.sync.read(fs.readFileSync(item.dest));
    console.log(
      `Optimized ${path.basename(item.dest)}: ${finalPng.width}x${finalPng.height}`,
    );
  } finally {
    if (fs.existsSync(tempPngA)) fs.unlinkSync(tempPngA);
    if (fs.existsSync(tempPngB)) fs.unlinkSync(tempPngB);
  }
}

// Extract yellow-fish-biting-Miku (bottom-center tile of chibi sheet)
const sheetPng = PNG.sync.read(
  fs.readFileSync(path.join(PORTAL_SOURCE_DIR, 'huaban-7324031295.png')),
);
extractTransparentFromPng(
  sheetPng,
  { x0: 215, y0: 424, x1: 425, y1: 635 },
  path.join(TARGET_DIR, 'chibi-fish-bite.png'),
  { threshold: 238, keepMainOnly: true },
);
