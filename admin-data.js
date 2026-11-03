/* Dữ liệu & nghiệp vụ trang quản trị (demo, lưu bằng localStorage) */

const ADMIN_ACCOUNTS_KEY = 'tgdd_admin_accounts';
const ADMIN_SESSION_KEY = 'tgdd_admin_session';
const ADMIN_AUDIT_KEY = 'tgdd_admin_audit';
const ADMIN_CATALOG_KEY = 'tgdd_admin_catalog';
const ADMIN_SETTINGS_KEY = 'tgdd_admin_settings';
const ADMIN_ATTEMPTS_KEY = 'tgdd_admin_attempts';
const ADMIN_SEED_KEY = 'tgdd_admin_seeded_v1';

/* Mã đơn: 2 chữ đầu của hãng + số thứ tự, ví dụ IP-0001, SA-0002 */
const BRAND_PREFIX = { Apple: 'IP', Samsung: 'SA', Xiaomi: 'XI', OPPO: 'OP', Vivo: 'VI', Realme: 'RE' };

const ORDER_STATUSES_ADMIN = ['Chờ thanh toán', 'Chờ duyệt', 'Đang đóng gói', 'Đang giao', 'Đã giao', 'Từ chối', 'Đã huỷ'];

const ROLE_NAMES = {
  superadmin: 'Super Admin',
  catalog: 'Quản lý sản phẩm & kho',
  orders: 'Quản lý đơn hàng',
  warranty: 'Bảo hành & CSKH',
  marketing: 'Marketing & khuyến mãi'
};

/* Quyền theo vai trò (RBAC) */
const ROLE_PERMS = {
  superadmin: ['dashboard', 'products', 'orders', 'customers', 'audit', 'staff', 'settings'],
  catalog: ['dashboard', 'products', 'audit'],
  orders: ['dashboard', 'orders', 'customers', 'audit'],
  warranty: ['dashboard', 'customers', 'orders', 'audit'],
  marketing: ['dashboard', 'products', 'audit']
};

/* Tự bảo đảm có dữ liệu admin trước khi dùng (gọi được từ mọi trang) */
function adEnsureSeed() {
  if (typeof adSeed === 'function') adSeed();
}

/* ---------------- Lưu trữ ---------------- */
/* Kiểm tra localStorage có dùng được không (file:// hoặc chế độ riêng tư có thể chặn) */
function adStorageOk() {
  try {
    const k = '__tgdd_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch (e) { return false; }
}

function adRead(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch (e) { return fallback; }
}
function adWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}

/* ---------------- Tài khoản admin ---------------- */
function adAccounts() { return adRead(ADMIN_ACCOUNTS_KEY, []); }
function adSaveAccounts(list) { adWrite(ADMIN_ACCOUNTS_KEY, list); }

function adFindAccount(login) {
  const k = String(login || '').trim().toLowerCase();
  return adAccounts().find(a =>
    a.email.toLowerCase() === k || a.staffId.toLowerCase() === k || a.phone === k);
}

function adCurrent() {
  const id = adRead(ADMIN_SESSION_KEY, null);
  if (!id) return null;
  const acc = adAccounts().find(a => a.id === id);
  if (!acc) return null;
  if (acc.status !== 'Active') return null;
  return acc;
}

function adCan(perm) {
  const acc = adCurrent();
  return !!acc && (ROLE_PERMS[acc.role] || []).includes(perm);
}

/* Mã hóa mật khẩu demo (băm FNV + salt) — hệ thống thật phải dùng bcrypt/argon2 ở backend */
function adHash(password, salt) {
  let h = 2166136261;
  const text = salt + '|' + password;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

/* Kiểm tra độ mạnh mật khẩu admin: >=12 ký tự, hoa, thường, số, ký tự đặc biệt */
function adPasswordIssues(pw) {
  const out = [];
  if (pw.length < 12) out.push('ít nhất 12 ký tự');
  if (!/[A-Z]/.test(pw)) out.push('1 chữ hoa');
  if (!/[a-z]/.test(pw)) out.push('1 chữ thường');
  if (!/\d/.test(pw)) out.push('1 chữ số');
  if (!/[^A-Za-z0-9]/.test(pw)) out.push('1 ký tự đặc biệt');
  return out;
}

/* ---------------- Nhật ký hoạt động ---------------- */
function adLog(action, detail, before, after) {
  const acc = adCurrent();
  const list = adRead(ADMIN_AUDIT_KEY, []);
  list.unshift({
    at: new Date().toISOString(),
    adminId: acc ? acc.staffId : 'system',
    adminName: acc ? acc.name : 'Hệ thống',
    role: acc ? acc.role : '',
    action,
    detail,
    before: before === undefined ? null : before,
    after: after === undefined ? null : after,
    ip: adSettings().lastIp || '127.0.0.1'
  });
  adWrite(ADMIN_AUDIT_KEY, list.slice(0, 500));
}

function adSettings() {
  return adRead(ADMIN_SETTINGS_KEY, {
    require2fa: true,
    passwordMaxDays: 90,
    sessionTimeoutMin: 20,
    ipWhitelist: '',
    lastIp: '127.0.0.1'
  });
}

/* ---------------- Danh mục sản phẩm & kho ---------------- */
/* Sao chép từ products trong data.js để admin chỉnh giá/kho mà không sửa dữ liệu gốc */
function adCatalog() {
  let list = adRead(ADMIN_CATALOG_KEY, null);
  if (!list) {
    list = products.map(p => ({
      id: p.id,
      brand: p.brand,
      name: p.name,
      memory: p.memory.slice(),
      colors: (p.colors || [p.color]).slice(),
      img: p.img,
      price: p.price,
      old: p.old,
      prices: Object.assign({}, p.memoryPrices || {}),
      stock: {},
      threshold: 5,
      active: true
    }));
    list.forEach(p => {
      p.memory.forEach((m, i) => { p.stock[m] = 18 - i * 4; });
    });
    adWrite(ADMIN_CATALOG_KEY, list);
  }
  return list;
}
function adSaveCatalog(list) { adWrite(ADMIN_CATALOG_KEY, list); }

/* Tổng tồn kho một mẫu máy */
function adTotalStock(p) {
  return p.memory.reduce((s, m) => s + (Number(p.stock[m]) || 0), 0);
}
/* Trạng thái bán: hết hàng / sắp hết / còn hàng */
function adStockState(p) {
  if (!p.active) return { key: 'paused', label: 'Ngừng bán' };
  const total = adTotalStock(p);
  if (total <= 0) return { key: 'out', label: 'Hết hàng' };
  if (total <= (p.threshold || 5)) return { key: 'low', label: 'Sắp hết hàng' };
  return { key: 'in', label: 'Còn hàng' };
}

/* Địa chỉ đầy đủ: dùng tgddAddressText nếu trang có nạp shop.js/address.js, nếu không thì tự ghép */
function adAddressText(addr) {
  if (!addr) return '—';
  if (typeof tgddAddressText === 'function') {
    try { return tgddAddressText(addr); } catch (e) { /* rơi xuống dưới */ }
  }
  if (addr.full) return addr.full;
  if (addr.text) return addr.text;
  return [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ') || '—';
}

/* Đơn hàng */
function adOrders() {
  /* Đơn khách đặt chưa kịp đồng bộ thì tự bổ sung khi đọc */
  const list = adRead('tgdd_admin_orders', []);
  return list;
}
function adSaveOrders(list) { adWrite('tgdd_admin_orders', list); }

/* Sinh mã đơn theo hãng: IP-0001, SA-0002... */
function adNextOrderCode(brand, list) {
  const prefix = BRAND_PREFIX[brand] || 'DH';
  const orders = list || adOrders();
  const used = orders
    .filter(o => o.code.startsWith(prefix + '-'))
    .map(o => Number(o.code.split('-')[1]) || 0);
  const n = (used.length ? Math.max.apply(null, used) : 0) + 1;
  return prefix + '-' + String(n).padStart(4, '0');
}

/* Đơn khách đặt trên web (tgddCreateOrder) -> đưa vào hàng chờ duyệt.
   An toàn: không bao giờ ném lỗi, luôn trả về số đơn được đồng bộ. */
function adSyncCustomerOrders() {
  let added = 0;
  let list, users;
  try { list = adOrders(); users = tgddUsers(); }
  catch (e) { return 0; }

  users.forEach(u => {
    (u.orders || []).forEach(o => {
      try {
        if (!o || !o.id) return;

        /* Đơn đã có bên admin: chỉ cập nhật khi khách vừa thanh toán */
        if (o.adminOrderId) {
          const existing = list.find(x => x && x.id === o.adminOrderId);
          if (existing && existing.status === 'Chờ thanh toán' && o.status === 'Đang tiếp nhận') {
            existing.status = 'Chờ duyệt';
            existing.paidAt = o.paidAt || new Date().toISOString();
            existing.updatedAt = new Date().toISOString();
            added++;
          }
          return;
        }

        /* Đơn khách đã huỷ thì không đưa sang admin */
        if (o.status === 'Đã huỷ') return;

        const brand = o.brand || 'Apple';
        list.unshift({
          id: 'AO' + o.id,
          code: adNextOrderCode(brand, list),
          customerOrderId: o.id,
          customerId: u.id,
          brand,
          customerName: u.name || '—',
          customerPhone: u.phone || '—',
          customerEmail: u.email || '',
          items: o.items || '',
          itemLines: o.itemLines || [],
          qty: o.qty || 1,
          subtotal: o.subtotal,
          discount: o.discount,
          shippingFee: o.shippingFee,
          total: o.total,
          payMethod: o.payMethod || '',
          address: o.address || null,
          status: o.status === 'Chờ thanh toán' ? 'Chờ thanh toán' : 'Chờ duyệt',
          createdAt: o.date || new Date().toISOString(),
          ip: '127.0.0.1',
          note: ''
        });
        o.adminOrderId = 'AO' + o.id;
        added++;
      } catch (e) { /* bỏ qua đơn lỗi, không làm hỏng cả lần đồng bộ */ }
    });
  });

  if (added) {
    adWrite('tgdd_admin_orders', list);
    try { tgddSaveUsers(users); } catch (e) {}
  }
  try { localStorage.setItem('tgdd_admin_last_sync', new Date().toISOString()); } catch (e) {}
  return added;
}

/* Đồng bộ + trả về trạng thái để hiển thị trên giao diện */
function adSyncNow() {
  const added = adSyncCustomerOrders();
  const pending = adOrders().filter(o => o.status === 'Chờ duyệt').length;
  return { added, pending, at: new Date().toISOString() };
}

/* Đồng bộ ngược trạng thái đơn về tài khoản khách */
function adPushStatusToCustomer(o) {
  const map = {
    'Chờ thanh toán': 'Chờ thanh toán',
    'Chờ duyệt': 'Đang tiếp nhận',
    'Đang đóng gói': 'Đang đóng gói',
    'Đang giao': 'Đang giao',
    'Đã giao': 'Đã giao',
    'Từ chối': 'Đã huỷ',
    'Đã huỷ': 'Đã huỷ'
  };
  const users = tgddUsers();
  const u = users.find(x => x.id === o.customerId) || users.find(x => x.phone === o.customerPhone);
  if (!u) return;
  const target = (u.orders || []).find(x => x.id === o.customerOrderId);
  if (!target) return;
  target.status = map[o.status] || target.status;
  target.adminStatus = o.status;
  tgddSaveUsers(users);
}

/* Doanh thu chỉ tính đơn đã được duyệt (không tính chờ duyệt / từ chối / huỷ) */
const REVENUE_STATUSES = ['Đang đóng gói', 'Đang giao', 'Đã giao'];

/* Khách vừa thanh toán xong: đơn "Chờ thanh toán" chuyển sang "Chờ duyệt" bên admin */
function adSyncOrderFromCustomer(customerOrderId) {
  try {
    adSyncCustomerOrders();
    const o = adOrders().find(x => x && x.customerOrderId === customerOrderId);
    return !!o && o.status !== 'Chờ thanh toán';
  } catch (e) { return false; }
}

function adSetOrderStatus(orderId, status, note) {
  const list = adOrders();
  const o = list.find(x => x.id === orderId);
  if (!o) return;
  const before = o.status;
  o.status = status;
  if (note) o.note = note;
  o.updatedAt = new Date().toISOString();
  adSaveOrders(list);
  adLog('Đổi trạng thái đơn ' + o.code, (note || '') , before, status);
  adPushStatusToCustomer(o);
  return o;
}

/* ---------------- Tìm khách hàng theo SĐT / email / tên ---------------- */
function adSearchCustomers(keyword) {
  const k = String(keyword || '').trim().toLowerCase();
  if (!k) return [];
  return tgddUsers().filter(u =>
    u.phone.includes(k) || u.email.toLowerCase().includes(k) ||
    u.name.toLowerCase().includes(k) || (u.id || '').toLowerCase() === k);
}

/* Khởi tạo dữ liệu mẫu cho admin lần đầu mở */
function adSeed() {
  if (localStorage.getItem(ADMIN_SEED_KEY)) return;
  const now = new Date().toISOString();
  const mk = (id, staffId, name, email, phone, role, status, password, days) => ({
    id, staffId, name, email, phone, role, status,
    salt: 's' + id,
    password: adHash(password, 's' + id),
    twofa: true,
    lastLoginAt: days === null ? null : new Date(Date.now() - days * 86400000).toISOString(),
    lastIp: days === null ? null : '203.113.10.' + (10 + Number(id.replace(/\D/g, ''))),
    passwordChangedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    createdAt: now
  });
  adSaveAccounts([
    mk('a1', 'ADMIN01', 'Dương Tuấn Dũng', 'admin@thegioidienthoai.com', '0986335498', 'superadmin', 'Active', 'Admin@12345678', 0),
    mk('a2', 'NV0002', 'Trần Quốc Bảo', 'kho@thegioidienthoai.com', '0900000002', 'catalog', 'Active', 'Kho@123456789', 1),
    mk('a3', 'NV0003', 'Lê Thu Hà', 'donhang@thegioidienthoai.com', '0900000003', 'orders', 'Active', 'Donhang@12345', 2),
    mk('a4', 'NV0004', 'Phạm Đức Long', 'cskh@thegioidienthoai.com', '0900000004', 'warranty', 'Locked', 'Cskh@123456789', 9)
  ]);
  adWrite(ADMIN_SETTINGS_KEY, {
    require2fa: true,
    passwordMaxDays: 90,
    sessionTimeoutMin: 20,
    ipWhitelist: '',
    lastIp: '127.0.0.1'
  });
  localStorage.setItem(ADMIN_SEED_KEY, '1');
  adCatalog();
}


