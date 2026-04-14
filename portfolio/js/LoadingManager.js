import * as THREE from 'three';

export class LoadingManager {
  constructor(sections) {
    this.sections = sections;
    this.overlay = document.getElementById('loading-overlay');
    this.fill = document.querySelector('.loader-fill');
    this.text = document.querySelector('.loader-text');
  }

  async loadFirst() {
    const mgr = new THREE.LoadingManager();
    mgr.onProgress = (url, loaded, total) => {
      const pct = Math.round(loaded / total * 100);
      this.fill.style.width = pct + '%';
      this.text.textContent = `Loading... ${pct}%`;
    };

    await this.sections[0].load(mgr);
    this.hideOverlay();
  }

  async loadRest() {
    for (let i = 1; i < this.sections.length; i++) {
      await this.sections[i].load();
    }
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
    setTimeout(() => { this.overlay.style.display = 'none'; }, 700);
  }
}
