/* Dữ liệu sản phẩm dùng chung cho index.html và product.html */
const products=[
{id:10,brand:'Apple',name:'iPhone 18 Pro Max',memory:['256GB','512GB','1TB','2TB'],colors:['Đỏ Burgundy','Đen','Bạc','Băng Thanh'],price:41990000,old:45990000,gift:'Quà tặng theo chương trình',rating:4.9,sold:'12,8k',img:'images/ip18pm-doburgundy-1.jpg',
 colorImages:{
  'Đỏ Burgundy':['images/ip18pm-doburgundy-1.jpg','images/ip18pm-doburgundy-2.jpg'],
  'Đen':['images/ip18pm-den-1.jpg','images/ip18pm-den-2.jpg'],
  'Bạc':['images/ip18pm-bac-1.jpg','images/ip18pm-bac-2.jpg'],
  'Băng Thanh':['images/ip18pm-bangthanh-1.jpg','images/ip18pm-bangthanh-2.jpg']},
 extraImages:['images/ip18pm-camera-48mp.jpg','images/ip18pm-camera-pro.jpg','images/ip18pm-pin-43h.jpg','images/ip18pm-chip-a20.jpg','images/ip18pm-ceramic-shield.jpg','images/ip18pm-bon-mau.jpg','images/ip18pm-tong-hop.jpg','images/ip18pm-trong-hop.jpg'],
 memoryPrices:{'256GB':41990000,'512GB':48490000,'1TB':61490000,'2TB':80990000},featured:13},

{id:13,brand:'Apple',name:'iPhone 18 Pro',memory:['256GB','512GB','1TB','2TB'],colors:['Đỏ Burgundy','Đen','Bạc','Băng Thanh'],price:38990000,old:42990000,gift:'Quà tặng theo chương trình',rating:4.9,sold:'9,6k',img:'images/ip18pm-doburgundy-1.jpg',
 colorImages:{
  'Đỏ Burgundy':['images/ip18pm-doburgundy-1.jpg','images/ip18pm-doburgundy-2.jpg','images/ip18pm-trong-hop.jpg'],
  'Đen':['images/ip18pm-den-1.jpg','images/ip18pm-den-2.jpg'],
  'Bạc':['images/ip18pm-bac-1.jpg','images/ip18pm-bac-2.jpg'],
  'Băng Thanh':['images/ip18pm-bangthanh-1.jpg','images/ip18pm-bangthanh-2.jpg']},
 extraImages:['images/ip18pm-camera-48mp.jpg','images/ip18pm-camera-pro.jpg','images/ip18pm-pin-43h.jpg','images/ip18pm-chip-a20.jpg','images/ip18pm-ceramic-shield.jpg','images/ip18pm-bon-mau.jpg','images/ip18pm-tong-hop.jpg'],
 memoryPrices:{'256GB':38990000,'512GB':45490000,'1TB':58490000,'2TB':77990000},featured:12},

{id:14,brand:'Apple',name:'iPhone Air',memory:['256GB','512GB','1TB'],colors:['Vàng Nhạt','Đen Không Gian','Xanh Da Trời','Trắng Mây'],price:22990000,old:25990000,gift:'Quà tặng theo chương trình',rating:4.9,sold:'6,4k',img:'images/ipair-vangnhat-1.jpg',
 colorImages:{
  'Vàng Nhạt':['images/ipair-vangnhat-1.jpg','images/ipair-vangnhat-2.jpg','images/ipair-vangnhat-3.jpg','images/ipair-vangnhat-4.jpg'],
  'Đen Không Gian':['images/ipair-denkhonggian-1.jpg','images/ipair-denkhonggian-2.jpg','images/ipair-denkhonggian-3.jpg','images/ipair-denkhonggian-4.jpg'],
  'Xanh Da Trời':['images/ipair-xanhdatroi-1.jpg','images/ipair-xanhdatroi-2.jpg','images/ipair-xanhdatroi-3.jpg','images/ipair-xanhdatroi-4.jpg'],
  'Trắng Mây':['images/ipair-trangmay-1.jpg','images/ipair-trangmay-2.jpg','images/ipair-trangmay-3.jpg','images/ipair-trangmay-4.jpg']},
 extraImages:['images/ipair-sieumong-1.jpg','images/ipair-sieumong-2.jpg'],
 memoryPrices:{'256GB':22990000,'512GB':28990000,'1TB':40990000},
 memoryOld:{'256GB':25990000,'512GB':31990000,'1TB':44990000},featured:12},

{id:11,brand:'Apple',name:'iPhone 17 Pro Max',memory:['256GB','512GB','1TB','2TB'],colors:['Xanh Đậm','Cam Vũ Trụ','Bạc'],price:34490000,old:41990000,gift:'Quà tặng theo chương trình',rating:4.9,sold:'28,3k',img:'images/ip17pm-camvutru-1.jpg',
 colorImages:{
  'Xanh Đậm':['images/ip17pm-xanhdam-1.jpg','images/ip17pm-xanhdam-2.jpg','images/ip17pm-xanhdam-3.jpg','images/ip17pm-xanhdam-4.jpg'],
  'Cam Vũ Trụ':['images/ip17pm-camvutru-1.jpg','images/ip17pm-camvutru-2.jpg','images/ip17pm-camvutru-3.jpg','images/ip17pm-camvutru-4.jpg'],
  'Bạc':['images/ip17pm-bac-1.jpg','images/ip17pm-bac-2.jpg','images/ip17pm-bac-3.jpg','images/ip17pm-bac-4.jpg']},
 memoryPrices:{'256GB':34490000,'512GB':40990000,'1TB':47490000,'2TB':60490000},
 extraImages:[],featured:11},

{id:1,brand:'Apple',name:'iPhone 17 Pro',memory:['256GB','512GB'],colors:['Xanh Đậm','Cam Vũ Trụ','Bạc'],price:31990000,old:34990000,gift:'Quà tặng theo chương trình',rating:4.9,sold:'37,4k',img:'images/ip17pm-camvutru-1.jpg',
 colorImages:{
  'Xanh Đậm':['images/ip17pm-xanhdam-1.jpg','images/ip17pm-xanhdam-2.jpg','images/ip17pm-xanhdam-3.jpg','images/ip17pm-xanhdam-4.jpg'],
  'Cam Vũ Trụ':['images/ip17pm-camvutru-1.jpg','images/ip17pm-camvutru-2.jpg','images/ip17pm-camvutru-3.jpg','images/ip17pm-camvutru-4.jpg'],
  'Bạc':['images/ip17pm-bac-1.jpg','images/ip17pm-bac-2.jpg','images/ip17pm-bac-3.jpg','images/ip17pm-bac-4.jpg']},
 extraImages:[],featured:10},
{id:2,brand:'Samsung',name:'Samsung Galaxy S26 Ultra',memory:['256GB','512GB','1TB'],colors:['Xanh Dương','Trắng','Tím','Đen'],price:29490000,old:40990000,gift:'Quà tặng 500.000đ',rating:4.9,sold:'26,2k',img:'images/s26u-xanhduong-1.jpg',
 colorImages:{
  'Xanh Dương':['images/s26u-xanhduong-1.jpg','images/s26u-xanhduong-2.jpg','images/s26u-xanhduong-3.jpg','images/s26u-xanhduong-4.jpg','images/s26u-hop.jpg'],
  'Trắng':['images/s26u-trang-1.jpg','images/s26u-trang-2.jpg','images/s26u-trang-3.jpg'],
  'Tím':['images/s26u-tim-1.jpg','images/s26u-tim-2.jpg','images/s26u-tim-3.jpg','images/s26u-tim-4.jpg'],
  'Đen':['images/s26u-den-1.jpg','images/s26u-den-2.jpg','images/s26u-den-3.jpg']},
 memoryPrices:{'256GB':29490000,'512GB':37490000,'1TB':42890000},
 memoryOld:{'256GB':40990000,'512GB':46990000,'1TB':52990000},
 memoryRam:{'256GB':'12GB','512GB':'12GB','1TB':'16GB'},featured:9},
{id:3,brand:'Xiaomi',name:'Xiaomi 17T 5G',memory:['256GB','512GB'],colors:['Đen','Tím','Trắng'],price:15990000,old:20990000,gift:'Voucher mua hàng',rating:4.9,sold:'5,2k',img:'images/xm17t-den-1.jpg',
 colorImages:{
  'Đen':['images/xm17t-den-1.jpg','images/xm17t-den-2.jpg','images/xm17t-den-3.jpg','images/xm17t-den-4.jpg','images/xm17t-den-5.jpg','images/xm17t-den-6.jpg'],
  'Tím':['images/xm17t-tim-1.jpg','images/xm17t-tim-2.jpg','images/xm17t-tim-3.jpg','images/xm17t-tim-4.jpg','images/xm17t-tim-5.jpg','images/xm17t-tim-6.jpg'],
  'Trắng':['images/xm17t-trang-1.jpg','images/xm17t-trang-2.jpg','images/xm17t-trang-3.jpg','images/xm17t-trang-4.jpg','images/xm17t-trang-5.jpg','images/xm17t-trang-6.jpg','images/xm17t-trang-7.jpg']},
 memoryPrices:{'256GB':15990000,'512GB':17590000},
 memoryOld:{'256GB':20990000,'512GB':22590000},
 extraImages:['https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/361269/xiaomi-17-man-hinh-639027865093793875.jpg','https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/361269/xiaomi-17-cpu-639027865111179274.jpg','https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/361269/xiaomi-17-camera-639093392708559579.jpg','https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/42/361269/xiaomi-17-pin-639093392742669502.jpg'],featured:8},
{id:4,brand:'OPPO',name:'OPPO Reno16 Pro 5G',memory:['256GB'],colors:['Đen','Trắng'],price:23190000,old:25990000,gift:'Quà tặng 50.000đ',rating:4.9,sold:'1,4k',img:'images/reno16p-den-1.jpg',
 colorImages:{
  'Đen':['images/reno16p-den-1.jpg','images/reno16p-den-2.jpg','images/reno16p-den-3.jpg','images/reno16p-den-4.jpg','images/reno16p-den-5.jpg'],
  'Trắng':['images/reno16p-trang-1.jpg','images/reno16p-trang-2.jpg','images/reno16p-trang-3.jpg','images/reno16p-trang-4.jpg','images/reno16p-trang-5.jpg']},
 memoryPrices:{'256GB':23190000},featured:7},
{id:5,brand:'Vivo',name:'Vivo X300 Ultra',memory:['512GB'],colors:['Xanh Lá'],price:35990000,old:49990000,gift:'Ưu đãi thu cũ',rating:5,sold:'358',img:'images/vivo-x300u-xanhla-1.jpg',
 colorImages:{
  'Xanh Lá':['images/vivo-x300u-xanhla-1.jpg','images/vivo-x300u-xanhla-2.jpg','images/vivo-x300u-xanhla-3.jpg']},
 extraImages:['images/vivo-x300u-xanhla-4.jpg','images/vivo-x300u-xanhla-5.jpg','images/vivo-x300u-xanhla-6.jpg','images/vivo-x300u-xanhla-7.jpg'],
 memoryPrices:{'512GB':35990000},featured:6},
{id:6,brand:'Samsung',name:'Samsung Galaxy A37 5G',memory:['6GB-128GB','8GB-128GB','8GB-256GB'],colors:['Đen','Trắng','Xanh Lá Đậm','Tím'],price:9390000,old:11190000,gift:'Trả góp 0%',rating:4.9,sold:'47k',img:'images/a37-den-1.jpg',
 colorImages:{
  'Đen':['images/a37-den-1.jpg','images/a37-den-2.jpg','images/a37-den-3.jpg','images/a37-den-4.jpg','images/a37-den-5.jpg','images/a37-den-6.jpg'],
  'Trắng':['images/a37-trang-1.jpg','images/a37-trang-2.jpg','images/a37-trang-3.jpg'],
  'Xanh Lá Đậm':['images/a37-xanhladam-1.jpg','images/a37-xanhladam-2.jpg','images/a37-xanhladam-3.jpg'],
  'Tím':['images/a37-tim-1.jpg','images/a37-tim-2.jpg','images/a37-tim-3.jpg']},
 memoryPrices:{'6GB-128GB':9390000,'8GB-128GB':9990000,'8GB-256GB':10690000},
 memoryOld:{'6GB-128GB':11190000,'8GB-128GB':11890000,'8GB-256GB':12720000},featured:5},
{id:7,brand:'Apple',name:'iPhone 17',memory:['256GB','512GB'],colors:['Tím Oải Hương','Đen','Trắng','Xanh Lam Khói','Xanh Lá Xô Thơm'],price:26490000,old:28990000,gift:'Trả góp 0%',rating:4.9,sold:'65,9k',img:'images/ip17-timoaihuong-1.jpg',
 colorImages:{
  'Tím Oải Hương':['images/ip17-timoaihuong-1.jpg','images/ip17-timoaihuong-2.jpg','images/ip17-timoaihuong-3.jpg','images/ip17-timoaihuong-4.jpg'],
  'Đen':['images/ip17-den-1.jpg','images/ip17-den-2.jpg','images/ip17-den-3.jpg','images/ip17-den-4.jpg'],
  'Trắng':['images/ip17-trang-1.jpg','images/ip17-trang-2.jpg','images/ip17-trang-3.jpg','images/ip17-trang-4.jpg'],
  'Xanh Lam Khói':['images/ip17-xanhlamkhoi-1.jpg','images/ip17-xanhlamkhoi-2.jpg','images/ip17-xanhlamkhoi-3.jpg','images/ip17-xanhlamkhoi-4.jpg'],
  'Xanh Lá Xô Thơm':['images/ip17-xanhlaxothom-1.jpg','images/ip17-xanhlaxothom-2.jpg','images/ip17-xanhlaxothom-3.jpg','images/ip17-xanhlaxothom-4.jpg']},
 memoryPrices:{'256GB':26490000,'512GB':33490000},
 memoryOld:{'256GB':28990000,'512GB':35990000},featured:4},
{id:9,brand:'Realme',name:'realme C100x',memory:['4GB-128GB','6GB-128GB'],colors:['Vàng','Xanh'],price:6090000,old:6990000,gift:'Trả góp 0%',rating:4.9,sold:'23,8k',img:'images/rmc100x-vang-1.jpg',
 colorImages:{
  'Vàng':['images/rmc100x-vang-1.jpg','images/rmc100x-vang-2.jpg','images/rmc100x-vang-3.jpg','images/rmc100x-vang-4.jpg','images/rmc100x-vang-5.jpg','images/rmc100x-vang-6.jpg','images/rmc100x-vang-7.jpg'],
  'Xanh':['images/rmc100x-xanh-1.jpg','images/rmc100x-xanh-2.jpg','images/rmc100x-xanh-3.jpg','images/rmc100x-xanh-4.jpg','images/rmc100x-xanh-5.jpg','images/rmc100x-xanh-6.jpg']},
 memoryPrices:{'4GB-128GB':6090000,'6GB-128GB':6790000},
 memoryOld:{'4GB-128GB':6990000,'6GB-128GB':7790000},featured:2},
{id:12,brand:'Apple',name:'iPhone 16 Pro Max',memory:['256GB','512GB','1TB'],colors:['Titan Tự Nhiên','Titan Sa Mạc','Titan Đen','Titan Trắng'],price:30790000,old:34990000,gift:'Quà tặng theo chương trình',rating:4.9,sold:'31,5k',img:'images/ip16pm-titan-tunhien-1.jpg',
 colorImages:{
  'Titan Tự Nhiên':['images/ip16pm-titan-tunhien-1.jpg','images/ip16pm-titan-tunhien-2.jpg','images/ip16pm-titan-tunhien-3.jpg','images/ip16pm-titan-tunhien-4.jpg','images/ip16pm-titan-tunhien-5.jpg'],
  'Titan Sa Mạc':['images/ip16pm-titan-samac-1.jpg','images/ip16pm-titan-samac-2.jpg','images/ip16pm-titan-samac-3.jpg','images/ip16pm-titan-samac-4.jpg','images/ip16pm-titan-samac-5.jpg'],
  'Titan Đen':['images/ip16pm-titan-den-1.jpg','images/ip16pm-titan-den-2.jpg','images/ip16pm-titan-den-3.jpg','images/ip16pm-titan-den-4.jpg','images/ip16pm-titan-den-5.jpg'],
  'Titan Trắng':['images/ip16pm-titan-trang-1.jpg','images/ip16pm-titan-trang-2.jpg','images/ip16pm-titan-trang-3.jpg','images/ip16pm-titan-trang-4.jpg','images/ip16pm-titan-trang-5.jpg']},
 memoryPrices:{'256GB':30790000,'512GB':36690000,'1TB':42390000},featured:6},
];

const swatchColors={'Đỏ Burgundy':'#6d1a24','Đen':'#1d1d1f','Bạc':'#d9d9d9','Băng Thanh':'#a8d8dc','Xanh Đậm':'#1f3b66','Cam Vũ Trụ':'#c4602a','Tím Oải Hương':'#b9a6d8','Trắng':'#f4f4f4','Xanh Lam Khói':'#7d97ab','Xanh Lá Xô Thơm':'#9cb89a','Xanh đen':'#1f3b66','Xanh Dương':'#a8d3ea','Tím':'#8f8bb8','Xanh lá':'#4f7f4f','Xanh Lá':'#c9d8c4','Xanh Lá Đậm':'#2f3d40','Vàng':'#d8c49a','Xanh':'#2a364c','Titan Tự Nhiên':'#c2bcb2','Titan Sa Mạc':'#c9a882','Titan Đen':'#3b3b3d','Titan Trắng':'#f0efed','Vàng Nhạt':'#e6dcc6','Đen Không Gian':'#2c2c2e','Xanh Da Trời':'#cfe2f0','Trắng Mây':'#f1f1ee'};

/* Giá theo dung lượng: dùng memoryPrices nếu có, ngược lại lấy giá gốc */
function priceFor(p,mem){return (p.memoryPrices&&p.memoryPrices[mem])||p.price}

/* Giá gốc (giá niêm yết) theo dung lượng */
function oldPriceFor(p,mem){return (p.memoryOld&&p.memoryOld[mem])||p.old}

/* Nhãn dung lượng kèm RAM: '12GB-256GB' nếu có memoryRam, ngược lại chỉ dung lượng */
function memoryLabel(p,mem){return (p.memoryRam&&p.memoryRam[mem])?p.memoryRam[mem]+'-'+mem:mem}

const money=n=>n.toLocaleString('vi-VN')+'₫';

function getProduct(id){return products.find(p=>p.id===Number(id))}

/* Ảnh hiển thị của một sản phẩm theo màu: ảnh riêng của màu trước, ảnh chung sau */
function productImages(p,color){
 let list=(p.colorImages&&color&&p.colorImages[color])?p.colorImages[color].slice():((p.images&&p.images.length)?p.images.slice():[p.img]);
 if(p.extraImages&&p.extraImages.length)list=list.concat(p.extraImages);
 return list;
}

