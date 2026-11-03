/* Trang quản trị TRỰC TUYẾN — nói chuyện với backend qua REST + Socket.IO.
   Khác với admin.html cũ (localStorage), mọi thao tác ở đây ghi vào CSDL thật
   nên website khách nhìn thấy thay đổi ngay. */

const API = '/api';
const TOKEN_KEY = 'tgdd_pro_token';
const ADMIN_KEY = 'tgdd_pro_admin';

const state = {
  tab: 'dashboard',
  products: [],
  customers: [],
  orders: [],
  categories: [],
  socket: null,
  pollTimer: null,
  connected: false,
  orderFilter: '',
  search: { products: '', customers: '', orders: '' }
};

const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  approved: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  rejected: 'Đã huỷ'
};

/* ------------------------------ Tiện ích ------------------------------ */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const money = (n) => Number(n || 0).toLocaleString('vi-VN') + '₫';
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('vi-VN') + ' ' +
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ------------------------------ Gọi API ------------------------------ */
function token() { return localStorage.getItem(TOKEN_KEY) || ''; }
function currentAdmin() {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null'); }
  catch (_) { return null; }
}

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: 'Bearer ' + token() } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let json = {};
  try { json = await res.json(); } catch (_) { json = {}; }

  if (res.status === 401) {
    logout(true);
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }
  if (!res.ok) {
    throw new Error((json.error && json.error.message) || `Lỗi ${res.status}`);
  }
  return json.data;
}
/* ------------------------------ Đăng nhập ------------------------------ */
async function doLogin(e) {
  e.preventDefault();
  const btn = $('lgBtn');
  const err = $('lgErr');
  err.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Đang đăng nhập…';
  try {
    const data = await api('/admin/login', {
      method: 'POST',
      body: { email: $('lgEmail').value.trim(), password: $('lgPw').value }
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(data.admin));
    bootApp();
  } catch (ex) {
    err.textContent = ex.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Đăng nhập';
  }
}

function logout(silent) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
  if (state.socket) { state.socket.disconnect(); state.socket = null; }
  clearInterval(state.pollTimer);
  $('app').style.display = 'none';
  $('loginScreen').style.display = 'grid';
  if (!silent) toast('Đã đăng xuất.');
}

/* ------------------------------ Khởi động ------------------------------ */
function bootApp() {
  const admin = currentAdmin();
  if (!admin || !token()) return logout(true);

  $('loginScreen').style.display = 'none';
  $('app').style.display = 'grid';
  $('whoBox').innerHTML =
    `<b>${esc(admin.fullName)}</b>${esc(admin.staffId)} · ${esc(admin.role)}` +
    `<div style="margin-top:8px"><button class="btn sm ghost" onclick="logout()">Đăng xuất</button></div>`;

  const perms = {
    superadmin: ['dashboard', 'orders', 'products', 'customers'],
    orders: ['dashboard', 'orders', 'customers'],
    catalog: ['dashboard', 'products']
  }[admin.role] || ['dashboard'];

  document.querySelectorAll('.side a[data-tab]').forEach((a) => {
    const allowed = perms.includes(a.dataset.tab);
    a.style.display = allowed ? '' : 'none';
    a.onclick = () => go(a.dataset.tab);
  });

  state.tab = perms[0];
  connectSocket();
  refresh();
}

function go(tab) {
  state.tab = tab;
  document.querySelectorAll('.side a[data-tab]').forEach((a) =>
    a.classList.toggle('active', a.dataset.tab === tab));
  refresh();
}

/* ------------------------------ Realtime ------------------------------ */
function connectSocket() {
  if (state.socket) state.socket.disconnect();

  const socket = io({ auth: { token: token() } });
  state.socket = socket;

  socket.on('connect', () => {
    state.connected = true;
    clearInterval(state.pollTimer);
    renderLive();
  });

  socket.on('disconnect', () => {
    state.connected = false;
    renderLive();
    /* Mất WebSocket -> chuyển sang POLLING để không bỏ lỡ đơn mới */
    startPolling();
  });

  socket.on('connect_error', () => {
    state.connected = false;
    renderLive();
    startPolling();
  });

  /* ---- Sự kiện đồng bộ ---- */
  socket.on('order:created', (order) => {
    if (!state.orders.some((o) => o.id === order.id)) state.orders.unshift(order);
    toast('🔔 Đơn mới ' + order.code + ' từ ' + order.customerName);
    renderNavBadge();
    if (state.tab === 'orders' || state.tab === 'dashboard') render();
  });

  socket.on('order:updated', (order) => {
    const i = state.orders.findIndex((o) => o.id === order.id);
    if (i >= 0) state.orders[i] = order; else state.orders.unshift(order);
    renderNavBadge();
    if (state.tab === 'orders' || state.tab === 'dashboard') render();
  });

  socket.on('product:stock', ({ id, stock }) => {
    const p = state.products.find((x) => x.id === id);
    if (p) p.stock = stock;
    if (state.tab === 'products' || state.tab === 'dashboard') render();
  });

  socket.on('product:created', (p) => {
    if (!state.products.some((x) => x.id === p.id)) state.products.unshift(p);
    if (state.tab === 'products') render();
  });

  socket.on('product:updated', (p) => {
    const i = state.products.findIndex((x) => x.id === p.id);
    if (i >= 0) state.products[i] = p; else state.products.push(p);
    if (state.tab === 'products') render();
  });

  socket.on('product:deleted', ({ id }) => {
    state.products = state.products.filter((x) => x.id !== id);
    if (state.tab === 'products') render();
  });

  socket.on('user:created', (u) => {
    if (!state.customers.some((x) => x.id === u.id)) state.customers.unshift(u);
    if (state.tab === 'customers') render();
  });

  socket.on('user:updated', (u) => {
    const i = state.customers.findIndex((x) => x.id === u.id);
    if (i >= 0) state.customers[i] = u;
    if (state.tab === 'customers') render();
  });
}

/* Polling dự phòng: chỉ chạy khi WebSocket không kết nối được */
function startPolling() {
  if (state.pollTimer) return;
  state.pollTimer = setInterval(async () => {
    if (state.connected) { clearInterval(state.pollTimer); state.pollTimer = null; return; }
    try { await refresh(true); } catch (_) { /* im lặng */ }
  }, 5000);
}

function renderLive() {
  const el = $('liveBadge');
  if (!el) return;
  el.className = 'live' + (state.connected ? '' : ' off');
  el.innerHTML = '<i></i>' + (state.connected ? 'Đồng bộ trực tiếp' : 'Đang kết nối lại…');
}
/* ------------------------------ Nạp dữ liệu ------------------------------ */
async function refresh(quiet) {
  try {
    const admin = currentAdmin();
    const perms = {
      superadmin: ['orders', 'products', 'customers'],
      orders: ['orders', 'customers'],
      catalog: ['products']
    }[admin.role] || [];

    const jobs = [];
    if (perms.includes('orders')) {
      jobs.push(api('/admin/orders').then((d) => { state.orders = d; }));
    }
    if (perms.includes('products')) {
      jobs.push(api('/admin/products').then((d) => { state.products = d; }));
    }
    if (perms.includes('customers')) {
      jobs.push(api('/admin/customers').then((d) => { state.customers = d; }));
    }
    if (!state.categories.length) {
      jobs.push(api('/categories').then((d) => { state.categories = d; }));
    }
    await Promise.all(jobs);
    renderNavBadge();
    render();
  } catch (ex) {
    if (!quiet) toast(ex.message);
  }
}

function renderNavBadge() {
  const n = state.orders.filter((o) => o.status === 'pending').length;
  const el = $('navOrders');
  if (!el) return;
  el.style.display = n ? '' : 'none';
  el.textContent = n;
}

/* ------------------------------ Điều phối khung nhìn ------------------------------ */
function render() {
  const box = $('main');
  if (state.tab === 'dashboard') box.innerHTML = viewDashboard();
  else if (state.tab === 'orders') box.innerHTML = viewOrders();
  else if (state.tab === 'products') box.innerHTML = viewProducts();
  else box.innerHTML = viewCustomers();
  renderLive();
}

const head = (title, sub) =>
  `<div class="head"><div><h1>${title}</h1><p>${sub}</p></div>
     <span class="live" id="liveBadge"><i></i>Đang kết nối…</span></div>`;

const pill = (status) =>
  `<span class="pill ${status}">${esc(STATUS_LABEL[status] || status)}</span>`;

/* ------------------------------ Tổng quan ------------------------------ */
function viewDashboard() {
  const today = new Date().toDateString();
  const valid = state.orders.filter((o) => o.status !== 'rejected');
  const revenue = (list) => list.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const revToday = revenue(valid.filter((o) => new Date(o.createdAt).toDateString() === today));
  const pending = state.orders.filter((o) => o.status === 'pending');
  const lowStock = state.products.filter((p) => p.stock <= 5 && p.status === 'active');

  const stat = (k, v, s, cls) =>
    `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div>
       <div class="s ${cls || ''}">${s}</div></div>`;

  return head('Tổng quan', 'Số liệu đọc trực tiếp từ CSDL, cập nhật theo thời gian thực.') +
    `<div class="stats">
      ${stat('Doanh thu hôm nay', money(revToday), 'Không tính đơn đã huỷ')}
      ${stat('Đơn chờ duyệt', pending.length + ' đơn', pending.length ? 'Cần xử lý' : 'Đã xử lý hết', pending.length ? 'down' : 'up')}
      ${stat('Tổng đơn hàng', state.orders.length, 'Toàn bộ hệ thống')}
      ${stat('Khách hàng', state.customers.length, 'Tài khoản đã đăng ký')}
    </div>
    <div class="panel">
      <h2>Đơn mới cần duyệt</h2>
      ${pending.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Mã đơn</th><th>Khách</th><th>Sản phẩm</th><th>Tổng</th><th></th></tr></thead>
        <tbody>${pending.slice(0, 6).map((o) => `<tr>
          <td class="mono">${esc(o.code)}</td>
          <td>${esc(o.customerName)}<br><span class="muted">${esc(o.customerPhone)}</span></td>
          <td>${o.items.map((i) => esc(i.productName) + ' ×' + i.quantity).join('<br>')}</td>
          <td><b>${money(o.totalAmount)}</b></td>
          <td class="actions">
            <button class="btn sm ok" onclick="changeStatus(${o.id},'approved')">Duyệt</button>
            <button class="btn sm danger" onclick="rejectOrder(${o.id})">Từ chối</button>
          </td></tr>`).join('')}</tbody></table></div>`
        : '<div class="empty">Không có đơn nào chờ duyệt.</div>'}
    </div>
    <div class="panel">
      <h2>Cảnh báo tồn kho</h2>
      ${lowStock.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Sản phẩm</th><th>Tồn kho</th><th>Trạng thái</th></tr></thead>
        <tbody>${lowStock.map((p) => `<tr>
          <td>${esc(p.name)}</td>
          <td class="${p.stock === 0 ? 'stock-out' : 'stock-low'}">${p.stock} máy</td>
          <td>${p.stock === 0 ? 'Hết hàng' : 'Sắp hết'}</td></tr>`).join('')}</tbody></table></div>`
        : '<div class="empty">Tất cả sản phẩm còn đủ tồn kho.</div>'}
    </div>`;
}
/* ------------------------------ Đơn hàng ------------------------------ */
function viewOrders() {
  const tabs = [['', 'Tất cả']].concat(Object.keys(STATUS_LABEL).map((k) => [k, STATUS_LABEL[k]]));
  const list = state.orders.filter((o) => !state.orderFilter || o.status === state.orderFilter);

  return head('Đơn hàng', 'Đơn khách vừa đặt xuất hiện ngay tại đây — không cần tải lại trang.') +
    `<div class="panel">
      <div class="toolbar">
        ${tabs.map(([k, label]) => {
          const n = k ? state.orders.filter((o) => o.status === k).length : state.orders.length;
          return `<button class="btn sm ${state.orderFilter === k ? '' : 'ghost'}"
            onclick="setOrderFilter('${k}')">${label} (${n})</button>`;
        }).join('')}
      </div>
      ${list.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th>
          <th>Ngày đặt</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
        <tbody>${list.map((o) => `<tr>
          <td class="mono">${esc(o.code)}</td>
          <td>${esc(o.customerName)}<br><span class="muted">${esc(o.customerPhone)}</span></td>
          <td>${o.items.map((i) => esc(i.productName) + ' ×' + i.quantity).join('<br>')}</td>
          <td><b>${money(o.totalAmount)}</b></td>
          <td>${fmtDate(o.createdAt)}</td>
          <td>${pill(o.status)}</td>
          <td class="actions">${orderActions(o)}</td>
        </tr>`).join('')}</tbody></table></div>`
      : '<div class="empty">Không có đơn hàng nào.</div>'}
    </div>`;
}

function orderActions(o) {
  const btn = (status, label, cls) =>
    `<button class="btn sm ${cls}" onclick="changeStatus(${o.id},'${status}')">${label}</button>`;
  if (o.status === 'pending') {
    return btn('approved', 'Duyệt', 'ok') + btn('rejected', 'Từ chối', 'danger');
  }
  if (o.status === 'approved') return btn('shipping', 'Giao hàng', '') + btn('rejected', 'Huỷ', 'danger');
  if (o.status === 'shipping') return btn('delivered', 'Đã giao', 'ok');
  return '<span class="muted" style="font-size:12px">Đã kết thúc</span>';
}

function setOrderFilter(k) {
  state.orderFilter = k;
  render();
}

async function changeStatus(id, status) {
  const order = state.orders.find((o) => o.id === id);
  const label = STATUS_LABEL[status] || status;
  if (status === 'rejected') return rejectOrder(id);
  if (!confirm(`Chuyển đơn ${order ? order.code : id} sang "${label}"?`)) return;
  try {
    const updated = await api(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } });
    const i = state.orders.findIndex((o) => o.id === id);
    if (i >= 0) state.orders[i] = updated;
    toast(`Đơn ${updated.code} → ${label}`);
    render();
  } catch (ex) { toast(ex.message); }
}

async function rejectOrder(id) {
  const order = state.orders.find((o) => o.id === id);
  const reason = prompt(`Lý do từ chối đơn ${order ? order.code : id} (không bắt buộc):`);
  if (reason === null) return;
  try {
    const updated = await api(`/admin/orders/${id}/status`, {
      method: 'PUT', body: { status: 'rejected', note: reason }
    });
    const i = state.orders.findIndex((o) => o.id === id);
    if (i >= 0) state.orders[i] = updated;
    toast(`Đã huỷ đơn ${updated.code} — tồn kho đã được cộng trả.`);
    render();
    /* Tồn kho đổi -> nạp lại để dashboard hiển thị đúng */
    if (state.products.length) {
      api('/admin/products').then((d) => { state.products = d; });
    }
  } catch (ex) { toast(ex.message); }
}
/* ------------------------------ Sản phẩm ------------------------------ */
function viewProducts() {
  const list = state.products;
  const totalVariants = list.reduce((s, p) => s + (p.variants || []).length, 0);

  return head('Sản phẩm & kho', 'Mỗi dòng máy có nhiều biến thể (dung lượng × màu), mỗi biến thể có giá và tồn kho riêng.') +
    `<div class="panel">
      <div class="toolbar">
        <button class="btn" onclick="openProductForm()">+ Thêm sản phẩm</button>
        <span class="count">${list.length} dòng máy · ${totalVariants} biến thể</span>
      </div>
      ${list.length ? list.map((p) => productCard(p)).join('')
        : '<div class="empty">Chưa có sản phẩm nào.</div>'}
    </div>`;
}

function productCard(p) {
  const variants = p.variants || [];
  const active = variants.filter((v) => v.status === 'active');
  const stock = active.reduce((s, v) => s + v.stock, 0);

  const rows = variants.map((v) => `<tr>
    <td>${esc(v.memory)}</td>
    <td>${esc(v.color) || '<span class="muted">—</span>'}</td>
    <td><input class="cell-num" type="number" min="0" step="10000" value="${v.salePrice}"
         onchange="saveVariant(${v.id}, this.value, null)"></td>
    <td class="muted">${money(v.price)}</td>
    <td><input class="cell-num" type="number" min="0" value="${v.stock}"
         onchange="saveVariant(${v.id}, null, this.value)"
         class="${v.stock === 0 ? 'stock-out' : v.stock <= 5 ? 'stock-low' : ''}"></td>
    <td>${v.stock === 0 ? '<span class="pill rejected">Hết hàng</span>'
        : v.stock <= 5 ? '<span class="pill pending">Sắp hết</span>'
        : '<span class="pill delivered">Còn hàng</span>'}</td>
  </tr>`).join('');

  return `<div class="prod-block">
    <div class="prod-head">
      <div>
        <b>${esc(p.name)}</b>
        <span class="muted"> · ${esc(p.brand)} · #${p.id}</span>
        <div class="muted" style="font-size:12px;margin-top:3px">
          ${variants.length} biến thể · tổng ${stock} máy ·
          ${money(p.salePrice)}–${money(p.price)}
        </div>
      </div>
      <div class="actions">
        <span class="pill ${p.status === 'active' ? 'active' : 'hidden'}">
          ${p.status === 'active' ? 'Đang bán' : 'Đã ẩn'}</span>
        <button class="btn sm ghost" onclick="openProductForm(${p.id})">Sửa</button>
        <button class="btn sm danger" onclick="removeProduct(${p.id})">Xoá</button>
      </div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Dung lượng</th><th>Màu</th><th>Giá bán (₫)</th><th>Giá gốc</th>
        <th>Tồn kho</th><th>Trạng thái</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
  </div>`;
}

/* Sửa nhanh một biến thể — giá hoặc tồn kho */
async function saveVariant(variantId, price, stock) {
  const body = {};
  if (price !== null && price !== undefined) body.salePrice = Number(price);
  if (stock !== null && stock !== undefined) body.stock = Number(stock);

  try {
    const updated = await api('/admin/variants/' + variantId, { method: 'PUT', body });
    const i = state.products.findIndex((p) => p.id === updated.id);
    if (i >= 0) state.products[i] = updated;
    toast('Đã cập nhật. Website khách đã nhận thay đổi.');
    render();
  } catch (ex) {
    toast(ex.message);
    refresh();
  }
}

function openProductForm(id) {
  const p = id ? state.products.find((x) => x.id === id) : null;
  const opts = state.categories.map((c) =>
    `<option value="${c.id}" ${p && p.categoryId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  const specs = p ? JSON.stringify(p.specs || {}, null, 2) : '{\n  "screen": "",\n  "chip": "",\n  "battery": ""\n}';

  $('dlgTitle').firstChild.textContent = p ? 'Sửa sản phẩm' : 'Thêm sản phẩm';
  $('dlgBody').innerHTML = `
    <div class="field"><label>Tên máy *</label>
      <input id="fName" value="${esc(p ? p.name : '')}" placeholder="iPhone 17 Pro Max"></div>
    <div class="grid2">
      <div class="field"><label>Thương hiệu *</label>
        <input id="fBrand" value="${esc(p ? p.brand : 'Apple')}"></div>
      <div class="field"><label>Danh mục *</label>
        <select id="fCat">${opts}</select></div>
    </div>
    <div class="field"><label>Hình ảnh đại diện</label>
      <input id="fImage" value="${esc(p ? p.image : 'images/ip17-den-1.jpg')}"></div>
    <div class="field">
      <label>Biến thể (dung lượng × màu) *</label>
      <div id="variantRows"></div>
      <button type="button" class="btn sm ghost" style="margin-top:8px" onclick="addVariantRow()">
        + Thêm biến thể</button>
    </div>
    <div class="field"><label>Thông số kỹ thuật (JSON)</label>
      <textarea id="fSpecs">${esc(specs)}</textarea></div>`;

  /* Nạp sẵn các biến thể hiện có */
  variantDraft = p && p.variants && p.variants.length
    ? p.variants.map((v) => ({ ...v }))
    : [{ memory: '128GB', color: '', price: 0, salePrice: 0, stock: 0 }];
  renderVariantRows();

  $('dlgFoot').innerHTML =
    `<button class="btn ghost" onclick="closeDialog()">Huỷ</button>
     <button class="btn" onclick="saveProduct(${p ? p.id : 'null'})">Lưu</button>`;
  $('overlay').classList.add('open');
}

/* Bản nháp biến thể đang sửa trong form */
let variantDraft = [];

function renderVariantRows() {
  const box = $('variantRows');
  if (!box) return;
  box.innerHTML = variantDraft.map((v, i) => `
    <div class="variant-row">
      <input placeholder="Dung lượng" value="${esc(v.memory)}" oninput="variantDraft[${i}].memory=this.value">
      <input placeholder="Màu" value="${esc(v.color)}" oninput="variantDraft[${i}].color=this.value">
      <input type="number" min="0" placeholder="Giá bán" value="${v.salePrice || ''}"
        oninput="variantDraft[${i}].salePrice=Number(this.value)">
      <input type="number" min="0" placeholder="Giá gốc" value="${v.price || ''}"
        oninput="variantDraft[${i}].price=Number(this.value)">
      <input type="number" min="0" placeholder="Tồn" value="${v.stock || 0}"
        oninput="variantDraft[${i}].stock=Number(this.value)">
      <button type="button" class="btn sm danger" onclick="removeVariantRow(${i})">×</button>
    </div>`).join('');
}

function addVariantRow() {
  variantDraft.push({ memory: '', color: '', price: 0, salePrice: 0, stock: 0 });
  renderVariantRows();
}

function removeVariantRow(i) {
  variantDraft.splice(i, 1);
  renderVariantRows();
}

async function saveProduct(id) {
  let specs;
  try { specs = JSON.parse($('fSpecs').value || '{}'); }
  catch (_) { return toast('Thông số kỹ thuật phải là JSON hợp lệ.'); }

  const variants = variantDraft.filter((v) => v.memory && v.memory.trim());
  if (!variants.length) return toast('Cần ít nhất một biến thể có dung lượng.');

  const body = {
    name: $('fName').value.trim(),
    brand: $('fBrand').value.trim(),
    categoryId: Number($('fCat').value),
    image: $('fImage').value.trim(),
    specs,
    variants: variants.map((v) => ({
      id: v.id,
      memory: v.memory.trim(),
      color: (v.color || '').trim(),
      price: Number(v.price) || Number(v.salePrice) || 0,
      salePrice: Number(v.salePrice) || Number(v.price) || 0,
      stock: Number(v.stock) || 0,
      image: v.image || ''
    }))
  };
  if (!body.name || !body.brand) return toast('Vui lòng nhập tên và thương hiệu.');

  try {
    if (id) {
      const updated = await api('/admin/products/' + id, { method: 'PUT', body });
      const i = state.products.findIndex((x) => x.id === id);
      if (i >= 0) state.products[i] = updated;
      toast('Đã cập nhật ' + updated.name);
    } else {
      const created = await api('/admin/products', { method: 'POST', body });
      state.products.unshift(created);
      toast('Đã thêm ' + created.name);
    }
    closeDialog();
    render();
  } catch (ex) { toast(ex.message); }
}

async function removeProduct(id) {
  const p = state.products.find((x) => x.id === id);
  if (!p) return;
  if (!confirm(`Xoá sản phẩm "${p.name}"?`)) return;
  try {
    const r = await api('/admin/products/' + id, { method: 'DELETE' });
    state.products = state.products.filter((x) => x.id !== id);
    toast(r.softDeleted
      ? 'Sản phẩm đã có trong đơn hàng nên chỉ bị ẩn khỏi website.'
      : 'Đã xoá ' + p.name);
    render();
  } catch (ex) { toast(ex.message); }
}
/* ------------------------------ Khách hàng ------------------------------ */
function viewCustomers() {
  const list = state.customers;
  return head('Khách hàng', 'Tài khoản đăng ký từ website hiện tại đây ngay khi khách hoàn tất đăng ký.') +
    `<div class="panel">
      <div class="toolbar">
        <input type="search" placeholder="Tìm theo tên / email / số điện thoại"
               value="${esc(state.search.customers)}"
               oninput="state.search.customers=this.value;renderCustomersTable()">
        <span class="count">${list.length} khách hàng</span>
      </div>
      <div id="custTable">${customersTable()}</div>
    </div>`;
}

function customersTable() {
  const q = state.search.customers.trim().toLowerCase();
  const list = state.customers.filter((u) => !q ||
    u.fullName.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.phone.includes(q));

  if (!list.length) return '<div class="empty">Không tìm thấy khách hàng phù hợp.</div>';

  return `<div class="table-wrap"><table>
    <thead><tr><th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Địa chỉ</th>
      <th>Đơn</th><th>Chi tiêu</th><th>Ngày tạo</th><th>Trạng thái</th><th></th></tr></thead>
    <tbody>${list.map((u) => `<tr>
      <td><b>${esc(u.fullName)}</b></td>
      <td>${esc(u.email)}</td>
      <td>${esc(u.phone)}</td>
      <td style="max-width:220px">${esc(u.address) || '<span class="muted">—</span>'}</td>
      <td>${u.orderCount}</td>
      <td>${money(u.totalSpent)}</td>
      <td>${fmtDate(u.createdAt)}</td>
      <td><span class="pill ${u.status}">${u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</span></td>
      <td class="actions">
        <button class="btn sm ${u.status === 'active' ? 'danger' : 'ok'}"
          onclick="toggleCustomer(${u.id},'${u.status}')">
          ${u.status === 'active' ? 'Khóa' : 'Mở khóa'}</button>
      </td></tr>`).join('')}</tbody></table></div>`;
}

function renderCustomersTable() {
  const box = $('custTable');
  if (box) box.innerHTML = customersTable();
}

async function toggleCustomer(id, current) {
  const next = current === 'active' ? 'locked' : 'active';
  const user = state.customers.find((u) => u.id === id);
  const verb = next === 'locked' ? 'khóa' : 'mở khóa';
  if (!confirm(`${verb[0].toUpperCase() + verb.slice(1)} tài khoản của ${user ? user.fullName : id}?`)) return;
  try {
    const updated = await api(`/admin/customers/${id}/status`, { method: 'PUT', body: { status: next } });
    const i = state.customers.findIndex((u) => u.id === id);
    if (i >= 0) state.customers[i] = updated;
    toast(`Đã ${verb} tài khoản ${updated.fullName}.`);
    render();
  } catch (ex) { toast(ex.message); }
}

/* ------------------------------ Modal ------------------------------ */
function closeDialog() {
  $('overlay').classList.remove('open');
}

/* ------------------------------ Khởi động ------------------------------ */
$('loginForm').addEventListener('submit', doLogin);
$('overlay').addEventListener('click', (e) => { if (e.target === $('overlay')) closeDialog(); });

if (token() && currentAdmin()) bootApp();
