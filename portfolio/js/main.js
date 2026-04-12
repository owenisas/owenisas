import { SceneManager } from './SceneManager.js';
import { ScrollController } from './ScrollController.js';
import { LoadingManager } from './LoadingManager.js';
import { DeskSection } from './sections/DeskSection.js';
import { MacBookSection } from './sections/MacBookSection.js';
import { KeychronSection } from './sections/KeychronSection.js';
import { RazerSection } from './sections/RazerSection.js';
import { DJISection } from './sections/DJISection.js';
import { DivergenceSection } from './sections/DivergenceSection.js';

// Force scroll to top on load (prevent browser restore)
window.scrollTo(0, 0);
history.scrollRestoration = 'manual';

const canvas = document.getElementById('portfolio-canvas');
const sceneManager = new SceneManager(canvas);

// Order matches HTML sections: desk → macbook → keychron → razer → dji → divergence
const sections = [
  new DeskSection('../assets/computer_desk.glb'),
  new MacBookSection('../assets/macbook_pro_m3_16_inch_2024.glb'),
  new KeychronSection('../assets/keychron_k8.glb'),
  new RazerSection('../assets/razer_viper_mini.glb'),
  new DJISection('../assets/dji-mavic-3/source/DJI-Mavic_3.glb'),
  new DivergenceSection('../assets/divergence_meter_steinsgate.glb'),
];

let currentSectionIndex = -1;

const scrollController = new ScrollController(
  document.querySelectorAll('.model-section'),
  (sectionIndex, progress) => {
    const section = sections[sectionIndex];

    if (section.loaded && currentSectionIndex !== sectionIndex) {
      currentSectionIndex = sectionIndex;
      sceneManager.switchTo(section);
    }

    sceneManager.scrollProgress = progress;
  }
);

// Click interaction — canvas click triggers active section's onClick
canvas.addEventListener('click', (e) => {
  if (currentSectionIndex >= 0 && sections[currentSectionIndex]) {
    const section = sections[currentSectionIndex];
    if (section.onClick) {
      section.onClick();
    }
  }
});

// Also wire up the click-hint buttons
document.querySelectorAll('.click-hint').forEach((hint, i) => {
  hint.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sections[i] && sections[i].onClick) {
      sections[i].onClick();
    }
  });
});

// Load first model, start immediately, then lazy-load rest
const loader = new LoadingManager(sections);
loader.loadFirst().then(() => {
  console.log('[main] First model loaded, starting render loop');
  currentSectionIndex = 0;
  sceneManager.switchTo(sections[0]);
  sceneManager.startLoop();
  scrollController.computeProgress();

  // Lazy-load remaining models in background
  loader.loadRest().then(() => {
    console.log('[main] All models loaded');
  });
}).catch(err => {
  console.error('[main] Fatal load error:', err);
  // Still try to start with whatever loaded
  sceneManager.startLoop();
});
