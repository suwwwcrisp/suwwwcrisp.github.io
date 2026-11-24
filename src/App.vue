<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ProjectItem } from '@/data/projects';
import { useSmoothScroll } from '@/composables/useSmoothScroll';
import MikuNav from '@/components/MikuNav.vue';
import DepthRail from '@/components/DepthRail.vue';
import NoteParticles from '@/components/NoteParticles.vue';
import MikuCursor from '@/components/MikuCursor.vue';
import CinematicStoryStage from '@/components/CinematicStoryStage.vue';
import HeroSection from '@/components/HeroSection.vue';
import AboutSection from '@/components/AboutSection.vue';
import ProjectsSection from '@/components/ProjectsSection.vue';
import FooterSection from '@/components/FooterSection.vue';
import ProjectModal from '@/components/ProjectModal.vue';

gsap.registerPlugin(ScrollTrigger);

const { initSmoothScroll, destroySmoothScroll } = useSmoothScroll();

const activeProject = ref<ProjectItem | null>(null);
const modalProjectList = ref<ProjectItem[]>([]);

function handleOpenProject(project: ProjectItem, list: ProjectItem[]) {
  activeProject.value = project;
  modalProjectList.value = list;
}

function handleCloseModal() {
  activeProject.value = null;
}

onMounted(() => {
  initSmoothScroll();
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
});

onBeforeUnmount(() => {
  destroySmoothScroll();
});
</script>

<template>
  <div class="ambient-canvas" aria-hidden="true">
    <div class="ambient-grid" />
    <div class="ambient-aurora ambient-aurora--one" />
    <div class="ambient-aurora ambient-aurora--two" />
    <div class="ambient-aurora ambient-aurora--three" />
    <div class="ambient-aurora ambient-aurora--four" />

    <!-- Diagonal Ultra-Light Miku Ticker Ribbons -->
    <div class="ambient-ribbon ambient-ribbon--top mono">
      <div class="ambient-ribbon__track">
        <span>01 // HATSUNE MIKU // 39.0 Hz // DIGITAL STAGE // VOCALOID SOUNDFIELD //</span>
        <span>01 // HATSUNE MIKU // 39.0 Hz // DIGITAL STAGE // VOCALOID SOUNDFIELD //</span>
      </div>
    </div>
    <div class="ambient-ribbon ambient-ribbon--bottom mono">
      <div class="ambient-ribbon__track ambient-ribbon__track--rev">
        <span>39 // MIKU.SPACE // SYNTHETIC RESONANCE // CH-39 LIVE STREAM //</span>
        <span>39 // MIKU.SPACE // SYNTHETIC RESONANCE // CH-39 LIVE STREAM //</span>
      </div>
    </div>

    <!-- Perimeter Translucent Notes, Holo Stars & Crosshair Coordinate Ticks -->
    <div class="ambient-float ambient-float--tl">
      <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
        <path
          d="M15 26V9l14-3v17"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="11" cy="27" r="4" stroke="currentColor" stroke-width="2" />
        <circle cx="25" cy="24" r="4" stroke="currentColor" stroke-width="2" />
      </svg>
    </div>

    <div class="ambient-float ambient-float--tr">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor">
        <path d="M16 2 L18.8 13.2 L30 16 L18.8 18.8 L16 30 L13.2 18.8 L2 16 L13.2 13.2 Z" />
      </svg>
    </div>

    <div class="ambient-float ambient-float--ml">
      <span class="ambient-crosshair mono">+ 01 // 39</span>
    </div>

    <div class="ambient-float ambient-float--mr">
      <span class="ambient-crosshair ambient-crosshair--pink mono">+ 39.0 Hz</span>
    </div>

    <div class="ambient-float ambient-float--bl">
      <svg viewBox="0 0 32 32" width="26" height="26" fill="currentColor">
        <path d="M16 2 L18.6 13.4 L30 16 L18.6 18.6 L16 30 L13.4 18.6 L2 16 L13.4 13.4 Z" />
      </svg>
    </div>

    <div class="ambient-float ambient-float--br">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
        <path
          d="M14 25V7l9 2"
          stroke="currentColor"
          stroke-width="2.1"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="10" cy="25" r="4" stroke="currentColor" stroke-width="2" />
      </svg>
    </div>
  </div>

  <MikuNav />
  <DepthRail />
  <NoteParticles />
  <MikuCursor />

  <main class="site-main">
    <CinematicStoryStage>
      <template #hero>
        <HeroSection />
      </template>
      <template #about>
        <AboutSection />
      </template>
      <template #projects>
        <ProjectsSection @open-project="handleOpenProject" />
      </template>
    </CinematicStoryStage>

    <FooterSection />
  </main>

  <ProjectModal
    :project="activeProject"
    :project-list="modalProjectList"
    @close="handleCloseModal"
    @select="(p) => (activeProject = p)"
  />
</template>
