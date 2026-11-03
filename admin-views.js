/* Các khung nhìn còn lại của trang quản trị: khách hàng, nhật ký, tài khoản quản trị, cấu hình */

/* ---------- Khách hàng ---------- */
function adViewCustomers() {
  return '<div class="adm-head"><div><h1>Tra cứu khách hàng</h1>' +
    '<p>Nhập số điện thoại, email hoặc họ tên để xem <b>toàn bộ</b> thông tin tài khoản và lịch sử mua hàng.</p></div></div>' +
    '<div class="panel-adm"><div class="toolbar-adm">' +
    '<input id="adCustomersSearch" placeholder="Số điện thoại / email / họ tên khách" value="' + adEsc(custSearch) + '" ' +
    'oninput="adSearchInput(\'customers\', this.value)" style="min-width:320px" autocomplete="off">' +
    '<span class="count" id="adCustomersCount">' + adCustomersCountText() + '</span></div>' +
    '<div id="adCustomersResults">' + adCustomersResults() + '</div>' +
    '</div>';
}

function adCustomersCountText() {
  const q = custSearch.trim();
  const n = q ? adSearchCustomers(q).length : tgddUsers().length;
  return q ? n + ' kết quả' : n + ' khách đã đăng ký';
}

function adCustomersResults() {
  const q = custSearch.trim();
  const results = q ? adSearchCustomers(q) : [];

  let detail = '';
  if (q) {
    detail = results.length
      ? results.map(u => {
        const orders = u.orders || [];
        const spent = orders.reduce((t, o) => t + Number(o.total || 0), 0);
        const rows = orders.map(o => {
          const admin = adOrders().find(a => a.id === o.adminOrderId);
          return '<tr><td class="mono">' + (admin ? admin.code : '—') + '</td>' +
            '<td>' + adEsc(o.items) + '</td><td>' + adMoney(o.total) + '</td>' +
            '<td>' + adDate(o.date) + '</td><td>' + orderPill(admin ? admin.status : 'Chờ duyệt') + '</td>' +
            '<td>' + (admin ? '<button class="btn-s" onclick="adminTab=\'orders\';adOpenOrder(\'' + admin.id + '\')">Xem</button>' : '') + '</td></tr>';
        }).join('');
        return '<div class="panel-adm"><h2>' + adEsc(u.name) + ' · ' + u.phone + '</h2>' +
          '<div class="detail-block"><div class="kv">' +
          '<div><span>Mã khách hàng</span><span class="mono">' + u.id + '</span></div>' +
          '<div><span>Số điện thoại (đăng nhập)</span><span>' + adEsc(u.phone) + '</span></div>' +
          '<div><span>Email</span><span>' + adEsc(u.email) + '</span></div>' +
          '<div><span>Giới tính</span><span>' + (u.gender || '—') + '</span></div>' +
          '<div><span>Ngày sinh</span><span>' + (u.birth || '—') + '</span></div>' +
          '<div><span>Tạo tài khoản</span><span>' + adDate(u.createdAt) + '</span></div>' +
          '<div><span>Tổng chi tiêu</span><span>' + adMoney(spent) + '</span></div>' +
          '<div><span>Số đơn hàng</span><span>' + orders.length + '</span></div>' +
          '<div><span>Điểm tích lũy</span><span>' + (u.points || 0) + ' điểm</span></div>' +
          '<div><span>Đồng ý điều khoản bắt buộc</span><span>' + (u.consent && u.consent.required ? 'Có — ' + adDate(u.consent.agreedAt) : 'Không') + '</span></div>' +
          '<div><span>Đồng ý quảng cáo</span><span>' + (u.consent && u.consent.marketing ? 'Có' : 'Không') + '</span></div>' +
          '<div><span>Đồng ý chăm sóc KH</span><span>' + (u.consent && u.consent.care ? 'Có' : 'Không') + '</span></div>' +
          '<div><span>Đồng ý phân tích nhu cầu</span><span>' + (u.consent && u.consent.analytics ? 'Có' : 'Không') + '</span></div>' +
          '</div>' +
          ((u.addresses || []).length
            ? '<h3 style="margin:16px 0 8px">Địa chỉ đã lưu</h3>' +
              u.addresses.map(a => '<div class="addr-item"><b>' + adEsc(a.name) + '</b> · ' + adEsc(a.phone) +
                (a.default ? '<span class="tagline">Mặc định</span>' : '') + '<br>' + adEsc(adAddressText(a)) + '</div>').join('')
            : '<p style="color:#98a2b3;font-size:13px">Khách chưa lưu địa chỉ nào.</p>') +
          (orders.length
            ? '<h3 style="margin:16px 0 8px">Đơn hàng của khách</h3><div class="table-wrap"><table class="adm-t">' +
              '<thead><tr><th>Mã đơn</th><th>Sản phẩm</th><th>Tổng</th><th>Ngày</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
              rows + '</tbody></table></div>'
            : '<p style="color:#98a2b3;font-size:13px">Khách chưa có đơn hàng nào.</p>') +
          '</div></div>';
      }).join('')
      : '<div class="panel-adm"><div class="empty-adm">Không tìm thấy khách hàng với từ khóa "' + adEsc(q) + '".</div></div>';
  }

  return '' +
    (q ? '' : '<div class="empty-adm">Ví dụ: 0986335498 — hoặc chọn một khách trong danh sách bên dưới</div>') +
    (q ? '' : '<div class="panel-adm"><h2>Danh sách khách hàng (' + tgddUsers().length + ')</h2>' +
      (tgddUsers().length
        ? '<div class="table-wrap"><table class="adm-t"><thead><tr><th>Khách hàng</th><th>SĐT</th><th>Email</th><th>Số đơn</th><th>Tổng chi tiêu</th><th>Ngày tạo</th><th></th></tr></thead><tbody>' +
          tgddUsers().map(u => '<tr><td><b>' + adEsc(u.name) + '</b></td><td>' + adEsc(u.phone) + '</td><td>' + adEsc(u.email) + '</td>' +
            '<td>' + (u.orders || []).length + '</td>' +
            '<td>' + adMoney((u.orders || []).reduce((t, o) => t + Number(o.total || 0), 0)) + '</td>' +
            '<td>' + adDate(u.createdAt) + '</td>' +
            '<td><button class="btn-s" onclick="adPickCustomer(\'' + adEsc(u.phone) + '\')">Xem</button></td></tr>').join('') +
          '</tbody></table></div>'
        : '<div class="empty-adm">Chưa có khách hàng nào đăng ký trên website.</div>') +
      '</div>') + detail;
}

/* Chọn nhanh một khách: chỉ vẽ lại phần kết quả, không dựng lại cả trang */
function adPickCustomer(phone) {
  custSearch = phone;
  const inp = document.getElementById('adCustomersSearch');
  if (inp) inp.value = phone;
  adRepaint('adCustomersResults', adCustomersResults());
  const c = document.getElementById('adCustomersCount');
  if (c) c.textContent = adCustomersCountText();
}

/* ---------- Nhật ký hoạt động ---------- */
function adViewAudit() {
  return '<div class="adm-head"><div><h1>Nhật ký hoạt động</h1>' +
    '<p>Ghi lại mọi thao tác quan trọng: ai đổi giá, xóa sản phẩm, duyệt đơn, cập nhật tồn kho — kèm thời gian và IP.</p></div></div>' +
    '<div class="panel-adm"><div class="toolbar-adm">' +
    '<input id="adAuditSearch" placeholder="Tìm theo hành động hoặc người thực hiện" value="' + adEsc(auditFilter) + '" ' +
    'oninput="adSearchInput(\'audit\', this.value)" style="min-width:300px" autocomplete="off">' +
    '<span class="count" id="adAuditCount">' + adAuditCountText() + '</span></div>' +
    '<div id="adAuditResults">' + adAuditResults() + '</div>' +
    '</div>';
}

function adAuditList() {
  const q = auditFilter.trim().toLowerCase();
  return adRead(ADMIN_AUDIT_KEY, []).filter(e => !q ||
    e.action.toLowerCase().includes(q) || e.adminName.toLowerCase().includes(q) ||
    (e.detail || '').toLowerCase().includes(q));
}

function adAuditCountText() {
  return adAuditList().length + ' bản ghi';
}

function adAuditResults() {
  const list = adAuditList();
  return list.length
    ? '<div class="table-wrap"><table class="adm-t"><thead><tr>' +
      '<th>Thời gian</th><th>Người thực hiện</th><th>Hành động</th><th>Chi tiết</th><th>Trước → Sau</th><th>IP</th>' +
      '</tr></thead><tbody>' + list.map(e => '<tr>' +
        '<td>' + adDate(e.at) + '</td>' +
        '<td><b>' + adEsc(e.adminName) + '</b><br><span class="mono" style="color:#98a2b3">' + adEsc(e.adminId) + '</span></td>' +
        '<td>' + adEsc(e.action) + '</td>' +
        '<td style="color:#667085">' + adEsc(e.detail || '') + '</td>' +
        '<td>' + (e.before !== null && e.before !== undefined
          ? '<span class="audit-before">' + adEsc(e.before) + '</span> → <span class="audit-after">' + adEsc(e.after) + '</span>'
          : '—') + '</td>' +
        '<td class="mono">' + adEsc(e.ip || '—') + '</td>' +
        '</tr>').join('') + '</tbody></table></div>'
    : '<div class="empty-adm">Chưa có bản ghi nào.</div>';
}

/* ---------- Tài khoản quản trị (Super Admin) ---------- */
function adViewStaff() {
  const list = adAccounts();
  const acc = adCurrent();
  const isSuper = acc.role === 'superadmin';

  return '<div class="adm-head"><div><h1>Tài khoản quản trị</h1>' +
    '<p>Quản lý nhân viên theo mô hình RBAC. Chỉ Super Admin mới tạo, khóa hoặc đổi quyền tài khoản khác.</p></div></div>' +
    '<div class="panel-adm"><div class="table-wrap"><table class="adm-t"><thead><tr>' +
    '<th>Mã NV</th><th>Họ tên</th><th>Email công vụ</th><th>SĐT</th><th>Vai trò</th><th>Trạng thái</th><th>Đăng nhập cuối</th><th>Thao tác</th>' +
    '</tr></thead><tbody>' + list.map(a => {
      const stale = (Date.now() - new Date(a.passwordChangedAt).getTime()) > (adSettings().passwordMaxDays || 90) * 86400000;
      return '<tr><td class="mono">' + adEsc(a.staffId) + '</td>' +
        '<td><b>' + adEsc(a.name) + '</b></td>' +
        '<td>' + adEsc(a.email) + '</td>' +
        '<td>' + adEsc(a.phone) + '</td>' +
        '<td>' + ROLE_NAMES[a.role] + '</td>' +
        '<td><span class="pill ' + (a.status === 'Active' ? 'in' : a.status === 'Locked' ? 'out' : 'paused') + '">' + a.status + '</span>' +
        (stale ? '<br><span style="font-size:11px;color:#b54708">Quá hạn đổi mật khẩu</span>' : '') + '</td>' +
        '<td>' + adDate(a.lastLoginAt) + '<br><span class="mono" style="color:#98a2b3">' + (a.lastIp || '—') + '</span></td>' +
        '<td>' + (isSuper && a.id !== acc.id
          ? '<div class="row-actions">' +
            '<button class="btn-s" onclick="adCycleStatus(\'' + a.id + '\')">' +
            (a.status === 'Active' ? 'Tạm khóa' : 'Kích hoạt') + '</button>' +
            '<button class="btn-s" onclick="adChangeRole(\'' + a.id + '\')">Đổi quyền</button>' +
            '<button class="btn-s danger" onclick="adResetPw(\'' + a.id + '\')">Đặt lại MK</button>' +
            '</div>'
          : '<span style="color:#98a2b3;font-size:12px">' + (a.id === acc.id ? 'Tài khoản của bạn' : 'Chỉ Super Admin') + '</span>') +
        '</td></tr>';
    }).join('') + '</tbody></table></div>' +
    (isSuper ? '<div class="toolbar-adm"><button class="btn-s primary" onclick="adCreateStaff()">+ Thêm tài khoản quản trị</button></div>' : '') +
    '</div>';
}

function adCycleStatus(id) {
  const list = adAccounts();
  const a = list.find(x => x.id === id);
  if (!a) return;
  const before = a.status;
  a.status = a.status === 'Active' ? 'Locked' : 'Active';
  adSaveAccounts(list);
  adLog('Đổi trạng thái tài khoản ' + a.staffId, a.name, before, a.status);
  showToast(a.staffId + ': ' + before + ' → ' + a.status);
  adRender();
}

function adChangeRole(id) {
  const list = adAccounts();
  const a = list.find(x => x.id === id);
  if (!a) return;
  const opts = Object.keys(ROLE_NAMES).map((k, i) => (i + 1) + '. ' + ROLE_NAMES[k]).join('\n');
  const pick = prompt('Chọn vai trò mới cho ' + a.name + ':\n' + opts, '2');
  if (!pick) return;
  const key = Object.keys(ROLE_NAMES)[Number(pick) - 1];
  if (!key) { showToast('Lựa chọn không hợp lệ.'); return; }
  const before = a.role;
  a.role = key;
  adSaveAccounts(list);
  adLog('Đổi quyền ' + a.staffId, a.name, ROLE_NAMES[before], ROLE_NAMES[key]);
  showToast('Đã đổi vai trò ' + a.staffId + ' → ' + ROLE_NAMES[key]);
  adRender();
}

function adResetPw(id) {
  const list = adAccounts();
  const a = list.find(x => x.id === id);
  if (!a) return;
  const pw = prompt('Mật khẩu mới cho ' + a.staffId + ' (>=12 ký tự, có hoa/thường/số/ký tự đặc biệt):');
  if (!pw) return;
  const issues = adPasswordIssues(pw);
  if (issues.length) return showToast('Mật khẩu chưa đủ mạnh: cần ' + issues.join(', ') + '.');
  a.salt = 's' + Date.now();
  a.password = adHash(pw, a.salt);
  a.passwordChangedAt = new Date().toISOString();
  adSaveAccounts(list);
  adLog('Đặt lại mật khẩu ' + a.staffId, 'Bắt buộc đổi mật khẩu', null, 'Đã cập nhật');
  showToast('Đã đặt lại mật khẩu cho ' + a.staffId + '.');
  adRender();
}

function adCreateStaff() {
  const staffId = prompt('Mã nhân viên (VD: NV0005):');
  if (!staffId) return;
  const name = prompt('Họ tên:');
  if (!name) return;
  const email = prompt('Email công vụ:');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Email không hợp lệ.');
  const phone = prompt('Số điện thoại liên hệ (10 số, bắt đầu bằng 0):');
  if (!phone || !/^0\d{9}$/.test(phone)) return showToast('Số điện thoại không hợp lệ.');
  const opts = Object.keys(ROLE_NAMES).map((k, i) => (i + 1) + '. ' + ROLE_NAMES[k]).join('\n');
  const pick = prompt('Vai trò:\n' + opts, '3');
  const role = Object.keys(ROLE_NAMES)[Number(pick) - 1];
  if (!role) return showToast('Vai trò không hợp lệ.');
  const pw = prompt('Mật khẩu ban đầu (>=12 ký tự, hoa/thường/số/ký tự đặc biệt):');
  if (!pw) return;
  const issues = adPasswordIssues(pw);
  if (issues.length) return showToast('Mật khẩu chưa đủ mạnh: cần ' + issues.join(', ') + '.');

  const list = adAccounts();
  if (list.some(a => a.staffId.toLowerCase() === staffId.toLowerCase())) return showToast('Mã nhân viên đã tồn tại.');
  if (list.some(a => a.email.toLowerCase() === email.toLowerCase())) return showToast('Email đã được dùng.');
  const id = 'a' + Date.now();
  list.push({
    id, staffId, name, email, phone, role, status: 'Active',
    salt: 's' + id, password: adHash(pw, 's' + id),
    twofa: true, lastLoginAt: null, lastIp: null,
    passwordChangedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
  adSaveAccounts(list);
  adLog('Tạo tài khoản quản trị ' + staffId, name + ' · ' + ROLE_NAMES[role]);
  showToast('Đã tạo tài khoản ' + staffId + ' (' + ROLE_NAMES[role] + ').');
  adRender();
}

/* ---------- Cấu hình bảo mật ---------- */
function adViewSettings() {
  const s = adSettings();
  const acc = adCurrent();
  return '<div class="adm-head"><div><h1>Bảo mật & cấu hình</h1>' +
    '<p>Chính sách áp dụng cho toàn bộ tài khoản quản trị.</p></div></div>' +
    '<div class="two-col">' +
    '<div class="panel-adm"><h2>Chính sách bảo mật</h2><div class="detail-block">' +
    '<label style="display:flex;gap:9px;align-items:flex-start;font-size:13.5px;margin-bottom:12px">' +
    '<input type="checkbox" id="st2fa" ' + (s.require2fa ? 'checked' : '') + ' onchange="adSaveSettings()">' +
    '<span><b>Bắt buộc 2FA</b><br><small style="color:#667085">Mọi tài khoản quản trị phải xác thực 2 lớp khi đăng nhập.</small></span></label>' +
    '<label style="display:block;font-size:13px;color:#667085;margin-bottom:6px">Đổi mật khẩu định kỳ (ngày)</label>' +
    '<input class="cell num" id="stPwDays" type="number" min="30" value="' + s.passwordMaxDays + '" onchange="adSaveSettings()" style="width:120px">' +
    '<label style="display:block;font-size:13px;color:#667085;margin:14px 0 6px">Tự động đăng xuất sau (phút không thao tác)</label>' +
    '<input class="cell num" id="stTimeout" type="number" min="1" value="' + s.sessionTimeoutMin + '" onchange="adSaveSettings()" style="width:120px">' +
    '<label style="display:block;font-size:13px;color:#667085;margin:14px 0 6px">IP Whitelist (cách nhau bằng dấu phẩy, để trống = không giới hạn)</label>' +
    '<input class="cell" id="stIp" value="' + adEsc(s.ipWhitelist) + '" onchange="adSaveSettings()" style="width:100%;max-width:420px">' +
    '<div style="margin-top:16px;font-size:12.5px;color:#98a2b3;line-height:1.7">' +
    'Đang đăng nhập: <b>' + adEsc(acc.name) + '</b> · ' + ROLE_NAMES[acc.role] + '<br>' +
    'IP phiên hiện tại: <span class="mono">' + (acc.lastIp || '—') + '</span><br>' +
    'Mật khẩu đổi lần cuối: ' + adDate(acc.passwordChangedAt) + '</div>' +
    '</div></div>' +
    '<div class="panel-adm"><h2>Quyền theo vai trò</h2><div class="table-wrap"><table class="adm-t"><thead><tr><th>Vai trò</th><th>Quyền truy cập</th></tr></thead><tbody>' +
    Object.keys(ROLE_NAMES).map(k => '<tr><td><b>' + ROLE_NAMES[k] + '</b></td><td>' +
      ROLE_PERMS[k].map(p => NAV.find(n => n.key === p).label).join(' · ') + '</td></tr>').join('') +
    '</tbody></table></div></div>' +
    '</div>';
}

function adSaveSettings() {
  const s = adSettings();
  s.require2fa = document.getElementById('st2fa').checked;
  s.passwordMaxDays = Math.max(30, Number(document.getElementById('stPwDays').value) || 90);
  s.sessionTimeoutMin = Math.max(1, Number(document.getElementById('stTimeout').value) || 20);
  s.ipWhitelist = document.getElementById('stIp').value.trim();
  adWrite(ADMIN_SETTINGS_KEY, s);
  adLog('Cập nhật cấu hình bảo mật', '2FA=' + s.require2fa + ', đổi MK=' + s.passwordMaxDays + ' ngày, timeout=' + s.sessionTimeoutMin + ' phút');
  showToast('Đã lưu cấu hình bảo mật.');
}

