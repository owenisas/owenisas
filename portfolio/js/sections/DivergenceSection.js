import * as THREE from 'three';
import { BaseSection } from './BaseSection.js';

export class DivergenceSection extends BaseSection {
  constructor(modelPath) {
    super(modelPath, {
      bloomStrength: 2.5,
      bloomThreshold: 0.2,
      bloomRadius: 0.8,
      backgroundColor: 0x030305,
      targetSize: 1.2,
      rotationSpeed: 0.0015,
    });
    this.tubeMaterials = [];
    this.digitOnMaterials = [];
    this.displayMaterials = [];
    this.warmLight = null;
    this.flickerLight = null;
    this.shiftActive = false;
    this.shiftTime = 0;
  }

  setupLighting() {
    // Cool blue rim from behind
    const rim = new THREE.PointLight(0x2233aa, 30, 12);
    rim.position.set(0, -1.5, -1);
    this.lights.push(rim);

    // Warm amber from front (follows tube glow)
    this.warmLight = new THREE.PointLight(0xff9922, 0, 10);
    this.warmLight.position.set(0, 1, 1);
    this.lights.push(this.warmLight);

    // Flicker light (simulates nixie tube light spill)
    this.flickerLight = new THREE.PointLight(0xff6600, 0, 8);
    this.flickerLight.position.set(0, 0.2, 0.5);
    this.lights.push(this.flickerLight);

    // Cool ambient so meter body is visible
    this.lights.push(new THREE.AmbientLight(0x111520, 0.6));

    // Front fill so model is visible even before tubes activate
    const fill = new THREE.PointLight(0x556688, 20, 10);
    fill.position.set(0, 1, 2);
    this.lights.push(fill);
  }

  setupMaterials() {
    this.digitOnMaterials = [];   // number_on_mt — active filaments (bright glow)
    this.displayMaterials = [];   // display_mt — glass tubes (subtle glow)

    this.model.traverse(child => {
      if (child.isMesh && child.material) {
        const matName = child.material.name;

        if (matName === 'number_on_mt') {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(1.0, 0.6, 0.1);
          child.material.emissiveIntensity = 0;
          this.digitOnMaterials.push(child.material);
        } else if (matName === 'display_mt') {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(1.0, 0.5, 0.05);
          child.material.emissiveIntensity = 0;
          this.displayMaterials.push(child.material);
        }
      }
    });

    // Combine for animation — digitOn first (bright), display after (subtle)
    this.tubeMaterials = [...this.digitOnMaterials, ...this.displayMaterials];
    console.log(`[Divergence] Digit ON: ${this.digitOnMaterials.length}, Display: ${this.displayMaterials.length}, Total: ${this.tubeMaterials.length}`);
  }

  setupCamera(camera) {
    camera.position.set(0, 0.2, 1.8);
    camera.lookAt(0, 0, 0);
  }

  onClick() {
    this.shiftActive = true;
    this.shiftTime = 0;
  }

  animateEffect(animProgress, delta) {
    const time = this.clock.getElapsedTime();

    // === DIGIT ON FILAMENTS — bright amber glow with staggered activation ===
    const numDigits = this.digitOnMaterials.length;
    const activeDigits = Math.floor(animProgress * numDigits * 1.5);

    this.digitOnMaterials.forEach((mat, i) => {
      if (i < activeDigits) {
        const age = (activeDigits - i) / Math.max(numDigits, 1);
        const intensity = Math.min(age * 4, 2.0);
        const flicker = 1.0 + Math.sin(time * 12 + i * 1.7) * 0.08
                             + Math.sin(time * 23 + i * 3.1) * 0.04;
        mat.emissiveIntensity = intensity * flicker;
      } else {
        mat.emissiveIntensity = 0;
      }
    });

    // === DISPLAY GLASS — subtle warm glow, all activate together ===
    const glassIntensity = Math.min(animProgress * 1.5, 0.4);
    const glassPulse = 1.0 + Math.sin(time * 2) * 0.05;
    this.displayMaterials.forEach(mat => {
      mat.emissiveIntensity = glassIntensity * glassPulse;
    });

    // === WARM LIGHT FOLLOWS GLOW ===
    if (this.warmLight) {
      this.warmLight.intensity = animProgress * 60;
      // Warm light flickers like a candle
      this.warmLight.intensity *= 1.0 + Math.sin(time * 8) * 0.1 + Math.sin(time * 13) * 0.05;
    }

    // === FLICKER LIGHT (rapid) ===
    if (this.flickerLight) {
      const rapidFlicker = Math.max(0, Math.sin(time * 20) * Math.sin(time * 7));
      this.flickerLight.intensity = animProgress * rapidFlicker * 30;
      this.flickerLight.color.setHSL(0.08, 1.0, 0.5 + Math.sin(time * 5) * 0.1);
    }

    // === SUBTLE CAMERA DRIFT ===
    if (this.model) {
      this.model.position.y = Math.sin(time * 0.3) * 0.02;
    }

    // === CLICK: world line shift — rapid digit scramble ===
    if (this.shiftActive) {
      this.shiftTime += delta;
      const st = this.shiftTime;
      if (st < 1.2) {
        // Rapid flickering of all digits
        this.digitOnMaterials.forEach((mat, i) => {
          const scramble = Math.sin(st * 40 + i * 7) > 0 ? 3.5 : 0.2;
          mat.emissiveIntensity = scramble;
        });
        // Warm light flashes
        if (this.warmLight) {
          this.warmLight.intensity = 80 + Math.sin(st * 25) * 40;
        }
        if (this.flickerLight) {
          this.flickerLight.intensity = 60 * Math.abs(Math.sin(st * 30));
        }
      } else {
        this.shiftActive = false;
      }
    }
  }
}
