# Virexo Innovations

A full-stack business website for a digital solutions agency: a marketing frontend
(vanilla HTML/CSS/JS, no build step) and a real Express + SQLite backend that powers
a live AI chatbot, a contact form with email notifications, a newsletter signup, and
a JWT-protected admin dashboard.

## What's real vs. what you configure

Everything in this project is wired end-to-end — there are no fake buttons, canned
chatbot answers, or "coming soon" alerts. Three things need your own credentials
before they go fully live:

| Feature | Works out of the box? | Needs |
|---|---|---|
| Site, nav, theme toggle, filters, forms' validation, admin dashboard UI | Yes | — |
| Contact form & newsletter (saved to SQLite) | Yes | — |
| AI chatbot | Returns an honest "temporarily unavailable" message until configured | `OPENAI_API_KEY` |
| Email notifications on new inquiries | Skipped (logged, inquiry still saved) until configured | SMTP credentials |
| Live web search inside the chatbot | Skipped until configured | `SERPER_API_KEY` (or swap in your preferred provider in `backend/services/webSearchService.js`) |

The backend never fabricates a successful AI reply or a "sent" email — if a service
isn't configured, the API returns a clear error/skip state instead.

## Project structure

```
virexo/
├── frontend/
│   ├── index.html          # marketing site
│   ├── admin.html          # admin dashboard
│   ├── css/style.css
│   ├── js/
│   │   ├── data.js         # services/projects/solutions/testimonials content
│   │   ├── script.js       # site behavior (nav, forms, sliders, modals)
│   │   ├── chatbot.js      # AI chat widget → POST /api/chat
│   │   └── admin.js        # dashboard → /api/auth, /api/admin/*
│   └── assets/
├── backend/
│   ├── server.js
│   ├── routes/              # thin route wiring per resource
│   ├── controllers/         # request handling per resource
│   ├── middleware/          # auth, rate limiting, validation, error handling
│   ├── database/            # SQLite connection, schema, admin-seed script
│   └── services/            # aiService (OpenAI), emailService (SMTP), webSearchService
├── .env.example
├── package.json
├── robots.txt
└── sitemap.xml
```

## Setup

1. **Install dependencies** (requires Node 18+):
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   - `JWT_SECRET` — set this to a long random string (e.g. `openssl rand -hex 32`).
   - `OPENAI_API_KEY` / `OPENAI_MODEL` — enables the chatbot. Without it, `/api/chat`
     returns a clear "AI temporarily unavailable" error rather than a fake reply.
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `ADMIN_EMAIL` — enables inquiry
     notification/confirmation emails. Without it, inquiries still save to the
     database, and the skip is logged server-side.
   - `SERPER_API_KEY` (optional) — lets the chatbot run a real web search for
     current-events questions instead of declining to answer them.

3. **Create your admin account** (used to log into `/admin`):
   ```bash
   ADMIN_EMAIL=you@yourcompany.com ADMIN_PASSWORD=a-strong-password node backend/database/seedAdmin.js
   ```
   The password is bcrypt-hashed before it touches the database — the plaintext
   value is never stored, and there are no hardcoded credentials anywhere in the
   frontend or backend.

4. **Run it:**
   ```bash
   npm start        # production
   npm run dev      # auto-restart on changes (nodemon)
   ```
   Visit `http://localhost:3000` for the site and `http://localhost:3000/admin`
   for the dashboard. The Express server serves the `frontend/` folder directly,
   so there's nothing else to build or bundle.

## API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | — | Liveness + which integrations are configured |
| POST | `/api/chat` | — | `{ message, history, sessionId }` → `{ reply, sessionId }` |
| POST | `/api/contact` | — | Saves an inquiry, triggers email notification/confirmation |
| POST | `/api/newsletter` | — | Saves a subscriber email (deduplicated) |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, admin }` |
| GET | `/api/admin/stats` | Bearer token | Dashboard counts |
| GET | `/api/admin/inquiries?status=&q=` | Bearer token | List/search/filter inquiries |
| PATCH | `/api/admin/inquiries/:id` | Bearer token | Update status |
| DELETE | `/api/admin/inquiries/:id` | Bearer token | Delete an inquiry |
| GET | `/api/admin/subscribers` | Bearer token | List newsletter subscribers |

All write endpoints validate and sanitize input server-side (not just in the
browser), and are rate-limited separately from general traffic (see
`backend/middleware/rateLimiters.js`).

## Security notes

- Secrets (`OPENAI_API_KEY`, SMTP credentials, `JWT_SECRET`) live only in `.env`,
  which is never read by the frontend and should never be committed.
- Passwords are hashed with bcrypt; login uses a constant-time-ish comparison
  path (it always runs `bcrypt.compare`, even for unknown emails) to avoid
  leaking which emails have accounts via response timing.
- `helmet` sets standard security headers; CORS is restricted to `CORS_ORIGIN`.
- All admin routes require a valid JWT in `Authorization: Bearer <token>`.
- User input is escaped/sanitized server-side before it's stored or used in SQL
  (parameterized queries throughout — no string-built SQL).

## Deploying

This is a single Node process serving both the API and the static frontend, so
it deploys anywhere that runs Node 18+ (Render, Railway, Fly.io, a VPS, etc.).
Point `DATABASE_PATH` at a persistent volume if your host's filesystem is
ephemeral, since SQLite is a single file on disk.

## A note on this build

This codebase was generated by Claude and has been reviewed for correctness,
but it has **not been run against a live OpenAI account, SMTP server, or in a
deployed environment** — there was no network access available while building
it. Before relying on it in production: run `npm install`, work through the
setup steps above with real credentials, and click through each flow once
yourself (chat, contact form, newsletter, admin login) to confirm it behaves
as expected in your environment.
