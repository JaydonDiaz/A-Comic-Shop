gsap.registerPlugin(ScrollTrigger);

// Fonts and the long-box photo can finish loading after ScrollTrigger
// has already measured the page, which leaves the pinned Long Boxes
// section's spacer sized against stale layout. Recomputing once
// everything has actually loaded keeps the pin math correct. Custom
// fonts in particular can swap in (shifting heading heights/line
// wraps) after the window "load" event already fired, so both are
// covered here.
window.addEventListener("load", () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

/* ============================================================
   TITLES — pulled from the shop's real current inventory on
   their live ComicHub storefront (used in the marquee and the
   pull-list receipt demo). Titles are facts, not copyrighted
   artwork — no cover art is reproduced anywhere on this site.
   ============================================================ */
const NEW_TITLES = [
  "20 Fists #1",
  "A Righteous Thirst for Vengeance #1",
  "A Thing Called Truth #1",
  "Action Comics 2021 Annual",
  "Alice in Leatherland #1",
  "Alien #1",
  "Alien #4",
  "Amazing Fantasy #3",
  "Amazing Spider-Man #74",
  "Amazing Spider-Man #75"
];

/* ============================================================
   NAV: scroll state, mobile menu, smooth anchors, active link
   ============================================================ */
const nav = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

ScrollTrigger.create({
  start: 40,
  end: 99999,
  onUpdate: (self) => nav.classList.toggle("scrolled", self.scroll() > 40)
});

function closeMobileMenu() {
  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

hamburger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});
document.querySelectorAll(".mobile-link").forEach((link) => link.addEventListener("click", closeMobileMenu));

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 76;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");
sections.forEach((section) => {
  ScrollTrigger.create({
    trigger: section,
    start: "top 30%",
    end: "bottom 30%",
    onToggle: (self) => {
      if (!self.isActive) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`));
    }
  });
});

/* ============================================================
   HERO ENTRANCE
   ============================================================ */
gsap.timeline({ defaults: { ease: "power3.out" } })
  .to(".hero-badges", { opacity: 1, y: 0, duration: 0.6 })
  .to(".hero-title", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
  .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7 }, "-=0.5")
  .to(".hero-actions", { opacity: 1, y: 0, duration: 0.6 }, "-=0.45")
  .to(".cover-card", {
    opacity: 1,
    duration: 0.6,
    stagger: 0.12,
    ease: "back.out(1.6)"
  }, "-=0.9")
  .to(".cover-burst", { opacity: 1, duration: 0.5, ease: "back.out(2.2)" }, "-=0.3");

gsap.to(".cover-burst", {
  rotation: "+=6",
  duration: 2.4,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut",
  delay: 1.6
});

/* ============================================================
   SCROLL REVEALS
   ============================================================ */
gsap.utils.toArray(".reveal-up").forEach((el) => {
  gsap.fromTo(el, { opacity: 0, y: 28 }, {
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 88%" }
  });
});

function staggerReveal(selector, container) {
  const items = (container || document).querySelectorAll(selector);
  if (!items.length) return;
  gsap.fromTo(items, { opacity: 0, y: 22 }, {
    opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06,
    scrollTrigger: { trigger: items[0], start: "top 90%" }
  });
}
staggerReveal(".shop-card");
staggerReveal(".event-card");
staggerReveal(".speech-card");

/* ============================================================
   STAT COUNT-UP
   ============================================================ */
document.querySelectorAll(".stat-num[data-count]").forEach((el) => {
  const target = parseInt(el.getAttribute("data-count"), 10);
  const counter = { val: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: "top 90%",
    once: true,
    onEnter: () => {
      gsap.to(counter, {
        val: target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => { el.textContent = Math.round(counter.val); }
      });
    }
  });
});

/* ============================================================
   NEW RELEASES MARQUEE
   Driven by a GSAP tween (not a CSS @keyframes animation) so
   hovering can smoothly change its timeScale — slowing it down
   and speeding it back up — without ever resetting its position,
   which a CSS animation-duration swap would do.
   ============================================================ */
const marqueeStrip = document.querySelector(".marquee-strip");
const marqueeTrack = document.getElementById("marquee-track");
if (marqueeTrack && marqueeStrip) {
  const items = NEW_TITLES.concat(NEW_TITLES).map((title) =>
    `<span class="marquee-item"><span class="marquee-dot"></span>${title}</span>`
  ).join("");
  marqueeTrack.innerHTML = items;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    const marqueeTween = gsap.to(marqueeTrack, {
      xPercent: -50,
      duration: 34,
      ease: "none",
      repeat: -1
    });
    marqueeStrip.addEventListener("mouseenter", () => {
      gsap.to(marqueeTween, { timeScale: 0.25, duration: 0.5, ease: "power2.out", overwrite: true });
    });
    marqueeStrip.addEventListener("mouseleave", () => {
      gsap.to(marqueeTween, { timeScale: 1, duration: 0.5, ease: "power2.out", overwrite: true });
    });
  }
}

/* ============================================================
   PULL LIST RECEIPT DEMO
   ============================================================ */
const receiptList = document.getElementById("pull-receipt-items");
if (receiptList) {
  const demoTitles = NEW_TITLES.slice(0, 4);
  receiptList.innerHTML = demoTitles.map((title) => `
    <li class="pull-receipt-item">
      <span class="pull-receipt-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>
      <span class="pull-receipt-title">${title}</span>
    </li>
  `).join("");

  const rows = receiptList.querySelectorAll(".pull-receipt-item");
  let step = 0;
  function tickReceipt() {
    rows.forEach((row, i) => row.classList.toggle("is-checked", i < step));
    step = step >= rows.length ? 0 : step + 1;
  }
  tickReceipt();
  setInterval(tickReceipt, 1100);
}

/* ============================================================
   LONG BOXES — pinned horizontal scroll
   ============================================================ */
function initLongboxScroll() {
  const track = document.getElementById("longbox-track");
  const pin = track ? track.closest(".longbox-pin") : null;
  if (!track || !pin) return;

  const mm = gsap.matchMedia();
  mm.add("(min-width: 701px)", () => {
    // Measured as functions (not plain numbers) so invalidateOnRefresh
    // actually re-measures scrollWidth on every refresh — a late font
    // swap or image load changing the track's width used to leave the
    // pin's distance baked in from its very first, possibly-wrong
    // measurement, which could desync the pin from its content.
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: () => "+=" + (getDistance() + window.innerHeight * 0.6),
        scrub: 0.6,
        pin: true,
        invalidateOnRefresh: true
      }
    });
    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });
}
initLongboxScroll();

/* ============================================================
   VISIT: HOURS + "OPEN NOW" STATUS
   ============================================================ */
const HOURS = {
  0: [12 * 60, 17 * 60],
  1: null,
  2: [11 * 60, 19 * 60],
  3: [10 * 60, 20 * 60],
  4: [11 * 60, 19 * 60],
  5: [11 * 60, 19 * 60],
  6: [10 * 60, 19 * 60]
};

function updateVisitStatus() {
  const now = new Date();
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const range = HOURS[day];

  const dot = document.getElementById("status-dot");
  const text = document.getElementById("status-text");
  if (!dot || !text) return;

  let open = false;
  let label = "Closed today";
  if (range && minutes >= range[0] && minutes < range[1]) {
    open = true;
    label = day === 3 ? "Open now — new comics are up" : "Open now";
  } else if (range && minutes < range[0]) {
    label = "Opens later today";
  }

  dot.classList.toggle("is-open", open);
  text.textContent = label;

  document.querySelectorAll("[data-day]").forEach((el) => {
    el.classList.toggle("is-today", Number(el.getAttribute("data-day")) === day);
  });
}
updateVisitStatus();

/* ============================================================
   PULL LIST SIGNUP FORM
   ============================================================ */
function wirePullForm() {
  const form = document.getElementById("pull-signup-form");
  const success = document.getElementById("pull-success");
  if (!form) return;

  const nameField = document.getElementById("pf-name");
  const contactField = document.getElementById("pf-email");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    if (!nameField.value.trim()) {
      document.getElementById("pf-name-error").textContent = "Please enter your name.";
      valid = false;
    } else {
      document.getElementById("pf-name-error").textContent = "";
    }

    if (!contactField.value.trim()) {
      document.getElementById("pf-email-error").textContent = "Let us know how to reach you.";
      valid = false;
    } else {
      document.getElementById("pf-email-error").textContent = "";
    }

    if (!valid) return;

    form.hidden = true;
    success.classList.remove("hidden");
    gsap.fromTo(success, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    form.reset();
  });
}
wirePullForm();
