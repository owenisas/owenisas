import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const MAX_KEY_PRESSES = 8;

export default function KeyboardTest() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera - centered view
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.set(0, 0.5, 0.6);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    // Lighting - studio setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Key light (main)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(2, 3, 2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light (softer, opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-2, 2, -1);
    scene.add(fillLight);

    // Rim light (backlight for edge definition)
    const rimLight = new THREE.DirectionalLight(0x88ccff, 0.8);
    rimLight.position.set(0, 1, -3);
    scene.add(rimLight);

    // Top light for key visibility
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);

    // Animation state
    const state = {
      active: false,
      t: 0,
      keyPresses: Array.from({ length: MAX_KEY_PRESSES }, () => new THREE.Vector4(0, 0, 1, 0)),
      pressCount: { value: 0 },
      keyCenters: [],
      typingOrder: [],
      keyRadius: 0,
      keyPressDepth: 0,
      burstIndex: 0,
    };

    // Expose for debugging
    window.__keyboardState = state;
    window.__scene = scene;
    window.__camera = camera;

    // Load keyboard
    const loader = new FBXLoader();
    loader.setResourcePath('/assets/keychron-k8/textures/');

    const manager = new THREE.LoadingManager();
    manager.setURLModifier((url) => {
      const filename = url.split('/').pop();
      if (!filename?.startsWith('T_KeychronK8_')) return url;
      const textureName = filename === 'T_KeychronK8_01_Roughness.png'
        ? 'T_KeychronK8_02_Roughness.png'
        : filename;
      return `/assets/keychron-k8/textures/${textureName}`;
    });

    const fbxLoader = new FBXLoader(manager);
    fbxLoader.setResourcePath('/assets/keychron-k8/textures/');

    fbxLoader.load('/assets/keychron-k8/source/KeychronK8_01.fbx', (model) => {
      // Hide misc parts
      model.traverse(child => {
        if (child.name === 'SM_KeychronK8_misc') child.visible = false;
      });

      // Rotate to Y-up
      model.rotation.x = -Math.PI / 2;
      model.updateMatrixWorld(true);

      // Center and scale - make keyboard fill view
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      // Scale to fill view - large
      const scale = 4.0 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);

      // Get LOCAL geometry bounds (XZ plane in original FBX)
      let xMin = Infinity, xMax = -Infinity, zMin = Infinity, zMax = -Infinity;
      model.traverse(child => {
        if (child.isMesh && child.geometry) {
          child.geometry.computeBoundingBox();
          const b = child.geometry.boundingBox;
          if (b.min.x < xMin) xMin = b.min.x;
          if (b.max.x > xMax) xMax = b.max.x;
          if (b.min.z < zMin) zMin = b.min.z;
          if (b.max.z > zMax) zMax = b.max.z;
        }
      });

      const xRange = xMax - xMin;
      const zRange = zMax - zMin;
      const xInset = xRange * 0.075;
      const zInset = zRange * 0.19;

      // Key layout (Keychron K8 TKL)
      const rowKeyWidths = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
        [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
        [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
        [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1, 1],
      ];
      const rowZPositions = [
        zMax - zInset,
        zMax - zInset - zRange * 0.16,
        zMax - zInset - zRange * 0.32,
        zMax - zInset - zRange * 0.48,
        zMin + zInset,
      ];

      const keyCenters = [];
      const keyableWidth = xRange - 2 * xInset;
      rowKeyWidths.forEach((widths, rowIdx) => {
        const z = rowZPositions[rowIdx];
        const totalUnits = widths.reduce((a, b) => a + b, 0);
        const unitWidth = keyableWidth / totalUnits;
        let xPos = xMin + xInset;
        widths.forEach((units) => {
          const keyWidth = units * unitWidth;
          keyCenters.push(new THREE.Vector2(xPos + keyWidth / 2, z));
          xPos += keyWidth;
        });
      });

      // Typing order (letter keys only)
      state.typingOrder = [
        29, 42, 30, 43, 31, 44, 32, 45,
        33, 46, 34, 47, 35, 48, 36, 49,
        37, 50, 38, 51, 39, 15, 16, 17,
        18, 19, 20, 21, 22, 23, 24, 25,
      ].filter(i => i < keyCenters.length);

      state.keyCenters = keyCenters;
      state.keyRadius = Math.min(xRange / 12, zRange / 4);
      state.keyPressDepth = 80;

      // Apply shader to all meshes
      model.traverse(child => {
        if (child.isMesh && child.material) {
          const applyShader = (mat) => {
            mat.onBeforeCompile = (shader) => {
              shader.uniforms.uKeyPresses = { value: state.keyPresses };
              shader.uniforms.uPressCount = state.pressCount;
              shader.vertexShader = shader.vertexShader.replace('void main() {',
                `uniform vec4 uKeyPresses[${MAX_KEY_PRESSES}];\nuniform float uPressCount;\nvarying float vKeyPress;\nvoid main() {\n  vKeyPress = 0.0;`);
              shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
                `#include <begin_vertex>\nfor (int i = 0; i < ${MAX_KEY_PRESSES}; i++) {\n  if (float(i) >= uPressCount) break;\n  vec4 kp = uKeyPresses[i];\n  float d = distance(position.xz, kp.xy);\n  float shape = smoothstep(kp.z, 0.0, d);\n  transformed.y -= shape * kp.w;\n  vKeyPress = max(vKeyPress, shape * kp.w / 80.0);\n}`);
              shader.fragmentShader = shader.fragmentShader.replace('void main() {',
                `varying float vKeyPress;\nvoid main() {`);
              shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.2, 0.8, 1.0) * vKeyPress * 25.0;`);
            };
          };
          if (Array.isArray(child.material)) {
            child.material = child.material.map(m => { const c = m.clone(); applyShader(c); return c; });
          } else {
            child.material = child.material.clone();
            applyShader(child.material);
          }
        }
      });

      scene.add(model);

      // Start animation
      state.active = true;

      // Status display
      const statusEl = document.getElementById('status');
      if (statusEl) statusEl.textContent = 'Keyboard loaded. Animation running.';
    });

    // Animation loop
    const clock = new THREE.Clock();
    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();

      if (state.active && state.keyCenters.length > 0) {
        state.t += Math.min(delta, 1 / 30);
        const dur = 3.0;
        const interval = 0.055;
        const pressDur = 0.22;
        let pressCount = 0;

        if (state.t < dur) {
          state.keyPresses.forEach(kp => kp.set(0, 0, 1, 0));
          for (let i = 0; i < state.typingOrder.length && pressCount < MAX_KEY_PRESSES; i++) {
            const start = i * interval;
            const localT = state.t - start;
            if (localT < 0 || localT > pressDur) continue;
            const keyIndex = state.typingOrder[(i + state.burstIndex) % state.typingOrder.length];
            const center = state.keyCenters[keyIndex];
            if (!center) continue;
            const progress = localT / pressDur;
            const press = Math.sin(progress * Math.PI);
            state.keyPresses[pressCount].set(center.x, center.y, state.keyRadius, state.keyPressDepth * press);
            pressCount++;
          }
          state.pressCount.value = pressCount;
        } else {
          state.active = true; // Loop
          state.t = 0;
          state.pressCount.value = 0;
          state.burstIndex = (state.burstIndex + 7) % state.typingOrder.length;
        }
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div id="status" style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontFamily: 'monospace',
        fontSize: 14,
        background: 'rgba(0,0,0,0.5)',
        padding: '8px 12px',
        borderRadius: 6,
      }}>
        Loading keyboard...
      </div>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        color: 'white',
        fontFamily: 'monospace',
        fontSize: 12,
        background: 'rgba(0,0,0,0.5)',
        padding: '8px 12px',
        borderRadius: 6,
      }}>
        Drag to rotate | Scroll to zoom
      </div>
    </div>
  );
}
