const db = require('../database/db');
const VALID_STATUSES = ['New', 'Contacted', 'In Progress', 'Completed'];
function getInquiries(req, res) {
  const { status, q } = req.query; let rows = db.all('inquiries');
  if (status && VALID_STATUSES.includes(status)) rows = rows.filter(r => r.status === status);
  if (q && typeof q === 'string') { const s = q.toLowerCase(); rows = rows.filter(r => [r.name,r.email,r.company,r.message].some(v => String(v || '').toLowerCase().includes(s))); }
  rows.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ inquiries: rows.slice(0, 500) });
}
function updateInquiry(req, res) { const row = db.findById('inquiries', req.params.id); const { status } = req.body || {}; if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` }); if (!row) return res.status(404).json({ error: 'Inquiry not found.' }); row.status = status; db.save(); res.json({ message: 'Inquiry updated.' }); }
function deleteInquiry(req, res) { const i = db.data.inquiries.findIndex(r => Number(r.id) === Number(req.params.id)); if (i < 0) return res.status(404).json({ error: 'Inquiry not found.' }); db.data.inquiries.splice(i,1); db.save(); res.json({ message: 'Inquiry deleted.' }); }
function getSubscribers(req, res) { const rows = db.all('subscribers').sort((a,b) => new Date(b.created_at)-new Date(a.created_at)).slice(0,1000); res.json({ subscribers: rows.map(({id,email,created_at})=>({id,email,created_at})) }); }
function getStats(req, res) { const inquiries=db.all('inquiries'); const byStatus=inquiries.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{}); res.json({ total: inquiries.length, new:byStatus.New||0, contacted:byStatus.Contacted||0, inProgress:byStatus['In Progress']||0, completed:byStatus.Completed||0, subscribers:db.data.subscribers.length, recent:[...inquiries].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,5) }); }
module.exports = { getInquiries, updateInquiry, deleteInquiry, getSubscribers, getStats, VALID_STATUSES };
