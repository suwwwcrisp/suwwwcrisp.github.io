<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useTheme } from '@/composables/useTheme';
import {
  createMikuToyMesh,
  disposeObject3D,
  MIKU_TOY_IDS,
  MIKU_TOY_LABELS,
  type MikuToyId,
} from '@/utils/createMiku3DToys';

const props = defineProps<{
  cardEl: HTMLElement | null;
  stageEl: HTMLElement | null;
}>();

const emit = defineEmits<{
  mikuCheer: [id: MikuToyId];
}>();

const { theme } = useTheme();
const stageRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

type ToyState = 'orbit' | 'dragging' | 'returning';

interface TargetScreenPos {
  left: number;
  top: number;
  visible: boolean;
  interactive: boolean;
  state: ToyState;
}

const hitTargets = reactive<Record<MikuToyId, TargetScreenPos>>({
  leek: { left: -200, top: -200, visible: false, interactive: false, state: 'orbit' },
  hairclip: { left: -200, top: -200, visible: false, interactive: false, state: 'orbit' },
  headset: { left: -200, top: -200, visible: false, interactive: false, state: 'orbit' },
  note: { left: -200, top: -200, visible: false, interactive: false, state: 'orbit' },
  capsule: { left: -200, top: -200, visible: false, interactive: false, state: 'orbit' },
});

interface PhysicsToy {
  id: MikuToyId;
  mesh: THREE.Group;
  state: ToyState;
  orbitOffset: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  scale: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  bobFreq: number;
  bobPhase: number;
  hopBoost: number;
  hovered: boolean;
  dragTargetX: number;
  dragTargetY: number;
  prevOrbitX: number;
  prevOrbitY: number;
}

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let envMapTex: THREE.Texture | null = null;
let hemiLight: THREE.HemisphereLight | null = null;
let keyLight: THREE.DirectionalLight | null = null;
let fillLight: THREE.DirectionalLight | null = null;
let rimLight: THREE.DirectionalLight | null = null;
let resizeObserver: ResizeObserver | null = null;
let rafId: number | null = null;

let stageWidth = 1440;
let stageHeight = 900;
let camZ = 1300;
let orbitPhase = 0.08;
let reducedMotion = false;
let initializedPositions = false;

const toys: PhysicsToy[] = [];

const SPIN_PRESETS: Array<[number, number, number, number, number]> = [
  [0.52, 0.94, 0.28, 1.35, 0.2],
  [-0.46, 0.82, -0.34, 1.55, 1.7],
  [0.38, -0.88, 0.24, 1.25, 3.1],
  [-0.56, 0.78, 0.32, 1.65, 4.4],
  [0.44, -0.96, -0.29, 1.45, 5.6],
];

function applyThemeLights() {
  if (!renderer) return;
  const isDark = theme.value === 'dark';
  renderer.toneMappingExposure = isDark ? 1.26 : 1.18;
  if (hemiLight) {
    hemiLight.color.setHex(isDark ? 0xbefcf7 : 0xf6feff);
    hemiLight.groundColor.setHex(isDark ? 0x162542 : 0xbddbef);
    hemiLight.intensity = isDark ? 0.68 : 0.76;
  }
  if (keyLight) {
    keyLight.intensity = isDark ? 1.32 : 1.38;
  }
  if (fillLight) {
    fillLight.intensity = isDark ? 0.85 : 0.72;
  }
  if (rimLight) {
    rimLight.intensity = isDark ? 0.82 : 0.64;
  }
}

watch(theme, () => {
  applyThemeLights();
});

function getStageMetrics() {
  const stageEl = stageRef.value;
  if (!stageEl) {
    return null;
  }
  const stageRect = stageEl.getBoundingClientRect();
  const lw = Math.max(320, stageEl.offsetWidth || stageRect.width);
  const lh = Math.max(320, stageEl.offsetHeight || stageRect.height);
  const sx = stageRect.width / lw || 1;
  const sy = stageRect.height / lh || 1;
  const centerX = stageRect.left + stageRect.width / 2;
  const centerY = stageRect.top + stageRect.height / 2;

  return { lw, lh, sx, sy, centerX, centerY };
}

function clientToStageLocal(clientX: number, clientY: number) {
  const m = getStageMetrics();
  if (!m) return { x: 0, y: 0, m: null };
  return {
    x: (clientX - m.centerX) / m.sx,
    y: -(clientY - m.centerY) / m.sy,
    m,
  };
}

function sampleRoundedRect(
  uRaw: number,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  rInput: number,
): { x: number; y: number } {
  const r = Math.min(rInput, hw * 0.8, hh * 0.8);
  const straightW = Math.max(1, (hw - r) * 2);
  const straightH = Math.max(1, (hh - r) * 2);
  const cornerArc = (Math.PI * r) / 2;
  const totalLen = 2 * straightW + 2 * straightH + 4 * cornerArc;

  let u = uRaw % 1;
  if (u < 0) u += 1;
  let d = u * totalLen;

  // 1. Top edge left -> right
  if (d <= straightW) {
    return { x: cx - (hw - r) + d, y: cy + hh };
  }
  d -= straightW;

  // 2. Top-right arc
  if (d <= cornerArc) {
    const a = Math.PI / 2 - (d / cornerArc) * (Math.PI / 2);
    return { x: cx + (hw - r) + Math.cos(a) * r, y: cy + (hh - r) + Math.sin(a) * r };
  }
  d -= cornerArc;

  // 3. Right edge top -> bottom
  if (d <= straightH) {
    return { x: cx + hw, y: cy + (hh - r) - d };
  }
  d -= straightH;

  // 4. Bottom-right arc
  if (d <= cornerArc) {
    const a = -(d / cornerArc) * (Math.PI / 2);
    return { x: cx + (hw - r) + Math.cos(a) * r, y: cy - (hh - r) + Math.sin(a) * r };
  }
  d -= cornerArc;

  // 5. Bottom edge right -> left
  if (d <= straightW) {
    return { x: cx + (hw - r) - d, y: cy - hh };
  }
  d -= straightW;

  // 6. Bottom-left arc
  if (d <= cornerArc) {
    const a = -Math.PI / 2 - (d / cornerArc) * (Math.PI / 2);
    return { x: cx - (hw - r) + Math.cos(a) * r, y: cy - (hh - r) + Math.sin(a) * r };
  }
  d -= cornerArc;

  // 7. Left edge bottom -> top
  if (d <= straightH) {
    return { x: cx - hw, y: cy - (hh - r) + d };
  }
  d -= straightH;

  // 8. Top-left arc
  const a = Math.PI - (d / cornerArc) * (Math.PI / 2);
  return { x: cx - (hw - r) + Math.cos(a) * r, y: cy + (hh - r) + Math.sin(a) * r };
}

function getOrbitBox(m: NonNullable<ReturnType<typeof getStageMetrics>>) {
  const cardRect = props.cardEl?.getBoundingClientRect();
  if (!cardRect || cardRect.width <= 0) {
    return {
      cx: 0,
      cy: 0,
      hw: m.lw * 0.45,
      hh: m.lh * 0.36,
      r: 36,
    };
  }

  const cardLeft = (cardRect.left - m.centerX) / m.sx;
  const cardRight = (cardRect.right - m.centerX) / m.sx;
  const cardTop = -(cardRect.top - m.centerY) / m.sy;
  const cardBottom = -(cardRect.bottom - m.centerY) / m.sy;

  const padX = Math.min(
    46,
    Math.max(22, ((window.innerWidth - cardRect.width) * 0.42) / m.sx),
  );
  const padY = 36;

  // Convert true viewport safe margins directly into stage-local space so nothing clips at 900px/820px bottom or navbar top
  const safeEdgeX = window.innerWidth <= 860 ? 20 : 46;
  const safeLeft = (safeEdgeX - m.centerX) / m.sx;
  const safeRight = (window.innerWidth - safeEdgeX - m.centerX) / m.sx;
  const safeTop = -(122 - m.centerY) / m.sy;
  const safeBot = -(window.innerHeight - 54 - m.centerY) / m.sy;

  const left = Math.max(safeLeft, cardLeft - padX);
  const right = Math.min(safeRight, cardRight + padX);
  const top = Math.min(safeTop, cardTop + padY);
  const bot = Math.max(safeBot, cardBottom - padY);

  return {
    cx: (left + right) / 2,
    cy: (top + bot) / 2,
    hw: Math.max(120, (right - left) / 2),
    hh: Math.max(120, (top - bot) / 2),
    r: 44,
  };
}

function hitTestMikuStage(clientX: number, clientY: number): boolean {
  const sRect = props.stageEl?.getBoundingClientRect();
  if (!sRect || sRect.width <= 0 || sRect.height <= 0) return false;
  const padX = sRect.width * 0.14;
  const padY = sRect.height * 0.1;
  return (
    clientX >= sRect.left + padX &&
    clientX <= sRect.right - padX &&
    clientY >= sRect.top + padY &&
    clientY <= sRect.bottom - padY
  );
}

// ---------------------------------------------------------------------------
// Pointer Drag Interaction (Isolated from OrbitControls on 3D Miku)
// ---------------------------------------------------------------------------
let activeDragToy: PhysicsToy | null = null;
let activePointerId: number | null = null;
let downClientX = 0;
let downClientY = 0;
let lastPointerClientX = 0;
let lastPointerClientY = 0;
let lastMoveTimeMs = 0;
let dragVelX = 0;
let dragVelY = 0;
let dragHasMoved = false;

function findToy(id: MikuToyId): PhysicsToy | undefined {
  return toys.find((t) => t.id === id);
}

function handleToyPointerEnter(id: MikuToyId) {
  const toy = findToy(id);
  if (toy) toy.hovered = true;
}

function handleToyPointerLeave(id: MikuToyId) {
  const toy = findToy(id);
  if (toy && activeDragToy?.id !== id) toy.hovered = false;
}

function handleToyPointerDown(id: MikuToyId, e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  const toy = findToy(id);
  if (!toy) return;

  e.preventDefault();
  e.stopPropagation();

  const el = e.currentTarget as HTMLElement | null;
  if (el) {
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic capture failures
    }
  }

  activeDragToy = toy;
  activePointerId = e.pointerId;
  downClientX = e.clientX;
  downClientY = e.clientY;
  lastPointerClientX = e.clientX;
  lastPointerClientY = e.clientY;
  lastMoveTimeMs = performance.now();
  dragVelX = 0;
  dragVelY = 0;
  dragHasMoved = false;

  toy.state = 'dragging';
  hitTargets[id].state = 'dragging';

  const { x: lx, y: ly } = clientToStageLocal(e.clientX, e.clientY);
  const dragZFactor = (camZ - 115) / camZ;
  toy.dragTargetX = lx * dragZFactor;
  toy.dragTargetY = ly * dragZFactor;
  toy.vx = 0;
  toy.vy = 0;
}

function handleToyPointerMove(id: MikuToyId, e: PointerEvent) {
  if (!activeDragToy || activeDragToy.id !== id || activePointerId !== e.pointerId) {
    return;
  }
  e.stopPropagation();

  if (!dragHasMoved && Math.hypot(e.clientX - downClientX, e.clientY - downClientY) > 6) {
    dragHasMoved = true;
    lastMoveTimeMs = performance.now();
    dragVelX = 0;
    dragVelY = 0;
  }

  const { x: lx, y: ly, m } = clientToStageLocal(e.clientX, e.clientY);
  const dragZFactor = (camZ - 115) / camZ;
  activeDragToy.dragTargetX = lx * dragZFactor;
  activeDragToy.dragTargetY = ly * dragZFactor;

  const nowMs = performance.now();
  const moveDt = Math.max(0.008, (nowMs - lastMoveTimeMs) / 1000);
  lastMoveTimeMs = nowMs;

  const dx = e.clientX - lastPointerClientX;
  const dy = e.clientY - lastPointerClientY;
  lastPointerClientX = e.clientX;
  lastPointerClientY = e.clientY;

  const instVx = dx / (m?.sx || 1) / moveDt;
  const instVy = -dy / (m?.sy || 1) / moveDt;
  dragVelX = dragVelX * 0.45 + instVx * 0.55;
  dragVelY = dragVelY * 0.45 + instVy * 0.55;

  activeDragToy.rotY += dx * 0.014;
  activeDragToy.rotX -= dy * 0.014;
}

function finishToyDrag(id: MikuToyId, e: PointerEvent, isCancel: boolean) {
  if (!activeDragToy || activeDragToy.id !== id || activePointerId !== e.pointerId) {
    return;
  }
  e.stopPropagation();

  const el = e.currentTarget as HTMLElement | null;
  if (el) {
    try {
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore release errors
    }
  }

  const toy = activeDragToy;
  const releaseVx = dragVelX;
  const releaseVy = dragVelY;
  const wasDragMove = dragHasMoved;
  const releaseRecent = performance.now() - lastMoveTimeMs < 90;
  activeDragToy = null;
  activePointerId = null;
  dragHasMoved = false;
  dragVelX = 0;
  dragVelY = 0;
  toy.hovered = false;

  // Tap/click without dragging -> Cheerful 3D spin-hop + note burst
  if (!isCancel && !wasDragMove) {
    toy.hopBoost = 1.0;
    toy.state = 'orbit';
    hitTargets[id].state = 'orbit';
    window.dispatchEvent(
      new CustomEvent('miku-note-burst', {
        detail: {
          x: e.clientX,
          y: e.clientY,
          count: 10,
        },
      }),
    );
    return;
  }

  // Drop near 3D Miku -> Trigger cheer halo + rich note celebration before floating home
  if (!isCancel && wasDragMove && hitTestMikuStage(e.clientX, e.clientY)) {
    emit('mikuCheer', id);
    const sRect = props.stageEl?.getBoundingClientRect();
    window.dispatchEvent(
      new CustomEvent('miku-note-burst', {
        detail: {
          x: sRect ? sRect.left + sRect.width / 2 : e.clientX,
          y: sRect ? sRect.top + sRect.height / 2 : e.clientY,
          count: 18,
        },
      }),
    );
  }

  // Released outside -> Slow buoyant zero-overshoot glide onto outer orbit
  toy.state = 'returning';
  hitTargets[id].state = 'returning';
  toy.vx = releaseRecent ? THREE.MathUtils.clamp(releaseVx * 0.14, -75, 75) : 0;
  toy.vy = releaseRecent ? THREE.MathUtils.clamp(releaseVy * 0.14, -75, 75) : 0;
  toy.vz = 0;
}

// ---------------------------------------------------------------------------
// Three.js Renderer Sizing & Main Animation Loop
// ---------------------------------------------------------------------------
function updateRendererSize() {
  const stageEl = stageRef.value;
  if (!stageEl || !renderer || !camera) return;

  const w = Math.max(320, stageEl.offsetWidth || window.innerWidth);
  const h = Math.max(320, stageEl.offsetHeight || window.innerHeight);
  stageWidth = w;
  stageHeight = h;

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);

  const fovDeg = 38;
  camZ = h / 2 / Math.tan(THREE.MathUtils.degToRad(fovDeg / 2));
  camera.fov = fovDeg;
  camera.aspect = w / h;
  camera.near = 20;
  camera.far = camZ + 1200;
  camera.position.set(0, 0, camZ);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

onMounted(() => {
  const canvas = canvasRef.value;
  const stageEl = stageRef.value;
  if (!canvas || !stageEl) return;

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(38, 1, 20, 3000);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  envMapTex = pmrem.fromScene(envScene, 0.04).texture;
  scene.environment = envMapTex;
  envScene.dispose();
  pmrem.dispose();

  hemiLight = new THREE.HemisphereLight(0xf6feff, 0xbddbef, 0.76);
  scene.add(hemiLight);

  keyLight = new THREE.DirectionalLight(0xffffff, 1.38);
  keyLight.position.set(360, 480, 640);
  scene.add(keyLight);

  fillLight = new THREE.DirectionalLight(0x7af4ea, 0.72);
  fillLight.position.set(-420, 120, 340);
  scene.add(fillLight);

  rimLight = new THREE.DirectionalLight(0xff84c4, 0.64);
  rimLight.position.set(240, -340, 260);
  scene.add(rimLight);

  applyThemeLights();
  updateRendererSize();

  for (let i = 0; i < MIKU_TOY_IDS.length; i += 1) {
    const id = MIKU_TOY_IDS[i];
    const mesh = createMikuToyMesh(id);
    scene.add(mesh);

    const [sx, sy, sz, bf, bp] = SPIN_PRESETS[i];
    toys.push({
      id,
      mesh,
      state: 'orbit',
      orbitOffset: i / MIKU_TOY_IDS.length,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      scale: 0.9,
      rotX: i * 0.45,
      rotY: i * 0.8,
      rotZ: i * 0.25,
      spinX: sx,
      spinY: sy,
      spinZ: sz,
      bobFreq: bf,
      bobPhase: bp,
      hopBoost: 0,
      hovered: false,
      dragTargetX: 0,
      dragTargetY: 0,
      prevOrbitX: 0,
      prevOrbitY: 0,
    });
  }

  resizeObserver = new ResizeObserver(() => {
    updateRendererSize();
  });
  resizeObserver.observe(stageEl);

  let prevTime = performance.now();
  const loop = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - prevTime) * 0.001));
    prevTime = now;
    const nowSec = now * 0.001;

    const m = getStageMetrics();
    if (m && renderer && scene && camera) {
      const box = getOrbitBox(m);
      const baseScale = Math.max(0.76, Math.min(1.24, stageWidth / 1120));

      const anyHovered = toys.some((t) => t.hovered && t.state === 'orbit');
      if (!reducedMotion) {
        const orbitSpeed = anyHovered ? 0.006 : 0.025;
        orbitPhase = (orbitPhase + orbitSpeed * dt) % 1;
      }

      const outerFade = Math.max(
        0,
        Math.min(1, 1 - window.scrollY / (window.innerHeight * 0.42)),
      );

      for (let i = 0; i < toys.length; i += 1) {
        const toy = toys[i];
        if (toy.hopBoost > 0) {
          toy.hopBoost = Math.max(0, toy.hopBoost - dt * 1.45);
        }

        const orbitPt = sampleRoundedRect(
          orbitPhase + toy.orbitOffset,
          box.cx,
          box.cy,
          box.hw,
          box.hh,
          box.r,
        );
        const bobY = reducedMotion
          ? 0
          : Math.sin(nowSec * toy.bobFreq + toy.bobPhase) * 4.5;
        const orbitTargetX = orbitPt.x;
        const orbitTargetY = orbitPt.y + bobY;

        if (!initializedPositions) {
          toy.x = orbitTargetX;
          toy.y = orbitTargetY;
          toy.z = 0;
          toy.scale = baseScale;
          toy.prevOrbitX = orbitTargetX;
          toy.prevOrbitY = orbitTargetY;
        }

        const targetVx = initializedPositions
          ? THREE.MathUtils.clamp((orbitTargetX - toy.prevOrbitX) / dt, -220, 220)
          : 0;
        const targetVy = initializedPositions
          ? THREE.MathUtils.clamp((orbitTargetY - toy.prevOrbitY) / dt, -220, 220)
          : 0;
        toy.prevOrbitX = orbitTargetX;
        toy.prevOrbitY = orbitTargetY;

        if (toy.state === 'orbit') {
          toy.x += (orbitTargetX - toy.x) * Math.min(1, 8.5 * dt);
          toy.y += (orbitTargetY - toy.y) * Math.min(1, 8.5 * dt);
          toy.z += (0 - toy.z) * Math.min(1, 8.5 * dt);
          const targetS = baseScale * (toy.hovered ? 1.15 : 1.0);
          toy.scale += (targetS - toy.scale) * Math.min(1, 10 * dt);

          if (!reducedMotion) {
            const spinMult = toy.hovered ? 0.25 : 1.0;
            toy.rotX += (toy.spinX * spinMult + toy.hopBoost * 4.2) * dt;
            toy.rotY += (toy.spinY * spinMult + toy.hopBoost * 10.5) * dt;
            toy.rotZ += toy.spinZ * spinMult * dt;
          }
        } else if (toy.state === 'dragging') {
          toy.x += (toy.dragTargetX - toy.x) * Math.min(1, 24 * dt);
          toy.y += (toy.dragTargetY - toy.y) * Math.min(1, 24 * dt);
          toy.z += (115 - toy.z) * Math.min(1, 16 * dt);
          toy.scale += (baseScale * 1.15 - toy.scale) * Math.min(1, 14 * dt);
        } else if (toy.state === 'returning') {
          // Overdamped spring with velocity feedforward (zeta ~ 1.11 > 1): ~1.4-1.8s serene glide, zero overshoot, zero lag
          const k = 13.5;
          const damp = 8.15;
          const ax = (orbitTargetX - toy.x) * k + (targetVx - toy.vx) * damp;
          const ay = (orbitTargetY - toy.y) * k + (targetVy - toy.vy) * damp;
          const az = (0 - toy.z) * k - toy.vz * damp;

          toy.vx += ax * dt;
          toy.vy += ay * dt;
          toy.vz += az * dt;
          toy.x += toy.vx * dt;
          toy.y += toy.vy * dt;
          toy.z += toy.vz * dt;
          toy.scale += (baseScale - toy.scale) * Math.min(1, 2.8 * dt);

          if (!reducedMotion) {
            toy.rotX += toy.spinX * 1.05 * dt;
            toy.rotY += toy.spinY * 1.05 * dt;
          }

          const dist = Math.hypot(orbitTargetX - toy.x, orbitTargetY - toy.y, toy.z);
          const relSpd = Math.hypot(toy.vx - targetVx, toy.vy - targetVy, toy.vz);
          if (dist < 10 && relSpd < 26) {
            toy.state = 'orbit';
            hitTargets[toy.id].state = 'orbit';
          }
        }

        const hopWave = toy.hopBoost > 0 ? Math.sin(toy.hopBoost * Math.PI) : 0;
        const hopZ = hopWave * 58;
        const effectiveFade = toy.state === 'dragging' ? 1 : outerFade;
        const finalScale = toy.scale * (1 + hopWave * 0.24) * effectiveFade;

        toy.mesh.visible = finalScale > 0.018;
        toy.mesh.position.set(toy.x, toy.y, toy.z + hopZ);
        toy.mesh.scale.setScalar(Math.max(0.001, finalScale));
        toy.mesh.rotation.set(toy.rotX, toy.rotY, toy.rotZ);

        // Perspective project mesh center -> hit-target button coordinates
        const persp = camZ / Math.max(40, camZ - (toy.z + hopZ));
        hitTargets[toy.id].left = stageWidth / 2 + toy.x * persp;
        hitTargets[toy.id].top = stageHeight / 2 - toy.y * persp;
        hitTargets[toy.id].visible = toy.mesh.visible;
        hitTargets[toy.id].interactive =
          toy.state === 'dragging' || outerFade >= 0.28;
        hitTargets[toy.id].state = toy.state;
      }

      initializedPositions = true;
      renderer.render(scene, camera);
    }

    rafId = window.requestAnimationFrame(loop);
  };

  rafId = window.requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
  resizeObserver?.disconnect();
  resizeObserver = null;

  for (const t of toys) {
    disposeObject3D(t.mesh);
  }
  toys.length = 0;

  envMapTex?.dispose();
  envMapTex = null;
  renderer?.dispose();
  renderer = null;
  scene = null;
  camera = null;
});
</script>

<template>
  <div ref="stageRef" class="hero-orbit-stage">
    <canvas ref="canvasRef" class="hero-orbit-canvas" aria-hidden="true" />

    <!-- Invisible Pointer Hit Targets Tracking Each Glossy 3D Object 1:1 (Zero Visible Text) -->
    <div class="hero-orbit-targets">
      <button
        v-for="id in MIKU_TOY_IDS"
        :key="id"
        type="button"
        class="orbit-hit-target"
        :class="{
          'is-dragging': hitTargets[id].state === 'dragging',
        }"
        :style="{
          left: `${hitTargets[id].left}px`,
          top: `${hitTargets[id].top}px`,
          pointerEvents: hitTargets[id].interactive ? 'auto' : 'none',
          visibility: hitTargets[id].visible ? 'visible' : 'hidden',
        }"
        :data-miku-orbit-toy="id"
        :data-toy-state="hitTargets[id].state"
        :aria-label="MIKU_TOY_LABELS[id]"
        @pointerenter="handleToyPointerEnter(id)"
        @pointerleave="handleToyPointerLeave(id)"
        @pointerdown="handleToyPointerDown(id, $event)"
        @pointermove="handleToyPointerMove(id, $event)"
        @pointerup="finishToyDrag(id, $event, false)"
        @pointercancel="finishToyDrag(id, $event, true)"
      />
    </div>
  </div>
</template>

<style scoped>
.hero-orbit-stage {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 6;
}

.hero-orbit-canvas {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  filter: drop-shadow(0 12px 16px rgba(20, 86, 108, 0.2));
}

[data-theme='dark'] .hero-orbit-canvas {
  filter: drop-shadow(0 14px 20px rgba(0, 0, 0, 0.6));
}

.hero-orbit-targets {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 7;
}

.orbit-hit-target {
  position: absolute;
  width: 86px;
  height: 86px;
  margin-left: -43px;
  margin-top: -43px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: transparent;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.orbit-hit-target.is-dragging {
  cursor: grabbing;
  z-index: 20;
}
</style>
