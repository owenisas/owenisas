import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DESK_REAL_WIDTH = 120;
const MAX_KEY_PRESSES = 8;

const MODELS = [
  { name: 'Computer Desk', path: '/assets/computer_desk.glb', realWidth: DESK_REAL_WIDTH, onDesk: false, deskPos: [0,0,0], rotationY: Math.PI, animation: 'none' },
  { name: 'MacBook Pro M3', path: '/assets/macbook_pro_m3_16_inch_2024.glb', realWidth: 35.6, onDesk: true, deskPos: [-0.08,0,0.0], rotationY: Math.PI/2, animation: 'zoomToScreen' },
  { name: 'Keychron K8', path: '/assets/keychron-k8/source/KeychronK8_01.fbx', type: 'fbx', realWidth: 35.9, onDesk: true, deskPos: [0.1,0,0.0], rotationY: Math.PI/2, animation: 'typingBurst' },
  { name: 'Razer Viper Mini', path: '/assets/razer_viper_mini.glb', realWidth: 11.8, onDesk: true, deskPos: [0.07,0,-0.25], rotationY: Math.PI*240/180 - Math.PI/6, animation: 'rgbBurst' },
  { name: 'DJI Mavic 3', path: '/assets/dji-mavic-3/source/DJI-Mavic_3.glb', realWidth: 35, onDesk: true, deskPos: [0.08,0,0.35], rotationY: Math.PI/2+0.3, animation: 'propellerSpin' },
  { name: 'Divergence Meter', path: '/assets/divergence_meter_steinsgate.glb', realWidth: 25, onDesk: true, deskPos: [-0.1,0,0.3], rotationY: Math.PI/2+0.5, animation: 'nixieFlicker' },
];

const DeskShowroom = forwardRef(function DeskShowroom({ onEnterScreen }, ref) {
  const containerRef = useRef(null);
  const cleanupRef = useRef(null);

  const onEnterScreenRef = useRef(onEnterScreen);
  onEnterScreenRef.current = onEnterScreen;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 3.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    window.__scene = scene; // debug: expose for lighting tests
    window.__THREE = THREE;
    window.__camera = null; // set after camera creation

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 200);
    camera.position.set(2.5, 2.8, 0);
    window.__camera = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(-0.3, 1.5, 0);
    window.__controls = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.update();

    // ── Lighting Presets ──
    const presetA = new THREE.Group(); // Cool Blue Moody
    presetA.add(new THREE.AmbientLight(0x1a2a44, 1.5));
    const rimLight = new THREE.PointLight(0x4488ff, 25, 10);
    rimLight.position.set(-1, 2, -2);
    presetA.add(rimLight);
    const accentLight = new THREE.PointLight(0xff8844, 12, 6);
    accentLight.position.set(2, 1.5, 0.5);
    presetA.add(accentLight);
    scene.add(presetA);

    const presetB = new THREE.Group(); // Dramatic Spotlight
    const topSpot = new THREE.SpotLight(0xffffff, 30, 12, Math.PI / 4, 0.85, 2);
    topSpot.position.set(0, 4, 0);
    presetB.add(topSpot);
    presetB.add(new THREE.AmbientLight(0x111122, 0.3));
    scene.add(presetB);

    presetA.visible = false;
    presetB.visible = true;

    let activePreset = 1;
    const presets = [presetA, presetB];
    const presetNames = ['Cool Blue', 'Spotlight'];
    function togglePreset() {
      presets[activePreset].visible = false;
      activePreset = (activePreset + 1) % presets.length;
      presets[activePreset].visible = true;
      if (labelEl) labelEl.textContent = presetNames[activePreset];
    }
    const labelEl = container.querySelector('.preset-label');

    // ── Ground: Grid with radial fade ──
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 1024; floorCanvas.height = 1024;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#000003'; fctx.fillRect(0, 0, 1024, 1024);
    fctx.strokeStyle = '#1a2560'; fctx.lineWidth = 0.6;
    for (let i = 0; i <= 1024; i += 32) {
      fctx.beginPath(); fctx.moveTo(i, 0); fctx.lineTo(i, 1024); fctx.stroke();
      fctx.beginPath(); fctx.moveTo(0, i); fctx.lineTo(1024, i); fctx.stroke();
    }
    fctx.strokeStyle = '#2040aa'; fctx.lineWidth = 1.5;
    for (let i = 0; i <= 1024; i += 128) {
      fctx.beginPath(); fctx.moveTo(i, 0); fctx.lineTo(i, 1024); fctx.stroke();
      fctx.beginPath(); fctx.moveTo(0, i); fctx.lineTo(1024, i); fctx.stroke();
    }
    const radialFade = fctx.createRadialGradient(512, 512, 100, 512, 512, 512);
    radialFade.addColorStop(0, 'rgba(0,0,0,0)');
    radialFade.addColorStop(0.6, 'rgba(0,0,0,0.3)');
    radialFade.addColorStop(1, 'rgba(0,0,0,0.95)');
    fctx.fillStyle = radialFade; fctx.fillRect(0, 0, 1024, 1024);
    const floorTex = new THREE.CanvasTexture(floorCanvas);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.15, metalness: 0.2, emissiveMap: floorTex, emissive: new THREE.Color(0x0a1540), emissiveIntensity: 0.4 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);
    scene.background = new THREE.Color(0x020205);

    // ── Walls: Grid room ──
    function makeWallTex(w, h) {
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#030308'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#0a1535'; ctx.lineWidth = 0.5;
      for (let i = 0; i <= w; i += 32) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
      for (let i = 0; i <= h; i += 32) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }
      ctx.strokeStyle = '#1530aa'; ctx.lineWidth = 1;
      for (let i = 0; i <= w; i += 128) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
      for (let i = 0; i <= h; i += 128) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }
      const gh = ctx.createLinearGradient(0,0,w,0);
      gh.addColorStop(0,'rgba(0,0,0,0.85)'); gh.addColorStop(0.2,'rgba(0,0,0,0)');
      gh.addColorStop(0.8,'rgba(0,0,0,0)'); gh.addColorStop(1,'rgba(0,0,0,0.85)');
      ctx.fillStyle = gh; ctx.fillRect(0,0,w,h);
      const gv = ctx.createLinearGradient(0,0,0,h);
      gv.addColorStop(0,'rgba(0,0,0,0.7)'); gv.addColorStop(0.3,'rgba(0,0,0,0)');
      gv.addColorStop(0.8,'rgba(0,0,0,0)'); gv.addColorStop(1,'rgba(0,0,0,0.9)');
      ctx.fillStyle = gv; ctx.fillRect(0,0,w,h);
      return new THREE.CanvasTexture(cv);
    }
    const wallMat = (tex) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.05, emissiveMap: tex, emissive: new THREE.Color(0x081030), emissiveIntensity: 0.25 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), wallMat(makeWallTex(1024, 512)));
    backWall.position.set(0, 3, -5); scene.add(backWall);
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), wallMat(makeWallTex(1024, 512)));
    leftWall.rotation.y = Math.PI / 2; leftWall.position.set(-5, 3, 0); scene.add(leftWall);
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), wallMat(makeWallTex(1024, 512)));
    rightWall.rotation.y = -Math.PI / 2; rightWall.position.set(5, 3, 0); scene.add(rightWall);

    // ── State ──
    const gltfLoader = new GLTFLoader();
    const keychronAssetManager = new THREE.LoadingManager();
    keychronAssetManager.setURLModifier((url) => {
      const filename = url.split(/[\\/]/).pop();
      if (!filename?.startsWith('T_KeychronK8_')) return url;
      const textureName = filename === 'T_KeychronK8_01_Roughness.png'
        ? 'T_KeychronK8_02_Roughness.png'
        : filename;
      return `/assets/keychron-k8/textures/${textureName}`;
    });
    const fbxLoader = new FBXLoader(keychronAssetManager);
    fbxLoader.setResourcePath('/assets/keychron-k8/textures/');
    const entries = [];
    let deskWorldWidth = 1, deskSurfaceY = 0;
    const origCamPos = camera.position.clone();
    const origCamTarget = controls.target.clone();
    let zoomState = 'idle';
    let zoomT = 0;
    const zoomTargetPos = new THREE.Vector3();
    const zoomTargetLook = new THREE.Vector3();
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredEntry = null;
    let animId = null;
    // Mouse parallax — smooth offset
    const mouseParallax = { x: 0, y: 0 };
    // 3D mouse model tracking
    let mouseEntry = null;
    const mouseModelOffset = { x: 0, z: 0 };

    // ── Loading overlay refs ──
    const overlayEl = container.querySelector('.showroom-loading');
    const fillEl = container.querySelector('.showroom-fill');
    const textEl = container.querySelector('.showroom-text');
    const tooltipEl = container.querySelector('.showroom-tooltip');
    const tooltipNameEl = tooltipEl?.querySelector('.name');

    function loadModel(asset, config) {
      const model = config.type === 'fbx' ? asset : asset.scene;
      if (config.type === 'fbx' && config.animation === 'typingBurst') {
        model.rotation.x = -Math.PI / 2;
      }
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim === 0 || !isFinite(maxDim)) return null;

      const wrapper = new THREE.Group();
      wrapper.add(model);

      if (config.onDesk) {
        const worldSize = deskWorldWidth * (config.realWidth / DESK_REAL_WIDTH);
        const scale = worldSize / maxDim;
        wrapper.scale.set(scale, scale, scale);
        model.position.set(-center.x, -center.y + size.y / 2, -center.z);
        const x = config.deskPos[0] * deskWorldWidth;
        const z = config.deskPos[2] * deskWorldWidth;
        wrapper.position.set(x, deskSurfaceY, z);
        wrapper.rotation.y = config.rotationY;
      } else {
        const deskTargetSize = 2.5;
        const scale = deskTargetSize / maxDim;
        wrapper.scale.set(scale, scale, scale);
        model.position.set(-center.x, -center.y + size.y / 2, -center.z);
        wrapper.rotation.y = config.rotationY;
        const scaledSize = size.clone().multiplyScalar(scale);
        deskWorldWidth = Math.max(scaledSize.x, scaledSize.z);
        deskSurfaceY = scaledSize.y;
      }

      wrapper.traverse(child => { if (child.isMesh) child.frustumCulled = false; });
      wrapper.userData.configName = config.name;
      scene.add(wrapper);
      const meshes = [];
      wrapper.traverse(child => { if (child.isMesh) meshes.push(child); });
      return { config, wrapper, model, meshes, state: {} };
    }

    function initAnimation(entry) {
      const { config, model, state } = entry;
      switch (config.animation) {
        case 'zoomToScreen': {
          // Apply wallpaper with bg-cover logic matching the CSS desktop
          const texLoader = new THREE.TextureLoader();
          texLoader.load('/wallpaper.jpg', (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            model.traverse(child => {
              if (child.isMesh && child.material?.emissiveMap && child.material.emissiveIntensity > 2) {
                // Measure screen mesh world-space dimensions for zoom calculation
                entry.wrapper.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(child);
                const size = box.getSize(new THREE.Vector3());
                // Screen width is along Z, height is the XY diagonal (tilted screen)
                state.screenWidth = size.z;
                state.screenHeight = Math.sqrt(size.x * size.x + size.y * size.y);
                console.log(`[Screen] raw size: x=${size.x.toFixed(4)} y=${size.y.toFixed(4)} z=${size.z.toFixed(4)}`);
                console.log(`[Screen] computed: W=${state.screenWidth.toFixed(4)} H=${state.screenHeight.toFixed(4)}`);
                // Use MeshBasicMaterial to bypass lighting/tone mapping — renders like CSS
                child.material = new THREE.MeshBasicMaterial({
                  map: tex,
                  toneMapped: false,
                  color: new THREE.Color(0.85, 0.85, 0.85), // dim to match dark desktop
                });
              }
            });
          });
          break;
        }
        case 'none': break;
        case 'nixieFlicker': {
          state.digitMats = []; state.displayMats = [];
          // Build tube map: suffix → { digits: {0-9,Dot → mesh}, active: string }
          state.tubes = {};
          const onMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.45, 0.0), toneMapped: false });
          const offMat = new THREE.MeshStandardMaterial({ color: 0x1a0a00, transparent: true, opacity: 0.15 });
          model.traverse(child => {
            if (child.isMesh && child.material) {
              const mn = child.material.name;
              const nameMatch = child.parent?.name.match(/^(num\d|numDot)(\d*)$/);
              if (nameMatch) {
                const digit = nameMatch[1]; // e.g. 'num4', 'numDot'
                const suffix = nameMatch[2] || '0'; // e.g. '007' or '0' for base
                if (!state.tubes[suffix]) state.tubes[suffix] = { digits: {}, active: null };
                const digitKey = digit.replace('num', ''); // '4', 'Dot'
                state.tubes[suffix].digits[digitKey] = child;
                if (mn === 'number_on_mt' || mn === '') {
                  // Currently "on" digit
                  child.material = onMat.clone();
                  state.digitMats.push(child.material);
                  state.tubes[suffix].active = digitKey;
                  child.visible = true;
                } else {
                  child.material = offMat.clone();
                  child.visible = false;
                }
              } else if (mn === 'display_mt') {
                child.material = child.material.clone();
                child.material.transparent = true;
                child.material.opacity = 0.15;
                child.material.emissive = new THREE.Color(1, 0.5, 0.05);
                child.material.emissiveIntensity = 0.3;
                state.displayMats.push(child.material);
              }
            }
          });
          state.onMat = onMat;
          state.offMat = offMat;
          // Tube visual order (left→right) and world line targets
          state.tubeOrder = ['001', '002', '004', '005', '007', '006', '003', '0'];
          state.worldLines = [
            ['0','Dot','5','7','1','0','4','6'], // 0.571046 — Alpha
            ['1','Dot','0','5','3','6','4','9'], // 1.053649 — Beta
            ['1','Dot','0','4','8','5','9','6'], // 1.048596 — Steins Gate
          ];
          state.worldLineImages = [
            ['/assets/SteinGate/Alpha/EV_C01A.webp','/assets/SteinGate/Alpha/EV_C02A.webp','/assets/SteinGate/Alpha/EV_C09B.webp','/assets/SteinGate/Alpha/EV_C11A.webp','/assets/SteinGate/Alpha/IBG064.webp'],
            ['/assets/SteinGate/Beta/SG0_EV038A.webp','/assets/SteinGate/Beta/SG0_EV081A.webp','/assets/SteinGate/Beta/SG0_EV083a.webp'],
            ['/assets/SteinGate/SteinGate/EV_C13A.webp','/assets/SteinGate/SteinGate/EV_C13AL.webp','/assets/SteinGate/SteinGate/EV_C13AR.webp','/assets/SteinGate/SteinGate/EV_C13BL.webp','/assets/SteinGate/SteinGate/EV_C13BR.webp'],
          ];
          state.currentLine = 0;
          state.active = false; state.t = 0; break;
        }
        case 'typingBurst': {
          model.traverse(child => { if (child.name === 'SM_KeychronK8_misc') child.visible = false; });
          let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, zMax = -Infinity;
          let keyboardMesh = null;
          model.traverse(child => {
            if (child.isMesh && child.material) {
              if (child.name === 'SM_KeychronK8' || !keyboardMesh) keyboardMesh = child;
              const pos = child.geometry.attributes.position;
              if (pos) {
                for (let i = 0; i < pos.count; i++) {
                  const x = pos.getX(i);
                  const y = pos.getY(i);
                  const z = pos.getZ(i);
                  if (x < xMin) xMin = x;
                  if (x > xMax) xMax = x;
                  if (y < yMin) yMin = y;
                  if (y > yMax) yMax = y;
                  if (z > zMax) zMax = z;
                }
              }
            }
          });

          const xRange = xMax - xMin;
          const yRange = yMax - yMin;
          const xInset = xRange * 0.075;
          const yInset = yRange * 0.19;
          const rowSpecs = [
            { count: 14, y: yMax - yInset, offset: 0.00 },
            { count: 14, y: yMax - yInset - yRange * 0.16, offset: 0.03 },
            { count: 13, y: yMax - yInset - yRange * 0.32, offset: 0.075 },
            { count: 12, y: yMax - yInset - yRange * 0.48, offset: 0.125 },
            { count: 9, y: yMin + yInset, offset: 0.22 },
          ];
          const keyCenters = [];
          const keySpecs = [];
          rowSpecs.forEach(({ count, y, offset }) => {
            const rowStart = xMin + xInset + xRange * offset;
            const rowEnd = xMax - xInset;
            const step = (rowEnd - rowStart) / Math.max(count - 1, 1);
            for (let i = 0; i < count; i++) {
              const center = new THREE.Vector2(rowStart + step * i, y);
              keyCenters.push(center);
              keySpecs.push({
                center,
                width: step * 0.72,
                depth: yRange * 0.085,
              });
            }
          });

          const typingOrder = [
            28, 18, 29, 33, 20, 36, 30, 45,
            15, 25, 34, 21, 37, 46, 31, 19,
            40, 52, 41, 53, 42, 54, 43, 55,
            7, 8, 22, 23, 38, 39, 50, 51,
            13, 27, 35, 49, 57, 58, 59, 60,
          ].filter(index => index < keyCenters.length);

          state.keyPresses = Array.from({ length: MAX_KEY_PRESSES }, () => new THREE.Vector4(0, 0, 1, 0));
          state.pressCount = { value: 0 };
          state.keyCenters = keyCenters;
          state.typingOrder = typingOrder;
          state.keyRadius = Math.min(xRange / 28, yRange / 12);
          state.keyPressDepth = 7.5;
          state.burstIndex = 0;
          state.keyMeshes = [];
          state.keyRestZ = zMax + 3.5;

          model.traverse(child => {
            if (child.isMesh && child.material) {
              const keyPresses = state.keyPresses;
              const pressCount = state.pressCount;
              const applyKeyPressShader = (material) => {
                material.onBeforeCompile = (shader) => {
                  shader.uniforms.uKeyPresses = { value: keyPresses };
                  shader.uniforms.uPressCount = pressCount;
                  shader.vertexShader = shader.vertexShader.replace('void main() {', `uniform vec4 uKeyPresses[${MAX_KEY_PRESSES}];\nuniform float uPressCount;\nvoid main() {`);
                  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\nfor (int i = 0; i < ${MAX_KEY_PRESSES}; i++) {\n  if (float(i) >= uPressCount) { break; }\n  vec4 keyPress = uKeyPresses[i];\n  float keyDist = distance(position.xy, keyPress.xy);\n  float keyShape = smoothstep(keyPress.z, 0.0, keyDist);\n  transformed.z -= keyShape * keyPress.w;\n}`);
                };
              };
              if (Array.isArray(child.material)) {
                child.material = child.material.map((material) => {
                  const cloned = material.clone();
                  applyKeyPressShader(cloned);
                  return cloned;
                });
              } else {
                child.material = child.material.clone();
                applyKeyPressShader(child.material);
              }
            }
          });

          if (keyboardMesh) {
            const keyGroup = new THREE.Group();
            keyGroup.name = 'KeyPressOverlay';
            const keyCapMaterial = new THREE.MeshStandardMaterial({
              color: 0xf2f2f2,
              roughness: 0.6,
              metalness: 0.02,
              emissive: new THREE.Color(0x08142a),
              emissiveIntensity: 0.08,
            });
            keySpecs.forEach(({ center, width, depth }, index) => {
              const geometry = new THREE.BoxGeometry(width, depth, 4.2);
              const keyCap = new THREE.Mesh(geometry, keyCapMaterial.clone());
              keyCap.name = `PressableKey_${index}`;
              keyCap.position.set(center.x, center.y, state.keyRestZ);
              keyCap.userData.restZ = state.keyRestZ;
              keyGroup.add(keyCap);
              state.keyMeshes.push(keyCap);
            });
            keyboardMesh.add(keyGroup);
          }
          state.active = false; state.t = 0; break;
        }
        case 'rgbBurst': {
          state.rgbMats = [];
          model.traverse(child => {
            if (child.isMesh && child.material) {
              const mn = child.material.name;
              if (mn === 'Green' || mn.toLowerCase().includes('green')) { child.material = child.material.clone(); child.material.emissive = new THREE.Color(0x00ff44); child.material.emissiveIntensity = 0; state.rgbMats.push(child.material); }
            }
          });
          state.origRotY = entry.wrapper.rotation.y;
          state.spinAngle = 0;
          state.active = false; state.t = 0; break;
        }
        case 'propellerSpin': {
          state.motors = [];
          ['右前电机','左前电机','右后电机','左后电机'].forEach(n => {
            model.traverse(child => {
              if (child.name === n) {
                state.motors.push({ object: child, origQuat: child.quaternion.clone() });
              }
            });
          });
          state.spinAngle = 0;
          state.active = false; state.t = 0; state.hoverBase = entry.wrapper.position.y; break;
        }
      }
    }

    function updateAnimations(delta) {
      const time = clock.getElapsedTime();
      entries.forEach(entry => {
        const { config, wrapper, state } = entry;
        switch (config.animation) {
          case 'none': case 'zoomToScreen': break;
          case 'nixieFlicker': {
            // Idle flicker
            const p = 2.0 + Math.sin(time*1.5)*0.4;
            state.digitMats.forEach((m,i) => { if (!state.active) { const b = p + Math.sin(time*8+i*2)*0.15; m.color.setRGB(b, b*0.45, 0); } });
            state.displayMats.forEach(m => { if (!state.active) m.emissiveIntensity = 1.0 + Math.sin(time*2)*0.2; });
            // Click: rapid digit cycling then settle on next world line
            if (state.active) {
              state.t += delta;
              const dur = 2.0;
              if (state.t < dur) {
                const cycleSpeed = state.t < 1.2 ? 0.05 : 0.1 + (state.t - 1.2) * 0.4;
                if (!state.lastCycle || state.t - state.lastCycle > cycleSpeed) {
                  state.lastCycle = state.t;
                  const target = state.worldLines[state.targetLine];
                  const numDigits = ['0','1','2','3','4','5','6','7','8','9'];
                  state.tubeOrder.forEach((suffix, i) => {
                    const tube = state.tubes[suffix];
                    if (!tube || target[i] === 'Dot') return; // skip dot tube
                    if (tube.active && tube.digits[tube.active]) tube.digits[tube.active].visible = false;
                    // Near end, lock to target digit
                    const pick = state.t > 1.5 + i * 0.05 ? target[i] : numDigits[Math.floor(Math.random() * 10)];
                    if (tube.digits[pick]) {
                      tube.digits[pick].visible = true;
                      tube.digits[pick].material = state.onMat.clone();
                      tube.digits[pick].material.color.setRGB(2, 0.9, 0);
                      tube.active = pick;
                    }
                  });
                  state.digitMats = [];
                  Object.values(state.tubes).forEach(tube => {
                    if (tube.active && tube.digits[tube.active]) state.digitMats.push(tube.digits[tube.active].material);
                  });
                }
                state.digitMats.forEach((m,i) => { const on = Math.sin(state.t*40+i*7)>0; m.color.setRGB(on?2:0.1, on?0.9:0.04, 0); });
              } else {
                state.active = false;
                state.lastCycle = 0;
                state.currentLine = state.targetLine;
                // Flash world line images after animation settles
                const imgs = state.worldLineImages[state.targetLine];
                const flashEl = container.querySelector('.worldline-flash');
                if (flashEl && imgs.length > 0) {
                  let idx = 0;
                  const perImage = 250;
                  flashEl.style.transition = 'none';
                  function showNext() {
                    if (idx >= imgs.length) {
                      flashEl.style.transition = 'opacity 0.3s ease';
                      flashEl.style.opacity = '0';
                      return;
                    }
                    flashEl.style.backgroundImage = `url(${imgs[idx]})`;
                    flashEl.style.opacity = '0.85';
                    idx++;
                    setTimeout(showNext, perImage);
                  }
                  showNext();
                }
              }
            }
            break;
          }
          case 'typingBurst': {
            if (state.active) {
              state.t += Math.min(delta, 1 / 30);
              const dur = 3.0;
              const interval = 0.055;
              const pressDur = 0.22;
              let pressCount = 0;
              if (state.t < dur) {
                state.keyPresses.forEach((keyPress) => keyPress.set(0, 0, 1, 0));
                const activeKeyMeshes = new Set();
                for (let i = 0; i < state.typingOrder.length && pressCount < MAX_KEY_PRESSES; i++) {
                  const start = i * interval;
                  const localT = state.t - start;
                  if (localT < 0 || localT > pressDur) continue;
                  const keyIndex = state.typingOrder[(i + state.burstIndex) % state.typingOrder.length];
                  const center = state.keyCenters[keyIndex];
                  const progress = localT / pressDur;
                  const press = Math.sin(progress * Math.PI);
                  state.keyPresses[pressCount].set(center.x, center.y, state.keyRadius, state.keyPressDepth * press);
                  const keyMesh = state.keyMeshes[keyIndex];
                  if (keyMesh) {
                    keyMesh.position.z = keyMesh.userData.restZ - state.keyPressDepth * 1.6 * press;
                    keyMesh.scale.z = 1 - 0.18 * press;
                    keyMesh.material.emissiveIntensity = 0.08 + 0.28 * press;
                    activeKeyMeshes.add(keyMesh);
                  }
                  pressCount++;
                }
                state.pressCount.value = pressCount;
                state.keyMeshes.forEach((keyMesh) => {
                  if (keyMesh.position.z !== keyMesh.userData.restZ && !activeKeyMeshes.has(keyMesh)) {
                    keyMesh.position.z += (keyMesh.userData.restZ - keyMesh.position.z) * 0.45;
                    keyMesh.scale.z += (1 - keyMesh.scale.z) * 0.45;
                    keyMesh.material.emissiveIntensity += (0.08 - keyMesh.material.emissiveIntensity) * 0.45;
                  }
                });
              } else {
                state.active = false;
                state.t = 0;
                state.pressCount.value = 0;
                state.keyMeshes.forEach((keyMesh) => {
                  keyMesh.position.z = keyMesh.userData.restZ;
                  keyMesh.scale.z = 1;
                  keyMesh.material.emissiveIntensity = 0.08;
                });
                state.burstIndex = (state.burstIndex + 7) % state.typingOrder.length;
              }
            }
            break;
          }
          case 'rgbBurst': {
            if (state.active) {
              state.t += delta;
              const dur = 1.5;
              if (state.t < dur) {
                // RGB color cycle
                const h = (state.t * 3) % 1;
                const c = new THREE.Color().setHSL(h, 1, 0.5);
                const f = state.t < 0.15 ? state.t / 0.15 : Math.max(0, 1 - (state.t - 0.15) / (dur - 0.15));
                state.rgbMats.forEach(m => { m.emissive.copy(c); m.emissiveIntensity = f * 5; });
                // Spin — ease in then ease out
                const spinEase = state.t < 0.3 ? state.t / 0.3 : (state.t > dur - 0.3 ? (dur - state.t) / 0.3 : 1);
                state.spinAngle += spinEase * 15 * delta;
                wrapper.rotation.y = state.origRotY + state.spinAngle;
              } else {
                state.active = false;
                state.rgbMats.forEach(m => { m.emissiveIntensity = 0; });
                state.spinAngle = 0;
                wrapper.rotation.y = state.origRotY;
              }
            }
            break;
          }
          case 'propellerSpin': {
            if (state.active) {
              state.t += delta;
              if (state.t < 3) {
                const sc = state.t<0.5 ? state.t/0.5 : (state.t>2.5 ? (3-state.t)/0.5 : 1);
                state.spinAngle += sc * 35 * delta;
                const localSpin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), state.spinAngle);
                state.motors.forEach(({object, origQuat}) => {
                  // Rotate motor around its local Y — propeller is the only child
                  object.quaternion.copy(origQuat).multiply(localSpin);
                });
                const hc = state.t<0.5 ? state.t/0.5 : (state.t>2 ? Math.max(0,(3-state.t)) : 1);
                wrapper.position.y = state.hoverBase + hc*0.15 + Math.sin(time*3)*0.02*hc;
              } else {
                state.active = false;
                state.spinAngle = 0;
                state.motors.forEach(({object, origQuat}) => {
                  object.quaternion.copy(origQuat);
                });
                wrapper.position.y = state.hoverBase;
              }
            }
            break;
          }
        }
      });
    }

    // ── Zoom ──
    function startZoomIn(entry) {
      const screenCenter = new THREE.Vector3(-0.4612, 1.7991, 0.0);
      const screenNormal = new THREE.Vector3(0.939, 0.343, 0.0).normalize();
      // Compute dist mathematically: screen must cover viewport (like CSS bg-cover)
      const fov = camera.fov * Math.PI / 180;
      const aspect = camera.aspect;
      const W = entry.state.screenWidth || 0.5;
      const H = entry.state.screenHeight || 0.32;
      const dH = H / (2 * Math.tan(fov / 2));
      const dW = W / (2 * Math.tan(fov / 2) * aspect);
      const dist = Math.min(dH, dW);
      console.log(`[Zoom] W=${W.toFixed(4)} H=${H.toFixed(4)} aspect=${aspect.toFixed(3)} dH=${dH.toFixed(4)} dW=${dW.toFixed(4)} dist=${dist.toFixed(4)}`);
      zoomTargetPos.copy(screenCenter).addScaledVector(screenNormal, dist);
      zoomTargetLook.copy(screenCenter);
      zoomState = 'zooming-in'; zoomT = 0;
    }

    function updateZoom(delta) {
      if (zoomState === 'idle' || zoomState === 'zoomed') return;
      const dur = 1.2;
      zoomT += delta;
      const progress = Math.min(zoomT / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      if (zoomState === 'zooming-in') {
        camera.position.lerpVectors(origCamPos, zoomTargetPos, eased);
        controls.target.lerpVectors(origCamTarget, zoomTargetLook, eased);
        const dimFactor = 1 - eased;
        presetA.children.forEach(l => { if (l.isLight && l._origIntensity === undefined) l._origIntensity = l.intensity; if (l.isLight) l.intensity = l._origIntensity * dimFactor; });
        presetB.children.forEach(l => { if (l.isLight && l._origIntensity === undefined) l._origIntensity = l.intensity; if (l.isLight) l.intensity = l._origIntensity * dimFactor; });
        if (progress >= 1) {
          zoomState = 'zoomed';
          onEnterScreenRef.current?.();
        }
      } else if (zoomState === 'zooming-out') {
        camera.position.lerpVectors(zoomTargetPos, origCamPos, eased);
        controls.target.lerpVectors(zoomTargetLook, origCamTarget, eased);
        const dimFactor = eased;
        presetA.children.forEach(l => { if (l.isLight && l._origIntensity !== undefined) l.intensity = l._origIntensity * dimFactor; });
        presetB.children.forEach(l => { if (l.isLight && l._origIntensity !== undefined) l.intensity = l._origIntensity * dimFactor; });
        if (progress >= 1) {
          zoomState = 'idle';
          presetA.children.forEach(l => { if (l.isLight && l._origIntensity !== undefined) l.intensity = l._origIntensity; });
          presetB.children.forEach(l => { if (l.isLight && l._origIntensity !== undefined) l.intensity = l._origIntensity; });
        }
      }
      controls.update();
    }

    // ── Raycaster ──
    function getEntryFromMesh(mesh) {
      for (const entry of entries) {
        if (entry.config.name === 'Computer Desk') continue;
        let p = mesh;
        while (p) { if (p === entry.wrapper) return entry; p = p.parent; }
      }
      return null;
    }

    function getEntryAtClientPoint(clientX, clientY) {
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      for (const h of hits) {
        const entry = getEntryFromMesh(h.object);
        if (entry) return entry;
      }
      return null;
    }

    const onMouseMove = (e) => {
      const found = getEntryAtClientPoint(e.clientX, e.clientY);
      if (found) {
        hoveredEntry = found;
        if (tooltipNameEl) tooltipNameEl.textContent = found.config.name;
        if (tooltipEl) { tooltipEl.style.opacity = '1'; tooltipEl.style.left = (e.clientX+16)+'px'; tooltipEl.style.top = (e.clientY-16)+'px'; }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        hoveredEntry = null;
        if (tooltipEl) tooltipEl.style.opacity = '0';
        renderer.domElement.style.cursor = 'default';
      }
    };

    const onClick = (e) => {
      const clickedEntry = getEntryAtClientPoint(e.clientX, e.clientY) || hoveredEntry;
      if (!clickedEntry) return;
      if (clickedEntry.config.animation === 'zoomToScreen' && zoomState === 'idle') {
        startZoomIn(clickedEntry);
      } else if (clickedEntry.config.animation !== 'none' && clickedEntry.config.animation !== 'zoomToScreen' && !clickedEntry.state.active && zoomState === 'idle') {
        clickedEntry.state.active = true;
        clickedEntry.state.t = 0;
        // For nixie: pick next world line + flash image
        if (clickedEntry.config.animation === 'nixieFlicker' && clickedEntry.state.worldLines) {
          let next;
          do { next = Math.floor(Math.random() * clickedEntry.state.worldLines.length); } while (next === clickedEntry.state.currentLine && clickedEntry.state.worldLines.length > 1);
          clickedEntry.state.targetLine = next;
        }
      }
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onKeyDown = (e) => {
      if (e.key === 'l' || e.key === 'L') togglePreset();
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);

    // ── Load & animate ──
    (async () => {
      let loadedCount = 0;
      for (let i = 0; i < MODELS.length; i++) {
        const cfg = MODELS[i];
        if (textEl) textEl.textContent = `Loading ${cfg.name}...`;
        try {
          const asset = cfg.type === 'fbx'
            ? await fbxLoader.loadAsync(cfg.path)
            : await gltfLoader.loadAsync(cfg.path);
          const entry = loadModel(asset, cfg);
          if (entry) { initAnimation(entry); entries.push(entry); }
        } catch (err) { console.error(`Failed to load ${cfg.name}:`, err); }
        loadedCount++;
        if (fillEl) fillEl.style.width = Math.round((loadedCount / MODELS.length) * 100) + '%';
      }
      if (overlayEl) { overlayEl.style.opacity = '0'; setTimeout(() => { overlayEl.style.display = 'none'; }, 900); }

      window.__entries = entries; // debug: expose entries
      // Find the Razer mouse entry for cursor tracking
      mouseEntry = entries.find(e => e.config.name === 'Razer Viper Mini') || null;
      let mouseHalfX = 0, mouseHalfZ = 0;
      if (mouseEntry) {
        const bb = new THREE.Box3().setFromObject(mouseEntry.wrapper);
        const sz = bb.getSize(new THREE.Vector3());
        mouseHalfX = sz.x / 2;
        mouseHalfZ = sz.z / 2;
      }

      // Debug: axes helper at origin + clamp boundary box
      const axesHelper = new THREE.AxesHelper(1);
      axesHelper.position.y = deskSurfaceY + 0.01;
      scene.add(axesHelper);

      // Clamp boundary wireframe box
      const dbgMinX = -0.18 * deskWorldWidth;
      const dbgMaxX = 0.15 * deskWorldWidth;
      const dbgMinZ = -0.38 * deskWorldWidth;
      const dbgMaxZ = -0.15 * deskWorldWidth;
      const boxW = dbgMaxX - dbgMinX;
      const boxD = dbgMaxZ - dbgMinZ;
      const boxH = 0.15;
      const boundBox = new THREE.Mesh(
        new THREE.BoxGeometry(boxW, boxH, boxD),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, transparent: true, opacity: 0.5 })
      );
      boundBox.position.set(
        (dbgMinX + dbgMaxX) / 2,
        deskSurfaceY + boxH / 2,
        (dbgMinZ + dbgMaxZ) / 2
      );
      scene.add(boundBox);

      function animate() {
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();

        // Smooth mouse parallax
        const lerp = 1 - Math.pow(0.05, delta);
        mouseParallax.x += (mouse.x * 0.3 - mouseParallax.x) * lerp;
        mouseParallax.y += (mouse.y * 0.15 - mouseParallax.y) * lerp;

        // Apply parallax offset to camera (only when not zoomed)
        if (zoomState === 'idle') {
          camera.position.x = origCamPos.x + mouseParallax.x;
          camera.position.y = origCamPos.y + mouseParallax.y;
        }

        // Move 3D mouse model to mirror cursor
        if (mouseEntry && zoomState === 'idle') {
          const range = 0.4;
          const targetX = -mouse.y * range;
          const targetZ = -mouse.x * range;
          mouseModelOffset.x += (targetX - mouseModelOffset.x) * lerp;
          mouseModelOffset.z += (targetZ - mouseModelOffset.z) * lerp;
          const baseX = mouseEntry.config.deskPos[0] * deskWorldWidth;
          const baseZ = mouseEntry.config.deskPos[2] * deskWorldWidth;
          // Clamp: inset by mouse half-size so no part exceeds the boundary
          const minX = -0.18 * deskWorldWidth + mouseHalfX;
          const maxX = 0.15 * deskWorldWidth - mouseHalfX;
          const minZ = -0.38 * deskWorldWidth + mouseHalfZ;
          const maxZ = -0.15 * deskWorldWidth - mouseHalfZ;
          mouseEntry.wrapper.position.x = Math.max(minX, Math.min(maxX, baseX + mouseModelOffset.x));
          mouseEntry.wrapper.position.z = Math.max(minZ, Math.min(maxZ, baseZ + mouseModelOffset.z));
        }

        controls.update();
        updateZoom(delta);
        updateAnimations(delta);
        renderer.render(scene, camera);
      }
      animate();
    })();

    // Expose zoom-out for parent
    cleanupRef.current = {
      zoomOut: () => { zoomState = 'zooming-out'; zoomT = 0; },
      togglePreset,
      destroy: () => {
        if (animId) cancelAnimationFrame(animId);
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('keydown', onKeyDown);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };

    return () => { cleanupRef.current?.destroy(); };
  }, []);

  useImperativeHandle(ref, () => ({
    __zoomOut: () => cleanupRef.current?.zoomOut(),
  }));

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      {/* Loading overlay */}
      <div className="showroom-loading" style={{ position:'fixed', inset:0, zIndex:100, background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity 0.8s ease' }}>
        <div style={{ textAlign:'center', width:280, color:'#fff' }}>
          <div style={{ width:'100%', height:2, background:'rgba(255,255,255,0.1)', borderRadius:1, overflow:'hidden' }}>
            <div className="showroom-fill" style={{ height:'100%', width:'0%', background:'#fff', transition:'width 0.3s ease' }} />
          </div>
          <p className="showroom-text" style={{ fontSize:'0.8rem', opacity:0.4, marginTop:'1rem', fontWeight:300 }}>Loading models...</p>
        </div>
      </div>
      {/* Tooltip */}
      <div className="showroom-tooltip" style={{ position:'fixed', pointerEvents:'none', zIndex:50, padding:'8px 16px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#fff', fontSize:'0.85rem', fontWeight:500, opacity:0, transition:'opacity 0.2s', whiteSpace:'nowrap' }}>
        <span className="name"></span>
        <div style={{ fontSize:'0.7rem', fontWeight:300, opacity:0.5, marginTop:2 }}>Click to interact</div>
      </div>
      {/* World line flash overlay */}
      <div className="worldline-flash" style={{ position:'fixed', inset:0, zIndex:40, pointerEvents:'none', opacity:0, backgroundSize:'cover', backgroundPosition:'center', transition:'opacity 0.08s ease', mixBlendMode:'screen' }} />
      {/* Lighting toggle */}
      <button
        onClick={() => cleanupRef.current?.togglePreset?.()}
        style={{ position:'fixed', bottom:20, left:20, zIndex:50, padding:'6px 14px', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:6, color:'rgba(255,255,255,0.7)', fontSize:'0.75rem', fontWeight:400, cursor:'pointer', letterSpacing:'0.03em', transition:'all 0.2s' }}
      >
        <span className="preset-label">Spotlight</span>
        <span style={{ opacity:0.35, marginLeft:8, fontSize:'0.65rem' }}>L</span>
      </button>
    </div>
  );
});

export default DeskShowroom;
