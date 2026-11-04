/* Lưu trữ giỏ hàng, địa chỉ và đơn hàng cho luồng mua hàng (demo, localStorage).
   Dùng chung cho index.html, product.html, checkout.html và order.html. */

const TGDD_CART_KEY = 'tgdd_cart';

/* ---------- Giỏ hàng ---------- */
function tgddCart() {
  try {
    const list = JSON.parse(localStorage.getItem(TGDD_CART_KEY) || '[]');
    return Array.isArray(list) ? list : [];
  } catch (e) { return []; }
}

function tgddSaveCart(list) {
  try { localStorage.setItem(TGDD_CART_KEY, JSON.stringify(list)); } catch (e) {}
  tgddRenderCartCount();
}

/* Một dòng giỏ hàng được xác định bởi sản phẩm + dung lượng + màu */
function tgddCartLineId(p) {
  return p.productId + '|' + p.mem + '|' + (p.color || '');
}

function tgddCartAdd(item, qty) {
  const list = tgddCart();
  const id = tgddCartLineId(item);
  const found = list.find((x) => tgddCartLineId(x) === id);
  if (found) found.qty += qty || 1;
  else list.push(Object.assign({}, item, { qty: qty || 1 }));
  tgddSaveCart(list);
  return list;
}

function tgddCartSetQty(lineId, qty) {
  const list = tgddCart();
  const item = list.find((x) => tgddCartLineId(x) === lineId);
  if (!item) return;
  item.qty = Math.max(1, Math.min(99, qty));
  tgddSaveCart(list);
}

function tgddCartRemove(lineId) {
  tgddSaveCart(tgddCart().filter((x) => tgddCartLineId(x) !== lineId));
}

function tgddCartClear() {
  tgddSaveCart([]);
}

/* Số lượng sản phẩm (không phải số dòng) để hiện trên header */
function tgddCartCount() {
  return tgddCart().reduce((n, x) => n + x.qty, 0);
}

function tgddRenderCartCount() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = '(' + tgddCartCount() + ')';
  });
}

/* ---------- Địa chỉ nhận hàng (lưu trong tài khoản) ---------- */
function tgddUserUpdate(fn) {
  const user = tgddCurrentUser();
  if (!user) return false;
  const list = tgddUsers();
  const target = list.find((u) => u.id === user.id);
  if (!target) return false;
  fn(target);
  tgddSaveUsers(list);
  return true;
}

function tgddAddresses() {
  const user = tgddCurrentUser();
  return (user && user.addresses) ? user.addresses : [];
}

function tgddDefaultAddress() {
  const list = tgddAddresses();
  return list.find((a) => a.default) || list[0] || null;
}

function tgddAddressText(a) {
  if (!a) return '';
  return [a.street, a.ward, a.province].filter(Boolean).join(', ');
}

/* Thêm hoặc cập nhật địa chỉ; trả về id địa chỉ sau khi lưu */
function tgddAddressSave(addr) {
  const id = addr.id || ('ad' + Date.now() + Math.floor(Math.random() * 1000));
  tgddUserUpdate((user) => {
    user.addresses = user.addresses || [];
    const idx = user.addresses.findIndex((a) => a.id === id);
    const record = Object.assign({}, addr, { id });
    if (idx >= 0) user.addresses[idx] = record;
    else user.addresses.push(record);
    /* Chỉ một địa chỉ mặc định tại một thời điểm */
    if (record.default || user.addresses.length === 1) {
      user.addresses.forEach((a) => { a.default = a.id === id; });
    }
  });
  return id;
}

function tgddAddressDelete(id) {
  tgddUserUpdate((user) => {
    const wasDefault = (user.addresses || []).some((a) => a.id === id && a.default);
    user.addresses = (user.addresses || []).filter((a) => a.id !== id);
    if (wasDefault && user.addresses.length) user.addresses[0].default = true;
  });
}

/* ---------- Đơn hàng ---------- */
/* Mã đơn dạng #001CD26101132865593 giống ảnh mẫu: tiền tố + ngày + số ngẫu nhiên */
function tgddNewOrderCode() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = pad(d.getDate()) + pad(d.getMonth() + 1) + String(d.getFullYear()).slice(2) +
    pad(d.getHours()) + pad(d.getMinutes());
  return '001CD' + stamp + Math.floor(10000 + Math.random() * 89999);
}

/* Tạo đơn từ giỏ hàng; trả về mã đơn hoặc null nếu lỗi */
function tgddCreateOrder(order) {
  const user = tgddCurrentUser();
  if (!user) return null;
  const code = tgddNewOrderCode();
  const record = Object.assign({
    id: code,
    date: new Date().toISOString(),
    status: 'Chờ thanh toán',
    qty: 1
  }, order, { id: code });
  const ok = tgddUserUpdate((u) => {
    u.orders = u.orders || [];
    u.orders.unshift(record);
  });
  return ok ? code : null;
}

function tgddGetOrder(code) {
  const user = tgddCurrentUser();
  if (!user) return null;
  return (user.orders || []).find((o) => o.id === code) || null;
}

function tgddUpdateOrder(code, patch) {
  tgddUserUpdate((u) => {
    const o = (u.orders || []).find((x) => x.id === code);
    if (o) Object.assign(o, patch);
  });
}

/* Tiện ích dùng chung */
function tgddMoney(n) {
  return Number(n || 0).toLocaleString('vi-VN') + '₫';
}
function tgddEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Tự đồng bộ đơn khách sang trang quản trị, bất kể trang nào có nạp admin-data.js.
   Lỗi đồng bộ không bao giờ được làm hỏng trải nghiệm khách hàng. */
function tgddAutoSyncAdmin() {
  if (typeof adSyncCustomerOrders !== 'function') return 0;
  try {
    if (typeof adSeed === 'function') adSeed();
    return adSyncCustomerOrders();
  } catch (e) { return 0; }
}
document.addEventListener('DOMContentLoaded', tgddAutoSyncAdmin);
