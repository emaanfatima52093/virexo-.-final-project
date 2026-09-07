/* =========================================================
   VIREXO INNOVATIONS — Frontend behavior
   The contact form is backend-free (opens a pre-filled mailto:
   link). The newsletter form still calls the backend at
   API_BASE/api/newsletter — remove that too if you're not
   running the Node server at all.
   ========================================================= */

// Same-origin by default (server.js serves this file itself).
// Override by setting window.VIREXO_API_BASE before this script loads
// if the frontend is hosted separately from the backend.
const API_BASE = window.VIREXO_API_BASE || "";

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------------------------------------------------
   Toast notifications
   --------------------------------------------------------- */
function showToast(message, type = "info", timeout = 4500) {
  const stack = document.getElementById("toastStack");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-dot"></span><span>${escapeHtml(message)}</span>`;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 260);
  }, timeout);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   Theme toggle (persisted in localStorage)
   --------------------------------------------------------- */
function applyThemeButtons() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  [document.getElementById("themeToggle"), document.getElementById("themeToggleMobile")].forEach((btn) => {
    if (!btn) return;
    btn.setAttribute("aria-pressed", String(isDark));
    btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  });
}
function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  try { localStorage.setItem("virexo-theme", next); } catch (e) { /* ignore storage errors */ }
  applyThemeButtons();
}
document.getElementById("themeToggle").addEventListener("click", toggleTheme);
document.getElementById("themeToggleMobile").addEventListener("click", toggleTheme);
applyThemeButtons();

/* ---------------------------------------------------------
   Sticky navbar + scroll-spy
   --------------------------------------------------------- */
const header = document.getElementById("siteHeader");
const navLinks = document.querySelectorAll(".nav-link[data-section]");
const sections = Array.from(navLinks)
  .map((l) => document.getElementById(l.dataset.section))
  .filter(Boolean);

function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 30);

  const backToTop = document.getElementById("backToTop");
  backToTop.classList.toggle("visible", window.scrollY > 600);

  let current = sections[0];
  const scrollPos = window.scrollY + header.offsetHeight + 40;
  for (const sec of sections) {
    if (sec.offsetTop <= scrollPos) current = sec;
  }
  navLinks.forEach((link) => {
    link.classList.toggle("active-link", link.dataset.section === current?.id);
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

document.getElementById("backToTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------------------------------------------------------
   Mobile menu
   --------------------------------------------------------- */
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});
document.querySelectorAll("[data-nav]").forEach((el) => {
  el.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------------------------------------------------------
   Reveal-on-scroll
   --------------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------------------------------------------------------
   Animated counters (stats + hero meta)
   --------------------------------------------------------- */
function animateCounter(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------------------------------------------------------
   Generic modal
   --------------------------------------------------------- */
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");

function openModal(html) {
  modalContent.innerHTML = html;
  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
  modalOverlay.querySelector(".modal-close-inline")?.focus();
}
function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ---------------------------------------------------------
   Services — render cards + "Learn More" modals
   --------------------------------------------------------- */
const servicesGrid = document.getElementById("servicesGrid");
servicesGrid.innerHTML = SERVICES.map(
  (s) => `
  <article class="service-card reveal">
    <div class="service-icon" aria-hidden="true">${SERVICE_ICONS[s.icon]}</div>
    <h3 class="service-title">${s.title}</h3>
    <p class="service-desc">${s.desc}</p>
    <ul class="service-list">${s.features.slice(0, 3).map((f) => `<li>${f}</li>`).join("")}</ul>
    <button class="service-learn-more" data-service="${s.id}">Learn More →</button>
  </article>`
).join("");
document.querySelectorAll(".reveal-group .reveal, .services-grid .reveal").forEach((el) => revealObserver.observe(el));

servicesGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".service-learn-more");
  if (!btn) return;
  const s = SERVICES.find((x) => x.id === btn.dataset.service);
  openModal(`
    <div class="modal-icon" aria-hidden="true">${SERVICE_ICONS[s.icon]}</div>
    <span class="modal-tag">Service</span>
    <h3 id="modalTitle">${s.title}</h3>
    <p>${s.desc}</p>
    <ul class="modal-features">${s.features.map((f) => `<li>${f}</li>`).join("")}</ul>
    <div class="modal-tech-row">${s.tech.map((t) => `<span class="tech-pill">${t}</span>`).join("")}</div>
    <a href="#contact" class="btn btn-primary btn-full" data-nav id="modalStartProject">Start a Project</a>
  `);
  document.getElementById("modalStartProject").addEventListener("click", () => {
    closeModal();
    document.getElementById("service").value = matchServiceOption(s.title);
  });
});

function matchServiceOption(title) {
  const options = Array.from(document.getElementById("service").options).map((o) => o.value);
  return options.includes(title) ? title : "";
}

/* ---------------------------------------------------------
   Provider marketplace — search, filters + profile modals
   --------------------------------------------------------- */
const providerGrid = document.getElementById("providerGrid");
const providerSearch = document.getElementById("providerSearch");
const providerFilters = document.getElementById("providerFilters");
const providerEmpty = document.getElementById("providerEmpty");
let activeProviderFilter = "All";

function providerMatches(provider) {
  const query = (providerSearch?.value || "").trim().toLowerCase();
  const haystack = [provider.name, provider.role, provider.category, provider.location, ...provider.services, ...provider.skills].join(" ").toLowerCase();
  const categoryMatch = activeProviderFilter === "All" || provider.category === activeProviderFilter;
  return categoryMatch && (!query || haystack.includes(query));
}

function renderProviders() {
  const matches = PROVIDERS.filter(providerMatches);
  providerGrid.innerHTML = matches.map((p) => `
    <article class="provider-card reveal">
      <div class="provider-card-top">
        <div class="provider-avatar" aria-hidden="true">${p.initials}</div>
        <span class="provider-availability"><span></span>${p.availability}</span>
      </div>
      <div class="provider-profile">
        <div>
          <h3>${p.name}</h3>
          <p class="provider-role">${p.role}</p>
        </div>
        <span class="provider-category">${p.category}</span>
      </div>
      <p class="provider-bio">${p.bio}</p>
      <div class="provider-rating"><strong>★ ${p.rating}</strong><span>${p.reviews} reviews</span><span>•</span><span>${p.projects} projects</span></div>
      <div class="provider-tags">${p.skills.map((skill) => `<span>${skill}</span>`).join("")}</div>
      <div class="provider-card-footer"><span class="provider-rate">${p.rate}</span><div class="provider-actions"><button class="icon-action" type="button" data-favorite-id="${p.id}" aria-label="Save ${p.name}">♡</button><button class="btn btn-ghost btn-sm" type="button" data-compare-id="${p.id}">Compare</button><button class="btn btn-primary btn-sm" type="button" data-provider-id="${p.id}">View</button></div></div>
    </article>
  `).join("");
  providerEmpty.hidden = matches.length > 0;
  providerGrid.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
}

providerFilters?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-provider-filter]");
  if (!btn) return;
  activeProviderFilter = btn.dataset.providerFilter;
  providerFilters.querySelectorAll(".provider-filter").forEach((item) => {
    const active = item === btn;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });
  renderProviders();
});
providerSearch?.addEventListener("input", renderProviders);

providerGrid?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-provider-id]");
  if (!btn) return;
  const p = PROVIDERS.find((item) => item.id === btn.dataset.providerId);
  if (!p) return;
  openModal(`
    <div class="provider-modal-head"><div class="provider-avatar provider-avatar-lg">${p.initials}</div><div><span class="modal-tag">Verified provider</span><h3 id="modalTitle">${p.name}</h3><p>${p.role} · ${p.location}</p></div></div>
    <div class="provider-modal-stats"><span><strong>★ ${p.rating}</strong> ${p.reviews} reviews</span><span>${p.projects} completed projects</span><span>${p.availability}</span></div>
    <p>${p.bio}</p>
    <h4 class="provider-modal-label">Specialties</h4>
    <div class="provider-tags">${p.services.map((x) => `<span>${x}</span>`).join("")}</div>
    <h4 class="provider-modal-label">Core skills</h4>
    <div class="modal-tech-row">${p.skills.map((x) => `<span class="tech-pill">${x}</span>`).join("")}</div>
    <div class="provider-modal-cta"><span><small>Typical starting rate</small><strong>${p.rate}</strong></span><a href="#contact" class="btn btn-primary" data-provider-request="${p.id}" data-nav>Request this provider</a></div>
  `);
  document.querySelector("[data-provider-request]")?.addEventListener("click", () => {
    closeModal();
    const details = document.getElementById("message");
    if (details) details.value = `I would like to discuss a project with ${p.name} (${p.role}).\n\nProject goals: `;
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  });
});

renderProviders();

/* ---------------------------------------------------------
   Solutions — tabs + panels
   --------------------------------------------------------- */
const solutionsTabs = document.getElementById("solutionsTabs");
const solutionsPanels = document.getElementById("solutionsPanels");
solutionsTabs.innerHTML = SOLUTIONS.map(
  (s, i) => `<button class="solution-tab ${i === 0 ? "active" : ""}" data-target="${s.id}">${s.name}</button>`
).join("");
solutionsPanels.innerHTML = SOLUTIONS.map(
  (s, i) => `
  <div class="solution-panel ${i === 0 ? "active" : ""}" id="panel-${s.id}">
    <div class="solution-col"><span>Problem</span><p>${s.problem}</p></div>
    <div class="solution-col"><span>Solution</span><p>${s.solution}</p></div>
    <div class="solution-col"><span>Business benefit</span><p>${s.benefit}</p></div>
  </div>`
).join("");
solutionsTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".solution-tab");
  if (!btn) return;
  solutionsTabs.querySelectorAll(".solution-tab").forEach((t) => t.classList.remove("active"));
  solutionsPanels.querySelectorAll(".solution-panel").forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(`panel-${btn.dataset.target}`).classList.add("active");
});

/* ---------------------------------------------------------
   AI capabilities grid
   --------------------------------------------------------- */
document.getElementById("aiGrid").innerHTML = AI_CAPABILITIES.map(
  (c) => `
  <div class="ai-card">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <h4>${c.title}</h4>
    <p>${c.desc}</p>
  </div>`
).join("");
document.getElementById("aiCtaBtn").addEventListener("click", () => {
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  const svc = document.getElementById("service");
  svc.value = "AI/ML";
  document.getElementById("message").focus();
});

/* ---------------------------------------------------------
   Portfolio — filter + project modal
   --------------------------------------------------------- */
const PROJECT_GRADIENTS = [
  "linear-gradient(135deg,#6C4DFF,#00D9FF)",
  "linear-gradient(135deg,#8B5CF6,#6C4DFF)",
  "linear-gradient(135deg,#00D9FF,#8B5CF6)",
  "linear-gradient(135deg,#6C4DFF,#8B5CF6)",
];
const portfolioGrid = document.getElementById("portfolioGrid");
portfolioGrid.innerHTML = PROJECTS.map(
  (p, i) => `
  <article class="project-card" data-category="${p.category}">
    <div class="project-thumb" style="background:${PROJECT_GRADIENTS[i % PROJECT_GRADIENTS.length]}"><span>${p.title.split(" ")[0]}</span></div>
    <div class="project-body">
      <span class="project-category">${p.category}</span>
      <h3 class="project-title">${p.title}</h3>
      <p class="project-desc">${p.desc}</p>
      <div class="project-tech">${p.tech.map((t) => `<span class="tech-pill">${t}</span>`).join("")}</div>
      <button class="view-project-btn" data-project="${i}">View Project →</button>
    </div>
  </article>`
).join("");

document.getElementById("portfolioFilters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  const filter = btn.dataset.filter;
  document.querySelectorAll(".project-card").forEach((card) => {
    card.classList.toggle("hidden", filter !== "All" && card.dataset.category !== filter);
  });
});

portfolioGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".view-project-btn");
  if (!btn) return;
  const p = PROJECTS[Number(btn.dataset.project)];
  openModal(`
    <div class="project-thumb" style="background:${PROJECT_GRADIENTS[Number(btn.dataset.project) % PROJECT_GRADIENTS.length]};border-radius:16px;margin-bottom:20px;"><span>${p.title.split(" ")[0]}</span></div>
    <span class="modal-tag">${p.category}</span>
    <h3 id="modalTitle">${p.title}</h3>
    <p>${p.desc}</p>
    <div class="modal-tech-row">${p.tech.map((t) => `<span class="tech-pill">${t}</span>`).join("")}</div>
    <a href="#contact" class="btn btn-primary btn-full" data-nav id="modalStartSimilar">Start a similar project</a>
  `);
  document.getElementById("modalStartSimilar").addEventListener("click", closeModal);
});

/* ---------------------------------------------------------
   Tech stack grid
   --------------------------------------------------------- */
document.getElementById("techGrid").innerHTML = TECH_STACK.map(
  (t) => `<div class="tech-chip">${t}</div>`
).join("");

/* ---------------------------------------------------------
   Pricing — choose plan prefills contact form
   --------------------------------------------------------- */
document.querySelectorAll(".choose-plan-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const plan = btn.dataset.plan;
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    const budgetMap = { Starter: "Under $500", Professional: "$1,000 - $5,000", Enterprise: "Custom" };
    document.getElementById("budget").value = budgetMap[plan] || "";
    const msg = document.getElementById("message");
    if (!msg.value) msg.value = `I'm interested in the ${plan} plan. `;
    msg.focus();
  });
});

/* ---------------------------------------------------------
   Testimonial slider
   --------------------------------------------------------- */
const track = document.getElementById("testimonialTrack");
const slides = Array.from(track.children);
const dotsWrap = document.getElementById("testimonialDots");
let slideIndex = 0;
let sliderTimer = null;

dotsWrap.innerHTML = slides.map((_, i) => `<button class="testimonial-dot ${i === 0 ? "active" : ""}" data-i="${i}" aria-label="Go to testimonial ${i + 1}"></button>`).join("");

function goToSlide(i) {
  slideIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  dotsWrap.querySelectorAll(".testimonial-dot").forEach((d, idx) => d.classList.toggle("active", idx === slideIndex));
}
function startAutoSlide() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(slideIndex + 1), 6000);
}
document.getElementById("testimonialPrev").addEventListener("click", () => { goToSlide(slideIndex - 1); startAutoSlide(); });
document.getElementById("testimonialNext").addEventListener("click", () => { goToSlide(slideIndex + 1); startAutoSlide(); });
dotsWrap.addEventListener("click", (e) => {
  const dot = e.target.closest(".testimonial-dot");
  if (!dot) return;
  goToSlide(Number(dot.dataset.i));
  startAutoSlide();
});
startAutoSlide();

/* ---------------------------------------------------------
   Contact form — real submission to /api/contact
   --------------------------------------------------------- */
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("contactSubmitBtn");

function setFieldError(fieldId, message) {
  const row = document.getElementById(`row-${fieldId}`);
  const errorEl = document.getElementById(`${fieldId}Error`);
  if (!row || !errorEl) return;
  row.classList.toggle("has-error", Boolean(message));
  errorEl.textContent = message || "";
}

function validateContactForm() {
  let valid = true;
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  setFieldError("name", "");
  setFieldError("email", "");
  setFieldError("message", "");

  if (name.length < 2) { setFieldError("name", "Please enter your full name."); valid = false; }
  if (!emailPattern.test(email)) { setFieldError("email", "Please enter a valid email address."); valid = false; }
  if (message.length < 10) { setFieldError("message", "Please share a bit more detail (min. 10 characters)."); valid = false; }

  return valid;
}

// No backend: submitting opens the visitor's own email app with a
// pre-filled message addressed to the studio, so the inquiry still
// reaches a real inbox instead of silently "succeeding" and going nowhere.
const CONTACT_EMAIL = "virexoinnovations@gmail.com";

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";

  // Honeypot: if a bot filled this hidden field, silently drop the submission.
  if (document.getElementById("company_website").value) return;

  if (!validateContactForm()) {
    formStatus.textContent = "Please correct the highlighted fields.";
    formStatus.classList.add("error");
    return;
  }

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    company: document.getElementById("companyField").value.trim(),
    service: document.getElementById("service").value,
    budget: document.getElementById("budget").value,
    message: document.getElementById("message").value.trim(),
  };

  const subject = `Project inquiry — ${payload.name}`;
  const bodyLines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.company ? `Company: ${payload.company}` : null,
    payload.service ? `Service: ${payload.service}` : null,
    payload.budget ? `Budget: ${payload.budget}` : null,
    "",
    "Project details:",
    payload.message,
  ].filter(Boolean);

  const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

  submitBtn.disabled = true;
  submitBtn.textContent = "Opening your email app…";

  window.location.href = mailtoUrl;

  formStatus.textContent = "Your email app should now be open with your inquiry pre-filled — just hit send.";
  formStatus.classList.add("success");
  showToast("Your email app should now be open with your inquiry pre-filled.", "success");

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Project Request";
  }, 1200);
});

/* ---------------------------------------------------------
   Newsletter — real submission to /api/newsletter
   --------------------------------------------------------- */
const newsletterForm = document.getElementById("newsletterForm");
const newsletterStatus = document.getElementById("newsletterStatus");
newsletterForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById("newsletterEmail");
  const email = emailInput.value.trim();
  newsletterStatus.textContent = "";
  newsletterStatus.style.color = "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    newsletterStatus.textContent = "Please enter a valid email address.";
    newsletterStatus.style.color = "#ff8a8a";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");

    newsletterStatus.textContent = data.message || "Subscribed!";
    newsletterStatus.style.color = "#6be8b0";
    showToast(data.message || "Subscribed!", "success");
    newsletterForm.reset();
  } catch (err) {
    newsletterStatus.textContent = err.message;
    newsletterStatus.style.color = "#ff8a8a";
    showToast(err.message, "error");
  }
});
