# Virexo Innovations — Final Working Local Build

This build fixes the startup error `Cannot find module '../database/db'`.

It uses a lightweight JSON datastore instead of `better-sqlite3`, so Node 24 works without Python/C++ build tools.

Run:
1. Double-click `start-virexo.bat`
2. Open http://localhost:3000 (do NOT open frontend/auth.html directly with file://)
3. Test signup/login and marketplace features.
4. The Login page now also gives a clear server-connection message if the backend is not running.

The datastore is created automatically at `backend/database/virexo-data.json`.
User accounts are stored at `backend/data/users.json`.

No paid API, domain, hosting, or SQLite build dependency is required for the local demo.
