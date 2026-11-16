/* Luồng đặt hàng: địa chỉ → giỏ hàng → chi tiết giao hàng & thanh toán */

const CO_STEPS = ['address', 'cart', 'pay'];
const CO_STEP_LABEL = { address: 'Địa chỉ nhận hàng', cart: 'Giỏ hàng', pay: 'Thanh toán' };

const VOUCHERS = {
  WELCOME50: { label: 'Giảm 50.000₫ cho đơn từ 250.000₫', amount: 50000, min: 250000 },
  TGDD200: { label: 'Giảm 200.000₫ cho đơn từ 5 triệu', amount: 200000, min: 5000000 },
  FREESHIP: { label: 'Miễn phí giao hàng', ship: true, min: 0 }
};

const SHIPPING = {
  standard: { label: 'Giao tiêu chuẩn', desc: 'Nhận trong 2–3 ngày', fee: 0, free: true },
  fast: { label: 'Giao siêu nhanh', desc: 'Nhận trước 9h ngày mai', fee: 19000 },
  store: { label: 'Nhận tại siêu thị', desc: 'Tới cửa hàng gần nhất để nhận', fee: 0, free: true }
};

const PAY_METHODS = [
  { id: 'cod', ic: '💵', label: 'Thanh toán khi nhận hàng (COD)', sub: 'Trả tiền mặt cho nhân viên giao hàng' },
  { id: 'deposit', ic: '🏦', label: 'Đặt cọc chuyển khoản trước 50%', sub: 'Chuyển trước 50% giá trị đơn, phần còn lại trả khi nhận' },
  { id: 'bank', ic: '🏛', label: 'Chuyển khoản ngân hàng', sub: 'Quét mã QR VietQR để chuyển khoản' },
  { id: 'momo', ic: '📱', label: 'Ví MoMo', sub: 'Thanh toán qua ứng dụng MoMo' },
  { id: 'vnpay', ic: '💳', label: 'VNPay QR', sub: 'Quét mã VNPay bằng ứng dụng ngân hàng' },
  { id: 'zalopay', ic: '💠', label: 'ZaloPay', sub: 'Thanh toán qua ZaloPay' },
  { id: 'smartpay', ic: '⚡', label: 'SmartPay QR', sub: 'Quét QR SmartPay' },
  { id: 'card', ic: '💳', label: 'Qua thẻ ATM / tín dụng Napas', sub: 'Nhập thẻ khi chuyển sang cổng thanh toán' },
  { id: 'staff', ic: '🧑‍💼', label: 'Nhân viên mang máy cà thẻ khi nhận hàng', sub: 'Quẹt thẻ tại nhà khi nhận máy' }
];

const co = {
  step: 'address',
  addrId: null,
  selected: {},
  voucher: null,
  ship: 'standard',
  pay: 'cod',
  payMore: false,
  editingAddr: null
};

function coLines() {
  return tgddCart();
}

function coSelectedLines() {
  return coLines().filter((l) => co.selected[tgddCartLineId(l)]);
}

function coSubtotal() {
  return coSelectedLines().reduce((s, l) => s + l.price * l.qty, 0);
}

function coShippingFee() {
  const fee = SHIPPING[co.ship] ? SHIPPING[co.ship].fee : 0;
  if (co.voucher && VOUCHERS[co.voucher] && VOUCHERS[co.voucher].ship) return 0;
  return fee;
}

function coDiscount() {
  const v = co.voucher ? VOUCHERS[co.voucher] : null;
  if (!v || v.ship) return 0;
  return Math.min(v.amount, coSubtotal());
}

function coTotal() {
  return Math.max(0, coSubtotal() - coDiscount() + coShippingFee());
}

function coPayAmount() {
  if (co.pay === 'deposit') return Math.round(coTotal() / 2);
  return coTotal();
}

function coPayLabel() {
  if (co.pay === 'deposit') return 'Số tiền cần chuyển trước (50%)';
  if (co.pay === 'cod') return 'Số tiền trả khi nhận hàng';
  return 'Số tiền cần thanh toán';
}
/* ---------- Khung bước + tổng tiền ---------- */
function coRenderSteps() {
  const idx = CO_STEPS.indexOf(co.step);
  document.getElementById('stepBar').innerHTML = CO_STEPS.map((s, i) => {
    const cls = i === idx ? 'on' : (i < idx ? 'done' : '');
    return '<span class="' + cls + '"><b>' + (i < idx ? '✓' : i + 1) + '</b>' + CO_STEP_LABEL[s] + '</span>' +
      (i < CO_STEPS.length - 1 ? '<i></i>' : '');
  }).join('');
  document.getElementById('crumbStep').textContent = CO_STEP_LABEL[co.step];
}

function coRenderSummary() {
  const box = document.getElementById('sumBox');
  const n = coSelectedLines().length;
  if (!n) {
    box.innerHTML = '<div class="sheet"><div class="sheet-head"><h2>Chi tiết thanh toán</h2></div>' +
      '<p style="font-size:14px;color:var(--muted);margin:0">Chưa chọn sản phẩm nào.</p></div>';
    return;
  }
  const addr = coCurrentAddress();
  const rows = [];
  rows.push('<div class="sum-row"><span>Tổng tiền hàng (' + n + ' sản phẩm)</span><span>' + tgddMoney(coSubtotal()) + '</span></div>');
  if (coDiscount()) rows.push('<div class="sum-row disc"><span>Mã giảm giá ' + co.voucher + '</span><span>−' + tgddMoney(coDiscount()) + '</span></div>');
  rows.push('<div class="sum-row"><span>Phí giao hàng</span><span>' +
    (coShippingFee() ? tgddMoney(coShippingFee()) : (co.voucher && VOUCHERS[co.voucher].ship ? 'Miễn phí (FREESHIP)' : 'Miễn phí')) +
    '</span></div>');
  rows.push('<div class="sum-row total"><span>Tổng thanh toán</span><span class="v">' + tgddMoney(coTotal()) + '</span></div>');
  if (co.pay === 'deposit') {
    rows.push('<div class="sum-row"><span>Cọc trước 50%</span><span><b>' + tgddMoney(coPayAmount()) + '</b></span></div>');
    rows.push('<div class="sum-row"><span>Còn lại khi nhận hàng</span><span>' + tgddMoney(coTotal() - coPayAmount()) + '</span></div>');
  }

  box.innerHTML = '<div class="sheet">' +
    '<div class="sheet-head"><h2>Chi tiết thanh toán</h2></div>' +
    rows.join('') +
    (addr ? '<div class="sum-row" style="border-top:1px dashed var(--line);margin-top:10px;padding-top:12px;font-size:13px;color:var(--muted)">' +
      'Giao tới: ' + tgddEsc(tgddAddrFull(addr)) + '</div>' : '') +
    '</div>';
}

/* ---------- Bước 1: địa chỉ ---------- */
function coCurrentAddress() {
  const list = tgddAddresses();
  return list.find((a) => a.id === co.addrId) || tgddDefaultAddress();
}

function coRenderAddress() {
  if (co.editingAddr) return coRenderAddrForm();

  const list = tgddAddresses();
  if (!co.addrId && list.length) co.addrId = tgddDefaultAddress().id;

  const cards = list.map((a) => {
    const sel = a.id === co.addrId;
    return '<label class="addr-pick ' + (sel ? 'sel' : '') + '">' +
      '<input type="radio" name="addr" ' + (sel ? 'checked' : '') + ' onchange="coPickAddress(\'' + a.id + '\')">' +
      '<div style="min-width:0">' +
      '<div class="who">' + tgddEsc(a.name) + ' · ' + tgddEsc(a.phone) +
      (a.default ? '<span class="pill-default">Mặc định</span>' : '') + '</div>' +
      '<div class="line">' + tgddEsc(tgddAddrFull(a)) + '</div>' +
      (a.lat ? '<div class="line" style="color:var(--muted);font-size:12px">📍 Đã ghim ' +
        a.lat.toFixed(5) + ', ' + a.lon.toFixed(5) + '</div>' : '') +
      '</div>' +
      '<div class="acts">' +
      '<a onclick="event.preventDefault();coEditAddress(\'' + a.id + '\')">✎ Sửa</a>' +
      '<a class="del" onclick="event.preventDefault();coDeleteAddress(\'' + a.id + '\')">🗑 Xoá</a>' +
      '</div></label>';
  }).join('');

  const empty = !list.length
    ? '<div style="text-align:center;padding:26px 10px;color:var(--muted)">' +
      '<div style="font-size:44px;line-height:1">📍</div>' +
      '<h3 style="color:var(--ink);font-size:16px;margin:10px 0 6px">Bạn chưa có địa chỉ nhận hàng.</h3>' +
      '<p style="margin:0 0 4px;font-size:13.5px">Vui lòng chọn thêm địa chỉ nhận hàng để chúng tôi phục vụ tốt hơn.</p></div>'
    : '';

  document.getElementById('stepBody').innerHTML = '<div class="sheet">' +
    '<div class="sheet-head"><h2>Chọn địa chỉ nhận hàng</h2></div>' +
    empty + cards +
    '<button class="addr-add" style="margin-top:' + (list.length ? '14px' : '16px') + '" onclick="coNewAddress()">' +
    (list.length ? '+ Thêm thông tin địa chỉ giao hàng mới' : '+ Thêm địa chỉ mới') + '</button>' +
    '</div>' +
    '<div style="display:flex;gap:10px;justify-content:flex-end">' +
    '<button class="btn-block" style="max-width:280px" onclick="coGo(\'cart\')" ' + (list.length ? '' : 'disabled') + '>' +
    'Xác nhận địa chỉ</button></div>';

  coRenderSummary();
}

function coPickAddress(id) {
  co.addrId = id;
  coRenderAddress();
}

function coNewAddress() {
  co.editingAddr = 'new';
  coRenderAddress();
}

function coEditAddress(id) {
  const a = tgddAddresses().find((x) => x.id === id);
  if (!a) return;
  co.editingAddr = a;
  coRenderAddress();
}

function coDeleteAddress(id) {
  tgddAddrDelete(id);
  if (co.addrId === id) co.addrId = null;
  coRenderAddress();
}

function coRenderAddrForm() {
  const editing = co.editingAddr === 'new' ? null : co.editingAddr;
  document.getElementById('stepBody').innerHTML = '<div class="sheet">' +
    '<div class="sheet-head"><h2 id="addrFormTitle">Địa chỉ nhận hàng mới</h2>' +
    '<button class="ghost-btn" onclick="coCancelAddrForm()">‹ Quay lại</button></div>' +
    tgddAddrFormHtml() + '</div>';

  tgddAddrFormOpen(editing ? 'edit' : 'new', editing);
  coRenderSummary();
}

function coCancelAddrForm() {
  co.editingAddr = null;
  coRenderAddress();
}

/* address.js gọi lại sau khi lưu/xoá */
function onAddressSaved(id) {
  co.editingAddr = null;
  if (id) co.addrId = id;
  coRenderAddress();
}

/* ---------- Bước 2: giỏ hàng ---------- */
function coRenderCart() {
  const list = coLines();
  if (!list.length) {
    document.getElementById('stepBody').innerHTML = '<div class="sheet" style="text-align:center;padding:44px 20px">' +
      '<div style="font-size:48px;line-height:1">🛒</div>' +
      '<h2 style="font-size:18px;margin:12px 0 6px">Giỏ hàng đang trống</h2>' +
      '<p style="color:var(--muted);font-size:14px;margin:0 0 18px">Thêm sản phẩm để tiếp tục đặt hàng.</p>' +
      '<a class="btn-block" style="display:inline-block;max-width:260px;text-align:center" href="index.html">Về trang chủ</a></div>';
    coRenderSummary();
    return;
  }
  if (!Object.keys(co.selected).length) {
    list.forEach((l) => { co.selected[tgddCartLineId(l)] = true; });
  }

  const rows = list.map((l) => {
    const id = tgddCartLineId(l);
    const p = getProduct(l.productId) || {};
    const img = (p.colorImages && l.color && p.colorImages[l.color] && p.colorImages[l.color][0]) || p.img || '';
    return '<div class="cart-row">' +
      '<input type="checkbox" ' + (co.selected[id] ? 'checked' : '') + ' onchange="coToggleLine(\'' + id + '\')" aria-label="Chọn ' + tgddEsc(l.name) + '">' +
      '<div class="thumb-sm"><img src="' + img + '" alt=""></div>' +
      '<div style="min-width:0"><div class="pname">' + tgddEsc(l.name) + '</div>' +
      '<div class="pvar">' + tgddEsc(l.mem) + (l.color ? ' · ' + tgddEsc(l.color) : '') + '</div>' +
      '<div class="pprice">' + tgddMoney(l.price) + '</div></div>' +
      '<div class="row-act" style="text-align:right">' +
      '<div class="qty"><button type="button" onclick="coQty(\'' + id + '\',-1)" aria-label="Giảm">−</button>' +
      '<span>' + l.qty + '</span>' +
      '<button type="button" onclick="coQty(\'' + id + '\',1)" aria-label="Tăng">+</button></div>' +
      '<div><button class="rm" onclick="coRemove(\'' + id + '\')">Xoá</button></div>' +
      '</div></div>';
  }).join('');

  const all = list.every((l) => co.selected[tgddCartLineId(l)]);
  const n = coSelectedLines().length;

  document.getElementById('stepBody').innerHTML = '<div class="sheet">' +
    '<div class="sheet-head"><h2>Danh sách sản phẩm</h2>' +
    '<span class="hint">Đã chọn: <b>' + n + ' sản phẩm</b></span></div>' +
    '<label class="consent-check" style="border:0;padding:0 0 10px"><input type="checkbox" ' + (all ? 'checked' : '') +
    ' onchange="coToggleAll(this.checked)"><span><b>Chọn tất cả</b></span></label>' +
    '<div class="cart-list">' + rows + '</div>' +
    '<div style="text-align:center;margin-top:16px"><button class="rm" style="color:var(--red)" onclick="coClearCart()">Xoá tất cả sản phẩm</button></div>' +
    '</div>' +
    '<div style="display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap">' +
    '<button class="btn-block btn-ghost" style="max-width:200px" onclick="coGo(\'address\')">‹ Địa chỉ</button>' +
    '<button class="btn-block" style="max-width:320px" onclick="coGo(\'pay\')" ' + (n ? '' : 'disabled') + '>' +
    'Tiếp tục thanh toán</button></div>';

  coRenderSummary();
}

function coToggleLine(id) {
  if (co.selected[id]) delete co.selected[id];
  else co.selected[id] = true;
  coRenderCart();
}

function coToggleAll(on) {
  coLines().forEach((l) => {
    const id = tgddCartLineId(l);
    if (on) co.selected[id] = true; else delete co.selected[id];
  });
  coRenderCart();
}

function coQty(id, delta) {
  const l = coLines().find((x) => tgddCartLineId(x) === id);
  if (!l) return;
  tgddCartSetQty(id, l.qty + delta);
  coRenderCart();
}

function coRemove(id) {
  tgddCartRemove(id);
  delete co.selected[id];
  coRenderCart();
}

function coClearCart() {
  if (!confirm('Xoá tất cả sản phẩm khỏi giỏ hàng?')) return;
  tgddCartClear();
  co.selected = {};
  coRenderCart();
}
/* ---------- Bước 3: chi tiết giao hàng + thanh toán ---------- */
function coRenderPay() {
  const addr = coCurrentAddress();
  if (!addr) { co.step = 'address'; coRender(); return; }
  if (!coSelectedLines().length) { co.step = 'cart'; coRender(); return; }

  const shipOpts = Object.keys(SHIPPING).map((k) => {
    const s = SHIPPING[k];
    const feeTxt = s.fee ? tgddMoney(s.fee) : 'Miễn phí';
    return '<label class="ship-opt ' + (co.ship === k ? 'sel' : '') + '">' +
      '<input type="radio" name="ship" ' + (co.ship === k ? 'checked' : '') + ' onchange="coSetShip(\'' + k + '\')">' +
      '<div><div class="t">' + s.label + '</div><div class="d">' + s.desc + '</div></div>' +
      '<div class="p ' + (s.fee ? '' : 'free') + '">' + feeTxt + '</div></label>';
  }).join('');

  const shown = co.payMore ? PAY_METHODS : PAY_METHODS.slice(0, 3);
  const payOpts = shown.map((m) => {
    const sel = co.pay === m.id;
    return '<label class="pay-opt ' + (sel ? 'sel' : '') + '">' +
      '<input type="radio" name="pay" ' + (sel ? 'checked' : '') + ' onchange="coSetPay(\'' + m.id + '\')">' +
      '<span class="ic">' + m.ic + '</span>' +
      '<div style="min-width:0"><div>' + m.label + '</div><div class="sub">' + m.sub + '</div></div>' +
      (m.id === 'deposit' ? '<span class="badge">Cọc ' + tgddMoney(coPayAmount()) + '</span>' : '') +
      '</label>';
  }).join('');

  const depositNote = co.pay === 'deposit'
    ? '<div class="deposit-note"><b>Đơn này cần đặt cọc trước 50%.</b><br>' +
      'Số tiền cọc: <b>' + tgddMoney(coPayAmount()) + '</b>. Phần còn lại <b>' +
      tgddMoney(coTotal() - coPayAmount()) + '</b> thanh toán cho nhân viên khi nhận hàng. ' +
      'Đơn hàng chỉ được xử lý sau khi cửa hàng nhận đủ tiền cọc.</div>'
    : '';

  const items = coSelectedLines().map((l) => {
    const p = getProduct(l.productId) || {};
    const img = (p.colorImages && l.color && p.colorImages[l.color] && p.colorImages[l.color][0]) || p.img || '';
    return '<div class="cart-row" style="grid-template-columns:64px minmax(0,1fr) auto">' +
      '<div class="thumb-sm" style="width:64px;height:64px"><img src="' + img + '" alt=""></div>' +
      '<div style="min-width:0"><div class="pname">' + tgddEsc(l.name) + '</div>' +
      '<div class="pvar">' + tgddEsc(l.mem) + (l.color ? ' · ' + tgddEsc(l.color) : '') + '</div></div>' +
      '<div style="text-align:right"><div style="font-size:13px;color:var(--muted)">SL: ' + l.qty + '</div>' +
      '<div class="pprice" style="margin-top:4px">' + tgddMoney(l.price * l.qty) + '</div></div></div>';
  }).join('');

  const voucherBox = co.voucher
    ? '<div class="voucher-ok"><span>✓ ' + VOUCHERS[co.voucher].label + '</span>' +
      '<button type="button" onclick="coRemoveVoucher()">Bỏ mã</button></div>'
    : '<div class="voucher-row"><input id="voucherCode" placeholder="Nhập mã giảm giá" ' +
      'onkeydown="if(event.key===\'Enter\'){event.preventDefault();coApplyVoucher()}" ' +
      'style="padding:12px;border:1px solid var(--line);border-radius:9px;font-size:14px">' +
      '<button type="button" onclick="coApplyVoucher()">Áp dụng</button></div>' +
      '<p style="font-size:12px;color:var(--muted);margin:8px 0 0">Mã mẫu: WELCOME50, TGDD200, FREESHIP</p>';

  document.getElementById('stepBody').innerHTML =
    '<div class="sheet"><div class="sheet-head"><h2>Chi tiết giao hàng</h2></div>' +
    '<div class="addr-pick sel" style="cursor:default">' +
    '<div style="min-width:0"><div class="who">' + tgddEsc(addr.name) + ' · ' + tgddEsc(addr.phone) + '</div>' +
    '<div class="line">' + tgddEsc(tgddAddrFull(addr)) + '</div></div>' +
    '<div class="acts"><a onclick="coEditAddress(\'' + addr.id + '\')">Đổi ›</a></div></div>' +
    '<div class="label" style="font-size:13px;font-weight:700;margin:16px 0 10px">Đơn vị vận chuyển</div>' +
    shipOpts + '</div>' +

    '<div class="sheet"><div class="sheet-head"><h2>Sản phẩm &amp; quà tặng</h2>' +
    '<span class="hint">' + coSelectedLines().length + ' sản phẩm</span></div>' +
    items +
    '<div style="margin-top:14px;padding:14px;border:1px dashed var(--line);border-radius:10px;color:var(--muted);font-size:13px;text-align:center">' +
    '🎁 Quà tặng kèm đơn hàng sẽ được cập nhật sau.</div></div>' +

    '<div class="sheet"><div class="sheet-head"><h2>Mã giảm giá</h2></div>' + voucherBox + '</div>' +

    '<div class="sheet"><div class="sheet-head"><h2>Phương thức thanh toán</h2></div>' +
    payOpts + depositNote +
    '<button type="button" class="pay-more" onclick="coTogglePayMore()">' +
    (co.payMore ? 'Thu gọn ⌃' : (PAY_METHODS.length - 3) + ' hình thức thanh toán khác ⌄') + '</button></div>' +

    '<div style="display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap">' +
    '<button class="btn-block btn-ghost" style="max-width:200px" onclick="coGo(\'cart\')">‹ Giỏ hàng</button>' +
    '<button class="btn-block" style="max-width:340px" onclick="coPlaceOrder()">' +
    (co.pay === 'cod' ? 'Đặt hàng' : 'Thanh toán') + '</button></div>';

  coRenderSummary();
}

function coSetShip(k) { co.ship = k; coRenderPay(); }
function coSetPay(id) { co.pay = id; coRenderPay(); }
function coTogglePayMore() {
  co.payMore = !co.payMore;
  /* Nếu phương thức đang chọn nằm trong nhóm ẩn thì đưa về nhóm hiển thị */
  if (!co.payMore && PAY_METHODS.slice(3).some((m) => m.id === co.pay)) co.pay = 'cod';
  coRenderPay();
}

function coApplyVoucher() {
  const el = document.getElementById('voucherCode');
  const code = (el ? el.value : '').trim().toUpperCase();
  const v = VOUCHERS[code];
  if (!code) return showToast('Vui lòng nhập mã giảm giá.');
  if (!v) return showToast('Mã giảm giá không hợp lệ.');
  if (coSubtotal() < v.min) return showToast('Đơn hàng chưa đủ điều kiện áp dụng mã này.');
  co.voucher = code;
  showToast('Đã áp dụng mã ' + code + '.');
  coRenderPay();
}

function coRemoveVoucher() {
  co.voucher = null;
  coRenderPay();
}

/* Đặt hàng: tạo đơn rồi chuyển sang trang thanh toán / chi tiết đơn */
async function coPlaceOrder() {
  const user = tgddCurrentUser();
  if (!user) {
    showToast('Vui lòng đăng nhập để đặt hàng.');
    setTimeout(() => { location.href = 'index.html?login=1'; }, 900);
    return;
  }
  const addr = coCurrentAddress();
  if (!addr) { showToast('Vui lòng chọn địa chỉ nhận hàng.'); return; }

  const lines = coSelectedLines();
  const brandOf = (line) => {
    const p = products.find(x => x.id === line.productId);
    return p ? p.brand : 'Apple';
  };
  const code = await tgddCreateOrder({
    items: lines.map((l) => l.name + ' ' + l.mem + (l.color ? ' ' + l.color : '')).join('; '),
    itemLines: lines,
    brand: brandOf(lines[0]),
    qty: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: coSubtotal(),
    discount: coDiscount(),
    shippingFee: coShippingFee(),
    voucher: co.voucher,
    ship: co.ship,
    payMethod: co.pay,
    payAmount: coPayAmount(),
    total: coTotal(),
    address: addr,
    status: co.pay === 'cod' ? 'Đang tiếp nhận' : 'Chờ thanh toán'
  });
  if (!code) { showToast('Không tạo được đơn hàng. Vui lòng thử lại.'); return; }

  /* Đẩy đơn sang admin ngay: COD -> chờ duyệt; chuyển khoản -> chờ thanh toán */
  try {
    if (typeof adSyncCustomerOrders === 'function') adSyncCustomerOrders();
  } catch (e) { /* đồng bộ lỗi cũng không được chặn việc đặt hàng */ }

  /* Xoá khỏi giỏ những dòng đã đặt */
  const ordered = lines.map((l) => tgddCartLineId(l));
  tgddSaveCart(tgddCart().filter((l) => ordered.indexOf(tgddCartLineId(l)) < 0));
  co.selected = {};

  location.href = (co.pay === 'cod' ? 'order.html?code=' : 'pay.html?code=') + encodeURIComponent(code);
}

/* ---------- Điều hướng ---------- */
function coGo(step) {
  if (step === 'cart' && !tgddAddresses().length) {
    showToast('Vui lòng thêm địa chỉ nhận hàng trước.');
    step = 'address';
  }
  co.step = step;
  co.editingAddr = null;
  coRender();
}

function coRender() {
  /* Mở trang trực tiếp: chưa có lựa chọn thì chọn sẵn toàn bộ giỏ hàng */
  if (!Object.keys(co.selected).length) {
    coLines().forEach((l) => { co.selected[tgddCartLineId(l)] = true; });
  }
  coRenderSteps();
  document.querySelector('.co-wrap').classList.toggle('solo', co.step === 'address');
  if (co.step === 'address') coRenderAddress();
  else if (co.step === 'cart') coRenderCart();
  else coRenderPay();
  tgddRenderCartCount();
}

document.addEventListener('DOMContentLoaded', () => {
  const step = new URLSearchParams(location.search).get('step');
  co.step = CO_STEPS.indexOf(step) >= 0 ? step : 'address';
  if (co.step !== 'address' && !tgddAddresses().length) co.step = 'address';
  tgddRenderHeader();
  coRender();

  const form = document.getElementById('searchForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    location.href = 'index.html?q=' + encodeURIComponent(document.getElementById('searchInput').value);
  });
});


