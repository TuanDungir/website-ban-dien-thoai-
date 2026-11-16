/* Nội dung giới thiệu & thông số kỹ thuật chi tiết theo từng sản phẩm.
   Khoá là id sản phẩm trong data.js. Sản phẩm không có ở đây sẽ dùng nội dung mặc định. */
const productInfo={
 10:{
  intro:{
   heading:'Đặc điểm nổi bật',
   bullets:[
    'Hệ thống camera Pro Fusion 48MP, khẩu độ tùy chỉnh đến f/1.48 giúp ảnh thiếu sáng rõ nét và có chiều sâu',
    'Photographic Styles 3 tinh chỉnh kết cấu, độ nhiễu hạt và hiệu ứng phim ngay khi chụp',
    'A20 Pro kết hợp buồng hơi thế hệ mới, hiệu năng duy trì cao hơn đến 40% so với thế hệ trước',
    'Viên pin lớn nhất dòng iPhone 18, xem video đến 43 giờ',
    'Màn hình lớn 6.9 inch ProMotion 120Hz, độ sáng ngoài trời 3.000 nit, Dynamic Island hiển thị được 3 hoạt động trực tiếp cùng lúc',
    'Apple Intelligence trên iOS 27 dùng được bằng tiếng Việt',
    'Modem C2 và chip N1 hỗ trợ Wi-Fi 7, Bluetooth 6 cho kết nối nhanh và ổn định',
    'Khung nhôm nguyên khối, mặt trước Ceramic Shield 2 bền và chống trầy tốt',
    'Có 4 màu Đen (Black), Bạc (Silver), Băng Thanh (Glacier) và Đỏ Burgundy (Burgundy)',
    'Bản 256GB có giá thấp nhất trong dòng iPhone 18 Pro Max, đủ dùng cho nhu cầu phổ biến'
   ]
  },
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[
    ['Hệ điều hành','iOS 27'],
    ['Chip xử lý (CPU)','Apple A20 Pro 6 lõi'],
    ['Tốc độ CPU','Hãng không công bố'],
    ['Chip đồ họa (GPU)','Apple GPU 7 lõi'],
    ['RAM','Hãng không công bố'],
    ['Dung lượng lưu trữ','256 GB'],
    ['Thẻ nhớ','Không'],
    ['Danh bạ','Không giới hạn']
   ]},
   {group:'Camera & Màn hình',rows:[
    ['Độ phân giải camera sau','Chính 48 MP & Phụ 48 MP, 48 MP'],
    ['Quay phim camera sau',[
     '2.8K 60fps',
     '4K 2160p@100fps',
     '4K 2160p@120fps',
     '4K 2160p@24fps',
     '4K 2160p@25fps',
     '4K 2160p@30fps',
     '4K 2160p@60fps',
     'FullHD 1080p@120fps',
     'FullHD 1080p@25fps',
     'FullHD 1080p@30fps',
     'FullHD 1080p@60fps',
     'HD 720p@30fps'
    ]],
    ['Đèn Flash camera sau','Có'],
    ['Tính năng camera sau',[
     'Ban đêm (Night Mode)',
     'Chế độ chân dung',
     'Chế độ hành động (Action Mode)',
     'Chống rung quang học (OIS)',
     'Chụp ảnh liên tục',
     'Cinematic',
     'Deep Fusion',
     'Flash True Tone Thích ứng',
     'Góc siêu rộng (Ultrawide)',
     'Gắn thẻ địa lý (Geotagging)',
     'Hiệu chỉnh mặt độ nâng cao',
     'Hỗ trợ Genlock',
     'Live Photos',
     'Lấy nét theo pha (PDAF)',
     'Máy ảnh không gian',
     'Phong Cách Nhiếp Ảnh 3',
     'Photonic Engine',
     'Quay chậm (Slow Motion)',
     'Quay video ProRes',
     'Quay video QuickTake',
     'Quay video hiển thị kép',
     'Quay video không gian',
     'Quay video macro',
     'Quay video định dạng Apple Log 2',
     'Siêu cận (Macro)',
     'Siêu độ phân giải',
     'Smart HDR 5',
     'Toàn cảnh (Panorama)',
     'Trôi nhanh thời gian (Time Lapse)',
     'Tự động lấy nét (AF)',
     'Zoom kỹ thuật số',
     'Zoom quang học',
     'Ảnh Raw'
    ]],
    ['Độ phân giải camera trước','18 MP'],
    ['Tính năng camera trước',[
     'Center Stage cho ảnh và video',
     'Chế độ chân dung',
     'Chống rung điện tử kỹ thuật số (EIS)',
     'Chụp đêm',
     'Chụp ảnh Raw',
     'Chụp ảnh liên tục',
     'Cinematic',
     'Deep Fusion',
     'Live Photos',
     'Nhãn dán (AR Stickers)',
     'Phong Cách Nhiếp Ảnh 3',
     'Photonic Engine',
     'Quay chậm (Slow Motion)',
     'Quay video 4K',
     'Quay video Full HD',
     'Quay video ProRes',
     'Quay video QuickTake',
     'Quay video định dạng Apple Log 2',
     'Retina Flash',
     'Smart HDR 5',
     'Trôi nhanh thời gian (Time Lapse)',
     'Tự động lấy nét (AF)',
     'Video hiển thị kép'
    ]],
    ['Công nghệ màn hình','OLED'],
    ['Độ phân giải màn hình','Super Retina XDR (1320 x 2868 Pixels)'],
    ['Màn hình rộng','6.9" - 120 Hz'],
    ['Độ sáng tối đa','3000 nits'],
    ['Mặt kính cảm ứng','Kính cường lực Ceramic Shield 2']
   ]},
   {group:'Pin & Sạc',rows:[
    ['Dung lượng pin','43 giờ'],
    ['Loại pin','Li-Ion'],
    ['Hỗ trợ sạc tối đa','60 W'],
    ['Sạc kèm theo máy','Không'],
    ['Công nghệ pin',['Sạc không dây MagSafe','Sạc pin nhanh','Tiết kiệm pin']]
   ]},
   {group:'Tiện ích',rows:[
    ['Bảo mật nâng cao','Mở khoá khuôn mặt 3D'],
    ['Kháng nước, bụi','IP68'],
    ['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],
    ['Radio','Không'],
    ['Đèn pin','Không'],
    ['Xem phim',['AV1','H.264','HEVC','ProRes']],
    ['Nghe nhạc',['AAC','APAC','Apple Lossless','FLAC','MP3']]
   ]},
   {group:'Kết nối',rows:[
    ['Mạng di động','Hỗ trợ 5G'],
    ['SIM','1 Nano SIM & 1 eSIM'],
    ['Wifi',['Wi-Fi 7','Wi-Fi MIMO']],
    ['GPS',['BEIDOU','GALILEO','GLONASS','GPS','NavIC','QZSS','iBeacon']],
    ['Bluetooth','v6.0'],
    ['Cổng kết nối/sạc','Type-C'],
    ['Jack tai nghe','Type-C'],
    ['Kết nối khác',['Công nghệ mạng Thread','NFC']]
   ]},
   {group:'Thiết kế & Chất liệu',rows:[
    ['Thiết kế','Nguyên khối'],
    ['Chất liệu','Khung nhôm & Mặt lưng kính Ceramic Shield'],
    ['Kích thước, khối lượng','249g - 8.75 mm - 163.4 mm - 78 mm'],
    ['Thời điểm ra mắt','09/2026']
   ]}
  ]
 },
 14:{
  intro:{
   heading:'Đặc điểm nổi bật',
   bullets:[
    'Chỉ 5,64 mm và 165 g — chiếc iPhone mỏng nhất từng được chế tác',
    'Khung titan nguyên khối, mặt trước và mặt sau đều dùng Ceramic Shield bền chắc hơn mọi thế hệ trước',
    'Chip A19 Pro 6 lõi CPU và 5 lõi GPU, hiệu năng cao mà vẫn tiết kiệm điện',
    'Camera Fusion 48MP với 2x Telephoto quang học, chụp ảnh sắc nét trong mọi điều kiện sáng',
    'Camera trước Center Stage 18MP, tự động giữ bạn trong khung hình khi chụp selfie nhóm',
    'Màn hình Super Retina XDR 6,5 inch ProMotion 120Hz, độ sáng ngoài trời 3.000 nit',
    'Pin dùng cả ngày, hỗ trợ sạc nhanh có dây và sạc không dây MagSafe',
    'eSIM toàn phần, không cần khay SIM vật lý',
    'Apple Intelligence trên iOS 26 dùng được bằng tiếng Việt',
    'Có 4 màu Vàng Nhạt, Đen Không Gian, Xanh Da Trời và Trắng Mây'
   ]
  },
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[
    ['Hệ điều hành','iOS 26'],
    ['Chip xử lý (CPU)','Apple A19 Pro 6 lõi'],
    ['Tốc độ CPU','Hãng không công bố'],
    ['Chip đồ họa (GPU)','Apple GPU 5 lõi'],
    ['RAM','Hãng không công bố'],
    ['Dung lượng lưu trữ','256 GB'],
    ['Thẻ nhớ','Không'],
    ['Danh bạ','Không giới hạn']
   ]},
   {group:'Camera & Màn hình',rows:[
    ['Độ phân giải camera sau','Chính 48 MP'],
    ['Quay phim camera sau',[
     '4K 2160p@120fps',
     '4K 2160p@24fps',
     '4K 2160p@25fps',
     '4K 2160p@30fps',
     '4K 2160p@60fps',
     'FullHD 1080p@120fps',
     'FullHD 1080p@25fps',
     'FullHD 1080p@30fps',
     'FullHD 1080p@60fps'
    ]],
    ['Đèn Flash camera sau','Có'],
    ['Tính năng camera sau',[
     'Ban đêm (Night Mode)',
     'Chế độ chân dung',
     'Chống rung quang học (OIS)',
     'Chụp ảnh liên tục',
     'Deep Fusion',
     'Flash True Tone Thích ứng',
     'Gắn thẻ địa lý (Geotagging)',
     'Hiệu chỉnh mặt độ nâng cao',
     'Live Photos',
     'Lấy nét theo pha (PDAF)',
     'Máy ảnh không gian',
     'Phong Cách Nhiếp Ảnh',
     'Photonic Engine',
     'Quay chậm (Slow Motion)',
     'Quay video ProRes',
     'Quay video QuickTake',
     'Quay video không gian',
     'Siêu độ phân giải',
     'Smart HDR 5',
     'Toàn cảnh (Panorama)',
     'Trôi nhanh thời gian (Time Lapse)',
     'Tự động lấy nét (AF)',
     'Zoom kỹ thuật số',
     'Zoom quang học 2x',
     'Ảnh Raw'
    ]],
    ['Độ phân giải camera trước','18 MP'],
    ['Tính năng camera trước',[
     'Center Stage cho ảnh và video',
     'Chế độ chân dung',
     'Chống rung điện tử kỹ thuật số (EIS)',
     'Chụp đêm',
     'Chụp ảnh liên tục',
     'Deep Fusion',
     'Live Photos',
     'Phong Cách Nhiếp Ảnh',
     'Photonic Engine',
     'Quay chậm (Slow Motion)',
     'Quay video 4K',
     'Quay video Full HD',
     'Quay video QuickTake',
     'Retina Flash',
     'Smart HDR 5',
     'Trôi nhanh thời gian (Time Lapse)',
     'Tự động lấy nét (AF)'
    ]],
    ['Công nghệ màn hình','OLED'],
    ['Độ phân giải màn hình','Super Retina XDR (1260 x 2736 Pixels)'],
    ['Màn hình rộng','6.5" - 120 Hz'],
    ['Độ sáng tối đa','3000 nits'],
    ['Mặt kính cảm ứng','Kính cường lực Ceramic Shield 2']
   ]},
   {group:'Pin & Sạc',rows:[
    ['Dung lượng pin','Dùng cả ngày, xem video đến 27 giờ'],
    ['Loại pin','Li-Ion'],
    ['Hỗ trợ sạc tối đa','20 W'],
    ['Sạc kèm theo máy','Không'],
    ['Công nghệ pin',['Sạc không dây MagSafe','Sạc pin nhanh','Tiết kiệm pin']]
   ]},
   {group:'Tiện ích',rows:[
    ['Bảo mật nâng cao','Mở khoá khuôn mặt 3D'],
    ['Kháng nước, bụi','IP68'],
    ['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],
    ['Radio','Không'],
    ['Đèn pin','Không'],
    ['Xem phim',['H.264','HEVC','ProRes']],
    ['Nghe nhạc',['AAC','Apple Lossless','FLAC','MP3']]
   ]},
   {group:'Kết nối',rows:[
    ['Mạng di động','Hỗ trợ 5G'],
    ['SIM','eSIM (không có khay SIM vật lý)'],
    ['Wifi',['Wi-Fi 7','Wi-Fi MIMO']],
    ['GPS',['BEIDOU','GALILEO','GLONASS','GPS','NavIC','QZSS','iBeacon']],
    ['Bluetooth','v6.0'],
    ['Cổng kết nối/sạc','Type-C'],
    ['Jack tai nghe','Type-C'],
    ['Kết nối khác',['Công nghệ mạng Thread','NFC']]
   ]},
   {group:'Thiết kế & Chất liệu',rows:[
    ['Thiết kế','Nguyên khối, siêu mỏng'],
    ['Chất liệu','Khung titan & Ceramic Shield 2 mặt trước và mặt sau'],
    ['Kích thước, khối lượng','165g - 5.64 mm - 156.2 mm - 74.7 mm'],
    ['Thời điểm ra mắt','09/2025']
   ]}
  ]
 },
 13:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.3 inch ProMotion 120Hz, độ sáng ngoài trời 3.000 nit — gọn tay hơn bản Pro Max',
   'Chip A20 Pro, buồng hơi tản nhiệt mới, hiệu năng duy trì cao khi quay 4K/120fps',
   'Camera Pro Fusion 48MP khẩu độ tùy chỉnh f/1.48, zoom quang 5x, quay ProRes/Apple Log 2',
   'Pin xem video đến 36 giờ, sạc nhanh 60W, MagSafe không dây',
   'Khung nhôm nguyên khối, Ceramic Shield 2, kháng nước IP68',
   'Apple Intelligence trên iOS 27 dùng được tiếng Việt',
   '4 màu Đen, Bạc, Băng Thanh, Đỏ Burgundy'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','iOS 27'],['Chip xử lý (CPU)','Apple A20 Pro 6 lõi'],['Chip đồ họa (GPU)','Apple GPU 6 lõi'],['RAM','Hãng không công bố'],['Dung lượng lưu trữ','256 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 48 MP & Phụ 48 MP, 48 MP'],['Quay phim camera sau',['4K 2160p@120fps','4K 2160p@60fps','FullHD 1080p@60fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Chống rung quang học (OIS)','Cinematic','Deep Fusion','Photonic Engine','Quay video ProRes','Zoom quang học 5x','Ảnh Raw']],['Độ phân giải camera trước','18 MP'],['Tính năng camera trước',['Center Stage','Chế độ chân dung','Quay video 4K','Retina Flash','Smart HDR 5']],['Công nghệ màn hình','OLED'],['Độ phân giải màn hình','Super Retina XDR (1206 x 2622 Pixels)'],['Màn hình rộng','6.3" - 120 Hz'],['Độ sáng tối đa','3000 nits'],['Mặt kính cảm ứng','Kính cường lực Ceramic Shield 2']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','Xem video đến 36 giờ'],['Loại pin','Li-Ion'],['Hỗ trợ sạc tối đa','60 W'],['Sạc kèm theo máy','Không'],['Công nghệ pin',['Sạc không dây MagSafe','Sạc pin nhanh','Tiết kiệm pin']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá khuôn mặt 3D'],['Kháng nước, bụi','IP68'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Radio','Không'],['Xem phim',['H.264','HEVC','ProRes']],['Nghe nhạc',['AAC','Apple Lossless','FLAC','MP3']]]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','1 Nano SIM & 1 eSIM'],['Wifi',['Wi-Fi 7','Wi-Fi MIMO']],['GPS',['BEIDOU','GALILEO','GLONASS','GPS']],['Bluetooth','v6.0'],['Cổng kết nối/sạc','Type-C'],['Jack tai nghe','Type-C'],['Kết nối khác',['NFC']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung nhôm & Mặt lưng kính Ceramic Shield'],['Kích thước, khối lượng','199g - 8.5 mm - 150.6 mm - 71.1 mm'],['Thời điểm ra mắt','09/2026']]}
  ]
 },
 11:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.9 inch Super Retina XDR ProMotion 120Hz, viền titan mỏng, độ sáng 3.000 nit',
   'Chip A19 Pro, GPU 6 lõi, chiến game nặng và dựng video 4K mượt',
   'Cụm 3 camera 48MP (chính + siêu rộng + tele 5x), Photonic Engine, quay ProRes 4K/120fps',
   'Pin dùng cả ngày, sạc nhanh có dây + MagSafe, máy mát nhờ khung titan tản nhiệt tốt',
   'Nút Camera Control thao tác nhanh, Apple Intelligence tiếng Việt',
   '3 màu Xanh Đậm, Cam Vũ Trụ, Bạc'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','iOS 26'],['Chip xử lý (CPU)','Apple A19 Pro 6 lõi'],['Chip đồ họa (GPU)','Apple GPU 6 lõi'],['RAM','Hãng không công bố'],['Dung lượng lưu trữ','256 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 48 MP & Phụ 48 MP, 12 MP'],['Quay phim camera sau',['4K 2160p@120fps','4K 2160p@60fps','FullHD 1080p@240fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Chống rung quang học (OIS)','Cinematic','Deep Fusion','Photonic Engine','Zoom quang học 5x','Ảnh Raw']],['Độ phân giải camera trước','12 MP'],['Tính năng camera trước',['Chế độ chân dung','Quay video 4K','Retina Flash','Smart HDR 5']],['Công nghệ màn hình','OLED'],['Độ phân giải màn hình','Super Retina XDR (1320 x 2868 Pixels)'],['Màn hình rộng','6.9" - 120 Hz'],['Độ sáng tối đa','3000 nits'],['Mặt kính cảm ứng','Kính cường lực Ceramic Shield']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','Xem video đến 33 giờ'],['Loại pin','Li-Ion'],['Hỗ trợ sạc tối đa','45 W'],['Sạc kèm theo máy','Không'],['Công nghệ pin',['Sạc không dây MagSafe','Sạc pin nhanh','Tiết kiệm pin']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá khuôn mặt 3D'],['Kháng nước, bụi','IP68'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Radio','Không'],['Xem phim',['H.264','HEVC','ProRes']],['Nghe nhạc',['AAC','Apple Lossless','FLAC','MP3']]]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','1 Nano SIM & 1 eSIM'],['Wifi',['Wi-Fi 6E','Wi-Fi MIMO']],['GPS',['BEIDOU','GALILEO','GLONASS','GPS']],['Bluetooth','v5.3'],['Cổng kết nối/sạc','Type-C'],['Jack tai nghe','Type-C'],['Kết nối khác',['NFC']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung titan & Mặt lưng kính nhám'],['Kích thước, khối lượng','227g - 8.25 mm - 163 mm - 77.6 mm'],['Thời điểm ra mắt','09/2025']]}
  ]
 },
 1:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Bản Pro 6.3 inch gọn tay, màn hình ProMotion 120Hz sáng rõ ngoài trời',
   'Chip A19 Pro mạnh mẽ, cân tốt game nặng và quay dựng 4K',
   'Camera 48MP + tele 5x + siêu rộng, quay ProRes, chụp đêm sạch nhiễu',
   'Khung titan bền nhẹ, 3 màu Xanh Đậm, Cam Vũ Trụ, Bạc'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','iOS 26'],['Chip xử lý (CPU)','Apple A19 Pro 6 lõi'],['Chip đồ họa (GPU)','Apple GPU 6 lõi'],['RAM','Hãng không công bố'],['Dung lượng lưu trữ','256 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 48 MP & Phụ 48 MP, 12 MP'],['Quay phim camera sau',['4K 2160p@120fps','4K 2160p@60fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Chống rung quang học (OIS)','Photonic Engine','Zoom quang học 5x']],['Độ phân giải camera trước','12 MP'],['Công nghệ màn hình','OLED'],['Độ phân giải màn hình','Super Retina XDR (1206 x 2622 Pixels)'],['Màn hình rộng','6.3" - 120 Hz'],['Độ sáng tối đa','3000 nits'],['Mặt kính cảm ứng','Kính cường lực Ceramic Shield']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','Xem video đến 29 giờ'],['Loại pin','Li-Ion'],['Hỗ trợ sạc tối đa','45 W'],['Sạc kèm theo máy','Không'],['Công nghệ pin',['Sạc không dây MagSafe','Sạc pin nhanh']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá khuôn mặt 3D'],['Kháng nước, bụi','IP68'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Radio','Không']]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','1 Nano SIM & 1 eSIM'],['Wifi',['Wi-Fi 6E']],['GPS',['BEIDOU','GALILEO','GLONASS','GPS']],['Bluetooth','v5.3'],['Cổng kết nối/sạc','Type-C'],['Kết nối khác',['NFC']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung titan & Mặt lưng kính nhám'],['Kích thước, khối lượng','199g - 8.25 mm - 150.6 mm - 71.5 mm'],['Thời điểm ra mắt','09/2025']]}
  ]
 },
 2:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.9 inch QHD+ Dynamic AMOLED 2X 120Hz, S Pen tích hợp, độ sáng 2.600 nit',
   'Chip Snapdragon 8 Elite for Galaxy, RAM 12GB, bộ nhớ UFS 4.0',
   'Camera 200MP + siêu rộng 50MP + tele 5x 50MP + tele 3x 10MP, quay 8K/30fps',
   'Pin 5.000 mAh, sạc nhanh 45W, sạc không dây 15W',
   'Khung titan, kháng nước IP68, Galaxy AI dùng được tiếng Việt',
   '4 màu Xanh Dương, Trắng, Tím, Đen'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','Android 15, One UI 7'],['Chip xử lý (CPU)','Snapdragon 8 Elite for Galaxy 8 nhân'],['Tốc độ CPU','2 nhân 4.47GHz & 6 nhân 3.53GHz'],['Chip đồ họa (GPU)','Adreno 830'],['RAM','12 GB'],['Dung lượng lưu trữ','256 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 200 MP & Phụ 50 MP, 50 MP, 10 MP'],['Quay phim camera sau',['8K 30fps','4K 60fps','FullHD 240fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Chống rung quang học (OIS)','Lấy nét laser','Quay chậm (Slow Motion)','Toàn cảnh (Panorama)','Zoom quang học 5x','Zoom kỹ thuật số 100x']],['Độ phân giải camera trước','12 MP'],['Tính năng camera trước',['Chế độ chân dung','Quay video 4K','Tự động lấy nét (AF)']],['Công nghệ màn hình','Dynamic AMOLED 2X'],['Độ phân giải màn hình','QHD+ (1440 x 3120 Pixels)'],['Màn hình rộng','6.9" - 120 Hz'],['Độ sáng tối đa','2600 nits'],['Mặt kính cảm ứng','Kính cường lực Gorilla Armor 2']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','5000 mAh'],['Loại pin','Li-Ion'],['Hỗ trợ sạc tối đa','45 W'],['Sạc kèm theo máy','Không'],['Công nghệ pin',['Sạc không dây','Sạc pin nhanh','Sạc ngược không dây']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá vân tay siêu âm dưới màn hình, nhận diện khuôn mặt'],['Kháng nước, bụi','IP68'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Bút cảm ứng','S Pen tích hợp'],['Radio','Không'],['Xem phim',['AVI','MP4','HEVC']],['Nghe nhạc',['MP3','FLAC','OGG']]]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','2 Nano SIM & eSIM'],['Wifi',['Wi-Fi 7','Wi-Fi Direct']],['GPS',['BEIDOU','GALILEO','GLONASS','GPS']],['Bluetooth','v5.4'],['Cổng kết nối/sạc','Type-C'],['Jack tai nghe','Type-C'],['Kết nối khác',['NFC','UWB']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung titan & Mặt lưng kính Gorilla'],['Kích thước, khối lượng','218g - 8.2 mm - 162.8 mm - 77.6 mm'],['Thời điểm ra mắt','02/2026']]}
  ]
 },
 3:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.3 inch LTPO AMOLED 1.5K 120Hz, sáng đỉnh 3.500 nits, kính Xiaomi Shield 3.0',
   'Chip Snapdragon 8 Elite Gen 5 tiến trình 3nm, RAM LPDDR5X 12GB, nhớ UFS 4.1, tản nhiệt vòng 4.497 mm2',
   'Camera Leica Summilux: chính 50MP Light Hunter 950 f/1.67 OIS + tele 50MP f/2.0 macro 10cm + siêu rộng 50MP 102 độ, quay 8K/4K Dolby Vision',
   'Pin Silicon-Carbon 6.330 mAh, sạc dây 100W HyperCharge, sạc không dây 50W, sạc ngược 22.5W',
   'Khung kim loại, lưng sợi thủy tinh, kháng nước IP68 đến 4m, Wi-Fi 7, NFC, hồng ngoại',
   'Chạy HyperOS 3 (Android 16), 3 màu Đen, Tím, Trắng'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','Android 16, HyperOS 3'],['Chip xử lý (CPU)','Snapdragon 8 Elite Gen 5 8 nhân'],['Tốc độ CPU','2 nhân 4.6GHz & 6 nhân 3.62GHz'],['Chip đồ họa (GPU)','Adreno 840'],['RAM','12 GB'],['Dung lượng lưu trữ','256 GB'],['Dung lượng khả dụng','Khoảng 233 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 50 MP & Phụ 50 MP, 50 MP'],['Quay phim camera sau',['8K 30fps','4K 60fps','FullHD 60fps','HD 30fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Chống rung quang học (OIS)','Góc siêu rộng (Ultrawide)','Lấy nét theo pha (PDAF)','Phong cách Leica','Quay video Dolby Vision','Siêu cận (Macro)','Toàn cảnh (Panorama)','Trôi nhanh thời gian (Time Lapse)','Zoom kỹ thuật số 60x']],['Độ phân giải camera trước','50 MP'],['Tính năng camera trước',['Chế độ chân dung','Làm đẹp','Lấy nét tự động (AF)','Quay video 4K','Xóa phông']],['Công nghệ màn hình','LTPO AMOLED'],['Độ phân giải màn hình','1.5K (1220 x 2656 Pixels)'],['Màn hình rộng','6.3" - 120 Hz'],['Độ sáng tối đa','3500 nits'],['Mặt kính cảm ứng','Xiaomi Shield 3.0']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','6330 mAh, Silicon-Carbon'],['Loại pin','Si-C'],['Hỗ trợ sạc tối đa','100 W'],['Sạc kèm theo máy','Có'],['Công nghệ pin',['HyperCharge','Sạc không dây 50W','Sạc ngược 22.5W','Tiết kiệm pin']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá vân tay siêu âm dưới màn hình, nhận diện khuôn mặt'],['Kháng nước, bụi','IP68'],['Ghi âm',['Ghi âm mặc định']],['Radio','Có'],['Chạm 2 lần sáng màn hình','Có'],['Xem phim',['AVI','MP4']],['Nghe nhạc',['Midi','MP3','OGG','FLAC']]]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','2 Nano SIM'],['Wifi',['Wi-Fi 7']],['GPS',['BEIDOU','GALILEO','GLONASS','GPS']],['Bluetooth','v6.0'],['Cổng kết nối/sạc','Type-C, USB 3.2 Gen 1'],['Jack tai nghe','Type-C'],['Kết nối khác',['NFC','Hồng ngoại','OTG']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung kim loại & Lưng sợi thủy tinh'],['Kích thước, khối lượng','191g - 8.06 mm - 151.1 mm - 71.8 mm'],['Thời điểm ra mắt','02/2026']]}
  ]
 },
 4:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.78 inch AMOLED 1.5K 120Hz cong nhẹ, sáng rõ ngoài trời',
   'Chip Snapdragon 8s Gen 4 / Dimensity tương đương, RAM 12GB, đa nhiệm mượt, ColorOS tối ưu pin',
   'Camera chính 50MP OIS + siêu rộng + tele 2x, chụp chân dung đẹp, quay 4K/60fps',
   'Pin 5.800 mAh, sạc nhanh 80W SUPERVOOC, sạc đầy khoảng 35 phút',
   'Thiết kế mỏng nhẹ 2 màu Đen, Trắng, vân lưng hạn chế bám vân tay'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','Android 15, ColorOS 15'],['Chip xử lý (CPU)','Snapdragon 8s Gen 4 8 nhân'],['Chip đồ họa (GPU)','Adreno 825'],['RAM','12 GB'],['Dung lượng lưu trữ','256 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 50 MP & Phụ 8 MP, 50 MP'],['Quay phim camera sau',['4K 60fps','FullHD 60fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Chống rung quang học (OIS)','Góc siêu rộng (Ultrawide)','Toàn cảnh (Panorama)']],['Độ phân giải camera trước','32 MP'],['Tính năng camera trước',['Chế độ chân dung','Làm đẹp','Quay video 4K']],['Công nghệ màn hình','AMOLED'],['Độ phân giải màn hình','1.5K (1264 x 2780 Pixels)'],['Màn hình rộng','6.78" - 120 Hz'],['Độ sáng tối đa','2500 nits'],['Mặt kính cảm ứng','Kính cường lực']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','5800 mAh'],['Loại pin','Li-Po'],['Hỗ trợ sạc tối đa','80 W'],['Sạc kèm theo máy','Có'],['Công nghệ pin',['Sạc pin nhanh SUPERVOOC','Tiết kiệm pin']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá vân tay dưới màn hình'],['Kháng nước, bụi','IP65'],['Ghi âm',['Ghi âm mặc định']],['Radio','Không']]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','2 Nano SIM'],['Wifi',['Wi-Fi 6']],['GPS',['BEIDOU','GLONASS','GPS']],['Bluetooth','v5.4'],['Cổng kết nối/sạc','Type-C'],['Kết nối khác',['NFC','Hồng ngoại']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung nhựa & Mặt lưng kính'],['Kích thước, khối lượng','197g - 7.9 mm - 162.8 mm - 75.1 mm'],['Thời điểm ra mắt','2026']]}
  ]
 },
 5:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Cụm camera Zeiss 50MP + tele APO 200MP zoom xa, quay 8K, chống rung gimbal',
   'Màn hình 6.82 inch LTPO AMOLED 2K 120Hz, sáng đỉnh 4.500 nit',
   'Chip Snapdragon 8 Elite, RAM 16GB, pin Silicon 5.400 mAh, sạc 90W',
   'Thiết kế Xanh Lá vân da sang trọng, kháng nước IP68/IP69'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','Android 15, OriginOS 5'],['Chip xử lý (CPU)','Snapdragon 8 Elite 8 nhân'],['Chip đồ họa (GPU)','Adreno 830'],['RAM','16 GB'],['Dung lượng lưu trữ','512 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 50 MP & Phụ 200 MP, 50 MP'],['Quay phim camera sau',['8K 30fps','4K 120fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Chống rung gimbal','Ống kính Zeiss','Zoom quang học','Chế độ chân dung','Ban đêm (Night Mode)']],['Độ phân giải camera trước','50 MP'],['Công nghệ màn hình','LTPO AMOLED'],['Độ phân giải màn hình','2K (1440 x 3168 Pixels)'],['Màn hình rộng','6.82" - 120 Hz'],['Độ sáng tối đa','4500 nits'],['Mặt kính cảm ứng','Kính cường lực']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','5400 mAh'],['Loại pin','Si-C'],['Hỗ trợ sạc tối đa','90 W'],['Sạc kèm theo máy','Có'],['Công nghệ pin',['Sạc pin nhanh','Sạc không dây']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá vân tay siêu âm'],['Kháng nước, bụi','IP68/IP69'],['Ghi âm',['Ghi âm mặc định']],['Radio','Không']]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','2 Nano SIM'],['Wifi',['Wi-Fi 7']],['GPS',['BEIDOU','GLONASS','GPS']],['Bluetooth','v5.4'],['Cổng kết nối/sạc','Type-C'],['Kết nối khác',['NFC','Hồng ngoại']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung kim loại & Lưng kính/vân da'],['Kích thước, khối lượng','221g - 9.4 mm - 163.1 mm - 75.3 mm'],['Thời điểm ra mắt','2025']]}
  ]
 },
 6:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.7 inch Super AMOLED 120Hz, sáng rõ, viền mỏng, xem phim lướt web đã',
   'Chip Exynos 1580 / Snapdragon 6 Gen, RAM đến 8GB, pin 5.000 mAh dùng cả ngày',
   'Camera chính 50MP OIS chụp đêm tốt trong tầm giá, quay FullHD/4K',
   'Giá dễ tiếp cận, trả góp 0%, 4 màu Đen, Trắng, Xanh Lá Đậm, Tím'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','Android 15, One UI 7'],['Chip xử lý (CPU)','Exynos 1580 8 nhân'],['Chip đồ họa (GPU)','Xclipse 540'],['RAM','8 GB'],['Dung lượng lưu trữ','128 GB'],['Thẻ nhớ','MicroSD đến 1TB'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 50 MP & Phụ 8 MP, 5 MP'],['Quay phim camera sau',['4K 30fps','FullHD 60fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chống rung quang học (OIS)','Chế độ chân dung','Toàn cảnh (Panorama)']],['Độ phân giải camera trước','12 MP'],['Công nghệ màn hình','Super AMOLED'],['Độ phân giải màn hình','FullHD+ (1080 x 2340 Pixels)'],['Màn hình rộng','6.7" - 120 Hz'],['Độ sáng tối đa','1900 nits'],['Mặt kính cảm ứng','Kính cường lực']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','5000 mAh'],['Loại pin','Li-Po'],['Hỗ trợ sạc tối đa','25 W'],['Sạc kèm theo máy','Không'],['Công nghệ pin',['Sạc pin nhanh','Tiết kiệm pin']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá vân tay dưới màn hình'],['Kháng nước, bụi','IP67'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Radio','Không']]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','2 Nano SIM & eSIM'],['Wifi',['Wi-Fi 6']],['GPS',['GLONASS','GPS']],['Bluetooth','v5.3'],['Cổng kết nối/sạc','Type-C'],['Kết nối khác',['NFC']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung nhựa & Mặt lưng nhựa vân'],['Kích thước, khối lượng','198g - 8.2 mm - 162.7 mm - 78.4 mm'],['Thời điểm ra mắt','2026']]}
  ]
 },
 7:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.3 inch Super Retina XDR 120Hz, Dynamic Island, độ sáng 2.000 nit ngoài trời',
   'Chip A19, Apple Intelligence tiếng Việt, chơi game và AI on-device mượt',
   'Camera kép 48MP Fusion (chính + siêu rộng), quay 4K Dolby Vision, chụp đêm tốt',
   'Pin cả ngày, sạc nhanh + MagSafe, khung nhôm bền nhẹ',
   '5 màu Tím Oải Hương, Đen, Trắng, Xanh Lam Khói, Xanh Lá Xô Thơm'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','iOS 26'],['Chip xử lý (CPU)','Apple A19 6 lõi'],['Chip đồ họa (GPU)','Apple GPU 5 lõi'],['RAM','Hãng không công bố'],['Dung lượng lưu trữ','256 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 48 MP & Phụ 48 MP'],['Quay phim camera sau',['4K 60fps Dolby Vision','FullHD 120fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Chống rung quang học (OIS)','Deep Fusion','Photonic Engine']],['Độ phân giải camera trước','12 MP'],['Công nghệ màn hình','OLED'],['Độ phân giải màn hình','Super Retina XDR (1179 x 2556 Pixels)'],['Màn hình rộng','6.3" - 120 Hz'],['Độ sáng tối đa','2000 nits'],['Mặt kính cảm ứng','Kính cường lực Ceramic Shield']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','Xem video đến 27 giờ'],['Loại pin','Li-Ion'],['Hỗ trợ sạc tối đa','30 W'],['Sạc kèm theo máy','Không'],['Công nghệ pin',['Sạc không dây MagSafe','Sạc pin nhanh']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá khuôn mặt 3D'],['Kháng nước, bụi','IP68'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Radio','Không']]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','1 Nano SIM & 1 eSIM'],['Wifi',['Wi-Fi 6E']],['GPS',['BEIDOU','GALILEO','GLONASS','GPS']],['Bluetooth','v5.3'],['Cổng kết nối/sạc','Type-C'],['Kết nối khác',['NFC']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung nhôm & Mặt lưng kính pha màu'],['Kích thước, khối lượng','177g - 7.8 mm - 149.6 mm - 71.5 mm'],['Thời điểm ra mắt','09/2025']]}
  ]
 },
 9:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.75 inch 120Hz mượt, pin 5.000 mAh dùng 2 ngày với nhu cầu cơ bản',
   'Chip 8 nhân, RAM đến 6GB, chạy tốt Zalo, TikTok, YouTube, game nhẹ',
   'Camera chính 50MP chụp đủ sáng tốt, pin trâu, sạc nhanh 45W',
   'Giá dưới 7 triệu, trả góp 0%, 2 màu Vàng, Xanh trẻ trung'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','Android 15, realme UI 6'],['Chip xử lý (CPU)','Snapdragon 6s 4G Gen 1 / Helio G99'],['Chip đồ họa (GPU)','Adreno 610'],['RAM','6 GB'],['Dung lượng lưu trữ','128 GB'],['Thẻ nhớ','MicroSD đến 1TB'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 50 MP & Phụ 2 MP'],['Quay phim camera sau',['FullHD 30fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Toàn cảnh (Panorama)']],['Độ phân giải camera trước','8 MP'],['Công nghệ màn hình','IPS LCD'],['Độ phân giải màn hình','HD+ (720 x 1600 Pixels)'],['Màn hình rộng','6.75" - 120 Hz'],['Độ sáng tối đa','950 nits'],['Mặt kính cảm ứng','Kính cường lực']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','5000 mAh'],['Loại pin','Li-Po'],['Hỗ trợ sạc tối đa','45 W'],['Sạc kèm theo máy','Có'],['Công nghệ pin',['Sạc pin nhanh','Tiết kiệm pin']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá vân tay cạnh viền'],['Kháng nước, bụi','IP54'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Radio','Không'],['Jack tai nghe','3.5mm']]},
   {group:'Kết nối',rows:[['Mạng di động','4G LTE'],['SIM','2 Nano SIM'],['Wifi',['Wi-Fi 5']],['GPS',['GLONASS','GPS']],['Bluetooth','v5.0'],['Cổng kết nối/sạc','Type-C'],['Kết nối khác',['OTG']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung nhựa & Mặt lưng nhựa'],['Kích thước, khối lượng','199g - 8.5 mm - 167.2 mm - 76.6 mm'],['Thời điểm ra mắt','2025']]}
  ]
 },
 12:{
  intro:{heading:'Đặc điểm nổi bật',bullets:[
   'Màn hình 6.9 inch Super Retina XDR ProMotion 120Hz, viền titan, nút Action và Camera Control',
   'Chip A18 Pro, quay 4K/120fps Dolby Vision, 4 mic studio, chỉnh âm sau quay',
   'Camera 48MP Fusion + siêu rộng 48MP + tele 5x 12MP, zoom quang 5x/10x, chụp macro',
   'Khung titan 4 màu Tự Nhiên, Sa Mạc, Đen, Trắng, kháng nước IP68'
  ]},
  specs:[
   {group:'Cấu hình & Bộ nhớ',rows:[['Hệ điều hành','iOS 18'],['Chip xử lý (CPU)','Apple A18 Pro 6 lõi'],['Chip đồ họa (GPU)','Apple GPU 6 lõi'],['RAM','Hãng không công bố'],['Dung lượng lưu trữ','256 GB'],['Thẻ nhớ','Không'],['Danh bạ','Không giới hạn']]},
   {group:'Camera & Màn hình',rows:[['Độ phân giải camera sau','Chính 48 MP & Phụ 48 MP, 12 MP'],['Quay phim camera sau',['4K 2160p@120fps','4K 2160p@60fps','FullHD 240fps']],['Đèn Flash camera sau','Có'],['Tính năng camera sau',['Ban đêm (Night Mode)','Chế độ chân dung','Chống rung quang học (OIS)','Photonic Engine','Zoom quang học 5x','Ảnh Raw']],['Độ phân giải camera trước','12 MP'],['Công nghệ màn hình','OLED'],['Độ phân giải màn hình','Super Retina XDR (1320 x 2868 Pixels)'],['Màn hình rộng','6.9" - 120 Hz'],['Độ sáng tối đa','2000 nits'],['Mặt kính cảm ứng','Kính cường lực Ceramic Shield']]},
   {group:'Pin & Sạc',rows:[['Dung lượng pin','Xem video đến 33 giờ'],['Loại pin','Li-Ion'],['Hỗ trợ sạc tối đa','45 W'],['Sạc kèm theo máy','Không'],['Công nghệ pin',['Sạc không dây MagSafe','Sạc pin nhanh']]]},
   {group:'Tiện ích',rows:[['Bảo mật nâng cao','Mở khoá khuôn mặt 3D'],['Kháng nước, bụi','IP68'],['Ghi âm',['Ghi âm cuộc gọi','Ghi âm mặc định']],['Radio','Không']]},
   {group:'Kết nối',rows:[['Mạng di động','Hỗ trợ 5G'],['SIM','1 Nano SIM & 1 eSIM'],['Wifi',['Wi-Fi 6E']],['GPS',['BEIDOU','GALILEO','GLONASS','GPS']],['Bluetooth','v5.3'],['Cổng kết nối/sạc','Type-C'],['Kết nối khác',['NFC']]]},
   {group:'Thiết kế & Chất liệu',rows:[['Thiết kế','Nguyên khối'],['Chất liệu','Khung titan & Mặt lưng kính nhám'],['Kích thước, khối lượng','227g - 8.25 mm - 163 mm - 77.6 mm'],['Thời điểm ra mắt','09/2024']]}
  ]
 }
};

/* Tra cứu theo TÊN máy để không lệch ID khi chạy qua backend/CSDL.
   Backend dùng AUTOINCREMENT nên id có thể khác data.js tĩnh. */
const productInfoByName={
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
function getProductInfo(product){
 if(!product||typeof productInfo==='undefined')return null;
 if(productInfo[product.id])return productInfo[product.id];
 const norm=(s=>(s||'').toLowerCase().replace(/\s+/g,' ').trim())(product.name);
 if(productInfoByName[norm]!=null&&productInfo[productInfoByName[norm]])return productInfo[productInfoByName[norm]];
 return null;
}
