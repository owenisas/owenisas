import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ── Real-world sizes (cm) — desk is the reference ──────
const DESK_REAL_WIDTH = 120; // cm

const MODELS = [
  {
    name: 'Computer Desk',
    path: '../assets/computer_desk.glb',
    realWidth: DESK_REAL_WIDTH, // anchor — determines world scale
    onDesk: false,
    deskPos: [0, 0, 0],
    rotationY: Math.PI,
    animation: 'none',
  },
  {
    name: 'MacBook Pro M3',
    path: '../assets/macbook_pro_m3_16_inch_2024.glb',
    realWidth: 35.6,
    onDesk: true,
    deskPos: [-0.08, 0, 0.0], // center, pushed back
    rotationY: Math.PI / 2,
    animation: 'zoomToScreen',
  },
  {
    name: 'Keychron K8',
    path: '../assets/keychron_k8.glb',
    realWidth: 35.9,
    onDesk: true,
    deskPos: [0.1, 0, 0.0], // front-center
    rotationY: Math.PI / 2,
    animation: 'typingBurst',
  },
  {
    name: 'Razer Viper Mini',
    path: '../assets/razer_viper_mini.glb',
    realWidth: 11.8,
    onDesk: true,
    deskPos: [0.07, 0, -0.25], // right of keyboard, more forward
    rotationY: Math.PI * 240 / 180,
    animation: 'rgbBurst',
  },
  {
    name: 'DJI Mavic 3',
    path: '../assets/dji-mavic-3/source/DJI-Mavic_3.glb',
    realWidth: 35,
    onDesk: true,
    deskPos: [0.08, 0, 0.35], // far left, slightly forward
    rotationY: Math.PI / 2 + 0.3,
    animation: 'propellerSpin',
  },
  {
    name: 'Divergence Meter',
    path: '../assets/divergence_meter_steinsgate.glb',
    realWidth: 25,
    onDesk: true,
    deskPos: [-0.1, 0, 0.3], // left, back area (original position)
    rotationY: Math.PI / 2 + 0.5,
    animation: 'nixieFlicker',
  },
];

// ── Renderer, Scene, Camera ─────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.8;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0c);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 200);
camera.position.set(2.2, 2.6, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-0.3, 2.8, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = false;
controls.update();

// ── Lighting — desk lamp feel ───────────────────────────
scene.add(new THREE.AmbientLight(0x334455, 1.8));

// Overhead desk lamp
const deskLamp = new THREE.SpotLight(0xfff4e8, 60, 8, Math.PI / 5, 0.6, 1.5);
deskLamp.position.set(0, 3.5, 0.5);
deskLamp.target.position.set(0, 0.8, 0);
scene.add(deskLamp);
scene.add(deskLamp.target);

// Soft fill from front
const fillLight = new THREE.DirectionalLight(0xddeeff, 1.5);
fillLight.position.set(-2, 2, 3);
scene.add(fillLight);

// Warm side accent
const warmAccent = new THREE.PointLight(0xffaa66, 15, 8);
warmAccent.position.set(2, 1.5, 0.5);
scene.add(warmAccent);

// Cool rim from behind
const rimLight = new THREE.PointLight(0x4466aa, 20, 10);
rimLight.position.set(0, 1, -3);
scene.add(rimLight);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x0c0c10, roughness: 0.15, metalness: 0.05 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
scene.add(ground);

// ── Loading ─────────────────────────────────────────────
const gltfLoader = new GLTFLoader();
const loadingOverlay = document.getElementById('loading-overlay');
const loaderFill = document.querySelector('.loader-fill');
const loaderText = document.querySelector('.loader-text');
const tooltip = document.getElementById('tooltip');
const tooltipName = tooltip.querySelector('.name');

const entries = [];
let loadedCount = 0;

// Desk reference data — set after desk loads
let deskWorldWidth = 1;
let deskSurfaceY = 0;
let deskCenterX = 0;
let deskCenterZ = 0;

function loadModel(gltf, config) {
  const model = gltf.scene;
  model.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  if (maxDim === 0 || !isFinite(maxDim)) return null;

  const wrapper = new THREE.Group();
  wrapper.add(model);

  if (config.onDesk) {
    // Scale relative to desk using real-world ratios
    const worldSize = deskWorldWidth * (config.realWidth / DESK_REAL_WIDTH);
    const scale = worldSize / maxDim;
    wrapper.scale.set(scale, scale, scale);

    // Center model, bottom at Y=0 of wrapper
    model.position.set(-center.x, -center.y + size.y / 2, -center.z);

    // Place on desk surface — deskPos is normalized [-0.5..0.5] of desk width/depth
    const x = deskCenterX + config.deskPos[0] * deskWorldWidth;
    const z = deskCenterZ + config.deskPos[2] * deskWorldWidth;
    wrapper.position.set(x, deskSurfaceY, z);
    wrapper.rotation.y = config.rotationY;

    console.log(`[desk] ${config.name}: scale=${scale.toFixed(5)}, worldSize=${worldSize.toFixed(3)}, pos=(${x.toFixed(2)}, ${deskSurfaceY.toFixed(2)}, ${z.toFixed(2)})`);
  } else {
    // This IS the desk — scale to target world size
    const deskTargetSize = 2.5;
    const scale = deskTargetSize / maxDim;
    wrapper.scale.set(scale, scale, scale);

    // Bottom at Y=0
    model.position.set(-center.x, -center.y + size.y / 2, -center.z);
    wrapper.position.set(0, 0, 0);
    wrapper.rotation.y = config.rotationY;

    // Calculate desk surface Y and world width (use largest horizontal extent)
    const scaledSize = size.clone().multiplyScalar(scale);
    deskWorldWidth = Math.max(scaledSize.x, scaledSize.z); // desk's longest side = real 120cm
    deskSurfaceY = scaledSize.y; // top of desk
    deskCenterX = 0;
    deskCenterZ = 0;

    console.log(`[desk] DESK: scale=${scale.toFixed(5)}, worldSize=${scaledSize.x.toFixed(2)}x${scaledSize.y.toFixed(2)}x${scaledSize.z.toFixed(2)}, deskWorldWidth=${deskWorldWidth.toFixed(2)}, surfaceY=${deskSurfaceY.toFixed(3)}`);
  }

  const meshes = [];
  wrapper.traverse(child => {
    if (child.isMesh) {
      child.frustumCulled = false;
      meshes.push(child);
    }
  });

  wrapper.userData.configName = config.name;
  scene.add(wrapper);

  return { config, wrapper, model, meshes, state: {} };
}

async function loadAll() {
  // Load desk FIRST so we know surface position
  const deskCfg = MODELS[0];
  loaderText.textContent = `Loading ${deskCfg.name}...`;
  try {
    const gltf = await gltfLoader.loadAsync(deskCfg.path);
    const entry = loadModel(gltf, deskCfg);
    if (entry) {
      initAnimation(entry);
      entries.push(entry);
    }
  } catch (err) {
    console.error(`[desk] Failed to load desk:`, err);
  }
  loadedCount++;
  loaderFill.style.width = Math.round((loadedCount / MODELS.length) * 100) + '%';

  // Load remaining models onto the desk
  for (let i = 1; i < MODELS.length; i++) {
    const cfg = MODELS[i];
    loaderText.textContent = `Loading ${cfg.name}...`;
    try {
      const gltf = await gltfLoader.loadAsync(cfg.path);
      const entry = loadModel(gltf, cfg);
      if (entry) {
        initAnimation(entry);
        entries.push(entry);
      }
    } catch (err) {
      console.error(`[desk] Failed to load ${cfg.name}:`, err);
    }
    loadedCount++;
    loaderFill.style.width = Math.round((loadedCount / MODELS.length) * 100) + '%';
    console.log(`[desk] Loaded ${cfg.name} (${loadedCount}/${MODELS.length})`);
  }

  // Update camera target to desk surface center
  controls.target.set(deskCenterX, deskSurfaceY * 0.7, deskCenterZ);
  controls.update();

  loadingOverlay.classList.add('hidden');
  setTimeout(() => { loadingOverlay.style.display = 'none'; }, 900);
  console.log('[desk] All models loaded');
}

// ── Animation init per model ────────────────────────────
function initAnimation(entry) {
  const { config, model, meshes, state } = entry;

  switch (config.animation) {
    case 'none': break;
    case 'lidToggle': {
      state.lidGroup = null;
      state.screenMats = [];
      model.traverse(child => {
        if (child.name === 'VCQqxpxkUlzqcJI_62') {
          state.lidGroup = child;
          state.openAngle = child.rotation.x;
          state.closedAngle = child.rotation.x - Math.PI / 2;
        }
        if (child.isMesh && child.material) {
          const mn = child.material.name;
          if (mn === 'XCYkeTCxqFmKTKe' || mn === 'sfCQkHOWyrsLmor') {
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color(0x4488ff);
            child.material.emissiveIntensity = 0;
            state.screenMats.push(child.material);
          }
        }
      });
      state.isOpen = true;
      state.active = false;
      state.t = 0;
      break;
    }
    case 'nixieFlicker': {
      state.digitMats = [];
      state.displayMats = [];
      state.warmLight = new THREE.PointLight(0xff9922, 0, 3);
      state.warmLight.position.copy(entry.wrapper.position).add(new THREE.Vector3(0, 0.3, 0.1));
      scene.add(state.warmLight);
      model.traverse(child => {
        if (child.isMesh && child.material) {
          const mn = child.material.name;
          if (mn === 'number_on_mt') {
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color(1.0, 0.6, 0.1);
            child.material.emissiveIntensity = 0.8;
            state.digitMats.push(child.material);
          } else if (mn === 'display_mt') {
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color(1.0, 0.5, 0.05);
            child.material.emissiveIntensity = 0.2;
            state.displayMats.push(child.material);
          }
        }
      });
      state.active = false;
      state.t = 0;
      break;
    }
    case 'typingBurst': {
      state.waveX = { value: -9999.0 };
      state.waveStrength = { value: 0.0 };

      model.traverse(child => {
        if (child.name === 'SM_KeychronK8_misc') child.visible = false;
      });

      let xMin = Infinity, xMax = -Infinity;
      model.traverse(child => {
        if (child.isMesh && child.material) {
          const pos = child.geometry.attributes.position;
          if (pos) {
            for (let i = 0; i < pos.count; i++) {
              const x = pos.getX(i);
              if (x < xMin) xMin = x;
              if (x > xMax) xMax = x;
            }
          }

          child.material = child.material.clone();
          const waveX = state.waveX;
          const waveStr = state.waveStrength;

          child.material.onBeforeCompile = (shader) => {
            shader.uniforms.uWaveX = waveX;
            shader.uniforms.uWaveStrength = waveStr;
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              `uniform float uWaveX;
               uniform float uWaveStrength;
               void main() {`
            );
            shader.vertexShader = shader.vertexShader.replace(
              '#include <begin_vertex>',
              `#include <begin_vertex>
               float waveDist = position.x - uWaveX;
               float waveW = 20.0;
               float press = exp(-(waveDist * waveDist) / (2.0 * waveW * waveW));
               transformed.y -= press * uWaveStrength;`
            );
          };
        }
      });
      state.xMin = xMin;
      state.xMax = xMax;
      state.active = false;
      state.t = 0;
      break;
    }
    case 'rgbBurst': {
      state.rgbMats = [];
      state.strobeLight = new THREE.PointLight(0x00ff00, 0, 2);
      state.strobeLight.position.copy(entry.wrapper.position).add(new THREE.Vector3(0, 0.1, 0));
      scene.add(state.strobeLight);
      model.traverse(child => {
        if (child.isMesh && child.material) {
          const mn = child.material.name;
          if (mn === 'Green' || mn.toLowerCase().includes('green')) {
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color(0x00ff44);
            child.material.emissiveIntensity = 0;
            state.rgbMats.push(child.material);
          }
        }
      });
      state.active = false;
      state.t = 0;
      break;
    }
    case 'propellerSpin': {
      state.propellers = [];
      const propNames = ['桨叶1', '桨叶2', '桨叶3', '桨叶4'];
      model.traverse(child => {
        if (propNames.includes(child.name)) {
          state.propellers.push({ object: child, origQuat: child.quaternion.clone() });
        }
      });
      state.spinAngle = 0;
      state.active = false;
      state.t = 0;
      state.hoverBase = entry.wrapper.position.y;
      break;
    }
  }
}

// ── Camera zoom state ───────────────────────────────────
const origCamPos = camera.position.clone();
const origCamTarget = controls.target.clone();
let zoomState = 'idle'; // 'idle' | 'zooming-in' | 'zoomed' | 'zooming-out'
let zoomT = 0;
let zoomTargetPos = new THREE.Vector3();
let zoomTargetLook = new THREE.Vector3();
const screenOverlay = document.getElementById('screen-overlay');
const screenIframe = document.getElementById('screen-iframe');

function startZoomIn(entry) {
  const wp = entry.wrapper.position.clone();
  const screenCenter = wp.clone().add(new THREE.Vector3(-0.08, 0.22, 0));
  zoomTargetPos.copy(screenCenter).add(new THREE.Vector3(0.35, 0.05, 0));
  zoomTargetLook.copy(screenCenter);

  // Load macOS app from built static files (same origin)
  screenIframe.src = '/macos/dist/';

  zoomState = 'zooming-in';
  zoomT = 0;
  console.log('[desk] Zooming into MacBook screen');
}

function startZoomOut() {
  zoomState = 'zooming-out';
  zoomT = 0;
  screenOverlay.classList.remove('active');
  // Unload iframe after zoom out completes
  setTimeout(() => { screenIframe.src = 'about:blank'; }, 1300);
  console.log('[desk] Zooming out');
}

// ESC to zoom out
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && (zoomState === 'zoomed' || zoomState === 'zooming-in')) {
    startZoomOut();
  }
});

// Click back button to zoom out
document.getElementById('screen-back').addEventListener('click', (e) => {
  e.stopPropagation();
  if (zoomState === 'zoomed') startZoomOut();
});

// ── Click trigger ───────────────────────────────────────
function triggerAnimation(entry) {
  if (entry.config.animation === 'none') return;
  if (entry.config.animation === 'zoomToScreen') {
    if (zoomState === 'idle') startZoomIn(entry);
    return;
  }
  if (zoomState !== 'idle') return; // don't trigger other anims while zoomed
  console.log(`[desk] Clicked: ${entry.config.name}`);
  entry.state.active = true;
  entry.state.t = 0;
}

// ── Update animations ───────────────────────────────────
const clock = new THREE.Clock();

function updateAnimations(delta) {
  const time = clock.getElapsedTime();

  entries.forEach(entry => {
    const { config, wrapper, state } = entry;

    switch (config.animation) {
      case 'none': break;
      case 'lidToggle': {
        if (state.active && state.lidGroup) {
          state.t += delta;
          const dur = 0.8;
          const progress = Math.min(state.t / dur, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          if (state.isOpen) {
            state.lidGroup.rotation.x = state.openAngle + (state.closedAngle - state.openAngle) * eased;
            state.screenMats.forEach(m => { m.emissiveIntensity = (1 - eased) * 2; });
          } else {
            state.lidGroup.rotation.x = state.closedAngle + (state.openAngle - state.closedAngle) * eased;
            state.screenMats.forEach(m => { m.emissiveIntensity = eased * 2; });
          }
          if (progress >= 1) {
            state.isOpen = !state.isOpen;
            state.active = false;
          }
        }
        if (!state.active && state.isOpen) {
          const pulse = 1.5 + Math.sin(time * 2) * 0.3;
          state.screenMats.forEach(m => { m.emissiveIntensity = pulse; });
        }
        break;
      }
      case 'nixieFlicker': {
        const idlePulse = 0.6 + Math.sin(time * 1.5) * 0.1;
        state.digitMats.forEach((m, i) => {
          if (!state.active) m.emissiveIntensity = idlePulse + Math.sin(time * 8 + i * 2) * 0.05;
        });
        state.displayMats.forEach(m => {
          if (!state.active) m.emissiveIntensity = 0.15 + Math.sin(time * 2) * 0.03;
        });
        if (!state.active) state.warmLight.intensity = 20 + Math.sin(time * 6) * 3;
        if (state.active) {
          state.t += delta;
          if (state.t < 1.5) {
            state.digitMats.forEach((m, i) => {
              m.emissiveIntensity = Math.sin(state.t * 40 + i * 7) > 0 ? 3.5 : 0.1;
            });
            state.warmLight.intensity = 60 + Math.sin(state.t * 25) * 30;
          } else {
            state.active = false;
          }
        }
        break;
      }
      case 'typingBurst': {
        if (state.active) {
          state.t += delta;
          const t = state.t;
          if (t < 2.5) {
            const xRange = state.xMax - state.xMin;
            const passTime = 0.7;
            const passIdx = Math.floor(t / passTime);
            const passProgress = (t % passTime) / passTime;
            const goingRight = passIdx % 2 === 0;
            const wavePos = goingRight ? passProgress : 1 - passProgress;
            state.waveX.value = state.xMin + wavePos * xRange;
            state.waveStrength.value = 10.0;
          } else {
            state.active = false;
            state.waveX.value = -9999.0;
            state.waveStrength.value = 0.0;
          }
        }
        break;
      }
      case 'rgbBurst': {
        if (state.active) {
          state.t += delta;
          const t = state.t;
          if (t < 1.2) {
            const hue = (t * 3) % 1;
            const color = new THREE.Color().setHSL(hue, 1, 0.5);
            const flash = t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - 0.15) / 1.05);
            state.rgbMats.forEach(m => {
              m.emissive.copy(color);
              m.emissiveIntensity = flash * 5;
            });
            state.strobeLight.color.copy(color);
            state.strobeLight.intensity = flash * 40;
          } else {
            state.active = false;
            state.rgbMats.forEach(m => { m.emissiveIntensity = 0; });
            state.strobeLight.intensity = 0;
          }
        }
        break;
      }
      case 'propellerSpin': {
        if (state.active) {
          state.t += delta;
          const t = state.t;
          if (t < 3.0) {
            const speedCurve = t < 0.5 ? t / 0.5 : (t > 2.5 ? (3 - t) / 0.5 : 1);
            state.spinAngle += speedCurve * 35 * delta;
            const spinQuat = new THREE.Quaternion();
            spinQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), state.spinAngle);
            state.propellers.forEach(({ object, origQuat }) => {
              object.quaternion.copy(origQuat).multiply(spinQuat);
            });
            const hoverCurve = t < 0.5 ? t / 0.5 : (t > 2.0 ? Math.max(0, (3 - t) / 1.0) : 1);
            const bob = Math.sin(time * 3) * 0.02 * hoverCurve;
            wrapper.position.y = state.hoverBase + hoverCurve * 0.15 + bob;
          } else {
            state.active = false;
            wrapper.position.y = state.hoverBase;
          }
        }
        break;
      }
    }
  });
}

// ── Raycaster & tooltip ─────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredEntry = null;

function getEntryFromMesh(mesh) {
  for (const entry of entries) {
    if (entry.config.name === 'Computer Desk') continue; // skip desk itself
    let parent = mesh;
    while (parent) {
      if (parent === entry.wrapper) return entry;
      parent = parent.parent;
    }
  }
  return null;
}

renderer.domElement.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  let found = null;
  for (const hit of intersects) {
    const entry = getEntryFromMesh(hit.object);
    if (entry) { found = entry; break; }
  }

  if (found) {
    hoveredEntry = found;
    tooltipName.textContent = found.config.name;
    tooltip.classList.add('visible');
    tooltip.style.left = (e.clientX + 16) + 'px';
    tooltip.style.top = (e.clientY - 16) + 'px';
    renderer.domElement.style.cursor = 'pointer';
  } else {
    hoveredEntry = null;
    tooltip.classList.remove('visible');
    renderer.domElement.style.cursor = 'grab';
  }
});

renderer.domElement.addEventListener('click', (e) => {
  if (hoveredEntry && !hoveredEntry.state.active) {
    triggerAnimation(hoveredEntry);
  }
});

// ── Resize ──────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Camera zoom animation ───────────────────────────────
function updateZoom(delta) {
  if (zoomState === 'idle' || zoomState === 'zoomed') return;

  const dur = 1.2;
  zoomT += delta;
  const progress = Math.min(zoomT / dur, 1);
  const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

  if (zoomState === 'zooming-in') {
    camera.position.lerpVectors(origCamPos, zoomTargetPos, eased);
    controls.target.lerpVectors(origCamTarget, zoomTargetLook, eased);
    // Fade in overlay near end of zoom
    if (progress > 0.7) {
      const overlayAlpha = (progress - 0.7) / 0.3;
      screenOverlay.style.opacity = overlayAlpha;
    }
    if (progress >= 1) {
      zoomState = 'zoomed';
      screenOverlay.classList.add('active');
      screenOverlay.style.opacity = '';
    }
  } else if (zoomState === 'zooming-out') {
    camera.position.lerpVectors(zoomTargetPos, origCamPos, eased);
    controls.target.lerpVectors(zoomTargetLook, origCamTarget, eased);
    if (progress >= 1) {
      zoomState = 'idle';
    }
  }
  controls.update();
}

// ── Render loop ─────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update();
  updateZoom(delta);
  updateAnimations(delta);
  renderer.render(scene, camera);
}

// ── Start ───────────────────────────────────────────────
loadAll().then(() => {
  animate();
});
