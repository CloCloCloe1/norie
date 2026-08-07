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
  const detailLinks = [...carousel.querySelectorAll("[data-carousel-detail-link]")];

  if (!track || slides.length < 2 || !previous || !next || !status) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentIndex = 0;
  let programmaticScroll = false;
  let scrollFrame = 0;
  let settleTimer = 0;

  previous.hidden = false;
  next.hidden = false;
  status.hidden = false;

  function updateStatus() {
    status.textContent = `${currentIndex + 1} / ${slides.length}`;
    const detailHref = slides[currentIndex]?.dataset.detailHref;
    if (detailHref) {
      detailLinks.forEach((link) => link.setAttribute("href", detailHref));
    }
  }

  function showSlide(index) {
    currentIndex = index;
    programmaticScroll = true;
    window.clearTimeout(settleTimer);
    track.scrollTo({
      left: currentIndex * track.clientWidth,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
    updateStatus();
  }

  function synchronizeFromTrack() {
    if (track.clientWidth <= 0) return;
    currentIndex = Math.max(0, Math.min(
      slides.length - 1,
      Math.round(track.scrollLeft / track.clientWidth)
    ));
    programmaticScroll = false;
    updateStatus();
  }

  function scheduleSettle() {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(synchronizeFromTrack, 160);
  }

  previous.addEventListener("click", () => {
    showSlide(wrappedSlideIndex(currentIndex, -1, slides.length));
  });

  next.addEventListener("click", () => {
    showSlide(wrappedSlideIndex(currentIndex, 1, slides.length));
  });

  track.addEventListener("scroll", () => {
    if (programmaticScroll) {
      scheduleSettle();
      return;
    }
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(synchronizeFromTrack);
  }, { passive: true });

  track.addEventListener("scrollend", synchronizeFromTrack);

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
