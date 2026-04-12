export class ScrollController {
  constructor(sectionEls, onUpdate) {
    this.sections = Array.from(sectionEls);
    this.onUpdate = onUpdate;
    this.ticking = false;
    this.currentIndex = 0;

    window.addEventListener('scroll', () => this.onScroll(), { passive: true });

    // Also poll scroll position as fallback
    // (handles programmatic scrollTo and edge cases where scroll events don't fire)
    this.lastScrollY = -1;
    setInterval(() => {
      if (window.scrollY !== this.lastScrollY) {
        this.lastScrollY = window.scrollY;
        this.computeProgress();
      }
    }, 100);

    // Initial call
    this.computeProgress();
  }

  onScroll() {
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => {
        this.computeProgress();
        this.ticking = false;
      });
    }
  }

  computeProgress() {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    for (let i = 0; i < this.sections.length; i++) {
      const el = this.sections[i];
      const top = el.offsetTop;
      const height = el.offsetHeight;

      // How far we've scrolled into this section
      const scrolledInto = scrollY + vh / 2 - top;
      const progress = Math.max(0, Math.min(1, scrolledInto / height));

      if (progress > 0 && progress < 1) {
        if (this.currentIndex !== i || true) {
          this.currentIndex = i;
          this.onUpdate(i, progress);
        }
        return;
      }
    }

    // Edge case: past last section
    if (scrollY + vh >= document.body.scrollHeight - 10) {
      this.onUpdate(this.sections.length - 1, 1);
    }
  }
}
