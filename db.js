/* Lớp truy cập dữ liệu: mở SQLite, tạo schema, cung cấp helper transaction. */
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const config = require('./config');

fs.mkdirSync(path.dirname(config.DB_FILE), { recursive: true });

const db = new DatabaseSync(config.DB_FILE);

/* WAL cho phép đọc/ghi đồng thời — cần thiết khi nhiều request + socket cùng chạy. */
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA busy_timeout = 5000');

db.exec(fs.readFileSync(config.SCHEMA_FILE, 'utf8'));

/**
 * Chạy một hàm trong transaction. Nếu hàm ném lỗi -> ROLLBACK toàn bộ.
 * Dùng cho luồng "tạo đơn + trừ kho" để không bao giờ bán vượt tồn.
 */
function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) { /* đã rollback */ }
    throw err;
  }
}

const all = (sql, ...params) => db.prepare(sql).all(...params);
const get = (sql, ...params) => db.prepare(sql).get(...params);
const run = (sql, ...params) => db.prepare(sql).run(...params);

/* Tiện ích thời gian: lưu ISO 8601 UTC để client tự format theo múi giờ. */
const nowIso = () => new Date().toISOString();

module.exports = { db, tx, all, get, run, nowIso };
