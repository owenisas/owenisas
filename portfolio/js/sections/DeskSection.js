import * as THREE from 'three';
import { BaseSection } from './BaseSection.js';

export class DeskSection extends BaseSection {
  constructor(modelPath) {
    super(modelPath, {
      bloomStrength: 0.8,
      bloomThreshold: 0.7,
      bloomRadius: 0.4,
      backgroundColor: 0x08080a,
      targetSize: 1.4,
      rotationSpeed: 0.0015,
    });
    this.deskMaterial = null;
    this.allMeshes = [];
    this.monitorLight = null;
    this.clickActive = false;
    this.clickTime = 0;
  }

  setupLighting() {
    // Warm overhead
    const key = new THREE.DirectionalLight(0xfff0e0, 3.5);
    key.position.set(1, 3, 2);
    this.lights.push(key);

    // Cool side fill
    const fill = new THREE.PointLight(0x6688cc, 40, 12);
    fill.position.set(-2, 1, 1);
    this.lights.push(fill);

    // Warm accent
    const warm = new THREE.PointLight(0xffaa66, 25, 10);
    warm.position.set(2, 0.5, 1);
    this.lights.push(warm);

    // Simulated monitor light (blue glow from front/above)
    this.monitorLight = new THREE.PointLight(0x4488ff, 0, 8);
    this.monitorLight.position.set(0, 0.5, 0.8);
    this.lights.push(this.monitorLight);

    // Ambient
    this.lights.push(new THREE.AmbientLight(0x333340, 1.2));

    // Dark floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.1, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.75;
    this.lights.push(floor);
  }

  setupMaterials() {
    this.model.traverse(child => {
      if (child.isMesh && child.material) {
        this.allMeshes.push(child);
        child.material = child.material.clone();
        this.deskMaterial = child.material;
        console.log(`[Desk] Material: ${child.material.name}, mesh: ${child.name}`);
      }
    });
    console.log(`[Desk] Total meshes: ${this.allMeshes.length}`);
  }

  setupCamera(camera) {
    camera.position.set(0.8, 0.5, 2.0);
    camera.lookAt(0, -0.1, 0);
  }

  onClick() {
    this.clickActive = true;
    this.clickTime = 0;
  }

  animateEffect(animProgress, delta) {
    const time = this.clock.getElapsedTime();

    // === MONITOR GLOW — simulated screen turning on ===
    const glowProgress = Math.min(animProgress * 2.5, 1.0);

    if (this.monitorLight) {
      const pulse = Math.sin(time * 1.5) * 0.1;
      this.monitorLight.intensity = glowProgress * 35 + pulse * 10;
      // Subtle color shift (cool blue to warmer)
      const hue = 0.58 + Math.sin(time * 0.3) * 0.03;
      this.monitorLight.color.setHSL(hue, 0.6, 0.6);
    }

    // Subtle desk material emissive to simulate ambient light bounce
    if (this.deskMaterial && animProgress > 0.2) {
      const bounceGlow = Math.min((animProgress - 0.2) * 1.5, 0.15);
      this.deskMaterial.emissive = this.deskMaterial.emissive || new THREE.Color(0x000000);
      this.deskMaterial.emissive.setHSL(0.6, 0.3, bounceGlow);
      this.deskMaterial.emissiveIntensity = bounceGlow;
    }

    // === CLICK ANIMATION: "power on" flash ===
    if (this.clickActive) {
      this.clickTime += delta;
      const ct = this.clickTime;

      if (ct < 1.0) {
        // Quick brightness flash then settle
        const flashCurve = ct < 0.15
          ? ct / 0.15                    // ramp up
          : Math.max(0, 1 - (ct - 0.15) / 0.85); // decay
        if (this.monitorLight) {
          this.monitorLight.intensity = 35 + flashCurve * 80;
        }
      } else {
        this.clickActive = false;
      }
    }

    // === GENTLE ROTATION PAUSE (desk is stationary-feeling) ===
    // Override base rotation with slower pace
    // (Base class handles rotation, we just add subtle sway)
  }
}
