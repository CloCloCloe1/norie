export function wrappedSlideIndex(currentIndex, direction, slideCount) {
  if (slideCount <= 0) return 0;
  return (currentIndex + direction + slideCount) % slideCount;
}

export function initializeCarousel(carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  const status = carousel.querySelector("[data-carousel-status]");

  if (!track || slides.length < 2 || !previous || !next || !status) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentIndex = 0;
  let scrollFrame = 0;

  previous.hidden = false;
  next.hidden = false;
  status.hidden = false;

  function updateStatus() {
    status.textContent = `${currentIndex + 1} / ${slides.length}`;
  }

  function showSlide(index) {
    currentIndex = index;
    track.scrollTo({
      left: currentIndex * track.clientWidth,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    updateStatus();
  }

  previous.addEventListener("click", () => {
    showSlide(wrappedSlideIndex(currentIndex, -1, slides.length));
  });

  next.addEventListener("click", () => {
    showSlide(wrappedSlideIndex(currentIndex, 1, slides.length));
  });

  track.addEventListener("scroll", () => {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      if (track.clientWidth <= 0) return;
      currentIndex = Math.max(0, Math.min(
        slides.length - 1,
        Math.round(track.scrollLeft / track.clientWidth)
      ));
      updateStatus();
    });
  }, { passive: true });

  updateStatus();
}

export function initializeCarousels(root = document) {
  root.querySelectorAll("[data-carousel]").forEach(initializeCarousel);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initializeCarousels());
  } else {
    initializeCarousels();
  }
}
