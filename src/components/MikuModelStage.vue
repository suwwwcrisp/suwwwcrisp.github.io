<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MMDLoader } from 'three/examples/jsm/loaders/MMDLoader.js';
import { CCDIKSolver, type IK } from 'three/examples/jsm/animation/CCDIKSolver.js';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { siteConfig } from '@/data/siteConfig';
import { useTheme } from '@/composables/useTheme';

const emit = defineEmits<{
  openGuide: [];
}>();

const { theme } = useTheme();

const stageRef = ref<HTMLElement | null>(null);
const canvasWrapRef = ref<HTMLElement | null>(null);

const isLoading = ref(true);
const hasCustomModel = ref(false);
const loadError = ref('');

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let resizeObserver: ResizeObserver | null = null;
let resizeRafId: number | null = null;
let rafId: number | null = null;
let mixer: THREE.AnimationMixer | null = null;
let dracoLoader: DRACOLoader | null = null;
let activeVrm: VRM | null = null;
let characterRoot: THREE.Group | null = null;

// MMD live animation, IK solver & secondary-motion physics state
let mmdMeshRef: THREE.SkinnedMesh | null = null;
let ikSolver: CCDIKSolver | null = null;
let mmdChestBone: THREE.Bone | null = null;
let mmdHeadBone: THREE.Bone | null = null;
let mmdBlinkIdx = -1;
let isMmdActive = false;
let isDraggingStage = false;

const RIGHT_ELBOW_AXIS = new THREE.Vector3(-0.667, 0.745, 0).normalize();
const LEFT_ELBOW_AXIS = new THREE.Vector3(-0.667, -0.745, 0).normalize();
const mmdBaseRot = {
  chestX: -0.04,
  headZ: 0.07,
};

interface ChainSeg {
  bone: THREE.Bone;
  baseQuat: THREE.Quaternion;
  restDroopX: number;
  angleY: number;
  velY: number;
  angleX: number;
  velX: number;
}

interface SkirtBoneItem {
  bone: THREE.Bone;
  baseQuat: THREE.Quaternion;
  weight: number;
  outwardAxis: THREE.Vector3;
  localUpAxis: THREE.Vector3;
}

interface SpringScalar {
  val: number;
  vel: number;
}

let ribbonChains: ChainSeg[][] = [];
let twinTailChains: ChainSeg[][] = [];
let sideLockChains: ChainSeg[][] = [];
let skirtOuterItems: SkirtBoneItem[] = [];
let skirtInnerItems: SkirtBoneItem[] = [];

const skirtOuterLag: SpringScalar = { val: 0, vel: 0 };
const skirtOuterFlare: SpringScalar = { val: 0, vel: 0 };
const skirtInnerLag: SpringScalar = { val: 0, vel: 0 };
const skirtInnerFlare: SpringScalar = { val: 0, vel: 0 };

let prevAzimuth = 0;
let prevCharRotY = 0;
let smoothedOmega = 0;

// Reusable math temporaries
const tmpQuatA = new THREE.Quaternion();
const tmpQuatB = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
const tmpVecWorld = new THREE.Vector3();

let ambientLight: THREE.AmbientLight | null = null;
let keyLight: THREE.DirectionalLight | null = null;
let fillLight: THREE.DirectionalLight | null = null;
let rimLight: THREE.PointLight | null = null;
let hemiLight: THREE.HemisphereLight | null = null;

// Clean full-body turntable framing (tall arcueidblog-matched showcase + full bonnet & shoes visible)
const DEFAULT_CAM_POS = new THREE.Vector3(0, 1.13, 3.88);
const DEFAULT_TARGET = new THREE.Vector3(0, 1.09, 0);

function applyThemeLighting() {
  const isDark = theme.value === 'dark';
  if (isMmdActive) {
    if (ambientLight) ambientLight.intensity = isDark ? 0.22 : 0.16;
    if (hemiLight) {
      hemiLight.color.setHex(isDark ? 0x99f2ec : 0xf4fbff);
      hemiLight.groundColor.setHex(isDark ? 0x152538 : 0xc8e3eb);
      hemiLight.intensity = isDark ? 0.34 : 0.28;
    }
    if (keyLight) {
      keyLight.color.setHex(0xfffaf6);
      keyLight.intensity = isDark ? 0.85 : 0.86;
    }
    if (fillLight) fillLight.intensity = isDark ? 0.24 : 0.2;
    if (rimLight) {
      rimLight.color.setHex(0x39c5bb);
      rimLight.intensity = isDark ? 1.15 : 0.95;
    }
    return;
  }

  if (ambientLight) ambientLight.intensity = isDark ? 0.55 : 0.7;
  if (hemiLight) {
    hemiLight.color.setHex(isDark ? 0xaaf7f2 : 0xffffff);
    hemiLight.groundColor.setHex(isDark ? 0x152538 : 0xe4f5f8);
    hemiLight.intensity = isDark ? 0.75 : 0.88;
  }
  if (keyLight) {
    keyLight.color.setHex(0xffffff);
    keyLight.intensity = isDark ? 1.15 : 1.22;
  }
  if (fillLight) fillLight.intensity = isDark ? 0.65 : 0.68;
  if (rimLight) {
    rimLight.color.setHex(0x39c5bb);
    rimLight.intensity = isDark ? 2.2 : 1.05;
  }
}

/**
 * Scales strictly by vertical height and centers X/Z on the character's spine bone
 * so long trailing ribbons never shift the pivot off-center ("invisible pillar" fix).
 */
function normalizeModel(obj: THREE.Object3D, mmdMesh?: THREE.SkinnedMesh) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);

  // Scale strictly by height so full bonnet + shoes fit cleanly
  const scale = 1.98 / Math.max(0.001, size.y);
  obj.scale.setScalar(scale);

  obj.updateMatrixWorld(true);
  box.setFromObject(obj);

  if (mmdMesh) {
    const bones = mmdMesh.skeleton?.bones ?? [];
    const spineBone =
      bones.find((b) => b.name === 'センター') ??
      bones.find((b) => b.name === '腰') ??
      bones.find((b) => b.name === '下半身');

    if (spineBone) {
      spineBone.getWorldPosition(tmpVecWorld);
      obj.position.x -= tmpVecWorld.x;
      obj.position.z -= tmpVecWorld.z;
    } else {
      box.getCenter(center);
      obj.position.x -= center.x;
      obj.position.z -= center.z;
    }
  } else {
    box.getCenter(center);
    obj.position.x -= center.x;
    obj.position.z -= center.z;
  }

  // Lift shoes comfortably above bottom canvas edge
  obj.position.y += -box.min.y + 0.1;
  obj.updateMatrixWorld(true);
}

function relaxVrmPose(vrm: VRM) {
  const leftArm = vrm.humanoid?.getNormalizedBoneNode('leftUpperArm');
  const rightArm = vrm.humanoid?.getNormalizedBoneNode('rightUpperArm');
  if (leftArm) leftArm.rotation.z = 1.15;
  if (rightArm) rightArm.rotation.z = -1.15;
}

/**
 * Poses Miku into an adorable, balanced Two-Hand Chest Heart Pose (双手胸前比爱心)
 * using pure single-axis elbow hinges and MMD helper WIK bones solved by CCDIKSolver.
 */
function poseMmdCharacter(mesh: THREE.SkinnedMesh) {
  const bones = mesh.skeleton?.bones ?? [];
  const byName = new Map<string, THREE.Bone>();
  bones.forEach((b) => byName.set(b.name, b));

  const setRot = (name: string, x: number, y: number, z: number) => {
    const b = byName.get(name);
    if (b) b.rotation.set(x, y, z);
    return b ?? null;
  };

  // Upright, graceful idol stance with subtle gentle head tilt
  setRot('下半身', 0, 0, 0);
  setRot('上半身', -0.02, 0, 0);
  mmdChestBone = setRot('上半身2', mmdBaseRot.chestX, 0, 0);
  setRot('首', 0.03, 0, 0.03);
  mmdHeadBone = setRot('頭', 0.05, 0.04, mmdBaseRot.headZ);

  const leftUpperAxis = new THREE.Vector3(0.7452, -0.6664, 0.026).normalize();
  const rightUpperAxis = new THREE.Vector3(-0.7452, -0.6664, 0.026).normalize();
  const leftForeAxis = new THREE.Vector3(0.7647, -0.6441, -0.0197).normalize();
  const rightForeAxis = new THREE.Vector3(-0.7647, -0.6441, -0.0197).normalize();

  // Symmetric Front-View Two-Hand Chest Heart Pose (FK-verified against miku.pmx)
  // Left Arm (viewer's right)
  setRot('左肩', 0, -0.165, -0.266);
  setRot('左腕', -0.378, 0.316, -0.19);
  const leftTwist = byName.get('左腕捩');
  if (leftTwist) {
    leftTwist.quaternion.setFromAxisAngle(leftUpperAxis, 0.58);
  }
  const leftElbow = byName.get('左ひじ');
  if (leftElbow) {
    leftElbow.quaternion.setFromAxisAngle(LEFT_ELBOW_AXIS, 1.927);
  }
  const leftForeTwist = byName.get('左手捩');
  if (leftForeTwist) {
    leftForeTwist.quaternion.setFromAxisAngle(leftForeAxis, 1.065);
  }
  setRot('左手首', -0.2, -0.589, 0.575);

  // Right Arm (exact YZ-plane mirror of Left Arm, viewer's left)
  setRot('右肩', 0, 0.165, 0.266);
  setRot('右腕', -0.378, -0.316, 0.19);
  const rightTwist = byName.get('右腕捩');
  if (rightTwist) {
    rightTwist.quaternion.setFromAxisAngle(rightUpperAxis, -0.58);
  }
  const rightElbow = byName.get('右ひじ');
  if (rightElbow) {
    rightElbow.quaternion.setFromAxisAngle(RIGHT_ELBOW_AXIS, 1.927);
  }
  const rightForeTwist = byName.get('右手捩');
  if (rightForeTwist) {
    rightForeTwist.quaternion.setFromAxisAngle(rightForeAxis, -1.065);
  }
  setRot('右手首', -0.2, 0.589, -0.575);

  // Upper heart arches: coplanar curved 4 fingers aligned smoothly at Z~3.01 to avoid side prongs
  const fingerCurvature = [
    { base: '人指', x1: 0, c1: 0.413, c2: 1.211, c3: 0.565, ySpread: 0.368 },
    { base: '中指', x1: -0.263, c1: 0.365, c2: 1.173, c3: 0.536, ySpread: 0.621 },
    { base: '薬指', x1: -0.526, c1: 0.317, c2: 1.134, c3: 0.507, ySpread: 0.874 },
    { base: '小指', x1: -0.789, c1: 0.269, c2: 1.096, c3: 0.479, ySpread: 1.127 },
  ];

  fingerCurvature.forEach(({ base, x1, c1, c2, c3, ySpread }) => {
    setRot(`左${base}１`, x1, ySpread, -c1);
    setRot(`左${base}２`, 0, 0, -c2);
    setRot(`左${base}３`, 0, 0, -c3);

    setRot(`右${base}１`, x1, -ySpread, c1);
    setRot(`右${base}２`, 0, 0, c2);
    setRot(`右${base}３`, 0, 0, c3);
  });

  // Bottom heart tip: thumbs meeting cleanly at the lower V point
  setRot('左親指０', -0.287, -0.452, -0.955);
  setRot('左親指１', -0.268, 0, 0.026);
  setRot('左親指２', 0, 0, -0.132);

  setRot('右親指０', -0.287, 0.452, 0.955);
  setRot('右親指１', -0.268, 0, -0.026);
  setRot('右親指２', 0, 0, 0.132);

  // Sweet warm smile + blink setup
  if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
    const smileIdx =
      mesh.morphTargetDictionary['笑い'] ??
      mesh.morphTargetDictionary['にっこり'] ??
      mesh.morphTargetDictionary['あ２'];
    if (typeof smileIdx === 'number') {
      mesh.morphTargetInfluences[smileIdx] = 0.24;
    }
    const blinkIdx = mesh.morphTargetDictionary['まばたき'];
    if (typeof blinkIdx === 'number') {
      mmdBlinkIdx = blinkIdx;
    }
  }

  mesh.updateMatrixWorld(true);
}

function parseChainBones(
  bones: THREE.Bone[],
  prefix: string,
  restDroopPeak: number,
  restDroopTailRatio: number,
): ChainSeg[] {
  const matched: Array<{ seg: number; bone: THREE.Bone }> = [];
  for (const b of bones) {
    if (!b.name.startsWith(`${prefix}_`)) continue;
    const parts = b.name.split('_');
    const seg = Number(parts[1]);
    if (Number.isFinite(seg)) {
      matched.push({ seg, bone: b });
    }
  }
  matched.sort((a, b) => a.seg - b.seg);
  const len = matched.length;
  return matched.map((m, i) => {
    const t = len > 1 ? i / (len - 1) : 0;
    const restDroopX = restDroopPeak * (1 - t * (1 - restDroopTailRatio));
    return {
      bone: m.bone,
      baseQuat: m.bone.quaternion.clone(),
      restDroopX,
      angleY: 0,
      velY: 0,
      angleX: restDroopX,
      velX: 0,
    };
  });
}

function buildSkirtItems(
  bones: THREE.Bone[],
  prefix: string,
  minRow: number,
  maxRow: number,
): SkirtBoneItem[] {
  const items: SkirtBoneItem[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const invWorldQuat = new THREE.Quaternion();

  for (const b of bones) {
    if (!b.name.startsWith(`${prefix}_`)) continue;
    const parts = b.name.split('_');
    const row = Number(parts[1]);
    if (!Number.isFinite(row) || row < minRow) continue;

    b.getWorldPosition(tmpVecWorld);
    b.getWorldQuaternion(invWorldQuat).invert();

    const radial = new THREE.Vector3(tmpVecWorld.x, 0, tmpVecWorld.z);
    if (radial.lengthSq() < 1e-5) {
      radial.set(0, 0, 1);
    } else {
      radial.normalize();
    }

    const outwardAxis = new THREE.Vector3()
      .crossVectors(radial, up)
      .normalize()
      .applyQuaternion(invWorldQuat)
      .normalize();
    const localUpAxis = up.clone().applyQuaternion(invWorldQuat).normalize();

    const normRow = Math.min(1, Math.max(0, (row - minRow) / Math.max(1, maxRow - minRow)));
    const weight = Math.pow(normRow, 1.3);

    items.push({
      bone: b,
      baseQuat: b.quaternion.clone(),
      weight,
      outwardAxis,
      localUpAxis,
    });
  }
  return items;
}

function applyInitialChainDrape(chains: ChainSeg[][]) {
  for (const chain of chains) {
    for (const seg of chain) {
      tmpEuler.set(seg.restDroopX, 0, 0, 'YXZ');
      tmpQuatA.setFromEuler(tmpEuler);
      seg.bone.quaternion.copy(seg.baseQuat).multiply(tmpQuatA);
    }
  }
}

function initMmdSecondaryPhysics(mesh: THREE.SkinnedMesh) {
  const bones = mesh.skeleton?.bones ?? [];
  mesh.updateMatrixWorld(true);

  ribbonChains = [
    parseChainBones(bones, '右6666', -0.058, 0.25),
    parseChainBones(bones, '左6666', -0.058, 0.25),
  ].filter((c) => c.length > 0);
  applyInitialChainDrape(ribbonChains);

  twinTailChains = [
    parseChainBones(bones, '33333', -0.022, 0.45),
    parseChainBones(bones, '4444', -0.022, 0.45),
  ].filter((c) => c.length > 0);
  applyInitialChainDrape(twinTailChains);

  sideLockChains = [
    parseChainBones(bones, '右头发1', -0.012, 0.5),
    parseChainBones(bones, '左头发1', -0.012, 0.5),
  ].filter((c) => c.length > 0);
  applyInitialChainDrape(sideLockChains);

  skirtOuterItems = buildSkirtItems(bones, '1212', 4, 15);
  skirtInnerItems = buildSkirtItems(bones, '1414', 5, 19);

  skirtOuterLag.val = 0;
  skirtOuterLag.vel = 0;
  skirtOuterFlare.val = 0;
  skirtOuterFlare.vel = 0;
  skirtInnerLag.val = 0;
  skirtInnerLag.vel = 0;
  skirtInnerFlare.val = 0;
  skirtInnerFlare.vel = 0;
}

function stepSpring(
  state: SpringScalar,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const acc = stiffness * (target - state.val) - damping * state.vel;
  state.vel += acc * dt;
  state.val += state.vel * dt;
}

function updateChainGroup(
  chains: ChainSeg[][],
  omega: number,
  elapsed: number,
  dt: number,
  cfg: {
    stiffness: number;
    damping: number;
    dragGain: number;
    maxAngleY: number;
    liftGainX: number;
    maxLiftX: number;
    waveAmp: number;
    waveSpeed: number;
    wavePhaseStep: number;
    tipMultiplier: number;
  },
) {
  const speed = Math.abs(omega);

  for (let cIdx = 0; cIdx < chains.length; cIdx++) {
    const chain = chains[cIdx];
    const len = chain.length;
    for (let i = 0; i < len; i++) {
      const seg = chain[i];
      const t = len > 1 ? i / (len - 1) : 1;
      const segScale = 0.25 + cfg.tipMultiplier * Math.pow(t, 1.12);

      const idleWave =
        Math.sin(elapsed * cfg.waveSpeed - i * cfg.wavePhaseStep + cIdx * 1.1) *
        cfg.waveAmp *
        (0.2 + t * 0.8);

      const targetY = THREE.MathUtils.clamp(
        -omega * cfg.dragGain * segScale + idleWave,
        -cfg.maxAngleY,
        cfg.maxAngleY,
      );

      const centrifugalLift = Math.min(
        cfg.maxLiftX,
        speed * cfg.liftGainX * (0.35 + t * 0.65),
      );
      const targetX = seg.restDroopX + centrifugalLift + idleWave * 0.35;

      const accY =
        cfg.stiffness * (targetY - seg.angleY) - cfg.damping * seg.velY;
      seg.velY += accY * dt;
      seg.angleY += seg.velY * dt;

      const accX =
        cfg.stiffness * (targetX - seg.angleX) - cfg.damping * seg.velX;
      seg.velX += accX * dt;
      seg.angleX += seg.velX * dt;

      tmpEuler.set(seg.angleX, seg.angleY, seg.angleY * 0.32, 'YXZ');
      tmpQuatA.setFromEuler(tmpEuler);
      seg.bone.quaternion.copy(seg.baseQuat).multiply(tmpQuatA);
    }
  }
}

function updateSkirtLayer(
  items: SkirtBoneItem[],
  lagState: SpringScalar,
  flareState: SpringScalar,
  omega: number,
  dt: number,
  cfg: {
    stiffness: number;
    damping: number;
    dragGain: number;
    maxLag: number;
    flareGain: number;
    maxFlare: number;
  },
) {
  const speed = Math.abs(omega);
  const targetLag = THREE.MathUtils.clamp(
    -omega * cfg.dragGain,
    -cfg.maxLag,
    cfg.maxLag,
  );
  const targetFlare = THREE.MathUtils.clamp(speed * cfg.flareGain, 0, cfg.maxFlare);

  stepSpring(lagState, targetLag, cfg.stiffness, cfg.damping, dt);
  stepSpring(flareState, targetFlare, cfg.stiffness * 0.85, cfg.damping * 0.95, dt);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.weight <= 0.001) continue;
    const twistAngle = lagState.val * item.weight;
    const flareAngle = flareState.val * item.weight;

    tmpQuatA.setFromAxisAngle(item.localUpAxis, twistAngle);
    tmpQuatB.setFromAxisAngle(item.outwardAxis, flareAngle);

    item.bone.quaternion
      .copy(item.baseQuat)
      .multiply(tmpQuatB)
      .multiply(tmpQuatA);
  }
}

function wrapDeltaAngle(d: number): number {
  let a = d;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function updateMmdSecondaryPhysics(elapsed: number, dt: number) {
  if (!mmdMeshRef || !controls || !characterRoot) return;

  const az = controls.getAzimuthalAngle();
  const charRotY = characterRoot.rotation.y;
  const dAz = wrapDeltaAngle(az - prevAzimuth);
  const dChar = wrapDeltaAngle(charRotY - prevCharRotY);
  prevAzimuth = az;
  prevCharRotY = charRotY;

  const rawOmega = dt > 0.0005 ? (-dAz + dChar) / dt : 0;
  // Deadzone keeps gentle idle showcase spin draped down by gravity; active dragging triggers dramatic lift!
  const effectiveOmega = Math.abs(rawOmega) < 0.45 ? 0 : rawOmega;
  const clampedOmega = THREE.MathUtils.clamp(effectiveOmega, -12, 12);
  smoothedOmega = THREE.MathUtils.lerp(
    smoothedOmega,
    clampedOmega,
    Math.min(1, dt * 16),
  );

  // 1. Translucent back ribbons (6666)
  updateChainGroup(ribbonChains, smoothedOmega, elapsed, dt, {
    stiffness: 9,
    damping: 2.0,
    dragGain: 0.115,
    maxAngleY: 0.25,
    liftGainX: 0.048,
    maxLiftX: 0.125,
    waveAmp: 0.018,
    waveSpeed: 2.4,
    wavePhaseStep: 0.42,
    tipMultiplier: 1.55,
  });

  // 2. Curly twin-tails (33333 / 4444)
  updateChainGroup(twinTailChains, smoothedOmega, elapsed, dt, {
    stiffness: 18,
    damping: 3.4,
    dragGain: 0.088,
    maxAngleY: 0.23,
    liftGainX: 0.036,
    maxLiftX: 0.12,
    waveAmp: 0.009,
    waveSpeed: 1.85,
    wavePhaseStep: 0.35,
    tipMultiplier: 1.25,
  });

  // 3. Side hair locks (右头发1 / 左头发1)
  updateChainGroup(sideLockChains, smoothedOmega, elapsed, dt, {
    stiffness: 32,
    damping: 5.5,
    dragGain: 0.032,
    maxAngleY: 0.08,
    liftGainX: 0.01,
    maxLiftX: 0.04,
    waveAmp: 0.003,
    waveSpeed: 2.1,
    wavePhaseStep: 0.3,
    tipMultiplier: 0.75,
  });

  // 4a. Outer structured cake dress (1212)
  updateSkirtLayer(skirtOuterItems, skirtOuterLag, skirtOuterFlare, smoothedOmega, dt, {
    stiffness: 42,
    damping: 7.4,
    dragGain: 0.055,
    maxLag: 0.22,
    flareGain: 0.028,
    maxFlare: 0.17,
  });

  // 4b. Inner sheer tulle skirt hem (1414)
  updateSkirtLayer(skirtInnerItems, skirtInnerLag, skirtInnerFlare, smoothedOmega, dt, {
    stiffness: 28,
    damping: 5.0,
    dragGain: 0.078,
    maxLag: 0.3,
    flareGain: 0.038,
    maxFlare: 0.23,
  });
}

function syncAutoRotateState() {
  if (!controls) return;
  controls.autoRotate = !isDraggingStage;
}

async function initModelFromManifest() {
  isLoading.value = true;
  loadError.value = '';

  let modelFile = '';
  try {
    const res = await fetch(siteConfig.modelConfig.manifestPath, {
      cache: 'no-cache',
    });
    if (res.ok) {
      const json = (await res.json()) as { modelFile?: string };
      modelFile = (json.modelFile || '').trim();
    }
  } catch {
    modelFile = '';
  }

  if (!modelFile) {
    hasCustomModel.value = false;
    isLoading.value = false;
    return;
  }

  const container = canvasWrapRef.value;
  if (!container) return;

  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    const width = Math.max(240, container.clientWidth);
    const height = Math.max(340, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 40);
    camera.position.copy(DEFAULT_CAM_POS);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(DEFAULT_TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 1.15;
    controls.minPolarAngle = Math.PI * 0.49;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;
    controls.update();

    controls.addEventListener('start', () => {
      isDraggingStage = true;
      syncAutoRotateState();
    });
    controls.addEventListener('end', () => {
      isDraggingStage = false;
      syncAutoRotateState();
    });

    prevAzimuth = controls.getAzimuthalAngle();

    ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambientLight);

    hemiLight = new THREE.HemisphereLight(0xffffff, 0xe4f5f8, 0.9);
    scene.add(hemiLight);

    keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
    keyLight.position.set(1.6, 2.2, 4.8);
    scene.add(keyLight);

    fillLight = new THREE.DirectionalLight(0xe6fbff, 0.7);
    fillLight.position.set(-3, 2.5, 2.5);
    scene.add(fillLight);

    rimLight = new THREE.PointLight(0x39c5bb, 1.1, 12);
    rimLight.position.set(-2.2, 2.2, -2);
    scene.add(rimLight);
    applyThemeLighting();

    const cleanRel = modelFile.replace(/\\/g, '/').replace(/^\/+/, '');
    const url = encodeURI(`${siteConfig.modelConfig.modelsBaseDir}${cleanRel}`);
    const lowerFile = cleanRel.toLowerCase();

    characterRoot = new THREE.Group();

    if (lowerFile.endsWith('.pmx') || lowerFile.endsWith('.pmd')) {
      const mmdLoader = new MMDLoader();
      const mmdMesh = await mmdLoader.loadAsync(url);

      const mats = Array.isArray(mmdMesh.material)
        ? mmdMesh.material
        : [mmdMesh.material];
      mats.forEach((mat) => {
        const m = mat as THREE.Material & {
          emissiveIntensity?: number;
          specular?: THREE.Color;
        };
        if (typeof m.emissiveIntensity === 'number') {
          m.emissiveIntensity = 0.24;
        }
        if (m.specular) {
          m.specular.multiplyScalar(0.35);
        }
      });

      poseMmdCharacter(mmdMesh);

      const iks = mmdMesh.geometry.userData?.MMD?.iks as IK[] | undefined;
      if (iks && iks.length > 0) {
        ikSolver = new CCDIKSolver(mmdMesh, iks);
        ikSolver.update();
      }

      normalizeModel(mmdMesh, mmdMesh);
      characterRoot.add(mmdMesh);
      prevCharRotY = characterRoot.rotation.y;

      initMmdSecondaryPhysics(mmdMesh);

      mmdMeshRef = mmdMesh;
      isMmdActive = true;
      applyThemeLighting();
    } else {
      const loader = new GLTFLoader();
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(siteConfig.modelConfig.dracoDecoderPath);
      loader.setDRACOLoader(dracoLoader);
      loader.register((parser) => new VRMLoaderPlugin(parser));

      const gltf = await loader.loadAsync(url);
      const vrm = gltf.userData.vrm as VRM | undefined;

      if (vrm) {
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.rotateVRM0(vrm);
        relaxVrmPose(vrm);
        normalizeModel(vrm.scene);
        characterRoot.add(vrm.scene);
        activeVrm = vrm;
      } else {
        normalizeModel(gltf.scene);
        characterRoot.add(gltf.scene);
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(gltf.scene);
          mixer.clipAction(gltf.animations[0]).play();
        }
      }
    }

    scene.add(characterRoot);
    hasCustomModel.value = true;
    isLoading.value = false;

    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(200, entry.contentRect.width);
      const h = Math.max(260, entry.contentRect.height);
      if (resizeRafId !== null) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        resizeRafId = null;
        if (!renderer || !camera) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.035, clock.getDelta());
      const elapsed = clock.elapsedTime;

      controls?.update();

      if (mixer) mixer.update(dt);
      if (activeVrm) {
        activeVrm.update(dt);
        const chest = activeVrm.humanoid?.getNormalizedBoneNode('chest');
        if (chest) {
          chest.rotation.x = Math.sin(elapsed * 1.8) * 0.02;
        }
      } else if (mmdMeshRef) {
        if (mmdChestBone) {
          mmdChestBone.rotation.x = mmdBaseRot.chestX + Math.sin(elapsed * 1.65) * 0.018;
        }
        if (mmdHeadBone) {
          mmdHeadBone.rotation.z = mmdBaseRot.headZ + Math.sin(elapsed * 1.05) * 0.02;
        }
        if (mmdBlinkIdx >= 0 && mmdMeshRef.morphTargetInfluences) {
          const cycle = elapsed % 4.2;
          let blinkWeight = 0;
          if (cycle > 3.95 && cycle < 4.18) {
            blinkWeight = Math.sin(((cycle - 3.95) / 0.23) * Math.PI);
          }
          mmdMeshRef.morphTargetInfluences[mmdBlinkIdx] = blinkWeight;
        }

        if (ikSolver) {
          ikSolver.update();
        }
        updateMmdSecondaryPhysics(elapsed, dt);
      } else if (characterRoot && !mixer) {
        characterRoot.position.y = Math.sin(elapsed * 1.6) * 0.02;
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();
  } catch (err) {
    disposeThree();
    hasCustomModel.value = false;
    isLoading.value = false;
    loadError.value =
      err instanceof Error
        ? err.message
        : '模型加载失败，请检查文件及贴图路径（支持 .pmx / .glb / .vrm）';
  }
}

function resetView() {
  if (hasCustomModel.value && camera && controls) {
    camera.position.copy(DEFAULT_CAM_POS);
    controls.target.copy(DEFAULT_TARGET);
    controls.update();
    if (characterRoot) characterRoot.rotation.y = 0;
  } else {
    emit('openGuide');
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!hasCustomModel.value || !characterRoot) return;
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    characterRoot.rotation.y -= 0.32;
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    characterRoot.rotation.y += 0.32;
  }
}

function disposeThree() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (resizeRafId !== null) {
    cancelAnimationFrame(resizeRafId);
    resizeRafId = null;
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
  controls?.dispose();
  controls = null;
  dracoLoader?.dispose();
  dracoLoader = null;
  activeVrm = null;
  mmdMeshRef = null;
  ikSolver = null;
  isMmdActive = false;
  mmdChestBone = null;
  mmdHeadBone = null;
  ribbonChains = [];
  twinTailChains = [];
  sideLockChains = [];
  skirtOuterItems = [];
  skirtInnerItems = [];

  if (scene) {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => m.dispose());
      }
    });
  }
  renderer?.dispose();
  if (renderer?.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  renderer = null;
  scene = null;
  camera = null;
}

watch(theme, applyThemeLighting);

onMounted(() => {
  void initModelFromManifest();
});

onBeforeUnmount(() => {
  disposeThree();
});
</script>

<template>
  <div
    ref="stageRef"
    class="open-stage"
    tabindex="0"
    aria-label="初音未来开放式 3D 展示台，支持鼠标左右拖拽水平旋转"
    @keydown="handleKeyDown"
  >
    <div
      ref="canvasWrapRef"
      class="model-stage__canvas-wrap"
      :class="{ 'is-draggable': hasCustomModel }"
    />

    <div v-if="!hasCustomModel && !isLoading" class="open-stage__waiting">
      <div class="holo-halo" aria-hidden="true">
        <span class="holo-ring holo-ring--outer" />
        <span class="holo-ring holo-ring--inner" />
      </div>

      <img
        :src="siteConfig.outfits[0].image"
        alt="待接入初音 3D 模型预览"
        class="open-stage__silhouette"
        width="210"
        height="210"
      />

      <button
        type="button"
        class="open-stage__prompt"
        @click="emit('openGuide')"
      >
        <span class="prompt-dot" aria-hidden="true" />
        <span class="mono">
          {{ loadError ? loadError : '等待接入 3D 模型 · 点击查看 .pmx / .glb / .vrm 放置方法' }}
        </span>
      </button>
    </div>

    <div v-if="isLoading" class="open-stage__waiting">
      <span class="loader-ring" />
      <span class="mono open-stage__loading-txt">LOADING MIKU 3D...</span>
    </div>

    <button
      type="button"
      class="open-stage__corner-btn"
      :title="hasCustomModel ? '重置角色视角' : '查看 3D 模型放置指南'"
      :aria-label="hasCustomModel ? '重置角色视角' : '查看 3D 模型放置指南'"
      @click="resetView"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M16 3l4 4-4 4" />
        <path d="M20 7H4" />
        <path d="M8 21l-4-4 4-4" />
        <path d="M4 17h16" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.open-stage {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: clamp(500px, 68vh, 610px);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  outline: none;
}

.model-stage__canvas-wrap {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
}

.model-stage__canvas-wrap.is-draggable {
  cursor: grab;
}

.model-stage__canvas-wrap.is-draggable:active {
  cursor: grabbing;
}

.model-stage__canvas-wrap :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  filter: drop-shadow(0 16px 24px rgba(18, 86, 102, 0.22));
}

.open-stage__waiting {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
}

.holo-halo {
  position: absolute;
  width: 240px;
  height: 240px;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.holo-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px dashed rgba(57, 197, 187, 0.38);
}

.holo-ring--outer {
  width: 230px;
  height: 230px;
  animation: slow-spin 22s linear infinite;
}

.holo-ring--inner {
  width: 175px;
  height: 175px;
  border-style: solid;
  border-color: rgba(75, 169, 223, 0.25);
  animation: slow-spin 14s linear infinite reverse;
}

@keyframes slow-spin {
  to {
    transform: rotate(360deg);
  }
}

.open-stage__silhouette {
  position: relative;
  z-index: 1;
  width: 210px;
  height: 210px;
  object-fit: contain;
  opacity: 0.92;
  filter: drop-shadow(0 18px 26px rgba(57, 197, 187, 0.22));
  animation: gentle-float 3.8s ease-in-out infinite;
}

@keyframes gentle-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

.open-stage__prompt {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.48rem 0.95rem;
  border-radius: 999px;
  border: 1px solid var(--pill-border);
  background: var(--glass-bg-strong);
  color: var(--text-secondary);
  font-size: 0.76rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    color 0.2s ease;
}

.open-stage__prompt:hover {
  transform: translateY(-2px);
  border-color: var(--miku-teal);
  color: var(--text-primary);
}

.prompt-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--miku-teal);
  box-shadow: 0 0 8px var(--miku-teal);
}

.loader-ring {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2.5px solid var(--miku-teal-soft);
  border-top-color: var(--miku-teal);
  animation: slow-spin 0.9s linear infinite;
}

.open-stage__loading-txt {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.open-stage__corner-btn {
  position: absolute;
  right: 0.65rem;
  bottom: 0.65rem;
  z-index: 4;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(57, 197, 187, 0.36);
  border-radius: 10px;
  background: var(--glass-bg-strong);
  backdrop-filter: blur(8px);
  color: var(--text-secondary);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.open-stage__corner-btn:hover {
  color: var(--miku-teal-deep);
  border-color: var(--miku-teal);
  background: var(--miku-teal-soft);
  transform: scale(1.06);
}

@media (max-width: 900px) {
  .open-stage {
    min-height: 360px;
  }

  .open-stage__silhouette {
    width: 176px;
    height: 176px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .holo-ring--outer,
  .holo-ring--inner,
  .open-stage__silhouette {
    animation: none;
  }
}
</style>
