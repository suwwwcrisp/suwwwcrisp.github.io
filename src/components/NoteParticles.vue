<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useNoteFx } from '@/composables/useNoteFx';
import { useTheme } from '@/composables/useTheme';

interface NoteParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  glyph: string;
  color: string;
  rotation: number;
  vRot: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null);
const { noteFxEnabled } = useNoteFx();
const { theme } = useTheme();

const particles: NoteParticle[] = [];
let rafId: number | null = null;
let lastTime = 0;

const GLYPHS = ['♪', '♫', '♩', '✦'];

function syncCanvasSize() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function spawnNotes(clientX: number, clientY: number, count = 4) {
  const palette =
    theme.value === 'dark'
      ? ['#4CEBE0', '#FF3E9D', '#8CF4EC', '#7CE3FF']
      : ['#39C5BB', '#E12885', '#1B9890', '#56BFEF'];

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.35;
    const speed = 55 + Math.random() * 75;
    particles.push({
      x: clientX + (Math.random() - 0.5) * 14,
      y: clientY + (Math.random() - 0.5) * 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 20,
      size: 15 + Math.random() * 10,
      alpha: 1,
      life: 0,
      maxLife: 0.78 + Math.random() * 0.42,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      color: palette[Math.floor(Math.random() * palette.length)],
      rotation: (Math.random() - 0.5) * 0.4,
      vRot: (Math.random() - 0.5) * 1.4,
    });
  }
  startLoop();
}

function startLoop() {
  if (rafId !== null) return;
  lastTime = performance.now();
  rafId = requestAnimationFrame(tick);
}

function tick(now: number) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  const canvas = canvasRef.value;
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) {
    rafId = null;
    return;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life += dt;
    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }

    const progress = p.life / p.maxLife;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 45 * dt; // slight gentle gravity arc
    p.rotation += p.vRot * dt;
    p.alpha = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.font = `700 ${p.size}px "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = theme.value === 'dark' ? 12 : 6;
    ctx.fillText(p.glyph, 0, 0);
    ctx.restore();
  }

  if (particles.length > 0) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
}

function handlePointerDown(event: PointerEvent) {
  if (!noteFxEnabled.value) return;
  const target = event.target as HTMLElement | null;
  if (!target) return;
  // Avoid spawning particles while dragging 3D canvas or interacting with form inputs
  if (target.closest('canvas, input, textarea, select, [data-no-note-fx]')) {
    return;
  }
  spawnNotes(event.clientX, event.clientY, 4);
}

function handleCustomBurst(event: Event) {
  if (!noteFxEnabled.value) return;
  const custom = event as CustomEvent<{ x?: number; y?: number; count?: number }>;
  const x = custom.detail?.x ?? window.innerWidth / 2;
  const y = custom.detail?.y ?? window.innerHeight / 2;
  spawnNotes(x, y, custom.detail?.count ?? 8);
}

watch(noteFxEnabled, (enabled) => {
  if (!enabled) {
    particles.length = 0;
    const ctx = canvasRef.value?.getContext('2d');
    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
});

onMounted(() => {
  syncCanvasSize();
  window.addEventListener('resize', syncCanvasSize, { passive: true });
  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('miku-note-burst', handleCustomBurst);
});

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.removeEventListener('resize', syncCanvasSize);
  window.removeEventListener('pointerdown', handlePointerDown);
  window.removeEventListener('miku-note-burst', handleCustomBurst);
});
</script>

<template>
  <canvas ref="canvasRef" class="note-fx-canvas" aria-hidden="true" />
</template>

<style scoped>
.note-fx-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 60;
  pointer-events: none;
}
</style>
