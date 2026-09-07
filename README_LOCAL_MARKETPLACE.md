# Virexo Innovations — Local Marketplace Edition

This edition is designed to feel like a real digital-services marketplace without requiring a paid domain, hosting plan, or paid API.

## What works locally
- Responsive Virexo agency + marketplace UI
- Service categories, provider profiles, search and filters
- Provider favorites and 3-provider comparison
- Smart service recommendations using local keyword rules (no AI API)
- Project/service request form
- SQLite persistence for marketplace requests
- Project status workflow: Pending → Accepted → In Progress → Review → Completed
- Local SQLite persistence for bookings, messages and reviews
- Client/provider workspace
- Existing admin panel and inquiry management
- Existing optional AI chatbot remains optional; the marketplace itself does not depend on OpenAI

## Run
1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env` if it was not created automatically.
5. Run `npm start`.
6. Open `http://localhost:3000`.

Windows: double-click `start-virexo.bat`.

## No paid services required
The core marketplace uses your computer's local Express server and SQLite database. No domain, hosting, payment gateway, email provider or AI API is required for the demo.

## Optional integrations
OpenAI and SMTP support are present only as optional integrations. Leaving their environment variables blank does not break the core marketplace.
