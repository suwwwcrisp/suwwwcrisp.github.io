import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';

const SOURCE_DIR = 'D:/AI agents/gemini antigravity/miku素材';
const TARGET_DIR = path.resolve('public/images/portal');

fs.mkdirSync(TARGET_DIR, { recursive: true });

function isNearWhite(r, g, b, threshold = 238) {
  return r >= threshold && g >= threshold && b >= threshold;
}

/**
 * Flood-fills contiguous near-white pixels starting from border pixels of a crop
 * and drops small disconnected secondary islands (such as corner artist stamps).
 */
function cropTransparentChibi(srcPng, rect, destPath) {
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
      isNearWhite(crop.data[di], crop.data[di + 1], crop.data[di + 2], 238)
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

  // Keep only the dominant connected character component (strips tiny stamps/doodles)
  const compVisited = new Uint8Array(w * h);
  let largestComp = [];
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
    if (comp.length > largestComp.length) {
      largestComp = comp;
    }
  }

  const keepMask = new Uint8Array(w * h);
  for (const idx of largestComp) keepMask[idx] = 1;

  // Clear non-main fragments & soften light halo on 1px outer fringe
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

      if (
        touchesTransparent &&
        isNearWhite(crop.data[di], crop.data[di + 1], crop.data[di + 2], 210)
      ) {
        crop.data[di + 3] = Math.round(crop.data[di + 3] * 0.35);
      }

      if (crop.data[di + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Tight trim + 6px clean breathing margin
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

function optimizeJpegWithDotNet(srcPath, destPath, maxWidth = 1200, quality = 88) {
  const psScript = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${srcPath.replace(/'/g, "''")}')
$ratio = [Math]::Min(1.0, ${maxWidth} / [double]$img.Width)
$nw = [Math]::Max(1, [int][Math]::Round($img.Width * $ratio))
$nh = [Math]::Max(1, [int][Math]::Round($img.Height * $ratio))
$bmp = New-Object System.Drawing.Bitmap($nw, $nh)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $nw, $nh)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, ${quality}L)
$bmp.Save('${destPath.replace(/'/g, "''")}', $codec, $encParams)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Output ("Saved ${path.basename(destPath)}: " + $nw + "x" + $nh)
`;
  const output = execFileSync(
    'powershell',
    ['-NoProfile', '-Command', psScript],
    { encoding: 'utf8' },
  );
  console.log(output.trim());
}

function cropSquareJpegWithDotNet(
  srcPath,
  destPath,
  cropRect,
  outSize = 560,
  quality = 90,
) {
  const psScript = `
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('${srcPath.replace(/'/g, "''")}')
$bmp = New-Object System.Drawing.Bitmap(${outSize}, ${outSize})
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point(0, 0)),
  (New-Object System.Drawing.Point(${outSize}, ${outSize})),
  [System.Drawing.Color]::FromArgb(201, 240, 231),
  [System.Drawing.Color]::FromArgb(148, 217, 204)
)
$g.FillRectangle($brush, 0, 0, ${outSize}, ${outSize})
$scale = [Math]::Min(${outSize} / [double]${cropRect.w}, ${outSize} / [double]${cropRect.h})
$dw = [int][Math]::Round(${cropRect.w} * $scale)
$dh = [int][Math]::Round(${cropRect.h} * $scale)
$dx = [int][Math]::Round((${outSize} - $dw) / 2.0)
$dy = [int][Math]::Round((${outSize} - $dh) / 2.0)
$srcRect = New-Object System.Drawing.Rectangle(${cropRect.x}, ${cropRect.y}, ${cropRect.w}, ${cropRect.h})
$dstRect = New-Object System.Drawing.Rectangle($dx, $dy, $dw, $dh)
$g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, ${quality}L)
$bmp.Save('${destPath.replace(/'/g, "''")}', $codec, $encParams)
$brush.Dispose()
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Output ("Saved ${path.basename(destPath)}: ${outSize}x${outSize}")
`;
  const output = execFileSync(
    'powershell',
    ['-NoProfile', '-Command', psScript],
    { encoding: 'utf8' },
  );
  console.log(output.trim());
}

function tintPngTeal(srcPath, destPath, rgb = [42, 184, 175], downsample = 1) {
  const src = PNG.sync.read(fs.readFileSync(srcPath));
  const outW = Math.max(1, Math.floor(src.width / downsample));
  const outH = Math.max(1, Math.floor(src.height / downsample));
  const out = new PNG({ width: outW, height: outH });

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      let aSum = 0;
      let count = 0;
      for (let dy = 0; dy < downsample; dy++) {
        for (let dx = 0; dx < downsample; dx++) {
          const sx = x * downsample + dx;
          const sy = y * downsample + dy;
          if (sx < src.width && sy < src.height) {
            const idx = (sy * src.width + sx) * 4;
            aSum += src.data[idx + 3];
            count++;
          }
        }
      }
      const avgA = count > 0 ? Math.round(aSum / count) : 0;
      const alpha = avgA <= 3 ? 0 : Math.min(255, avgA);
      const di = (y * outW + x) * 4;
      out.data[di] = rgb[0];
      out.data[di + 1] = rgb[1];
      out.data[di + 2] = rgb[2];
      out.data[di + 3] = alpha;
    }
  }

  fs.writeFileSync(destPath, PNG.sync.write(out));
  console.log(`Saved ${path.basename(destPath)}: ${outW}x${outH}`);
}

// 1. Crop & flood-fill 3 clean chibi Miku stickers
const sheetBuf = fs.readFileSync(path.join(SOURCE_DIR, 'huaban-7324031295.png'));
const sheetPng = PNG.sync.read(sheetBuf);

cropTransparentChibi(
  sheetPng,
  { x0: 14, y0: 42, x1: 204, y1: 206 },
  path.join(TARGET_DIR, 'chibi-shock.png'),
);
cropTransparentChibi(
  sheetPng,
  { x0: 232, y0: 242, x1: 418, y1: 418 },
  path.join(TARGET_DIR, 'chibi-fish.png'),
);
cropTransparentChibi(
  sheetPng,
  { x0: 440, y0: 262, x1: 626, y1: 422 },
  path.join(TARGET_DIR, 'chibi-leek.png'),
);

// 2. Copy transparent decorative overlays & build teal staff/note wind trails
for (const [srcName, destName] of [
  ['huaban-7070015317.png', 'staff-notes.png'],
  ['huaban-7070021493.png', 'halftone-ring.png'],
]) {
  fs.copyFileSync(path.join(SOURCE_DIR, srcName), path.join(TARGET_DIR, destName));
  console.log(`Copied ${destName}`);
}

tintPngTeal(
  path.join(SOURCE_DIR, 'huaban-7070016779.png'),
  path.join(TARGET_DIR, 'staff-wave-teal.png'),
  [42, 184, 175],
  2,
);
tintPngTeal(
  path.join(SOURCE_DIR, 'huaban-7070017616.png'),
  path.join(TARGET_DIR, 'notes-swarm-teal.png'),
  [42, 184, 175],
  1,
);

// 3. Optimize light/dark underwater Miku artworks & Miku player square cover
optimizeJpegWithDotNet(
  path.join(SOURCE_DIR, 'huaban-7186605087.png'),
  path.join(TARGET_DIR, 'water-miku-light.jpg'),
  1200,
  88,
);
optimizeJpegWithDotNet(
  path.join(SOURCE_DIR, 'huaban-7216335385.jpg'),
  path.join(TARGET_DIR, 'water-miku-dark.jpg'),
  1200,
  88,
);
cropSquareJpegWithDotNet(
  path.join(SOURCE_DIR, 'Wallpaper Alchemy - 初音未来音乐播放器简约壁纸.jpg'),
  path.join(TARGET_DIR, 'miku-player-cover.jpg'),
  { x: 230, y: 742, w: 1580, h: 1486 },
  560,
  90,
);
cropSquareJpegWithDotNet(
  path.join(SOURCE_DIR, 'huaban-7142987000.png'),
  path.join(TARGET_DIR, 'miku-nav-avatar.jpg'),
  { x: 325, y: 12, w: 540, h: 540 },
  256,
  94,
);
