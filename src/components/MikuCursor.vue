<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { resolveAssetUrl } from '@/data/siteConfig';
import { useMikuCursor } from '@/composables/useCursor';

type CursorState = 'normal' | 'link' | 'move' | 'text' | 'working';

interface CursorDef {
  width: number;
  height: number;
  hotspotX: number;
  hotspotY: number;
  frames: string[];
  steps: Array<{ frame: number; delayMs: number }>;
}

type CursorManifest = Partial<Record<CursorState, CursorDef>>;

const { customCursorEnabled } = useMikuCursor();

const manifest = ref<CursorManifest | null>(null);
const blobCache = new Map<string, string>();
const ready = ref(false);
const visible = ref(false);
const pointerX = ref(-100);
const pointerY = ref(-100);
const currentState = ref<CursorState>('normal');
const stepIdx = ref(0);

let isFinePointer = false;
let animTimer: number | null = null;

const activeDef = computed<CursorDef | null>(() => {
  if (!manifest.value) return null;
  return manifest.value[currentState.value] ?? manifest.value.normal ?? null;
});

const activeFrameSrc = computed<string>(() => {
  const def = activeDef.value;
  if (!def || def.frames.length === 0) return '';
  const step = def.steps[stepIdx.value % Math.max(1, def.steps.length)];
  const frameIndex = step ? step.frame : 0;
  const rel = def.frames[frameIndex] ?? def.frames[0];
  return blobCache.get(rel) ?? resolveAssetUrl(rel);
});

const cursorTransform = computed<string>(() => {
  const def = activeDef.value;
  const hx = def?.hotspotX ?? 0;
  const hy = def?.hotspotY ?? 0;
  return `translate3d(${pointerX.value - hx}px, ${pointerY.value - hy}px, 0)`;
});

function syncBodyCursorClass() {
  if (typeof document === 'undefined') return;
  const shouldHideNative =
    isFinePointer && ready.value && customCursorEnabled.value && visible.value;
  document.documentElement.classList.toggle('has-miku-cursor', shouldHideNative);
}

function scheduleNextFrame() {
  if (animTimer !== null) {
    window.clearTimeout(animTimer);
    animTimer = null;
  }
  const def = activeDef.value;
  if (!def || def.steps.length <= 1 || !visible.value || !customCursorEnabled.value) {
    return;
  }
  const step = def.steps[stepIdx.value % def.steps.length];
  const delay = Math.max(40, step?.delayMs ?? 90);
  animTimer = window.setTimeout(() => {
    stepIdx.value = (stepIdx.value + 1) % def.steps.length;
    scheduleNextFrame();
  }, delay);
}

function resolveElementState(target: EventTarget | null): CursorState {
  if (!(target instanceof HTMLElement)) return 'normal';
  if (target.closest('.model-stage__canvas-wrap, [data-cursor="move"]')) {
    return 'move';
  }
  if (target.closest('input, textarea, [contenteditable="true"]')) {
    return 'text';
  }
  if (
    target.closest(
      'a, button, [role="button"], [role="tab"], select, label[for], .cursor-link',
    )
  ) {
    return 'link';
  }
  return 'normal';
}

function handlePointerMove(e: PointerEvent) {
  if (!isFinePointer || !ready.value || !customCursorEnabled.value) return;
  pointerX.value = e.clientX;
  pointerY.value = e.clientY;
  if (!visible.value) {
    visible.value = true;
    syncBodyCursorClass();
    scheduleNextFrame();
  }
  const nextState = resolveElementState(e.target);
  if (nextState !== currentState.value) {
    currentState.value = nextState;
    stepIdx.value = 0;
    scheduleNextFrame();
  }
}

function handlePointerLeave() {
  visible.value = false;
  syncBodyCursorClass();
  if (animTimer !== null) {
    window.clearTimeout(animTimer);
    animTimer = null;
  }
}

async function initManifest() {
  isFinePointer =
    window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
  if (!isFinePointer) return;

  try {
    const res = await fetch(resolveAssetUrl('cursors/miku/manifest.json'));
    if (!res.ok) return;
    const data = (await res.json()) as CursorManifest;
    manifest.value = data;

    // Preload all frames once into in-memory blob URLs so rapid 60ms swaps produce zero network re-requests
    const relPaths = new Set<string>();
    Object.values(data).forEach((def) => {
      def?.frames.forEach((f) => relPaths.add(f));
    });
    await Promise.all(
      Array.from(relPaths).map(async (rel) => {
        try {
          const imgRes = await fetch(resolveAssetUrl(rel));
          if (imgRes.ok) {
            const blob = await imgRes.blob();
            blobCache.set(rel, URL.createObjectURL(blob));
          }
        } catch {
          // Fallback to asset URL if fetch fails
        }
      }),
    );
    ready.value = true;
    syncBodyCursorClass();
  } catch {
    ready.value = false;
  }
}

watch(customCursorEnabled, () => {
  syncBodyCursorClass();
  if (customCursorEnabled.value && visible.value) {
    scheduleNextFrame();
  } else if (animTimer !== null) {
    window.clearTimeout(animTimer);
    animTimer = null;
  }
});

onMounted(() => {
  void initManifest();
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.addEventListener('mouseleave', handlePointerLeave);
});

onBeforeUnmount(() => {
  if (animTimer !== null) {
    window.clearTimeout(animTimer);
    animTimer = null;
  }
  document.documentElement.classList.remove('has-miku-cursor');
  window.removeEventListener('pointermove', handlePointerMove);
  document.removeEventListener('mouseleave', handlePointerLeave);
  blobCache.forEach((url) => URL.revokeObjectURL(url));
  blobCache.clear();
});
</script>

<template>
  <Teleport to="body">
    <img
      v-if="ready && customCursorEnabled && visible && activeFrameSrc"
      :src="activeFrameSrc"
      alt=""
      aria-hidden="true"
      class="miku-cursor-sprite pixel-art"
      :style="{
        width: `${activeDef?.width ?? 32}px`,
        height: `${activeDef?.height ?? 32}px`,
        transform: cursorTransform,
      }"
    />
  </Teleport>
</template>

<style scoped>
.miku-cursor-sprite {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  user-select: none;
  will-change: transform;
  filter: drop-shadow(0 2px 4px rgba(14, 34, 42, 0.16));
}
</style>
