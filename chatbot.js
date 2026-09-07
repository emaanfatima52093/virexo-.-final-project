/* =========================================================
   VIREXO AI — Chatbot frontend (static, no backend)
   Matches the user's message against a set of predefined
   topics and replies with a fixed answer for that topic.
   There is no server call here — every reply below is
   pre-written, not generated live.
   ========================================================= */
(function () {
  const STORAGE_KEY = "virexo-chat-history-v2";

  const fab = document.getElementById("chatFab");
  const panel = document.getElementById("chatPanel");
  const body = document.getElementById("chatBody");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");
  const newBtn = document.getElementById("chatNewBtn");
  const clearBtn = document.getElementById("chatClearBtn");
  const closeBtn = document.getElementById("chatCloseBtn");
  const quickRow = document.getElementById("chatQuickRow");

  if (!fab || !panel) return;

  /* ---------------------------------------------------------
     Knowledge base: each topic has keywords to match against
     the user's message, and a fixed reply.
     --------------------------------------------------------- */
  const TOPICS = [
    {
      keywords: ["service", "services", "offer", "what do you do", "what can you build"],
      reply:
        "We offer 8 core services: Web Development, UI/UX Design, AI & Machine Learning, Mobile App Development, E-Commerce, Business Automation, Cloud & Backend, and SEO & Growth Marketing. Check the Services section above for details on each, or tell me which one you're interested in.",
    },
    {
      keywords: ["cost", "price", "pricing", "how much", "budget", "expensive", "cheap"],
      reply:
        "Most projects fall between $299 and $5,000+ depending on scope. We have three plans: Starter (from $299), Professional (from $699), and Enterprise (custom pricing). A simple marketing site usually costs less than a full product build. Want me to point you to the Pricing section, or would you rather get a custom quote via the contact form?",
    },
    {
      keywords: ["ai", "artificial intelligence", "machine learning", "chatbot", "automation"],
      reply:
        "We build AI chatbots, document processing, predictive analytics, workflow automation, and knowledge assistants tailored to your business. If you have a specific AI idea in mind, use the contact form below and describe it — our team will follow up with next steps.",
    },
    {
      keywords: ["start", "begin", "get started", "how do i start", "new project", "hire"],
      reply:
        "Starting a project is simple: scroll down to the Contact section, fill in your name, email, and a short description of what you need, and our team will reply within one business day. You can also pick a plan in the Pricing section first — it'll take you straight to the form.",
    },
    {
      keywords: ["time", "timeline", "how long", "duration", "weeks", "deadline"],
      reply:
        "Marketing sites typically ship in 4–6 weeks. Larger product builds (apps, platforms, AI integrations) run 8–14 weeks. You'll always get a week-by-week timeline before work starts, and a working prototype in week one.",
    },
    {
      keywords: ["mobile", "app", "android", "ios", "application"],
      reply:
        "We build native-feeling mobile apps for iOS and Android from a single codebase using React Native, plus the app's UI/UX and API integrations. Tell us more about your app idea through the contact form and we'll scope it.",
    },
    {
      keywords: ["ecommerce", "e-commerce", "shop", "store", "online store", "sell products"],
      reply:
        "For e-commerce we build full online stores — product management, payment integrations (like Stripe), order systems, and analytics — designed to convert browsers into buyers. Want to tell us about your store idea in the contact form?",
    },
    {
      keywords: ["seo", "search engine", "google ranking", "traffic", "marketing"],
      reply:
        "Our SEO & Growth Marketing service covers technical and on-page SEO, performance optimization, analytics, and conversion tracking — helping you get found and get chosen. This pairs well with any new site we build.",
    },
    {
      keywords: ["tech", "technology", "stack", "language", "framework", "built with"],
      reply:
        "We build with HTML, CSS, JavaScript, React, Node.js, Express, and Python on the engineering side, with MongoDB, PostgreSQL, or SQLite for data, and cloud deployment for hosting. Check the Technology Stack section for the full list.",
    },
    {
      keywords: ["portfolio", "projects", "work", "case study", "examples", "clients"],
      reply:
        "Take a look at the Projects section above — it includes work like the Norvanta marketing site rebuild (71% faster load time, 2.4x more demo requests) and the Usonic AI support assistant. You can filter by category: Web, AI, Mobile, E-Commerce, or Automation.",
    },
    {
      keywords: ["about", "who are you", "company", "virexo", "founded", "team"],
      reply:
        "Virexo Innovations is a digital solutions studio that keeps strategy, design, and engineering under one roof — the same team carries your project from the first sketch to the final deploy. We value innovation, transparency, quality, performance, and long-term partnership.",
    },
    {
      keywords: ["contact", "email", "phone", "reach", "talk to someone", "human"],
      reply:
        "You can reach us at virexoinnovations@gmail.com or +61 492 988 967, Mon–Fri 9am–6pm. The fastest way is the contact form below — we reply within one business day.",
    },
    {
      keywords: ["hi", "hello", "hey", "salam", "assalam", "aoa"],
      reply: "Hi there! I'm Virexo AI. Ask me about our services, pricing, timelines, or how to start a project.",
    },
    {
      keywords: ["thanks", "thank you", "shukriya", "great", "cool", "ok", "okay"],
      reply: "You're welcome! Let me know if there's anything else you'd like to know about Virexo Innovations.",
    },
  ];

  const FALLBACK_REPLY =
    "I can help with questions about our services, pricing, timelines, portfolio, and how to start a project. For anything more specific, please use the contact form below and our team will get back to you directly.";

  function matchTopic(message) {
    const lower = message.toLowerCase();
    for (const topic of TOPICS) {
      if (topic.keywords.some((kw) => lower.includes(kw))) {
        return topic.reply;
      }
    }
    return FALLBACK_REPLY;
  }

  /* ---------------------------------------------------------
     Chat state (persisted locally — no server involved)
     --------------------------------------------------------- */
  let history = [];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      history = raw ? JSON.parse(raw) : [];
    } catch (e) {
      history = [];
    }
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      /* storage unavailable — chat still works for this session */
    }
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  function scrollToBottom() {
    body.scrollTop = body.scrollHeight;
  }

  function renderWelcome() {
    body.innerHTML = `
      <div class="chat-msg bot">
        <div class="chat-bubble">Hi, I'm Virexo AI. Ask me about our services, pricing, timelines, or how to start a project.</div>
        <div class="chat-meta"><span>${formatTime(Date.now())}</span></div>
      </div>`;
  }

  function renderMessage(msg) {
    const el = document.createElement("div");
    el.className = `chat-msg ${msg.role === "user" ? "user" : "bot"}`;
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = msg.content;
    el.appendChild(bubble);

    const meta = document.createElement("div");
    meta.className = "chat-meta";
    const time = document.createElement("span");
    time.textContent = formatTime(msg.ts);
    meta.appendChild(time);

    if (msg.role === "assistant") {
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "chat-copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(msg.content);
          copyBtn.textContent = "Copied";
          setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
        } catch (e) {
          copyBtn.textContent = "Couldn't copy";
        }
      });
      meta.appendChild(copyBtn);
    }
    el.appendChild(meta);
    return el;
  }

  function renderAll() {
    body.innerHTML = "";
    if (history.length === 0) {
      renderWelcome();
      return;
    }
    history.forEach((msg) => body.appendChild(renderMessage(msg)));
    scrollToBottom();
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "chat-msg bot";
    el.id = "chatTypingIndicator";
    el.innerHTML = `<div class="chat-typing"><span></span><span></span><span></span></div>`;
    body.appendChild(el);
    scrollToBottom();
  }
  function hideTyping() {
    document.getElementById("chatTypingIndicator")?.remove();
  }

  function autoGrow() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  }
  input?.addEventListener("input", autoGrow);

  function sendMessage(text) {
    const message = text.trim();
    if (!message) return;

    const userMsg = { role: "user", content: message, ts: Date.now() };
    history.push(userMsg);
    body.appendChild(renderMessage(userMsg));
    scrollToBottom();
    saveState();

    input.value = "";
    autoGrow();
    sendBtn.disabled = true;
    showTyping();

    // Small delay so the typing indicator reads naturally — this is a
    // local lookup, not a network call, so there's nothing to await.
    setTimeout(() => {
      hideTyping();
      const reply = matchTopic(message);
      const botMsg = { role: "assistant", content: reply, ts: Date.now() };
      history.push(botMsg);
      body.appendChild(renderMessage(botMsg));
      scrollToBottom();
      saveState();
      sendBtn.disabled = false;
      input.focus();
    }, 500);
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });
  quickRow?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chat-quick-btn");
    if (!btn) return;
    sendMessage(btn.dataset.q);
  });

  function openPanel() {
    panel.classList.add("open");
    fab.setAttribute("aria-expanded", "true");
    setTimeout(() => input?.focus(), 150);
  }
  function closePanel() {
    panel.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
  }
  fab.addEventListener("click", () => (panel.classList.contains("open") ? closePanel() : openPanel()));
  closeBtn?.addEventListener("click", closePanel);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });

  newBtn?.addEventListener("click", () => {
    history = [];
    saveState();
    renderAll();
    window.showToast?.("New conversation started.", "info");
  });
  clearBtn?.addEventListener("click", () => {
    if (history.length === 0) return;
    history = [];
    saveState();
    renderAll();
    window.showToast?.("Conversation cleared.", "info");
  });

  window.openVirexoChat = openPanel;

  loadState();
  renderAll();
})();
