<script setup lang="ts">
import { resolveAssetUrl } from '@/data/siteConfig';
import { useTheme } from '@/composables/useTheme';
import { useNoteFx } from '@/composables/useNoteFx';
import { useMikuCursor } from '@/composables/useCursor';
import { useSmoothScroll, type SectionId } from '@/composables/useSmoothScroll';

const { theme, toggleTheme } = useTheme();
const { noteFxEnabled, toggleNoteFx } = useNoteFx();
const { customCursorEnabled, toggleCustomCursor } = useMikuCursor();
const { activeSection, scrollToSection } = useSmoothScroll();

const navItems: Array<{ id: SectionId; label: string }> = [
  { id: 'hero', label: '首屏' },
  { id: 'about', label: '关于' },
  { id: 'projects', label: '作品' },
  { id: 'contact', label: '联系' },
];

const avatarImage = resolveAssetUrl('images/portal/miku-nav-avatar.jpg');
</script>

<template>
  <header class="miku-nav-wrap">
    <nav class="miku-nav" aria-label="主导航">
      <button
        type="button"
        class="miku-nav__brand"
        aria-label="返回顶部"
        data-tip="MIKU.SPACE"
        @click="scrollToSection('hero')"
      >
        <span class="serif-display miku-nav__monogram">M.</span>
      </button>

      <span class="miku-nav__sep" aria-hidden="true" />

      <ul class="miku-nav__links">
        <li v-for="item in navItems" :key="item.id">
          <button
            type="button"
            class="miku-nav__icon-btn"
            :class="{ 'is-active': activeSection === item.id }"
            :aria-label="item.label"
            :data-tip="item.label"
            @click="scrollToSection(item.id)"
          >
            <!-- Hero: minimal open book / journal icon -->
            <svg
              v-if="item.id === 'hero'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.65"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>

            <!-- About: minimal user profile icon -->
            <svg
              v-else-if="item.id === 'about'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.65"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>

            <!-- Projects: minimal 4-square grid icon -->
            <svg
              v-else-if="item.id === 'projects'"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.65"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>

            <!-- Contact: minimal link icon -->
            <svg
              v-else
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="1.65"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </li>
      </ul>

      <span class="miku-nav__sep" aria-hidden="true" />

      <div class="miku-nav__actions">
        <button
          type="button"
          class="miku-nav__icon-btn miku-nav__util"
          :class="{ 'is-on': customCursorEnabled }"
          :aria-pressed="customCursorEnabled"
          :aria-label="customCursorEnabled ? '关闭初音动态指针' : '开启初音动态指针'"
          data-tip="动态指针"
          @click="toggleCustomCursor"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.65"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m4 4 7.07 17 2.51-7.39L21 11.07z" />
          </svg>
          <span v-if="customCursorEnabled" class="util-dot" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="miku-nav__icon-btn miku-nav__util"
          :class="{ 'is-on': noteFxEnabled }"
          :aria-pressed="noteFxEnabled"
          :aria-label="noteFxEnabled ? '关闭点击音符特效' : '开启点击音符特效'"
          data-tip="音符特效"
          @click="toggleNoteFx"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.65"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span v-if="noteFxEnabled" class="util-dot" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="miku-nav__icon-btn miku-nav__theme"
          :aria-label="theme === 'light' ? '切换到夜间电子舞台模式' : '切换到清新通透模式'"
          data-tip="切换主题"
          @click="toggleTheme"
        >
          <svg
            v-if="theme === 'light'"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.65"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.65"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </button>
      </div>

      <span class="miku-nav__sep" aria-hidden="true" />

      <button
        type="button"
        class="miku-nav__avatar-btn"
        aria-label="回到初音舞台顶部"
        data-tip="Miku 39"
        @click="scrollToSection('hero')"
      >
        <img
          v-if="avatarImage"
          :src="avatarImage"
          alt="Miku 头像"
          class="miku-nav__avatar-img"
          width="36"
          height="36"
        />
      </button>
    </nav>
  </header>
</template>

<style scoped>
.miku-nav-wrap {
  position: fixed;
  top: 1.1rem;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: center;
  padding-inline: 0.75rem;
  pointer-events: none;
}

.miku-nav {
  pointer-events: auto;
  width: fit-content;
  max-width: calc(100vw - 1.5rem);
  height: 54px;
  padding: 0 10px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid var(--glass-border);
  box-shadow:
    0 10px 28px -14px rgba(24, 58, 72, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
}

[data-theme='dark'] .miku-nav {
  background: rgba(14, 24, 38, 0.62);
  box-shadow:
    0 14px 34px -14px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(76, 235, 224, 0.16);
}

.miku-nav__sep {
  width: 1px;
  height: 20px;
  margin-inline: 4px;
  background: var(--glass-border);
  flex-shrink: 0;
}

.miku-nav__brand,
.miku-nav__icon-btn,
.miku-nav__avatar-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  border-radius: 999px;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

.miku-nav__brand {
  width: 36px;
  height: 36px;
  color: var(--text-primary);
}

.miku-nav__brand:hover {
  background: rgba(57, 197, 187, 0.1);
}

.miku-nav__monogram {
  font-size: 1.05rem;
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  letter-spacing: -0.02em;
}

.miku-nav__links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.miku-nav__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.miku-nav__icon-btn {
  width: 38px;
  height: 38px;
  color: var(--text-secondary);
}

.miku-nav__icon-btn:hover {
  color: var(--text-primary);
  background: rgba(57, 197, 187, 0.1);
}

.miku-nav__icon-btn.is-active {
  background: rgba(57, 197, 187, 0.15);
  color: var(--miku-teal-deep);
}

[data-theme='dark'] .miku-nav__icon-btn.is-active {
  background: rgba(76, 235, 224, 0.18);
  color: var(--miku-teal);
}

.miku-nav__util:not(.is-on) {
  opacity: 0.45;
}

.miku-nav__util.is-on {
  color: var(--text-primary);
}

.util-dot {
  position: absolute;
  bottom: 5px;
  right: 6px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--miku-teal);
  box-shadow: 0 0 6px var(--miku-teal);
}

.miku-nav__theme {
  color: var(--text-secondary);
}

.miku-nav__avatar-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.6);
}

[data-theme='dark'] .miku-nav__avatar-btn {
  background: rgba(22, 36, 54, 0.72);
}

.miku-nav__avatar-btn:hover {
  transform: scale(1.06);
  border-color: var(--miku-teal);
}

.miku-nav__avatar-img {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center center;
  transform: scale(1.02);
  clip-path: circle(50%);
}

/* Floating tooltip below capsule buttons */
[data-tip]::after {
  content: attr(data-tip);
  position: absolute;
  top: calc(100% + 9px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  padding: 0.24rem 0.58rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  color: var(--text-primary);
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 20px -10px rgba(24, 58, 72, 0.25);
  backdrop-filter: blur(12px);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  z-index: 60;
}

[data-tip]:hover::after,
[data-tip]:focus-visible::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

@media (max-width: 600px) {
  .miku-nav {
    height: 48px;
    padding: 0 7px;
    gap: 2px;
  }

  .miku-nav__sep {
    height: 16px;
    margin-inline: 2px;
  }

  .miku-nav__brand,
  .miku-nav__icon-btn,
  .miku-nav__avatar-btn {
    width: 34px;
    height: 34px;
  }

  .miku-nav__avatar-img {
    width: 32px;
    height: 32px;
  }

  [data-tip]::after {
    display: none;
  }
}
</style>
