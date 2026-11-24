<script setup lang="ts">
import { ref } from 'vue';
import { resolveAssetUrl, siteConfig, type HeroAction } from '@/data/siteConfig';
import { useSmoothScroll, type SectionId } from '@/composables/useSmoothScroll';
import MikuModelStage from './MikuModelStage.vue';
import HeroMikuOrbitToys from './HeroMikuOrbitToys.vue';

const { scrollToSection, pauseScroll, resumeScroll } = useSmoothScroll();
const showModelGuide = ref(false);

const heroCardRef = ref<HTMLElement | null>(null);
const stageColRef = ref<HTMLElement | null>(null);
const mikuCheerTick = ref(0);

function handleMikuCheer() {
  mikuCheerTick.value += 1;
}

const halftoneRingUrl = resolveAssetUrl('images/portal/halftone-ring.png');
const staffWaveUrl = resolveAssetUrl('images/portal/staff-wave-teal.png');
const notesSwarmUrl = resolveAssetUrl('images/portal/notes-swarm-teal.png');

function openGuide() {
  showModelGuide.value = true;
  pauseScroll();
}

function closeGuide() {
  showModelGuide.value = false;
  resumeScroll();
}

function handleAction(action: HeroAction) {
  if (action.actionType === 'model-guide') {
    openGuide();
    return;
  }
  if (action.scrollTo) {
    scrollToSection(action.scrollTo as SectionId);
  }
}
</script>

<template>
  <section class="hero-section">
    <div class="container">
      <article ref="heroCardRef" class="glass-card hero-main-card">
        <div class="hero-card-accent-bar" aria-hidden="true" />

        <div class="hero-card-decor" aria-hidden="true">
          <span class="hero-orb hero-orb--teal" />
          <span class="hero-orb hero-orb--magenta" />
          <span class="hero-num-watermark mono">01</span>
          <img :src="staffWaveUrl" alt="" class="hero-decor-staff" />
          <img :src="notesSwarmUrl" alt="" class="hero-decor-notes" />
        </div>

        <div class="hero-main-grid">
          <div class="hero-intro-col">
            <div class="hero-kicker-row">
              <span class="hero-channel-pill mono">
                <span class="hero-live-dot" aria-hidden="true" />
                {{ siteConfig.profile.brandMark }}
              </span>
              <span class="hero-freq-pill mono">39.0 Hz LIVE</span>
            </div>

            <h1 class="hero-title">
              <span class="serif-display hero-title__greeting">{{ siteConfig.profile.greeting }}</span>
              <span class="serif-display hero-title__name">{{ siteConfig.profile.headlineName }}</span>
            </h1>

            <p class="hero-bio">{{ siteConfig.profile.bio }}</p>

            <!-- 2x2 Hierarchical Miku Pill Buttons -->
            <div class="hero-btn-grid">
              <template v-for="act in siteConfig.profile.heroActions" :key="act.label">
                <a
                  v-if="act.external"
                  :href="act.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pill-btn hero-pill"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                  <span>{{ act.label }}</span>
                </a>

                <button
                  v-else
                  type="button"
                  :class="['pill-btn', 'hero-pill', { 'hero-pill--primary': act.icon === 'play' }]"
                  @click="handleAction(act)"
                >
                  <svg v-if="act.icon === 'play'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                  <svg v-else-if="act.icon === 'about'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <svg v-else-if="act.icon === 'contact'" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                  <span>{{ act.label }}</span>
                </button>
              </template>
            </div>
          </div>

          <div ref="stageColRef" class="hero-stage-col">
            <div class="hero-stage-backdrop" aria-hidden="true">
              <div class="stage-spotlight" />
              <img :src="halftoneRingUrl" alt="" class="stage-halftone-ring" />
              <div class="stage-orbit-ring">
                <span class="stage-orbit-dot" />
              </div>
              <span
                v-if="mikuCheerTick > 0"
                :key="mikuCheerTick"
                class="stage-cheer-ring"
              />
              <div class="stage-pedestal">
                <span class="stage-pedestal__inner" />
                <span class="stage-pedestal__shadow" />
              </div>
            </div>
            <MikuModelStage @open-guide="openGuide" />
          </div>
        </div>

        <button
          type="button"
          class="hero-scroll-cue mono"
          @click="scrollToSection('about')"
        >
          <span class="hero-scroll-cue__dot" aria-hidden="true" />
          <span>SCROLL TO CH-39 TV</span>
          <span class="hero-scroll-cue__arrow" aria-hidden="true">↓</span>
        </button>
      </article>
    </div>

    <HeroMikuOrbitToys
      :card-el="heroCardRef"
      :stage-el="stageColRef"
      @miku-cheer="handleMikuCheer"
    />

    <!-- Lightweight Model Drop-In Guide Modal -->
    <Teleport to="body">
      <div
        v-if="showModelGuide"
        class="guide-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="3D 初音模型接入指南"
        @click.self="closeGuide"
      >
        <div class="glass-card guide-modal">
          <header class="guide-modal__head">
            <h3>接入你的初音 3D 模型（.pmx / .glb / .vrm）</h3>
            <button type="button" class="guide-close" aria-label="关闭" @click="closeGuide">
              ✕
            </button>
          </header>

          <div class="guide-modal__body">
            <p>支持直接加载 <code>.pmx</code>（MMD）、<code>.glb</code> 与 <code>.vrm</code>，无需转换格式，按下面 2 步放入即可在首页右侧无黑底悬浮展示：</p>
            <ol>
              <li>
                把下载的模型文件放进项目目录：<br />
                <code>d:\deepseek harness\gemini antigravity\public\models\</code><br />
                <small>⚠ 若是 <strong>.pmx</strong> 模型，请务必把整个模型文件夹（连同里面的 <code>tex</code>/贴图图片）一起复制进来！</small>
              </li>
              <li>
                打开 <code>public/models/manifest.json</code>，把 <code>"modelFile"</code> 改成相对路径（例如 <code>"miku/miku.pmx"</code> 或 <code>"miku.glb"</code>）。
              </li>
            </ol>

            <div class="guide-links">
              <a
                href="https://sketchfab.com/search?features=downloadable&q=hatsune+miku&type=models"
                target="_blank"
                rel="noopener noreferrer"
                class="pill-btn"
              >
                Sketchfab (.glb) ↗
              </a>
              <a
                href="https://hub.vroid.com/en/tags/%E5%88%9D%E9%9F%B3%E3%83%9F%E3%82%AF"
                target="_blank"
                rel="noopener noreferrer"
                class="pill-btn"
              >
                VRoid Hub (.vrm) ↗
              </a>
              <a
                href="https://booth.pm/en/search/初音ミク%20VRM"
                target="_blank"
                rel="noopener noreferrer"
                class="pill-btn"
              >
                BOOTH (.vrm) ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  width: 100%;
}

.hero-main-card {
  position: relative;
  padding: 1.85rem 3.2rem 2.2rem 3.5rem;
  border-radius: 32px;
  overflow: hidden;
  height: clamp(530px, 70vh, 615px);
  display: flex;
  align-items: stretch;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(230, 249, 247, 0.74) 48%,
    rgba(224, 243, 255, 0.8) 100%
  );
  border: 1.5px solid rgba(57, 197, 187, 0.44);
  box-shadow:
    0 28px 64px -26px rgba(18, 72, 90, 0.24),
    inset 0 0 0 1px rgba(255, 255, 255, 0.82),
    0 16px 36px -18px rgba(57, 197, 187, 0.3);
}

[data-theme='dark'] .hero-main-card {
  background: linear-gradient(
    135deg,
    rgba(13, 27, 44, 0.86) 0%,
    rgba(11, 24, 42, 0.84) 55%,
    rgba(18, 22, 46, 0.88) 100%
  );
  border-color: rgba(76, 235, 224, 0.46);
  box-shadow:
    0 32px 72px -24px rgba(0, 0, 0, 0.82),
    0 0 42px -12px rgba(76, 235, 224, 0.28),
    inset 0 1px 0 rgba(76, 235, 224, 0.24);
}

.hero-card-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 4;
  background: linear-gradient(90deg, #39c5bb 0%, #4ba9df 56%, #e12885 100%);
  opacity: 0.9;
  pointer-events: none;
}

.hero-card-decor {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
}

.hero-orb--teal {
  width: 560px;
  height: 560px;
  right: -80px;
  top: -110px;
  background: radial-gradient(
    circle,
    rgba(57, 197, 187, 0.24) 0%,
    rgba(75, 169, 223, 0.14) 45%,
    transparent 72%
  );
}

.hero-orb--magenta {
  width: 380px;
  height: 380px;
  left: -90px;
  bottom: -140px;
  background: radial-gradient(
    circle,
    rgba(225, 40, 133, 0.11) 0%,
    rgba(57, 197, 187, 0.08) 48%,
    transparent 72%
  );
}

[data-theme='dark'] .hero-orb--teal {
  background: radial-gradient(
    circle,
    rgba(76, 235, 224, 0.22) 0%,
    rgba(56, 128, 255, 0.14) 45%,
    transparent 72%
  );
}

[data-theme='dark'] .hero-orb--magenta {
  background: radial-gradient(
    circle,
    rgba(255, 62, 157, 0.14) 0%,
    rgba(76, 235, 224, 0.08) 48%,
    transparent 72%
  );
}

.hero-num-watermark {
  position: absolute;
  left: 2rem;
  bottom: -1.4rem;
  font-size: clamp(7rem, 13vw, 11rem);
  font-weight: 800;
  line-height: 1;
  color: rgba(57, 197, 187, 0.085);
  letter-spacing: -0.05em;
  user-select: none;
}

[data-theme='dark'] .hero-num-watermark {
  color: rgba(76, 235, 224, 0.09);
}

.hero-decor-staff {
  position: absolute;
  left: -3%;
  bottom: -6%;
  width: min(560px, 56%);
  opacity: 0.24;
  transform: rotate(-6deg);
}

.hero-decor-notes {
  position: absolute;
  right: -2%;
  top: -4%;
  width: min(280px, 28%);
  opacity: 0.24;
}

[data-theme='dark'] .hero-decor-staff {
  opacity: 0.28;
}

[data-theme='dark'] .hero-decor-notes {
  opacity: 0.34;
}

.hero-main-grid {
  position: static;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.98fr);
  gap: 1.15rem;
  align-items: center;
}

.hero-intro-col {
  position: static;
  z-index: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.15rem;
  padding-right: 0.75rem;
}

.hero-kicker-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}

.hero-channel-pill,
.hero-freq-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.26rem 0.72rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.hero-channel-pill {
  background: rgba(57, 197, 187, 0.14);
  border: 1px solid rgba(57, 197, 187, 0.42);
  color: var(--miku-teal-deep);
}

[data-theme='dark'] .hero-channel-pill {
  background: rgba(76, 235, 224, 0.14);
  border-color: rgba(76, 235, 224, 0.44);
  color: var(--miku-teal);
}

.hero-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--miku-teal);
  box-shadow: 0 0 8px var(--miku-teal);
  animation: hero-pulse 2.1s ease-in-out infinite;
}

.hero-freq-pill {
  background: rgba(225, 40, 133, 0.1);
  border: 1px solid rgba(225, 40, 133, 0.32);
  color: #c91d74;
}

[data-theme='dark'] .hero-freq-pill {
  background: rgba(255, 62, 157, 0.15);
  border-color: rgba(255, 62, 157, 0.4);
  color: #ff66b2;
}

.hero-title {
  margin: 0;
  font-size: clamp(3rem, 5.2vw, 4.65rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.025em;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.65rem;
}

.hero-title__greeting {
  color: var(--text-primary);
}

.hero-title__name {
  font-style: italic;
  background: linear-gradient(112deg, #12a398 0%, #39c5bb 42%, #3d9ce0 78%, #e12885 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 6px 18px rgba(57, 197, 187, 0.22));
}

.hero-bio {
  margin: 0.2rem 0 0;
  font-size: 1.12rem;
  color: #364c58;
}

[data-theme='dark'] .hero-bio {
  color: var(--text-secondary);
}

.hero-btn-grid {
  margin-top: 0.45rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  max-width: 416px;
}

.hero-pill {
  justify-content: flex-start;
  padding: 0.78rem 1.3rem;
  font-size: 0.94rem;
  background: rgba(255, 255, 255, 0.78);
  border: 1.25px solid rgba(57, 197, 187, 0.34);
  color: #1c3440;
  box-shadow: 0 8px 20px -14px rgba(20, 72, 90, 0.26);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-pill svg {
  color: var(--miku-teal-deep);
  flex-shrink: 0;
}

.hero-pill:hover {
  background: rgba(235, 252, 250, 0.94);
  border-color: rgba(57, 197, 187, 0.65);
  transform: translateY(-2px);
}

[data-theme='dark'] .hero-pill {
  background: rgba(18, 34, 52, 0.82);
  border-color: rgba(76, 235, 224, 0.32);
  color: #e6fbf9;
}

[data-theme='dark'] .hero-pill svg {
  color: var(--miku-teal);
}

[data-theme='dark'] .hero-pill:hover {
  background: rgba(24, 46, 68, 0.92);
  border-color: rgba(76, 235, 224, 0.64);
}

.hero-pill--primary {
  background: linear-gradient(125deg, #1fb5ab 0%, #39c5bb 50%, #4ba9df 100%);
  border-color: rgba(255, 255, 255, 0.42);
  color: #ffffff;
  font-weight: 600;
  box-shadow:
    0 12px 26px -10px rgba(31, 181, 171, 0.68),
    inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.hero-pill--primary svg,
[data-theme='dark'] .hero-pill--primary svg {
  color: #ffffff;
}

[data-theme='dark'] .hero-pill--primary {
  background: linear-gradient(125deg, #1fb5ab 0%, #39c5bb 50%, #4ba9df 100%);
  border-color: rgba(165, 250, 245, 0.45);
  color: #ffffff;
}

.hero-pill--primary:hover,
[data-theme='dark'] .hero-pill--primary:hover {
  background: linear-gradient(125deg, #1fb5ab 0%, #39c5bb 50%, #4ba9df 100%);
  border-color: rgba(255, 255, 255, 0.62);
  filter: brightness(1.05);
  transform: translateY(-2px);
  box-shadow: 0 16px 32px -10px rgba(31, 181, 171, 0.78);
}

.hero-stage-col {
  position: relative;
  z-index: 2;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-stage-backdrop {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  display: grid;
  place-items: center;
}

.stage-cheer-ring {
  position: absolute;
  width: clamp(235px, 25vw, 330px);
  height: clamp(235px, 25vw, 330px);
  border-radius: 50%;
  border: 2.5px solid rgba(57, 197, 187, 0.78);
  box-shadow:
    0 0 28px rgba(57, 197, 187, 0.55),
    0 0 18px rgba(225, 40, 133, 0.36);
  pointer-events: none;
  animation: stage-cheer-expand 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

[data-theme='dark'] .stage-cheer-ring {
  border-color: rgba(76, 235, 224, 0.85);
  box-shadow:
    0 0 34px rgba(76, 235, 224, 0.62),
    0 0 22px rgba(255, 62, 157, 0.45);
}

@keyframes stage-cheer-expand {
  0% {
    transform: scale(0.55);
    opacity: 0.96;
  }
  100% {
    transform: scale(1.28);
    opacity: 0;
  }
}

.stage-spotlight {
  position: absolute;
  width: clamp(290px, 31vw, 430px);
  height: clamp(360px, 48vh, 470px);
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 48%,
    rgba(57, 197, 187, 0.34) 0%,
    rgba(75, 169, 223, 0.22) 38%,
    rgba(225, 40, 133, 0.11) 64%,
    transparent 78%
  );
  filter: blur(10px);
}

[data-theme='dark'] .stage-spotlight {
  background: radial-gradient(
    ellipse at 50% 48%,
    rgba(76, 235, 224, 0.28) 0%,
    rgba(56, 128, 255, 0.2) 40%,
    rgba(255, 62, 157, 0.14) 66%,
    transparent 78%
  );
}

.stage-halftone-ring {
  position: absolute;
  width: clamp(260px, 27vw, 370px);
  height: auto;
  opacity: 0.34;
  transform-origin: center center;
  animation: hero-stage-spin 34s linear infinite;
}

[data-theme='dark'] .stage-halftone-ring {
  opacity: 0.44;
}

.stage-orbit-ring {
  position: absolute;
  width: clamp(295px, 31vw, 415px);
  height: clamp(295px, 31vw, 415px);
  border-radius: 50%;
  border: 1.5px dashed rgba(57, 197, 187, 0.34);
  animation: hero-stage-spin 26s linear infinite reverse;
}

.stage-orbit-dot {
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  border-radius: 50%;
  background: var(--miku-magenta);
  box-shadow: 0 0 10px var(--miku-magenta);
}

.stage-pedestal {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  width: clamp(220px, 23vw, 300px);
  height: 50px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 45%,
    rgba(57, 197, 187, 0.38) 0%,
    rgba(75, 169, 223, 0.22) 52%,
    rgba(225, 40, 133, 0.1) 82%,
    transparent 100%
  );
  border: 1.5px solid rgba(57, 197, 187, 0.56);
  box-shadow:
    0 12px 26px -10px rgba(27, 152, 144, 0.45),
    inset 0 0 18px rgba(255, 255, 255, 0.65);
}

[data-theme='dark'] .stage-pedestal {
  background: radial-gradient(
    ellipse at 50% 45%,
    rgba(76, 235, 224, 0.34) 0%,
    rgba(56, 128, 255, 0.22) 56%,
    rgba(255, 62, 157, 0.14) 84%,
    transparent 100%
  );
  border-color: rgba(76, 235, 224, 0.62);
  box-shadow:
    0 14px 32px -10px rgba(76, 235, 224, 0.46),
    inset 0 0 18px rgba(76, 235, 224, 0.28);
}

.stage-pedestal__inner {
  position: absolute;
  inset: 8px 20px;
  border-radius: 50%;
  border: 1.2px dashed rgba(57, 197, 187, 0.58);
}

[data-theme='dark'] .stage-pedestal__inner {
  border-color: rgba(76, 235, 224, 0.62);
}

.stage-pedestal__shadow {
  position: absolute;
  inset: 14px 48px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgba(16, 66, 82, 0.28) 0%,
    transparent 75%
  );
}

.hero-scroll-cue {
  position: absolute;
  bottom: 0.85rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  padding: 0.26rem 0.82rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(57, 197, 187, 0.38);
  color: var(--miku-teal-deep);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.hero-scroll-cue:hover {
  transform: translateX(-50%) translateY(-2px);
  border-color: var(--miku-teal);
  background: rgba(242, 253, 252, 0.92);
}

[data-theme='dark'] .hero-scroll-cue {
  background: rgba(14, 28, 46, 0.78);
  border-color: rgba(76, 235, 224, 0.38);
  color: var(--miku-teal);
}

[data-theme='dark'] .hero-scroll-cue:hover {
  background: rgba(18, 36, 58, 0.94);
  border-color: var(--miku-teal);
}

.hero-scroll-cue__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--miku-teal);
  box-shadow: 0 0 8px var(--miku-teal);
}

.hero-scroll-cue__arrow {
  display: inline-block;
  animation: hero-cue-bob 1.8s ease-in-out infinite;
}

@keyframes hero-stage-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes hero-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(0.84);
  }
}

@keyframes hero-cue-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2.5px);
  }
}

/* Guide Modal */
.guide-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--modal-backdrop);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.guide-modal {
  width: min(560px, 100%);
  padding: 1.45rem 1.6rem;
  background: var(--modal-bg);
}

.guide-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.guide-modal__head h3 {
  margin: 0;
  font-size: 1.12rem;
}

.guide-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--divider);
  background: transparent;
  cursor: pointer;
}

.guide-modal__body {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.guide-modal__body p {
  margin: 0 0 0.75rem;
}

.guide-modal__body ol {
  margin: 0 0 1rem;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.guide-modal__body code {
  padding: 0.12rem 0.42rem;
  border-radius: 6px;
  background: var(--miku-teal-soft);
  color: var(--text-primary);
  font-size: 0.82rem;
  word-break: break-all;
}

.guide-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

@media (max-width: 960px) and (min-width: 521px) {
  .hero-main-card {
    padding: 1.45rem 1.5rem 2.2rem;
  }

  .hero-title {
    font-size: clamp(2.1rem, 4.4vw, 3.2rem);
  }

  .hero-pill {
    padding: 0.65rem 0.95rem;
    font-size: 0.84rem;
  }

  .hero-stage-col {
    min-height: 0;
  }

  .stage-halftone-ring {
    width: clamp(210px, 32vw, 270px);
  }

  .stage-orbit-ring {
    width: clamp(235px, 36vw, 300px);
    height: clamp(235px, 36vw, 300px);
  }

  .stage-pedestal {
    bottom: 12px;
    width: clamp(175px, 26vw, 235px);
    height: 40px;
  }

  .hero-scroll-cue {
    bottom: 0.6rem;
    font-size: 0.64rem;
  }
}

@media (max-width: 520px) {
  .hero-section {
    padding-top: 5.5rem;
  }

  .hero-main-card {
    height: auto;
    min-height: auto;
    padding: 1.75rem 1.5rem 3.25rem;
  }

  .hero-stage-col {
    min-height: 360px;
  }

  .hero-main-grid {
    grid-template-columns: 1fr;
  }

  .hero-intro-col {
    padding-right: 0;
  }

  .stage-pedestal {
    bottom: 12px;
    width: 200px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .hero-btn-grid {
    grid-template-columns: 1fr;
    max-width: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage-halftone-ring,
  .stage-orbit-ring,
  .hero-live-dot,
  .hero-scroll-cue__arrow,
  .stage-cheer-ring {
    animation: none;
  }
}
</style>
