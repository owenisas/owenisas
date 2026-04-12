import * as THREE from 'three';
import { BaseSection } from './BaseSection.js';

export class MacBookSection extends BaseSection {
  constructor(modelPath) {
    super(modelPath, {
      bloomStrength: 1.5,
      bloomThreshold: 0.7,
      bloomRadius: 0.5,
      backgroundColor: 0x020203,
      targetSize: 1.2,
      rotationSpeed: 0.002,
    });
    this.lidGroup = null;
    this.screenMaterials = [];
    this.lidOpenAngle = 0;    // GLB default rotation.x (open pose)
    this.lidClosedAngle = 0;  // computed closed angle
    this.clickToggle = false;
    this.clickTime = 0;
    this.clickAnimating = false;
  }

  setupLighting() {
    // Bright overhead key
    const key = new THREE.DirectionalLight(0xfff8f0, 5.0);
    key.position.set(0, 3, 2);
    this.lights.push(key);

    // Front fill — crucial for visibility
    const front = new THREE.DirectionalLight(0xeeeeff, 2.5);
    front.position.set(0, 0, 3);
    this.lights.push(front);

    // Side accents
    const left = new THREE.PointLight(0xeeeeff, 60, 15);
    left.position.set(-2, 0.5, 1);
    this.lights.push(left);

    const right = new THREE.PointLight(0xeeeeff, 60, 15);
    right.position.set(2, 0.5, 1);
    this.lights.push(right);

    // Back rim
    const rim = new THREE.PointLight(0x8888ff, 40, 15);
    rim.position.set(0, -1.5, -1);
    this.lights.push(rim);

    this.lights.push(new THREE.AmbientLight(0x444466, 1.5));

    // Reflective dark floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.08, metalness: 0.1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.65;
    this.lights.push(floor);
  }

  setupMaterials() {
    // Find lid group by name from GLB hierarchy
    this.model.traverse(child => {
      if (child.name === 'VCQqxpxkUlzqcJI_62') {
        this.lidGroup = child;
        console.log(`[MacBook] Found lid group: ${child.name}, rotation.x=${child.rotation.x.toFixed(3)}`);
      }
    });

    if (this.lidGroup) {
      // The GLB lid has rotation.x = PI/2 as its "open" pose
      // Closed = rotation.x closer to 0 (lid folded flat onto keyboard)
      this.lidOpenAngle = this.lidGroup.rotation.x; // ~PI/2
      this.lidClosedAngle = this.lidOpenAngle - Math.PI / 2; // ~0 (flat)
      console.log(`[MacBook] Lid open=${this.lidOpenAngle.toFixed(3)}, closed=${this.lidClosedAngle.toFixed(3)}`);
    }

    // Find screen materials (from Blender discovery: XCYkeTCxqFmKTKe, sfCQkHOWyrsLmor)
    const screenMatNames = ['XCYkeTCxqFmKTKe', 'sfCQkHOWyrsLmor'];
    this.model.traverse(child => {
      if (child.isMesh && child.material) {
        if (screenMatNames.includes(child.material.name)) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0x4488ff);
          child.material.emissiveIntensity = 0;
          this.screenMaterials.push(child.material);
        }
      }
    });
    console.log(`[MacBook] Screen materials: ${this.screenMaterials.length}`);
  }

  setupCamera(camera) {
    camera.position.set(0.6, 0.4, 2.0);
    camera.lookAt(0, -0.1, 0);
  }

  activate(scene, camera) {
    super.activate(scene, camera);
    // Start with lid closed
    if (this.lidGroup) {
      this.lidGroup.rotation.x = this.lidClosedAngle;
    }
  }

  onClick() {
    this.clickAnimating = true;
    this.clickTime = 0;
    this.clickToggle = !this.clickToggle;
  }

  animateEffect(animProgress, delta) {
    const time = this.clock.getElapsedTime();

    // === PHASE 1: Lid opens (0% - 60%) ===
    if (this.lidGroup) {
      const openProgress = Math.min(animProgress / 0.6, 1.0);
      const openEased = 1 - Math.pow(1 - openProgress, 3); // ease-out cubic
      // Interpolate from closed angle to open angle
      this.lidGroup.rotation.x = this.lidClosedAngle + (this.lidOpenAngle - this.lidClosedAngle) * openEased;
    }

    // === PHASE 2: Screen glow (40% - 100%) ===
    const glowProgress = Math.max(0, (animProgress - 0.4) / 0.6);
    const glowEased = Math.min(glowProgress * 2, 1.0);
    const pulse = Math.sin(time * 2) * 0.1;

    this.screenMaterials.forEach(mat => {
      mat.emissiveIntensity = (glowEased + pulse) * 2.5;
    });

    // === CLICK: screen color flash ===
    if (this.clickAnimating) {
      this.clickTime += delta;
      const ct = this.clickTime;
      if (ct < 0.6) {
        const flash = ct < 0.1 ? ct / 0.1 : Math.max(0, 1 - (ct - 0.1) / 0.5);
        const flashHue = (time * 0.5) % 1;
        this.screenMaterials.forEach(mat => {
          mat.emissive.setHSL(flashHue, 0.8, 0.6);
          mat.emissiveIntensity = 2.5 + flash * 5.0;
        });
      } else {
        this.clickAnimating = false;
        // Reset to blue glow
        this.screenMaterials.forEach(mat => {
          mat.emissive.set(0x4488ff);
        });
      }
    }
  }
}
