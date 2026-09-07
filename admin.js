/* =========================================================
   VIREXO ADMIN — Dashboard frontend
   Talks to the protected /api/admin/* and /api/auth/login
   endpoints. The JWT lives in localStorage only on this page.
   ========================================================= */
(function () {
  const API_BASE = window.VIREXO_API_BASE || "";
  const TOKEN_KEY = "virexo-admin-token";
  const EMAIL_KEY = "virexo-admin-email";

  const loginWrap = document.getElementById("adminLoginWrap");
  const shell = document.getElementById("adminShell");
  const loginForm = document.getElementById("adminLoginForm");
  const loginStatus = document.getElementById("adminLoginStatus");
  const loginBtn = document.getElementById("adminLoginBtn");
  const userEmailEl = document.getElementById("adminUserEmail");

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setSession(token, email) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
  }

  function showToast(message, type = "info", timeout = 4000) {
    const stack = document.getElementById("toastStack");
    if (!stack) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const dot = document.createElement("span");
    dot.className = "toast-dot";
    const text = document.createElement("span");
    text.textContent = message;
    toast.append(dot, text);
    stack.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 260);
    }, timeout);
  }

  /** Wrapper around fetch that attaches the bearer token and handles 401s uniformly. */
  async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (res.status === 401) {
      clearSession();
      showLogin();
      showToast("Your session expired. Please log in again.", "error");
      throw new Error("Session expired.");
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  function showLogin() {
    loginWrap.style.display = "flex";
    shell.classList.remove("active");
  }
  function showDashboard(email) {
    loginWrap.style.display = "none";
    shell.classList.add("active");
    userEmailEl.textContent = email || localStorage.getItem(EMAIL_KEY) || "";
    loadEverything();
  }

  /* ---------------------------------------------------------
     Login
     --------------------------------------------------------- */
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    loginStatus.textContent = "";
    loginStatus.className = "form-status";
    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in…";

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Incorrect email or password.");

      const admin = data.admin || data.user;
      if (!admin || admin.role !== "admin") throw new Error("This account is not an administrator.");
      setSession(data.token, admin.email);
      loginForm.reset();
      showDashboard(admin.email);
    } catch (err) {
      loginStatus.textContent = err.message;
      loginStatus.classList.add("error");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign in";
    }
  });

  document.getElementById("adminLogoutBtn").addEventListener("click", () => {
    clearSession();
    showLogin();
  });

  /* ---------------------------------------------------------
     Theme toggle (shared storage key with the main site)
     --------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    try { localStorage.setItem("virexo-theme", next); } catch (e) {}
  });

  /* ---------------------------------------------------------
     Stats
     --------------------------------------------------------- */
  async function loadStats() {
    try {
      const data = await apiFetch("/api/admin/stats");
      document.getElementById("adminStatsGrid").innerHTML = [
        { label: "Total inquiries", value: data.total },
        { label: "New", value: data.new },
        { label: "Contacted", value: data.contacted },
        { label: "In progress", value: data.inProgress },
        { label: "Subscribers", value: data.subscribers },
      ]
        .map((s) => `<div class="admin-stat-card"><div class="num">${s.value}</div><div class="label">${s.label}</div></div>`)
        .join("");
    } catch (err) {
      /* apiFetch already surfaced the error / redirected to login */
    }
  }

  /* ---------------------------------------------------------
     Inquiries — search, filter, update status, delete
     --------------------------------------------------------- */
  const inquiryBody = document.getElementById("inquiryTableBody");
  const inquiryEmpty = document.getElementById("inquiryEmpty");
  const searchInput = document.getElementById("inquirySearch");
  const statusFilter = document.getElementById("inquiryStatusFilter");
  let searchDebounce = null;

  function statusClass(status) {
    return `status-${status.replace(/\s+/g, "-")}`;
  }

  async function loadInquiries() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
    if (statusFilter.value) params.set("status", statusFilter.value);

    try {
      const data = await apiFetch(`/api/admin/inquiries?${params.toString()}`);
      const rows = data.inquiries || [];
      inquiryEmpty.style.display = rows.length ? "none" : "block";
      inquiryBody.innerHTML = rows
        .map(
          (inq) => `
        <tr data-id="${inq.id}">
          <td>${new Date(inq.created_at).toLocaleDateString()}</td>
          <td>${escapeHtml(inq.name)}</td>
          <td>${escapeHtml(inq.email)}</td>
          <td>${escapeHtml(inq.service || "—")}</td>
          <td>${escapeHtml(inq.budget || "—")}</td>
          <td style="max-width:260px;white-space:normal;">${escapeHtml(inq.message).slice(0, 140)}${inq.message.length > 140 ? "…" : ""}</td>
          <td>
            <select class="status-select" data-id="${inq.id}">
              ${["New", "Contacted", "In Progress", "Completed"]
                .map((s) => `<option value="${s}" ${s === inq.status ? "selected" : ""}>${s}</option>`)
                .join("")}
            </select>
          </td>
          <td><button class="row-delete-btn" data-id="${inq.id}">Delete</button></td>
        </tr>`
        )
        .join("");
    } catch (err) {
      /* handled */
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(loadInquiries, 300);
  });
  statusFilter.addEventListener("change", loadInquiries);
  document.getElementById("inquiryRefreshBtn").addEventListener("click", loadInquiries);

  inquiryBody.addEventListener("change", async (e) => {
    const select = e.target.closest(".status-select");
    if (!select) return;
    const id = select.dataset.id;
    const row = select.closest("tr");
    try {
      await apiFetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: select.value }),
      });
      showToast("Inquiry updated.", "success");
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
      loadInquiries();
    }
  });

  inquiryBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".row-delete-btn");
    if (!btn) return;
    if (!confirm("Delete this inquiry? This can't be undone.")) return;
    try {
      await apiFetch(`/api/admin/inquiries/${btn.dataset.id}`, { method: "DELETE" });
      btn.closest("tr").remove();
      showToast("Inquiry deleted.", "success");
      loadStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  /* ---------------------------------------------------------
     Subscribers
     --------------------------------------------------------- */
  async function loadSubscribers() {
    try {
      const data = await apiFetch("/api/admin/subscribers");
      const rows = data.subscribers || [];
      document.getElementById("subscriberEmpty").style.display = rows.length ? "none" : "block";
      document.getElementById("subscriberTableBody").innerHTML = rows
        .map((s) => `<tr><td>${escapeHtml(s.email)}</td><td>${new Date(s.created_at).toLocaleDateString()}</td></tr>`)
        .join("");
    } catch (err) {
      /* handled */
    }
  }
  document.getElementById("subscriberRefreshBtn").addEventListener("click", loadSubscribers);

  function loadEverything() {
    loadStats();
    loadInquiries();
    loadSubscribers();
  }

  /* ---------------------------------------------------------
     Boot: restore session if a token is already stored
     --------------------------------------------------------- */
  if (getToken()) {
    showDashboard(localStorage.getItem(EMAIL_KEY));
  } else {
    showLogin();
  }
})();
