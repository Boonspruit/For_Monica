const RELATIONSHIP_START_DATE = "2024-01-21";

const daysTogether = document.querySelector("#daysTogether");
const counterNote = document.querySelector("#counterNote");
const loveCards = document.querySelectorAll(".love-card");
const pages = [...document.querySelectorAll(".story-page")];
const letterGate = document.querySelector("#letterGate");
const openLetterButton = document.querySelector("#openLetterButton");
const textSnapSections = [...document.querySelectorAll("#reasons, #appreciation, #letter")];
let currentPageIndex = 0;
let lastScrollY = window.scrollY;
let scrollDirection = 0;
let scrollEndTimer;
let isProgrammaticSnap = false;
let touchStartY = 0;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function updateDayCounter() {
  const parsedDate = new Date(`${RELATIONSHIP_START_DATE}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    daysTogether.textContent = "Set your start date";
    counterNote.textContent = "Replace [INSERT_RELATIONSHIP_START_DATE] in script.js with YYYY-MM-DD.";
    return;
  }

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startMidnight = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  const diff = todayMidnight - startMidnight;
  const days = Math.max(0, Math.floor(diff / 86400000));

  daysTogether.textContent = `${days.toLocaleString()} days`;
  counterNote.textContent = "And I am thankful for every each day.";
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
    observer.observe(element);
  });
}

function goToPage(index) {
  const nextIndex = Math.min(Math.max(index, 0), pages.length - 1);
  pages[nextIndex].scrollIntoView({ behavior: "smooth", block: "center" });
}

function updatePageControls(index) {
  currentPageIndex = index;
  pages.forEach((page, pageIndex) => {
    page.classList.toggle("is-current", pageIndex === index);
  });
}

function bindPageTransitions() {
  const observer = new IntersectionObserver((entries) => {
    const visiblePages = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visiblePages.length > 0) {
      updatePageControls(pages.indexOf(visiblePages[0].target));
    }
  }, { threshold: [0.45, 0.62, 0.78] });

  pages.forEach((page) => observer.observe(page));
  updatePageControls(0);
}

function getHashSnapSection() {
  if (!window.location.hash) {
    return null;
  }

  return textSnapSections.find((section) => `#${section.id}` === window.location.hash) || null;
}

function scrollToHashSectionStart(behavior = "smooth") {
  const targetSection = getHashSnapSection();

  if (!targetSection) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: targetSection.offsetTop,
      behavior
    });
  });
}

function bindHashSectionSnap() {
  scrollToHashSectionStart("auto");
  window.setTimeout(() => scrollToHashSectionStart("auto"), 160);
  window.setTimeout(() => scrollToHashSectionStart("auto"), 420);
  window.addEventListener("hashchange", () => scrollToHashSectionStart());
  window.addEventListener("pageshow", () => scrollToHashSectionStart("auto"));
}

function snapBackToSectionIntro() {
  if (isProgrammaticSnap || window.innerWidth > 640 || document.body.classList.contains("letter-gate-active")) {
    return;
  }

  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const targetSection = textSnapSections.find((section) => {
    const rect = section.getBoundingClientRect();
    const isNearIntro = rect.top < viewportHeight * 0.36 && rect.top > -viewportHeight * 0.72;
    const isReturningToIntro = scrollDirection < 0 && rect.top < 0 && rect.top > -viewportHeight * 1.35;
    return rect.bottom > viewportHeight * 0.16 && (isNearIntro || isReturningToIntro);
  });

  if (!targetSection) {
    return;
  }

  isProgrammaticSnap = true;
  window.scrollTo({
    top: targetSection.offsetTop,
    behavior: "smooth"
  });

  window.setTimeout(() => {
    isProgrammaticSnap = false;
  }, 420);
}

function scheduleMobileUpwardSnap(delay = 120) {
  window.clearTimeout(scrollEndTimer);
  scrollEndTimer = window.setTimeout(snapBackToSectionIntro, delay);
}

function bindMobileUpwardSnap() {
  window.addEventListener("scroll", () => {
    const currentY = window.scrollY;
    scrollDirection = currentY > lastScrollY ? 1 : currentY < lastScrollY ? -1 : scrollDirection;
    lastScrollY = currentY;

    if (scrollDirection < 0) {
      scheduleMobileUpwardSnap(140);
    }
  }, { passive: true });

  window.addEventListener("touchstart", (event) => {
    touchStartY = event.touches[0]?.clientY || 0;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    const currentTouchY = event.touches[0]?.clientY || touchStartY;
    scrollDirection = currentTouchY > touchStartY ? -1 : currentTouchY < touchStartY ? 1 : scrollDirection;
  }, { passive: true });

  window.addEventListener("touchend", () => scheduleMobileUpwardSnap(180), { passive: true });
  window.addEventListener("wheel", () => scheduleMobileUpwardSnap(160), { passive: true });
  window.addEventListener("keyup", () => scheduleMobileUpwardSnap(80));
  window.addEventListener("scrollend", snapBackToSectionIntro);
}

function bindOpeningLetter() {
  if (!letterGate || !openLetterButton) {
    document.body.classList.remove("letter-gate-active");
    return;
  }

  openLetterButton.addEventListener("click", () => {
    if (letterGate.classList.contains("is-opening")) {
      return;
    }

    openLetterButton.setAttribute("aria-expanded", "true");
    letterGate.classList.add("is-opening");

    window.setTimeout(() => {
      letterGate.classList.add("is-hidden");
      letterGate.setAttribute("aria-hidden", "true");
      openLetterButton.setAttribute("tabindex", "-1");
      document.body.classList.remove("letter-gate-active");

      if (getHashSnapSection()) {
        scrollToHashSectionStart();
        return;
      }

      pages[0].scrollIntoView({ behavior: "smooth", block: "start" });
    }, 950);
  });
}

function bindLoveCards() {
  loveCards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("is-open");
    });
  });
}

updateDayCounter();
revealOnScroll();
bindPageTransitions();
bindHashSectionSnap();
bindMobileUpwardSnap();
bindOpeningLetter();
bindLoveCards();
