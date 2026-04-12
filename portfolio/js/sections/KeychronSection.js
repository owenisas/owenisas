import * as THREE from 'three';
import { BaseSection } from './BaseSection.js';

export class KeychronSection extends BaseSection {
  constructor(modelPath) {
    super(modelPath, {
      bloomStrength: 1.0,
      bloomThreshold: 0.6,
      bloomRadius: 0.4,
      backgroundColor: 0x060608,
      targetSize: 1.3,
      rotationSpeed: 0.002,
    });
    this.bodyMaterial = null;   // MI_KeychronK8_01 — main body/keycaps
    this.accentMaterial = null; // MI_KeychronK8_02 — accent elements
    this.allMeshes = [];
    this.rgbLight = null;
    this.clickActive = false;
    this.clickTime = 0;
    this.keyMeshes = [];        // individual key-like meshes for wave
  }

  setupLighting() {
    // Warm overhead key
    const key = new THREE.DirectionalLight(0xfff4e8, 4.0);
    key.position.set(0, 3, 2);
    this.lights.push(key);

    // Front fill
    const front = new THREE.DirectionalLight(0xeeeeff, 2.0);
    front.position.set(0, 0.5, 3);
    this.lights.push(front);

    // RGB accent light (cycles color)
    this.rgbLight = new THREE.PointLight(0x00ff88, 0, 10);
    this.rgbLight.position.set(0, -0.3, 0.5);
    this.lights.push(this.rgbLight);

    // Side accents
    const left = new THREE.PointLight(0x8888ff, 30, 12);
    left.position.set(-2, 0.5, 0.5);
    this.lights.push(left);

    const right = new THREE.PointLight(0xff8844, 20, 12);
    right.position.set(2, 0.3, 0.5);
    this.lights.push(right);

    // Ambient
    this.lights.push(new THREE.AmbientLight(0x333344, 1.0));

    // Dark reflective surface
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.05, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.65;
    this.lights.push(floor);
  }

  setupMaterials() {
    this.model.traverse(child => {
      if (child.isMesh && child.material) {
        this.allMeshes.push(child);
        const matName = child.material.name;

        if (matName === 'MI_KeychronK8_01') {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0x00ff66);
          child.material.emissiveIntensity = 0;
          this.bodyMaterial = child.material;
          console.log(`[Keychron] Body material: ${matName}`);
        } else if (matName === 'MI_KeychronK8_02') {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0xff4400);
          child.material.emissiveIntensity = 0;
          this.accentMaterial = child.material;
          console.log(`[Keychron] Accent material: ${matName}`);
        }
      }
    });
    console.log(`[Keychron] Total meshes: ${this.allMeshes.length}`);
  }

  setupCamera(camera) {
    camera.position.set(0.8, 0.6, 1.8);
    camera.lookAt(0, -0.1, 0);
  }

  onClick() {
    this.clickActive = true;
    this.clickTime = 0;
  }

  animateEffect(animProgress, delta) {
    const time = this.clock.getElapsedTime();

    // === RGB BACKLIGHT WAVE ===
    const hue = (time * 0.08 + animProgress * 0.5) % 1;
    const rgbColor = new THREE.Color().setHSL(hue, 0.9, 0.5);

    // Ramp up glow intensity
    const glowRamp = Math.min(animProgress * 4, 1.0);
    const baseGlow = glowRamp * 0.8;

    if (this.bodyMaterial) {
      this.bodyMaterial.emissive.copy(rgbColor);
      // Wave pattern across keyboard using sin
      const wave = Math.sin(time * 3) * 0.15;
      this.bodyMaterial.emissiveIntensity = baseGlow + wave;
    }

    if (this.accentMaterial) {
      // Accent keys glow with offset hue
      const accentHue = (hue + 0.33) % 1;
      this.accentMaterial.emissive.setHSL(accentHue, 1.0, 0.5);
      this.accentMaterial.emissiveIntensity = baseGlow * 1.2 + Math.sin(time * 4 + 1) * 0.1;
    }

    // RGB light follows
    if (this.rgbLight) {
      this.rgbLight.color.copy(rgbColor);
      this.rgbLight.intensity = baseGlow * 40;
    }

    // === CLICK ANIMATION: typing burst ===
    if (this.clickActive) {
      this.clickTime += delta;
      const ct = this.clickTime;

      // Quick keystroke burst — press down then bounce back
      if (ct < 0.6) {
        const numStrokes = 5;
        for (let i = 0; i < numStrokes; i++) {
          const strokeStart = i * 0.1;
          const strokeEnd = strokeStart + 0.08;
          if (ct >= strokeStart && ct < strokeEnd) {
            const strokeProgress = (ct - strokeStart) / 0.08;
            // Pulse emissive brightness
            const burstIntensity = Math.sin(strokeProgress * Math.PI) * 2.0;
            if (this.bodyMaterial) {
              this.bodyMaterial.emissiveIntensity = baseGlow + burstIntensity;
            }
            // Subtle model bounce
            if (this.model) {
              this.model.position.y = -Math.sin(strokeProgress * Math.PI) * 0.008;
            }
            break;
          }
        }
      } else {
        this.clickActive = false;
        if (this.model) this.model.position.y = 0;
      }
    }

    // === SUBTLE BREATHING ===
    if (this.model && !this.clickActive) {
      this.model.position.y = Math.sin(time * 0.5) * 0.005;
    }
  }
}
