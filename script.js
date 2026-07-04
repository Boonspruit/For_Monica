const RELATIONSHIP_START_DATE = "2024-01-21";

const daysTogether = document.querySelector("#daysTogether");
const counterNote = document.querySelector("#counterNote");
const loveCards = document.querySelectorAll(".love-card");
const pages = [...document.querySelectorAll(".story-page")];
const letterGate = document.querySelector("#letterGate");
const openLetterButton = document.querySelector("#openLetterButton");
const flowerBurst = document.querySelector("#flowerBurst");
const textSnapSections = [...document.querySelectorAll("#reasons, #appreciation, #letter")];
const firstLongSection = document.querySelector("#reasons");
let currentPageIndex = 0;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function isPageRefresh() {
  const [navigation] = performance.getEntriesByType("navigation");
  return navigation?.type === "reload" || performance.navigation?.type === 1;
}

function resetToOpeningOnRefresh() {
  if (!isPageRefresh()) {
    return;
  }

  if (window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  window.scrollTo({ top: 0, behavior: "auto" });
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
  window.addEventListener("hashchange", () => scrollToHashSectionStart());
  window.addEventListener("pageshow", () => scrollToHashSectionStart("auto"));
}

function updateFreeScrollZones() {
  const viewportCenter = window.scrollY + window.innerHeight / 2;
  const isReadingSection = textSnapSections.some((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    return viewportCenter >= sectionTop && viewportCenter <= sectionBottom;
  });
  const isBeforeLongSections = firstLongSection
    ? viewportCenter < firstLongSection.offsetTop
    : false;

  document.documentElement.classList.toggle("is-free-scroll-zone", isBeforeLongSections || isReadingSection);
}

function bindFreeScrollZones() {
  if (textSnapSections.length === 0) {
    return;
  }

  updateFreeScrollZones();
  window.addEventListener("scroll", updateFreeScrollZones, { passive: true });
  window.addEventListener("resize", updateFreeScrollZones);
  window.addEventListener("pageshow", updateFreeScrollZones);
}

function createLetterFlowers() {
  if (!flowerBurst || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const colors = [
    ["#f6cfd2", "#f7df9e"],
    ["#eeb7c1", "#fff3b8"],
    ["#f8d9e1", "#e7a0ad"],
    ["#fff1f3", "#d9979e"]
  ];

  flowerBurst.textContent = "";

  Array.from({ length: 18 }).forEach((_, index) => {
    const flower = document.createElement("span");
    const [petal, center] = colors[index % colors.length];
    const spread = index - 8.5;
    const dx = spread * 16 + (Math.random() * 22 - 11);
    const dy = -118 - Math.random() * 128;
    const size = 13 + Math.random() * 13;
    const delay = index * 18 + Math.random() * 70;
    const duration = 860 + Math.random() * 320;
    const rotate = Math.random() * 120 - 60;
    const spin = rotate + (Math.random() > 0.5 ? 260 : -260);
    const scale = 0.82 + Math.random() * 0.42;

    flower.className = "letter-flower";
    flower.style.setProperty("--petal", petal);
    flower.style.setProperty("--center", center);
    flower.style.setProperty("--dx", `${dx}px`);
    flower.style.setProperty("--dy", `${dy}px`);
    flower.style.setProperty("--size", `${size}px`);
    flower.style.setProperty("--delay", `${delay}ms`);
    flower.style.setProperty("--duration", `${duration}ms`);
    flower.style.setProperty("--rotate", `${rotate}deg`);
    flower.style.setProperty("--spin", `${spin}deg`);
    flower.style.setProperty("--scale", scale.toFixed(2));
    flower.innerHTML = "<span></span><span></span><span></span><span></span><span></span><i></i>";

    flowerBurst.appendChild(flower);
  });

  window.setTimeout(() => {
    flowerBurst.textContent = "";
  }, 1500);
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
    createLetterFlowers();
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

resetToOpeningOnRefresh();
updateDayCounter();
revealOnScroll();
bindPageTransitions();
bindHashSectionSnap();
bindFreeScrollZones();
bindOpeningLetter();
bindLoveCards();
