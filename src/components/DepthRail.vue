<script setup lang="ts">
import { useSmoothScroll, type SectionId } from '@/composables/useSmoothScroll';

const { activeSection, scrollProgress, scrollToSection } = useSmoothScroll();

const stops: Array<{ id: SectionId; code: string; label: string }> = [
  { id: 'hero', code: '01', label: '登场' },
  { id: 'about', code: '02', label: '档案' },
  { id: 'projects', code: '03', label: '作品' },
  { id: 'contact', code: '04', label: '联络' },
];
</script>

<template>
  <aside class="depth-rail" aria-label="页面进度导航">
    <div class="depth-rail__track">
      <div
        class="depth-rail__fill"
        :style="{ transform: `scaleY(${scrollProgress})` }"
      />
    </div>

    <ul class="depth-rail__list">
      <li v-for="stop in stops" :key="stop.id">
        <button
          type="button"
          class="depth-rail__btn"
          :class="{ 'is-active': activeSection === stop.id }"
          :aria-label="`跳转到 ${stop.code} ${stop.label}`"
          @click="scrollToSection(stop.id)"
        >
          <span class="depth-rail__label mono">{{ stop.code }} {{ stop.label }}</span>
          <span class="depth-rail__dot" />
        </button>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.depth-rail {
  position: fixed;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 40;
  display: flex;
  align-items: center;
}

.depth-rail__track {
  position: absolute;
  right: 6px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  border-radius: 999px;
  background: var(--divider);
  overflow: hidden;
  pointer-events: none;
}

.depth-rail__fill {
  width: 100%;
  height: 100%;
  transform-origin: top center;
  background: linear-gradient(180deg, var(--miku-teal), var(--miku-magenta));
}

.depth-rail__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.depth-rail__btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: none;
  background: transparent;
  padding: 0.15rem 0;
  cursor: pointer;
}

.depth-rail__label {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  opacity: 0;
  transform: translateX(6px);
  pointer-events: none;
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    color 0.22s ease;
  white-space: nowrap;
  box-shadow: var(--glass-shadow);
}

.depth-rail__btn:hover .depth-rail__label {
  opacity: 1;
  transform: translateX(0);
}

.depth-rail__btn.is-active .depth-rail__label {
  color: var(--miku-teal-deep);
  border-color: var(--glass-accent-border);
}

[data-theme='dark'] .depth-rail__btn.is-active .depth-rail__label {
  color: var(--miku-teal);
}

.depth-rail__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg-page);
  border: 2px solid var(--text-muted);
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;
}

.depth-rail__btn:hover .depth-rail__dot {
  border-color: var(--miku-teal);
  transform: scale(1.15);
}

.depth-rail__btn.is-active .depth-rail__dot {
  background: var(--miku-teal);
  border-color: var(--miku-teal);
  box-shadow: 0 0 12px var(--miku-teal);
  transform: scale(1.22);
}

@media (max-width: 1120px) {
  .depth-rail {
    display: none;
  }
}
</style>
