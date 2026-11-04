/* Cấu hình chung. Đọc từ biến môi trường, có giá trị mặc định để chạy local. */
const path = require('node:path');

const root = path.resolve(__dirname, '..');

module.exports = {
  PORT: Number(process.env.PORT) || 4000,
  DB_FILE: process.env.DB_FILE || path.join(root, 'data', 'thegioidienthoai.db'),
  SCHEMA_FILE: path.join(root, 'src', 'schema.sql'),
  /* Thư mục chứa website hiện tại (index.html, admin.html…) — server phục vụ luôn
     để trình duyệt coi client và API là cùng origin, tránh mọi rắc rối CORS. */
  PUBLIC_DIR: process.env.PUBLIC_DIR || path.resolve(root, '..', 'thegioidienthoai_project'),
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-doi-truoc-khi-nop-bai',
  TOKEN_TTL_MS: 8 * 60 * 60 * 1000, // 8 giờ
  /* Polling cho Admin dùng khi WebSocket không khả dụng */
  POLL_INTERVAL_MS: 5000
};
