import { ref } from 'vue';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export type SectionId = 'hero' | 'about' | 'projects' | 'contact';

const activeSection = ref<SectionId>('hero');
const scrollProgress = ref<number>(0);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;
let initialized = false;
let reducedMotion = false;

function updateActiveSectionByViewport() {
  const ids: SectionId[] = ['hero', 'about', 'projects', 'contact'];
  const docHeight = Math.max(
    1,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  scrollProgress.value = Math.min(1, Math.max(0, window.scrollY / docHeight));

  const pivot = window.innerHeight * 0.42;
  let current: SectionId = 'hero';

  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= pivot) {
      current = id;
    }
  }

  const atBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 24;
  if (atBottom) {
    current = 'contact';
  }

  activeSection.value = current;
}

export function useSmoothScroll() {
  function initSmoothScroll() {
    if (initialized || typeof window === 'undefined') return;
    initialized = true;

    reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (!reducedMotion) {
      lenisInstance = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      lenisInstance.on('scroll', () => {
        ScrollTrigger.update();
        updateActiveSectionByViewport();
      });

      tickerCallback = (time: number) => {
        lenisInstance?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener('scroll', updateActiveSectionByViewport, {
        passive: true,
      });
    }

    window.addEventListener('resize', updateActiveSectionByViewport, {
      passive: true,
    });
    updateActiveSectionByViewport();
  }

  function destroySmoothScroll() {
    if (!initialized) return;
    initialized = false;
    if (tickerCallback) {
      gsap.ticker.remove(tickerCallback);
      tickerCallback = null;
    }
    if (lenisInstance) {
      lenisInstance.destroy();
      lenisInstance = null;
    }
    window.removeEventListener('scroll', updateActiveSectionByViewport);
    window.removeEventListener('resize', updateActiveSectionByViewport);
  }

  function scrollToSection(id: SectionId) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = id === 'contact' ? -76 : 0;
    if (lenisInstance && !reducedMotion) {
      lenisInstance.scrollTo(el, { offset });
    } else {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  function pauseScroll() {
    lenisInstance?.stop();
    document.documentElement.style.overflow = 'hidden';
  }

  function resumeScroll() {
    document.documentElement.style.overflow = '';
    lenisInstance?.start();
  }

  return {
    activeSection,
    scrollProgress,
    initSmoothScroll,
    destroySmoothScroll,
    scrollToSection,
    pauseScroll,
    resumeScroll,
  };
}
