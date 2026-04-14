import * as THREE from 'three';
import { BaseSection } from './BaseSection.js';

export class DJISection extends BaseSection {
  constructor(modelPath) {
    super(modelPath, {
      bloomStrength: 0.6,
      bloomThreshold: 0.8,
      bloomRadius: 0.3,
      backgroundColor: 0x0c0c10,
      targetSize: 1.3,
      rotationSpeed: 0.002,
    });
    this.propellers = [];  // propeller groups (桨叶)
    this.originalY = 0;
    this.spotLight = null;
    this.launchActive = false;
    this.launchTime = 0;
  }

  setupLighting() {
    // Dramatic top-down spot (tighter cone, less intensity)
    this.spotLight = new THREE.SpotLight(0xffffff, 80, 12, Math.PI / 7, 0.7, 1.5);
    this.spotLight.position.set(0, 3, 1);
    this.lights.push(this.spotLight);
    this.lights.push(this.spotLight.target);

    // Cool fill
    const fill = new THREE.PointLight(0x8899ff, 40, 12);
    fill.position.set(-2, 0.5, 1);
    this.lights.push(fill);

    // Warm rim (subtle, positioned higher so it hits drone not ground)
    const rim = new THREE.PointLight(0xff9966, 10, 8);
    rim.position.set(2, 0.5, -1);
    this.lights.push(rim);

    // Ambient
    this.lights.push(new THREE.AmbientLight(0x222233, 0.8));

    // No ground — drone floats in dark space
  }

  setupMaterials() {
    const propNames = ['桨叶1', '桨叶2', '桨叶3', '桨叶4'];

    this.model.traverse(child => {
      if (propNames.some(n => child.name === n)) {
        this.propellers.push({
          object: child,
          originalQuat: child.quaternion.clone(),
        });
        console.log(`[DJI] Found propeller: ${child.name}, parent: ${child.parent?.name}`);
      }
    });

    this.spinAngle = 0;
    console.log(`[DJI] Propellers: ${this.propellers.length}`);
  }

  setupCamera(camera) {
    camera.position.set(0.6, 0.6, 2.2);
    camera.lookAt(0, 0.1, 0);
  }

  activate(scene, camera) {
    super.activate(scene, camera);
    if (this.model) {
      this.originalY = this.model.position.y;
    }
  }

  onClick() {
    this.launchActive = true;
    this.launchTime = 0;
  }

  animateEffect(animProgress, delta) {
    if (!this.model) return;

    const time = this.clock.getElapsedTime();

    // === PHASE 1: Propellers spin (0% - 100%) ===
    const spinSpeed = Math.min(animProgress * 3, 1.0) * 30;
    this.spinAngle += spinSpeed * delta;

    const spinQuat = new THREE.Quaternion();
    spinQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.spinAngle);

    this.propellers.forEach(({ object, originalQuat }) => {
      // Set fresh each frame: original orientation * spin rotation
      object.quaternion.copy(originalQuat).multiply(spinQuat);
    });

    // === PHASE 2: Hover float (30% - 100%) ===
    const hoverProgress = Math.max(0, (animProgress - 0.3) / 0.7);
    const hoverEased = 1 - Math.pow(1 - hoverProgress, 2);

    const floatHeight = 0.15 * hoverEased;
    const bob = Math.sin(time * 2.0) * floatHeight;
    this.model.position.y = this.originalY + bob + hoverEased * 0.1;

    // Stabilization tilt
    const tiltAmount = hoverEased * 0.03;
    this.model.rotation.x = Math.sin(time * 0.9) * tiltAmount;
    this.model.rotation.z = Math.cos(time * 0.7) * tiltAmount * 0.8;

    // Spotlight intensity follows hover
    if (this.spotLight) {
      this.spotLight.intensity = 60 + hoverEased * 25 + Math.sin(time * 0.5) * 5;
    }

    // === CLICK: rapid launch burst ===
    if (this.launchActive) {
      this.launchTime += delta;
      const lt = this.launchTime;
      if (lt < 1.5) {
        // Props spin much faster
        this.spinAngle += 60 * delta;
        // Surge upward then settle
        const surge = lt < 0.3
          ? (lt / 0.3) * 0.4
          : 0.4 * Math.max(0, 1 - (lt - 0.3) / 1.2);
        this.model.position.y = this.originalY + bob + hoverEased * 0.1 + surge;
        // Spotlight flash
        if (this.spotLight) {
          this.spotLight.intensity = 120 + Math.sin(lt * 30) * 20;
        }
      } else {
        this.launchActive = false;
      }
    }
  }
}
