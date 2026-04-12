import * as THREE from 'three';

export class SceneManager {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.8;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
    this.camera.position.set(0, 0, 2);

    this.clock = new THREE.Clock();
    this.activeSection = null;
    this.scrollProgress = 0;
    this.running = false;

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  switchTo(section) {
    if (this.activeSection === section) return;

    // Clear scene
    while (this.scene.children.length) {
      this.scene.remove(this.scene.children[0]);
    }

    this.activeSection = section;
    section.activate(this.scene, this.camera);

    // Update background
    if (section.backgroundColor !== undefined) {
      this.scene.background = new THREE.Color(section.backgroundColor);
    }
  }

  startLoop() {
    this.running = true;
    this.animate();
  }

  animate() {
    if (!this.running) return;
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    if (this.activeSection) {
      this.activeSection.update(delta, this.scrollProgress);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
