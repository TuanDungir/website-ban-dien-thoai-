/* Trang tài khoản: đơn hàng, kho voucher, thông tin cá nhân */

let currentTab = 'orders';
let profileSubTab = 'info';
let orderStatus = 'Tất cả';
let showRange = false;

/* Khoảng thời gian lọc đơn: mặc định 1 năm gần nhất tính đến hôm nay */
const today = new Date();
const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
let orderRange = { from: toInputDate(oneYearAgo), to: toInputDate(today) };

function toInputDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}
function fmtInputDate(v) {
  if (!v) return '—';
  const p = v.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}
function fmtMoney(n) {
  return Number(n || 0).toLocaleString('vi-VN') + '₫';
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('vi-VN');
}

/* Người dùng đang đăng nhập */
function activeUser() {
  return tgddCurrentUser();
}

/* QR minh họa (không mã hóa dữ liệu thật) */
function qrSvg(seed) {
  const n = 21;
  let s = 7;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      s = (s * 1103515245 + 12345) >>> 0;
      const on = ((s >>> 16) & 1) === 1;
      const inFinder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
      let draw = on;
      if (inFinder) {
        const mx = x % 7;
        const my = y % 7;
        draw = mx === 0 || mx === 6 || my === 0 || my === 6 || (mx >= 2 && mx <= 4 && my >= 2 && my <= 4);
      }
      if (draw) cells.push('<rect x="' + x + '" y="' + y + '" width="1" height="1"/>');
    }
  }
  return '<svg viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" fill="#111">' + cells.join('') + '</svg>';
}

/* Cập nhật khối VIP bên trái */
function renderSide(user) {
  document.getElementById('vipName').textContent = user.name;
  document.getElementById('vipPhone').textContent = user.phone;
  document.getElementById('vipPoints').textContent = user.points || 0;
  document.querySelector('.vip .qr').innerHTML = qrSvg(user.phone);
  document.querySelectorAll('.acct-menu a[data-tab]').forEach(a => {
    a.classList.toggle('active', a.dataset.tab === currentTab);
  });
}

/* ---------- Tab: Đơn hàng đã mua ---------- */
/* Tab lọc theo trạng thái — dùng đúng nhãn mà API trả về để bộ lọc khớp dữ liệu */
const ORDER_STATUSES = ['Tất cả', 'Chờ duyệt', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã huỷ'];

/* Lọc đơn theo trạng thái + khoảng thời gian đã chọn.
   Khi có backend, đơn được nạp từ API (TG.orders); nếu không thì dùng
   dữ liệu demo trong tài khoản. */
function filteredOrders(user) {
  const all = (window.TG && TG.online && TG.orders) ? TG.orders : (user.orders || []);
  const from = orderRange.from ? new Date(orderRange.from + 'T00:00:00') : null;
  const to = orderRange.to ? new Date(orderRange.to + 'T23:59:59') : null;
  return all.filter(o => {
    const d = new Date(o.date);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return orderStatus === 'Tất cả' || o.status === orderStatus;
  });
}

/* Tổng số đơn thật (không phụ thuộc bộ lọc) để quyết định hiện trạng thái trống */
function totalOrders(user) {
  return ((window.TG && TG.online && TG.orders) ? TG.orders : (user.orders || [])).length;
}

function renderOrders(user) {
  const orders = filteredOrders(user);
  const total = totalOrders(user);
  const rangeLabel = 'Từ ' + fmtInputDate(orderRange.from) + ' - ' + fmtInputDate(orderRange.to);
  const tabs = ORDER_STATUSES.map(s => '<button class="' + (s === orderStatus ? 'active' : '') +
    '" onclick="setOrderStatus(\'' + s + '\')">' + s + '</button>').join('');

  const picker = showRange
    ? '<div class="range-picker">' +
      '<label>Từ ngày<input type="date" id="rangeFrom" value="' + orderRange.from + '"></label>' +
      '<label>Đến ngày<input type="date" id="rangeTo" value="' + orderRange.to + '"></label>' +
      '<button class="cta" onclick="applyRange()">Áp dụng</button>' +
      '<button class="ghost-btn" onclick="resetRange()">1 năm gần nhất</button>' +
      '<button class="ghost-btn" onclick="toggleRange(false)">Đóng</button>' +
      '</div>'
    : '';

  let body;
  if (!total) {
    body = '<div class="empty-state">' +
      '<div style="font-size:64px;line-height:1">🧸</div>' +
      '<h3>Anh ' + user.name + ' chưa mua sản phẩm nào</h3>' +
      '<p>Vẫn còn rất nhiều sản phẩm đang chờ anh</p>' +
      '<a class="tohome" href="index.html">Về trang chủ</a>' +
      '</div>';
  } else if (!orders.length) {
    body = '<div class="empty-state"><p>Không có đơn hàng nào trong khoảng thời gian và trạng thái đã chọn.</p></div>';
  } else {
    body = orders.map(o => {
      const line = (o.items || '') + (o.qty ? ' × ' + o.qty : '');
      return '<div class="order-item" style="cursor:pointer" onclick="location.href=\'order.html?code=' + encodeURIComponent(o.id) + '\'">' +
        '<div class="order-top"><b>#' + esc(o.id) + '</b><span class="status-pill">' + esc(o.status) + '</span></div>' +
        '<div class="order-line">' + esc(line) + '</div>' +
        (o.address ? '<div class="order-meta">Giao đến: ' + esc(tgddAddrFull(o.address)) + '</div>' : '') +
        '<div class="order-meta" style="margin-top:4px">Ngày đặt: ' + fmtDate(o.date) + ' · Thanh toán: ' + fmtMoney(o.total) + '</div>' +
        (o.status === 'Chờ duyệt' && o.statusKey === 'pending'
          ? '<div style="margin-top:10px"><span class="order-meta">Đơn đang chờ cửa hàng xác nhận.</span></div>'
          : '') +
        '</div>';
    }).join('');
  }

  return '<div class="acct-head"><h1>Đơn hàng đã mua</h1>' +
    '<span class="sub">' + rangeLabel + '</span>' +
    '<span class="link" onclick="toggleRange()">🗓 Đổi</span></div>' +
    picker +
    '<div class="tabs-line">' + tabs + '</div>' + body;
}

function toggleRange(force) {
  showRange = typeof force === 'boolean' ? force : !showRange;
  render();
}
function setOrderStatus(s) {
  orderStatus = s;
  render();
}
function applyRange() {
  const from = document.getElementById('rangeFrom').value;
  const to = document.getElementById('rangeTo').value;
  if (!from || !to) return showToast('Vui lòng chọn đủ ngày bắt đầu và ngày kết thúc.');
  if (from > to) return showToast('Ngày bắt đầu phải trước ngày kết thúc.');
  orderRange = { from, to };
  showRange = false;
  render();
  showToast('Đã lọc đơn từ ' + fmtInputDate(from) + ' đến ' + fmtInputDate(to) + '.');
}
function resetRange() {
  orderRange = { from: toInputDate(oneYearAgo), to: toInputDate(today) };
  showRange = false;
  render();
}

/* ---------- Tab: Kho voucher ---------- */
function renderVouchers(user) {
  return '<div class="acct-head"><h1 style="color:var(--muted);font-size:17px">‹ KHO VOUCHER</h1></div>' +
    '<div class="tabs-line" style="justify-content:space-around;border-bottom:1px solid var(--line);padding-bottom:0">' +
    '<button class="active" style="border:0;border-bottom:3px solid #f5a000;border-radius:0;color:#f5a000">Chưa lấy (0)</button>' +
    '<button style="border:0;border-radius:0" onclick="showToast(\'Bạn chưa lấy voucher nào.\')">Đã lấy (0)</button>' +
    '</div>' +
    '<div class="empty-state"><p>Kho voucher hiện đang trống.</p></div>';
}
/* ---------- Tab: Thông tin của tôi ---------- */
function renderProfile(user) {
  const c = user.consent || {};
  const sub = '<div class="profile-tabs">' +
    '<button class="' + (profileSubTab === 'info' ? 'active' : '') + '" onclick="setProfileTab(\'info\')">Thông tin cá nhân</button>' +
    '<button class="' + (profileSubTab === 'addr' ? 'active' : '') + '" onclick="setProfileTab(\'addr\')">Sổ địa chỉ</button>' +
    '</div>';
  let body;
  if (profileSubTab === 'addr') {
    const list = user.addresses || [];
    if (acctAddrEditing) {
      const editing = acctAddrEditing === 'new' ? null : acctAddrEditing;
      body = '<div class="sheet" style="padding:0;border:0">' +
        '<div class="sheet-head"><h2 id="addrFormTitle">Địa chỉ nhận hàng mới</h2>' +
        '<button class="ghost-btn" onclick="acctCancelAddr()">‹ Quay lại</button></div>' +
        tgddAddrFormHtml() + '</div>';
      setTimeout(() => tgddAddrFormOpen(editing ? 'edit' : 'new', editing), 0);
    } else {
      body = list.length
        ? list.map(a => '<div class="addr-item"><b>' + esc(a.name) + '</b> · ' + esc(a.phone) +
            (a.default ? '<span class="tagline">Mặc định</span>' : '') +
            '<br>' + esc(tgddAddrFull(a)) +
            (a.lat ? '<div class="order-meta" style="margin-top:4px">📍 Đã ghim ' + a.lat.toFixed(5) + ', ' + a.lon.toFixed(5) + '</div>' : '') +
            '<div style="margin-top:8px;display:flex;gap:14px">' +
            '<a style="color:var(--blue);cursor:pointer;font-size:13px" onclick="acctEditAddr(\'' + a.id + '\')">✎ Sửa</a>' +
            '<a style="color:var(--red);cursor:pointer;font-size:13px" onclick="acctDelAddr(\'' + a.id + '\')">🗑 Xoá</a></div></div>').join('')
        : '<div class="empty-state"><p>Bạn chưa lưu địa chỉ nào.</p></div>';
      body += '<div class="profile-save" style="margin-top:14px"><button onclick="acctNewAddr()">+ Thêm địa chỉ</button></div>';
    }
  } else {
    body = '<div class="radio-row"><label><input type="radio" name="gender" value="Anh" ' + ((user.gender || 'Anh') === 'Anh' ? 'checked' : '') + '> Anh</label>' +
      '<label><input type="radio" name="gender" value="Chị" ' + (user.gender === 'Chị' ? 'checked' : '') + '> Chị</label></div>' +
      '<div class="profile-grid">' +
      '<div><label>Họ tên</label><input id="pfName" value="' + esc(user.name) + '"></div>' +
      '<div><label>Số điện thoại</label><input value="' + esc(user.phone) + '" disabled title="Số điện thoại dùng để đăng nhập, không thể đổi"></div>' +
      '<div><label>Ngày sinh</label><input id="pfBirth" type="date" value="' + (user.birth || '') + '"></div>' +
      '<div><label>Email</label><input id="pfEmail" type="email" value="' + esc(user.email) + '"></div>' +
      '</div>' +
      '<p class="field-hint" style="margin-top:12px">Tài khoản tạo ngày ' + fmtDate(user.createdAt || new Date().toISOString()) + '. Số điện thoại dùng để đăng nhập nên không đổi được.</p>' +
      '<div class="profile-save"><button onclick="saveProfile()">Cập nhật</button></div>' +
      '<h3 style="font-size:16px;margin:26px 0 6px">Quyền xử lý dữ liệu cá nhân</h3>' +
      '<p style="font-size:13px;color:var(--muted);margin:0 0 10px">Bạn có thể bật/tắt các mục đích mở rộng bất cứ lúc nào.</p>' +
      '<label class="consent-check"><input type="checkbox" checked disabled><span><b>Điều khoản bắt buộc</b> — đã đồng ý ngày ' + (c.agreedAt ? fmtDate(c.agreedAt) : '—') + '</span></label>' +
      '<label class="consent-check"><input type="checkbox" id="pcMarketing" ' + (c.marketing ? 'checked' : '') + ' onchange="saveConsent()"><span>Mục đích quảng cáo</span></label>' +
      '<label class="consent-check"><input type="checkbox" id="pcCare" ' + (c.care ? 'checked' : '') + ' onchange="saveConsent()"><span>Chăm sóc khách hàng</span></label>' +
      '<label class="consent-check"><input type="checkbox" id="pcAnalytics" ' + (c.analytics ? 'checked' : '') + ' onchange="saveConsent()"><span>Phân tích nhu cầu, đề xuất sản phẩm</span></label>';
  }
  return '<div class="acct-head"><h1>Thông tin của tôi</h1></div>' + sub + body;
}

/* Escape ký tự HTML để tên/email có dấu ngoặc không phá vỡ giao diện */
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function setProfileTab(t) { profileSubTab = t; render(); }

function saveProfile() {
  const list = tgddUsers();
  const user = list.find(u => u.id === tgddCurrentUser().id);
  if (!user) return;
  const name = document.getElementById('pfName').value.trim();
  const email = document.getElementById('pfEmail').value.trim();
  const birth = document.getElementById('pfBirth').value;
  if (!name) return showToast('Họ tên không được để trống.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Email không hợp lệ.');
  if (list.some(u => u.id !== user.id && u.email.toLowerCase() === email.toLowerCase())) {
    return showToast('Email này đã được dùng cho tài khoản khác.');
  }
  user.name = name;
  user.email = email;
  user.birth = birth;
  const g = document.querySelector('input[name="gender"]:checked');
  if (g) user.gender = g.value;
  tgddSaveUsers(list);
  tgddRenderHeader();
  showToast('Đã cập nhật thông tin cá nhân.');
  render();
}

/* Sổ địa chỉ dùng chung form với trang thanh toán */
let acctAddrEditing = null;

function acctNewAddr() { acctAddrEditing = 'new'; render(); }
function acctEditAddr(id) {
  const a = tgddAddresses().find(x => x.id === id);
  if (!a) return;
  acctAddrEditing = a;
  render();
}
function acctCancelAddr() { acctAddrEditing = null; render(); }
function acctDelAddr(id) {
  if (!confirm('Xoá địa chỉ này?')) return;
  tgddAddressDelete(id);
  showToast('Đã xoá địa chỉ.');
  render();
}
/* address.js gọi lại sau khi lưu */
function onAddressSaved() { acctAddrEditing = null; render(); }
function onAddressFormClosed() {}

function saveConsent() {
  const list = tgddUsers();
  const user = list.find(u => u.id === tgddCurrentUser().id);
  if (!user) return;
  user.consent = Object.assign({}, user.consent, {
    marketing: document.getElementById('pcMarketing').checked,
    care: document.getElementById('pcCare').checked,
    analytics: document.getElementById('pcAnalytics').checked
  });
  tgddSaveUsers(list);
  showToast('Đã cập nhật lựa chọn xử lý dữ liệu cá nhân.');
}

function switchTab(tab) {
  currentTab = tab;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function doLogout() {
  tgddLogout();
  showToast('Đã đăng xuất khỏi tài khoản.');
  setTimeout(() => { location.href = 'index.html'; }, 700);
}

function render() {
  const user = activeUser();
  if (!user) {
    location.replace('index.html?login=1');
    return;
  }
  renderSide(user);
  const box = document.getElementById('acctMain');
  if (currentTab === 'orders') box.innerHTML = renderOrders(user);
  else if (currentTab === 'vouchers') box.innerHTML = renderVouchers(user);
  else box.innerHTML = renderProfile(user);
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  tgddRenderCartCount();
  document.getElementById('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    location.href = 'index.html?q=' + encodeURIComponent(document.getElementById('searchInput').value);
  });
});
