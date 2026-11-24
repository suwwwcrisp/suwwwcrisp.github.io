import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const OUTFITS_DIR = path.join(ROOT, 'public', 'images', 'outfits');
const PROJECTS_DIR = path.join(ROOT, 'public', 'images', 'projects');

fs.mkdirSync(OUTFITS_DIR, { recursive: true });
fs.mkdirSync(PROJECTS_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Minimal pure-Node PNG encoder (RGBA, nearest-neighbor upscaled)
// ---------------------------------------------------------------------------
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function hexToRgba(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) : 255;
  return [r, g, b, a];
}

function renderPixelSprite(grid, palette, scale = 8) {
  const size = 32;
  if (grid.length !== size) {
    throw new Error(`Expected ${size} rows, got ${grid.length}`);
  }
  const outSize = size * scale;
  const buf = Buffer.alloc(outSize * outSize * 4);

  for (let y = 0; y < size; y++) {
    const row = grid[y];
    if (row.length !== size) {
      throw new Error(`Row ${y} length is ${row.length}, expected ${size}: ${row}`);
    }
    for (let x = 0; x < size; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const hex = palette[ch];
      if (!hex) {
        throw new Error(`Missing palette color for symbol "${ch}" at (${x}, ${y})`);
      }
      const [r, g, b, a] = hexToRgba(hex);
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = x * scale + sx;
          const py = y * scale + sy;
          const idx = (py * outSize + px) * 4;
          buf[idx] = r;
          buf[idx + 1] = g;
          buf[idx + 2] = b;
          buf[idx + 3] = a;
        }
      }
    }
  }
  return encodePng(outSize, outSize, buf);
}

// ---------------------------------------------------------------------------
// Refined 32x32 Chibi Miku Template (clean 1px outline, crisp proportions)
// ---------------------------------------------------------------------------
const BASE_GRID = [
  '................................', // 00
  '................................', // 01
  '...........OOOOOOOOOO...........', // 02
  '.........OOHHHHHHHHHHOO.........', // 03
  '........OHhhHHHHHHHHhhHO........', // 04
  '.......OHHHHHHHHHHHHHHHHO.......', // 05
  '.....OOHHHTTHHHHHHHHTTHHHOO.....', // 06
  '....OHhHOTTOHHKKHHKKHOTTOHhO....', // 07
  '...OHhsOTTOKeEKKKKEeKOTTOshHO...', // 08
  '...OHhHO..OKEEKKKKEEEO..OHhHO...', // 09  clean face between eyes!
  '..OHhHsO..OKBKKmmKKBKO..OsHhHO..', // 10  blush + tiny cute mouth
  '..OHhHsO...OKKKKKKKKO...OsHhHO..', // 11
  '..OHhHsO....OOOkkOOO....OsHhHO..', // 12
  '.OHhHsO...OUWWCCCCWWUO...OsHhHO.', // 13
  '.OHhHsO..OAAWWCCCCWWAAO..OsHhHO.', // 14  detached arm warmers!
  '.OHhHsO..OAAwWWCCWWwAAO..OsHhHO.', // 15
  '.OHhHsO..OKOSSCCCCSSOKO..OsHhHO.', // 16  little hands + waist
  '..OHhHO...OOSSdSSdSSOO...OHhHO..', // 17
  '..OHhHO...OSSdSSSSdSSO...OHhHO..', // 18
  '...OHHO...OdSddSSddSdO...OHHO...', // 19
  '...OHO....OOKKO..OKKOO....OHO...', // 20
  '....O......OLLO..OLLO......O....', // 21
  '...........OLLO..OLLO...........', // 22
  '...........OLLO..OLLO...........', // 23
  '...........OLdO..OdLO...........', // 24
  '...........OLLO..OLLO...........', // 25
  '...........OLLO..OLLO...........', // 26
  '...........OSSO..OSSO...........', // 27
  '............OO....OO............', // 28
  '................................', // 29
  '................................', // 30
  '................................', // 31
];

function cloneGrid(grid) {
  return grid.map((r) => r.split(''));
}

function setPx(g, x, y, ch) {
  if (y >= 0 && y < 32 && x >= 0 && x < 32) {
    g[y][x] = ch;
  }
}

function finishGrid(g) {
  return g.map((r) => r.join(''));
}

// Fix row 09 symmetry check: OKEEKKKKEEKO (11=O? Let's make sure eyes are symmetric:
// Row 08 M: KeEKKKKEeK (12=e,13=E, 18=E,19=e)
// Row 09 M: KEEE..EEE -> col 12-13=EE, col 18-19=EE -> KEEK..KEEK => OKEEKKKKEEKO!
BASE_GRID[9] = '...OHhHO..OKEEKKKKEEKO..OHhHO...';

// Outfit 1: V2 Classic
const v2Grid = (() => {
  const g = cloneGrid(BASE_GRID);
  // Floating musical note (top right)
  setPx(g, 28, 3, 'X');
  setPx(g, 29, 3, 'X');
  setPx(g, 28, 4, 'X');
  setPx(g, 27, 5, 'X');
  setPx(g, 28, 5, 'X');
  // Star glint (bottom left)
  setPx(g, 3, 22, 'Y');
  setPx(g, 2, 23, 'Y');
  setPx(g, 4, 23, 'Y');
  setPx(g, 3, 24, 'Y');
  return finishGrid(g);
})();

// Outfit 2: Snow Miku (beret crown with crisp O outline + winter scarf + snowflakes)
const snowGrid = (() => {
  const g = cloneGrid(BASE_GRID);
  for (let x = 13; x <= 18; x++) {
    setPx(g, x, 1, 'O');
  }
  setPx(g, 12, 2, 'O');
  for (let x = 13; x <= 18; x++) {
    setPx(g, x, 2, 'X');
  }
  setPx(g, 19, 2, 'O');
  // Scarf wrap at neck
  for (let x = 12; x <= 19; x++) {
    setPx(g, x, 13, 'X');
  }
  setPx(g, 14, 14, 'X');
  setPx(g, 15, 14, 'X');
  setPx(g, 14, 15, 'X');
  // Floating snowflakes
  setPx(g, 4, 3, 'Y');
  setPx(g, 3, 4, 'Y');
  setPx(g, 5, 4, 'Y');
  setPx(g, 4, 5, 'Y');
  setPx(g, 28, 22, 'Y');
  setPx(g, 27, 23, 'Y');
  setPx(g, 29, 23, 'Y');
  setPx(g, 28, 24, 'Y');
  return finishGrid(g);
})();

// Outfit 3: Sakura Miku (sakura flower hairpin + falling petals)
const sakuraGrid = (() => {
  const g = cloneGrid(BASE_GRID);
  // Cherry blossom on right hair
  setPx(g, 20, 4, 'X');
  setPx(g, 21, 3, 'X');
  setPx(g, 21, 5, 'X');
  setPx(g, 22, 4, 'X');
  setPx(g, 21, 4, 'Y');
  // Falling petals
  setPx(g, 3, 4, 'X');
  setPx(g, 4, 5, 'X');
  setPx(g, 28, 21, 'X');
  setPx(g, 29, 22, 'X');
  setPx(g, 4, 24, 'Y');
  setPx(g, 5, 25, 'Y');
  return finishGrid(g);
})();

// Outfit 4: Cyber Miku (holo visor + neon headset + circuit glints)
const cyberGrid = (() => {
  const g = cloneGrid(BASE_GRID);
  // Cyber headset earpieces
  setPx(g, 9, 7, 'X');
  setPx(g, 9, 8, 'X');
  setPx(g, 22, 7, 'X');
  setPx(g, 22, 8, 'X');
  // Visor glow on bangs
  setPx(g, 13, 6, 'X');
  setPx(g, 14, 6, 'X');
  setPx(g, 17, 6, 'X');
  setPx(g, 18, 6, 'X');
  // Neon belt accent
  setPx(g, 13, 16, 'Y');
  setPx(g, 18, 16, 'Y');
  // Digital pixel glints
  setPx(g, 27, 4, 'X');
  setPx(g, 29, 6, 'Y');
  setPx(g, 2, 22, 'X');
  setPx(g, 3, 23, 'Y');
  return finishGrid(g);
})();

const OUTFITS = [
  {
    file: 'miku-v2.png',
    grid: v2Grid,
    palette: {
      O: '#16242C',
      H: '#39C5BB',
      h: '#8CF4EC',
      s: '#219A92',
      T: '#E12885',
      t: '#FF6CB5',
      K: '#FFE7D9',
      k: '#F3CBB8',
      B: '#FF9BB2',
      E: '#199A94',
      e: '#FFFFFF',
      m: '#EC8BA0',
      U: '#FFE7D9',
      W: '#EDF2F6',
      w: '#C2CFD8',
      C: '#39C5BB',
      A: '#2D3A46',
      S: '#2C3946',
      d: '#39C5BB',
      L: '#2D3A46',
      X: '#39C5BB',
      Y: '#E12885',
    },
  },
  {
    file: 'miku-snow.png',
    grid: snowGrid,
    palette: {
      O: '#223954',
      H: '#89D8FF',
      h: '#E6F9FF',
      s: '#52B4E8',
      T: '#FFFFFF',
      t: '#84E6FF',
      K: '#FFF0E8',
      k: '#F2D6CA',
      B: '#FFA8BE',
      E: '#2B84C6',
      e: '#FFFFFF',
      m: '#EE95AB',
      U: '#F5FBFF',
      W: '#F7FCFF',
      w: '#CDE7F7',
      C: '#4FC3F7',
      A: '#C7E7FA',
      S: '#E2F3FC',
      d: '#5FC9F8',
      L: '#F2FAFF',
      X: '#7CE3FF',
      Y: '#9CE9FF',
    },
  },
  {
    file: 'miku-sakura.png',
    grid: sakuraGrid,
    palette: {
      O: '#3A2031',
      H: '#FF9EC2',
      h: '#FFD8E8',
      s: '#E56D9D',
      T: '#FFFFFF',
      t: '#FF5B8C',
      K: '#FFEBE2',
      k: '#F4CFC0',
      B: '#FF85A1',
      E: '#E84A7F',
      e: '#FFFFFF',
      m: '#E67A98',
      U: '#FFEBE2',
      W: '#FFF5F8',
      w: '#F7CFDC',
      C: '#FF5C8D',
      A: '#FFB3CC',
      S: '#FF89B0',
      d: '#FFF4F7',
      L: '#FFF3F7',
      X: '#FF6B9E',
      Y: '#FFE066',
    },
  },
  {
    file: 'miku-cyber.png',
    grid: cyberGrid,
    palette: {
      O: '#0D1321',
      H: '#00E5FF',
      h: '#B2FCFF',
      s: '#009BB8',
      T: '#FF2A85',
      t: '#00F0FF',
      K: '#FBE5DC',
      k: '#E9C3B4',
      B: '#FF7FA8',
      E: '#FF2A85',
      e: '#7CF7FF',
      m: '#E5799A',
      U: '#222F47',
      W: '#25334D',
      w: '#172133',
      C: '#00F0FF',
      A: '#1C273D',
      S: '#1F2B42',
      d: '#FF2A85',
      L: '#1F2A40',
      X: '#00F0FF',
      Y: '#FF2A85',
    },
  },
];

for (const outfit of OUTFITS) {
  const pngBuffer = renderPixelSprite(outfit.grid, outfit.palette, 8);
  fs.writeFileSync(path.join(OUTFITS_DIR, outfit.file), pngBuffer);
}
console.log(`Generated ${OUTFITS.length} pixel-art outfit PNGs in public/images/outfits/`);

// ---------------------------------------------------------------------------
// Generate 6 Crisp 16:10 Project Preview SVGs
// ---------------------------------------------------------------------------
const PROJECT_SVGS = [
  {
    file: 'proj-01.svg',
    bg1: '#E6FAF8',
    bg2: '#C5F4EF',
    accent: '#39C5BB',
    code: '01 // THREE.JS STAGE',
    title: 'Miku 3D Stage',
    art: `
      <circle cx="400" cy="240" r="140" fill="none" stroke="#39C5BB" stroke-width="2.5" stroke-dasharray="10 8" opacity="0.7"/>
      <ellipse cx="400" cy="335" rx="190" ry="38" fill="none" stroke="#39C5BB" stroke-width="3"/>
      <ellipse cx="400" cy="335" rx="135" ry="24" fill="rgba(57,197,187,0.16)" stroke="#E12885" stroke-width="2"/>
      <polygon points="400,120 475,240 400,325 325,240" fill="rgba(57,197,187,0.22)" stroke="#1E9E96" stroke-width="2.5"/>
      <polygon points="400,145 450,235 400,300 350,235" fill="rgba(255,255,255,0.65)" stroke="#39C5BB" stroke-width="2"/>
      <rect x="145" y="290" width="16" height="65" rx="8" fill="#39C5BB" opacity="0.7"/>
      <rect x="172" y="260" width="16" height="95" rx="8" fill="#39C5BB"/>
      <rect x="612" y="255" width="16" height="100" rx="8" fill="#E12885" opacity="0.85"/>
      <rect x="639" y="285" width="16" height="70" rx="8" fill="#39C5BB" opacity="0.7"/>
    `,
  },
  {
    file: 'proj-02.svg',
    bg1: '#EDF7FF',
    bg2: '#D8EEFF',
    accent: '#28A9E0',
    code: '02 // VOCALOID TIMELINE',
    title: 'Lyric Sync Studio',
    art: `
      <rect x="120" y="125" width="560" height="245" rx="22" fill="rgba(255,255,255,0.8)" stroke="#39C5BB" stroke-width="2"/>
      <path d="M160 220 Q220 155 280 220 T400 220 T520 220 T640 220" fill="none" stroke="#39C5BB" stroke-width="4" stroke-linecap="round"/>
      <path d="M160 245 Q220 295 280 245 T400 245 T520 245 T640 245" fill="none" stroke="#E12885" stroke-width="2.5" stroke-dasharray="6 6"/>
      <rect x="165" y="295" width="120" height="28" rx="9" fill="#39C5BB"/>
      <rect x="300" y="295" width="175" height="28" rx="9" fill="#28A9E0" opacity="0.8"/>
      <rect x="490" y="295" width="145" height="28" rx="9" fill="#E12885" opacity="0.75"/>
      <line x1="380" y1="145" x2="380" y2="345" stroke="#142628" stroke-width="2.5"/>
      <circle cx="380" cy="145" r="7" fill="#E12885"/>
    `,
  },
  {
    file: 'proj-03.svg',
    bg1: '#F1FAF9',
    bg2: '#E1F3F2',
    accent: '#39C5BB',
    code: '03 // DESIGN SYSTEM',
    title: 'Liquid Glass UI Kit',
    art: `
      <circle cx="290" cy="210" r="85" fill="#39C5BB" opacity="0.32"/>
      <circle cx="505" cy="285" r="95" fill="#E12885" opacity="0.22"/>
      <rect x="170" y="135" width="310" height="190" rx="26" fill="rgba(255,255,255,0.68)" stroke="rgba(255,255,255,0.95)" stroke-width="3"/>
      <rect x="320" y="175" width="310" height="190" rx="26" fill="rgba(255,255,255,0.58)" stroke="#39C5BB" stroke-width="2.5"/>
      <rect x="355" y="212" width="150" height="18" rx="9" fill="#39C5BB"/>
      <rect x="355" y="246" width="235" height="14" rx="7" fill="#142628" opacity="0.22"/>
      <rect x="355" y="272" width="190" height="14" rx="7" fill="#142628" opacity="0.16"/>
      <rect x="355" y="305" width="94" height="32" rx="16" fill="#E12885" opacity="0.88"/>
    `,
  },
  {
    file: 'proj-04.svg',
    bg1: '#FFF2F7',
    bg2: '#FFE2EE',
    accent: '#E12885',
    code: '04 // PIXEL TOOLKIT',
    title: 'Sprite Atlas Maker',
    art: `
      <rect x="165" y="125" width="260" height="260" rx="20" fill="rgba(255,255,255,0.85)" stroke="#E12885" stroke-width="2.5"/>
      <g transform="translate(205,165)">
        <rect x="0" y="0" width="36" height="36" fill="#39C5BB"/>
        <rect x="36" y="0" width="36" height="36" fill="#8CF4EC"/>
        <rect x="72" y="0" width="36" height="36" fill="#39C5BB"/>
        <rect x="108" y="0" width="36" height="36" fill="#219A92"/>
        <rect x="144" y="0" width="36" height="36" fill="#39C5BB"/>
        <rect x="0" y="36" width="36" height="36" fill="#E12885"/>
        <rect x="36" y="36" width="36" height="36" fill="#FFE7D9"/>
        <rect x="72" y="36" width="36" height="36" fill="#FFE7D9"/>
        <rect x="108" y="36" width="36" height="36" fill="#FFE7D9"/>
        <rect x="144" y="36" width="36" height="36" fill="#E12885"/>
        <rect x="36" y="72" width="36" height="36" fill="#199A94"/>
        <rect x="72" y="72" width="36" height="36" fill="#FFE7D9"/>
        <rect x="108" y="72" width="36" height="36" fill="#199A94"/>
        <rect x="36" y="108" width="108" height="36" fill="#39C5BB"/>
      </g>
      <rect x="465" y="155" width="170" height="200" rx="18" fill="rgba(255,255,255,0.82)" stroke="#39C5BB" stroke-width="2"/>
      <circle cx="515" cy="210" r="22" fill="#39C5BB"/>
      <circle cx="575" cy="210" r="22" fill="#E12885"/>
      <circle cx="515" cy="270" r="22" fill="#8CF4EC"/>
      <circle cx="575" cy="270" r="22" fill="#142628"/>
    `,
  },
  {
    file: 'proj-05.svg',
    bg1: '#0E1A26',
    bg2: '#132B3A',
    accent: '#4CEBE0',
    dark: true,
    code: '05 // WEB AUDIO API',
    title: '39 Hz Visualizer',
    art: `
      <circle cx="400" cy="255" r="115" fill="none" stroke="#4CEBE0" stroke-width="3" opacity="0.85"/>
      <circle cx="400" cy="255" r="82" fill="none" stroke="#FF3E9D" stroke-width="2.5" stroke-dasharray="8 6"/>
      <circle cx="400" cy="255" r="46" fill="rgba(76,235,224,0.18)" stroke="#4CEBE0" stroke-width="2"/>
      <g stroke="#4CEBE0" stroke-width="6" stroke-linecap="round">
        <line x1="400" y1="100" x2="400" y2="132"/>
        <line x1="400" y1="378" x2="400" y2="410"/>
        <line x1="245" y1="255" x2="277" y2="255"/>
        <line x1="523" y1="255" x2="555" y2="255"/>
        <line x1="292" y1="147" x2="314" y2="169" stroke="#FF3E9D"/>
        <line x1="486" y1="341" x2="508" y2="363" stroke="#FF3E9D"/>
        <line x1="508" y1="147" x2="486" y2="169" stroke="#FF3E9D"/>
        <line x1="314" y1="341" x2="292" y2="363" stroke="#FF3E9D"/>
      </g>
    `,
  },
  {
    file: 'proj-06.svg',
    bg1: '#111927',
    bg2: '#1B2738',
    accent: '#39C5BB',
    dark: true,
    code: '06 // CLI & AUTOMATION',
    title: 'Pages Deploy Kit',
    art: `
      <rect x="145" y="125" width="510" height="255" rx="20" fill="#0B111C" stroke="#39C5BB" stroke-width="2.5"/>
      <circle cx="180" cy="155" r="7" fill="#FF5F56"/>
      <circle cx="204" cy="155" r="7" fill="#FFBD2E"/>
      <circle cx="228" cy="155" r="7" fill="#27C93F"/>
      <text x="180" y="212" font-family="monospace" font-size="22" fill="#4CEBE0">$ npx miku-pages deploy</text>
      <text x="180" y="252" font-family="monospace" font-size="18" fill="#8FA8B8">✓ vite build  (392ms)</text>
      <text x="180" y="286" font-family="monospace" font-size="18" fill="#8FA8B8">✓ glb assets  verified</text>
      <text x="180" y="324" font-family="monospace" font-size="20" fill="#66E3A4">➜ Live at https://user.github.io/</text>
    `,
  },
];

for (const item of PROJECT_SVGS) {
  const ink = item.dark ? '#E8FAF8' : '#142628';
  const sub = item.dark ? 'rgba(232,250,248,0.62)' : 'rgba(20,38,40,0.58)';
  const gridColor = item.dark ? 'rgba(76,235,224,0.12)' : 'rgba(20,38,40,0.08)';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${item.bg1}"/>
      <stop offset="100%" stop-color="${item.bg2}"/>
    </linearGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="14" cy="14" r="1.8" fill="${gridColor}"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect width="800" height="500" fill="url(#dots)"/>
  ${item.art}
  <text x="48" y="64" font-family="monospace, sans-serif" font-size="18" font-weight="700" fill="${item.accent}">${item.code}</text>
  <text x="48" y="452" font-family="sans-serif" font-size="28" font-weight="700" fill="${ink}">${item.title}</text>
  <text x="752" y="452" text-anchor="end" font-family="monospace, sans-serif" font-size="16" fill="${sub}">MIKU.SPACE // ARCHIVE</text>
</svg>
`;
  fs.writeFileSync(path.join(PROJECTS_DIR, item.file), svg, 'utf8');
}
console.log(`Generated ${PROJECT_SVGS.length} project cover SVGs in public/images/projects/`);
