<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { resolveAssetUrl } from '@/data/siteConfig';
import { useTheme } from '@/composables/useTheme';

gsap.registerPlugin(ScrollTrigger);

const { theme } = useTheme();

const shockStickerUrl = resolveAssetUrl('images/portal/chibi-shock.png');
const fishStickerUrl = resolveAssetUrl('images/portal/chibi-fish.png');
const leekStickerUrl = resolveAssetUrl('images/portal/chibi-leek.png');
const halftoneRingUrl = resolveAssetUrl('images/portal/halftone-ring.png');
const staffNotesUrl = resolveAssetUrl('images/portal/staff-notes.png');
const staffWaveUrl = resolveAssetUrl('images/portal/staff-wave-teal.png');
const notesSwarmUrl = resolveAssetUrl('images/portal/notes-swarm-teal.png');
const waterLightUrl = resolveAssetUrl('images/portal/water-miku-light.jpg');
const waterDarkUrl = resolveAssetUrl('images/portal/water-miku-dark.jpg');
const waterBgUrl = computed(() =>
  theme.value === 'dark' ? waterDarkUrl : waterLightUrl,
);

const runwayRef = ref<HTMLElement | null>(null);
const heroSlotRef = ref<HTMLElement | null>(null);
const aboutSlotRef = ref<HTMLElement | null>(null);
const projectsSlotRef = ref<HTMLElement | null>(null);

// Retro Miku CRT TV & Studio Backdrop refs
const tvStudioRef = ref<HTMLElement | null>(null);
const tvStudioHalftoneRef = ref<HTMLElement | null>(null);
const tvStudioStaffRef = ref<HTMLElement | null>(null);
const tvStudioNotesRef = ref<HTMLElement | null>(null);
const crtFrameRef = ref<HTMLElement | null>(null);
const crtGlareRef = ref<HTMLElement | null>(null);
const staticSlotRef = ref<HTMLElement | null>(null);
const glitchChromaRef = ref<HTMLElement | null>(null);
const glitchShiftRef = ref<HTMLElement | null>(null);
const snowSheetRef = ref<HTMLElement | null>(null);
const tearBandARef = ref<HTMLElement | null>(null);
const tearBandBRef = ref<HTMLElement | null>(null);
const tearBandCRef = ref<HTMLElement | null>(null);
const halftoneRef = ref<HTMLElement | null>(null);
const chibiShockRef = ref<HTMLElement | null>(null);
const chibiLeekRef = ref<HTMLElement | null>(null);

// Full-screen CRT noise veil during dive-in signal lock
const tvRoomNoiseRef = ref<HTMLElement | null>(null);
const tvRoomGrainRef = ref<HTMLElement | null>(null);
const tvRoomTearRef = ref<HTMLElement | null>(null);

// Origami Blueprint Wind Backdrop & Seamless Crease Guides
const origamiBackdropRef = ref<HTMLElement | null>(null);
const origamiStaffRef = ref<HTMLElement | null>(null);
const origamiNotesRef = ref<HTMLElement | null>(null);
const foldGuideRef = ref<HTMLElement | null>(null);

// Crystal Miku Bottle + Airplanes + Cork-Pop Seafoam Curtain refs
const bottleWrapRef = ref<HTMLElement | null>(null);
const corkRef = ref<HTMLElement | null>(null);
const waterArtRef = ref<HTMLElement | null>(null);
const waterLiquidRef = ref<HTMLElement | null>(null);
const waveBackRef = ref<SVGElement | null>(null);
const waveFrontRef = ref<SVGElement | null>(null);
const staffRef = ref<HTMLElement | null>(null);
const fishChibiRef = ref<HTMLElement | null>(null);
const leekChibiRef = ref<HTMLElement | null>(null);
const splashRef = ref<HTMLElement | null>(null);
const splashDropsRef = ref<HTMLElement | null>(null);
const dissolveSparkRef = ref<HTMLElement | null>(null);
const bottleFizzRef = ref<HTMLElement | null>(null);
const bottleFoamHeadRef = ref<HTMLElement | null>(null);
const eruptionPlumeRef = ref<HTMLElement | null>(null);
const airEntryPlaneRef = ref<HTMLElement | null>(null);
const neckPlaneRef = ref<HTMLElement | null>(null);
const submergedPlaneRef = ref<HTMLElement | null>(null);
const flyingPlaneRef = ref<HTMLElement | null>(null);
const planeTrailRef = ref<SVGPathElement | null>(null);
const foamCurtainRef = ref<HTMLElement | null>(null);
const foamWaveBackRef = ref<HTMLElement | null>(null);
const foamWaveMidRef = ref<HTMLElement | null>(null);
const foamWaveFrontRef = ref<HTMLElement | null>(null);
const bubbleLayerFarRef = ref<HTMLElement | null>(null);
const bubbleLayerMidRef = ref<HTMLElement | null>(null);
const bubbleLayerNearRef = ref<HTMLElement | null>(null);

interface BottleFizzSpec {
  id: number;
  left: number;
  bottom: number;
  size: number;
  riseY: number;
  driftX: number;
}

const BOTTLE_FIZZ_BUBBLES: BottleFizzSpec[] = [
  { id: 1, left: 17, bottom: 10, size: 7, riseY: -195, driftX: -10 },
  { id: 2, left: 23, bottom: 26, size: 11, riseY: -220, driftX: 9 },
  { id: 3, left: 30, bottom: 14, size: 6, riseY: -240, driftX: -7 },
  { id: 4, left: 37, bottom: 32, size: 12, riseY: -210, driftX: 12 },
  { id: 5, left: 45, bottom: 12, size: 8, riseY: -255, driftX: -12 },
  { id: 6, left: 53, bottom: 22, size: 13, riseY: -225, driftX: 8 },
  { id: 7, left: 61, bottom: 15, size: 7, riseY: -205, driftX: -9 },
  { id: 8, left: 69, bottom: 28, size: 10, riseY: -230, driftX: 11 },
  { id: 9, left: 77, bottom: 18, size: 8, riseY: -215, driftX: -8 },
  { id: 10, left: 22, bottom: 44, size: 9, riseY: -180, driftX: 7 },
  { id: 11, left: 34, bottom: 48, size: 6, riseY: -190, driftX: -10 },
  { id: 12, left: 49, bottom: 42, size: 12, riseY: -175, driftX: 11 },
  { id: 13, left: 64, bottom: 46, size: 8, riseY: -185, driftX: -8 },
  { id: 14, left: 75, bottom: 40, size: 7, riseY: -170, driftX: 9 },
  { id: 15, left: 41, bottom: 58, size: 10, riseY: -165, driftX: 6 },
  { id: 16, left: 28, bottom: 60, size: 5, riseY: -170, driftX: -6 },
  { id: 17, left: 57, bottom: 56, size: 7, riseY: -160, driftX: 8 },
  { id: 18, left: 71, bottom: 62, size: 6, riseY: -155, driftX: -7 },
];

interface SvgBubbleSpec {
  id: number;
  cx: number;
  cy: number;
  r: number;
  pink?: boolean;
}

// 18 crisp cel-shaded micro-bubbles along bottle waterline froth lace
const LACE_MICRO_BUBBLES: SvgBubbleSpec[] = [
  { id: 1, cx: 18, cy: 40, r: 3.5 },
  { id: 2, cx: 34, cy: 28, r: 2.2 },
  { id: 3, cx: 52, cy: 36, r: 4.5, pink: true },
  { id: 4, cx: 70, cy: 20, r: 2.8 },
  { id: 5, cx: 88, cy: 32, r: 5.0 },
  { id: 6, cx: 108, cy: 22, r: 3.0 },
  { id: 7, cx: 126, cy: 34, r: 4.2, pink: true },
  { id: 8, cx: 148, cy: 18, r: 2.5 },
  { id: 9, cx: 168, cy: 29, r: 5.4 },
  { id: 10, cx: 188, cy: 20, r: 3.2 },
  { id: 11, cx: 206, cy: 33, r: 4.6, pink: true },
  { id: 12, cx: 224, cy: 17, r: 2.6 },
  { id: 13, cx: 242, cy: 30, r: 4.8 },
  { id: 14, cx: 262, cy: 21, r: 3.0 },
  { id: 15, cx: 280, cy: 34, r: 4.0, pink: true },
  { id: 16, cx: 298, cy: 24, r: 2.4 },
  { id: 17, cx: 314, cy: 36, r: 3.6 },
  { id: 18, cx: 326, cy: 27, r: 2.2 },
];

// 24 varied cel-shaded sparkling bubbles bursting from bottle mouth
const GEYSER_BUBBLES: SvgBubbleSpec[] = [
  { id: 1, cx: 118, cy: 182, r: 5.5 },
  { id: 2, cx: 126, cy: 168, r: 4.0, pink: true },
  { id: 3, cx: 108, cy: 156, r: 6.8 },
  { id: 4, cx: 134, cy: 144, r: 5.2 },
  { id: 5, cx: 94, cy: 132, r: 4.2 },
  { id: 6, cx: 119, cy: 122, r: 9.2 },
  { id: 7, cx: 146, cy: 118, r: 6.4, pink: true },
  { id: 8, cx: 76, cy: 108, r: 5.8 },
  { id: 9, cx: 102, cy: 96, r: 11.0 },
  { id: 10, cx: 164, cy: 98, r: 5.0 },
  { id: 11, cx: 134, cy: 86, r: 8.6 },
  { id: 12, cx: 56, cy: 84, r: 4.2, pink: true },
  { id: 13, cx: 88, cy: 70, r: 6.0 },
  { id: 14, cx: 184, cy: 76, r: 4.4 },
  { id: 15, cx: 116, cy: 62, r: 12.2 },
  { id: 16, cx: 152, cy: 64, r: 7.4 },
  { id: 17, cx: 40, cy: 58, r: 3.2 },
  { id: 18, cx: 72, cy: 44, r: 4.8, pink: true },
  { id: 19, cx: 198, cy: 52, r: 3.4 },
  { id: 20, cx: 100, cy: 36, r: 6.4 },
  { id: 21, cx: 140, cy: 34, r: 8.0 },
  { id: 22, cx: 172, cy: 42, r: 5.2 },
  { id: 23, cx: 122, cy: 18, r: 5.0, pink: true },
  { id: 24, cx: 156, cy: 16, r: 3.6 },
];

interface CurtainBubbleSpec {
  id: number;
  layer: 'far' | 'mid' | 'near';
  left: number;
  top: number;
  size: number;
  tint: 'teal' | 'pink' | 'pearl';
}

// 96 dense clustered anime bubbles surging in organic streams across far / mid / near planes
const CURTAIN_BUBBLES: CurtainBubbleSpec[] = (() => {
  const clusters: Array<{ cx: number; cy: number; count: number; spread: number }> = [
    { cx: 8, cy: 26, count: 9, spread: 7 },
    { cx: 16, cy: 66, count: 10, spread: 8 },
    { cx: 28, cy: 38, count: 10, spread: 8 },
    { cx: 39, cy: 78, count: 9, spread: 8 },
    { cx: 50, cy: 48, count: 12, spread: 9 },
    { cx: 61, cy: 22, count: 9, spread: 7 },
    { cx: 72, cy: 64, count: 11, spread: 9 },
    { cx: 83, cy: 34, count: 10, spread: 8 },
    { cx: 92, cy: 74, count: 9, spread: 7 },
    { cx: 46, cy: 14, count: 7, spread: 10 },
  ];
  const list: CurtainBubbleSpec[] = [];
  let id = 1;
  const tints: Array<'teal' | 'pink' | 'pearl'> = ['teal', 'pearl', 'teal', 'pink'];

  for (let c = 0; c < clusters.length; c++) {
    const cl = clusters[c];
    for (let k = 0; k < cl.count; k++) {
      const idx = id - 1;
      const goldenAngle = idx * 2.39996;
      const radial = ((k + 0.5) / cl.count) * cl.spread;
      const left = Math.max(2, Math.min(96, cl.cx + Math.cos(goldenAngle) * radial * 1.15));
      const top = Math.max(4, Math.min(94, cl.cy + Math.sin(goldenAngle) * radial * 1.25));

      let layer: 'far' | 'mid' | 'near';
      let size: number;
      if (idx % 10 === 0 || idx % 10 === 4 || idx % 10 === 7 || idx % 10 === 9) {
        layer = 'far';
        size = 7 + ((idx * 5) % 12);
      } else if (idx % 4 === 1 || idx % 8 === 2) {
        layer = 'near';
        size = 24 + ((idx * 13) % 45);
      } else {
        layer = 'mid';
        size = 16 + ((idx * 9) % 27);
      }

      list.push({
        id,
        layer,
        left: Number(left.toFixed(1)),
        top: Number(top.toFixed(1)),
        size,
        tint: tints[(c + k) % tints.length],
      });
      id += 1;
    }
  }
  return list;
})();

const SPARKLE_STARS: Array<{ id: number; left: number; top: number; size: number; pink?: boolean }> = [
  { id: 1, left: 11, top: 20, size: 15 },
  { id: 2, left: 24, top: 54, size: 12, pink: true },
  { id: 3, left: 36, top: 28, size: 18 },
  { id: 4, left: 48, top: 68, size: 14 },
  { id: 5, left: 57, top: 36, size: 16, pink: true },
  { id: 6, left: 68, top: 18, size: 13 },
  { id: 7, left: 77, top: 58, size: 17 },
  { id: 8, left: 86, top: 28, size: 14, pink: true },
  { id: 9, left: 19, top: 80, size: 15 },
  { id: 10, left: 91, top: 66, size: 12 },
];

const farCurtainBubbles = CURTAIN_BUBBLES.filter((b) => b.layer === 'far');
const midCurtainBubbles = CURTAIN_BUBBLES.filter((b) => b.layer === 'mid');
const nearCurtainBubbles = CURTAIN_BUBBLES.filter((b) => b.layer === 'near');

const tvChannel = ref<'CH-39' | 'NO SIGNAL' | 'CH-02'>('CH-39');
const dialAngle = ref(24);
const tvSignalProgress = ref(0);
const bottleLabel = ref('ORIGAMI // FOLDING PROFILE');
const heroInteractive = ref(true);
const aboutInteractive = ref(false);
const projectsInteractive = ref(false);

function getVentFill(index1Based: number): number {
  return Math.max(0, Math.min(1, tvSignalProgress.value * 8 - (index1Based - 1)));
}

let mm: gsap.MatchMedia | null = null;

onMounted(() => {
  if (!runwayRef.value) return;

  mm = gsap.matchMedia(runwayRef.value);

  mm.add('(max-width: 520px), (prefers-reduced-motion: reduce)', () => {
    heroInteractive.value = true;
    aboutInteractive.value = true;
    projectsInteractive.value = true;
  });

  mm.add('(min-width: 521px) and (prefers-reduced-motion: no-preference)', () => {
    heroInteractive.value = true;
    aboutInteractive.value = false;
    projectsInteractive.value = false;

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: runwayRef.value,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.55,
        onUpdate: (self) => {
          const p = self.progress;

          if (p < 0.145) {
            tvChannel.value = 'CH-39';
            dialAngle.value = 24;
          } else if (p < 0.275) {
            tvChannel.value = 'NO SIGNAL';
            const t = (p - 0.145) / 0.13;
            dialAngle.value = Math.round(24 + t * 132);
          } else {
            tvChannel.value = 'CH-02';
            dialAngle.value = 156;
          }

          tvSignalProgress.value = Math.max(
            0,
            Math.min(1, (p - 0.02) / 0.255),
          );

          if (p < 0.59) {
            bottleLabel.value = 'ORIGAMI // FOLDING PROFILE';
          } else if (p < 0.655) {
            bottleLabel.value = 'PAPER AIRPLANE // DIVING IN';
          } else if (p < 0.705) {
            bottleLabel.value = 'BOTTLE 39 // SPLASH & DISSOLVE';
          } else if (p < 0.788) {
            bottleLabel.value = 'BOTTLE 39 // SHAKING & FIZZING';
          } else if (p < 0.87) {
            bottleLabel.value = 'CORK POP // SEAFOAM SURGE';
          } else if (p < 0.94) {
            bottleLabel.value = 'BUBBLES // ENTERING ARCHIVE';
          } else {
            bottleLabel.value = 'PROJECTS // READY';
          }

          heroInteractive.value = p < 0.135;
          aboutInteractive.value = p >= 0.37 && p < 0.49;
          projectsInteractive.value = p >= 0.88;
        },
      },
    });

    // Exact rest-state mouth-lip offset relative to flyingPlaneRef center
    if (bottleWrapRef.value && flyingPlaneRef.value) {
      gsap.set([bottleWrapRef.value, flyingPlaneRef.value], { clearProps: 'transform' });
    }
    const lipEl = bottleWrapRef.value?.querySelector<HTMLElement>('.bottle-lip');
    const lipRect = lipEl?.getBoundingClientRect();
    const planeRestRect = flyingPlaneRef.value?.getBoundingClientRect();
    const mouthX =
      lipRect && planeRestRect
        ? lipRect.left + lipRect.width / 2 - (planeRestRect.left + planeRestRect.width / 2)
        : 0;
    const mouthY =
      lipRect && planeRestRect
        ? lipRect.top + lipRect.height / 2 - (planeRestRect.top + planeRestRect.height / 2)
        : -258;

    // Initial parked states
    if (heroSlotRef.value) {
      gsap.set(heroSlotRef.value, { scale: 1, y: 0, opacity: 1 });
    }
    if (aboutSlotRef.value) {
      gsap.set(aboutSlotRef.value, {
        scale: 0.86,
        scaleX: 0.86,
        scaleY: 0.86,
        rotateX: 0,
        rotationZ: 0,
        y: 0,
        opacity: 0,
        clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%, 0% 0%)',
      });
    }
    if (projectsSlotRef.value) {
      gsap.set(projectsSlotRef.value, {
        opacity: 0,
        scale: 0.94,
        y: 28,
      });
    }
    if (tvStudioRef.value) {
      gsap.set(tvStudioRef.value, { opacity: 0 });
    }
    if (origamiBackdropRef.value) {
      gsap.set(origamiBackdropRef.value, { opacity: 0 });
    }
    if (crtFrameRef.value) {
      gsap.set(crtFrameRef.value, { scale: 1.82, opacity: 0 });
    }
    if (crtGlareRef.value) {
      gsap.set(crtGlareRef.value, { y: -26, scale: 1, opacity: 0 });
    }
    if (staticSlotRef.value) {
      gsap.set(staticSlotRef.value, { y: -26, scale: 1, opacity: 0 });
    }
    if (glitchChromaRef.value) {
      gsap.set(glitchChromaRef.value, {
        backgroundPosition: '0% 0%',
        filter: 'hue-rotate(0deg) saturate(1.06)',
      });
    }
    if (glitchShiftRef.value) {
      gsap.set(glitchShiftRef.value, { xPercent: -14, opacity: 0.22 });
    }
    if (tearBandCRef.value) {
      gsap.set(tearBandCRef.value, { xPercent: -16, y: -12, opacity: 0.25 });
    }
    if (tvRoomNoiseRef.value) {
      gsap.set(tvRoomNoiseRef.value, { opacity: 0 });
    }
    if (tvRoomGrainRef.value) {
      gsap.set(tvRoomGrainRef.value, { filter: 'hue-rotate(0deg)' });
    }
    if (foldGuideRef.value) {
      gsap.set(foldGuideRef.value, { opacity: 0, scale: 0.86, rotateX: 0 });
    }
    if (flyingPlaneRef.value) {
      gsap.set(flyingPlaneRef.value, {
        opacity: 0,
        x: 0,
        y: 0,
        scale: 0.65,
        rotation: -14,
      });
    }
    if (planeTrailRef.value) {
      gsap.set(planeTrailRef.value, { opacity: 1 });
    }
    const entryPlanes = [airEntryPlaneRef.value, neckPlaneRef.value].filter(Boolean);
    if (entryPlanes.length) {
      gsap.set(entryPlanes, {
        opacity: 0,
        x: -4,
        y: -78,
        rotation: 94,
        scale: 0.44,
      });
    }
    if (bottleWrapRef.value) {
      gsap.set(bottleWrapRef.value, { y: 120, scale: 0.86, opacity: 0 });
    }
    if (corkRef.value) {
      gsap.set(corkRef.value, { x: 88, y: -62, rotation: 26, scale: 0.96, opacity: 1 });
    }
    if (submergedPlaneRef.value) {
      gsap.set(submergedPlaneRef.value, {
        opacity: 0,
        x: 0,
        y: -44,
        scale: 0.46,
        rotation: 90,
        filter: 'none',
      });
    }
    if (splashRef.value) {
      gsap.set(splashRef.value, { opacity: 0, scale: 0.32 });
    }
    if (splashDropsRef.value) {
      gsap.set(splashDropsRef.value, { opacity: 0, y: 12, scale: 0.45 });
    }
    if (dissolveSparkRef.value) {
      gsap.set(dissolveSparkRef.value, { opacity: 0, scale: 0.4 });
    }
    if (bottleFizzRef.value) {
      gsap.set(bottleFizzRef.value, { opacity: 0 });
    }
    if (bottleFoamHeadRef.value) {
      gsap.set(bottleFoamHeadRef.value, { opacity: 0, y: 18, scaleY: 0.35 });
    }
    if (eruptionPlumeRef.value) {
      gsap.set(eruptionPlumeRef.value, {
        opacity: 0,
        scaleY: 0.15,
        scaleX: 0.45,
        y: 16,
      });
    }
    if (foamCurtainRef.value) {
      gsap.set(foamCurtainRef.value, { opacity: 0 });
    }
    if (foamWaveBackRef.value) {
      gsap.set(foamWaveBackRef.value, {
        yPercent: 112,
        xPercent: -4,
        scaleY: 1.06,
        opacity: 0.88,
      });
    }
    if (foamWaveMidRef.value) {
      gsap.set(foamWaveMidRef.value, {
        yPercent: 116,
        xPercent: 4,
        scaleY: 1.04,
        opacity: 0.95,
      });
    }
    if (foamWaveFrontRef.value) {
      gsap.set(foamWaveFrontRef.value, {
        yPercent: 120,
        xPercent: -2,
        scaleY: 1.02,
        opacity: 1,
      });
    }
    if (bubbleLayerFarRef.value) {
      gsap.set(bubbleLayerFarRef.value, { yPercent: 92, xPercent: -2, opacity: 0 });
    }
    if (bubbleLayerMidRef.value) {
      gsap.set(bubbleLayerMidRef.value, { yPercent: 100, xPercent: 3, opacity: 0 });
    }
    if (bubbleLayerNearRef.value) {
      gsap.set(bubbleLayerNearRef.value, { yPercent: 108, xPercent: -3, opacity: 0 });
    }

    const aboutBlocks = aboutSlotRef.value
      ? Array.from(
          aboutSlotRef.value.querySelectorAll<HTMLElement>('[data-tv-block]'),
        )
      : [];
    if (aboutBlocks.length > 0) {
      gsap.set(aboutBlocks, {
        opacity: 0,
        y: 14,
        scale: 0.96,
        x: 0,
        filter: 'none',
      });
    }

    // -------------------------------------------------------------------------
    // Act 1 (0.00 -> 0.14): Live 3D Hero shrinks into Retro Miku CRT TV Studio
    // -------------------------------------------------------------------------
    if (tvStudioRef.value) {
      tl.to(
        tvStudioRef.value,
        { opacity: 1, duration: 0.09, ease: 'power1.out' },
        0.04,
      ).to(
        tvStudioRef.value,
        { opacity: 0, duration: 0.06, ease: 'power1.in' },
        0.25,
      );
    }
    if (tvStudioHalftoneRef.value) {
      tl.fromTo(
        tvStudioHalftoneRef.value,
        { rotation: 0, scale: 0.9 },
        { rotation: 75, scale: 1.06, duration: 0.25 },
        0.04,
      );
    }
    if (tvStudioStaffRef.value) {
      tl.fromTo(
        tvStudioStaffRef.value,
        { x: -30, y: 12 },
        { x: 26, y: -12, duration: 0.25 },
        0.04,
      );
    }
    if (tvStudioNotesRef.value) {
      tl.fromTo(
        tvStudioNotesRef.value,
        { y: 24 },
        { y: -28, duration: 0.25 },
        0.04,
      );
    }

    const heroScrollCue =
      heroSlotRef.value?.querySelector<HTMLElement>('.hero-scroll-cue') ?? null;
    if (heroScrollCue) {
      gsap.set(heroScrollCue, { opacity: 1, y: 0 });
      tl.to(
        heroScrollCue,
        { opacity: 0, y: 10, duration: 0.04, ease: 'power1.in' },
        0.005,
      );
    }

    if (heroSlotRef.value) {
      tl.to(
        heroSlotRef.value,
        { scale: 0.536, y: -26, duration: 0.14, ease: 'power1.inOut' },
        0,
      ).to(
        heroSlotRef.value,
        { opacity: 0, duration: 0.04, ease: 'power1.in' },
        0.18,
      );
    }

    if (crtFrameRef.value) {
      tl.to(
        crtFrameRef.value,
        { scale: 1, duration: 0.14, ease: 'power1.inOut' },
        0,
      ).to(
        crtFrameRef.value,
        { opacity: 1, duration: 0.08, ease: 'power2.out' },
        0.03,
      );
    }

    if (crtGlareRef.value) {
      tl.to(
        crtGlareRef.value,
        { opacity: 0.85, duration: 0.06, ease: 'power1.out' },
        0.08,
      );
    }

    // -------------------------------------------------------------------------
    // Act 2 (0.14 -> 0.25): Dynamic Scroll-Reactive CRT Glitch + Chibi Interference
    // -------------------------------------------------------------------------
    if (staticSlotRef.value) {
      tl.to(
        staticSlotRef.value,
        { opacity: 1, duration: 0.03, ease: 'power2.out' },
        0.14,
      );
    }
    if (glitchChromaRef.value) {
      tl.to(
        glitchChromaRef.value,
        {
          backgroundPosition: '42% 0%',
          filter: 'hue-rotate(72deg) saturate(1.25)',
          duration: 0.04,
        },
        0.14,
      )
        .to(
          glitchChromaRef.value,
          {
            backgroundPosition: '80% 0%',
            filter: 'hue-rotate(-55deg) saturate(1.22)',
            duration: 0.04,
          },
          0.18,
        )
        .to(
          glitchChromaRef.value,
          {
            backgroundPosition: '100% 0%',
            filter: 'hue-rotate(115deg) saturate(1.28)',
            duration: 0.05,
          },
          0.22,
        );
    }
    if (glitchShiftRef.value) {
      tl.to(
        glitchShiftRef.value,
        { xPercent: 18, opacity: 0.52, duration: 0.045 },
        0.14,
      )
        .to(
          glitchShiftRef.value,
          { xPercent: -10, opacity: 0.3, duration: 0.055 },
          0.185,
        )
        .to(
          glitchShiftRef.value,
          { xPercent: 22, opacity: 0.44, duration: 0.04 },
          0.24,
        );
    }
    if (snowSheetRef.value) {
      tl.fromTo(
        snowSheetRef.value,
        { yPercent: -12, xPercent: -4 },
        { yPercent: 14, xPercent: 4, duration: 0.16 },
        0.14,
      );
    }
    if (tearBandARef.value) {
      tl.fromTo(
        tearBandARef.value,
        { xPercent: -24, y: -42, opacity: 0.58 },
        { xPercent: 28, y: 48, opacity: 0.85, duration: 0.09 },
        0.14,
      ).to(
        tearBandARef.value,
        { xPercent: -16, y: 14, opacity: 0.4, duration: 0.07 },
        0.23,
      );
    }
    if (tearBandBRef.value) {
      tl.fromTo(
        tearBandBRef.value,
        { xPercent: 26, y: 52, opacity: 0.5 },
        { xPercent: -28, y: -38, opacity: 0.82, duration: 0.1 },
        0.14,
      ).to(
        tearBandBRef.value,
        { xPercent: 18, y: -10, opacity: 0.4, duration: 0.06 },
        0.24,
      );
    }
    if (tearBandCRef.value) {
      tl.to(
        tearBandCRef.value,
        { xPercent: 22, y: 24, opacity: 0.72, duration: 0.075 },
        0.14,
      ).to(
        tearBandCRef.value,
        { xPercent: -18, y: -48, opacity: 0.2, duration: 0.085 },
        0.215,
      );
    }
    if (halftoneRef.value) {
      tl.fromTo(
        halftoneRef.value,
        { rotation: 0, scale: 0.72, opacity: 0.14 },
        { rotation: 210, scale: 1.08, opacity: 0.42, duration: 0.16 },
        0.14,
      );
    }
    if (chibiShockRef.value) {
      tl.fromTo(
        chibiShockRef.value,
        { x: -16, y: 10, rotation: -12, scale: 0.76, opacity: 0 },
        { x: 6, y: -6, rotation: 8, scale: 1.08, opacity: 1, duration: 0.04 },
        0.155,
      )
        .to(
          chibiShockRef.value,
          { x: -4, y: 5, rotation: -6, scale: 1.04, duration: 0.035 },
          0.195,
        )
        .to(
          chibiShockRef.value,
          { x: -10, y: 0, rotation: -9, scale: 0.86, opacity: 0, duration: 0.04 },
          0.24,
        );
    }
    if (chibiLeekRef.value) {
      tl.fromTo(
        chibiLeekRef.value,
        { x: 16, y: 12, rotation: 14, scale: 0.74, opacity: 0 },
        { x: -6, y: -8, rotation: -10, scale: 1.07, opacity: 1, duration: 0.04 },
        0.165,
      )
        .to(
          chibiLeekRef.value,
          { x: 5, y: 6, rotation: 8, scale: 1.03, duration: 0.035 },
          0.205,
        )
        .to(
          chibiLeekRef.value,
          { x: 12, y: 0, rotation: 10, scale: 0.84, opacity: 0, duration: 0.04 },
          0.24,
        );
    }

    // -------------------------------------------------------------------------
    // Act 3 (0.25 -> 0.39): Dive INTO TV Screen + Noisy Signal-Lock of Section 2
    // -------------------------------------------------------------------------
    if (crtFrameRef.value) {
      tl.to(
        crtFrameRef.value,
        { scale: 2.55, duration: 0.09, ease: 'power2.inOut' },
        0.25,
      ).to(
        crtFrameRef.value,
        { opacity: 0, duration: 0.06, ease: 'power1.in' },
        0.28,
      );
    }
    if (crtGlareRef.value) {
      tl.to(
        crtGlareRef.value,
        { scale: 2.55, y: -66, opacity: 0, duration: 0.08, ease: 'power2.in' },
        0.25,
      );
    }
    if (staticSlotRef.value) {
      tl.to(
        staticSlotRef.value,
        { scale: 2.55, y: -66, duration: 0.075, ease: 'power2.in' },
        0.25,
      ).to(
        staticSlotRef.value,
        { opacity: 0, duration: 0.045, ease: 'power1.in' },
        0.26,
      );
    }

    if (tvRoomNoiseRef.value) {
      tl.to(
        tvRoomNoiseRef.value,
        { opacity: 0.65, duration: 0.035, ease: 'power1.out' },
        0.25,
      ).to(
        tvRoomNoiseRef.value,
        { opacity: 0, duration: 0.055, ease: 'power2.out' },
        0.34,
      );
    }
    if (tvRoomGrainRef.value) {
      tl.to(
        tvRoomGrainRef.value,
        { filter: 'hue-rotate(55deg)', duration: 0.09 },
        0.25,
      );
    }
    if (tvRoomTearRef.value) {
      tl.fromTo(
        tvRoomTearRef.value,
        { yPercent: -25, opacity: 0.8 },
        { yPercent: 115, opacity: 0, duration: 0.14 },
        0.25,
      );
    }

    if (aboutSlotRef.value) {
      tl.to(
        aboutSlotRef.value,
        { opacity: 1, duration: 0.025, ease: 'power1.out' },
        0.26,
      ).to(
        aboutSlotRef.value,
        { scale: 1, scaleX: 1, scaleY: 1, duration: 0.1, ease: 'power2.out' },
        0.26,
      );
    }

    // Staggered CRT signal-lock flicker for each of the 6 Section 2 blocks
    aboutBlocks.forEach((block, idx) => {
      const tStart = 0.275 + idx * 0.015;
      tl.to(
        block,
        {
          opacity: 0.84,
          x: idx % 2 === 0 ? -7 : 7,
          y: 4,
          scale: 0.99,
          filter:
            'drop-shadow(-3px 0 0 rgba(57,197,187,0.8)) drop-shadow(3px 0 0 rgba(225,40,133,0.8)) contrast(1.22)',
          duration: 0.014,
          ease: 'power1.out',
        },
        tStart,
      )
        .to(
          block,
          {
            opacity: 0.28,
            x: idx % 2 === 0 ? 4 : -4,
            duration: 0.01,
          },
          tStart + 0.014,
        )
        .to(
          block,
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: 'none',
            duration: 0.016,
            ease: 'power2.out',
          },
          tStart + 0.024,
        );
    });

    // -------------------------------------------------------------------------
    // Plateau (0.39 -> 0.48): Flat 1.0x Interactive AboutSection (#about at 0.437)
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Act 4 (0.48 -> 0.59): Live Section 2 Folds Seamlessly Into Paper Airplane
    // -------------------------------------------------------------------------
    if (origamiBackdropRef.value) {
      tl.to(
        origamiBackdropRef.value,
        { opacity: 1, duration: 0.055, ease: 'power1.out' },
        0.48,
      ).to(
        origamiBackdropRef.value,
        { opacity: 0.42, duration: 0.14, ease: 'power1.inOut' },
        0.62,
      ).to(
        origamiBackdropRef.value,
        { opacity: 0, duration: 0.07, ease: 'power1.in' },
        0.79,
      );
    }
    if (origamiStaffRef.value) {
      tl.fromTo(
        origamiStaffRef.value,
        { x: -45, y: 28, rotation: -6 },
        { x: 45, y: -26, rotation: -2, duration: 0.34 },
        0.48,
      );
    }
    if (origamiNotesRef.value) {
      tl.fromTo(
        origamiNotesRef.value,
        { x: -20, y: 36 },
        { x: 22, y: -34, duration: 0.34 },
        0.48,
      );
    }

    if (aboutSlotRef.value) {
      tl.to(
        aboutSlotRef.value,
        {
          scale: 0.8,
          scaleX: 0.8,
          scaleY: 0.8,
          rotateX: 16,
          y: -8,
          clipPath:
            'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%, 0% 0%)',
          duration: 0.04,
          ease: 'power2.inOut',
        },
        0.48,
      )
        .to(
          aboutSlotRef.value,
          {
            scale: 0.36,
            scaleX: 0.36,
            scaleY: 0.36,
            rotateX: 36,
            rotationZ: -14,
            clipPath:
              'polygon(50% 4%, 96% 48%, 62% 94%, 50% 70%, 38% 94%, 4% 48%)',
            duration: 0.058,
            ease: 'power2.inOut',
          },
          0.52,
        )
        .to(
          aboutSlotRef.value,
          {
            opacity: 0,
            duration: 0.03,
            ease: 'power1.in',
          },
          0.558,
        );
    }

    if (foldGuideRef.value) {
      tl.to(
        foldGuideRef.value,
        { opacity: 0.88, scale: 0.84, rotateX: 16, duration: 0.032 },
        0.485,
      ).to(
        foldGuideRef.value,
        { opacity: 0, scale: 0.44, rotateX: 30, duration: 0.032 },
        0.535,
      );
    }

    if (flyingPlaneRef.value) {
      tl.to(
        flyingPlaneRef.value,
        {
          opacity: 1,
          scale: 1.04,
          x: 0,
          y: 0,
          rotation: -14,
          duration: 0.03,
          ease: 'power2.out',
        },
        0.562,
      );
    }

    // -------------------------------------------------------------------------
    // Act 5 (0.575 -> 0.70): Takeoff Arc, Lip Alignment, Behind-Glass Entry & Seal
    // -------------------------------------------------------------------------
    if (bottleWrapRef.value) {
      tl.to(
        bottleWrapRef.value,
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 0.05,
          ease: 'power2.out',
        },
        0.575,
      );
    }

    if (flyingPlaneRef.value) {
      tl.to(
        flyingPlaneRef.value,
        {
          x: mouthX - 116,
          y: mouthY - 76,
          rotation: 16,
          scale: 0.72,
          duration: 0.024,
          ease: 'sine.inOut',
        },
        0.592,
      )
        .to(
          flyingPlaneRef.value,
          {
            x: mouthX - 4,
            y: mouthY - 78,
            rotation: 94,
            scale: 0.44,
            duration: 0.02,
            ease: 'sine.inOut',
          },
          0.616,
        )
        .to(
          flyingPlaneRef.value,
          { opacity: 0, duration: 0.001 },
          0.636,
        );
    }

    if (planeTrailRef.value) {
      tl.to(
        planeTrailRef.value,
        { opacity: 0, duration: 0.02, ease: 'power1.out' },
        0.614,
      );
    }

    if (entryPlanes.length) {
      tl.to(
        entryPlanes,
        { opacity: 1, duration: 0.001 },
        0.636,
      )
        .to(
          entryPlanes,
          {
            x: -2,
            y: 12,
            rotation: 98,
            scale: 0.43,
            duration: 0.018,
            ease: 'power1.in',
          },
          0.636,
        )
        .to(
          entryPlanes,
          {
            x: 0,
            y: 126,
            rotation: 90,
            scale: 0.46,
            duration: 0.02,
            ease: 'power1.out',
          },
          0.654,
        )
        .to(
          entryPlanes,
          { opacity: 0, duration: 0.006, ease: 'power1.out' },
          0.67,
        );
    }

    if (submergedPlaneRef.value) {
      tl.to(
        submergedPlaneRef.value,
        {
          opacity: 0.92,
          x: 0,
          y: -12,
          scale: 0.46,
          rotation: 64,
          duration: 0.011,
          ease: 'power1.out',
        },
        0.669,
      ).to(
        submergedPlaneRef.value,
        {
          y: 14,
          scale: 0.12,
          rotation: 22,
          opacity: 0,
          filter: 'blur(5px)',
          duration: 0.024,
          ease: 'power2.in',
        },
        0.68,
      );
    }

    if (dissolveSparkRef.value) {
      tl.to(
        dissolveSparkRef.value,
        { opacity: 0.95, scale: 1.15, duration: 0.012, ease: 'power2.out' },
        0.684,
      ).to(
        dissolveSparkRef.value,
        { opacity: 0, scale: 1.55, duration: 0.019, ease: 'power1.in' },
        0.696,
      );
    }

    if (splashRef.value) {
      tl.to(
        splashRef.value,
        { opacity: 0.96, scale: 1.12, duration: 0.018, ease: 'power2.out' },
        0.672,
      ).to(
        splashRef.value,
        { opacity: 0, scale: 1.48, duration: 0.025, ease: 'power1.in' },
        0.69,
      );
    }
    if (splashDropsRef.value) {
      tl.to(
        splashDropsRef.value,
        { opacity: 0.98, y: -12, scale: 1.06, duration: 0.019, ease: 'power2.out' },
        0.673,
      ).to(
        splashDropsRef.value,
        { opacity: 0, y: -22, scale: 1.24, duration: 0.018, ease: 'power1.in' },
        0.692,
      );
    }

    if (corkRef.value) {
      tl.to(
        corkRef.value,
        { x: 84, y: -70, rotation: 22, duration: 0.088, ease: 'sine.inOut' },
        0.58,
      )
        .to(
          corkRef.value,
          { x: 14, y: -38, rotation: 9, scale: 1, duration: 0.016, ease: 'power2.out' },
          0.67,
        )
        .to(
          corkRef.value,
          { y: 0, x: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.018, ease: 'bounce.out' },
          0.686,
        )
        .to(
          corkRef.value,
          {
            y: -380,
            x: 48,
            rotation: 84,
            scale: 1.08,
            opacity: 0,
            duration: 0.054,
            ease: 'power2.out',
          },
          0.788,
        );
    }

    if (waveBackRef.value) {
      tl.fromTo(
        waveBackRef.value,
        { x: -18 },
        { x: 20, duration: 0.21 },
        0.58,
      );
    }
    if (waveFrontRef.value) {
      tl.fromTo(
        waveFrontRef.value,
        { x: 18 },
        { x: -22, duration: 0.21 },
        0.58,
      );
    }

    // -------------------------------------------------------------------------
    // Act 6 (0.70 -> 0.79): Pressurized Shake, Fizz Build & Water Surface Impact
    // -------------------------------------------------------------------------
    if (waterLiquidRef.value) {
      tl.to(
        waterLiquidRef.value,
        { y: 6, scaleY: 0.96, duration: 0.014, ease: 'power1.out' },
        0.672,
      )
        .to(
          waterLiquidRef.value,
          { y: -3, scaleY: 1.02, duration: 0.014, ease: 'power1.out' },
          0.686,
        )
        .to(
          waterLiquidRef.value,
          { y: 0, scaleY: 1, duration: 0.005, ease: 'power1.inOut' },
          0.7,
        )
        .to(waterLiquidRef.value, { rotation: 7, x: 10, duration: 0.016 }, 0.705)
        .to(waterLiquidRef.value, { rotation: -8, x: -10, duration: 0.016 }, 0.721)
        .to(waterLiquidRef.value, { rotation: 6, x: 7, duration: 0.016 }, 0.737)
        .to(waterLiquidRef.value, { rotation: -5, x: -6, duration: 0.015 }, 0.753)
        .to(waterLiquidRef.value, { rotation: 2, x: 2, duration: 0.012 }, 0.768)
        .to(waterLiquidRef.value, { rotation: 0, x: 0, duration: 0.01 }, 0.78);
    }

    if (bottleWrapRef.value) {
      tl.to(bottleWrapRef.value, { rotation: -10, x: -14, duration: 0.015 }, 0.705)
        .to(bottleWrapRef.value, { rotation: 11, x: 14, duration: 0.015 }, 0.72)
        .to(bottleWrapRef.value, { rotation: -8, x: -10, duration: 0.015 }, 0.735)
        .to(bottleWrapRef.value, { rotation: 7, x: 9, duration: 0.015 }, 0.75)
        .to(bottleWrapRef.value, { rotation: -3, x: -4, duration: 0.013 }, 0.765)
        .to(bottleWrapRef.value, { rotation: 0, x: 0, duration: 0.01 }, 0.778)
        .to(
          bottleWrapRef.value,
          { scale: 1.08, y: 24, opacity: 0, duration: 0.028, ease: 'power1.in' },
          0.85,
        );
    }

    if (waterArtRef.value) {
      tl.to(waterArtRef.value, { rotation: 5, x: 8, scale: 1.08, duration: 0.015 }, 0.705)
        .to(waterArtRef.value, { rotation: -6, x: -8, duration: 0.015 }, 0.72)
        .to(waterArtRef.value, { rotation: 4, x: 5, duration: 0.015 }, 0.735)
        .to(waterArtRef.value, { rotation: -4, x: -5, duration: 0.015 }, 0.75)
        .to(waterArtRef.value, { rotation: 2, x: 2, duration: 0.013 }, 0.765)
        .to(waterArtRef.value, { rotation: 0, x: 0, scale: 1.04, duration: 0.01 }, 0.778);
    }

    if (fishChibiRef.value) {
      tl.to(fishChibiRef.value, { y: -12, rotation: -14, duration: 0.028 }, 0.705)
        .to(fishChibiRef.value, { y: 8, rotation: 12, duration: 0.028 }, 0.733)
        .to(fishChibiRef.value, { y: 0, rotation: 0, duration: 0.024 }, 0.761);
    }

    if (leekChibiRef.value) {
      tl.to(leekChibiRef.value, { y: 10, rotation: 16, duration: 0.028 }, 0.705)
        .to(leekChibiRef.value, { y: -10, rotation: -14, duration: 0.028 }, 0.733)
        .to(leekChibiRef.value, { y: 0, rotation: 0, duration: 0.024 }, 0.761);
    }

    if (staffRef.value) {
      tl.to(staffRef.value, { y: -10, rotation: 6, opacity: 0.95, duration: 0.04 }, 0.705)
        .to(staffRef.value, { y: 4, rotation: -4, opacity: 0.8, duration: 0.04 }, 0.745);
    }

    const fizzNodes = bottleFizzRef.value
      ? Array.from(
          bottleFizzRef.value.querySelectorAll<HTMLElement>('.fizz-bubble'),
        )
      : [];
    if (bottleFizzRef.value) {
      tl.to(bottleFizzRef.value, { opacity: 1, duration: 0.03 }, 0.705).to(
        bottleFizzRef.value,
        { opacity: 0, duration: 0.025 },
        0.845,
      );
    }
    fizzNodes.forEach((node, idx) => {
      const spec = BOTTLE_FIZZ_BUBBLES[idx];
      if (!spec) return;
      const startT = 0.705 + (idx % 5) * 0.008;
      tl.fromTo(
        node,
        { y: 0, x: 0, scale: 0.55, opacity: 0.35 },
        {
          y: spec.riseY,
          x: spec.driftX,
          scale: 1.25,
          opacity: 0.95,
          duration: 0.115,
          ease: 'power1.in',
        },
        startT,
      );
    });

    if (bottleFoamHeadRef.value) {
      tl.to(
        bottleFoamHeadRef.value,
        { opacity: 0.85, y: 0, scaleY: 0.72, duration: 0.04, ease: 'power1.out' },
        0.72,
      ).to(
        bottleFoamHeadRef.value,
        { opacity: 0.96, y: -28, scaleY: 1.18, duration: 0.045, ease: 'power1.in' },
        0.76,
      );
    }

    // -------------------------------------------------------------------------
    // Acts 7 -> 8 (0.79 -> 0.942): Cork Blast, Foam Geyser & Bubble Curtain -> Stage 3
    // -------------------------------------------------------------------------
    if (eruptionPlumeRef.value) {
      tl.to(
        eruptionPlumeRef.value,
        {
          opacity: 1,
          scaleY: 1.28,
          scaleX: 1.32,
          y: -74,
          duration: 0.032,
          ease: 'power2.out',
        },
        0.79,
      ).to(
        eruptionPlumeRef.value,
        {
          opacity: 0,
          scaleY: 1.45,
          scaleX: 1.62,
          y: -135,
          duration: 0.036,
          ease: 'power1.in',
        },
        0.822,
      );
    }

    if (foamCurtainRef.value) {
      tl.to(
        foamCurtainRef.value,
        { opacity: 1, duration: 0.015, ease: 'power1.out' },
        0.805,
      ).to(
        foamCurtainRef.value,
        { opacity: 0, duration: 0.016, ease: 'power1.in' },
        0.926,
      );
    }

    if (foamWaveBackRef.value) {
      tl.to(
        foamWaveBackRef.value,
        { yPercent: -8, xPercent: 3, duration: 0.068, ease: 'power1.out' },
        0.805,
      ).to(
        foamWaveBackRef.value,
        { yPercent: -118, xPercent: -2, opacity: 0, duration: 0.056, ease: 'power1.inOut' },
        0.882,
      );
    }
    if (foamWaveMidRef.value) {
      tl.to(
        foamWaveMidRef.value,
        { yPercent: -6, xPercent: -3, duration: 0.066, ease: 'power1.out' },
        0.81,
      ).to(
        foamWaveMidRef.value,
        { yPercent: -120, xPercent: 2, opacity: 0, duration: 0.056, ease: 'power1.inOut' },
        0.885,
      );
    }
    if (foamWaveFrontRef.value) {
      tl.to(
        foamWaveFrontRef.value,
        { yPercent: -4, xPercent: 2, duration: 0.065, ease: 'power1.out' },
        0.815,
      ).to(
        foamWaveFrontRef.value,
        { yPercent: -124, xPercent: -1, opacity: 0, duration: 0.056, ease: 'power1.inOut' },
        0.886,
      );
    }

    if (bubbleLayerFarRef.value) {
      tl.to(
        bubbleLayerFarRef.value,
        { opacity: 0.86, duration: 0.018 },
        0.808,
      )
        .to(
          bubbleLayerFarRef.value,
          { yPercent: -98, xPercent: 3, duration: 0.132, ease: 'none' },
          0.808,
        )
        .to(
          bubbleLayerFarRef.value,
          { opacity: 0, duration: 0.032 },
          0.908,
        );
    }
    if (bubbleLayerMidRef.value) {
      tl.to(
        bubbleLayerMidRef.value,
        { opacity: 0.96, duration: 0.018 },
        0.81,
      )
        .to(
          bubbleLayerMidRef.value,
          { yPercent: -112, xPercent: -4, duration: 0.13, ease: 'none' },
          0.81,
        )
        .to(
          bubbleLayerMidRef.value,
          { opacity: 0, duration: 0.03 },
          0.91,
        );
    }
    if (bubbleLayerNearRef.value) {
      tl.to(
        bubbleLayerNearRef.value,
        { opacity: 1, duration: 0.018 },
        0.812,
      )
        .to(
          bubbleLayerNearRef.value,
          { yPercent: -128, xPercent: 4, duration: 0.128, ease: 'none' },
          0.812,
        )
        .to(
          bubbleLayerNearRef.value,
          { opacity: 0, duration: 0.028 },
          0.912,
        );
    }

    if (projectsSlotRef.value) {
      tl.to(
        projectsSlotRef.value,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.062,
          ease: 'power2.out',
        },
        0.868,
      );
    }

    // Exact 1.0 timeline anchor so ScrollTrigger progress maps 1:1 to timeline time
    tl.to({}, { duration: 0.001 }, 0.999);
  });
});

onBeforeUnmount(() => {
  mm?.revert();
  mm = null;
});
</script>

<template>
  <div ref="runwayRef" class="story-runway">
    <div id="hero" class="story-anchor story-anchor--hero" aria-hidden="true" />
    <div id="about" class="story-anchor story-anchor--about" aria-hidden="true" />
    <div id="projects" class="story-anchor story-anchor--projects" aria-hidden="true" />

    <div class="story-sticky">
      <!-- =====================================================================
           STUDIO BACKDROP A: Grounded Miku TV Studio Atmosphere (Acts 1 -> 2)
           ================================================================== -->
      <div ref="tvStudioRef" class="tv-studio-backdrop" aria-hidden="true">
        <div class="tv-studio-glow" />
        <span class="tv-studio-watermark mono">MIKU-TV // 39</span>
        <img
          ref="tvStudioHalftoneRef"
          :src="halftoneRingUrl"
          alt=""
          class="tv-studio-halftone"
        />
        <img
          ref="tvStudioStaffRef"
          :src="staffWaveUrl"
          alt=""
          class="tv-studio-staff"
        />
        <img
          ref="tvStudioNotesRef"
          :src="notesSwarmUrl"
          alt=""
          class="tv-studio-notes"
        />

        <div class="tv-studio-eq tv-studio-eq--left">
          <span v-for="i in 6" :key="`eql-${i}`" class="eq-bar" />
        </div>
        <div class="tv-studio-eq tv-studio-eq--right">
          <span v-for="i in 6" :key="`eqr-${i}`" class="eq-bar" />
        </div>

        <div class="tv-studio-shelf" />
      </div>

      <!-- =====================================================================
           LAYER GROUP A: Retro-Cute Miku CRT TV & SMPTE Static (Acts 1 -> 3)
           ================================================================== -->
      <div ref="crtFrameRef" class="crt-casing" aria-hidden="true">
        <div class="crt-housing">
          <div class="crt-top-grip" />

          <!-- Twin Miku Rabbit-Ear Antennas with 01 Hair-Tie Plate -->
          <div class="crt-antennas-wrap">
            <svg
              class="crt-antennas"
              viewBox="0 0 240 82"
              width="240"
              height="82"
              fill="none"
            >
              <path
                d="M100 72 L42 15"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
              />
              <path
                d="M140 72 L198 15"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
              />
              <circle cx="88" cy="60" r="5" class="antenna-cuff antenna-cuff--teal" />
              <circle cx="152" cy="60" r="5" class="antenna-cuff antenna-cuff--magenta" />
              <rect x="82" y="64" width="76" height="16" rx="8" class="antenna-base" />
              <text x="120" y="75.5" text-anchor="middle" class="antenna-plate mono">
                01
              </text>
              <circle cx="40" cy="13" r="8" class="antenna-orb antenna-orb--teal" />
              <circle cx="200" cy="13" r="8" class="antenna-orb antenna-orb--magenta" />
            </svg>
          </div>

          <!-- Sculpted Inner Tube Bezel & Strict Window -->
          <div class="crt-bezel-recess">
            <div class="crt-window" />
          </div>

          <!-- Tactile Lower Control Chin: LED + Stripes + Speaker Grille + Rotary Dials + Corner Chibi Sticker -->
          <div class="crt-chin">
            <div class="crt-chin__left">
              <span
                class="crt-led"
                :class="{ 'is-tuning': tvChannel === 'NO SIGNAL' }"
              />
              <span class="crt-brand mono">MIKU-TV // {{ tvChannel }}</span>
              <span class="crt-stripe-bar">
                <i class="stripe-teal" />
                <i class="stripe-magenta" />
              </span>
            </div>

            <div class="crt-vents" :data-signal-bars="Math.round(tvSignalProgress * 8)">
              <span
                v-for="v in 8"
                :key="v"
                class="crt-vent"
                :class="{ 'is-lit': getVentFill(v) > 0.15 }"
              >
                <i
                  class="crt-vent__fill"
                  :style="{ transform: `scaleY(${getVentFill(v)})` }"
                />
              </span>
            </div>

            <div class="crt-dials">
              <span class="crt-power-btn" />
              <span class="crt-dial" />
              <span
                class="crt-dial crt-dial--accent"
                :style="{ transform: `rotate(${dialAngle}deg)` }"
              />
            </div>

            <img
              :src="leekStickerUrl"
              alt=""
              class="crt-corner-sticker"
            />
          </div>

          <!-- Sculpted Base Stand -->
          <div class="crt-stand-wrap">
            <div class="crt-stand-neck" />
            <div class="crt-stand-foot" />
            <span class="crt-caption mono">
              {{
                tvChannel === 'NO SIGNAL'
                  ? 'SWITCHING CHANNEL // CH-39 → CH-02'
                  : tvChannel === 'CH-02'
                    ? 'DIVING INTO CH-02 // SIGNAL LOCK'
                    : 'LIVE 3D FEED // SCROLL TO SWITCH CHANNEL'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Live Hero Showcase Slot -->
      <div
        ref="heroSlotRef"
        class="story-slot story-slot--hero"
        :class="{ 'is-interactive': heroInteractive }"
      >
        <slot name="hero" />
      </div>

      <!-- Curved CRT Glass Reflection -->
      <div ref="crtGlareRef" class="crt-screen-glare" aria-hidden="true" />

      <!-- CRT Dynamic Glitch Overlay (Strictly Clipped Inside Screen Window, Textless) -->
      <div ref="staticSlotRef" class="crt-static-layer" aria-hidden="true">
        <div ref="glitchChromaRef" class="crt-glitch-chroma" />
        <div ref="glitchShiftRef" class="crt-glitch-shift" />

        <div ref="snowSheetRef" class="crt-snow-sheet" />
        <div ref="tearBandARef" class="crt-tear-band crt-tear-band--a" />
        <div ref="tearBandBRef" class="crt-tear-band crt-tear-band--b" />
        <div ref="tearBandCRef" class="crt-tear-band crt-tear-band--c" />

        <img
          ref="halftoneRef"
          :src="halftoneRingUrl"
          alt=""
          class="crt-halftone-ring"
        />

        <div class="crt-static-stage">
          <img
            ref="chibiShockRef"
            :src="shockStickerUrl"
            alt=""
            class="static-chibi static-chibi--left"
          />

          <img
            ref="chibiLeekRef"
            :src="leekStickerUrl"
            alt=""
            class="static-chibi static-chibi--right"
          />
        </div>
      </div>

      <!-- Full-Viewport CRT Noise Veil During Section 2 Signal-Lock Reveal -->
      <div ref="tvRoomNoiseRef" class="tv-room-noise" aria-hidden="true">
        <div ref="tvRoomGrainRef" class="tv-room-noise__grain" />
        <div class="tv-room-noise__scanlines" />
        <div ref="tvRoomTearRef" class="tv-room-noise__tear" />
      </div>

      <!-- =====================================================================
           STUDIO BACKDROP B: Origami Wind-Trail & Blueprint Aura (Acts 4 -> 6)
           ================================================================== -->
      <div ref="origamiBackdropRef" class="origami-backdrop" aria-hidden="true">
        <div class="origami-aurora" />
        <span class="origami-watermark mono">02 → 39 // ORIGAMI WIND</span>
        <svg class="origami-compass" viewBox="0 0 800 500" fill="none">
          <circle cx="400" cy="250" r="190" class="compass-ring" />
          <circle cx="400" cy="250" r="265" class="compass-ring compass-ring--dashed" />
          <path
            d="M70 390 Q 320 260 400 240 T 740 90"
            class="compass-arc"
          />
        </svg>
        <img
          ref="origamiStaffRef"
          :src="staffWaveUrl"
          alt=""
          class="origami-wind-staff"
        />
        <img
          ref="origamiNotesRef"
          :src="notesSwarmUrl"
          alt=""
          class="origami-wind-notes"
        />
      </div>

      <!-- =====================================================================
           LAYER GROUP B: Live AboutSection + Subtle Crease Lines (Acts 3 -> 4)
           ================================================================== -->
      <div
        ref="aboutSlotRef"
        class="story-slot story-slot--about"
        :class="{ 'is-interactive': aboutInteractive }"
      >
        <slot name="about" />
      </div>

      <!-- Delicate Transparent Crease Diagram Over Real Folding AboutSection -->
      <div ref="foldGuideRef" class="fold-guide-overlay" aria-hidden="true">
        <div class="fold-guide-sheet">
          <span class="crease-spine" />
          <span class="crease-diag crease-diag--tl" />
          <span class="crease-diag crease-diag--tr" />
          <span class="crease-badge mono">02 → 39 // ORIGAMI FOLD</span>
        </div>
      </div>

      <!-- =====================================================================
           LAYER GROUP C: Slender Wishing Drift Bottle + Airplane + Unfold (Acts 5 -> 8)
           ================================================================== -->
      <div ref="bottleWrapRef" class="bottle-assembly-wrap" aria-hidden="true">
        <div class="bottle-outer-aura" />
        <div class="bottle-assembly">
          <div class="bottle-neck-group">
            <div ref="corkRef" class="bottle-cork" />
            <div ref="eruptionPlumeRef" class="bottle-eruption-plume">
              <svg
                class="plume-svg"
                viewBox="0 0 240 220"
                width="230"
                height="210"
                fill="none"
              >
                <defs>
                  <linearGradient id="mikuPlumeRibbon" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" class="plume-stop-base" />
                    <stop offset="58%" class="plume-stop-mid" />
                    <stop offset="100%" class="plume-stop-tip" />
                  </linearGradient>
                </defs>
                <!-- Arching anime water ribbons spraying upward from bottle neck -->
                <path
                  d="M110 212 C 102 154, 72 104, 34 68 C 58 88, 86 132, 108 192 Z"
                  fill="url(#mikuPlumeRibbon)"
                  class="plume-stream"
                />
                <path
                  d="M104 212 C 108 142, 110 74, 120 22 C 130 74, 132 142, 136 212 Z"
                  fill="url(#mikuPlumeRibbon)"
                  class="plume-stream"
                />
                <path
                  d="M130 212 C 138 150, 168 98, 208 64 C 182 86, 152 132, 132 192 Z"
                  fill="url(#mikuPlumeRibbon)"
                  class="plume-stream"
                />
                <!-- Crisp anime highlight core streaks -->
                <path d="M120 198 C 120 144, 120 96, 120 42" class="plume-stream-hi" />
                <path d="M106 196 C 92 150, 74 114, 48 84" class="plume-stream-hi" />
                <path d="M134 196 C 148 150, 168 112, 194 80" class="plume-stream-hi" />
                <!-- 24 varied cel-shaded sparkling burst bubbles -->
                <g v-for="b in GEYSER_BUBBLES" :key="b.id">
                  <circle
                    :cx="b.cx"
                    :cy="b.cy"
                    :r="b.r"
                    class="plume-bub"
                    :class="{ 'plume-bub--pink': b.pink }"
                  />
                  <circle
                    :cx="b.cx - b.r * 0.34"
                    :cy="b.cy - b.r * 0.34"
                    :r="Math.max(1.1, b.r * 0.28)"
                    class="plume-bub-glint"
                  />
                </g>
                <!-- 4 crisp anime water-glint stars -->
                <path
                  d="M66 36 L68.5 43.5 L76 46 L68.5 48.5 L66 56 L63.5 48.5 L56 46 L63.5 43.5 Z"
                  class="plume-star"
                />
                <path
                  d="M174 30 L176.8 39 L186 42 L176.8 45 L174 54 L171.2 45 L162 42 L171.2 39 Z"
                  class="plume-star plume-star--pink"
                />
                <path
                  d="M120 6 L122.2 12.8 L129 15 L122.2 17.2 L120 24 L117.8 17.2 L111 15 L117.8 12.8 Z"
                  class="plume-star"
                />
                <path
                  d="M210 92 L212 98 L218 100 L212 102 L210 108 L208 102 L202 100 L208 98 Z"
                  class="plume-star"
                />
              </svg>
            </div>
            <!-- Above-lip foreground portal pinned to exact lip centerline (top 39px) for zero-seam handoff into neck chute -->
            <div class="bottle-air-portal">
              <div ref="airEntryPlaneRef" class="air-entry-plane">
                <svg viewBox="0 0 210 130" width="188" height="116" fill="none">
                  <polygon points="196,24 38,54 100,72" class="plane-wing-top" />
                  <polygon points="196,24 100,72 92,108" class="plane-fold-dark" />
                  <polygon points="196,24 92,108 144,86" class="plane-wing-low" />
                  <path d="M196 24 L 100 72 L 50 53" class="plane-stripe-teal" />
                  <path d="M196 24 L 144 86" class="plane-stripe-magenta" />
                  <text x="108" y="58" class="plane-mark mono">39</text>
                </svg>
              </div>
            </div>
            <div class="bottle-lip" />
            <div class="bottle-neck" />

            <!-- Clipped inner neck chute so the paper airplane passes behind lip & ribbon -->
            <div class="bottle-neck-chute">
              <div ref="neckPlaneRef" class="neck-entry-plane">
                <svg viewBox="0 0 210 130" width="188" height="116" fill="none">
                  <polygon points="196,24 38,54 100,72" class="plane-wing-top" />
                  <polygon points="196,24 100,72 92,108" class="plane-fold-dark" />
                  <polygon points="196,24 92,108 144,86" class="plane-wing-low" />
                  <path d="M196 24 L 100 72 L 50 53" class="plane-stripe-teal" />
                  <path d="M196 24 L 144 86" class="plane-stripe-magenta" />
                  <text x="108" y="58" class="plane-mark mono">39</text>
                </svg>
              </div>
            </div>

            <svg
              class="bottle-ribbon"
              viewBox="0 0 128 52"
              width="128"
              height="52"
              fill="none"
            >
              <path
                d="M12 11 C32 3 48 15 62 21 C48 27 32 36 12 27 Z"
                class="ribbon-fill"
              />
              <path
                d="M116 11 C96 3 80 15 66 21 C80 27 96 36 116 27 Z"
                class="ribbon-fill"
              />
              <path d="M56 26 L34 50 L49 50 L61 28 Z" class="ribbon-tail" />
              <path d="M72 26 L94 50 L79 50 L67 28 Z" class="ribbon-tail" />
              <circle cx="64" cy="21" r="7.5" class="ribbon-knot" />
            </svg>
          </div>

          <div class="bottle-belly">
            <span class="bottle-shoulder-glint" />

            <div class="bottle-water-clip">
              <img
                ref="waterArtRef"
                :src="waterBgUrl"
                alt=""
                class="water-bg-art"
              />

              <div ref="waterLiquidRef" class="water-liquid-layer">
                <svg
                  ref="waveBackRef"
                  class="water-wave water-wave--back"
                  viewBox="0 0 400 44"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 24 Q 50 6 100 22 T 200 20 T 300 22 T 400 18 L 400 44 L 0 44 Z"
                    class="wave-path-back"
                  />
                </svg>
                <svg
                  ref="waveFrontRef"
                  class="water-wave water-wave--front"
                  viewBox="0 0 400 44"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 20 Q 50 36 100 18 T 200 22 T 300 16 T 400 22 L 400 44 L 0 44 Z"
                    class="wave-path-front"
                  />
                </svg>
                <div class="water-volume-fill" />
              </div>

              <img
                ref="staffRef"
                :src="staffNotesUrl"
                alt=""
                class="bottle-float-staff"
              />
              <img
                ref="fishChibiRef"
                :src="fishStickerUrl"
                alt=""
                class="bottle-chibi bottle-chibi--fish"
              />
              <img
                ref="leekChibiRef"
                :src="leekStickerUrl"
                alt=""
                class="bottle-chibi bottle-chibi--leek"
              />

              <div ref="bottleFizzRef" class="bottle-fizz-layer">
                <span
                  v-for="b in BOTTLE_FIZZ_BUBBLES"
                  :key="b.id"
                  class="fizz-bubble"
                  :style="{
                    left: `${b.left}%`,
                    bottom: `${b.bottom}%`,
                    width: `${b.size}px`,
                    height: `${b.size}px`,
                  }"
                />
              </div>

              <div ref="bottleFoamHeadRef" class="bottle-foam-head">
                <svg
                  class="bottle-foam-svg"
                  viewBox="0 0 340 96"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0 78 C 8 56, 20 52, 28 64 C 36 42, 52 40, 62 56 C 72 34, 88 34, 98 52 C 110 28, 128 30, 140 50 C 152 24, 172 26, 184 48 C 196 28, 214 30, 226 50 C 238 34, 256 36, 266 54 C 278 38, 296 42, 306 58 C 316 48, 330 52, 340 68 L 340 96 L 0 96 Z"
                    class="lace-shadow"
                  />
                  <path
                    d="M0 78 Q 7 64 15 70 Q 22 52 33 62 Q 40 48 49 60 Q 56 44 67 56 Q 76 38 87 54 Q 96 42 106 56 Q 116 36 128 52 Q 137 40 147 55 Q 158 34 170 50 Q 180 38 190 54 Q 202 36 213 52 Q 223 42 233 56 Q 244 38 255 54 Q 266 44 276 58 Q 286 46 297 60 Q 307 52 317 64 Q 328 56 340 72 L 340 96 L 0 96 Z"
                    class="lace-front"
                  />
                  <g v-for="b in LACE_MICRO_BUBBLES" :key="b.id">
                    <circle
                      :cx="b.cx"
                      :cy="b.cy"
                      :r="b.r"
                      class="lace-bub"
                      :class="{ 'lace-bub--pink': b.pink }"
                    />
                    <circle
                      :cx="b.cx - b.r * 0.32"
                      :cy="b.cy - b.r * 0.32"
                      :r="Math.max(0.8, b.r * 0.28)"
                      class="lace-bub-glint"
                    />
                  </g>
                </svg>
              </div>

              <div ref="splashRef" class="water-splash-rig">
                <span class="splash-ripple splash-ripple--outer" />
                <span class="splash-ripple splash-ripple--inner" />
                <svg
                  class="splash-crown-svg"
                  viewBox="0 0 220 96"
                  width="196"
                  height="86"
                  fill="none"
                >
                  <defs>
                    <linearGradient
                      id="mikuSplashCrownGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" class="crown-stop-top" />
                      <stop offset="56%" class="crown-stop-mid" />
                      <stop offset="100%" class="crown-stop-bot" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M24 68 Q 38 42 54 56 Q 68 24 84 48 Q 98 16 110 42 Q 124 14 140 46 Q 156 26 170 54 Q 186 42 198 68 C 178 78 144 82 110 82 C 76 82 44 78 24 68 Z"
                    fill="url(#mikuSplashCrownGrad)"
                  />
                  <path
                    d="M46 66 Q 74 44 110 52 Q 148 44 176 66"
                    class="splash-crown-crest"
                  />
                </svg>
              </div>

              <div ref="splashDropsRef" class="splash-drops-group">
                <span class="splash-drop splash-drop--1" />
                <span class="splash-drop splash-drop--2" />
                <span class="splash-drop splash-drop--3" />
                <span class="splash-drop splash-drop--4" />
                <span class="splash-drop splash-drop--5" />
                <span class="splash-drop splash-drop--6" />
                <span class="splash-drop splash-drop--7" />
                <span class="splash-drop splash-drop--8" />
              </div>

              <div ref="dissolveSparkRef" class="plane-dissolve-spark">
                <span class="spark-orb spark-orb--a" />
                <span class="spark-orb spark-orb--b" />
                <span class="spark-orb spark-orb--c" />
                <span class="spark-orb spark-orb--d" />
                <span class="spark-orb spark-orb--e" />
              </div>

              <div ref="submergedPlaneRef" class="submerged-plane">
                <svg viewBox="0 0 160 110" width="136" height="94" fill="none">
                  <polygon points="148,18 14,52 68,66" class="plane-wing-top" />
                  <polygon points="148,18 68,66 64,96" class="plane-fold-dark" />
                  <polygon points="148,18 64,96 102,74" class="plane-wing-low" />
                  <path d="M148 18 L 68 66 L 26 50" class="plane-stripe-teal" />
                  <path d="M148 18 L 102 74" class="plane-stripe-magenta" />
                  <text x="72" y="53" class="plane-mark mono">39</text>
                </svg>
              </div>
            </div>

            <span class="bottle-specular bottle-specular--left" />
            <span class="bottle-specular bottle-specular--right" />

            <svg
              class="bottle-star bottle-star--one"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6Z" />
            </svg>
            <svg
              class="bottle-star bottle-star--two"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="currentColor"
            >
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6Z" />
            </svg>
          </div>

          <div class="bottle-base-rim" />
          <div class="bottle-floor-shadow" />
          <div class="bottle-status-pill mono">
            <span class="bottle-status-dot" />
            <span>{{ bottleLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Flying Miku Origami Paper Airplane -->
      <div ref="flyingPlaneRef" class="flying-plane-layer" aria-hidden="true">
        <svg viewBox="0 0 210 130" width="188" height="116" fill="none">
          <path
            ref="planeTrailRef"
            d="M12 88 Q 48 92 78 72"
            stroke="rgba(57, 197, 187, 0.55)"
            stroke-width="2.5"
            stroke-dasharray="5 5"
            stroke-linecap="round"
          />
          <polygon points="196,24 38,54 100,72" class="plane-wing-top" />
          <polygon points="196,24 100,72 92,108" class="plane-fold-dark" />
          <polygon points="196,24 92,108 144,86" class="plane-wing-low" />
          <path d="M196 24 L 100 72 L 50 53" class="plane-stripe-teal" />
          <path d="M196 24 L 144 86" class="plane-stripe-magenta" />
          <text x="108" y="58" class="plane-mark mono">39</text>
        </svg>
      </div>

      <!-- Live Interactive Project Wall -->
      <div
        ref="projectsSlotRef"
        class="story-slot story-slot--projects"
        :class="{ 'is-interactive': projectsInteractive }"
      >
        <slot name="projects" />
      </div>

      <!-- Full-Viewport Anime OP Cel-Shaded Seafoam & Bubble-Cluster Curtain (Acts 7 -> 8) -->
      <div ref="foamCurtainRef" class="foam-curtain-layer" aria-hidden="true">
        <div ref="bubbleLayerFarRef" class="curtain-bubble-layer curtain-bubble-layer--far">
          <span
            v-for="b in farCurtainBubbles"
            :key="b.id"
            class="curtain-bubble"
            :class="`curtain-bubble--${b.tint}`"
            :style="{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
            }"
          />
        </div>

        <div ref="foamWaveBackRef" class="foam-wave-band foam-wave-band--back">
          <svg
            class="foam-wave-svg"
            viewBox="0 0 1440 820"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="mikuFoamGradBack" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" class="foam-stop-back-top" />
                <stop offset="36%" class="foam-stop-back-mid" />
                <stop offset="100%" class="foam-stop-back-bot" />
              </linearGradient>
            </defs>
            <path
              d="M0 124 C 95 54, 185 152, 295 96 C 405 40, 505 148, 625 88 C 745 28, 845 142, 965 88 C 1085 34, 1185 144, 1300 84 C 1365 50, 1405 98, 1440 76 L 1440 820 L 0 820 Z"
              fill="url(#mikuFoamGradBack)"
            />
            <polygon points="140,120 340,100 180,820 -20,820" class="foam-caustic" />
            <polygon points="860,84 1080,84 820,820 600,820" class="foam-caustic" />
            <!-- Soft aqua shadow underneath crest -->
            <path
              d="M0 124 C 55 82, 108 112, 154 94 C 212 68, 254 118, 304 94 C 362 64, 412 114, 466 90 C 526 62, 576 112, 632 88 C 692 60, 742 110, 800 86 C 858 60, 914 114, 972 88 C 1030 62, 1086 114, 1144 86 C 1204 58, 1258 108, 1316 82 C 1368 58, 1408 94, 1440 76 L 1440 132 C 1384 110, 1330 144, 1266 118 C 1196 144, 1128 110, 1054 134 C 986 110, 912 146, 842 118 C 774 142, 704 108, 632 132 C 562 108, 492 142, 422 118 C 352 142, 276 112, 206 138 C 136 114, 68 148, 0 134 Z"
              class="foam-crest-shadow"
            />
            <!-- Irregular cel-shaded seafoam lace along back wave -->
            <path
              d="M0 120 Q 18 96 38 112 Q 56 82 82 104 Q 108 72 138 98 Q 168 120 198 92 Q 228 64 260 92 Q 290 118 320 90 Q 354 62 386 88 Q 418 114 448 86 Q 480 58 514 86 Q 546 112 578 82 Q 612 54 646 84 Q 680 112 712 82 Q 748 52 782 82 Q 814 112 848 84 Q 882 56 916 84 Q 950 114 982 84 Q 1018 54 1052 84 Q 1086 112 1118 82 Q 1152 54 1188 82 Q 1222 110 1256 80 Q 1292 52 1326 80 Q 1360 106 1392 78 Q 1418 62 1440 74 L 1440 106 Q 1398 114 1356 98 Q 1308 118 1262 98 Q 1212 116 1164 98 Q 1116 118 1066 98 Q 1016 116 968 98 Q 918 120 868 98 Q 818 116 768 98 Q 718 118 668 98 Q 616 116 566 98 Q 514 118 464 98 Q 414 116 362 98 Q 312 120 262 100 Q 210 120 158 102 Q 106 126 52 108 Q 24 124 0 126 Z"
              class="foam-crest-white"
            />
          </svg>
        </div>

        <div ref="bubbleLayerMidRef" class="curtain-bubble-layer curtain-bubble-layer--mid">
          <span
            v-for="b in midCurtainBubbles"
            :key="b.id"
            class="curtain-bubble"
            :class="`curtain-bubble--${b.tint}`"
            :style="{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
            }"
          />
          <svg
            v-for="s in SPARKLE_STARS"
            :key="`star-${s.id}`"
            class="curtain-sparkle"
            :class="{ 'curtain-sparkle--pink': s.pink }"
            viewBox="0 0 24 24"
            :style="{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
            }"
            fill="currentColor"
          >
            <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5Z" />
          </svg>
        </div>

        <div ref="foamWaveMidRef" class="foam-wave-band foam-wave-band--mid">
          <svg
            class="foam-wave-svg"
            viewBox="0 0 1440 820"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="mikuFoamGradMid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" class="foam-stop-mid-top" />
                <stop offset="28%" class="foam-stop-mid-mid" />
                <stop offset="100%" class="foam-stop-mid-bot" />
              </linearGradient>
            </defs>
            <path
              d="M0 98 C 110 34, 210 142, 330 82 C 445 24, 545 140, 670 76 C 790 18, 895 142, 1020 80 C 1140 20, 1255 134, 1375 72 C 1410 54, 1428 76, 1440 66 L 1440 820 L 0 820 Z"
              fill="url(#mikuFoamGradMid)"
            />
            <polygon points="480,68 700,68 410,820 190,820" class="foam-caustic" />
            <polygon points="1160,64 1340,64 1090,820 910,820" class="foam-caustic" />
            <path
              d="M0 96 Q 28 66 56 88 Q 84 54 118 82 Q 146 106 178 78 Q 210 50 246 82 Q 282 108 314 78 Q 348 48 386 78 Q 422 104 456 76 Q 492 44 530 74 Q 566 102 602 74 Q 638 42 674 72 Q 712 102 748 72 Q 786 42 824 72 Q 860 100 896 72 Q 934 40 972 72 Q 1008 100 1044 74 Q 1082 42 1120 74 Q 1158 104 1196 72 Q 1234 40 1272 70 Q 1310 98 1346 68 Q 1384 42 1416 66 L 1440 64 L 1440 112 Q 1386 122 1330 96 Q 1272 124 1212 96 Q 1152 122 1092 94 Q 1030 122 970 94 Q 908 122 848 94 Q 786 122 724 94 Q 662 122 602 94 Q 540 124 478 96 Q 418 122 356 96 Q 296 124 234 98 Q 174 124 114 100 Q 56 124 0 112 Z"
              class="foam-crest-shadow"
            />
            <path
              d="M0 92 Q 16 74 34 86 Q 54 58 78 78 Q 104 48 132 72 Q 160 94 188 68 Q 218 42 250 70 Q 280 94 312 68 Q 346 40 378 68 Q 410 92 442 66 Q 476 38 510 64 Q 544 90 578 64 Q 612 36 648 64 Q 682 92 716 64 Q 752 36 786 64 Q 820 90 854 64 Q 890 36 924 64 Q 958 92 992 66 Q 1026 38 1062 66 Q 1096 92 1130 64 Q 1166 36 1200 64 Q 1234 90 1268 62 Q 1304 36 1340 62 Q 1374 86 1406 58 Q 1424 48 1440 60 L 1440 88 Q 1392 94 1346 78 Q 1298 96 1250 78 Q 1202 94 1154 78 Q 1106 96 1058 78 Q 1010 94 962 78 Q 912 96 864 78 Q 814 94 766 78 Q 716 96 668 78 Q 618 94 568 78 Q 518 96 470 78 Q 420 94 370 78 Q 320 96 270 80 Q 220 98 168 82 Q 116 102 64 84 Q 30 98 0 98 Z"
              class="foam-crest-white"
            />
          </svg>
        </div>

        <div ref="foamWaveFrontRef" class="foam-wave-band foam-wave-band--front">
          <svg
            class="foam-wave-svg"
            viewBox="0 0 1440 820"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="mikuFoamGradFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" class="foam-stop-front-top" />
                <stop offset="20%" class="foam-stop-front-mid" />
                <stop offset="56%" class="foam-stop-front-mid2" />
                <stop offset="100%" class="foam-stop-front-bot" />
              </linearGradient>
            </defs>
            <path
              d="M0 84 C 115 18, 220 128, 345 64 C 460 12, 565 126, 690 62 C 810 10, 920 128, 1045 64 C 1165 12, 1275 118, 1390 56 C 1418 42, 1430 62, 1440 54 L 1440 820 L 0 820 Z"
              fill="url(#mikuFoamGradFront)"
            />
            <!-- Crisp cel-shaded anime frothy lace crest + detached droplets along peak ridges -->
            <path
              d="M0 84 Q 24 54 52 74 Q 82 40 116 68 Q 148 92 180 62 Q 216 32 252 62 Q 288 88 320 58 Q 356 26 394 58 Q 430 86 464 56 Q 502 24 540 56 Q 576 84 612 54 Q 650 22 688 54 Q 724 84 762 54 Q 800 22 838 54 Q 876 82 912 54 Q 950 22 988 54 Q 1026 84 1062 56 Q 1100 26 1138 56 Q 1176 84 1212 54 Q 1250 24 1288 52 Q 1326 80 1364 50 Q 1400 28 1440 52 L 1440 94 Q 1378 106 1318 76 Q 1254 108 1192 76 Q 1130 106 1068 76 Q 1004 108 942 76 Q 878 106 816 76 Q 752 108 688 76 Q 624 106 560 76 Q 496 108 434 76 Q 370 106 306 78 Q 242 108 178 80 Q 114 110 52 86 Z"
              class="foam-crest-shadow"
            />
            <path
              d="M0 80 Q 14 60 32 72 Q 52 42 76 62 Q 102 32 132 56 Q 158 76 186 52 Q 216 24 248 52 Q 280 78 310 50 Q 344 22 378 48 Q 410 74 442 46 Q 476 20 512 46 Q 546 72 580 46 Q 614 18 650 46 Q 684 72 720 46 Q 754 18 790 46 Q 824 72 860 46 Q 894 20 930 46 Q 964 74 998 48 Q 1034 22 1068 48 Q 1104 74 1138 46 Q 1174 20 1208 46 Q 1244 72 1278 44 Q 1314 18 1350 44 Q 1384 68 1416 42 L 1440 48 L 1440 74 Q 1392 84 1344 66 Q 1294 86 1246 66 Q 1196 86 1148 66 Q 1098 86 1048 66 Q 1000 86 950 66 Q 900 86 850 66 Q 800 86 750 66 Q 700 86 650 66 Q 598 86 548 66 Q 498 86 448 66 Q 396 86 346 66 Q 294 86 244 68 Q 192 88 140 70 Q 86 90 36 72 Z"
              class="foam-crest-white foam-crest-white--crisp"
            />
            <!-- Detached foaming spray droplets arcing above front crest -->
            <circle cx="96" cy="24" r="6" class="foam-crest-drop" />
            <circle cx="152" cy="18" r="4" class="foam-crest-drop" />
            <circle cx="238" cy="16" r="7" class="foam-crest-drop" />
            <circle cx="364" cy="14" r="5" class="foam-crest-drop" />
            <circle cx="496" cy="12" r="6.5" class="foam-crest-drop" />
            <circle cx="642" cy="10" r="5" class="foam-crest-drop" />
            <circle cx="778" cy="12" r="7" class="foam-crest-drop" />
            <circle cx="918" cy="14" r="4.5" class="foam-crest-drop" />
            <circle cx="1058" cy="16" r="6.5" class="foam-crest-drop" />
            <circle cx="1202" cy="14" r="5.5" class="foam-crest-drop" />
            <circle cx="1338" cy="12" r="6" class="foam-crest-drop" />
            <circle cx="1398" cy="22" r="4" class="foam-crest-drop" />
          </svg>
        </div>

        <div ref="bubbleLayerNearRef" class="curtain-bubble-layer curtain-bubble-layer--near">
          <span
            v-for="b in nearCurtainBubbles"
            :key="b.id"
            class="curtain-bubble"
            :class="`curtain-bubble--${b.tint}`"
            :style="{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.story-runway {
  position: relative;
  height: 970vh;
}

.story-anchor {
  position: absolute;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.story-anchor--hero { top: 0; }
.story-anchor--about { top: 380vh; }
.story-anchor--projects { top: 830vh; }

.story-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: grid;
  place-items: center;
  padding-top: 3.6rem;
  perspective: 1200px;
  overflow: hidden;
}

.story-slot {
  grid-area: 1 / 1;
  position: relative;
  width: 100%;
  transform-origin: center center;
  pointer-events: none;
  will-change: transform, opacity;
}

.story-slot--hero { z-index: 2; }
.story-slot--about { z-index: 6; }
.story-slot--projects { z-index: 12; }

.story-slot.is-interactive {
  pointer-events: auto;
}

/* ---------------------------------------------------------------------------
 * Beautified Retro-Cute Miku CRT TV Shell (Window Center Aligned at y = -26px)
 * ------------------------------------------------------------------------- */
.crt-casing {
  grid-area: 1 / 1;
  position: relative;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  will-change: transform, opacity;
}

.crt-housing {
  position: relative;
  padding: 26px 32px 78px;
  border-radius: 38px;
  background: linear-gradient(155deg, #fbfeff 0%, #e1f3f7 52%, #c9e7ef 100%);
  border: 2px solid rgba(57, 197, 187, 0.56);
  box-shadow:
    0 38px 78px -24px rgba(16, 56, 70, 0.34),
    0 8px 0 rgba(168, 214, 224, 0.65),
    inset 0 3px 0 rgba(255, 255, 255, 0.96),
    inset 0 -10px 22px -6px rgba(57, 197, 187, 0.25);
}

[data-theme='dark'] .crt-housing {
  background: linear-gradient(155deg, #1b2c44 0%, #101c2f 60%, #0a1220 100%);
  border-color: rgba(76, 235, 224, 0.52);
  box-shadow:
    0 42px 86px -22px rgba(0, 0, 0, 0.88),
    0 8px 0 rgba(12, 32, 48, 0.85),
    0 0 38px -10px rgba(76, 235, 224, 0.28),
    inset 0 2px 0 rgba(76, 235, 224, 0.28);
}

.crt-top-grip {
  position: absolute;
  top: 9px;
  left: 50%;
  transform: translateX(-50%);
  width: 78px;
  height: 5px;
  border-radius: 999px;
  background: rgba(57, 197, 187, 0.22);
  box-shadow: inset 0 1px 2px rgba(17, 54, 68, 0.16);
}

.crt-antennas-wrap {
  position: absolute;
  bottom: calc(100% - 2px);
  left: 50%;
  transform: translateX(-50%);
  color: rgba(57, 197, 187, 0.78);
}

.antenna-base {
  fill: #e7f6f9;
  stroke: rgba(57, 197, 187, 0.65);
  stroke-width: 1.6;
}

[data-theme='dark'] .antenna-base {
  fill: #17273c;
  stroke: rgba(76, 235, 224, 0.55);
}

.antenna-plate {
  fill: #1b9890;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

[data-theme='dark'] .antenna-plate {
  fill: #4cebe0;
}

.antenna-cuff--teal {
  fill: var(--miku-teal);
  stroke: #ffffff;
  stroke-width: 1.5;
}

.antenna-cuff--magenta {
  fill: var(--miku-magenta);
  stroke: #ffffff;
  stroke-width: 1.5;
}

.antenna-orb--teal {
  fill: var(--miku-teal);
  filter: drop-shadow(0 0 9px rgba(57, 197, 187, 0.85));
}

.antenna-orb--magenta {
  fill: var(--miku-magenta);
  filter: drop-shadow(0 0 9px rgba(225, 40, 133, 0.8));
}

.crt-bezel-recess {
  padding: 5px;
  border-radius: 26px;
  background: linear-gradient(145deg, rgba(24, 58, 72, 0.18), rgba(255, 255, 255, 0.55));
  box-shadow:
    inset 0 4px 12px rgba(17, 54, 68, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.75);
}

[data-theme='dark'] .crt-bezel-recess {
  background: linear-gradient(145deg, rgba(4, 10, 18, 0.7), rgba(76, 235, 224, 0.12));
  box-shadow:
    inset 0 4px 14px rgba(0, 0, 0, 0.65),
    0 1px 0 rgba(76, 235, 224, 0.16);
}

.crt-window {
  width: calc(min(1260px, calc(100vw - 3rem)) * 0.55);
  height: calc(clamp(530px, 70vh, 615px) * 0.55);
  border-radius: 21px;
  border: 2px solid rgba(57, 197, 187, 0.5);
  background: rgba(16, 40, 48, 0.08);
  box-shadow: inset 0 6px 20px rgba(17, 54, 68, 0.18);
}

[data-theme='dark'] .crt-window {
  border-color: rgba(76, 235, 224, 0.48);
  background: rgba(4, 10, 18, 0.42);
}

.crt-chin {
  position: absolute;
  left: 32px;
  right: 32px;
  bottom: 16px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-inline: 0.75rem;
}

.crt-chin__left {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.crt-led {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--miku-teal);
  box-shadow: 0 0 10px var(--miku-teal);
}

.crt-led.is-tuning {
  background: var(--miku-magenta);
  box-shadow: 0 0 12px var(--miku-magenta);
}

.crt-brand {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  color: var(--miku-teal-deep);
}

[data-theme='dark'] .crt-brand {
  color: var(--miku-teal);
}

.crt-stripe-bar {
  display: inline-flex;
  gap: 3px;
  margin-left: 4px;
}

.crt-stripe-bar i {
  display: block;
  width: 14px;
  height: 4px;
  border-radius: 999px;
}

.stripe-teal { background: var(--miku-teal); }
.stripe-magenta { background: var(--miku-magenta); }

.crt-vents {
  display: flex;
  align-items: center;
  gap: 4px;
}

.crt-vent {
  position: relative;
  width: 3px;
  height: 16px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(24, 72, 86, 0.2);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.16);
  transition: box-shadow 0.18s ease, background 0.18s ease;
}

.crt-vent__fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  border-radius: 999px;
  transform-origin: center bottom;
  background: linear-gradient(
    to top,
    #10b981 0%,
    #2dd4bf 55%,
    #6ee7b7 100%
  );
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.72);
  transition: transform 0.08s linear, opacity 0.12s ease;
}

.crt-vent.is-lit {
  background: rgba(16, 185, 129, 0.2);
  box-shadow:
    inset 0 1px 1px rgba(0, 0, 0, 0.12),
    0 0 7px rgba(45, 212, 191, 0.45);
}

[data-theme='dark'] .crt-vent {
  background: rgba(76, 235, 224, 0.18);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.42);
}

[data-theme='dark'] .crt-vent__fill {
  background: linear-gradient(
    to top,
    #10b981 0%,
    #34d399 52%,
    #99f6e4 100%
  );
  box-shadow: 0 0 8px rgba(52, 211, 153, 0.85);
}

[data-theme='dark'] .crt-vent.is-lit {
  background: rgba(52, 211, 153, 0.22);
  box-shadow:
    inset 0 1px 1px rgba(0, 0, 0, 0.28),
    0 0 9px rgba(52, 211, 153, 0.56);
}

.crt-dials {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 42px;
}

.crt-power-btn {
  width: 14px;
  height: 10px;
  border-radius: 3px;
  background: linear-gradient(180deg, #ff7eb8, var(--miku-magenta));
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 2px 5px rgba(225, 40, 133, 0.35);
}

.crt-dial {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff, #c5dfe9);
  border: 1.5px solid rgba(57, 197, 187, 0.48);
  box-shadow:
    0 3px 6px rgba(17, 54, 68, 0.18),
    inset 0 1px 2px rgba(255, 255, 255, 0.9);
  position: relative;
}

.crt-dial::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 50%;
  width: 2.5px;
  height: 7px;
  border-radius: 2px;
  background: var(--miku-teal-deep);
  transform: translateX(-50%);
}

.crt-dial--accent::after {
  background: var(--miku-magenta);
}

[data-theme='dark'] .crt-dial {
  background: linear-gradient(135deg, #213752, #0d192b);
  border-color: rgba(76, 235, 224, 0.45);
}

.crt-corner-sticker {
  position: absolute;
  right: -14px;
  bottom: -6px;
  width: 48px;
  height: auto;
  transform: rotate(9deg);
  filter:
    drop-shadow(0 0 2px #ffffff)
    drop-shadow(0 6px 10px rgba(17, 54, 68, 0.25));
}

.crt-stand-wrap {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.crt-stand-neck {
  width: 100px;
  height: 20px;
  background: linear-gradient(180deg, #b8d6e2, #d4e8f0);
  border-inline: 1.5px solid rgba(57, 197, 187, 0.36);
}

.crt-stand-foot {
  width: 230px;
  height: 15px;
  border-radius: 999px;
  background: linear-gradient(90deg, #cfe6ef, #f2fafc, #cfe6ef);
  border: 1.5px solid rgba(57, 197, 187, 0.46);
  box-shadow: 0 12px 24px -10px rgba(24, 58, 72, 0.28);
}

[data-theme='dark'] .crt-stand-neck {
  background: linear-gradient(180deg, #0b1322, #162438);
  border-color: rgba(76, 235, 224, 0.36);
}

[data-theme='dark'] .crt-stand-foot {
  background: linear-gradient(90deg, #0e1929, #1b2d47, #0e1929);
  border-color: rgba(76, 235, 224, 0.42);
}

.crt-caption {
  margin-top: 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--miku-teal-deep);
  white-space: nowrap;
}

[data-theme='dark'] .crt-caption {
  color: var(--miku-teal);
}

/* ---------------------------------------------------------------------------
 * CRT Glass Glare & Clipped SMPTE Static Overlay
 * ------------------------------------------------------------------------- */
.crt-screen-glare,
.crt-static-layer {
  grid-area: 1 / 1;
  position: relative;
  width: calc(min(1260px, calc(100vw - 3rem)) * 0.55);
  height: calc(clamp(530px, 70vh, 615px) * 0.55);
  transform: translateY(-26px);
  border-radius: 21px;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
  will-change: transform, opacity;
}

.crt-screen-glare {
  z-index: 3;
  border: 2px solid rgba(25, 92, 108, 0.24);
  box-shadow:
    inset 0 8px 22px rgba(15, 58, 74, 0.18),
    inset 0 -6px 16px rgba(255, 255, 255, 0.36),
    inset 0 0 0 1px rgba(255, 255, 255, 0.42);
  background:
    linear-gradient(
      125deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(255, 255, 255, 0.04) 28%,
      transparent 48%
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(57, 197, 187, 0.045) 0px,
      rgba(57, 197, 187, 0.045) 1px,
      transparent 1px,
      transparent 4px
    );
}

[data-theme='dark'] .crt-screen-glare {
  border-color: rgba(76, 235, 224, 0.28);
  box-shadow:
    inset 0 10px 26px rgba(2, 10, 20, 0.56),
    inset 0 -4px 14px rgba(76, 235, 224, 0.14),
    inset 0 0 0 1px rgba(124, 244, 234, 0.18);
}

.crt-static-layer {
  z-index: 4;
  background: linear-gradient(155deg, #0b1c26 0%, #102634 55%, #0a1824 100%);
}

.crt-glitch-chroma {
  position: absolute;
  inset: -4%;
  opacity: 0.86;
  background-size: 240% 100%;
  background-image: linear-gradient(
    90deg,
    rgba(57, 197, 187, 0.88) 0%,
    rgba(86, 204, 242, 0.84) 16%,
    rgba(156, 247, 242, 0.8) 32%,
    rgba(192, 132, 252, 0.84) 48%,
    rgba(244, 114, 182, 0.86) 64%,
    rgba(99, 102, 241, 0.84) 82%,
    rgba(57, 197, 187, 0.88) 100%
  );
  will-change: background-position, filter;
}

.crt-glitch-shift {
  position: absolute;
  inset: -6% -18%;
  background-image: repeating-linear-gradient(
    90deg,
    rgba(57, 197, 187, 0.34) 0px,
    rgba(57, 197, 187, 0.34) 8px,
    rgba(255, 255, 255, 0.16) 8px,
    rgba(255, 255, 255, 0.16) 11px,
    rgba(244, 114, 182, 0.32) 11px,
    rgba(244, 114, 182, 0.32) 19px,
    transparent 19px,
    transparent 34px
  );
  mix-blend-mode: screen;
  will-change: transform, opacity;
}

.crt-snow-sheet {
  position: absolute;
  inset: -18%;
  opacity: 0.38;
  background-image:
    repeating-radial-gradient(
      circle at 20% 30%,
      rgba(255, 255, 255, 0.85) 0,
      rgba(255, 255, 255, 0.85) 1px,
      transparent 1px,
      transparent 5px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.28) 0px,
      rgba(255, 255, 255, 0.28) 2px,
      rgba(12, 28, 36, 0.36) 2px,
      rgba(12, 28, 36, 0.36) 5px
    );
  mix-blend-mode: overlay;
}

.crt-tear-band {
  position: absolute;
  left: -12%;
  right: -12%;
  height: 24px;
  top: 50%;
  background: linear-gradient(
    90deg,
    rgba(57, 197, 187, 0.68),
    rgba(255, 255, 255, 0.82) 45%,
    rgba(225, 40, 133, 0.68)
  );
  box-shadow:
    0 3px 0 rgba(76, 235, 224, 0.32),
    0 -3px 0 rgba(244, 114, 182, 0.32);
  mix-blend-mode: screen;
  opacity: 0.6;
}

.crt-tear-band--b {
  height: 16px;
  background: linear-gradient(
    90deg,
    rgba(225, 40, 133, 0.72),
    rgba(165, 243, 252, 0.86) 52%,
    rgba(57, 197, 187, 0.7)
  );
}

.crt-tear-band--c {
  height: 10px;
  background: linear-gradient(
    90deg,
    rgba(165, 243, 252, 0.75),
    rgba(244, 114, 182, 0.76) 48%,
    rgba(255, 255, 255, 0.8)
  );
}

.crt-halftone-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 260px;
  height: 260px;
  margin-left: -130px;
  margin-top: -130px;
  object-fit: contain;
  opacity: 0.36;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.45));
}

.crt-static-stage {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding-inline: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(2.4rem, 6vw, 4.8rem);
}

.static-chibi {
  position: relative;
  z-index: 3;
  width: 106px;
  height: auto;
  object-fit: contain;
  filter:
    drop-shadow(0 0 2px rgba(255, 255, 255, 0.94))
    drop-shadow(0 10px 18px rgba(10, 26, 36, 0.5));
}

/* ---------------------------------------------------------------------------
 * Full-Screen CRT Noise Veil During Section 2 Signal-Lock Reveal
 * ------------------------------------------------------------------------- */
.tv-room-noise {
  grid-area: 1 / 1;
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
  opacity: 0;
  overflow: hidden;
  will-change: opacity;
}

.tv-room-noise__grain {
  position: absolute;
  inset: -12%;
  opacity: 0.5;
  background-image: repeating-radial-gradient(
    circle at 30% 40%,
    rgba(57, 197, 187, 0.34) 0,
    rgba(255, 255, 255, 0.5) 1px,
    transparent 2px,
    transparent 7px
  );
  will-change: filter;
}

.tv-room-noise__scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    rgba(20, 48, 58, 0.12) 0px,
    rgba(20, 48, 58, 0.12) 2px,
    transparent 2px,
    transparent 6px
  );
}

.tv-room-noise__tear {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 46px;
  background: linear-gradient(
    90deg,
    rgba(57, 197, 187, 0.42),
    rgba(255, 255, 255, 0.72) 48%,
    rgba(225, 40, 133, 0.42)
  );
  mix-blend-mode: screen;
}

/* ---------------------------------------------------------------------------
 * TV Studio Backdrop (Enriches Empty Margins Around CRT TV)
 * ------------------------------------------------------------------------- */
.tv-studio-backdrop {
  grid-area: 1 / 1;
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  overflow: hidden;
  will-change: opacity;
}

.tv-studio-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 72% 58% at 50% 48%,
    rgba(57, 197, 187, 0.14) 0%,
    rgba(96, 178, 232, 0.08) 46%,
    transparent 78%
  );
}

[data-theme='dark'] .tv-studio-glow {
  background: radial-gradient(
    ellipse 72% 58% at 50% 48%,
    rgba(76, 235, 224, 0.16) 0%,
    rgba(56, 128, 255, 0.09) 46%,
    transparent 78%
  );
}

.tv-studio-watermark {
  position: absolute;
  top: 5.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: clamp(2.8rem, 7vw, 6.2rem);
  font-weight: 800;
  letter-spacing: 0.18em;
  color: rgba(57, 197, 187, 0.09);
  white-space: nowrap;
}

[data-theme='dark'] .tv-studio-watermark {
  color: rgba(76, 235, 224, 0.08);
}

.tv-studio-halftone {
  position: absolute;
  left: 50%;
  top: 48%;
  width: min(640px, 78vw);
  height: auto;
  transform: translate(-50%, -50%);
  opacity: 0.22;
}

.tv-studio-staff {
  position: absolute;
  left: -4%;
  top: 22%;
  width: min(560px, 46vw);
  height: auto;
  opacity: 0.34;
  transform: rotate(-10deg);
}

.tv-studio-notes {
  position: absolute;
  right: 2%;
  top: 12%;
  width: min(360px, 28vw);
  height: auto;
  opacity: 0.28;
}

.tv-studio-eq {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  opacity: 0.42;
}

.tv-studio-eq--left { left: clamp(1.5rem, 6vw, 7rem); }
.tv-studio-eq--right { right: clamp(1.5rem, 6vw, 7rem); }

.eq-bar {
  width: 6px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--miku-teal), rgba(225, 40, 133, 0.65));
}

.eq-bar:nth-child(1) { height: 34%; }
.eq-bar:nth-child(2) { height: 76%; }
.eq-bar:nth-child(3) { height: 52%; }
.eq-bar:nth-child(4) { height: 92%; }
.eq-bar:nth-child(5) { height: 44%; }
.eq-bar:nth-child(6) { height: 64%; }

.tv-studio-shelf {
  position: absolute;
  left: 50%;
  bottom: 13%;
  transform: translateX(-50%);
  width: min(920px, 84vw);
  height: 58px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 40%,
    rgba(57, 197, 187, 0.16) 0%,
    rgba(17, 54, 68, 0.08) 45%,
    transparent 76%
  );
  border-top: 1px solid rgba(57, 197, 187, 0.2);
}

/* ---------------------------------------------------------------------------
 * Origami Blueprint & Wind-Trail Backdrop (Fills Margins During Fold & Dive)
 * ------------------------------------------------------------------------- */
.origami-backdrop {
  grid-area: 1 / 1;
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
  opacity: 0;
  overflow: hidden;
  will-change: opacity;
}

.origami-aurora {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 22% 72%, rgba(57, 197, 187, 0.18), transparent 48%),
    radial-gradient(circle at 78% 28%, rgba(225, 40, 133, 0.1), transparent 46%),
    radial-gradient(circle at 52% 48%, rgba(96, 178, 232, 0.12), transparent 60%);
}

.origami-watermark {
  position: absolute;
  top: 5.8rem;
  right: 4rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: rgba(27, 152, 144, 0.55);
}

[data-theme='dark'] .origami-watermark {
  color: rgba(76, 235, 224, 0.55);
}

.origami-compass {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(960px, 92vw);
  height: auto;
  transform: translate(-50%, -50%);
}

.compass-ring {
  stroke: rgba(57, 197, 187, 0.22);
  stroke-width: 1.4;
}

.compass-ring--dashed {
  stroke: rgba(225, 40, 133, 0.18);
  stroke-dasharray: 6 8;
}

.compass-arc {
  stroke: rgba(57, 197, 187, 0.35);
  stroke-width: 1.8;
  stroke-dasharray: 7 7;
}

.origami-wind-staff {
  position: absolute;
  left: -4%;
  bottom: 10%;
  width: min(740px, 64vw);
  height: auto;
  opacity: 0.42;
}

.origami-wind-notes {
  position: absolute;
  right: 1%;
  top: 8%;
  width: min(440px, 36vw);
  height: auto;
  opacity: 0.36;
}

/* ---------------------------------------------------------------------------
 * Seamless Transparent Crease Diagram Drawn Over Real AboutSection
 * ------------------------------------------------------------------------- */
.fold-guide-overlay {
  grid-area: 1 / 1;
  position: relative;
  z-index: 7;
  pointer-events: none;
  perspective: 1200px;
  will-change: transform, opacity;
}

.fold-guide-sheet {
  position: relative;
  width: min(1160px, 88vw);
  height: clamp(490px, 66vh, 600px);
  border-radius: 26px;
  border: 1.5px dashed rgba(57, 197, 187, 0.65);
  box-shadow: 0 0 36px -14px rgba(57, 197, 187, 0.3);
}

.crease-spine {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(225, 40, 133, 0.85) 0 8px,
    transparent 8px 16px
  );
}

.crease-diag {
  position: absolute;
  top: 0;
  width: 50%;
  height: 55%;
  border-bottom: 2px dashed rgba(57, 197, 187, 0.82);
}

.crease-diag--tl {
  left: 0;
  transform-origin: top right;
  transform: skewY(-22deg);
}

.crease-diag--tr {
  right: 0;
  transform-origin: top left;
  transform: skewY(22deg);
}

.crease-badge {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  background: var(--glass-bg-strong);
  border: 1px solid rgba(57, 197, 187, 0.55);
  color: var(--miku-teal-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

[data-theme='dark'] .crease-badge {
  color: var(--miku-teal);
}

/* ---------------------------------------------------------------------------
 * Slender 1 : 1.38 Crystal Wishing Drift Bottle (Acts 5 -> 8)
 * ------------------------------------------------------------------------- */
.bottle-assembly-wrap {
  grid-area: 1 / 1;
  position: relative;
  z-index: 9;
  pointer-events: none;
  display: grid;
  place-items: center;
  will-change: transform, opacity;
}

.bottle-outer-aura {
  grid-area: 1 / 1;
  width: clamp(320px, 38vw, 520px);
  height: clamp(420px, 60vh, 560px);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(57, 197, 187, 0.18) 0%,
    rgba(96, 178, 232, 0.08) 46%,
    transparent 72%
  );
  filter: blur(22px);
}

.bottle-assembly {
  grid-area: 1 / 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bottle-neck-group {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: -10px;
}

.bottle-cork {
  position: relative;
  z-index: 7;
  width: 58px;
  height: 32px;
  border-radius: 9px 9px 4px 4px;
  background: linear-gradient(90deg, #c69668 0%, #e7bf95 46%, #b28256 100%);
  border: 1.5px solid rgba(124, 82, 46, 0.48);
  box-shadow:
    0 8px 16px -6px rgba(24, 48, 56, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.42);
  will-change: transform, opacity;
}

.bottle-eruption-plume {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  width: 224px;
  height: 196px;
  z-index: 5;
  pointer-events: none;
  transform-origin: center bottom;
  filter: drop-shadow(0 6px 14px rgba(38, 178, 188, 0.2));
  will-change: transform, opacity;
}

.plume-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.plume-stop-base { stop-color: rgba(255, 255, 255, 0.96); }
.plume-stop-mid { stop-color: rgba(162, 246, 240, 0.9); }
.plume-stop-tip { stop-color: rgba(88, 224, 218, 0.72); }

.plume-stream {
  stroke: rgba(255, 255, 255, 0.94);
  stroke-width: 1.8;
  stroke-linejoin: round;
}

.plume-stream-hi {
  fill: none;
  stroke: rgba(255, 255, 255, 0.95);
  stroke-width: 2.2;
  stroke-linecap: round;
}

.plume-bub {
  fill: rgba(226, 254, 252, 0.78);
  stroke: rgba(255, 255, 255, 0.96);
  stroke-width: 1.4;
}

.plume-bub--pink {
  fill: rgba(255, 226, 242, 0.74);
  stroke: rgba(255, 168, 214, 0.95);
}

.plume-bub-glint {
  fill: rgba(255, 255, 255, 0.96);
}

.plume-star {
  fill: rgba(255, 255, 255, 0.96);
  stroke: rgba(82, 220, 214, 0.68);
  stroke-width: 0.9;
}

.plume-star--pink {
  fill: rgba(255, 240, 248, 0.96);
  stroke: rgba(244, 114, 182, 0.78);
}

[data-theme='dark'] .bottle-eruption-plume {
  filter: drop-shadow(0 0 14px rgba(76, 235, 224, 0.34));
}

[data-theme='dark'] .plume-stop-base { stop-color: rgba(224, 255, 254, 0.9); }
[data-theme='dark'] .plume-stop-mid { stop-color: rgba(76, 235, 224, 0.76); }
[data-theme='dark'] .plume-stop-tip { stop-color: rgba(56, 178, 224, 0.56); }

[data-theme='dark'] .plume-stream {
  stroke: rgba(164, 252, 246, 0.76);
}

[data-theme='dark'] .plume-stream-hi {
  stroke: rgba(226, 255, 254, 0.88);
}

[data-theme='dark'] .plume-bub {
  fill: rgba(92, 236, 228, 0.38);
  stroke: rgba(176, 253, 248, 0.88);
}

[data-theme='dark'] .plume-bub--pink {
  fill: rgba(244, 114, 182, 0.34);
  stroke: rgba(255, 168, 214, 0.86);
}

[data-theme='dark'] .plume-bub-glint {
  fill: rgba(235, 255, 254, 0.94);
}

[data-theme='dark'] .plume-star {
  fill: rgba(204, 254, 252, 0.92);
  stroke: rgba(76, 235, 224, 0.78);
}

[data-theme='dark'] .plume-star--pink {
  fill: rgba(255, 214, 236, 0.92);
  stroke: rgba(244, 114, 182, 0.82);
}

.bottle-lip {
  position: relative;
  z-index: 4;
  width: 92px;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.78),
    rgba(57, 197, 187, 0.32),
    rgba(255, 255, 255, 0.78)
  );
  border: 1.5px solid rgba(57, 197, 187, 0.62);
  backdrop-filter: blur(2px);
}

[data-theme='dark'] .bottle-lip {
  background: linear-gradient(
    90deg,
    rgba(76, 235, 224, 0.32),
    rgba(16, 36, 56, 0.65),
    rgba(76, 235, 224, 0.32)
  );
}

.bottle-neck {
  position: relative;
  z-index: 1;
  width: 68px;
  height: 50px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.56),
    rgba(218, 248, 252, 0.16) 46%,
    rgba(255, 255, 255, 0.48)
  );
  border-inline: 1.5px solid rgba(57, 197, 187, 0.54);
}

[data-theme='dark'] .bottle-neck {
  background: linear-gradient(
    90deg,
    rgba(76, 235, 224, 0.22),
    rgba(10, 22, 38, 0.28) 46%,
    rgba(76, 235, 224, 0.2)
  );
}

.bottle-air-portal {
  position: absolute;
  bottom: calc(100% - 39px);
  left: 50%;
  transform: translateX(-50%);
  width: 520px;
  height: 340px;
  overflow: hidden;
  z-index: 6;
  pointer-events: none;
}

.air-entry-plane {
  position: absolute;
  left: 50%;
  bottom: 0;
  margin-left: -94px;
  margin-bottom: -58px;
  filter: drop-shadow(0 12px 20px rgba(17, 54, 68, 0.22));
  will-change: transform, opacity;
}

.bottle-neck-chute {
  position: absolute;
  top: 39px;
  left: 50%;
  transform: translateX(-50%);
  width: 66px;
  height: 158px;
  overflow: hidden;
  z-index: 2;
  pointer-events: none;
}

.neck-entry-plane {
  position: absolute;
  left: 50%;
  top: 0;
  margin-left: -94px;
  margin-top: -58px;
  filter: drop-shadow(0 8px 14px rgba(17, 54, 68, 0.2));
  will-change: transform, opacity;
}

.flying-plane-layer svg,
.air-entry-plane svg,
.neck-entry-plane svg {
  display: block;
}

.bottle-ribbon {
  position: absolute;
  top: 52px;
  z-index: 5;
  filter: drop-shadow(0 6px 10px rgba(24, 58, 72, 0.22));
}

.ribbon-fill {
  fill: rgba(57, 197, 187, 0.92);
  stroke: #178c84;
  stroke-width: 1.3;
}

.ribbon-tail {
  fill: rgba(57, 197, 187, 0.78);
}

.ribbon-knot {
  fill: #e12885;
  stroke: #ffffff;
  stroke-width: 1.5;
}

.bottle-belly {
  position: relative;
  width: clamp(232px, 24vw, 326px);
  height: clamp(348px, 49vh, 452px);
  border-radius: 132px 132px 62px 62px / 118px 118px 48px 48px;
  border: 2.2px solid rgba(57, 197, 187, 0.64);
  background: radial-gradient(
    circle at 50% 35%,
    rgba(255, 255, 255, 0.16) 40%,
    rgba(57, 197, 187, 0.16) 100%
  );
  box-shadow:
    0 34px 72px -24px rgba(20, 56, 70, 0.3),
    inset 0 14px 30px -10px rgba(255, 255, 255, 0.72),
    inset 0 -18px 34px -10px rgba(57, 197, 187, 0.34);
  overflow: hidden;
}

[data-theme='dark'] .bottle-belly {
  border-color: rgba(76, 235, 224, 0.58);
  background: radial-gradient(
    circle at 50% 35%,
    rgba(12, 26, 44, 0.3) 40%,
    rgba(76, 235, 224, 0.18) 100%
  );
  box-shadow:
    0 38px 82px -22px rgba(0, 0, 0, 0.84),
    0 0 42px -10px rgba(76, 235, 224, 0.28),
    inset 0 12px 26px -10px rgba(76, 235, 224, 0.26);
}

.bottle-shoulder-glint {
  position: absolute;
  top: 10px;
  left: 26%;
  right: 26%;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(255, 255, 255, 0.54) 0%,
    rgba(255, 255, 255, 0.1) 56%,
    transparent 88%
  );
  z-index: 2;
  pointer-events: none;
}

[data-theme='dark'] .bottle-shoulder-glint {
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(76, 235, 224, 0.24) 0%,
    rgba(255, 255, 255, 0.05) 56%,
    transparent 86%
  );
}

.bottle-water-clip {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}

.water-bg-art {
  position: absolute;
  left: -4%;
  bottom: -2%;
  width: 108%;
  height: 75%;
  object-fit: cover;
  object-position: 14% center;
  opacity: 0.76;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.76) 18%,
    black 42%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.76) 18%,
    black 42%
  );
  transform-origin: center center;
  will-change: transform;
}

[data-theme='dark'] .water-bg-art {
  opacity: 0.84;
  object-position: 50% center;
}

.water-liquid-layer {
  position: absolute;
  left: -12%;
  right: -12%;
  top: 24%;
  bottom: -10%;
  transform-origin: center center;
  will-change: transform;
}

.water-wave {
  position: relative;
  display: block;
  width: 124%;
  height: 36px;
  margin-left: -12%;
}

.water-wave--back {
  margin-bottom: -26px;
  opacity: 0.65;
}

.wave-path-back { fill: rgba(75, 169, 223, 0.45); }
.wave-path-front { fill: rgba(57, 197, 187, 0.42); }
[data-theme='dark'] .wave-path-back { fill: rgba(56, 128, 255, 0.36); }
[data-theme='dark'] .wave-path-front { fill: rgba(76, 235, 224, 0.32); }

.water-volume-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgba(57, 197, 187, 0.34) 0%,
    rgba(75, 169, 223, 0.24) 55%,
    rgba(27, 152, 144, 0.32) 100%
  );
}

[data-theme='dark'] .water-volume-fill {
  background: linear-gradient(
    180deg,
    rgba(76, 235, 224, 0.24) 0%,
    rgba(30, 90, 150, 0.28) 55%,
    rgba(10, 32, 56, 0.42) 100%
  );
}

.bottle-float-staff {
  position: absolute;
  left: 50%;
  bottom: 14%;
  width: 58%;
  transform: translateX(-50%) rotate(-8deg);
  opacity: 0.62;
  pointer-events: none;
  filter: drop-shadow(0 4px 10px rgba(255, 255, 255, 0.45));
  will-change: transform, opacity;
}

.bottle-chibi {
  position: absolute;
  width: 54px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 14px rgba(17, 54, 68, 0.28));
  will-change: transform;
}

.bottle-chibi--fish { right: 20px; bottom: 18px; }
.bottle-chibi--leek { left: 20px; top: 22%; }

.bottle-fizz-layer {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
  will-change: opacity;
}

.fizz-bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(196, 250, 248, 0.56) 58%,
    rgba(57, 197, 187, 0.25) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow: 0 0 6px rgba(124, 244, 234, 0.35);
  will-change: transform, opacity;
}

[data-theme='dark'] .fizz-bubble {
  border-color: rgba(165, 243, 252, 0.65);
  box-shadow: 0 0 10px rgba(76, 235, 224, 0.45);
}

.bottle-foam-head {
  position: absolute;
  top: 14%;
  left: -4%;
  right: -4%;
  height: 82px;
  z-index: 5;
  pointer-events: none;
  transform-origin: center bottom;
  filter:
    drop-shadow(0 -2px 6px rgba(57, 197, 187, 0.28))
    drop-shadow(0 4px 10px rgba(32, 140, 156, 0.16));
  will-change: transform, opacity;
}

.bottle-foam-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
  -webkit-mask-image: linear-gradient(to bottom, black 55%, rgba(0, 0, 0, 0.4) 84%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 55%, rgba(0, 0, 0, 0.4) 84%, transparent 100%);
}

.lace-shadow {
  fill: rgba(136, 238, 232, 0.72);
}

.lace-front {
  fill: rgba(255, 255, 255, 0.96);
  stroke: rgba(112, 230, 222, 0.56);
  stroke-width: 1.4;
}

.lace-bub {
  fill: rgba(232, 255, 253, 0.84);
  stroke: rgba(255, 255, 255, 0.96);
  stroke-width: 1.1;
}

.lace-bub--pink {
  fill: rgba(255, 224, 240, 0.8);
  stroke: rgba(255, 168, 214, 0.94);
}

.lace-bub-glint {
  fill: rgba(255, 255, 255, 0.98);
}

[data-theme='dark'] .bottle-foam-head {
  filter: drop-shadow(0 -3px 12px rgba(76, 235, 224, 0.36));
}

[data-theme='dark'] .lace-shadow {
  fill: rgba(48, 166, 186, 0.52);
}

[data-theme='dark'] .lace-front {
  fill: rgba(212, 254, 252, 0.88);
  stroke: rgba(124, 244, 234, 0.68);
}

[data-theme='dark'] .lace-bub {
  fill: rgba(86, 232, 224, 0.44);
  stroke: rgba(190, 254, 250, 0.88);
}

[data-theme='dark'] .lace-bub--pink {
  fill: rgba(244, 114, 182, 0.36);
  stroke: rgba(255, 168, 214, 0.86);
}

[data-theme='dark'] .lace-bub-glint {
  fill: rgba(235, 255, 254, 0.94);
}

.water-splash-rig {
  position: absolute;
  top: 16%;
  left: 50%;
  transform: translateX(-50%);
  width: 204px;
  height: 96px;
  pointer-events: none;
  z-index: 6;
  display: grid;
  place-items: center;
  will-change: transform, opacity;
}

.splash-ripple {
  position: absolute;
  left: 50%;
  top: 64%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
}

.splash-ripple--outer {
  width: 152px;
  height: 36px;
  background: radial-gradient(
    ellipse at center,
    transparent 44%,
    rgba(255, 255, 255, 0.45) 72%,
    rgba(165, 243, 252, 0.16) 86%,
    transparent 100%
  );
  border: 1.5px solid rgba(255, 255, 255, 0.46);
  filter: blur(0.8px);
}

.splash-ripple--inner {
  width: 96px;
  height: 22px;
  background: radial-gradient(
    ellipse at center,
    rgba(124, 244, 234, 0.24) 0%,
    rgba(255, 255, 255, 0.42) 68%,
    transparent 96%
  );
  border: 1px solid rgba(165, 243, 252, 0.56);
  filter: blur(0.5px);
}

.splash-crown-svg {
  position: relative;
  z-index: 2;
  overflow: visible;
  filter: drop-shadow(0 2px 8px rgba(124, 244, 234, 0.38));
}

.crown-stop-top { stop-color: rgba(255, 255, 255, 0.86); }
.crown-stop-mid { stop-color: rgba(124, 244, 234, 0.44); }
.crown-stop-bot { stop-color: rgba(57, 197, 187, 0); }

[data-theme='dark'] .crown-stop-top { stop-color: rgba(216, 255, 254, 0.86); }
[data-theme='dark'] .crown-stop-mid { stop-color: rgba(76, 235, 224, 0.5); }

.splash-crown-crest {
  stroke: rgba(255, 255, 255, 0.72);
  stroke-width: 1.6;
  stroke-linecap: round;
}

.splash-drops-group {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 196px;
  height: 82px;
  pointer-events: none;
  z-index: 6;
  will-change: transform, opacity;
}

.splash-drop {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.96),
    rgba(136, 246, 238, 0.68)
  );
  box-shadow: 0 2px 6px rgba(57, 197, 187, 0.3);
}

.splash-drop--1 { width: 8px; height: 9px; left: 32px; top: 38px; transform: rotate(-20deg); }
.splash-drop--2 { width: 6px; height: 7px; left: 54px; top: 22px; transform: rotate(-12deg); }
.splash-drop--3 { width: 7px; height: 8px; left: 76px; top: 14px; }
.splash-drop--4 { width: 9px; height: 10px; left: 95px; top: 8px; }
.splash-drop--5 { width: 7px; height: 8px; left: 116px; top: 15px; transform: rotate(8deg); }
.splash-drop--6 { width: 6px; height: 7px; left: 136px; top: 24px; transform: rotate(14deg); }
.splash-drop--7 { width: 8px; height: 9px; left: 156px; top: 36px; transform: rotate(24deg); }
.splash-drop--8 { width: 5px; height: 6px; left: 66px; top: 34px; }

.plane-dissolve-spark {
  position: absolute;
  left: 50%;
  top: 34%;
  transform: translate(-50%, -50%);
  width: 112px;
  height: 92px;
  pointer-events: none;
  z-index: 6;
  will-change: transform, opacity;
}

.spark-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(124, 244, 234, 0.72) 56%,
    transparent 100%
  );
  box-shadow: 0 0 10px rgba(76, 235, 224, 0.62);
}

.spark-orb--a { width: 14px; height: 14px; left: 48px; top: 36px; }
.spark-orb--b { width: 9px; height: 9px; left: 26px; top: 24px; }
.spark-orb--c { width: 10px; height: 10px; right: 24px; top: 28px; }
.spark-orb--d { width: 8px; height: 8px; left: 34px; bottom: 20px; }
.spark-orb--e { width: 11px; height: 11px; right: 30px; bottom: 18px; }

.submerged-plane {
  position: absolute;
  left: 50%;
  top: 34%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 14px rgba(57, 197, 187, 0.72));
  will-change: transform, opacity, filter;
}

.bottle-specular {
  position: absolute;
  top: 28px;
  bottom: 28px;
  width: 12px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.72),
    rgba(255, 255, 255, 0.08) 56%,
    rgba(255, 255, 255, 0.45)
  );
  opacity: 0.72;
  pointer-events: none;
}

.bottle-specular--left { left: 14px; }
.bottle-specular--right { right: 16px; width: 6px; opacity: 0.45; }

.bottle-star {
  position: absolute;
  color: #ffffff;
  filter: drop-shadow(0 0 8px rgba(57, 197, 187, 0.85));
  pointer-events: none;
}

.bottle-star--one { top: 34px; right: 44px; }
.bottle-star--two { bottom: 22px; left: 26px; color: var(--miku-magenta); }

.bottle-base-rim {
  width: calc(clamp(232px, 24vw, 326px) - 34px);
  height: 16px;
  margin-top: -4px;
  border-radius: 0 0 54px 54px;
  background: linear-gradient(
    180deg,
    rgba(57, 197, 187, 0.25),
    rgba(225, 40, 133, 0.16)
  );
  border-inline: 1.5px solid rgba(57, 197, 187, 0.5);
  border-bottom: 1.5px solid rgba(57, 197, 187, 0.5);
}

.bottle-floor-shadow {
  width: clamp(190px, 20vw, 270px);
  height: 18px;
  margin-top: 6px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(17, 54, 68, 0.2) 0%,
    transparent 74%
  );
}

.bottle-status-pill {
  margin-top: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.3rem 0.95rem;
  border-radius: 999px;
  background: var(--glass-bg-strong);
  border: 1px solid rgba(57, 197, 187, 0.38);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--miku-teal-deep);
}

[data-theme='dark'] .bottle-status-pill { color: var(--miku-teal); }

.bottle-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--miku-teal);
  box-shadow: 0 0 8px var(--miku-teal);
}

.flying-plane-layer {
  grid-area: 1 / 1;
  position: relative;
  pointer-events: none;
  z-index: 10;
  filter: drop-shadow(0 16px 26px rgba(17, 54, 68, 0.25));
  will-change: transform, opacity;
}

.plane-wing-top { fill: #f5fcff; stroke: #39c5bb; stroke-width: 2.2; stroke-linejoin: round; }
.plane-fold-dark { fill: #a8e4ea; stroke: #1b9890; stroke-width: 2; stroke-linejoin: round; }
.plane-wing-low { fill: #dcf6fa; stroke: #39c5bb; stroke-width: 2.2; stroke-linejoin: round; }

[data-theme='dark'] .plane-wing-top { fill: #e4fbfc; stroke: #4cebe0; }
[data-theme='dark'] .plane-fold-dark { fill: #207d85; stroke: #4cebe0; }
[data-theme='dark'] .plane-wing-low { fill: #7ee2e0; stroke: #4cebe0; }

.plane-stripe-teal { stroke: #1b9890; stroke-width: 2.6; stroke-linecap: round; }
.plane-stripe-magenta { stroke: #e12885; stroke-width: 2.8; stroke-linecap: round; }
.plane-mark { fill: #178c84; font-size: 13px; font-weight: 800; }

/* ---------------------------------------------------------------------------
 * Full-Screen Seafoam & Layered Crystal Bubble Curtain (Acts 7 -> 8)
 * ------------------------------------------------------------------------- */
.foam-curtain-layer {
  position: absolute;
  inset: 0;
  z-index: 14;
  pointer-events: none;
  overflow: hidden;
  opacity: 0;
  will-change: opacity;
}

.foam-wave-band {
  position: absolute;
  left: -10%;
  top: -8%;
  width: 120%;
  height: 118%;
  will-change: transform, opacity;
}

.foam-wave-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.foam-stop-back-top { stop-color: rgba(214, 252, 250, 0.74); }
.foam-stop-back-mid { stop-color: rgba(88, 218, 216, 0.68); }
.foam-stop-back-bot { stop-color: rgba(46, 178, 198, 0.78); }

.foam-stop-mid-top { stop-color: rgba(238, 254, 253, 0.82); }
.foam-stop-mid-mid { stop-color: rgba(110, 230, 226, 0.64); }
.foam-stop-mid-bot { stop-color: rgba(62, 196, 212, 0.74); }

.foam-stop-front-top { stop-color: rgba(255, 255, 255, 0.88); }
.foam-stop-front-mid { stop-color: rgba(188, 249, 246, 0.44); }
.foam-stop-front-mid2 { stop-color: rgba(92, 224, 224, 0.28); }
.foam-stop-front-bot { stop-color: rgba(62, 192, 212, 0.36); }

[data-theme='dark'] .foam-stop-back-top { stop-color: rgba(26, 76, 102, 0.86); }
[data-theme='dark'] .foam-stop-back-mid { stop-color: rgba(16, 48, 72, 0.88); }
[data-theme='dark'] .foam-stop-back-bot { stop-color: rgba(10, 26, 46, 0.92); }

[data-theme='dark'] .foam-stop-mid-top { stop-color: rgba(58, 162, 188, 0.76); }
[data-theme='dark'] .foam-stop-mid-mid { stop-color: rgba(38, 124, 154, 0.74); }
[data-theme='dark'] .foam-stop-mid-bot { stop-color: rgba(18, 68, 98, 0.82); }

[data-theme='dark'] .foam-stop-front-top { stop-color: rgba(124, 248, 240, 0.38); }
[data-theme='dark'] .foam-stop-front-mid { stop-color: rgba(76, 235, 224, 0.28); }
[data-theme='dark'] .foam-stop-front-mid2 { stop-color: rgba(48, 174, 200, 0.28); }
[data-theme='dark'] .foam-stop-front-bot { stop-color: rgba(28, 118, 152, 0.32); }

.foam-caustic {
  fill: rgba(255, 255, 255, 0.22);
}

.foam-crest-shadow {
  fill: rgba(154, 244, 238, 0.78);
}

.foam-crest-white {
  fill: rgba(255, 255, 255, 0.92);
}

.foam-crest-white--crisp {
  fill: rgba(255, 255, 255, 0.98);
  filter: drop-shadow(0 -2px 6px rgba(255, 255, 255, 0.68));
}

.foam-crest-drop {
  fill: rgba(255, 255, 255, 0.96);
  stroke: rgba(118, 234, 226, 0.56);
  stroke-width: 1.4;
}

[data-theme='dark'] .foam-caustic {
  fill: rgba(124, 244, 234, 0.14);
}

[data-theme='dark'] .foam-crest-shadow {
  fill: rgba(54, 176, 194, 0.54);
}

[data-theme='dark'] .foam-crest-white {
  fill: rgba(206, 253, 251, 0.78);
}

[data-theme='dark'] .foam-crest-white--crisp {
  fill: rgba(232, 255, 254, 0.92);
  filter: drop-shadow(0 -2px 8px rgba(76, 235, 224, 0.45));
}

[data-theme='dark'] .foam-crest-drop {
  fill: rgba(214, 254, 252, 0.9);
  stroke: rgba(76, 235, 224, 0.68);
}

.curtain-bubble-layer {
  position: absolute;
  inset: -8% 0;
  will-change: transform, opacity;
}

.curtain-bubble-layer--far {
  opacity: 0.84;
}

.curtain-bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.94) 0%,
    rgba(220, 253, 251, 0.4) 40%,
    rgba(68, 214, 208, 0.16) 76%,
    rgba(255, 255, 255, 0.74) 100%
  );
  border: 1.5px solid rgba(255, 255, 255, 0.96);
  box-shadow:
    inset -3px -4px 10px rgba(42, 184, 192, 0.3),
    inset 2px 3px 8px rgba(255, 255, 255, 0.84),
    0 0 0 1px rgba(57, 197, 187, 0.24),
    0 4px 12px rgba(22, 112, 134, 0.12);
}

.curtain-bubble--pink {
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 255, 255, 0.94) 0%,
    rgba(255, 228, 242, 0.38) 42%,
    rgba(244, 114, 182, 0.16) 76%,
    rgba(255, 216, 236, 0.72) 100%
  );
  border-color: rgba(255, 190, 224, 0.94);
  box-shadow:
    inset -3px -4px 10px rgba(244, 114, 182, 0.28),
    inset 2px 3px 8px rgba(176, 252, 248, 0.36),
    0 0 0 1px rgba(232, 62, 148, 0.22),
    0 4px 12px rgba(22, 112, 134, 0.1);
}

.curtain-bubble--pearl {
  border-color: rgba(255, 255, 255, 0.98);
  box-shadow:
    inset -3px -4px 10px rgba(56, 188, 224, 0.3),
    inset 2px 3px 8px rgba(255, 255, 255, 0.86),
    0 0 0 1px rgba(64, 192, 224, 0.26),
    0 4px 14px rgba(22, 112, 134, 0.12);
}

[data-theme='dark'] .curtain-bubble {
  background: radial-gradient(
    circle at 30% 28%,
    rgba(228, 255, 254, 0.72) 0%,
    rgba(76, 235, 224, 0.22) 46%,
    rgba(28, 92, 134, 0.14) 78%,
    rgba(136, 248, 240, 0.52) 100%
  );
  border-color: rgba(146, 248, 240, 0.76);
  box-shadow:
    inset -3px -4px 10px rgba(76, 235, 224, 0.28),
    0 0 12px rgba(76, 235, 224, 0.24);
}

[data-theme='dark'] .curtain-bubble--pink {
  background: radial-gradient(
    circle at 30% 28%,
    rgba(255, 240, 248, 0.68) 0%,
    rgba(244, 114, 182, 0.22) 48%,
    rgba(76, 235, 224, 0.12) 78%,
    rgba(255, 162, 212, 0.5) 100%
  );
  border-color: rgba(255, 152, 206, 0.74);
  box-shadow:
    inset -3px -4px 10px rgba(244, 114, 182, 0.28),
    0 0 12px rgba(244, 114, 182, 0.22);
}

.curtain-bubble::before {
  content: '';
  position: absolute;
  top: 15%;
  left: 19%;
  width: 32%;
  height: 20%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  transform: rotate(-28deg);
}

.curtain-bubble::after {
  content: '';
  position: absolute;
  bottom: 14%;
  right: 18%;
  width: 22%;
  height: 11%;
  border-radius: 50%;
  background: rgba(186, 250, 252, 0.66);
  transform: rotate(-28deg);
}

.curtain-sparkle {
  position: absolute;
  pointer-events: none;
  color: #ffffff;
  fill: rgba(255, 255, 255, 0.96);
  filter: drop-shadow(0 0 6px rgba(57, 197, 187, 0.74));
  will-change: transform, opacity;
}

.curtain-sparkle--pink {
  color: #fff2f8;
  fill: rgba(255, 240, 248, 0.96);
  filter: drop-shadow(0 0 6px rgba(244, 114, 182, 0.78));
}

[data-theme='dark'] .curtain-sparkle {
  color: #dcfffd;
  fill: rgba(220, 255, 253, 0.94);
  filter: drop-shadow(0 0 8px rgba(76, 235, 224, 0.85));
}

[data-theme='dark'] .curtain-sparkle--pink {
  color: #ffdcf0;
  fill: rgba(255, 220, 240, 0.94);
  filter: drop-shadow(0 0 8px rgba(244, 114, 182, 0.84));
}

/* ---------------------------------------------------------------------------
 * Responsive Split-Pane & Phone Fallbacks
 * ------------------------------------------------------------------------- */
@media (max-width: 960px) and (min-width: 521px) {
  .tv-studio-eq {
    display: none;
  }

  .crt-housing {
    padding: 20px 24px 66px;
  }

  .crt-halftone-ring {
    width: 190px;
    height: 190px;
    margin-left: -95px;
    margin-top: -95px;
  }

  .static-chibi {
    width: 76px;
  }

  .crt-corner-sticker {
    width: 38px;
    right: -10px;
  }

  .bottle-chibi {
    width: 54px;
  }
}

@media (max-width: 520px) {
  .story-runway {
    height: auto;
  }

  .story-anchor {
    position: relative;
    top: auto;
  }

  .story-sticky {
    position: relative;
    height: auto;
    padding-top: 0;
    overflow: visible;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tv-studio-backdrop,
  .origami-backdrop,
  .crt-casing,
  .crt-screen-glare,
  .crt-static-layer,
  .tv-room-noise,
  .fold-guide-overlay,
  .bottle-assembly-wrap,
  .flying-plane-layer,
  .foam-curtain-layer {
    display: none;
  }

  .story-slot,
  .story-slot :deep([data-tv-block]) {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    clip-path: none !important;
    pointer-events: auto !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .story-runway {
    height: auto;
  }

  .story-anchor {
    position: relative;
    top: auto;
  }

  .story-sticky {
    position: relative;
    height: auto;
    padding-top: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tv-studio-backdrop,
  .origami-backdrop,
  .crt-casing,
  .crt-screen-glare,
  .crt-static-layer,
  .tv-room-noise,
  .fold-guide-overlay,
  .bottle-assembly-wrap,
  .flying-plane-layer,
  .foam-curtain-layer {
    display: none;
  }

  .story-slot,
  .story-slot :deep([data-tv-block]) {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    clip-path: none !important;
    pointer-events: auto !important;
  }
}
</style>
