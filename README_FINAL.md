# Virexo Innovations — Local Marketplace (Final Auth Edition)

## One-click setup
1. Install Node.js LTS (Node 20+ is recommended).
2. Extract this ZIP.
3. Double-click `start-virexo.bat`.
4. Open http://localhost:3000

No Python, SQLite native module, paid API, domain, or hosting is required.

## Included
- Client signup/login
- Provider signup/login
- Secure password hashing with Node crypto/scrypt
- Persistent local users in `backend/data/users.json`
- Client/provider dashboard session
- Logout
- Project/service marketplace UI
- Favorites, compare, recommendations and workspace UI from the existing project
- Local admin user/verification page at `/admin-users.html`
- Provider verification status
- Local-first architecture

## Test accounts
Create your own account from `/auth.html`. Do not hard-code real passwords.

## Important
The application is designed for local/demo/development use. The token implementation is intentionally lightweight for a local project; for production deployment, replace it with signed JWT/session cookies, HTTPS, CSRF protection, rate limiting, and a production database.

## Official contact
Email: virexoinnovations@gmail.com
Phone/WhatsApp: +61 492 988 967
