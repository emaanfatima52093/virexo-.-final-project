const path = require('path');
const fs = require('fs');

const dataPath = process.env.DATABASE_PATH
  ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
  : path.resolve(__dirname, 'virexo-data.json');

fs.mkdirSync(path.dirname(dataPath), { recursive: true });

const empty = {
  inquiries: [],
  subscribers: [],
  admins: [],
  chat_logs: [],
  marketplace_requests: [],
  marketplace_messages: [],
  marketplace_bookings: [],
  marketplace_reviews: []
};

let data;
try {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8') || '{}');
} catch (_) {
  data = {};
}
for (const key of Object.keys(empty)) {
  if (!Array.isArray(data[key])) data[key] = [];
}

function save() {
  const tmp = `${dataPath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, dataPath);
}

function nextId(table) {
  return data[table].reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

function insert(table, row) {
  const record = { id: nextId(table), ...row };
  data[table].push(record);
  save();
  return record;
}

function all(table) {
  return [...data[table]];
}

function findById(table, id) {
  return data[table].find(row => Number(row.id) === Number(id));
}

module.exports = { data, save, insert, all, findById, dataPath };
