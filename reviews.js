/* Đánh giá mẫu theo phong cách thegioididong.com cho 12 máy hiện có.
   Seed + localStorage. Dùng chung cho product.html (chi tiết) và index.html (đếm). */
const productReviewsSeed = {
 10: [
  {name:'Minh Tuấn', stars:5, date:'28/10/2026', content:'Máy mỏng nhẹ mà pin trâu thật, xem video cả ngày còn ~30%. Camera 48MP chụp đêm rõ, màu Đỏ Burgundy ngoài đẹp hơn ảnh.', likes:42},
  {name:'Thu Hằng', stars:5, date:'21/10/2026', content:'Nhân viên giao nhanh trong 2 giờ, máy nguyên seal, kích hoạt bảo hành dễ. Màn 6.9 inch sáng rõ ngoài trời.', likes:31},
  {name:'Quốc Bảo', stars:4, date:'15/10/2026', content:'Chip A20 Pro mạnh, quay 4K/120fps không nóng. Trừ 1 sao vì sạc 60W phải mua riêng, hộp chỉ có cáp.', likes:18}
 ],
 13: [
  {name:'Hoàng Nam', stars:5, date:'25/10/2026', content:'Bản 6.3 inch gọn tay, đút túi thoải mái. Camera tele 5x chụp chân dung xóa phông đẹp.', likes:22},
  {name:'Lan Anh', stars:5, date:'18/10/2026', content:'Mua trả góp 0% thủ tục nhanh, máy mát khi chơi game nặng. Màu Băng Thanh lạ, sang.', likes:15},
  {name:'Đức Huy', stars:4, date:'10/10/2026', content:'Pin 36 giờ đúng như quảng cáo với nhu cầu thường. Mong bản sau có sạc kèm theo máy.', likes:9}
 ],
 14: [
  {name:'Phương Thảo', stars:5, date:'26/10/2026', content:'iPhone Air mỏng 5.64mm cầm nhẹ tênh, bỏ túi quần không cấn. Màn 120Hz mượt, Face ID nhanh.', likes:27},
  {name:'Văn Dũng', stars:5, date:'19/10/2026', content:'Pin dùng cả ngày văn phòng, sạc MagSafe tiện. eSIM chuyển mạng giữ số rất nhanh tại shop.', likes:12},
  {name:'Ngọc Linh', stars:4, date:'12/10/2026', content:'Chỉ 1 camera sau nhưng chụp đủ sáng rất tốt. Ai cần zoom xa thì nên lên bản Pro.', likes:8}
 ],
 11: [
  {name:'Thanh Sơn', stars:5, date:'27/10/2026', content:'Lên từ 14 Pro Max thấy khác biệt rõ: màn sáng hơn, chip A19 Pro chơi Genshin max setting không drop.', likes:56},
  {name:'Mỹ Duyên', stars:5, date:'20/10/2026', content:'Màu Cam Vũ Trụ độc, ai cũng hỏi. Thu cũ đổi mới được định giá minh bạch, bù thêm hợp lý.', likes:34},
  {name:'Hữu Phước', stars:5, date:'11/10/2026', content:'Quay ProRes 4K/120fps làm vlog nét căng. Pin 33 giờ đi du lịch 2 ngày không cần sạc dự phòng.', likes:29}
 ],
 1: [
  {name:'Công Vinh', stars:5, date:'24/10/2026', content:'Bản Pro 6.3 inch vừa tay, khung titan nhẹ. Chụp đêm ít nhiễu hơn hẳn đời trước.', likes:19},
  {name:'Kim Ngân', stars:4, date:'16/10/2026', content:'Máy tốt, giao hàng đúng hẹn. Trừ 1 sao vì màu Xanh Đậm hết hàng phải đợi 3 ngày.', likes:7}
 ],
 2: [
  {name:'Anh Khoa', stars:5, date:'28/10/2026', content:'S Pen viết vẽ chính xác, màn QHD+ xem phim đã mắt. Camera 200MP zoom 100x đi concert chụp rõ sân khấu.', likes:48},
  {name:'Bích Ngọc', stars:5, date:'22/10/2026', content:'Galaxy AI dịch trực tiếp cuộc gọi tiếng Việt chuẩn. Pin 5000mAh dùng 1.5 ngày, sạc 45W nhanh.', likes:33},
  {name:'Tấn Phát', stars:4, date:'14/10/2026', content:'Khung titan sang nhưng hơi trơn, nên mua ốp. Còn lại hoàn hảo trong tầm giá flagship.', likes:14}
 ],
 3: [
  {name:'Nhật Minh', stars:5, date:'26/10/2026', content:'Camera Leica chụp chân dung màu film đẹp không cần chỉnh. Sạc 100W sạc 15 phút dùng cả buổi.', likes:25},
  {name:'Hồng Nhung', stars:5, date:'17/10/2026', content:'Màn 1.5K 120Hz sáng rõ ngoài trời, chip 8 Elite Gen 5 chơi game mát. Có sẵn củ sạc trong hộp.', likes:17},
  {name:'Gia Huy', stars:4, date:'09/10/2026', content:'HyperOS 3 mượt, ít quảng cáo hơn trước. Loa ngoài hơi nhỏ khi xem phim.', likes:6}
 ],
 4: [
  {name:'Xuân Mai', stars:5, date:'23/10/2026', content:'Reno16 Pro chụp chân dung da đẹp, màn cong nhẹ vuốt sướng. Sạc 80W đầy pin trong lúc ăn cơm.', likes:13},
  {name:'Thế Anh', stars:4, date:'13/10/2026', content:'Thiết kế mỏng nhẹ, màu Trắng sang. Chơi game nặng hơi ấm nhẹ nhưng không lag.', likes:5}
 ],
 5: [
  {name:'Hải Đăng', stars:5, date:'25/10/2026', content:'Tele APO 200MP zoom xa vẫn nét, ống kính Zeiss chụp đêm ít flare. Màn 2K sáng đỉnh đi nắng vẫn rõ.', likes:11},
  {name:'Quỳnh Chi', stars:5, date:'15/10/2026', content:'Bản Xanh Lá vân da cầm êm, không bám vân tay. Sạc 90W + sạc không dây đầy đủ.', likes:8}
 ],
 6: [
  {name:'Văn Trọng', stars:5, date:'27/10/2026', content:'Tầm giá 9 triệu mà có màn Super AMOLED 120Hz, camera OIS chụp đêm tốt. Pin cả ngày đi làm.', likes:61},
  {name:'Thu Trang', stars:5, date:'21/10/2026', content:'Mua cho phụ huynh dùng đơn giản, chữ to rõ. Trả góp 0% mỗi tháng vài trăm nghìn.', likes:38},
  {name:'Đình Luân', stars:4, date:'12/10/2026', content:'Máy tốt trong tầm giá, chỉ tiếc không có củ sạc kèm. Nên mua thêm sạc 25W.', likes:16}
 ],
 7: [
  {name:'Bảo Châu', stars:5, date:'28/10/2026', content:'iPhone 17 gọn nhẹ 177g, màu Tím Oải Hương đẹp. Chip A19 dùng AI tiếng Việt tiện.', likes:73},
  {name:'Minh Đức', stars:5, date:'22/10/2026', content:'Camera Fusion 48MP quay Dolby Vision nét. Pin 27 giờ đi học cả ngày không lo.', likes:45},
  {name:'Thanh Nhã', stars:4, date:'16/10/2026', content:'Màn 120Hz mượt mà, chỉ mong dung lượng khởi điểm 256GB giá mềm hơn chút.', likes:21}
 ],
 9: [
  {name:'Hoài Nam', stars:5, date:'24/10/2026', content:'Giá 6 triệu mà pin 5000mAh dùng 2 ngày, màn 120Hz lướt TikTok mượt. Mua cho con học online hợp lý.', likes:29},
  {name:'Cẩm Tú', stars:4, date:'14/10/2026', content:'Chip đủ dùng Zalo, YouTube. Camera đủ sáng tốt, chụp đêm hơi nhiễu nhưng tầm giá này ổn.', likes:11}
 ],
 12: [
  {name:'Phúc Lâm', stars:5, date:'26/10/2026', content:'Khung titan bền, nút Camera Control bấm chụp nhanh. Quay 4K/120fps làm YouTube chuyên nghiệp.', likes:39},
  {name:'Diệu Hương', stars:5, date:'18/10/2026', content:'Màu Titan Sa Mạc sang, máy mát khi quay lâu. Đổi từ 13 Pro Max thấy đáng tiền.', likes:24},
  {name:'Khắc Cường', stars:4, date:'08/10/2026', content:'Mọi thứ tốt, chỉ hơi nặng 227g khi cầm lâu. Bù lại pin 33 giờ rất trâu.', likes:13}
 ]
};

const TGDD_REVIEW_KEY = 'tgdd_reviews_v1';

function tgddSeedReviews(pid){
  pid=resolveReviewKey(pid);
  return (productReviewsSeed[pid] || []).map(function(r, i){
    return {id:'seed-'+pid+'-'+i, name:r.name, stars:r.stars, date:r.date, content:r.content, likes:r.likes||0, seed:true};
  });
}
function tgddUserReviews(pid){
  pid=resolveReviewKey(pid);
  try{
    const all = JSON.parse(localStorage.getItem(TGDD_REVIEW_KEY) || '{}');
    const list = all[pid];
    return Array.isArray(list) ? list : [];
  }catch(e){ return []; }
}
function getReviews(pid){
  pid=resolveReviewKey(pid);
  return tgddUserReviews(pid).concat(tgddSeedReviews(pid));
}
function reviewStats(pid){
  pid=resolveReviewKey(pid);
  const list = getReviews(pid);
  const total = list.length;
  const counts = {5:0,4:0,3:0,2:0,1:0};
  let sum = 0;
  list.forEach(function(r){
    const s = Math.max(1, Math.min(5, Number(r.stars)||5));
    counts[s]++; sum += s;
  });
  const avg = total ? (sum/total) : 5;
  return {total:total, counts:counts, avg:Math.round(avg*10)/10};
}
function addUserReview(pid, name, stars, content){
  pid=resolveReviewKey(pid);
  const all = {};
  try{ Object.assign(all, JSON.parse(localStorage.getItem(TGDD_REVIEW_KEY) || '{}')); }catch(e){}
  const list = Array.isArray(all[pid]) ? all[pid] : [];
  const item = {
    id:'u-'+Date.now(),
    name:(name||'Khách').trim()||'Khách',
    stars:Math.max(1, Math.min(5, Number(stars)||5)),
    date:new Date().toLocaleDateString('vi-VN'),
    content:(content||'').trim(),
    likes:0
  };
  list.unshift(item);
  all[pid] = list;
  try{ localStorage.setItem(TGDD_REVIEW_KEY, JSON.stringify(all)); }catch(e){}
  return item;
}
function likeReview(pid, rid){
  // Chỉ cho like review seed (demo). Like user-review bỏ qua.
  try{
    const k = TGDD_REVIEW_KEY+'_likes';
    const liked = JSON.parse(localStorage.getItem(k) || '{}');
    if(liked[rid]) return false;
    liked[rid] = 1;
    localStorage.setItem(k, JSON.stringify(liked));
    return true;
  }catch(e){ return false; }
}
function hasLikedReview(rid){
  try{
    const liked = JSON.parse(localStorage.getItem(TGDD_REVIEW_KEY+'_likes') || '{}');
    return !!liked[rid];
  }catch(e){ return false; }
}

/* Tra theo TÊN máy để không lệch ID khi chạy qua backend/CSDL. */
const reviewIdByName={
 'iphone 18 pro max':10,
 'iphone 18 pro':13,
 'iphone air':14,
 'iphone 17 pro max':11,
 'iphone 17 pro':1,
 'samsung galaxy s26 ultra':2,
 'xiaomi 17t 5g':3,
 'oppo reno16 pro 5g':4,
 'vivo x300 ultra':5,
 'samsung galaxy a37 5g':6,
 'iphone 17':7,
 'realme c100x':9,
 'iphone 16 pro max':12
};
function normName(s){return (s||'').toLowerCase().replace(/\s+/g,' ').trim();}
function resolveReviewKey(p){
 if(p&&typeof p==='object'){
  const k=reviewIdByName[normName(p.name)];
  if(k!=null)return k;
  return p.id;
 }
 if(p&&typeof p==='object')return p;
 return p;
}

/* ---------- Hiển thị kiểu TGDĐ trên trang chủ ---------- */
/* Điểm + lượt đánh giá cho thẻ sản phẩm. Ưu tiên điểm từ review seed/user,
   fallback về p.rating khi chưa có reviews.js dữ liệu. */
function cardRatingHtml(p){
  try{
    if(typeof reviewStats==='function'){
      const st=reviewStats(p);
      if(st&&st.total) return '<strong>★ '+st.avg+'</strong> · '+st.total+' đánh giá · Đã bán '+p.sold;
    }
  }catch(e){}
  return '<strong>★ '+p.rating+'</strong> · Đã bán '+p.sold;
}
/* Dòng cấu hình tóm tắt kiểu TGDĐ: màn · chip · pin · camera.
   Đọc từ productInfo nếu có, fallback chuỗi rỗng. */
function cardSpecLine(p){
  try{
    const inf=(typeof getProductInfo==='function')?getProductInfo(p):((typeof productInfo!=='undefined')?productInfo[p.id]:null);
    if(!inf) return '';
    const groups=inf.specs||[];
    const find=function(key){
      for(const g of groups) for(const r of (g.rows||[])){
        if(r[0]&&r[0].toLowerCase().indexOf(key)>=0) return Array.isArray(r[1])?r[1][0]:r[1];
      }
      return '';
    };
    const man=find('màn hình rộng')||find('màn hình');
    const chip=find('chip xử lý');
    const pin=find('dung lượng pin');
    const cam=find('độ phân giải camera sau');
    const parts=[man,chip,cam,pin].filter(Boolean);
    if(!parts.length) return '';
    return parts.slice(0,3).join(' · ');
  }catch(e){ return ''; }
}
