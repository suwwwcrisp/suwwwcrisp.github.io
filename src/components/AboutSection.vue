<script setup lang="ts">
import { siteConfig } from '@/data/siteConfig';
import MikuDressUpCard from './MikuDressUpCard.vue';
import MikuMusicPlayerCard from './MikuMusicPlayerCard.vue';

const stationSpecs = [
  { label: '观测频段', value: '39.0 Hz' },
  { label: '主题色值', value: '#39C5BB' },
  { label: '舞台载体', value: 'MMD / VRM 3D' },
];
</script>

<template>
  <section class="section-block about-section">
    <div class="container">
      <div class="section-header" data-tv-block="1">
        <div>
          <span class="section-kicker">02 // PROFILE &amp; STACK</span>
          <h2 class="section-title">个人档案与葱绿小部件</h2>
        </div>
        <p class="section-subtitle">写代码、搭交互，也沉迷在 39 Hz 的葱绿旋律里</p>
      </div>

      <!-- Primary Row: Bio, Skills & ACG Station Profile -->
      <div class="about-grid">
        <article
          class="glass-card glass-card--interactive about-bento-card about-card"
          data-tv-block="2"
        >
          <header class="about-card__head">
            <span class="tag-chip mono">01 // BIO</span>
            <h3>{{ siteConfig.about.introCard.title }}</h3>
          </header>

          <div class="about-card__body">
            <p v-for="(p, idx) in siteConfig.about.introCard.paragraphs" :key="idx">
              {{ p }}
            </p>
          </div>

          <div class="tag-cloud">
            <span
              v-for="tag in siteConfig.about.introCard.tags"
              :key="tag"
              class="tag-chip"
            >
              # {{ tag }}
            </span>
          </div>
        </article>

        <article
          class="glass-card glass-card--interactive about-bento-card about-card"
          data-tv-block="3"
        >
          <header class="about-card__head">
            <span class="tag-chip mono">02 // SKILLS</span>
            <h3>常用技术栈</h3>
          </header>

          <div class="skill-groups">
            <div
              v-for="group in siteConfig.about.skillGroups"
              :key="group.title"
              class="skill-group"
            >
              <div class="skill-group__title">
                <span class="skill-group__icon">{{ group.icon }}</span>
                <span>{{ group.title }}</span>
              </div>
              <div class="tag-cloud">
                <span
                  v-for="item in group.items"
                  :key="item"
                  class="skill-badge mono"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
        </article>

        <article
          class="glass-card glass-card--interactive about-bento-card about-card"
          data-tv-block="4"
        >
          <header class="about-card__head">
            <span class="tag-chip mono">03 // ACG &amp; 39</span>
            <h3>声光偏好与同好词条</h3>
          </header>

          <div class="tag-cloud acg-tags">
            <span
              v-for="badge in siteConfig.about.acgCard.badges"
              :key="badge"
              class="acg-badge"
            >
              ✦ {{ badge }}
            </span>
          </div>

          <dl class="station-specs">
            <div v-for="spec in stationSpecs" :key="spec.label" class="station-spec-row">
              <dt>{{ spec.label }}</dt>
              <dd class="mono">{{ spec.value }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <!-- Compact Widget Row: Pixel Dress-Up + Interactive Miku Music Player -->
      <div class="about-widgets-row">
        <div class="dressup-slot-wrap" data-tv-block="5">
          <MikuDressUpCard />
        </div>

        <MikuMusicPlayerCard data-tv-block="6" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  padding-top: 0.2rem;
  padding-bottom: 0.25rem;
}

.about-section :deep(.section-header) {
  margin-bottom: 0.72rem;
}

.about-section :deep(.section-title) {
  font-size: clamp(1.38rem, 2.05vw, 1.75rem);
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.95rem;
  margin-bottom: 0.85rem;
}

.about-card {
  padding: 0.95rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.about-card__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.28rem;
}

.about-card__head h3 {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 700;
}

.about-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  font-size: 0.82rem;
  line-height: 1.52;
  color: var(--text-secondary);
}

.about-card__body p {
  margin: 0;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: auto;
}

.acg-tags {
  margin-top: 0;
}

.skill-groups {
  display: flex;
  flex-direction: column;
  gap: 0.48rem;
}

.skill-group__title {
  display: flex;
  align-items: center;
  gap: 0.38rem;
  font-size: 0.79rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.24rem;
}

.skill-group__icon {
  color: var(--miku-teal);
}

.skill-badge {
  padding: 0.14rem 0.5rem;
  border-radius: 8px;
  font-size: 0.71rem;
  font-weight: 500;
  background: var(--glass-bg-strong);
  border: 1px solid var(--divider);
  color: var(--text-secondary);
}

.acg-badge {
  padding: 0.16rem 0.52rem;
  border-radius: 999px;
  font-size: 0.71rem;
  font-weight: 600;
  background: var(--miku-magenta-soft);
  border: 1px solid rgba(225, 40, 133, 0.24);
  color: var(--miku-magenta);
}

.station-specs {
  margin: auto 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.36rem;
}

.station-spec-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.38rem 0.68rem;
  border-radius: 11px;
  background: var(--glass-bg-strong);
  border: 1px solid var(--divider);
  font-size: 0.77rem;
}

.station-spec-row dt {
  color: var(--text-secondary);
  font-weight: 500;
}

.station-spec-row dd {
  margin: 0;
  font-weight: 700;
  color: var(--miku-teal-deep);
}

[data-theme='dark'] .station-spec-row dd {
  color: var(--miku-teal);
}

/* Compact Widget Row Below Main Profile Grid */
.about-widgets-row {
  display: grid;
  grid-template-columns: minmax(0, 0.36fr) minmax(0, 0.64fr);
  gap: 0.95rem;
  align-items: stretch;
}

.dressup-slot-wrap {
  display: flex;
  flex-direction: column;
}

.dressup-slot-wrap > * {
  flex: 1;
}

.dressup-slot-wrap :deep(.saber-style-card) {
  min-height: 186px;
  padding: 0.72rem 1rem 0.65rem;
}

.dressup-slot-wrap :deep(.saber-card__canvas) {
  padding: 0.06rem 0;
}

.dressup-slot-wrap :deep(.saber-card__sprite) {
  width: 110px;
  height: 110px;
}

@media (max-width: 1020px) and (min-width: 521px) {
  .about-grid {
    gap: 0.65rem;
  }

  .about-card {
    padding: 0.72rem 0.82rem;
  }

  .about-widgets-row {
    gap: 0.65rem;
  }
}

@media (max-width: 520px) {
  .about-grid,
  .about-widgets-row {
    grid-template-columns: 1fr;
  }
}
</style>
