import * as THREE from 'three';

export type MikuToyId = 'leek' | 'hairclip' | 'headset' | 'note' | 'capsule';

export const MIKU_TOY_IDS: MikuToyId[] = [
  'leek',
  'hairclip',
  'headset',
  'note',
  'capsule',
];

export const MIKU_TOY_LABELS: Record<MikuToyId, string> = {
  leek: '初音大葱 3D 实物',
  hairclip: '黑粉发饰 3D 实物',
  headset: '初音耳机 3D 实物',
  note: '立体音符 3D 实物',
  capsule: '初音双色胶囊 3D 实物',
};

function makeGlossyMat(
  color: THREE.ColorRepresentation,
  opts: Partial<THREE.MeshPhysicalMaterialParameters> = {},
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.14,
    metalness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.55,
    ...opts,
  });
}

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const radius = Math.min(r, hw, hh);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + radius, -hh);
  shape.lineTo(hw - radius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  shape.lineTo(hw, hh - radius);
  shape.quadraticCurveTo(hw, hh, hw - radius, hh);
  shape.lineTo(-hw + radius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  shape.lineTo(-hw, -hh + radius);
  shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  return shape;
}

function createRoundedRectPath(w: number, h: number, r: number): THREE.Path {
  const hw = w / 2;
  const hh = h / 2;
  const radius = Math.min(r, hw, hh);
  const path = new THREE.Path();
  path.moveTo(-hw + radius, -hh);
  path.lineTo(hw - radius, -hh);
  path.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  path.lineTo(hw, hh - radius);
  path.quadraticCurveTo(hw, hh, hw - radius, hh);
  path.lineTo(-hw + radius, hh);
  path.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  path.lineTo(-hw, -hh + radius);
  path.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
  return path;
}

interface LeekLeafSpec {
  pts: THREE.Vector3[];
  startR: number;
  endR: number;
  mat: THREE.MeshPhysicalMaterial;
  hollowMat: THREE.MeshPhysicalMaterial;
}

function createTubularLeekLeaf(spec: LeekLeafSpec): THREE.Group {
  const leafGroup = new THREE.Group();
  const { pts, startR, endR, mat, hollowMat } = spec;
  const curve = new THREE.CatmullRomCurve3(pts);
  const radialSegments = 24;
  const tubularSegments = 28;
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  interface RingSample {
    center: THREE.Vector3;
    n: THREE.Vector3;
    b: THREE.Vector3;
    r: number;
  }

  const rings: RingSample[] = [];
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const p = curve.getPointAt(t);
    const baseR = THREE.MathUtils.lerp(startR, endR, Math.pow(t, 0.82));
    // Gentle organic plump swell just above the collar + rounded hollow bevel lip at tip
    const swell = 1 + Math.sin(t * Math.PI) * 0.08;
    const lipBevel = t > 0.92 ? 1 - Math.pow((t - 0.92) / 0.08, 2) * 0.22 : 1;
    rings.push({
      center: p,
      n: frames.normals[i],
      b: frames.binormals[i],
      r: baseR * swell * lipBevel,
    });
  }

  // Add two recessed inner lip rings to form a thick rounded rim into the hollow onion tube
  const endCenter = curve.getPointAt(1).clone();
  const endTan = curve.getTangentAt(1).normalize();
  const endN = frames.normals[tubularSegments];
  const endB = frames.binormals[tubularSegments];
  rings.push({
    center: endCenter.clone().addScaledVector(endTan, -endR * 0.22),
    n: endN,
    b: endB,
    r: endR * 0.56,
  });
  rings.push({
    center: endCenter.clone().addScaledVector(endTan, -endR * 0.48),
    n: endN,
    b: endB,
    r: 0.05,
  });

  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i];
    const vCoord = i / (rings.length - 1);
    for (let j = 0; j <= radialSegments; j++) {
      const theta = (j / radialSegments) * Math.PI * 2;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const rx = ring.r * 1.03;
      const rz = ring.r * 0.94;
      positions.push(
        ring.center.x + (cos * rx * ring.n.x + sin * rz * ring.b.x),
        ring.center.y + (cos * rx * ring.n.y + sin * rz * ring.b.y),
        ring.center.z + (cos * rx * ring.n.z + sin * rz * ring.b.z),
      );
      uvs.push(j / radialSegments, vCoord);
    }
  }

  const rowStride = radialSegments + 1;
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * rowStride + j;
      const b = (i + 1) * rowStride + j;
      const c = (i + 1) * rowStride + (j + 1);
      const d = i * rowStride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  leafGroup.add(new THREE.Mesh(geom, mat));

  // Recessed dark-green inner hollow core oriented perpendicular to leaf tip tangent
  const cavity = new THREE.Mesh(
    new THREE.SphereGeometry(endR * 0.66, 18, 12),
    hollowMat,
  );
  cavity.scale.set(1.0, 0.3, 0.92);
  cavity.position.copy(endCenter).addScaledVector(endTan, -endR * 0.16);
  cavity.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), endTan);
  leafGroup.add(cavity);

  return leafGroup;
}

function buildLeekMesh(): THREE.Group {
  const root = new THREE.Group();
  const rig = new THREE.Group();

  // Plump Q-style Nendoroid Miku cylindrical white-to-green leek stalk
  const lathePoints: THREE.Vector2[] = [];
  const profile: Array<[number, number]> = [
    [0.01, -22],
    [4.6, -21.5],
    [6.8, -19.2],
    [7.2, -14.2],
    [6.9, -6.0],
    [6.6, 2.5],
    [6.5, 9.8],
    [5.9, 12.8],
    [0.01, 13.8],
  ];
  const spline = new THREE.SplineCurve(
    profile.map(([x, y]) => new THREE.Vector2(x, y)),
  );
  const sampled = spline.getPoints(30);
  for (const pt of sampled) {
    lathePoints.push(new THREE.Vector2(Math.max(0.01, pt.x), pt.y));
  }

  const stalkGeom = new THREE.LatheGeometry(lathePoints, 40);
  const posAttr = stalkGeom.getAttribute('position');
  const colors = new Float32Array(posAttr.count * 3);
  const cWhite = new THREE.Color('#ffffff');
  const cMilk = new THREE.Color('#f4fcee');
  const cSpring = new THREE.Color('#d6f598');
  const cChartreuse = new THREE.Color('#7be056');
  const cGreen = new THREE.Color('#3cc843');
  const tmpColor = new THREE.Color();

  for (let i = 0; i < posAttr.count; i++) {
    const y = posAttr.getY(i);
    const t = Math.max(0, Math.min(1, (y + 22) / 35.8));
    if (t < 0.5) {
      tmpColor.lerpColors(cWhite, cMilk, t / 0.5);
    } else if (t < 0.64) {
      tmpColor.lerpColors(cMilk, cSpring, (t - 0.5) / 0.14);
    } else if (t < 0.78) {
      tmpColor.lerpColors(cSpring, cChartreuse, (t - 0.64) / 0.14);
    } else {
      tmpColor.lerpColors(cChartreuse, cGreen, (t - 0.78) / 0.22);
    }
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }
  stalkGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const stalkMat = makeGlossyMat('#ffffff', {
    vertexColors: true,
    roughness: 0.12,
    metalness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });
  rig.add(new THREE.Mesh(stalkGeom, stalkMat));

  // Soft cream-white root disc tucked flush beneath the bulb + 6 curved root tendrils
  const rootDiscMat = makeGlossyMat('#f2f0e4', {
    roughness: 0.24,
    clearcoat: 0.45,
  });
  const rootDisc = new THREE.Mesh(
    new THREE.SphereGeometry(3.3, 20, 14),
    rootDiscMat,
  );
  rootDisc.scale.set(1, 0.36, 1);
  rootDisc.position.set(0, -21.7, 0);
  rig.add(rootDisc);

  const tendrilMat = makeGlossyMat('#f6f4e8', {
    roughness: 0.22,
    clearcoat: 0.5,
  });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.28;
    const radialStart = 1.65;
    const radialEnd = 2.75 + (i % 2) * 0.45;
    const len = 4.6 + (i % 2) * 1.4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const endX = cos * radialEnd;
    const endY = -21.6 - len;
    const endZ = sin * radialEnd;
    const tendrilCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cos * radialStart * 0.6, -21.1, sin * radialStart * 0.6),
      new THREE.Vector3(cos * radialStart, -22.8 - len * 0.3, sin * radialStart),
      new THREE.Vector3(endX, endY, endZ),
    ]);
    rig.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(tendrilCurve, 10, 0.42, 8, false),
        tendrilMat,
      ),
    );
    const tipCap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), tendrilMat);
    tipCap.position.set(endX, endY, endZ);
    rig.add(tipCap);
  }

  // Two plump Q-style V-forked hollow green leek leaves seamlessly emerging from top of stalk
  const leafMainMat = makeGlossyMat('#34c43e', {
    roughness: 0.13,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: '#144d19',
    emissiveIntensity: 0.08,
  });
  const leafForkMat = makeGlossyMat('#4bd650', {
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    emissive: '#17541c',
    emissiveIntensity: 0.08,
  });
  const hollowMat = makeGlossyMat('#1d7826', {
    roughness: 0.35,
    clearcoat: 0.2,
  });

  // Main taller right leaf
  rig.add(
    createTubularLeekLeaf({
      pts: [
        new THREE.Vector3(1.1, 8.2, 0),
        new THREE.Vector3(4.2, 18.0, -0.7),
        new THREE.Vector3(8.5, 27.8, -1.3),
        new THREE.Vector3(11.6, 36.2, -1.5),
      ],
      startR: 4.85,
      endR: 3.15,
      mat: leafMainMat,
      hollowMat,
    }),
  );

  // Shorter plump forked left leaf
  rig.add(
    createTubularLeekLeaf({
      pts: [
        new THREE.Vector3(-1.3, 7.6, 0.4),
        new THREE.Vector3(-5.2, 16.0, 1.3),
        new THREE.Vector3(-10.0, 23.6, 2.0),
        new THREE.Vector3(-13.8, 29.8, 2.2),
      ],
      startR: 4.4,
      endR: 2.8,
      mat: leafForkMat,
      hollowMat,
    }),
  );

  // Center around visual centroid
  rig.position.set(0, -6, 0);
  rig.rotation.z = -0.34;
  root.add(rig);
  return root;
}

function buildHairclipMesh(): THREE.Group {
  const root = new THREE.Group();

  // Thick pillowy obsidian-navy outer frame
  const outerShape = createRoundedRectShape(46, 40, 10.5);
  outerShape.holes.push(createRoundedRectPath(24, 18.5, 5));

  const outerGeom = new THREE.ExtrudeGeometry(outerShape, {
    depth: 9,
    bevelEnabled: true,
    bevelThickness: 4.5,
    bevelSize: 4.2,
    bevelSegments: 8,
    curveSegments: 28,
  });
  outerGeom.translate(0, 0, -4.5);

  const obsidianMat = makeGlossyMat('#23324d', {
    roughness: 0.13,
    metalness: 0.24,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  });
  root.add(new THREE.Mesh(outerGeom, obsidianMat));

  // Luminous electric-magenta recessed neon trim visible front & back
  const neonShape = createRoundedRectShape(34.5, 29, 7);
  neonShape.holes.push(createRoundedRectPath(24.5, 19, 4.8));

  const neonGeom = new THREE.ExtrudeGeometry(neonShape, {
    depth: 13.5,
    bevelEnabled: true,
    bevelThickness: 2.2,
    bevelSize: 1.9,
    bevelSegments: 6,
    curveSegments: 24,
  });
  neonGeom.translate(0, 0, -6.75);

  const magentaMat = makeGlossyMat('#ff44a1', {
    roughness: 0.1,
    metalness: 0.08,
    emissive: '#ff1f8e',
    emissiveIntensity: 0.42,
    clearcoat: 1.0,
  });
  root.add(new THREE.Mesh(neonGeom, magentaMat));

  // Luminous neon-magenta outer side-chamfer piping ring so side views stay unmistakable
  const sidePipingShape = createRoundedRectShape(47.2, 41.2, 10.6);
  sidePipingShape.holes.push(createRoundedRectPath(43.8, 37.8, 9.4));
  const sidePipingGeom = new THREE.ExtrudeGeometry(sidePipingShape, {
    depth: 3.6,
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.8,
    bevelSegments: 4,
    curveSegments: 24,
  });
  sidePipingGeom.translate(0, 0, -1.8);
  root.add(new THREE.Mesh(sidePipingGeom, magentaMat));

  // Translucent cyan holographic inner pane
  const paneGeom = new THREE.BoxGeometry(24, 18.5, 4);
  const paneMat = makeGlossyMat('#7cf4ec', {
    roughness: 0.08,
    transparent: true,
    opacity: 0.42,
    emissive: '#39c5bb',
    emissiveIntensity: 0.18,
  });
  root.add(new THREE.Mesh(paneGeom, paneMat));

  // Twin mint pearl studs
  const studMat = makeGlossyMat('#5df2e6', {
    emissive: '#39c5bb',
    emissiveIntensity: 0.28,
    roughness: 0.08,
  });
  const studPositions: Array<[number, number, number]> = [
    [19.5, 15.5, 7.6],
    [-19.5, -15.5, 7.6],
    [19.5, 15.5, -7.6],
    [-19.5, -15.5, -7.6],
  ];
  for (const [sx, sy, sz] of studPositions) {
    const stud = new THREE.Mesh(new THREE.SphereGeometry(2.5, 18, 16), studMat);
    stud.position.set(sx, sy, sz);
    root.add(stud);
  }

  return root;
}

function buildHeadsetMesh(): THREE.Group {
  const root = new THREE.Group();
  const rig = new THREE.Group();

  const bandMat = makeGlossyMat('#2a3c5e', {
    roughness: 0.14,
    metalness: 0.22,
  });
  const tealGlowMat = makeGlossyMat('#4bece0', {
    roughness: 0.1,
    emissive: '#2bc4b8',
    emissiveIntensity: 0.36,
  });
  const pinkGlowMat = makeGlossyMat('#ff4ca4', {
    roughness: 0.1,
    emissive: '#f2228c',
    emissiveIntensity: 0.34,
  });
  const cushionMat = makeGlossyMat('#364968', {
    roughness: 0.3,
    clearcoat: 0.45,
  });

  // Arched headband
  const archPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = THREE.MathUtils.lerp(-Math.PI * 0.92, -Math.PI * 0.08, i / 24);
    archPts.push(new THREE.Vector3(Math.cos(a) * 24.5, -Math.sin(a) * 23 - 1, 0));
  }
  const archCurve = new THREE.CatmullRomCurve3(archPts);
  rig.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(archCurve, 44, 3.9, 20, false),
      bandMat,
    ),
  );

  // Outer mint-teal inlay stripe along headband
  const trimPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 20; i++) {
    const a = THREE.MathUtils.lerp(-Math.PI * 0.84, -Math.PI * 0.16, i / 20);
    trimPts.push(new THREE.Vector3(Math.cos(a) * 27.6, -Math.sin(a) * 26.2 - 1, 0));
  }
  rig.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trimPts), 36, 1.5, 16, false),
      tealGlowMat,
    ),
  );

  // Left & Right plump earcups
  const addEarcup = (side: -1 | 1, ledMat: THREE.MeshPhysicalMaterial) => {
    const cup = new THREE.Group();
    cup.position.set(side * 23.5, -4, 0);

    const shell = new THREE.Mesh(new THREE.SphereGeometry(11.4, 28, 22), bandMat);
    shell.scale.set(0.68, 1.08, 0.96);
    shell.position.x = side * 2.2;
    cup.add(shell);

    const cushion = new THREE.Mesh(
      new THREE.TorusGeometry(8.5, 3.6, 18, 34),
      cushionMat,
    );
    cushion.rotation.y = Math.PI / 2;
    cushion.position.x = -side * 2.1;
    cup.add(cushion);

    const ledRing = new THREE.Mesh(
      new THREE.TorusGeometry(8.8, 2.05, 16, 36),
      ledMat,
    );
    ledRing.rotation.y = Math.PI / 2;
    ledRing.position.x = side * 6.5;
    cup.add(ledRing);

    const centerCap = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 20, 18),
      makeGlossyMat('#dceef8', { roughness: 0.12 }),
    );
    centerCap.scale.set(0.55, 1, 1);
    centerCap.position.x = side * 7.2;
    cup.add(centerCap);

    rig.add(cup);
  };

  addEarcup(-1, pinkGlowMat);
  addEarcup(1, tealGlowMat);

  // Curved boom microphone extending forward from right earcup
  const micCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(24.5, -10, 2.5),
    new THREE.Vector3(22, -19.5, 9),
    new THREE.Vector3(14, -24.5, 14),
    new THREE.Vector3(5.5, -24.5, 15.5),
  ]);
  rig.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(micCurve, 28, 1.5, 14, false),
      tealGlowMat,
    ),
  );

  const micTip = new THREE.Mesh(new THREE.SphereGeometry(3.4, 20, 18), pinkGlowMat);
  micTip.position.set(5.5, -24.5, 15.5);
  rig.add(micTip);

  rig.position.set(0, -1, 0);
  root.add(rig);
  return root;
}

function buildNoteMesh(): THREE.Group {
  const root = new THREE.Group();
  const rig = new THREE.Group();

  const mintMat = makeGlossyMat('#28d9cc', {
    roughness: 0.1,
    emissive: '#147f77',
    emissiveIntensity: 0.22,
  });
  const skyPearlMat = makeGlossyMat('#8bf7ff', {
    roughness: 0.08,
    emissive: '#228fa1',
    emissiveIntensity: 0.16,
  });
  const pinkPearlMat = makeGlossyMat('#ff67b4', {
    roughness: 0.09,
    emissive: '#e02183',
    emissiveIntensity: 0.24,
  });

  // Plump oval note head
  const head = new THREE.Mesh(new THREE.SphereGeometry(12.2, 32, 24), mintMat);
  head.scale.set(1.22, 0.9, 0.7);
  head.rotation.z = 0.34;
  head.position.set(-7.5, -15, 0);
  rig.add(head);

  // Smooth stem with rounded dome cap
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(3.6, 3.6, 36, 24),
    mintMat,
  );
  stem.position.set(4.8, 3, 0);
  rig.add(stem);

  const topCap = new THREE.Mesh(new THREE.SphereGeometry(3.6, 20, 18), mintMat);
  topCap.position.set(4.8, 21, 0);
  rig.add(topCap);

  // Sweeping 3D ribbon flag
  const flagCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(4.8, 20.5, 0),
    new THREE.Vector3(14.5, 18, 2),
    new THREE.Vector3(21.5, 10, 0.5),
    new THREE.Vector3(18.5, 1.5, -1.5),
  ]);
  rig.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(flagCurve, 32, 3.3, 18, false),
      mintMat,
    ),
  );

  // Pearl drop accent on the flag tip + shimmering accent sphere
  const flagTip = new THREE.Mesh(new THREE.SphereGeometry(4.2, 22, 18), pinkPearlMat);
  flagTip.position.set(18.5, 1.5, -1.5);
  rig.add(flagTip);

  const glintPearl = new THREE.Mesh(new THREE.SphereGeometry(3.4, 18, 16), skyPearlMat);
  glintPearl.position.set(-14.5, -4, 6.5);
  rig.add(glintPearl);

  rig.rotation.z = -0.1;
  root.add(rig);
  return root;
}

function buildCapsuleMesh(): THREE.Group {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  const radius = 13.2;
  const halfBody = 12;

  const mintCapMat = makeGlossyMat('#46e8dc', {
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    emissive: '#167069',
    emissiveIntensity: 0.14,
  });
  const pinkCapMat = makeGlossyMat('#ff6fb8', {
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    emissive: '#8f1955',
    emissiveIntensity: 0.14,
  });
  const seamMat = makeGlossyMat('#f4feff', {
    roughness: 0.09,
    metalness: 0.38,
    clearcoat: 1.0,
  });

  // Top Miku Mint-Teal Half Capsule
  const topCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, halfBody, 40, 1, true),
    mintCapMat,
  );
  topCyl.position.y = halfBody / 2;
  rig.add(topCyl);

  const topDome = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2),
    mintCapMat,
  );
  topDome.position.y = halfBody;
  rig.add(topDome);

  // Bottom Sakura-Pink Half Capsule
  const botCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, halfBody, 40, 1, true),
    pinkCapMat,
  );
  botCyl.position.y = -halfBody / 2;
  rig.add(botCyl);

  const botDome = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 40, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    pinkCapMat,
  );
  botDome.position.y = -halfBody;
  rig.add(botDome);

  // Equatorial pearl metallic band
  const seam = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.15, 1.4, 18, 44),
    seamMat,
  );
  seam.rotation.x = Math.PI / 2;
  rig.add(seam);

  rig.rotation.z = -0.58;
  rig.rotation.x = 0.22;
  root.add(rig);
  return root;
}

export function createMikuToyMesh(id: MikuToyId): THREE.Group {
  switch (id) {
    case 'leek':
      return buildLeekMesh();
    case 'hairclip':
      return buildHairclipMesh();
    case 'headset':
      return buildHeadsetMesh();
    case 'note':
      return buildNoteMesh();
    case 'capsule':
      return buildCapsuleMesh();
  }
}

export function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
