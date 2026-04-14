import * as THREE from 'three';
import { BaseSection } from './BaseSection.js';

export class RazerSection extends BaseSection {
  constructor(modelPath) {
    super(modelPath, {
      bloomStrength: 1.2,
      bloomThreshold: 0.5,
      bloomRadius: 0.5,
      backgroundColor: 0x050508,
      targetSize: 1.0,
      rotationSpeed: 0.003,
    });
    this.rgbMaterials = [];
    this.glossMesh = null;       // buttons - for click animation
    this.glossOriginalY = 0;
    this.accentLight = null;
    this.strobeLight = null;
    this.clickBurst = false;
    this.clickBurstTime = 0;
  }

  setupLighting() {
    // Key from above-front
    const key = new THREE.PointLight(0xffffff, 80, 20);
    key.position.set(0.5, 1.5, 1);
    this.lights.push(key);

    // Purple accent left
    const purple = new THREE.PointLight(0x6622cc, 40, 10);
    purple.position.set(-1.5, 0, 0.5);
    this.lights.push(purple);

    // Cyan accent right (follows RGB cycle)
    this.accentLight = new THREE.PointLight(0x00ff88, 30, 10);
    this.accentLight.position.set(1.5, -0.3, 0.5);
    this.lights.push(this.accentLight);

    // Rim from behind
    const rim = new THREE.PointLight(0x3344ff, 25, 10);
    rim.position.set(0, -1.5, -1);
    this.lights.push(rim);

    // Strobe light (pulses with RGB)
    this.strobeLight = new THREE.PointLight(0x00ff00, 0, 8);
    this.strobeLight.position.set(0, 0, 0);
    this.lights.push(this.strobeLight);

    this.lights.push(new THREE.AmbientLight(0x222244, 0.8));

    // Dark reflective surface
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshStandardMaterial({ color: 0x080810, roughness: 0.05, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.55;
    this.lights.push(floor);
  }

  setupMaterials() {
    this.model.traverse(child => {
      if (child.isMesh && child.material) {
        const name = child.material.name;

        // RGB strip
        if (name === 'Green' || name.toLowerCase().includes('green')) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0x00ff44);
          child.material.emissiveIntensity = 0;
          this.rgbMaterials.push(child.material);
          console.log(`[Razer] RGB material: ${name}`);
        }

        // Gloss = top shell/buttons
        if (name === 'Gloss' || name.toLowerCase().includes('gloss')) {
          this.glossMesh = child;
          this.glossOriginalY = child.position.y;
          console.log(`[Razer] Gloss/buttons: ${child.name}`);
        }
      }
    });
  }

  setupCamera(camera) {
    camera.position.set(0.5, 0.3, 1.6);
    camera.lookAt(0, 0, 0);
  }

  onClick() {
    this.clickBurst = true;
    this.clickBurstTime = 0;
  }

  animateEffect(animProgress, delta) {
    const time = this.clock.getElapsedTime();

    // === RGB COLOR CYCLING ===
    const hue = (animProgress * 3 + time * 0.15) % 1;
    const color = new THREE.Color().setHSL(hue, 1.0, 0.5);

    // Ramp up emissive intensity
    const glowIntensity = Math.min(animProgress * 6, 3.0);

    this.rgbMaterials.forEach(mat => {
      mat.emissive.copy(color);
      mat.emissiveIntensity = glowIntensity + Math.sin(time * 3) * 0.3;
    });

    // Accent light follows
    if (this.accentLight) {
      this.accentLight.color.copy(color);
      this.accentLight.intensity = glowIntensity * 15;
    }

    // Strobe light pulses
    if (this.strobeLight) {
      this.strobeLight.color.copy(color);
      this.strobeLight.intensity = Math.max(0, Math.sin(time * 4)) * glowIntensity * 8;
    }

    // === BUTTON CLICK ANIMATION ===
    // Periodic click effect every ~3 seconds
    if (this.glossMesh && animProgress > 0.3) {
      const clickCycle = (time % 3) / 3; // 0-1 over 3 seconds
      let clickOffset = 0;
      if (clickCycle < 0.05) {
        // Pressing down
        clickOffset = -0.008 * (clickCycle / 0.05);
      } else if (clickCycle < 0.08) {
        // Releasing
        clickOffset = -0.008 * (1 - (clickCycle - 0.05) / 0.03);
      } else if (clickCycle < 0.12) {
        // Small bounce
        clickOffset = 0.002 * Math.sin((clickCycle - 0.08) / 0.04 * Math.PI);
      }
      this.glossMesh.position.y = this.glossOriginalY + clickOffset;
    }

    // === CLICK BURST: RGB flash explosion ===
    if (this.clickBurst) {
      this.clickBurstTime += delta;
      const bt = this.clickBurstTime;
      if (bt < 0.8) {
        const flash = bt < 0.1 ? bt / 0.1 : Math.max(0, 1 - (bt - 0.1) / 0.7);
        this.rgbMaterials.forEach(mat => {
          mat.emissiveIntensity = glowIntensity + flash * 8.0;
        });
        if (this.strobeLight) {
          this.strobeLight.intensity = flash * 120;
        }
      } else {
        this.clickBurst = false;
      }
    }
  }
}
