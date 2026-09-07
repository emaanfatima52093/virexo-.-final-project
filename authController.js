
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]'); }
  catch { return []; }
}
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function makeToken(user) {
  return Buffer.from(JSON.stringify({
    id: user.id, email: user.email, role: user.role,
    name: user.name, exp: Date.now() + 7*24*60*60*1000
  })).toString('base64url');
}
function sanitize(user) {
  const { passwordHash, passwordSalt, ...safe } = user;
  return safe;
}

exports.signup = (req,res) => {
  const { name, email, password, role='client', company='' } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({error:'Name, email and password are required.'});
  if (!['client','provider'].includes(role)) return res.status(400).json({error:'Invalid role.'});
  if (String(password).length < 6) return res.status(400).json({error:'Password must be at least 6 characters.'});
  const users = readUsers();
  const normalized = String(email).trim().toLowerCase();
  if (users.some(u => u.email === normalized)) return res.status(409).json({error:'An account with this email already exists.'});
  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomUUID(), name:String(name).trim(), email:normalized,
    role, company:String(company||'').trim(), verified: role === 'client',
    status:'active', createdAt:new Date().toISOString(),
    passwordSalt:salt, passwordHash:hashPassword(String(password),salt)
  };
  users.push(user); writeUsers(users);
  res.status(201).json({user:sanitize(user), token:makeToken(user), message:'Account created successfully.'});
};

exports.login = (req,res) => {
  const { email, password, role } = req.body || {};
  const users=readUsers();
  const user=users.find(u => u.email===String(email||'').trim().toLowerCase());
  if (!user || hashPassword(String(password||''), user.passwordSalt)!==user.passwordHash)
    return res.status(401).json({error:'Invalid email or password.'});
  if (role && role !== user.role) return res.status(403).json({error:`This account is registered as ${user.role}.`});
  res.json({user:sanitize(user), token:makeToken(user), message:'Login successful.'});
};

exports.me = (req,res) => {
  const token=req.headers.authorization?.replace(/^Bearer\s+/i,'');
  if(!token) return res.status(401).json({error:'Not authenticated.'});
  try {
    const payload=JSON.parse(Buffer.from(token,'base64url').toString('utf8'));
    if(payload.exp < Date.now()) throw new Error('expired');
    const user=readUsers().find(u=>u.id===payload.id);
    if(!user) throw new Error('missing');
    res.json({user:sanitize(user)});
  } catch { res.status(401).json({error:'Session expired. Please login again.'}); }
};

exports.listUsers = (req,res) => {
  res.json({users:readUsers().map(sanitize)});
};
exports.verifyProvider = (req,res) => {
  const users=readUsers();
  const user=users.find(u=>u.id===req.params.id && u.role==='provider');
  if(!user) return res.status(404).json({error:'Provider not found.'});
  user.verified=!!req.body.verified; writeUsers(users);
  res.json({user:sanitize(user)});
};
