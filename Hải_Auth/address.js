/* Chọn địa chỉ nhận hàng: Tỉnh/Thành phố → Phường/Xã (2 cấp), số nhà bắt buộc,
   bản đồ ghim vị trí, sửa lại được sau khi đã chọn. */

/* Toạ độ tâm 34 tỉnh/thành (dùng khi chưa có ghim chính xác) */
const TGDD_PROVINCE_CENTER = {
  'Thành phố Hà Nội': [21.0285, 105.8542],
  'Tỉnh Cao Bằng': [22.6657, 106.2522],
  'Tỉnh Tuyên Quang': [21.8236, 105.2140],
  'Tỉnh Điện Biên': [21.3860, 103.0230],
  'Tỉnh Lai Châu': [22.3964, 103.4582],
  'Tỉnh Sơn La': [21.3270, 103.9141],
  'Tỉnh Lào Cai': [22.4856, 103.9707],
  'Tỉnh Thái Nguyên': [21.5942, 105.8482],
  'Tỉnh Lạng Sơn': [21.8537, 106.7615],
  'Thành phố Quảng Ninh': [21.0064, 107.2925],
  'Thành phố Bắc Ninh': [21.1861, 106.0763],
  'Tỉnh Phú Thọ': [21.3988, 105.2247],
  'Thành phố Hải Phòng': [20.8449, 106.6881],
  'Tỉnh Hưng Yên': [20.6464, 106.0511],
  'Tỉnh Ninh Bình': [20.2506, 105.9745],
  'Tỉnh Thanh Hóa': [19.8067, 105.7852],
  'Tỉnh Nghệ An': [18.6796, 105.6813],
  'Tỉnh Hà Tĩnh': [18.3559, 105.8878],
  'Tỉnh Quảng Trị': [16.7500, 107.2000],
  'Thành phố Huế': [16.4637, 107.5909],
  'Thành phố Đà Nẵng': [16.0544, 108.2022],
  'Tỉnh Quảng Ngãi': [15.1214, 108.8044],
  'Tỉnh Gia Lai': [13.9833, 108.0000],
  'Tỉnh Khánh Hòa': [12.2585, 109.0526],
  'Tỉnh Đắk Lắk': [12.7100, 108.2378],
  'Tỉnh Lâm Đồng': [11.5753, 108.1429],
  'Thành phố Đồng Nai': [10.9574, 106.8427],
  'Thành phố Hồ Chí Minh': [10.7769, 106.7009],
  'Tỉnh Tây Ninh': [11.3352, 106.1096],
  'Tỉnh Đồng Tháp': [10.4938, 105.6882],
  'Tỉnh Vĩnh Long': [10.2537, 105.9722],
  'Tỉnh An Giang': [10.5216, 105.1259],
  'Thành phố Cần Thơ': [10.0452, 105.7469],
  'Tỉnh Cà Mau': [9.1769, 105.1524]
};

const TGDD_VN_CENTER = [16.0, 106.0];

/* ---------- Bản đồ (Leaflet tải từ CDN khi có mạng) ---------- */
let tgddMap = null;
let tgddMarker = null;
let tgddLeafletLoading = null;

function tgddLoadLeaflet() {
  if (window.L) return Promise.resolve(true);
  if (tgddLeafletLoading) return tgddLeafletLoading;
  tgddLeafletLoading = new Promise((resolve) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => resolve(true);
    js.onerror = () => resolve(false);
    document.head.appendChild(js);

    /* Không có mạng thì bỏ cuộc sau 6s để form vẫn dùng được */
    setTimeout(() => { if (!window.L) resolve(false); }, 6000);
  });
  return tgddLeafletLoading;
}

function tgddMapFallback(box, lat, lon) {
  box.innerHTML = '<div class="map-fallback">' +
    '<div><div style="font-size:34px;line-height:1">📍</div>' +
    '<p style="margin:8px 0 0">Bản đồ cần kết nối mạng để hiển thị.<br>' +
    'Toạ độ đã ghim: <b>' + lat.toFixed(5) + ', ' + lon.toFixed(5) + '</b></p></div></div>';
}

/* Khởi tạo hoặc cập nhật bản đồ; trả về Promise<boolean> */
function tgddInitMap(boxId, lat, lon, onPick) {
  const box = document.getElementById(boxId);
  if (!box) return Promise.resolve(false);
  const center = (lat && lon) ? [lat, lon] : TGDD_VN_CENTER;

  return tgddLoadLeaflet().then((ok) => {
    if (!ok) { tgddMapFallback(box, center[0], center[1]); return false; }

    if (tgddMap && tgddMap._container && tgddMap._container.id === boxId) {
      tgddMap.setView(center, lat ? 16 : 5);
      if (lat && lon) tgddMarker.setLatLng(center);
      return true;
    }
    if (tgddMap) { tgddMap.remove(); tgddMap = null; tgddMarker = null; }

    box.innerHTML = '';
    tgddMap = L.map(box, { center, zoom: lat ? 16 : 5, scrollWheelZoom: true });
    /* Nhiều mạng chặn tile.openstreetmap.org nên dùng máy chủ OSM France trước,
       tự chuyển về tile OSM gốc nếu lớp đầu không tải được. */
    const mainTiles = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(tgddMap);
    const backupTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });
    let tileOk = 0;
    mainTiles.on('tileload', () => { tileOk++; });
    setTimeout(() => {
      if (tileOk === 0 && tgddMap) { tgddMap.removeLayer(mainTiles); backupTiles.addTo(tgddMap); }
    }, 3000);

    if (lat && lon) {
      tgddMarker = L.marker(center, { draggable: true }).addTo(tgddMap);
    }
    const place = (ll) => {
      if (!tgddMarker) {
        tgddMarker = L.marker(ll, { draggable: true }).addTo(tgddMap);
        tgddMarker.on('dragend', () => onPick(tgddMarker.getLatLng().lat, tgddMarker.getLatLng().lng));
      } else {
        tgddMarker.setLatLng(ll);
      }
      onPick(ll.lat, ll.lng);
    };
    tgddMap.on('click', (e) => place(e.latlng));
    /* Cho phép kéo ghim để chỉnh vị trí chính xác */
    if (tgddMarker) {
      tgddMarker.on('dragend', () => onPick(tgddMarker.getLatLng().lat, tgddMarker.getLatLng().lng));
    }
    /* Khung chứa có thể chưa có kích thước tại thời điểm khởi tạo → tính lại sau khi layout xong */
    setTimeout(() => { if (tgddMap) tgddMap.invalidateSize(); }, 60);
    setTimeout(() => { if (tgddMap) tgddMap.invalidateSize(); }, 400);
    return true;
  });
}

function tgddMapSetView(lat, lon) {
  if (tgddMap && lat && lon) {
    tgddMap.setView([lat, lon], 16);
    if (tgddMarker) tgddMarker.setLatLng([lat, lon]);
    else tgddMarker = L.marker([lat, lon], { draggable: true }).addTo(tgddMap);
  }
}

/* ---------- Danh mục tỉnh / phường-xã ---------- */
function tgddProvinces() {
  return (typeof VN_ADDRESS !== 'undefined') ? VN_ADDRESS.map((p) => p[0]) : [];
}
function tgddWards(province) {
  if (typeof VN_ADDRESS === 'undefined') return [];
  const row = VN_ADDRESS.find((p) => p[0] === province);
  return row ? row[1] : [];
}
function tgddProvinceCenter(province) {
  return TGDD_PROVINCE_CENTER[province] || TGDD_VN_CENTER;
}

/* Điền <option> vào select */
function tgddFillSelect(sel, items, placeholder, value) {
  if (!sel) return;
  sel.innerHTML = '<option value="">' + placeholder + '</option>' +
    items.map((x) => '<option value="' + tgddEsc(x) + '"' + (x === value ? ' selected' : '') + '>' +
      tgddEsc(x) + '</option>').join('');
}

/* ---------- Form địa chỉ ---------- */
const tgddAddrState = {
  id: null,
  lat: null,
  lon: null,
  mode: 'new'          /* 'new' | 'edit' | 'pick' */
};

function tgddAddrFormOpen(mode, addr) {
  tgddAddrState.mode = mode || 'new';
  tgddAddrState.id = addr ? addr.id : null;
  tgddAddrState.lat = addr && addr.lat ? addr.lat : null;
  tgddAddrState.lon = addr && addr.lon ? addr.lon : null;

  const user = tgddCurrentUser() || {};
  document.getElementById('adName').value = (addr && addr.name) || user.name || '';
  document.getElementById('adPhone').value = (addr && addr.phone) || user.phone || '';
  document.getElementById('adStreet').value = (addr && addr.street) || '';
  document.getElementById('adNote').value = (addr && addr.note) || '';
  document.getElementById('adDefault').checked = addr ? !!addr.default : tgddAddresses().length === 0;

  const prov = (addr && addr.province) || '';
  tgddFillSelect(document.getElementById('adProvince'), tgddProvinces(), '-- Chọn Tỉnh/Thành phố --', prov);
  tgddFillSelect(document.getElementById('adWard'), prov ? tgddWards(prov) : [], '-- Chọn Phường/Xã --',
    (addr && addr.ward) || '');

  document.querySelectorAll('#addrForm .field').forEach((f) => f.classList.remove('invalid'));

  const center = prov ? tgddProvinceCenter(prov) : TGDD_VN_CENTER;
  const lat = tgddAddrState.lat || center[0];
  const lon = tgddAddrState.lon || center[1];
  tgddInitMap('adMap', lat, lon, (la, lo) => {
    tgddAddrState.lat = la;
    tgddAddrState.lon = lo;
    const hint = document.getElementById('adMapCoords');
    if (hint) hint.textContent = la.toFixed(5) + ', ' + lo.toFixed(5);
  }).then((ok) => {
    const hint = document.getElementById('adMapCoords');
    if (hint && ok) hint.textContent = lat.toFixed(5) + ', ' + lon.toFixed(5);
  });

  document.getElementById('addrFormTitle').textContent =
    tgddAddrState.mode === 'edit' ? 'Sửa địa chỉ nhận hàng' : 'Địa chỉ nhận hàng mới';
}

/* Tỉnh đổi → nạp lại danh sách phường/xã + di chuyển bản đồ */
function tgddOnProvinceChange() {
  const prov = document.getElementById('adProvince').value;
  tgddFillSelect(document.getElementById('adWard'), prov ? tgddWards(prov) : [], '-- Chọn Phường/Xã --', '');
  if (prov) {
    const c = tgddProvinceCenter(prov);
    tgddAddrState.lat = c[0];
    tgddAddrState.lon = c[1];
    tgddMapSetView(c[0], c[1]);
  }
}

/* Xác nhận địa chỉ: kiểm tra bắt buộc rồi lưu */
function tgddAddrFormSubmit() {
  const name = document.getElementById('adName').value.trim();
  const phone = document.getElementById('adPhone').value.trim().replace(/\s/g, '');
  const province = document.getElementById('adProvince').value;
  const ward = document.getElementById('adWard').value;
  const street = document.getElementById('adStreet').value.trim();

  let bad = null;
  const mark = (id, ok) => {
    const f = document.getElementById(id).closest('.field');
    f.classList.toggle('invalid', !ok);
    if (!ok && !bad) bad = id;
  };
  mark('adName', name.length >= 2);
  mark('adPhone', /^0\d{9}$/.test(phone));
  mark('adProvince', !!province);
  mark('adWard', !!ward);
  mark('adStreet', street.length >= 3);

  if (bad) {
    const el = document.getElementById(bad);
    el.focus();
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    showToast('Vui lòng nhập đủ thông tin bắt buộc, gồm cả số nhà.');
    return;
  }

  const addr = {
    id: tgddAddrState.id,
    name, phone, province, ward, street,
    note: document.getElementById('adNote').value.trim(),
    lat: tgddAddrState.lat,
    lon: tgddAddrState.lon,
    default: document.getElementById('adDefault').checked
  };
  const id = tgddAddressSave(addr);
  showToast(tgddAddrState.mode === 'edit' ? 'Đã cập nhật địa chỉ.' : 'Đã lưu địa chỉ nhận hàng.');
  tgddAddrFormClose();
  if (typeof onAddressSaved === 'function') onAddressSaved(id);
}

function tgddAddrFormClose() {
  if (tgddMap) { tgddMap.remove(); tgddMap = null; tgddMarker = null; }
  if (typeof onAddressFormClosed === 'function') onAddressFormClosed();
}

function tgddAddrFormCancel() {
  tgddAddrFormClose();
}

function tgddAddrDelete(id) {
  if (!confirm('Xoá địa chỉ này?')) return;
  tgddAddressDelete(id);
  showToast('Đã xoá địa chỉ.');
  if (typeof onAddressSaved === 'function') onAddressSaved(null);
}

/* Markup form địa chỉ dùng chung cho trang thanh toán và sổ địa chỉ trong tài khoản */
function tgddAddrFormHtml() {
  return '<form id="addrForm" onsubmit="event.preventDefault();tgddAddrFormSubmit()">' +
    '<div class="field-row">' +
    '<div class="field"><label for="adName">Họ và tên <span class="req">*</span></label>' +
    '<input id="adName" placeholder="Nguyễn Văn A" autocomplete="name"><div class="err">Nhập họ tên người nhận.</div></div>' +
    '<div class="field"><label for="adPhone">Số điện thoại <span class="req">*</span></label>' +
    '<input id="adPhone" placeholder="09xx xxx xxx" inputmode="tel" autocomplete="tel"><div class="err">Số điện thoại phải gồm 10 số, bắt đầu bằng 0.</div></div>' +
    '</div>' +
    '<div class="field"><label for="adProvince">Tỉnh / Thành phố <span class="req">*</span></label>' +
    '<select id="adProvince" onchange="tgddOnProvinceChange()"></select><div class="err">Chọn Tỉnh/Thành phố.</div></div>' +
    '<div class="field"><label for="adWard">Phường / Xã <span class="req">*</span></label>' +
    '<select id="adWard"></select><div class="err">Chọn Phường/Xã.</div></div>' +
    '<div class="field"><label for="adStreet">Số nhà, tên đường <span class="req">*</span></label>' +
    '<input id="adStreet" placeholder="Ví dụ: số 12, ngõ 34 đường Nguyễn Trãi"><div class="err">Vui lòng ghi rõ số nhà và tên đường.</div></div>' +
    '<div class="field"><label for="adNote">Ghi chú giao hàng</label>' +
    '<input id="adNote" placeholder="Ví dụ: gọi trước khi giao, giao giờ hành chính"></div>' +
    '<div class="field"><label>Ghim vị trí nhận hàng trên bản đồ</label>' +
    '<div class="map-box" id="adMap"></div>' +
    '<p class="map-note">Chạm vào bản đồ để đặt ghim, hoặc kéo ghim để chỉnh lại cho đúng vị trí. ' +
    'Toạ độ: <b id="adMapCoords">—</b></p></div>' +
    '<label class="consent-check" style="border:0;padding:4px 0"><input type="checkbox" id="adDefault">' +
    '<span>Đặt làm địa chỉ mặc định</span></label>' +
    '<button type="submit" class="btn-block" style="margin-top:16px">Xác nhận địa chỉ</button>' +
    '</form>';
}

/* Định dạng địa chỉ đầy đủ để hiển thị */
function tgddAddrFull(a) {
  if (!a) return '';
  return [a.street, a.ward, a.province].filter(Boolean).join(', ');
}
