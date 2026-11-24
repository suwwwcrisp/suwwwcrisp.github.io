<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, type ComponentPublicInstance } from 'vue';
import { resolveAssetUrl, siteConfig, type SocialLink } from '@/data/siteConfig';
import UnderwaterBubbleCanvas from './UnderwaterBubbleCanvas.vue';

const CHEER_KEY = 'miku-space-cheer-39';

const shellUrl = resolveAssetUrl('images/marine/shell.png');
const starfishUrl = resolveAssetUrl('images/marine/starfish.png');
const octopusUrl = resolveAssetUrl('images/marine/octopus.png');
const jellyfishUrl = resolveAssetUrl('images/marine/jellyfish.svg');
const chibiFishUrl = resolveAssetUrl('images/portal/chibi-fish.png');

function readInitialCheers(): number {
  if (typeof window === 'undefined') return 39;
  try {
    const val = Number(window.localStorage.getItem(CHEER_KEY));
    if (Number.isFinite(val) && val >= 39) return val;
  } catch {
    // Ignore storage errors
  }
  return 39;
}

const cheerCount = ref<number>(readInitialCheers());
const copiedId = ref<string | null>(null);

function sendCheer(event: MouseEvent) {
  cheerCount.value += 1;
  try {
    window.localStorage.setItem(CHEER_KEY, String(cheerCount.value));
  } catch {
    // Ignore storage errors
  }
  window.dispatchEvent(
    new CustomEvent('miku-note-burst', {
      detail: { x: event.clientX, y: event.clientY, count: 8 },
    }),
  );
}

async function copySocial(item: SocialLink) {
  if (!item.copyText) return;
  try {
    await navigator.clipboard.writeText(item.copyText);
    copiedId.value = item.id;
    window.setTimeout(() => {
      if (copiedId.value === item.id) copiedId.value = null;
    }, 2000);
  } catch {
    copiedId.value = item.id;
  }
}

// ---------------------------------------------------------------------------
// Bottle-Bottom Coda Irregular Buoyancy (Zero Mouse Tilt / Shift)
// ---------------------------------------------------------------------------
const footerStageRef = ref<HTMLElement | null>(null);
const footerIntroRef = ref<HTMLElement | null>(null);
const cheerBtnRef = ref<HTMLElement | null>(null);
const footerBottomRef = ref<HTMLElement | null>(null);

const socialElements: Array<HTMLElement | null> = [];
function setSocialRef(el: Element | ComponentPublicInstance | null, idx: number) {
  socialElements[idx] = el instanceof HTMLElement ? el : null;
}

const hoveredSocial = ref<number | null>(null);
const cheerHovered = ref(false);
const socialHoverBlend = [0, 0, 0];
let cheerHoverBlend = 0;

const SOCIAL_PROFILES = [
  { w1: 0.96, w2: 1.67, p1: 0.4, p2: 1.9, ay: 10.2, ax: 5.5, ar: 1.45 },
  { w1: 0.79, w2: 1.43, p1: 2.3, p2: 0.7, ay: 9.4, ax: 5.0, ar: 1.35 },
  { w1: 1.11, w2: 1.81, p1: 4.5, p2: 3.1, ay: 10.6, ax: 5.8, ar: 1.55 },
];

let rafId: number | null = null;
let motionAllowed = true;

function handlePointerLeave() {
  hoveredSocial.value = null;
  cheerHovered.value = false;
}

function startFooterEngine(startTime: number) {
  const step = (now: number) => {
    const t = (now - startTime) * 0.001;

    if (footerIntroRef.value) {
      const iDy =
        (Math.sin(t * 0.71 + 0.6) + 0.34 * Math.cos(t * 1.29 + 1.5)) * 4.6;
      const iDx = Math.cos(t * 0.59 + 1.1) * 3.2;
      const iRot = Math.sin(t * 0.64 + 2.2) * 0.85;
      footerIntroRef.value.style.transform = `translate3d(${iDx.toFixed(2)}px, ${iDy.toFixed(2)}px, 0) rotate(${iRot.toFixed(2)}deg)`;
    }

    if (cheerBtnRef.value) {
      cheerHoverBlend += ((cheerHovered.value ? 1 : 0) - cheerHoverBlend) * 0.1;
      const amp = 1 - cheerHoverBlend * 0.72;
      const cDy =
        (Math.sin(t * 1.03 + 1.4) + 0.36 * Math.cos(t * 1.77 + 0.5)) * 6.0 * amp -
        cheerHoverBlend * 4;
      const cDx = Math.cos(t * 0.84 + 2.1) * 4.0 * amp;
      const cRot = Math.sin(t * 0.91 + 0.3) * 1.9 * amp;
      const cSc = 1 + cheerHoverBlend * 0.03;
      cheerBtnRef.value.style.transform = `translate3d(${cDx.toFixed(2)}px, ${cDy.toFixed(2)}px, 0) rotate(${cRot.toFixed(2)}deg) scale(${cSc.toFixed(4)})`;
    }

    for (let i = 0; i < socialElements.length; i += 1) {
      const el = socialElements[i];
      if (!el) continue;
      const p = SOCIAL_PROFILES[i % SOCIAL_PROFILES.length];
      const targetH = hoveredSocial.value === i ? 1 : 0;
      socialHoverBlend[i] += (targetH - socialHoverBlend[i]) * 0.1;
      const hb = socialHoverBlend[i];
      const amp = 1 - hb * 0.72;

      const sDy =
        (Math.sin(t * p.w1 + p.p1) + 0.42 * Math.cos(t * p.w2 + p.p2)) *
          p.ay *
          0.66 *
          amp -
        hb * 5;
      const sDx =
        (Math.cos(t * p.w1 * 0.82 + p.p2) +
          0.32 * Math.sin(t * p.w2 * 0.7 + p.p1)) *
        p.ax *
        0.66 *
        amp;
      const sRot = Math.sin(t * p.w1 * 0.9 + p.p2) * p.ar * 0.66 * amp;
      const sSc = 1 + hb * 0.018;
      el.style.transform = `translate3d(${sDx.toFixed(2)}px, ${sDy.toFixed(2)}px, 0) rotate(${sRot.toFixed(2)}deg) scale(${sSc.toFixed(4)})`;
    }

    if (footerBottomRef.value) {
      const bDy = Math.sin(t * 0.66 + 2.1) * 3.0;
      const bDx = Math.cos(t * 0.52 + 0.8) * 2.5;
      const bRot = Math.sin(t * 0.58 + 1.4) * 0.4;
      footerBottomRef.value.style.transform = `translate3d(${bDx.toFixed(2)}px, ${bDy.toFixed(2)}px, 0) rotate(${bRot.toFixed(2)}deg)`;
    }

    rafId = window.requestAnimationFrame(step);
  };

  rafId = window.requestAnimationFrame(step);
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  motionAllowed = !reducedMotion;

  if (motionAllowed) {
    startFooterEngine(performance.now());
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
  <footer
    id="contact"
    ref="footerStageRef"
    class="section-block footer-section"
    @pointerleave="handlePointerLeave"
  >
    <div class="container">
      <div class="glass-card footer-card">
        <!-- Bottle-Bottom Star-Sand, Soft Bubble Canvas & Caustic Coda Backdrop -->
        <div class="footer-aqua-decor" aria-hidden="true">
          <svg
            class="footer-wave-bar"
            viewBox="0 0 1200 32"
            preserveAspectRatio="none"
          >
            <path
              d="M0 14 Q 150 28 300 12 T 600 16 T 900 10 T 1200 16 L 1200 0 L 0 0 Z"
              class="footer-wave-fill"
            />
          </svg>
          <div class="footer-sand-glow" />
          <UnderwaterBubbleCanvas density="soft" :interactive="false" />
          <img :src="jellyfishUrl" alt="" class="footer-jelly-bg" />
        </div>

        <!-- Anime Watercolor & Q-Chibi Corner Jewels (Zero Text Overlap) -->
        <div class="footer-marine footer-marine--chibi" aria-hidden="true">
          <img :src="chibiFishUrl" alt="" class="footer-marine__img footer-marine__img--chibi" />
        </div>

        <div class="footer-marine footer-marine--shell" aria-hidden="true">
          <img :src="shellUrl" alt="" class="footer-marine__img footer-marine__img--shell" />
        </div>

        <div class="footer-marine footer-marine--star" aria-hidden="true">
          <img :src="starfishUrl" alt="" class="footer-marine__img footer-marine__img--star" />
        </div>

        <div class="footer-marine footer-marine--octopus" aria-hidden="true">
          <img :src="octopusUrl" alt="" class="footer-marine__img footer-marine__img--octo" />
        </div>

        <div class="footer-card__top">
          <div ref="footerIntroRef" class="footer-card__intro">
            <span class="section-kicker">04 // CONNECT — BOTTLE CODA</span>
            <h2 class="section-title">{{ siteConfig.contact.title }}</h2>
            <p class="section-subtitle">{{ siteConfig.contact.subtitle }}</p>
          </div>

          <button
            ref="cheerBtnRef"
            type="button"
            class="cheer-btn"
            aria-label="点击发送 39 应援音符"
            @pointerenter="cheerHovered = true"
            @pointerleave="cheerHovered = false"
            @click="sendCheer($event)"
          >
            <span class="cheer-btn__badge mono">39!</span>
            <span class="cheer-btn__label">应援电波</span>
            <span class="cheer-btn__count mono">× {{ cheerCount }}</span>
          </button>
        </div>

        <div class="social-grid">
          <template v-for="(item, idx) in siteConfig.contact.socials" :key="item.id">
            <a
              v-if="item.href"
              :ref="(el) => setSocialRef(el, idx)"
              :href="item.href"
              target="_blank"
              rel="noopener noreferrer"
              class="social-pill"
              :class="`social-pill--tone-${(idx % 3) + 1}`"
              @pointerenter="hoveredSocial = idx"
              @pointerleave="hoveredSocial = hoveredSocial === idx ? null : hoveredSocial"
            >
              <span class="social-pill__badge mono">{{ item.badge }}</span>
              <span class="social-pill__text">
                <strong>{{ item.label }}</strong>
                <small class="mono">{{ item.handle }}</small>
              </span>
              <span class="social-pill__arrow" aria-hidden="true">↗</span>
            </a>

            <button
              v-else
              :ref="(el) => setSocialRef(el, idx)"
              type="button"
              class="social-pill"
              :class="`social-pill--tone-${(idx % 3) + 1}`"
              @pointerenter="hoveredSocial = idx"
              @pointerleave="hoveredSocial = hoveredSocial === idx ? null : hoveredSocial"
              @click="copySocial(item)"
            >
              <span class="social-pill__badge mono">{{ item.badge }}</span>
              <span class="social-pill__text">
                <strong>{{ item.label }}</strong>
                <small class="mono">
                  {{ copiedId === item.id ? '已复制到剪贴板 ✓' : item.handle }}
                </small>
              </span>
              <span class="social-pill__arrow mono" aria-hidden="true">
                {{ copiedId === item.id ? '✓' : '❐' }}
              </span>
            </button>
          </template>
        </div>

        <div ref="footerBottomRef" class="footer-card__bottom">
          <span class="mono">{{ siteConfig.contact.footerNote }}</span>
          <span class="mono">© {{ new Date().getFullYear() }} {{ siteConfig.profile.nickname }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-section {
  position: relative;
  padding-top: 1.5rem;
  padding-bottom: 4rem;
}

.footer-card {
  position: relative;
  padding: 2.2rem 2.2rem 1.9rem;
  display: flex;
  flex-direction: column;
  gap: 1.55rem;
  overflow: visible;
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.84) 0%,
    rgba(228, 249, 250, 0.78) 58%,
    rgba(242, 245, 255, 0.84) 100%
  );
  border: 1.5px solid rgba(57, 197, 187, 0.42);
  box-shadow:
    0 24px 56px -26px rgba(18, 76, 94, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.88);
  transition:
    box-shadow 0.28s ease,
    border-color 0.28s ease,
    background-color 0.28s ease;
}

[data-theme='dark'] .footer-card {
  background: linear-gradient(
    155deg,
    rgba(10, 24, 42, 0.86) 0%,
    rgba(12, 30, 52, 0.84) 58%,
    rgba(20, 22, 46, 0.88) 100%
  );
  border-color: rgba(76, 235, 224, 0.42);
  box-shadow:
    0 28px 64px -22px rgba(0, 0, 0, 0.82),
    0 0 36px -12px rgba(76, 235, 224, 0.22),
    inset 0 1px 0 rgba(76, 235, 224, 0.22);
}

.footer-aqua-decor {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.footer-wave-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 28px;
}

.footer-wave-fill {
  fill: rgba(57, 197, 187, 0.18);
}

[data-theme='dark'] .footer-wave-fill {
  fill: rgba(76, 235, 224, 0.16);
}

.footer-sand-glow {
  position: absolute;
  left: -5%;
  right: -5%;
  bottom: -24px;
  height: 115px;
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(255, 222, 184, 0.36) 0%,
    rgba(57, 197, 187, 0.15) 52%,
    transparent 78%
  );
}

[data-theme='dark'] .footer-sand-glow {
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(255, 196, 140, 0.18) 0%,
    rgba(76, 235, 224, 0.15) 48%,
    rgba(255, 62, 157, 0.12) 70%,
    transparent 85%
  );
}

.footer-jelly-bg {
  position: absolute;
  right: 235px;
  top: 10%;
  width: 60px;
  height: auto;
  opacity: 0.34;
  animation: footer-jelly-drift 9.5s ease-in-out infinite alternate;
}

[data-theme='dark'] .footer-jelly-bg {
  opacity: 0.42;
}

.footer-marine {
  position: absolute;
  z-index: 4;
  pointer-events: none;
  filter: drop-shadow(0 10px 14px rgba(18, 68, 86, 0.22));
}

[data-theme='dark'] .footer-marine {
  filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.55))
    drop-shadow(0 0 10px rgba(76, 235, 224, 0.2));
}

.footer-marine--chibi {
  top: -26px;
  left: 16px;
  animation: footer-charm-bob-a 7.5s ease-in-out infinite;
}

.footer-marine--shell {
  top: -22px;
  right: 22px;
  animation: footer-charm-bob-b 8.4s ease-in-out infinite -1.8s;
}

.footer-marine--star {
  bottom: -16px;
  left: 18px;
  animation: footer-charm-bob-a 9.1s ease-in-out infinite -3.2s;
}

.footer-marine--octopus {
  bottom: -24px;
  right: 18px;
  animation: footer-charm-bob-b 8.1s ease-in-out infinite -2.5s;
}

.footer-marine__img {
  display: block;
  height: auto;
  object-fit: contain;
}

.footer-marine__img--chibi { width: 52px; }
.footer-marine__img--octo { width: 48px; }
.footer-marine__img--shell { width: 58px; }
.footer-marine__img--star { width: 44px; }

.footer-card__top,
.social-grid,
.footer-card__bottom {
  position: relative;
  z-index: 3;
}

.footer-card__top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.footer-card__intro {
  max-width: 560px;
  will-change: transform;
}

.footer-card__intro .section-subtitle {
  margin-top: 0.45rem;
}

.cheer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 1.15rem;
  border-radius: 999px;
  border: 1px solid rgba(57, 197, 187, 0.48);
  background: linear-gradient(135deg, rgba(57, 197, 187, 0.18), rgba(225, 40, 133, 0.14));
  cursor: pointer;
  will-change: transform;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.cheer-btn:hover {
  border-color: var(--miku-teal);
  box-shadow: 0 12px 24px -10px rgba(57, 197, 187, 0.55);
}

.cheer-btn__badge {
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--miku-teal);
  color: #072426;
  font-weight: 700;
  font-size: 0.82rem;
}

[data-theme='dark'] .cheer-btn__badge {
  color: #06151a;
}

.cheer-btn__label {
  font-weight: 700;
  font-size: 0.92rem;
}

.cheer-btn__count {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--miku-magenta);
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.95rem;
}

.social-pill {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.92rem 1.05rem;
  border-radius: 18px;
  border: 1.25px solid rgba(57, 197, 187, 0.34);
  background: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;
  will-change: transform;
  box-shadow: 0 10px 22px -16px rgba(18, 72, 92, 0.24);
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease;
}

[data-theme='dark'] .social-pill {
  background: rgba(16, 32, 50, 0.84);
  border-color: rgba(76, 235, 224, 0.32);
}

.social-pill:hover {
  border-color: var(--miku-teal);
  box-shadow: 0 16px 28px -12px rgba(57, 197, 187, 0.48);
}

.social-pill__badge {
  padding: 0.36rem 0.58rem;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.social-pill--tone-1 .social-pill__badge {
  background: rgba(57, 197, 187, 0.16);
  color: var(--miku-teal-deep);
  border: 1px solid rgba(57, 197, 187, 0.35);
}

.social-pill--tone-2 .social-pill__badge {
  background: rgba(225, 40, 133, 0.12);
  color: #c91d74;
  border: 1px solid rgba(225, 40, 133, 0.3);
}

.social-pill--tone-3 .social-pill__badge {
  background: rgba(75, 169, 223, 0.16);
  color: #1f74b8;
  border: 1px solid rgba(75, 169, 223, 0.34);
}

[data-theme='dark'] .social-pill--tone-1 .social-pill__badge {
  color: var(--miku-teal);
}

[data-theme='dark'] .social-pill--tone-2 .social-pill__badge {
  color: #ff66b2;
  border-color: rgba(255, 62, 157, 0.36);
}

[data-theme='dark'] .social-pill--tone-3 .social-pill__badge {
  color: #70c7ff;
  border-color: rgba(102, 194, 255, 0.36);
}

.social-pill__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.social-pill__text strong {
  font-size: 0.9rem;
}

.social-pill__text small {
  font-size: 0.78rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.social-pill__arrow {
  color: var(--miku-teal-deep);
  font-weight: 700;
}

[data-theme='dark'] .social-pill__arrow {
  color: var(--miku-teal);
}

.footer-card__bottom {
  padding-top: 1.1rem;
  border-top: 1px solid rgba(57, 197, 187, 0.24);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: var(--text-muted);
  will-change: transform;
}

@keyframes footer-jelly-drift {
  0% { transform: translate3d(-8px, 10px, 0) rotate(-6deg); }
  100% { transform: translate3d(10px, -12px, 0) rotate(6deg); }
}

@keyframes footer-charm-bob-a {
  0%, 100% { transform: translateY(0) rotate(-8deg); }
  50% { transform: translateY(-9px) rotate(6deg); }
}

@keyframes footer-charm-bob-b {
  0%, 100% { transform: translateY(0) rotate(8deg); }
  50% { transform: translateY(8px) rotate(-6deg); }
}

@media (max-width: 860px) {
  .social-grid {
    grid-template-columns: 1fr;
  }

  .footer-card {
    padding: 1.55rem;
  }

  .footer-jelly-bg {
    right: 5%;
    top: 22%;
    width: 64px;
  }

  .footer-marine__img--chibi { width: 44px; }
  .footer-marine__img--octo { width: 42px; }
  .footer-marine__img--shell { width: 46px; }
  .footer-marine__img--star { width: 38px; }
}

@media (prefers-reduced-motion: reduce) {
  .footer-jelly-bg,
  .footer-marine--chibi,
  .footer-marine--octopus,
  .footer-marine--shell,
  .footer-marine--star {
    animation: none;
  }
}
</style>
