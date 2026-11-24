<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import {
  projectCategories,
  projects,
  type ProjectCategory,
  type ProjectItem,
} from '@/data/projects';
import { resolveAssetUrl } from '@/data/siteConfig';
import UnderwaterBubbleCanvas from './UnderwaterBubbleCanvas.vue';

const emit = defineEmits<{
  openProject: [project: ProjectItem, list: ProjectItem[]];
}>();

const PAGE_SIZE = 4;

const notesSwarmUrl = resolveAssetUrl('images/portal/notes-swarm-teal.png');
const octopusUrl = resolveAssetUrl('images/marine/octopus.png');
const jellyfishUrl = resolveAssetUrl('images/marine/jellyfish.svg');
const shellUrl = resolveAssetUrl('images/marine/shell.png');
const starfishUrl = resolveAssetUrl('images/marine/starfish.png');
const conchUrl = resolveAssetUrl('images/marine/conch.png');
const fishBiteUrl = resolveAssetUrl('images/marine/chibi-fish-bite.png');

const selectedCategory = ref<'全部' | ProjectCategory>('全部');
const currentPage = ref(1);

const filteredProjects = computed(() => {
  if (selectedCategory.value === '全部') {
    return projects;
  }
  return projects.filter((p) => p.category === selectedCategory.value);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProjects.value.length / PAGE_SIZE)),
);

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredProjects.value.slice(start, start + PAGE_SIZE);
});

watch(selectedCategory, () => {
  currentPage.value = 1;
});

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
}

function handleCardClick(project: ProjectItem) {
  emit('openProject', project, filteredProjects.value);
}

// ---------------------------------------------------------------------------
// High-Tension Triple-Harmonic Underwater Buoyancy (Zero Mouse Tilt / Shift)
// ---------------------------------------------------------------------------
interface CardFloatProfile {
  w1: number;
  w2: number;
  w3: number;
  p1: number;
  p2: number;
  p3: number;
  ay: number;
  ax: number;
  ar: number;
}

const CARD_FLOAT_PROFILES: CardFloatProfile[] = [
  { w1: 0.92, w2: 1.61, w3: 2.43, p1: 0.2, p2: 1.4, p3: 2.9, ay: 16.5, ax: 9.5, ar: 2.35 },
  { w1: 0.77, w2: 1.39, w3: 2.11, p1: 2.1, p2: 0.5, p3: 4.1, ay: 14.5, ax: 8.5, ar: 2.05 },
  { w1: 1.07, w2: 1.73, w3: 2.67, p1: 4.3, p2: 2.8, p3: 0.9, ay: 17.5, ax: 10.5, ar: 2.55 },
  { w1: 0.83, w2: 1.49, w3: 2.29, p1: 5.6, p2: 3.9, p3: 1.7, ay: 15.5, ax: 8.0, ar: 2.15 },
];

const TAB_PROFILES = [
  { w1: 0.89, w2: 1.53, p1: 0.3, p2: 1.7 },
  { w1: 1.03, w2: 1.71, p1: 2.0, p2: 3.4 },
  { w1: 1.17, w2: 1.91, p1: 3.7, p2: 0.9 },
  { w1: 0.97, w2: 1.63, p1: 5.1, p2: 2.6 },
];

const stageRef = ref<HTMLElement | null>(null);
const headerTitleRef = ref<HTMLElement | null>(null);
const pagePrevRef = ref<HTMLElement | null>(null);
const pageIndRef = ref<HTMLElement | null>(null);
const pageNextRef = ref<HTMLElement | null>(null);

const cardElements: Array<HTMLElement | null> = [];
const tabElements: Array<HTMLElement | null> = [];
const hoveredIdx = ref<number | null>(null);
const hoveredTabIdx = ref<number | null>(null);
const prevHovered = ref(false);
const nextHovered = ref(false);

function setCardRef(el: Element | ComponentPublicInstance | null, idx: number) {
  cardElements[idx] = el instanceof HTMLElement ? el : null;
}

function setTabRef(el: Element | ComponentPublicInstance | null, idx: number) {
  tabElements[idx] = el instanceof HTMLElement ? el : null;
}

watch(paginatedProjects, async () => {
  hoveredIdx.value = null;
  cardElements.length = paginatedProjects.value.length;
  await nextTick();
});

let rafId: number | null = null;
const hoverBlend = [0, 0, 0, 0];
const tabHoverBlend = [0, 0, 0, 0];
let prevHoverBlend = 0;
let nextHoverBlend = 0;
let motionAllowed = true;

function resetHoverStates() {
  hoveredIdx.value = null;
  hoveredTabIdx.value = null;
  prevHovered.value = false;
  nextHovered.value = false;
}

function startUnderwaterEngine(startTime: number) {
  const step = (now: number) => {
    const t = (now - startTime) * 0.001;

    // 1. Project Cards — Strong Triple-Harmonic Buoyancy (~28% Micro-Float on Hover)
    const visibleCount = paginatedProjects.value.length;
    for (let i = 0; i < visibleCount; i += 1) {
      const el = cardElements[i];
      if (!el) continue;
      const p = CARD_FLOAT_PROFILES[i % CARD_FLOAT_PROFILES.length];
      const targetHover = hoveredIdx.value === i ? 1 : 0;
      hoverBlend[i] += (targetHover - hoverBlend[i]) * 0.14;
      const hb = hoverBlend[i];

      const ampFactor = 1 - hb * 0.72;
      const dy =
        (Math.sin(t * p.w1 + p.p1) +
          0.44 * Math.sin(t * p.w2 + p.p2) +
          0.18 * Math.cos(t * p.w3 + p.p3)) *
          p.ay *
          0.68 *
          ampFactor -
        hb * 8;
      const dx =
        (Math.cos(t * p.w1 * 0.82 + p.p2) +
          0.36 * Math.sin(t * p.w2 * 0.7 + p.p1)) *
        p.ax *
        0.68 *
        ampFactor;
      const rot =
        (Math.sin(t * p.w1 * 0.9 + p.p2) +
          0.36 * Math.cos(t * p.w2 + p.p1)) *
        p.ar *
        0.68 *
        ampFactor;
      const breath = 1 + Math.sin(t * p.w2 * 0.6 + p.p3) * 0.013 * ampFactor;
      const sc = breath + hb * 0.028;

      el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    }

    // 2. Title Block Independent Drift
    if (headerTitleRef.value) {
      const hDy =
        (Math.sin(t * 0.73 + 0.4) + 0.35 * Math.cos(t * 1.37 + 1.8)) * 5.2;
      const hDx =
        (Math.cos(t * 0.61 + 1.2) + 0.3 * Math.sin(t * 1.13 + 0.7)) * 3.6;
      const hRot = Math.sin(t * 0.67 + 2.3) * 1.05;
      headerTitleRef.value.style.transform = `translate3d(${hDx.toFixed(2)}px, ${hDy.toFixed(2)}px, 0) rotate(${hRot.toFixed(2)}deg)`;
    }

    // 3. Individual Category Tabs Buoyancy (Gently Dampened on Hover for Easy Clicking)
    for (let i = 0; i < tabElements.length; i += 1) {
      const el = tabElements[i];
      if (!el) continue;
      const tp = TAB_PROFILES[i % TAB_PROFILES.length];
      const targetTabH = hoveredTabIdx.value === i ? 1 : 0;
      tabHoverBlend[i] += (targetTabH - tabHoverBlend[i]) * 0.16;
      const tabAmp = 1 - tabHoverBlend[i] * 0.72;

      const tDy =
        (Math.sin(t * tp.w1 + tp.p1) + 0.34 * Math.cos(t * tp.w2 + tp.p2)) *
          4.8 *
          tabAmp -
        tabHoverBlend[i] * 2.5;
      const tDx = Math.cos(t * tp.w1 * 0.8 + tp.p2) * 2.8 * tabAmp;
      const tRot = Math.sin(t * tp.w2 * 0.72 + tp.p1) * 1.95 * tabAmp;
      el.style.transform = `translate3d(${tDx.toFixed(2)}px, ${tDy.toFixed(2)}px, 0) rotate(${tRot.toFixed(2)}deg)`;
    }

    // 4. Individual Pagination Controls Buoyancy (Hover-Dampened for Easy Clicking)
    if (pagePrevRef.value) {
      prevHoverBlend += ((prevHovered.value ? 1 : 0) - prevHoverBlend) * 0.16;
      const prevAmp = 1 - prevHoverBlend * 0.72;
      const pDy =
        (Math.sin(t * 0.81 + 0.5) + 0.32 * Math.cos(t * 1.49 + 2.2)) *
          5.2 *
          prevAmp -
        prevHoverBlend * 2.5;
      const pDx = Math.cos(t * 0.65 + 1.9) * 3.2 * prevAmp;
      const pRot = Math.sin(t * 0.74 + 1.1) * 1.8 * prevAmp;
      pagePrevRef.value.style.transform = `translate3d(${pDx.toFixed(2)}px, ${pDy.toFixed(2)}px, 0) rotate(${pRot.toFixed(2)}deg)`;
    }
    if (pageIndRef.value) {
      const iDy = (Math.sin(t * 0.93 + 2.4) + 0.3 * Math.cos(t * 1.61 + 0.6)) * 5.0;
      const iDx = Math.sin(t * 0.57 + 3.1) * 2.8;
      const iRot = Math.cos(t * 0.82 + 2.7) * 1.45;
      pageIndRef.value.style.transform = `translate3d(${iDx.toFixed(2)}px, ${iDy.toFixed(2)}px, 0) rotate(${iRot.toFixed(2)}deg)`;
    }
    if (pageNextRef.value) {
      nextHoverBlend += ((nextHovered.value ? 1 : 0) - nextHoverBlend) * 0.16;
      const nextAmp = 1 - nextHoverBlend * 0.72;
      const nDy =
        (Math.sin(t * 0.76 + 4.2) + 0.34 * Math.cos(t * 1.33 + 1.5)) *
          5.4 *
          nextAmp -
        nextHoverBlend * 2.5;
      const nDx = Math.cos(t * 0.69 + 0.8) * 3.2 * nextAmp;
      const nRot = Math.sin(t * 0.86 + 3.8) * 1.85 * nextAmp;
      pageNextRef.value.style.transform = `translate3d(${nDx.toFixed(2)}px, ${nDy.toFixed(2)}px, 0) rotate(${nRot.toFixed(2)}deg)`;
    }

    rafId = window.requestAnimationFrame(step);
  };

  rafId = window.requestAnimationFrame(step);
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  motionAllowed = !reducedMotion;

  if (motionAllowed) {
    startUnderwaterEngine(performance.now());
  }
});

onBeforeUnmount(() => {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
});
</script>

<template>
  <section
    ref="stageRef"
    class="section-block projects-underwater-stage"
    @pointerleave="resetHoverStates"
  >
    <!-- Layered Underwater Drift-Bottle Sanctuary Backdrop -->
    <div class="underwater-backdrop" aria-hidden="true">
      <div class="water-caustic-tint" />

      <svg
        class="water-surface-shimmer"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
      >
        <path
          d="M0 32 Q 180 8 360 28 T 720 26 T 1080 30 T 1440 20 L 1440 0 L 0 0 Z"
          class="surface-shimmer-back"
        />
        <path
          d="M0 18 Q 220 42 440 16 T 880 22 T 1320 14 L 1440 24 L 1440 0 L 0 0 Z"
          class="surface-shimmer-front"
        />
      </svg>

      <span class="water-sunray water-sunray--1" />
      <span class="water-sunray water-sunray--2" />
      <span class="water-sunray water-sunray--3" />
      <span class="water-sunray water-sunray--4" />

      <svg
        class="water-caustic-net"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-60 210 C 180 120, 420 290, 680 190 S 1140 110, 1500 220"
          class="caustic-ribbon caustic-ribbon--a"
        />
        <path
          d="M-80 650 C 210 740, 520 580, 820 670 S 1220 760, 1520 620"
          class="caustic-ribbon caustic-ribbon--b"
        />
      </svg>

      <img
        :src="notesSwarmUrl"
        alt=""
        class="underwater-notes-drift"
      />

      <!-- Multi-Depth Canvas 2D Glass Bubbles & Caustic Star-Sand Motes -->
      <UnderwaterBubbleCanvas density="rich" :interactive="false" />

      <!-- 3 Translucent Midground Fish Silhouettes -->
      <svg class="aqua-fish aqua-fish--1" viewBox="0 0 48 26" width="44" height="24" fill="none">
        <path
          d="M14 13 C 20 4, 34 4, 42 13 C 34 22, 20 22, 14 13 Z M14 13 L 4 6 L 7 13 L 4 20 Z"
          class="aqua-fish__body"
        />
        <circle cx="34" cy="11" r="1.6" class="aqua-fish__eye" />
      </svg>

      <svg class="aqua-fish aqua-fish--2" viewBox="0 0 48 26" width="36" height="20" fill="none">
        <path
          d="M14 13 C 20 4, 34 4, 42 13 C 34 22, 20 22, 14 13 Z M14 13 L 4 6 L 7 13 L 4 20 Z"
          class="aqua-fish__body aqua-fish__body--alt"
        />
        <circle cx="34" cy="11" r="1.5" class="aqua-fish__eye" />
      </svg>

      <svg class="aqua-fish aqua-fish--3" viewBox="0 0 48 26" width="30" height="16" fill="none">
        <path
          d="M14 13 C 20 4, 34 4, 42 13 C 34 22, 20 22, 14 13 Z M14 13 L 4 6 L 7 13 L 4 20 Z"
          class="aqua-fish__body"
        />
        <circle cx="34" cy="11" r="1.4" class="aqua-fish__eye" />
      </svg>

      <!-- 5 High-Detail Anime Watercolor Marine Stickers (Layered Parallax) -->
      <div class="marine-ornament marine-ornament--tl marine-ornament--front">
        <div class="marine-ornament__bob marine-ornament__bob--1">
          <img
            :src="starfishUrl"
            alt=""
            class="marine-sticker-img marine-sticker-img--star"
          />
        </div>
      </div>

      <div class="marine-ornament marine-ornament--tr marine-ornament--front">
        <div class="marine-ornament__bob marine-ornament__bob--2">
          <img
            :src="octopusUrl"
            alt=""
            class="marine-sticker-img marine-sticker-img--octopus"
          />
        </div>
      </div>

      <div class="marine-ornament marine-ornament--ml marine-ornament--back">
        <div class="marine-ornament__bob marine-ornament__bob--3">
          <img
            :src="jellyfishUrl"
            alt=""
            class="marine-sticker-img marine-sticker-img--jelly"
          />
        </div>
      </div>

      <div class="marine-ornament marine-ornament--br marine-ornament--front">
        <div class="marine-ornament__bob marine-ornament__bob--4">
          <img
            :src="shellUrl"
            alt=""
            class="marine-sticker-img marine-sticker-img--shell"
          />
        </div>
      </div>

      <div class="marine-ornament marine-ornament--bl marine-ornament--back">
        <div class="marine-ornament__bob marine-ornament__bob--5">
          <img
            :src="conchUrl"
            alt=""
            class="marine-sticker-img marine-sticker-img--conch"
          />
        </div>
      </div>
    </div>

    <div class="container underwater-content">
      <div class="section-header">
        <div ref="headerTitleRef" class="floating-header-block">
          <span class="section-kicker">
            03 // BOTTLE ARCHIVE — {{ filteredProjects.length }} 个作品 / 点开任意一张
          </span>
          <h2 class="section-title">项目作品墙</h2>
        </div>

        <div
          class="category-tabs"
          role="tablist"
          aria-label="按类别筛选项目"
        >
          <button
            v-for="(cat, idx) in projectCategories"
            :key="cat"
            :ref="(el) => setTabRef(el, idx)"
            type="button"
            role="tab"
            class="cat-tab"
            :class="{ 'is-active': selectedCategory === cat }"
            :aria-selected="selectedCategory === cat"
            @pointerenter="hoveredTabIdx = idx"
            @pointerleave="hoveredTabIdx = hoveredTabIdx === idx ? null : hoveredTabIdx"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Flat 2D Underwater Floating Project Wall (Crisp Hit-Testing) -->
      <div class="project-wall">
        <button
          v-for="(project, idx) in paginatedProjects"
          :key="project.id"
          :ref="(el) => setCardRef(el, idx)"
          type="button"
          class="glass-card project-card"
          :class="{ 'is-hovered': hoveredIdx === idx }"
          @pointerenter="hoveredIdx = idx"
          @pointerleave="hoveredIdx = hoveredIdx === idx ? null : hoveredIdx"
          @click="handleCardClick(project)"
        >
            <span class="project-card__caustic" aria-hidden="true" />

            <!-- Corner Anime Marine Stickers (Outer Bezel Corner Only — Zero Content Overlap) -->
            <span
              v-if="idx === 0"
              class="card-marine-charm card-marine-charm--tl"
              aria-hidden="true"
            >
              <img :src="starfishUrl" alt="" class="card-charm-img card-charm-img--sm" />
            </span>

            <span
              v-else-if="idx === 1"
              class="card-marine-charm card-marine-charm--br"
              aria-hidden="true"
            >
              <img :src="shellUrl" alt="" class="card-charm-img card-charm-img--sm" />
            </span>

            <span
              v-else-if="idx === 2"
              class="card-marine-charm card-marine-charm--ml"
              aria-hidden="true"
            >
              <img :src="conchUrl" alt="" class="card-charm-img card-charm-img--xs" />
            </span>

            <span
              v-else
              class="card-marine-charm card-marine-charm--br-chibi"
              aria-hidden="true"
            >
              <img :src="fishBiteUrl" alt="" class="card-charm-img card-charm-img--chibi" />
            </span>

            <div class="project-card__media">
              <img
                :src="project.cover"
                :alt="project.title"
                loading="lazy"
                width="800"
                height="500"
              />
              <span class="project-card__badge mono">{{ project.category }}</span>
            </div>

            <div class="project-card__body">
              <div class="project-card__head">
                <h3>{{ project.title }}</h3>
                <span class="project-card__year mono">{{ project.year }}</span>
              </div>
              <p class="project-card__summary">{{ project.summary }}</p>
              <div class="project-card__stack">
                <span
                  v-for="tech in project.techStack.slice(0, 3)"
                  :key="tech"
                  class="stack-pill mono"
                >
                  {{ tech }}
                </span>
              </div>
            </div>
          </button>
      </div>

      <!-- Pagination Footer (Each Item Floating Independently) -->
      <div class="wall-pagination">
        <button
          ref="pagePrevRef"
          type="button"
          class="pill-btn page-btn"
          :disabled="currentPage <= 1"
          @pointerenter="prevHovered = true"
          @pointerleave="prevHovered = false"
          @click="prevPage"
        >
          ← 上一页
        </button>

        <span ref="pageIndRef" class="page-indicator mono">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          ref="pageNextRef"
          type="button"
          class="pill-btn page-btn"
          :disabled="currentPage >= totalPages"
          @pointerenter="nextHovered = true"
          @pointerleave="nextHovered = false"
          @click="nextPage"
        >
          下一页 →
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-underwater-stage {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 3.6rem);
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0.55rem 0 1.45rem;
}

.underwater-content {
  position: relative;
  z-index: 3;
}

.projects-underwater-stage .section-header {
  margin-bottom: clamp(0.55rem, 1.1vh, 0.9rem);
}

.floating-header-block {
  will-change: transform;
}

/* ---------------------------------------------------------------------------
 * Underwater Drift-Bottle Sanctuary Backdrop
 * ------------------------------------------------------------------------- */
.underwater-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.water-caustic-tint,
.water-caustic-net,
.underwater-notes-drift,
.underwater-backdrop :deep(canvas) {
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 82%,
    rgba(0, 0, 0, 0.42) 92%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 82%,
    rgba(0, 0, 0, 0.42) 92%,
    transparent 100%
  );
}

.water-caustic-tint {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(128, 240, 234, 0.28) 0%, transparent 56%),
    radial-gradient(ellipse at 18% 85%, rgba(75, 169, 223, 0.16) 0%, transparent 52%),
    radial-gradient(ellipse at 85% 78%, rgba(57, 197, 187, 0.18) 0%, transparent 50%),
    linear-gradient(
      180deg,
      rgba(222, 249, 251, 0.56) 0%,
      rgba(205, 242, 248, 0.34) 50%,
      rgba(228, 248, 250, 0.48) 100%
    );
}

[data-theme='dark'] .water-caustic-tint {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(76, 235, 224, 0.2) 0%, transparent 58%),
    radial-gradient(ellipse at 20% 82%, rgba(56, 128, 255, 0.18) 0%, transparent 54%),
    radial-gradient(ellipse at 84% 76%, rgba(255, 62, 157, 0.12) 0%, transparent 50%),
    linear-gradient(
      180deg,
      rgba(7, 22, 38, 0.74) 0%,
      rgba(8, 28, 48, 0.56) 55%,
      rgba(7, 18, 34, 0.8) 100%
    );
}

.water-surface-shimmer {
  position: absolute;
  top: 0;
  left: -6%;
  width: 112%;
  height: 76px;
  animation: surface-undulate 9.7s ease-in-out infinite alternate;
}

.surface-shimmer-back {
  fill: rgba(57, 197, 187, 0.14);
}

.surface-shimmer-front {
  fill: rgba(255, 255, 255, 0.44);
}

[data-theme='dark'] .surface-shimmer-back {
  fill: rgba(76, 235, 224, 0.14);
}

[data-theme='dark'] .surface-shimmer-front {
  fill: rgba(120, 235, 245, 0.16);
}

.water-sunray {
  position: absolute;
  top: -14%;
  height: 118%;
  transform-origin: top center;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.58) 0%,
    rgba(165, 246, 242, 0.26) 42%,
    transparent 88%
  );
  filter: blur(8px);
}

[data-theme='dark'] .water-sunray {
  background: linear-gradient(
    180deg,
    rgba(110, 245, 236, 0.26) 0%,
    rgba(66, 155, 245, 0.14) 44%,
    transparent 86%
  );
}

.water-sunray--1 {
  left: 11%;
  width: 130px;
  animation: sunray-sway-a 8.3s ease-in-out infinite alternate;
}

.water-sunray--2 {
  left: 34%;
  width: 190px;
  animation: sunray-sway-b 10.7s ease-in-out infinite alternate;
}

.water-sunray--3 {
  left: 61%;
  width: 150px;
  animation: sunray-sway-a 9.1s ease-in-out infinite alternate-reverse;
}

.water-sunray--4 {
  left: 82%;
  width: 110px;
  animation: sunray-sway-b 11.9s ease-in-out infinite alternate-reverse;
}

.water-caustic-net {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  animation: caustic-drift 13.5s ease-in-out infinite alternate;
}

.caustic-ribbon {
  stroke-linecap: round;
}

.caustic-ribbon--a {
  stroke: rgba(57, 197, 187, 0.24);
  stroke-width: 28;
  filter: blur(18px);
}

.caustic-ribbon--b {
  stroke: rgba(75, 169, 223, 0.18);
  stroke-width: 24;
  filter: blur(18px);
}

[data-theme='dark'] .caustic-ribbon--a {
  stroke: rgba(76, 235, 224, 0.2);
}

[data-theme='dark'] .caustic-ribbon--b {
  stroke: rgba(88, 156, 255, 0.18);
}

.underwater-notes-drift {
  position: absolute;
  right: 4%;
  bottom: 4%;
  width: min(320px, 26vw);
  opacity: 0.22;
  animation: notes-float 16.5s ease-in-out infinite alternate;
}

[data-theme='dark'] .underwater-notes-drift {
  opacity: 0.3;
}

/* Translucent Swimming Fish Silhouettes */
.aqua-fish {
  position: absolute;
  opacity: 0.42;
}

[data-theme='dark'] .aqua-fish {
  opacity: 0.48;
}

.aqua-fish__body {
  fill: rgba(57, 197, 187, 0.52);
  stroke: rgba(27, 152, 144, 0.48);
  stroke-width: 1.2;
}

.aqua-fish__body--alt {
  fill: rgba(75, 169, 223, 0.5);
  stroke: rgba(56, 128, 200, 0.45);
}

.aqua-fish__eye {
  fill: #ffffff;
}

.aqua-fish--1 {
  top: 22%;
  left: 8%;
  animation: fish-glide-a 21s ease-in-out infinite alternate;
}

.aqua-fish--2 {
  bottom: 18%;
  right: 12%;
  transform: scaleX(-1);
  animation: fish-glide-b 17.5s ease-in-out infinite alternate;
}

.aqua-fish--3 {
  top: 54%;
  left: 3%;
  animation: fish-glide-a 25s ease-in-out infinite alternate-reverse;
}

/* Multi-Depth Perimeter Marine Stickers */
.marine-ornament {
  position: absolute;
  will-change: transform;
}

.marine-ornament--tl { top: 8%; left: 1.6%; }
.marine-ornament--tr { top: 8%; right: 1.6%; }
.marine-ornament--ml { top: 45%; left: 1.4%; }
.marine-ornament--br { bottom: 12%; right: 1.6%; }
.marine-ornament--bl { bottom: 12%; left: 1.8%; }

.marine-ornament__bob {
  filter: drop-shadow(0 12px 18px rgba(18, 72, 92, 0.22));
}

[data-theme='dark'] .marine-ornament__bob {
  filter: drop-shadow(0 12px 22px rgba(0, 0, 0, 0.55))
    drop-shadow(0 0 12px rgba(76, 235, 224, 0.22));
}

.marine-ornament__bob--1 { animation: marine-bob-a 6.9s ease-in-out infinite; }
.marine-ornament__bob--2 { animation: marine-bob-b 8.3s ease-in-out infinite -1.5s; }
.marine-ornament__bob--3 { animation: marine-bob-c 9.7s ease-in-out infinite -3.2s; }
.marine-ornament__bob--4 { animation: marine-bob-b 7.9s ease-in-out infinite -2.4s; }
.marine-ornament__bob--5 { animation: marine-bob-a 9.1s ease-in-out infinite -4.1s; }

.marine-sticker-img {
  display: block;
  height: auto;
  object-fit: contain;
  user-select: none;
}

.marine-sticker-img--star { width: 58px; }
.marine-sticker-img--octopus { width: 70px; }
.marine-sticker-img--jelly { width: 56px; opacity: 0.92; }
.marine-sticker-img--shell { width: 68px; }
.marine-sticker-img--conch { width: 62px; }

/* ---------------------------------------------------------------------------
 * Floating Tabs, 3D Cards & Pagination
 * ------------------------------------------------------------------------- */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.52rem;
}

.cat-tab {
  padding: 0.42rem 0.92rem;
  border-radius: 999px;
  border: 1px solid rgba(57, 197, 187, 0.34);
  background: rgba(255, 255, 255, 0.72);
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  will-change: transform;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

[data-theme='dark'] .cat-tab {
  background: rgba(12, 28, 46, 0.8);
  border-color: rgba(76, 235, 224, 0.32);
}

.cat-tab:hover {
  border-color: var(--miku-teal);
  color: var(--text-primary);
  box-shadow: 0 6px 16px -8px rgba(57, 197, 187, 0.45);
}

.cat-tab.is-active {
  background: linear-gradient(125deg, #27b9af 0%, #39c5bb 55%, #4ba9df 100%);
  border-color: rgba(255, 255, 255, 0.45);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 8px 18px -8px rgba(31, 181, 171, 0.62);
}

[data-theme='dark'] .cat-tab.is-active {
  color: #05181c;
}

.project-wall {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.8rem, 1.5vh, 1.2rem);
}

.project-card {
  position: relative;
  padding: 0.72rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.52rem;
  overflow: visible;
  background: linear-gradient(
    150deg,
    rgba(255, 255, 255, 0.82) 0%,
    rgba(232, 250, 252, 0.72) 100%
  );
  border: 1.25px solid rgba(57, 197, 187, 0.38);
  box-shadow:
    0 20px 42px -22px rgba(18, 76, 94, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
  will-change: transform;
  transition:
    box-shadow 0.28s ease,
    border-color 0.28s ease,
    background-color 0.28s ease;
}

[data-theme='dark'] .project-card {
  background: linear-gradient(
    150deg,
    rgba(10, 26, 44, 0.8) 0%,
    rgba(14, 34, 56, 0.76) 100%
  );
  border-color: rgba(76, 235, 224, 0.36);
  box-shadow:
    0 24px 48px -18px rgba(0, 0, 0, 0.78),
    inset 0 1px 0 rgba(76, 235, 224, 0.2);
}

.project-card.is-hovered,
.project-card:hover {
  border-color: var(--miku-teal);
  box-shadow:
    0 28px 54px -18px rgba(24, 96, 114, 0.34),
    0 0 26px -6px rgba(57, 197, 187, 0.48),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
}

[data-theme='dark'] .project-card.is-hovered,
[data-theme='dark'] .project-card:hover {
  border-color: var(--miku-teal);
  box-shadow:
    0 28px 58px -16px rgba(0, 0, 0, 0.86),
    0 0 30px -6px rgba(76, 235, 224, 0.46),
    inset 0 1px 0 rgba(76, 235, 224, 0.34);
}

.project-card__caustic {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    115deg,
    rgba(255, 255, 255, 0.44) 0%,
    transparent 38%,
    rgba(57, 197, 187, 0.09) 100%
  );
}

[data-theme='dark'] .project-card__caustic {
  background: linear-gradient(
    115deg,
    rgba(76, 235, 224, 0.16) 0%,
    transparent 40%,
    rgba(255, 62, 157, 0.08) 100%
  );
}

/* Outer Card Corner Marine Sticker Charms */
.card-marine-charm {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  filter: drop-shadow(0 8px 12px rgba(17, 64, 80, 0.24));
  transition: transform 0.28s ease;
}

.card-marine-charm--tl {
  top: -16px;
  left: -16px;
  transform: rotate(-14deg);
}

.card-marine-charm--br {
  bottom: -15px;
  right: -15px;
  transform: rotate(10deg);
}

.card-marine-charm--ml {
  top: -15px;
  left: -15px;
  transform: rotate(-12deg);
}

.card-marine-charm--br-chibi {
  bottom: -17px;
  right: -17px;
  transform: rotate(8deg);
}

.card-charm-img {
  display: block;
  height: auto;
  object-fit: contain;
}

.card-charm-img--sm { width: 38px; }
.card-charm-img--xs { width: 34px; }
.card-charm-img--chibi { width: 34px; }

.project-card:hover .card-marine-charm--tl { transform: rotate(-5deg) scale(1.12); }
.project-card:hover .card-marine-charm--br { transform: rotate(2deg) scale(1.12); }
.project-card:hover .card-marine-charm--ml { transform: rotate(-6deg) scale(1.12); }
.project-card:hover .card-marine-charm--br-chibi { transform: rotate(0deg) scale(1.12); }

.project-card__media {
  position: relative;
  height: clamp(98px, 13.8vh, 148px);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(57, 197, 187, 0.24);
  background: var(--stage-bg);
}

.project-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.project-card:hover .project-card__media img {
  transform: scale(1.04);
}

.project-card__badge {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: var(--glass-bg-strong);
  border: 1px solid rgba(57, 197, 187, 0.34);
  backdrop-filter: blur(12px);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-primary);
}

.project-card__body {
  position: relative;
  z-index: 2;
  padding-inline: 0.25rem;
  padding-bottom: 0.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
}

.project-card__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.project-card__head h3 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 700;
}

.project-card__year {
  font-size: 0.78rem;
  color: var(--miku-teal-deep);
  font-weight: 600;
}

[data-theme='dark'] .project-card__year {
  color: var(--miku-teal);
}

.project-card__summary {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

.project-card__stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.38rem;
  margin-top: 0.12rem;
}

.stack-pill {
  font-size: 0.72rem;
  padding: 0.16rem 0.52rem;
  border-radius: 8px;
  background: rgba(57, 197, 187, 0.12);
  border: 1px solid rgba(57, 197, 187, 0.24);
  color: var(--miku-teal-deep);
}

[data-theme='dark'] .stack-pill {
  background: rgba(76, 235, 224, 0.12);
  border-color: rgba(76, 235, 224, 0.28);
  color: var(--miku-teal);
}

.wall-pagination {
  margin-top: clamp(0.65rem, 1.3vh, 1.05rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.15rem;
}

.page-btn,
.page-indicator {
  will-change: transform;
}

.page-btn {
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.page-btn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  box-shadow: none;
}

.page-indicator {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--miku-teal-deep);
  min-width: 3.5rem;
  text-align: center;
}

[data-theme='dark'] .page-indicator {
  color: var(--miku-teal);
}

/* ---------------------------------------------------------------------------
 * Ambient Marine Sticker Keyframes (Prime Durations)
 * ------------------------------------------------------------------------- */
@keyframes surface-undulate {
  0% { transform: translateX(-18px) scaleY(1); }
  100% { transform: translateX(18px) scaleY(1.12); }
}

@keyframes sunray-sway-a {
  0% { transform: skewX(-18deg) translateX(-14px); opacity: 0.42; }
  100% { transform: skewX(-10deg) translateX(16px); opacity: 0.78; }
}

@keyframes sunray-sway-b {
  0% { transform: skewX(-12deg) translateX(12px); opacity: 0.56; }
  100% { transform: skewX(-22deg) translateX(-14px); opacity: 0.34; }
}

@keyframes fish-glide-a {
  0% { transform: translate3d(0, 0, 0) rotate(-3deg); }
  50% { transform: translate3d(42px, -14px, 0) rotate(2deg); }
  100% { transform: translate3d(84px, 8px, 0) rotate(-2deg); }
}

@keyframes fish-glide-b {
  0% { transform: scaleX(-1) translate3d(0, 0, 0) rotate(2deg); }
  50% { transform: scaleX(-1) translate3d(38px, 12px, 0) rotate(-3deg); }
  100% { transform: scaleX(-1) translate3d(76px, -10px, 0) rotate(3deg); }
}

@keyframes marine-bob-a {
  0%, 100% { transform: translate3d(-4px, 4px, 0) rotate(-7deg); }
  50% { transform: translate3d(6px, -12px, 0) rotate(8deg); }
}

@keyframes marine-bob-b {
  0%, 100% { transform: translate3d(5px, -8px, 0) rotate(6deg); }
  50% { transform: translate3d(-6px, 6px, 0) rotate(-8deg); }
}

@keyframes marine-bob-c {
  0%, 100% { transform: translate3d(-3px, 6px, 0) rotate(-5deg) scale(0.98); }
  50% { transform: translate3d(5px, -10px, 0) rotate(7deg) scale(1.04); }
}

@keyframes caustic-drift {
  0% { transform: translate3d(-12px, -6px, 0) scale(1.01); }
  100% { transform: translate3d(14px, 8px, 0) scale(1.03); }
}

@keyframes notes-float {
  0% { transform: translate3d(-8px, 6px, 0) rotate(-3deg); }
  100% { transform: translate3d(10px, -10px, 0) rotate(3deg); }
}

/* ---------------------------------------------------------------------------
 * Responsive Breakpoints & Reduced-Motion Safety
 * ------------------------------------------------------------------------- */
@media (max-width: 1320px) and (min-width: 521px) {
  .marine-ornament--tl,
  .marine-ornament--ml,
  .marine-ornament--br {
    display: none;
  }

  .marine-ornament--tr { top: auto; bottom: 2.9rem; right: 1.35rem; }
  .marine-ornament--bl { bottom: 2.9rem; left: 1.35rem; }

  .marine-sticker-img--octopus { width: 52px; }
  .marine-sticker-img--conch { width: 46px; }
}

@media (max-width: 960px) and (min-width: 521px) {
  .projects-underwater-stage {
    padding-block: 0.5rem;
  }

  .projects-underwater-stage .section-header {
    margin-bottom: 0.65rem;
  }

  .project-wall {
    gap: 1rem;
  }

  .project-card {
    padding: 0.58rem;
    gap: 0.4rem;
  }

  .project-card__media {
    height: clamp(106px, 13.8vh, 128px);
  }
}

@media (max-width: 520px) {
  .projects-underwater-stage {
    min-height: auto;
    padding-block: 1.5rem;
  }

  .project-wall {
    grid-template-columns: 1fr;
  }

  .marine-ornament--tl,
  .marine-ornament--ml,
  .marine-ornament--bl {
    display: none;
  }

  .marine-sticker-img--octopus { width: 54px; }
  .marine-sticker-img--shell { width: 54px; }
}

@media (prefers-reduced-motion: reduce) {
  .water-surface-shimmer,
  .water-sunray,
  .water-caustic-net,
  .underwater-notes-drift,
  .aqua-fish,
  .marine-ornament__bob {
    animation: none;
  }

  .project-card {
    transition:
      transform 0.24s ease,
      box-shadow 0.24s ease,
      border-color 0.24s ease;
  }

  .project-card:hover {
    transform: translateY(-3px);
  }
}
</style>
