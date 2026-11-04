/* Nạp dữ liệu mẫu ban đầu.

   LƯU Ý: script này KHÔNG xoá CSDL và KHÔNG xoá sản phẩm.
   Danh mục sản phẩm được nạp riêng từ data.js bằng:
       node tools/import-catalog.js
   để giữ nguyên toàn bộ máy, màu, dung lượng và giá đã có.

   Chạy: npm run seed  (an toàn, chạy nhiều lần không mất dữ liệu) */

const { run, get, all } = require('./db');
const { hashPassword } = require('./auth');

const now = new Date().toISOString();

/* ---------------- Danh mục ---------------- */
function ensureCategory(name, slug) {
  const row = get('SELECT id FROM categories WHERE slug = ?', slug);
  if (row) return row.id;
  const res = run('INSERT INTO categories (name, slug, created_at) VALUES (?, ?, ?)', name, slug, now);
  return Number(res.lastInsertRowid);
}
ensureCategory('Điện thoại', 'dien-thoai');
ensureCategory('Phụ kiện', 'phu-kien');

/* ---------------- Tài khoản quản trị ----------------
   Mật khẩu demo: Admin@123456 */
const admins = [
  ['ADMIN01', 'Dương Tuấn Dũng', 'admin@thegioidienthoai.com', 'superadmin'],
  ['NV0002', 'Trần Quốc Bảo', 'kho@thegioidienthoai.com', 'catalog'],
  ['NV0003', 'Lê Thu Hà', 'donhang@thegioidienthoai.com', 'orders']
];
for (const [staffId, name, email, role] of admins) {
  if (!get('SELECT id FROM admins WHERE staff_id = ?', staffId)) {
    run(
      `INSERT INTO admins (staff_id, full_name, email, password_hash, role, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      staffId, name, email, hashPassword('Admin@123456'), role, now
    );
  }
}

/* ---------------- Khách hàng demo ---------------- */
if (!get('SELECT id FROM users WHERE email = ?', 'an@example.com')) {
  run(
    `INSERT INTO users (full_name, email, phone, password_hash, address, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
    'Nguyễn Văn An', 'an@example.com', '0901234567', hashPassword('123456'),
    '12 Nguyễn Trãi, Thanh Xuân, Hà Nội', now, now
  );
}

/* ---------------- Báo cáo ---------------- */
const products = all('SELECT COUNT(*) AS n FROM products')[0].n;
const variants = all('SELECT COUNT(*) AS n FROM product_variants')[0].n;

console.log('✔ Đã nạp dữ liệu cơ bản (không xoá dữ liệu cũ)');
console.log('  Sản phẩm trong CSDL :', products);
console.log('  Biến thể            :', variants);
console.log('  Admin               :', all('SELECT staff_id, role FROM admins')
  .map((a) => `${a.staff_id} (${a.role})`).join(', '));
console.log('  Mật khẩu admin demo : Admin@123456');
console.log('  Khách demo          : an@example.com / 123456');
console.log('');
if (products === 0) {
  console.log('⚠ CSDL chưa có sản phẩm. Nạp danh mục từ data.js:');
  console.log('     node tools/import-catalog.js');
}
