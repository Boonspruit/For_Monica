const RELATIONSHIP_START_DATE = "[INSERT_RELATIONSHIP_START_DATE]";

const daysTogether = document.querySelector("#daysTogether");
const counterNote = document.querySelector("#counterNote");
const loveCards = document.querySelectorAll(".love-card");
const noButton = document.querySelector("#noButton");
const yesButton = document.querySelector("#yesButton");
const loveResult = document.querySelector("#loveResult");
const finalQuestion = document.querySelector(".final-question");

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
  counterNote.textContent = "And I am thankful for every one.";
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

function bindLoveCards() {
  loveCards.forEach((card) => {
    card.addEventListener("click", () => {
      card.classList.toggle("is-open");
    });
  });
}

function moveNoButton() {
  const bounds = finalQuestion.getBoundingClientRect();
  const buttonBounds = noButton.getBoundingClientRect();
  const padding = 16;
  const maxX = Math.max(padding, bounds.width - buttonBounds.width - padding);
  const maxY = Math.max(padding, bounds.height - buttonBounds.height - padding);
  const x = Math.random() * (maxX - padding) + padding;
  const y = Math.random() * (maxY - padding) + padding;

  noButton.classList.add("is-running");
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
}

function createHeartBurst(originX, originY) {
  const colors = ["#b96573", "#d9979e", "#bd8d62", "#f6cfd2"];

  for (let index = 0; index < 36; index += 1) {
    const heart = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 155;
    const size = 7 + Math.random() * 10;

    heart.className = "confetti-heart";
    heart.style.setProperty("--x", `${originX}px`);
    heart.style.setProperty("--y", `${originY}px`);
    heart.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--dy", `${Math.sin(angle) * distance - 50}px`);
    heart.style.setProperty("--size", `${size}px`);
    heart.style.setProperty("--color", colors[index % colors.length]);

    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1200);
  }
}

function bindQuiz() {
  ["mouseenter", "focus", "touchstart"].forEach((eventName) => {
    noButton.addEventListener(eventName, moveNoButton, { passive: true });
  });

  noButton.addEventListener("click", (event) => {
    event.preventDefault();
    moveNoButton();
  });

  yesButton.addEventListener("click", (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    loveResult.textContent = "Yay! I love you so much, Monica.";
  });
}

updateDayCounter();
revealOnScroll();
bindLoveCards();
bindQuiz();
