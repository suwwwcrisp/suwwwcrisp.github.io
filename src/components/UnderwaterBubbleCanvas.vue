<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = withDefaults(
  defineProps<{
    density?: 'rich' | 'soft';
    interactive?: boolean;
  }>(),
  {
    density: 'rich',
    interactive: true,
  },
);

const { theme } = useTheme();
const canvasRef = ref<HTMLCanvasElement | null>(null);

interface BubbleParticle {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  wobbleAmp: number;
  wobbleFreq: number;
  wobblePhase: number;
  layer: 'back' | 'mid' | 'front';
  hueKind: 'teal' | 'sky' | 'pink';
  alpha: number;
}

interface CausticMote {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
  freq: number;
  tint: 'teal' | 'gold' | 'pink';
}

interface WakeBubble {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

let ctx: CanvasRenderingContext2D | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;
let width = 800;
let height = 600;
let dpr = 1;

const bubbles: BubbleParticle[] = [];
const motes: CausticMote[] = [];
const wakeBubbles: WakeBubble[] = [];
let pointerX = -9999;
let pointerY = -9999;
let pointerActive = false;
let lastSpawnTime = 0;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function seedParticles() {
  bubbles.length = 0;
  motes.length = 0;

  const bubbleCount = props.density === 'rich' ? 46 : 18;
  const moteCount = props.density === 'rich' ? 26 : 12;

  for (let i = 0; i < bubbleCount; i += 1) {
    const roll = Math.random();
    let layer: 'back' | 'mid' | 'front' = 'mid';
    let r = rand(6, 13.5);
    let vy = rand(18, 34);
    let alpha = rand(0.5, 0.85);

    if (roll < 0.24) {
      layer = 'back';
      r = rand(15, 25);
      vy = rand(10, 19);
      alpha = rand(0.28, 0.48);
    } else if (roll > 0.68) {
      layer = 'front';
      r = rand(2.4, 5.4);
      vy = rand(26, 48);
      alpha = rand(0.62, 0.92);
    }

    const hues: Array<'teal' | 'sky' | 'pink'> = ['teal', 'teal', 'sky', 'pink'];
    bubbles.push({
      x: rand(0, width),
      y: rand(0, height),
      r,
      vy,
      vx: 0,
      wobbleAmp: rand(6, 20),
      wobbleFreq: rand(0.7, 1.85),
      wobblePhase: rand(0, Math.PI * 2),
      layer,
      hueKind: hues[i % hues.length],
      alpha,
    });
  }

  for (let i = 0; i < moteCount; i += 1) {
    const tints: Array<'teal' | 'gold' | 'pink'> = ['teal', 'gold', 'teal', 'pink'];
    motes.push({
      x: rand(0, width),
      y: rand(0, height),
      r: rand(1.1, 2.8),
      vy: rand(-6, 8),
      vx: rand(-5, 5),
      phase: rand(0, Math.PI * 2),
      freq: rand(0.8, 2.3),
      tint: tints[i % tints.length],
    });
  }
}

function updateCanvasSize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  width = Math.max(120, Math.round(rect.width));
  height = Math.max(120, Math.round(rect.height));
  dpr = Math.min(2, window.devicePixelRatio || 1);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  if (bubbles.length === 0) {
    seedParticles();
  }
}

function drawGlassBubble(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  layer: 'back' | 'mid' | 'front',
  hueKind: 'teal' | 'sky' | 'pink',
  alpha: number,
  isDark: boolean,
) {
  c.save();
  c.globalAlpha = alpha;

  const rimColor = isDark
    ? hueKind === 'pink'
      ? 'rgba(255, 118, 192, 0.78)'
      : hueKind === 'sky'
        ? 'rgba(116, 214, 255, 0.78)'
        : 'rgba(104, 246, 236, 0.84)'
    : hueKind === 'pink'
      ? 'rgba(225, 92, 162, 0.56)'
      : hueKind === 'sky'
        ? 'rgba(66, 168, 224, 0.62)'
        : 'rgba(40, 186, 176, 0.65)';

  const innerFill = c.createRadialGradient(
    x - r * 0.32,
    y - r * 0.34,
    r * 0.08,
    x,
    y,
    r,
  );
  if (isDark) {
    innerFill.addColorStop(0, 'rgba(225, 255, 254, 0.34)');
    innerFill.addColorStop(0.55, 'rgba(60, 210, 215, 0.08)');
    innerFill.addColorStop(1, 'rgba(76, 235, 224, 0.24)');
  } else {
    innerFill.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
    innerFill.addColorStop(0.58, 'rgba(195, 248, 250, 0.14)');
    innerFill.addColorStop(1, 'rgba(57, 197, 187, 0.22)');
  }

  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = innerFill;
  c.fill();

  if (layer !== 'back') {
    c.lineWidth = r > 10 ? 1.35 : 1;
    c.strokeStyle = rimColor;
    c.stroke();

    // Upper-left crisp curved specular highlight
    if (r >= 4.2) {
      c.beginPath();
      c.arc(x, y, r * 0.72, Math.PI * 1.08, Math.PI * 1.48);
      c.lineWidth = Math.max(1.1, r * 0.16);
      c.lineCap = 'round';
      c.strokeStyle = isDark
        ? 'rgba(240, 255, 255, 0.85)'
        : 'rgba(255, 255, 255, 0.94)';
      c.stroke();

      // Secondary lower-right iridescent rim reflection
      c.beginPath();
      c.arc(x, y, r * 0.76, Math.PI * 0.12, Math.PI * 0.42);
      c.lineWidth = Math.max(0.85, r * 0.11);
      c.strokeStyle =
        hueKind === 'pink'
          ? 'rgba(255, 130, 198, 0.72)'
          : 'rgba(116, 242, 234, 0.78)';
      c.stroke();
    }

    // Tiny sharp glint dot
    if (r >= 7) {
      c.beginPath();
      c.arc(x + r * 0.28, y - r * 0.42, Math.max(1, r * 0.12), 0, Math.PI * 2);
      c.fillStyle = 'rgba(255, 255, 255, 0.92)';
      c.fill();
    }
  } else {
    // Soft bokeh rim on deep background bubbles
    c.lineWidth = 0.9;
    c.strokeStyle = isDark
      ? 'rgba(110, 240, 232, 0.34)'
      : 'rgba(255, 255, 255, 0.62)';
    c.stroke();
  }

  c.restore();
}

function drawFrame(nowSec: number, dt: number) {
  if (!ctx) return;
  const c = ctx;
  const isDark = theme.value === 'dark';

  c.clearRect(0, 0, width, height);

  // 1. Caustic star-sand dust motes
  for (let i = 0; i < motes.length; i += 1) {
    const m = motes[i];
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    if (m.x < -12) m.x = width + 12;
    if (m.x > width + 12) m.x = -12;
    if (m.y < -12) m.y = height + 12;
    if (m.y > height + 12) m.y = -12;

    const pulse = 0.38 + 0.55 * (0.5 + 0.5 * Math.sin(nowSec * m.freq + m.phase));
    c.save();
    c.globalAlpha = isDark ? pulse * 0.85 : pulse * 0.65;
    c.fillStyle =
      m.tint === 'gold'
        ? isDark
          ? '#ffdcb0'
          : '#ffcf96'
        : m.tint === 'pink'
          ? '#ff9cd0'
          : isDark
            ? '#7ef7ef'
            : '#ffffff';
    c.beginPath();
    c.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  // 2. Main rising multi-depth glass bubbles
  for (let i = 0; i < bubbles.length; i += 1) {
    const b = bubbles[i];

    // Interactive gentle water wake repulsion
    if (props.interactive && pointerActive) {
      const dx = b.x - pointerX;
      const dy = b.y - pointerY;
      const distSq = dx * dx + dy * dy;
      const radius = 128;
      if (distSq > 4 && distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / radius) * 210 * dt;
        b.vx += (dx / dist) * force;
        b.y += (dy / dist) * force * 0.45;
      }
    }

    b.vx *= Math.pow(0.18, dt);
    b.x += b.vx * dt;
    b.y -= b.vy * dt;

    if (b.y < -b.r * 2.5) {
      b.y = height + b.r * 2.5;
      b.x = rand(0, width);
      b.vx = 0;
    }
    if (b.x < -40) b.x = width + 36;
    if (b.x > width + 40) b.x = -36;

    const drawX =
      b.x + Math.sin(nowSec * b.wobbleFreq + b.wobblePhase) * b.wobbleAmp;
    drawGlassBubble(c, drawX, b.y, b.r, b.layer, b.hueKind, b.alpha, isDark);
  }

  // 3. Mouse micro-wake bubbles
  for (let i = wakeBubbles.length - 1; i >= 0; i -= 1) {
    const wb = wakeBubbles[i];
    wb.life += dt;
    if (wb.life >= wb.maxLife) {
      wakeBubbles.splice(i, 1);
      continue;
    }
    wb.x += wb.vx * dt;
    wb.y += wb.vy * dt;
    wb.vy -= 26 * dt;
    const progress = wb.life / wb.maxLife;
    const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
    drawGlassBubble(
      c,
      wb.x,
      wb.y,
      wb.r,
      'front',
      i % 2 === 0 ? 'teal' : 'pink',
      Math.max(0, fade * 0.78),
      isDark,
    );
  }
}

function handlePointerMove(e: PointerEvent) {
  if (!props.interactive || !canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  ) {
    pointerActive = false;
    return;
  }
  pointerX = e.clientX - rect.left;
  pointerY = e.clientY - rect.top;
  pointerActive = true;

  const now = performance.now();
  if (now - lastSpawnTime > 65 && wakeBubbles.length < 16) {
    lastSpawnTime = now;
    wakeBubbles.push({
      x: pointerX + rand(-8, 8),
      y: pointerY + rand(-6, 6),
      r: rand(2.6, 6.2),
      vx: rand(-24, 24),
      vy: rand(-22, -6),
      life: 0,
      maxLife: rand(0.75, 1.35),
    });
  }
}

onMounted(() => {
  updateCanvasSize();
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(canvasRef.value);
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  if (!reduced && !coarse && props.interactive) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
  }

  if (reduced) {
    drawFrame(0, 0);
    return;
  }

  let prev = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - prev) * 0.001));
    prev = now;
    drawFrame(now * 0.001, dt);
    rafId = window.requestAnimationFrame(loop);
  };
  rafId = window.requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener('pointermove', handlePointerMove);
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="underwater-bubble-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.underwater-bubble-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: block;
}
</style>
