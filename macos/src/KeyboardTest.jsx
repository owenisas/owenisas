import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.set(0.3, 0.2, 0.4);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-2, 2, -1);
    scene.add(fillLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 5, 0);
    scene.add(topLight);

    // State
    const state = {
      mixer: null,
      active: false,
    };

    // Load knob1 keyboard
    const loader = new GLTFLoader();
    loader.load('/assets/knob1_mechanical_keyboard.glb', (gltf) => {
      const model = gltf.scene;
      // Log model structure
      console.log('=== NZXT Keyboard Loaded ===');
      console.log('Animations found:', gltf.animations.length);

      // Log all meshes with geometry center positions to identify keycaps
      model.updateMatrixWorld(true);
      const meshes = [];
      const meshMap = {};
      model.traverse(child => {
        if (child.isMesh && child.geometry) {
          // Compute geometry bounding box center in world space
          child.geometry.computeBoundingBox();
          const bbox = child.geometry.boundingBox;
          if (bbox) {
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            center.applyMatrix4(child.matrixWorld);
            meshes.push({
              name: child.name,
              x: center.x.toFixed(4),
              y: center.y.toFixed(4),
              z: center.z.toFixed(4),
              mesh: child,
            });
            meshMap[child.name] = child;
          }
        }
      });
      state.meshMap = meshMap;
      state.allMeshes = meshes;
      // Expose globally for debugging - include scene reference
      window.__kbMeshes = meshes;
      window.__kbMeshMap = meshMap;
      window.__kbScene = scene;
      window.__kbModel = model;
      console.log(`Found ${meshes.length} meshes`);

      // Sort by Z (rows) then X (columns) to match keyboard layout
      const sorted = [...meshes].sort((a, b) => parseFloat(a.z) - parseFloat(b.z) || parseFloat(a.x) - parseFloat(b.x));
      console.log('Sample sorted meshes:', sorted.slice(0, 30).map(m => ({ name: m.name, x: m.x, z: m.z })));

      // Log animations if any
      console.log('Animations:', gltf.animations.length);

      // Center and scale
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const scale = 0.4 / Math.max(size.x, size.y, size.z);
      model.scale.setScalar(scale);

      scene.add(model);

      // Build key-to-mesh mapping based on position analysis
      state.pressedKeys = new Set();
      state.originalPositions = {};

      // Group ALL meshes by position (not just Plastic_1)
      // Each keycap has multiple layers: text (Plastic_1), body (Plastic_5), etc.
      const groups = {};
      meshes.forEach(m => {
        const x = Math.round(parseFloat(m.x) / 0.01) * 0.01;
        const z = Math.round(parseFloat(m.z) / 0.01) * 0.01;
        const key = `${x.toFixed(3)}_${z.toFixed(3)}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(m.name);
      });

      // Sort by Z then X to get row order
      // Include positions with multiple mesh layers (keycaps have 3+ parts)
      // White keys: Plastic_(1) text + Plastic_(5) body
      // Orange keys: Plastic_(2), _(3), _(4) combinations
      const keycapPositions = Object.keys(groups).filter(k => {
        const meshNames = groups[k];
        // Must have at least 3 meshes to be a real keycap
        if (meshNames.length < 3) return false;
        // Check for keycap materials
        const hasWhiteKeycap = meshNames.some(n => n.includes('Plastic_(1)')) &&
                               meshNames.some(n => n.includes('Plastic_(5)'));
        const hasOrangeKeycap = meshNames.some(n => n.includes('Plastic_(2)')) ||
                                meshNames.some(n => n.includes('Plastic_(4)'));
        return hasWhiteKeycap || hasOrangeKeycap;
      });

      // Remove duplicate positions and sort
      const uniquePositions = [...new Set(keycapPositions)];
      const sortedKeys = uniquePositions.sort((a, b) => {
        const [ax, az] = a.split('_').map(parseFloat);
        const [bx, bz] = b.split('_').map(parseFloat);
        if (Math.abs(az - bz) > 0.015) return az - bz;
        return ax - bx;
      });

      // Smart row grouping: find major Z positions (10+ keys) and merge nearby
      const zCounts = {};
      sortedKeys.forEach(k => {
        const z = parseFloat(k.split('_')[1]).toFixed(2);
        zCounts[z] = (zCounts[z] || 0) + 1;
      });

      // Major Z values have 10+ keys
      const majorZs = Object.entries(zCounts)
        .filter(([z, count]) => count >= 10)
        .map(([z]) => parseFloat(z))
        .sort((a, b) => a - b);

      // Assign each key to nearest major Z
      const rows = majorZs.map(() => []);
      sortedKeys.forEach(k => {
        const z = parseFloat(k.split('_')[1]);
        let bestIdx = 0;
        let bestDist = Math.abs(z - majorZs[0]);
        majorZs.forEach((mz, i) => {
          const dist = Math.abs(z - mz);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        rows[bestIdx].push(k);
      });

      // Sort keys within each row by X position and deduplicate by X
      // Use 0.015 tolerance to merge wide keys (Tab, Shift, Space, etc.)
      rows.forEach((row, rowIdx) => {
        row.sort((a, b) => parseFloat(a.split('_')[0]) - parseFloat(b.split('_')[0]));
        // Merge positions with same X (within 0.015 tolerance)
        const merged = [];
        let lastX = null;
        row.forEach(pos => {
          const x = parseFloat(pos.split('_')[0]);
          if (lastX === null || Math.abs(x - lastX) > 0.015) {
            merged.push(pos);
            lastX = x;
          } else {
            // Merge mesh names into previous position
            const prevPos = merged[merged.length - 1];
            groups[prevPos] = [...groups[prevPos], ...groups[pos]];
          }
        });
        rows[rowIdx] = merged;
      });

      // Debug: Log row structure
      console.log('=== ROW STRUCTURE ===');
      rows.forEach((row, i) => {
        console.log(`Row ${i}: ${row.length} keys, Z≈${majorZs[i].toFixed(2)}`);
      });

      // Physical keyboard layout - 6 major rows at Z=0.07, 0.09, 0.11, 0.13, 0.15, 0.17
      // Row counts after 0.015 X-dedup: 14, 14, 14, 12, 13, 9
      const keyboardRows = [
        // Row 0 (Z≈0.07): Number row + Escape (14 keys)
        ['Escape', 'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
        // Row 1 (Z≈0.09): QWERTY row (14 keys) - starts with Tab at idx 0
        ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
        // Row 2 (Z≈0.11): Home row (14 keys)
        ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter', 'Backspace'],
        // Row 3 (Z≈0.13): Shift row (12 keys)
        ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
        // Row 4 (Z≈0.15): Bottom row (13 keys)
        ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'Space', 'Space', 'AltRight', 'Fn', 'ControlRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'],
        // Row 5 (Z≈0.17): Bottom edge (9 keys)
        ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'],
      ];

      // Build the mapping
      const keyMeshMapping = {};
      rows.forEach((row, rowIdx) => {
        if (rowIdx < keyboardRows.length) {
          const physKeys = keyboardRows[rowIdx];
          row.forEach((posKey, colIdx) => {
            if (colIdx < physKeys.length) {
              keyMeshMapping[physKeys[colIdx]] = groups[posKey];
            }
          });
        }
      });

      state.keyMeshMap = keyMeshMapping;

      // Store original positions for all keycap meshes
      Object.values(keyMeshMapping).flat().forEach(meshName => {
        const mesh = meshMap[meshName];
        if (mesh) {
          state.originalPositions[meshName] = mesh.position.clone();
        }
      });

      console.log('Key mapping ready:', Object.keys(keyMeshMapping).length, 'keys');
      console.log('Sample: Q=', keyMeshMapping['KeyQ'], 'W=', keyMeshMapping['KeyW']);

      state.model = model;
      state.active = true;
      state.allPositions = rows.flat(); // All keycap positions in order
      state.groups = groups;

      const statusEl = document.getElementById('status');
      if (statusEl) {
        statusEl.textContent = `Keyboard ready! ${Object.keys(keyMeshMapping).length} keys mapped. Auto-playing...`;
      }

      // Auto-play animation: press keys from top-left to bottom-right
      let currentIdx = 0;
      let lastPressedParents = new Set();

      // Move parent Object3D positions - visible press depth
      const PRESS_DEPTH = 0.25;

      const pressKey = (posKey) => {
        const meshNames = groups[posKey];
        if (!meshNames) return new Set();

        const movedParents = new Set();
        meshNames.forEach(meshName => {
          let mesh = null;
          model.traverse(child => {
            if (child.isMesh && child.name === meshName) mesh = child;
          });

          const parent = mesh?.parent;
          if (parent && !movedParents.has(parent.uuid)) {
            movedParents.add(parent.uuid);
            if (!state.originalParentPos) state.originalParentPos = {};
            if (!state.parentRefs) state.parentRefs = {};
            if (!state.keyTargets) state.keyTargets = {};

            if (state.originalParentPos[parent.uuid] === undefined) {
              state.originalParentPos[parent.uuid] = parent.position.z; // Z axis for downward press
            }
            state.parentRefs[parent.uuid] = parent;
            state.keyTargets[parent.uuid] = state.originalParentPos[parent.uuid] + PRESS_DEPTH; // +Z = down into keyboard
          }
        });
        return movedParents;
      };

      const releaseKey = (parentUuids) => {
        parentUuids.forEach(uuid => {
          if (state.originalParentPos?.[uuid] !== undefined) {
            state.keyTargets[uuid] = state.originalParentPos[uuid];
          }
        });
      };

      const autoPlay = () => {
        // Release previous key
        if (lastPressedParents.size > 0) {
          releaseKey(lastPressedParents);
        }

        // Press next key
        if (currentIdx < state.allPositions.length) {
          const posKey = state.allPositions[currentIdx];
          lastPressedParents = pressKey(posKey) || new Set();
          currentIdx++;

          if (statusEl) {
            const row = Math.floor(currentIdx / 14); // Approximate row
            statusEl.textContent = `Row ${row + 1} - Key ${currentIdx}/${state.allPositions.length}`;
          }

          setTimeout(autoPlay, 100); // 100ms between keys
        } else {
          // Loop back
          releaseKey(lastPressedParents);
          currentIdx = 0;
          lastPressedParents = new Set();
          if (statusEl) {
            statusEl.textContent = `Done! Restarting...`;
          }
          setTimeout(autoPlay, 500);
        }
      };

      // Start auto-play after a short delay
      setTimeout(autoPlay, 1000);
    });

    // Animation loop
    const clock = new THREE.Clock();
    let animationId;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();

      // Update animation mixer
      if (state.mixer) {
        state.mixer.update(delta);
      }

      // Update smooth key press animation
      if (state.updateKeyAnimation) {
        state.updateKeyAnimation();
      }

      renderer.render(scene, camera);
    }
    animate();

    // Keyboard event handlers with smooth animation
    const KEY_PRESS_DEPTH = 0.25; // Match auto-play depth for visible press

    const onKeyDown = (e) => {
      if (!state.active || !state.keyMeshMap) return;
      const meshNames = state.keyMeshMap[e.code];
      if (meshNames && !state.pressedKeys.has(e.code)) {
        state.pressedKeys.add(e.code);

        const model = window.__kbModel;
        if (!model) return;

        const movedParents = new Set();
        meshNames.forEach(meshName => {
          let mesh = null;
          model.traverse(child => {
            if (child.isMesh && child.name === meshName) mesh = child;
          });

          const parent = mesh?.parent;
          if (parent && !movedParents.has(parent.uuid)) {
            movedParents.add(parent.uuid);
            // Store original Z position and reference
            if (!state.originalParentPos[parent.uuid]) {
              state.originalParentPos[parent.uuid] = parent.position.z;
            }
            state.parentRefs[parent.uuid] = parent;
            // Set target to pressed position (+Z = down into keyboard)
            state.keyTargets[parent.uuid] = state.originalParentPos[parent.uuid] + KEY_PRESS_DEPTH;
          }
        });
      }
    };

    const onKeyUp = (e) => {
      if (!state.active || !state.keyMeshMap) return;
      const meshNames = state.keyMeshMap[e.code];
      if (meshNames && state.pressedKeys.has(e.code)) {
        state.pressedKeys.delete(e.code);

        const model = window.__kbModel;
        if (!model) return;

        const restoredParents = new Set();
        meshNames.forEach(meshName => {
          let mesh = null;
          model.traverse(child => {
            if (child.isMesh && child.name === meshName) mesh = child;
          });

          const parent = mesh?.parent;
          if (parent && !restoredParents.has(parent.uuid)) {
            restoredParents.add(parent.uuid);
            // Set target back to original position
            state.keyTargets[parent.uuid] = state.originalParentPos[parent.uuid];
          }
        });
      }
    };

    // Smooth animation - lerp parent positions toward targets (Z axis)
    const LERP_SPEED = 0.25;
    state.updateKeyAnimation = () => {
      if (!state.keyTargets || !state.parentRefs) return;

      Object.entries(state.keyTargets).forEach(([uuid, targetZ]) => {
        const parent = state.parentRefs[uuid];
        if (parent && targetZ !== undefined) {
          const diff = targetZ - parent.position.z;
          if (Math.abs(diff) > 0.0001) {
            parent.position.z += diff * LERP_SPEED;
          } else {
            parent.position.z = targetZ;
          }
        }
      });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
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
