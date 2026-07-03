const RELATIONSHIP_START_DATE = "2024-01-21";

const daysTogether = document.querySelector("#daysTogether");
const counterNote = document.querySelector("#counterNote");
const loveCards = document.querySelectorAll(".love-card");
const pages = [...document.querySelectorAll(".story-page")];
const letterGate = document.querySelector("#letterGate");
const openLetterButton = document.querySelector("#openLetterButton");
const reasonsSection = document.querySelector("#reasons");
const upwardSnapSections = [...document.querySelectorAll("#reasons, #appreciation")];
let currentPageIndex = 0;
let lastScrollY = window.scrollY;
let scrollDirection = 0;
let scrollEndTimer;
let isProgrammaticSnap = false;

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

function scrollToReasonStart(behavior = "smooth") {
  if (window.location.hash !== "#reasons" || !reasonsSection) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({
      top: reasonsSection.offsetTop,
      behavior
    });
  });
}

function bindReasonSnap() {
  scrollToReasonStart("auto");
  window.setTimeout(() => scrollToReasonStart("auto"), 160);
  window.setTimeout(() => scrollToReasonStart("auto"), 420);
  window.addEventListener("hashchange", () => scrollToReasonStart());
  window.addEventListener("pageshow", () => scrollToReasonStart("auto"));
}

function snapBackToSectionIntro() {
  if (isProgrammaticSnap || scrollDirection >= 0 || window.innerWidth > 640 || document.body.classList.contains("letter-gate-active")) {
    return;
  }

  const currentY = window.scrollY;
  const targetSection = upwardSnapSections.find((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    return currentY > sectionTop + 36 && currentY < sectionBottom - 36;
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

      if (window.location.hash === "#reasons") {
        scrollToReasonStart();
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
bindReasonSnap();
bindMobileUpwardSnap();
bindOpeningLetter();
bindLoveCards();
