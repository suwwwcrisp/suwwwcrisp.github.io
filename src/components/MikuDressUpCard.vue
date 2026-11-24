<script setup lang="ts">
import { computed, ref } from 'vue';
import { siteConfig } from '@/data/siteConfig';

const outfits = siteConfig.outfits;
const activeIndex = ref(0);

const currentOutfit = computed(() => outfits[activeIndex.value] ?? outfits[0]);

function cycleOutfit(event?: MouseEvent) {
  activeIndex.value = (activeIndex.value + 1) % outfits.length;
  if (event) {
    window.dispatchEvent(
      new CustomEvent('miku-note-burst', {
        detail: { x: event.clientX, y: event.clientY, count: 5 },
      }),
    );
  }
}
</script>

<template>
  <!-- Faithfully echoes arcueidblog.top's clean airy Saber Bento card -->
  <article class="glass-card glass-card--interactive saber-style-card">
    <header class="saber-card__top">
      <span class="saber-card__title">Miku · {{ currentOutfit.name }}</span>

      <button
        type="button"
        class="saber-card__swap"
        aria-label="切换下一套初音换装"
        title="切换服装"
        @click="cycleOutfit($event)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M16 3l4 4-4 4" />
          <path d="M20 7H4" />
          <path d="M8 21l-4-4 4-4" />
          <path d="M4 17h16" />
        </svg>
      </button>
    </header>

    <button
      type="button"
      class="saber-card__canvas"
      :aria-label="`初音未来像素换装：${currentOutfit.name}（${activeIndex + 1}/${outfits.length}），点击换装`"
      @click="cycleOutfit($event)"
    >
      <Transition name="outfit-pop" mode="out-in">
        <img
          :key="currentOutfit.id"
          :src="currentOutfit.image"
          :alt="`初音未来像素立绘 - ${currentOutfit.name}`"
          class="saber-card__sprite"
          width="192"
          height="192"
        />
      </Transition>
    </button>

    <footer class="saber-card__bottom">
      <div class="saber-card__dots" aria-hidden="true">
        <span
          v-for="(item, idx) in outfits"
          :key="item.id"
          class="saber-dot"
          :class="{ 'is-active': idx === activeIndex }"
          :style="{ '--dot-accent': item.accent }"
        />
      </div>
      <span class="saber-card__count mono">{{ activeIndex + 1 }} / {{ outfits.length }}</span>
    </footer>
  </article>
</template>

<style scoped>
.saber-style-card {
  padding: 1.5rem 1.75rem 1.25rem;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.saber-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.saber-card__title {
  font-size: 0.96rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.saber-card__swap {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.25s ease;
}

.saber-card__swap:hover {
  color: var(--miku-teal-deep);
  background: var(--miku-teal-soft);
  transform: scale(1.06);
}

.saber-card__canvas {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem 0;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.saber-card__sprite {
  width: 212px;
  height: 212px;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(18, 42, 52, 0.14));
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.saber-card__canvas:hover .saber-card__sprite {
  transform: translateY(-4px) scale(1.03);
}

.saber-card__canvas:active .saber-card__sprite {
  transform: scale(0.97);
}

.saber-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.saber-card__dots {
  display: flex;
  align-items: center;
  gap: 0.38rem;
}

.saber-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--divider);
  transition:
    width 0.22s ease,
    background-color 0.22s ease;
}

.saber-dot.is-active {
  width: 18px;
  background: var(--dot-accent, var(--miku-teal));
}

.saber-card__count {
  font-size: 0.74rem;
  color: var(--text-muted);
}
</style>
