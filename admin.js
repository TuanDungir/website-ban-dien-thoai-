/* ================= Logic trang quản trị ================= */

let adminTab = 'dashboard';
let orderFilter = 'Tất cả';
let orderSearch = '';
let productSearch = '';
let custSearch = '';
let auditFilter = '';

const NAV = [
  { key: 'dashboard', icon: '▦', label: 'Tổng quan' },
  { key: 'orders', icon: '🧾', label: 'Đơn hàng' },
  { key: 'products', icon: '📦', label: 'Sản phẩm & kho' },
  { key: 'customers', icon: '👤', label: 'Khách hàng' },
  { key: 'audit', icon: '🗂', label: 'Nhật ký hoạt động' },
  { key: 'staff', icon: '🛡', label: 'Tài khoản quản trị' },
  { key: 'settings', icon: '⚙', label: 'Bảo mật & cấu hình' }
];

/* ---------- Tiện ích ---------- */
function adMoney(n) { return Number(n || 0).toLocaleString('vi-VN') + '₫'; }
function adDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function adEsc(s) {
  return String(s == null ? '' : s).split('&').join('&amp;').split('<').join('&lt;')
    .split('>').join('&gt;').split('"').join('&quot;').split("'").join('&#39;');
}
function orderPill(status) {
  const map = {
    'Chờ thanh toán': 'cancel', 'Chờ duyệt': 'wait', 'Đang đóng gói': 'pack',
    'Đang giao': 'ship', 'Đã giao': 'done', 'Từ chối': 'rej', 'Đã huỷ': 'cancel'
  };
  return '<span class="pill ' + (map[status] || 'wait') + '">' + status + '</span>';
}
function stockPill(p) {
  const s = adStockState(p);
  return '<span class="pill ' + s.key + '">' + s.label + '</span>';
}

/* ---------- Khung trang ---------- */
function adBoot() {
  adSeed();
  const acc = adCurrent();
  if (!acc) { location.replace('admin-login.html'); return; }

  /* Phiên hết hạn sau N phút không thao tác */
  const timeout = (adSettings().sessionTimeoutMin || 20) * 60000;
  const last = Number(localStorage.getItem('tgdd_admin_last_active') || Date.now());
  if (Date.now() - last > timeout) {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    location.replace('admin-login.html');
    return;
  }
  if (!window.__adActivityBound) {
    window.__adActivityBound = true;
    ['click', 'keydown', 'mousemove'].forEach(ev =>
      document.addEventListener(ev, () => localStorage.setItem('tgdd_admin_last_active', Date.now()), { passive: true }));
  }

  adSyncNow();
  adRenderSide(acc);
  adRender();

  /* Tự đồng bộ lại mỗi 15 giây và mỗi khi quay lại tab, để đơn khách vừa đặt hiện ngay */
  if (!window.__adSyncBound) {
    window.__adSyncBound = true;
    setInterval(() => { adSyncNow(); if (adminTab === 'orders' || adminTab === 'dashboard') { adRenderSide(adCurrent()); adRender(); } }, 15000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { adSyncNow(); adRenderSide(adCurrent()); adRender(); }
    });
  }
}

/* Nút đồng bộ thủ công trên thanh công cụ */
function adManualSync() {
  const r = adSyncNow();
  showToast(r.added ? 'Đã đồng bộ ' + r.added + ' đơn mới từ khách hàng.' : 'Không có đơn mới. ' + r.pending + ' đơn đang chờ duyệt.');
  adRenderSide(adCurrent());
  adRender();
}

/* Khối cảnh báo chung: hiện khi trình duyệt chặn lưu dữ liệu */
function adStorageWarning() {
  if (adStorageOk()) return '';
  return '<div class="panel-adm" style="border-color:#fda29b;background:#fef3f2">' +
    '<div class="detail-block" style="color:#b42318;font-size:13.5px">' +
    '<b>⚠ Trình duyệt đang chặn lưu dữ liệu (localStorage).</b><br>' +
    'Đơn hàng của khách và thay đổi của admin sẽ không được lưu. ' +
    'Hãy mở website qua địa chỉ <span class="mono">http://localhost</span> (chạy <span class="mono">python -m http.server 8000</span>) ' +
    'thay vì mở trực tiếp file, và tắt chế độ ẩn danh.' +
    '</div></div>';
}

function adRenderSide(acc) {
  acc = acc || adCurrent();
  if (!acc) return;
  const perms = ROLE_PERMS[acc.role] || [];
  const nav = document.getElementById('admNav');
  const userBox = document.getElementById('admUser');
  if (!nav || !userBox) return;

  nav.innerHTML = NAV
    .filter(n => perms.includes(n.key))
    .map(n => '<a class="' + (adminTab === n.key ? 'active' : '') + '" onclick="adGo(\'' + n.key + '\')">' +
      '<span class="ico">' + n.icon + '</span>' + n.label + '</a>').join('');

  const pending = adOrders().filter(o => o.status === 'Chờ duyệt').length;
  const badge = nav.querySelector('a[onclick*="orders"]');
  if (badge && pending) badge.innerHTML += '<span class="chip-n">' + pending + '</span>';

  userBox.innerHTML =
    '<b>' + adEsc(acc.name) + '</b>' +
    '<span class="role">' + ROLE_NAMES[acc.role] + ' · ' + acc.staffId + '</span>' +
    '<div>Đăng nhập cuối: ' + adDate(acc.lastLoginAt) + '</div>' +
    '<div>IP: ' + (acc.lastIp || '—') + '</div>' +
    '<button onclick="adLogout()">Đăng xuất</button>';
}

function adGo(tab) {
  if (!adCan(tab)) { showToast('Vai trò của bạn không có quyền truy cập mục này.'); return; }
  adminTab = tab;
  adRenderSide(adCurrent());
  adRender();
  window.scrollTo({ top: 0 });
}

function adLogout() {
  adLog('Đăng xuất', 'Kết thúc phiên làm việc');
  localStorage.removeItem(ADMIN_SESSION_KEY);
  location.href = 'admin-login.html';
}

function adRender() {
  const box = document.getElementById('admMain');
  if (!box) return;
  /* Không có quyền với tab hiện tại thì lùi về tab đầu tiên được phép */
  if (!adCan(adminTab)) adminTab = (ROLE_PERMS[(adCurrent() || {}).role] || ['dashboard'])[0];
  /* Giữ nguyên ô đang gõ: dựng lại innerHTML sẽ phá hủy phần tử đang focus
     (nếu không khôi phục, người dùng chỉ gõ được 1 ký tự rồi bị mất focus). */
  const keep = adFocusSnapshot(box);

  if (adminTab === 'dashboard') box.innerHTML = adViewDashboard();
  else if (adminTab === 'orders') box.innerHTML = adViewOrders();
  else if (adminTab === 'products') box.innerHTML = adViewProducts();
  else if (adminTab === 'customers') box.innerHTML = adViewCustomers();
  else if (adminTab === 'audit') box.innerHTML = adViewAudit();
  else if (adminTab === 'staff') box.innerHTML = adViewStaff();
  else if (adminTab === 'settings') box.innerHTML = adViewSettings();

  adFocusRestore(keep);
}

/* Ghi nhớ ô đang focus (id + vị trí con trỏ) trước khi dựng lại giao diện */
function adFocusSnapshot(box) {
  const el = document.activeElement;
  if (!el || !box || !box.contains(el) || !el.id) return null;
  if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return null;
  let caret = null;
  try { caret = el.selectionStart; } catch (e) { caret = null; }
  return { id: el.id, caret };
}

function adFocusRestore(snap) {
  if (!snap) return;
  const el = document.getElementById(snap.id);
  if (!el) return;
  el.focus();
  if (snap.caret != null) {
    try { el.setSelectionRange(snap.caret, snap.caret); } catch (e) {}
  }
}

/* Vẽ lại chỉ phần kết quả của một mục, giữ nguyên ô tìm kiếm đang gõ */
function adRepaint(containerId, html) {
  const box = document.getElementById(containerId);
  if (box) box.innerHTML = html;
}

/* Bốn ô tìm kiếm đều đi qua đây: cập nhật trạng thái rồi chỉ vẽ lại phần kết quả */
function adSearchInput(kind, value) {
  if (kind === 'orders') {
    orderSearch = value;
    adRepaint('adOrdersResults', adOrdersResults());
    const c = document.getElementById('adOrdersCount');
    if (c) c.innerHTML = adOrdersCountText();
  } else if (kind === 'products') {
    productSearch = value;
    adRepaint('adProductsResults', adProductsResults());
    const c = document.getElementById('adProductsCount');
    if (c) c.textContent = adProductsCountText();
  } else if (kind === 'customers') {
    custSearch = value;
    adRepaint('adCustomersResults', adCustomersResults());
    const c = document.getElementById('adCustomersCount');
    if (c) c.textContent = adCustomersCountText();
  } else if (kind === 'audit') {
    auditFilter = value;
    adRepaint('adAuditResults', adAuditResults());
    const c = document.getElementById('adAuditCount');
    if (c) c.textContent = adAuditCountText();
  }
}

/* ---------- Tổng quan ---------- */
function adViewDashboard() {
  const orders = adOrders();
  const catalog = adCatalog();
  const todayKey = new Date().toDateString();
  const revenue = s => orders.filter(o => REVENUE_STATUSES.includes(o.status) && s(o))
    .reduce((t, o) => t + Number(o.total || 0), 0);
  const revToday = revenue(o => new Date(o.createdAt).toDateString() === todayKey);
  const revWeek = revenue(o => (Date.now() - new Date(o.createdAt)) < 7 * 86400000);
  const revMonth = revenue(o => (Date.now() - new Date(o.createdAt)) < 30 * 86400000);
  const pending = orders.filter(o => o.status === 'Chờ duyệt');
  const lowStock = catalog.filter(p => ['low', 'out'].includes(adStockState(p).key));

  /* Top bán chạy: đếm số dòng đơn đã duyệt theo sản phẩm */
  const sold = {};
  orders.filter(o => REVENUE_STATUSES.includes(o.status)).forEach(o => {
    sold[o.items] = (sold[o.items] || 0) + (o.qty || 1);
  });
  const top = Object.keys(sold).sort((a, b) => sold[b] - sold[a]).slice(0, 5);

  const stat = (k, v, s, cls) => '<div class="stat"><div class="k">' + k + '</div><div class="v">' + v +
    '</div><div class="s ' + (cls || '') + '">' + s + '</div></div>';

  const waiting = orders.filter(o => o.status === 'Chờ thanh toán').length;

  return '<div class="adm-head"><div><h1>Tổng quan</h1><p>Cập nhật lúc ' + adDate(new Date().toISOString()) + '</p></div>' +
    '<form class="adm-search" onsubmit="return adGlobalSearch(event)">' +
    '<input id="globalQ" placeholder="Tìm mã đơn, SĐT khách, IMEI, tên máy…">' +
    '<button type="submit">Tìm</button></form></div>' +
    adStorageWarning() +
    '<div class="stat-grid">' +
    stat('Doanh thu hôm nay', adMoney(revToday), 'Đơn đã duyệt trong ngày') +
    stat('Doanh thu 7 ngày', adMoney(revWeek), '7 ngày gần nhất', 'up') +
    stat('Doanh thu 30 ngày', adMoney(revMonth), '30 ngày gần nhất') +
    stat('Đơn chờ duyệt', pending.length + ' đơn', pending.length ? 'Cần xử lý gấp' : 'Không còn đơn tồn', pending.length ? 'down' : 'up') +
    '</div>' +
    '<p style="font-size:12.5px;color:#98a2b3;margin:-6px 0 16px">Doanh thu chỉ tính đơn đã được duyệt (Đang đóng gói / Đang giao / Đã giao). ' +
    'Đơn chờ duyệt, bị từ chối hoặc chưa thanh toán không được tính.' +
    (waiting ? ' Hiện có ' + waiting + ' đơn chờ thanh toán.' : '') + '</p>' +
    '<div class="two-col">' +
    '<div class="panel-adm"><h2>Đơn mới cần xử lý</h2>' +
    (pending.length ? '<div class="table-wrap"><table class="adm-t"><thead><tr><th>Mã đơn</th><th>Khách</th><th>Sản phẩm</th><th>Tổng</th><th></th></tr></thead><tbody>' +
      pending.slice(0, 6).map(o => '<tr><td class="mono">' + o.code + '</td><td>' + adEsc(o.customerName) + '<br><span style="color:#98a2b3">' + o.customerPhone + '</span></td>' +
        '<td>' + adEsc(o.items) + '</td><td><b>' + adMoney(o.total) + '</b></td>' +
        '<td><button class="btn-s primary" onclick="adApprove(\'' + o.id + '\')">Duyệt</button></td></tr>').join('') +
      '</tbody></table></div>' : '<div class="empty-adm">Không có đơn nào chờ duyệt.</div>') + '</div>' +
    '<div class="panel-adm"><h2>Cảnh báo tồn kho</h2>' +
    (lowStock.length ? '<div class="table-wrap"><table class="adm-t"><thead><tr><th>Mẫu máy</th><th>Tồn</th><th>Trạng thái</th></tr></thead><tbody>' +
      lowStock.map(p => '<tr><td>' + adEsc(p.name) + '</td><td><b>' + adTotalStock(p) + '</b></td><td>' + stockPill(p) + '</td></tr>').join('') +
      '</tbody></table></div>' : '<div class="empty-adm">Tất cả mặt hàng còn đủ tồn kho.</div>') + '</div>' +
    '</div>' +
    '<div class="panel-adm"><h2>Top dòng điện thoại bán chạy</h2>' +
    (top.length ? '<div class="table-wrap"><table class="adm-t"><thead><tr><th>#</th><th>Sản phẩm</th><th>Đã bán</th></tr></thead><tbody>' +
      top.map((name, i) => '<tr><td>' + (i + 1) + '</td><td>' + adEsc(name) + '</td><td><b>' + sold[name] + '</b> máy</td></tr>').join('') +
      '</tbody></table></div>' : '<div class="empty-adm">Chưa có đơn nào được duyệt.</div>') + '</div>';
}

/* Tìm kiếm nhanh toàn hệ thống: mã đơn / SĐT / tên máy */
function adGlobalSearch(e) {
  e.preventDefault();
  const q = document.getElementById('globalQ').value.trim();
  if (!q) return false;
  const orders = adOrders();
  const hit = orders.find(o => o.code.toLowerCase().includes(q.toLowerCase()) || o.customerPhone.includes(q) ||
    o.customerName.toLowerCase().includes(q.toLowerCase()));
  if (hit) {
    orderSearch = q;
    adminTab = 'orders';
    adRenderSide(adCurrent());
    adRender();
    return false;
  }
  const p = adCatalog().find(x => x.name.toLowerCase().includes(q.toLowerCase()));
  if (p) {
    productSearch = q;
    adminTab = 'products';
    adRenderSide(adCurrent());
    adRender();
    return false;
  }
  const c = adSearchCustomers(q);
  if (c.length) {
    custSearch = q;
    adminTab = 'customers';
    adRenderSide(adCurrent());
    adRender();
    return false;
  }
  showToast('Không tìm thấy kết quả cho "' + q + '".');
  return false;
}

/* ---------- Đơn hàng ---------- */
function adFilteredOrders() {
  const q = orderSearch.trim().toLowerCase();
  return adOrders().filter(o => {
    const okStatus = orderFilter === 'Tất cả' || o.status === orderFilter;
    const okQ = !q || o.code.toLowerCase().includes(q) || o.customerPhone.includes(q) ||
      o.customerName.toLowerCase().includes(q.toLowerCase()) || o.items.toLowerCase().includes(q);
    return okStatus && okQ;
  });
}

function adViewOrders() {
  return '<div class="adm-head"><div><h1>Đơn hàng</h1><p>Mã đơn theo hãng: IP = iPhone/Apple, SA = Samsung, XI = Xiaomi, OP = OPPO, VI = Vivo, RE = realme. Đơn khách vừa đặt tự hiện ở đây.</p></div>' +
    '<button class="btn-s primary" onclick="adManualSync()">↻ Đồng bộ đơn khách</button></div>' +
    adStorageWarning() +
    '<div class="adm-tabs">' + adOrderTabs() + '</div>' +
    '<div class="panel-adm"><div class="toolbar-adm">' +
    '<input id="adOrdersSearch" placeholder="Tìm mã đơn / SĐT / tên khách / máy" value="' + adEsc(orderSearch) + '" ' +
    'oninput="adSearchInput(\'orders\', this.value)" style="min-width:280px" autocomplete="off">' +
    '<span class="count" id="adOrdersCount">' + adOrdersCountText() + '</span></div>' +
    '<div id="adOrdersResults">' + adOrdersResults() + '</div>' +
    '</div>' + adOrderDetailHtml();
}

function adOrderTabs() {
  const all = adOrders();
  return ['Tất cả'].concat(ORDER_STATUSES_ADMIN).map(s => {
    const n = s === 'Tất cả' ? all.length : all.filter(o => o.status === s).length;
    return '<button class="' + (orderFilter === s ? 'active' : '') + '" onclick="adSetOrderFilter(\'' + s + '\')">' +
      s + ' (' + n + ')</button>';
  }).join('');
}

function adOrdersCountText() {
  return adFilteredOrders().length + ' đơn · đồng bộ lần cuối ' +
    adDate(localStorage.getItem('tgdd_admin_last_sync'));
}

/* Chỉ phần bảng đơn hàng — tách riêng để gõ tìm kiếm không phải dựng lại cả trang */
function adOrdersResults() {
  const list = adFilteredOrders();
  return list.length ? '<div class="table-wrap"><table class="adm-t"><thead><tr>' +
    '<th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Ngày đặt</th><th>Trạng thái</th><th>Xử lý</th>' +
    '</tr></thead><tbody>' + list.map(o => '<tr>' +
      '<td class="mono">' + o.code + '<br><button class="btn-s" style="margin-top:5px" onclick="adOpenOrder(\'' + o.id + '\')">Chi tiết</button></td>' +
      '<td>' + adEsc(o.customerName) + '<br><span style="color:#98a2b3">' + o.customerPhone + '</span></td>' +
      '<td>' + adEsc(o.items) + '<br><span style="color:#98a2b3">SL: ' + (o.qty || 1) + '</span></td>' +
      '<td><b>' + adMoney(o.total) + '</b></td>' +
      '<td>' + adDate(o.createdAt) + '</td>' +
      '<td>' + orderPill(o.status) + '</td>' +
      '<td><div class="row-actions">' +
        (o.status === 'Chờ duyệt'
          ? '<button class="btn-s ok" onclick="adApprove(\'' + o.id + '\')">Duyệt</button>' +
            '<button class="btn-s danger" onclick="adReject(\'' + o.id + '\')">Từ chối</button>'
          : '') +
        (o.status === 'Đang đóng gói' ? '<button class="btn-s primary" onclick="adAdvance(\'' + o.id + '\')">Giao vận chuyển</button>' : '') +
        (o.status === 'Đang giao' ? '<button class="btn-s primary" onclick="adAdvance(\'' + o.id + '\')">Xác nhận đã giao</button>' : '') +
        (['Đã giao', 'Từ chối', 'Đã huỷ'].includes(o.status) ? '<span style="color:#98a2b3;font-size:12px">Đã kết thúc</span>' : '') +
      '</div></td></tr>').join('') +
    '</tbody></table></div>' : '<div class="empty-adm">Không có đơn hàng nào phù hợp.</div>';
}

/* ---------- Chi tiết đơn: đầy đủ thông tin khách ---------- */
let openOrderId = null;

function adOpenOrder(id) {
  openOrderId = id;
  adminTab = 'orders';
  adRenderSide(adCurrent());
  adRender();
  const box = document.getElementById('orderDetail');
  if (box) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function adCloseOrder() { openOrderId = null; adRender(); }

function adOrderDetailHtml() {
  if (!openOrderId) return '';
  const o = adOrders().find(x => x.id === openOrderId);
  if (!o) return '';
  const u = tgddUsers().find(x => x.id === o.customerId) || tgddUsers().find(x => x.phone === o.customerPhone);
  const addr = o.address || null;
  const addrText = adAddressText(addr);
  const lines = (o.itemLines && o.itemLines.length)
    ? '<div class="table-wrap"><table class="adm-t"><thead><tr><th>Sản phẩm</th><th>Dung lượng</th><th>Màu</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>' +
      o.itemLines.map(l => '<tr><td>' + adEsc(l.name) + '</td><td>' + adEsc(l.mem) + '</td><td>' + adEsc(l.color || '—') + '</td>' +
        '<td>' + l.qty + '</td><td>' + adMoney(l.price) + '</td><td><b>' + adMoney(l.price * l.qty) + '</b></td></tr>').join('') +
      '</tbody></table></div>'
    : '<p style="font-size:13.5px;margin:0">' + adEsc(o.items) + '</p>';

  return '<div class="panel-adm" id="orderDetail" style="border:2px solid #1685ff33">' +
    '<h2 style="display:flex;justify-content:space-between;align-items:center">Đơn ' + o.code + ' ' + orderPill(o.status) +
    '<button class="btn-s" onclick="adCloseOrder()">Đóng</button></h2>' +
    '<div class="two-col" style="padding:16px 17px">' +
    '<div>' +
      '<h3 style="font-size:14px;margin:0 0 8px">Sản phẩm đặt mua</h3>' + lines +
      '<div class="kv" style="margin-top:12px">' +
      '<div><span>Tạm tính</span><span>' + adMoney(o.subtotal || o.total) + '</span></div>' +
      (o.discount ? '<div><span>Giảm giá' + (o.voucher ? ' (' + adEsc(o.voucher) + ')' : '') + '</span><span>−' + adMoney(o.discount) + '</span></div>' : '') +
      '<div><span>Phí giao hàng</span><span>' + adMoney(o.shippingFee || 0) + '</span></div>' +
      '<div><span><b>Tổng thanh toán</b></span><span><b>' + adMoney(o.total) + '</b></span></div>' +
      '</div>' +
    '</div>' +
    '<div>' +
      '<h3 style="font-size:14px;margin:0 0 8px">Thông tin khách hàng</h3>' +
      '<div class="kv">' +
      '<div><span>Họ tên</span><span>' + adEsc(o.customerName) + '</span></div>' +
      '<div><span>Số điện thoại</span><span>' + adEsc(o.customerPhone) + '</span></div>' +
      '<div><span>Email</span><span>' + adEsc(o.customerEmail || '—') + '</span></div>' +
      '<div><span>Mã khách hàng</span><span class="mono">' + (u ? u.id : '—') + '</span></div>' +
      '<div><span>Ngày tạo tài khoản</span><span>' + (u ? adDate(u.createdAt) : '—') + '</span></div>' +
      '<div><span>Giới tính</span><span>' + (u ? (u.gender || '—') : '—') + '</span></div>' +
      '<div><span>Ngày sinh</span><span>' + (u ? (u.birth || '—') : '—') + '</span></div>' +
      '<div><span>Người nhận</span><span>' + (addr ? adEsc(addr.name) + ' · ' + adEsc(addr.phone) : '—') + '</span></div>' +
      '<div><span>Địa chỉ giao</span><span>' + adEsc(addrText) + '</span></div>' +
      '<div><span>Phương thức thanh toán</span><span>' + (o.payMethod === 'cod' ? 'Thanh toán khi nhận hàng' : o.payMethod === 'deposit' ? 'Cọc 50% chuyển khoản' : 'Chuyển khoản / QR') + '</span></div>' +
      '<div><span>Ngày đặt</span><span>' + adDate(o.createdAt) + '</span></div>' +
      '<div><span>Cập nhật gần nhất</span><span>' + adDate(o.updatedAt || o.createdAt) + '</span></div>' +
      '<div><span>IP đặt hàng</span><span class="mono">' + adEsc(o.ip || '—') + '</span></div>' +
      (u ? '<div><span>Tổng chi tiêu</span><span>' + adMoney((u.orders || []).reduce((t, x) => t + Number(x.total || 0), 0)) + '</span></div>' : '') +
      (o.note ? '<div><span>Ghi chú admin</span><span>' + adEsc(o.note) + '</span></div>' : '') +
      '</div>' +
      (o.status === 'Chờ duyệt'
        ? '<div class="row-actions" style="margin-top:14px"><button class="btn-s ok" onclick="adApprove(\'' + o.id + '\')">Duyệt đơn</button>' +
          '<button class="btn-s danger" onclick="adReject(\'' + o.id + '\')">Từ chối</button></div>'
        : '') +
    '</div></div></div>';
}

function adSetOrderFilter(s) { orderFilter = s; adRender(); }

function adApprove(id) {
  const o = adSetOrderStatus(id, 'Đang đóng gói', 'Admin duyệt đơn');
  if (o) {
    showToast('Đã duyệt đơn ' + o.code + ' — chuyển sang Đang đóng gói, doanh thu đã ghi nhận.');
    adRenderSide(adCurrent());
    adRender();
  }
}
function adReject(id) {
  const reason = prompt('Lý do từ chối đơn (không bắt buộc):');
  if (reason === null) return;
  const o = adSetOrderStatus(id, 'Từ chối', reason || 'Admin từ chối đơn');
  if (o) {
    showToast('Đã từ chối đơn ' + o.code + ' — khách thấy trạng thái "Đã huỷ".');
    adRenderSide(adCurrent());
    adRender();
  }
}
function adAdvance(id) {
  const list = adOrders();
  const o = list.find(x => x.id === id);
  if (!o) return;
  const next = o.status === 'Đang đóng gói' ? 'Đang giao' : 'Đã giao';
  adSetOrderStatus(id, next, 'Cập nhật trạng thái');
  showToast('Đơn ' + o.code + ' → ' + next + '.');
  adRender();
}

/* ---------- Sản phẩm & kho ---------- */
function adViewProducts() {
  return '<div class="adm-head"><div><h1>Sản phẩm & kho hàng</h1><p>Chỉnh giá bán và số lượng tồn theo từng dung lượng. Ngưỡng cảnh báo mặc định: 5 máy.</p></div></div>' +
    '<div class="panel-adm"><div class="toolbar-adm">' +
    '<input id="adProductsSearch" placeholder="Tìm theo tên máy hoặc hãng" value="' + adEsc(productSearch) + '" ' +
    'oninput="adSearchInput(\'products\', this.value)" style="min-width:280px" autocomplete="off">' +
    '<span class="count" id="adProductsCount">' + adProductsCountText() + '</span></div>' +
    '<div id="adProductsResults">' + adProductsResults() + '</div></div>';
}

function adProductsCountText() {
  const q = productSearch.trim().toLowerCase();
  const n = adCatalog().filter(p => !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).length;
  return n + ' mẫu máy';
}

function adProductsResults() {
  const q = productSearch.trim().toLowerCase();
  const list = adCatalog().filter(p => !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));

  return '<div class="table-wrap"><table class="adm-t"><thead><tr>' +
    '<th>Mẫu máy</th><th>Hãng</th><th>Dung lượng</th><th>Giá bán</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th>' +
    '</tr></thead><tbody>' + list.map(p => {
      const cells = p.memory.map(m => '<div style="margin:4px 0;display:flex;gap:6px;align-items:center">' +
        '<span style="min-width:74px">' + adEsc(m) + '</span>' +
        '<input class="cell num" type="number" min="0" step="10000" value="' + (p.prices[m] || p.price) + '" onchange="adSetPrice(' + p.id + ',\'' + m + '\',this.value)">' +
        '<input class="cell num" type="number" min="0" value="' + (p.stock[m] || 0) + '" onchange="adSetStock(' + p.id + ',\'' + m + '\',this.value)" style="width:76px">' +
        '</div>').join('');
      return '<tr><td><b>' + adEsc(p.name) + '</b><br><span class="mono" style="color:#98a2b3">#' + p.id + '</span></td>' +
        '<td>' + p.brand + '</td><td style="min-width:260px">' + cells + '</td>' +
        '<td><b>' + adMoney(p.price) + '</b></td>' +
        '<td><b>' + adTotalStock(p) + '</b> máy</td>' +
        '<td>' + stockPill(p) + '</td>' +
        '<td><div class="row-actions">' +
        '<button class="btn-s" onclick="adToggleActive(' + p.id + ')">' + (p.active ? 'Ngừng bán' : 'Mở bán') + '</button>' +
        '<button class="btn-s" onclick="adSetThreshold(' + p.id + ')">Ngưỡng cảnh báo</button>' +
        '</div></td></tr>';
    }).join('') + '</tbody></table></div>';
}

function adSetPrice(id, mem, val) {
  const list = adCatalog();
  const p = list.find(x => x.id === id);
  if (!p) return;
  const before = p.prices[mem] || p.price;
  const after = Number(val);
  if (!after || after < 0) { showToast('Giá không hợp lệ.'); return; }
  p.prices[mem] = after;
  if (mem === p.memory[0]) p.price = after;
  adSaveCatalog(list);
  adLog('Đổi giá ' + p.name + ' ' + mem, 'Cập nhật giá bán', adMoney(before), adMoney(after));
  showToast('Đã cập nhật giá ' + p.name + ' ' + mem + ': ' + adMoney(after));
  adRender();
}

function adSetStock(id, mem, val) {
  const list = adCatalog();
  const p = list.find(x => x.id === id);
  if (!p) return;
  const before = p.stock[mem] || 0;
  const after = Math.max(0, Number(val) || 0);
  p.stock[mem] = after;
  adSaveCatalog(list);
  adLog('Cập nhật tồn kho ' + p.name + ' ' + mem, 'Số lượng tồn', before, after);
  showToast('Tồn kho ' + p.name + ' ' + mem + ': ' + after + ' máy — ' + adStockState(p).label + '.');
  adRender();
}

function adToggleActive(id) {
  const list = adCatalog();
  const p = list.find(x => x.id === id);
  if (!p) return;
  p.active = !p.active;
  adSaveCatalog(list);
  adLog((p.active ? 'Mở bán ' : 'Ngừng bán ') + p.name, 'Trạng thái kinh doanh', !p.active, p.active);
  showToast(p.name + ' → ' + (p.active ? 'đang bán' : 'ngừng bán') + '.');
  adRender();
}

function adSetThreshold(id) {
  const list = adCatalog();
  const p = list.find(x => x.id === id);
  if (!p) return;
  const v = prompt('Ngưỡng cảnh báo sắp hết hàng cho ' + p.name + ' (máy):', p.threshold || 5);
  if (v === null) return;
  const n = Number(v);
  if (isNaN(n) || n < 0) { showToast('Ngưỡng không hợp lệ.'); return; }
  p.threshold = n;
  adSaveCatalog(list);
  adLog('Đổi ngưỡng cảnh báo ' + p.name, 'Ngưỡng tồn kho', null, n);
  showToast('Ngưỡng cảnh báo của ' + p.name + ': ' + n + ' máy.');
  adRender();
}


