require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const db = require('./db');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');

const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || '');

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running npm run seed:admin.');
  process.exit(1);
}
if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
const existing = users.find(u => u.email === email);
const salt = crypto.randomBytes(16).toString('hex');
const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

if (existing) {
  existing.name = existing.name || 'Virexo Admin';
  existing.role = 'admin';
  existing.status = 'active';
  existing.verified = true;
  existing.passwordSalt = salt;
  existing.passwordHash = passwordHash;
} else {
  users.push({
    id: crypto.randomUUID(),
    name: 'Virexo Admin',
    email,
    role: 'admin',
    company: 'Virexo Innovations',
    verified: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    passwordSalt: salt,
    passwordHash
  });
}

fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
console.log(`Admin account ready: ${email}`);
