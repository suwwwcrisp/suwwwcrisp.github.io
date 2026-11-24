<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import type { ProjectItem } from '@/data/projects';
import { useSmoothScroll } from '@/composables/useSmoothScroll';

const props = defineProps<{
  project: ProjectItem | null;
  projectList: ProjectItem[];
}>();

const emit = defineEmits<{
  close: [];
  select: [project: ProjectItem];
}>();

const { pauseScroll, resumeScroll, scrollToSection } = useSmoothScroll();

const currentIndex = computed(() => {
  if (!props.project) return -1;
  return props.projectList.findIndex((p) => p.id === props.project?.id);
});

const hasPrev = computed(() => props.projectList.length > 1);
const hasNext = computed(() => props.projectList.length > 1);

function stepProject(delta: -1 | 1) {
  if (props.projectList.length <= 1 || currentIndex.value === -1) return;
  const len = props.projectList.length;
  const nextIdx = (currentIndex.value + delta + len) % len;
  emit('select', props.projectList[nextIdx]);
}

function handleDemoClick(demoUrl: string) {
  if (demoUrl.startsWith('#')) {
    const id = demoUrl.slice(1) as 'hero' | 'about' | 'projects' | 'contact';
    emit('close');
    window.setTimeout(() => {
      scrollToSection(id);
    }, 60);
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (!props.project) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    emit('close');
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    stepProject(-1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    stepProject(1);
  }
}

watch(
  () => props.project,
  (val, prev) => {
    if (val && !prev) {
      pauseScroll();
      window.addEventListener('keydown', onKeyDown);
    } else if (!val && prev) {
      resumeScroll();
      window.removeEventListener('keydown', onKeyDown);
    }
  },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
  if (props.project) {
    resumeScroll();
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="mac-modal">
      <div
        v-if="project"
        class="mac-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`modal-title-${project.id}`"
        @click.self="emit('close')"
      >
        <div class="mac-window">
          <!-- macOS Window Title Bar -->
          <header class="win-bar">
            <div class="win-dots">
              <button
                type="button"
                class="win-dot win-dot--close"
                aria-label="关闭项目弹窗"
                @click="emit('close')"
              />
              <span class="win-dot win-dot--min" aria-hidden="true" />
              <span class="win-dot win-dot--max" aria-hidden="true" />
            </div>

            <span class="win-title mono">
              {{ project.slug }}.app — {{ currentIndex + 1 }}/{{ projectList.length }}
            </span>

            <button
              type="button"
              class="win-close-btn"
              aria-label="关闭弹窗"
              @click="emit('close')"
            >
              ✕
            </button>
          </header>

          <!-- Split Modal Body -->
          <div class="win-body">
            <div class="win-media-col">
              <div class="win-cover">
                <img :src="project.cover" :alt="project.title" />
              </div>

              <dl class="win-meta">
                <div class="win-meta__row">
                  <dt>类型</dt>
                  <dd>{{ project.category }} · {{ project.status }}</dd>
                </div>
                <div class="win-meta__row">
                  <dt>年份</dt>
                  <dd class="mono">{{ project.year }}</dd>
                </div>
                <div class="win-meta__row win-meta__stack">
                  <dt>技术栈</dt>
                  <dd>
                    <span
                      v-for="tech in project.techStack"
                      :key="tech"
                      class="tag-chip mono"
                    >
                      {{ tech }}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div class="win-detail-col">
              <h2 :id="`modal-title-${project.id}`" class="win-detail-title">
                {{ project.title }}
              </h2>
              <p class="win-detail-summary">{{ project.summary }}</p>

              <div class="win-section">
                <h3 class="mono">用途说明 // PURPOSE</h3>
                <p>{{ project.purpose }}</p>
              </div>

              <div class="win-section">
                <h3 class="mono">主要能力 // HIGHLIGHTS</h3>
                <ul>
                  <li v-for="item in project.highlights" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div class="win-cta-row">
                <a
                  :href="project.repoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pill-btn pill-btn--primary"
                >
                  前往仓库 ↗
                </a>

                <template v-if="project.demoUrl">
                  <button
                    v-if="project.demoUrl.startsWith('#')"
                    type="button"
                    class="pill-btn"
                    @click="handleDemoClick(project.demoUrl)"
                  >
                    在线体验 ↗
                  </button>
                  <a
                    v-else
                    :href="project.demoUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="pill-btn"
                  >
                    在线体验 ↗
                  </a>
                </template>
              </div>

              <footer class="win-stepper">
                <button
                  type="button"
                  class="pill-btn"
                  :disabled="!hasPrev"
                  @click="stepProject(-1)"
                >
                  ← 上一个
                </button>
                <button
                  type="button"
                  class="pill-btn"
                  :disabled="!hasNext"
                  @click="stepProject(1)"
                >
                  下一个 →
                </button>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mac-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--modal-backdrop);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: 1.25rem;
}

.mac-window {
  width: min(920px, 100%);
  max-height: min(88vh, 720px);
  border-radius: 22px;
  background: var(--modal-bg);
  border: 1px solid var(--glass-border);
  box-shadow: 0 32px 72px -18px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.win-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.05rem;
  background: var(--modal-bar);
  border-bottom: 1px solid var(--divider);
  flex-shrink: 0;
}

.win-dots {
  display: flex;
  align-items: center;
  gap: 0.48rem;
}

.win-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  padding: 0;
}

.win-dot--close {
  background: #ff5f56;
  cursor: pointer;
}

.win-dot--min {
  background: #ffbd2e;
}

.win-dot--max {
  background: #27c93f;
}

.win-title {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.win-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--divider);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.win-close-btn:hover {
  background: var(--pill-bg);
  color: var(--text-primary);
}

.win-body {
  padding: 1.45rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 1.5rem;
}

.win-media-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.win-cover {
  aspect-ratio: 16 / 10;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--divider);
}

.win-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.win-meta {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--divider);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.win-meta__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.win-meta__row dt {
  color: var(--text-muted);
  font-weight: 600;
}

.win-meta__row dd {
  margin: 0;
  color: var(--text-primary);
  font-weight: 500;
}

.win-meta__stack {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
}

.win-meta__stack dd {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.win-detail-col {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.win-detail-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.win-detail-summary {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.win-section h3 {
  margin: 0 0 0.35rem;
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  color: var(--miku-teal-deep);
}

[data-theme='dark'] .win-section h3 {
  color: var(--miku-teal);
}

.win-section p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.win-section ul {
  margin: 0;
  padding-left: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.89rem;
  color: var(--text-secondary);
}

.win-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  padding-top: 0.35rem;
}

.win-stepper {
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px solid var(--divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

@media (max-width: 780px) {
  .win-body {
    grid-template-columns: 1fr;
    padding: 1.1rem;
  }
}
</style>
