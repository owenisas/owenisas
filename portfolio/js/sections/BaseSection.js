import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class BaseSection {
  constructor(modelPath, config = {}) {
    this.modelPath = modelPath;
    this.model = null;
    this.lights = [];
    this.loaded = false;
    this.clock = new THREE.Clock();

    this.rotationSpeed = config.rotationSpeed ?? 0.003;
    this.bloomStrength = config.bloomStrength ?? 1.0;
    this.bloomThreshold = config.bloomThreshold ?? 0.85;
    this.bloomRadius = config.bloomRadius ?? 0.4;
    this.backgroundColor = config.backgroundColor ?? 0x0a0a0a;
    this.targetSize = config.targetSize ?? 1.2;
  }

  async load(manager) {
    try {
      console.log(`[${this.constructor.name}] Loading ${this.modelPath}...`);
      const loader = manager ? new GLTFLoader(manager) : new GLTFLoader();
      const gltf = await loader.loadAsync(this.modelPath);
      this.model = gltf.scene;

      // Normalize: center and scale
      // Must update world matrices first for accurate bbox
      this.model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      console.log(`[${this.constructor.name}] Raw size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}, max=${maxDim.toFixed(2)}`);

      if (maxDim === 0 || !isFinite(maxDim)) {
        console.error(`[${this.constructor.name}] Invalid bounding box!`);
        this.loaded = true;
        return;
      }

      // Wrap model in a group for clean transform
      const wrapper = new THREE.Group();
      wrapper.add(this.model);

      // Center by moving the inner model
      this.model.position.set(-center.x, -center.y, -center.z);

      // Scale the wrapper
      const scale = this.targetSize / maxDim;
      wrapper.scale.set(scale, scale, scale);

      // Replace model ref with wrapper
      this.model = wrapper;

      console.log(`[${this.constructor.name}] Normalized: scale=${scale.toFixed(6)}, target=${this.targetSize}`);

      // Log all materials
      let meshCount = 0;
      this.model.traverse(child => {
        if (child.isMesh) {
          meshCount++;
          child.frustumCulled = false;
          if (child.material) {
            console.log(`[${this.constructor.name}] mesh="${child.name}" mat="${child.material.name}"`);
          }
        }
      });
      console.log(`[${this.constructor.name}] Total meshes: ${meshCount}`);

      this.setupLighting();
      this.setupMaterials();
      this.loaded = true;
      console.log(`[${this.constructor.name}] Ready`);
    } catch (err) {
      console.error(`[${this.constructor.name}] Load FAILED:`, err);
    }
  }

  activate(scene, camera) {
    if (!this.model) return;
    scene.add(this.model);
    this.lights.forEach(l => scene.add(l));
    this.setupCamera(camera);
    this.clock.start();
  }

  update(delta, progress) {
    if (!this.model) return;

    // Opacity fade
    const opacity = this.computeOpacity(progress);
    this.setModelOpacity(opacity);

    // Auto-rotate
    if (progress > 0.05 && progress < 0.95) {
      this.model.rotation.y += this.rotationSpeed;
    }

    // Section-specific animation in active range
    if (progress >= 0.15 && progress <= 0.85) {
      const animProgress = (progress - 0.15) / 0.7;
      this.animateEffect(animProgress, delta);
    }
  }

  computeOpacity(progress) {
    if (progress < 0.15) return progress / 0.15;
    if (progress > 0.85) return (1 - progress) / 0.15;
    return 1.0;
  }

  setModelOpacity(opacity) {
    this.model.traverse(child => {
      if (child.isMesh && child.material) {
        const mat = child.material;
        if (opacity < 0.99) {
          mat.transparent = true;
          mat.opacity = opacity;
          mat.depthWrite = opacity > 0.5;
        } else {
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
        }
      }
    });
  }

  setupCamera(camera) {
    camera.position.set(0, 0.3, 2);
    camera.lookAt(0, 0, 0);
  }

  // Subclass overrides
  setupLighting() {}
  setupMaterials() {}
  animateEffect(animProgress, delta) {}
  onClick() {} // triggered by user click/tap on model
}
