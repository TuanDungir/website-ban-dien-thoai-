/* =========================================================
   THEGIOIDIENTHOAI - SQL SERVER DATABASE
   Demo project. Run in SQL Server Management Studio (SSMS).
   ========================================================= */
IF DB_ID(N'TheGioiDienThoai') IS NULL
    CREATE DATABASE TheGioiDienThoai;
GO
USE TheGioiDienThoai;
GO

/* Drop child tables first to make this script re-runnable */
DROP TABLE IF EXISTS OrderTradeIns, OrderGiftItems, OrderVoucherUses, OrderItems,
 OrderStatusHistory, Orders, TradeInRequests, ProductGifts, PromotionProducts,
 VoucherProducts, CartItems, Carts, Reviews, ProductImages, InventoryTransactions,
 Inventory, ProductVariants, Products, Gifts, PromotionVouchers, Promotions,
 VoucherUsages, Vouchers, Categories, Brands, Addresses, UserRoles, Roles, Users;
GO

CREATE TABLE Users (
 UserID INT IDENTITY(1,1) PRIMARY KEY,
 FullName NVARCHAR(120) NOT NULL,
 Email NVARCHAR(254) NOT NULL UNIQUE,
 Phone VARCHAR(20) NULL UNIQUE,
 PasswordHash NVARCHAR(255) NOT NULL,
 IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
 CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSDATETIME()
);
CREATE TABLE Roles (
 RoleID INT IDENTITY(1,1) PRIMARY KEY,
 RoleName NVARCHAR(30) NOT NULL UNIQUE
);
CREATE TABLE UserRoles (
 UserID INT NOT NULL,
 RoleID INT NOT NULL,
 AssignedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT PK_UserRoles PRIMARY KEY(UserID, RoleID),
 CONSTRAINT FK_UserRoles_Users FOREIGN KEY(UserID) REFERENCES Users(UserID),
 CONSTRAINT FK_UserRoles_Roles FOREIGN KEY(RoleID) REFERENCES Roles(RoleID)
);
CREATE TABLE Addresses (
 AddressID INT IDENTITY(1,1) PRIMARY KEY,
 UserID INT NOT NULL,
 RecipientName NVARCHAR(120) NOT NULL,
 Phone VARCHAR(20) NOT NULL,
 Province NVARCHAR(100) NOT NULL,
 District NVARCHAR(100) NOT NULL,
 Ward NVARCHAR(100) NULL,
 StreetAddress NVARCHAR(250) NOT NULL,
 IsDefault BIT NOT NULL DEFAULT 0,
 CONSTRAINT FK_Addresses_Users FOREIGN KEY(UserID) REFERENCES Users(UserID)
);
CREATE TABLE Brands (
 BrandID INT IDENTITY(1,1) PRIMARY KEY,
 BrandName NVARCHAR(80) NOT NULL UNIQUE,
 IsActive BIT NOT NULL DEFAULT 1
);
CREATE TABLE Categories (
 CategoryID INT IDENTITY(1,1) PRIMARY KEY,
 CategoryName NVARCHAR(100) NOT NULL UNIQUE,
 Description NVARCHAR(300) NULL
);
CREATE TABLE Products (
 ProductID INT IDENTITY(1,1) PRIMARY KEY,
 BrandID INT NOT NULL,
 CategoryID INT NOT NULL,
 ProductName NVARCHAR(180) NOT NULL,
 Description NVARCHAR(MAX) NULL,
 IsFeatured BIT NOT NULL DEFAULT 0,
 IsActive BIT NOT NULL DEFAULT 1,
 CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT FK_Products_Brands FOREIGN KEY(BrandID) REFERENCES Brands(BrandID),
 CONSTRAINT FK_Products_Categories FOREIGN KEY(CategoryID) REFERENCES Categories(CategoryID)
);
CREATE TABLE ProductVariants (
 VariantID INT IDENTITY(1,1) PRIMARY KEY,
 ProductID INT NOT NULL,
 SKU VARCHAR(50) NOT NULL UNIQUE,
 StorageGB INT NOT NULL,
 RAMGB INT NULL,
 ColorName NVARCHAR(50) NOT NULL,
 ListPrice DECIMAL(18,2) NOT NULL,
 SalePrice DECIMAL(18,2) NOT NULL,
 IsActive BIT NOT NULL DEFAULT 1,
 CONSTRAINT FK_Variants_Products FOREIGN KEY(ProductID) REFERENCES Products(ProductID),
 CONSTRAINT CK_Variants_Storage CHECK(StorageGB > 0),
 CONSTRAINT CK_Variants_RAM CHECK(RAMGB IS NULL OR RAMGB > 0),
 CONSTRAINT CK_Variants_Prices CHECK(ListPrice >= 0 AND SalePrice >= 0 AND SalePrice <= ListPrice)
);
CREATE TABLE ProductImages (
 ImageID INT IDENTITY(1,1) PRIMARY KEY,
 ProductID INT NOT NULL,
 ImageURL NVARCHAR(500) NOT NULL,
 AltText NVARCHAR(180) NULL,
 SortOrder INT NOT NULL DEFAULT 0,
 CONSTRAINT FK_ProductImages_Products FOREIGN KEY(ProductID) REFERENCES Products(ProductID)
);
CREATE TABLE Inventory (
 VariantID INT PRIMARY KEY,
 QuantityOnHand INT NOT NULL DEFAULT 0,
 ReorderLevel INT NOT NULL DEFAULT 3,
 UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT FK_Inventory_Variants FOREIGN KEY(VariantID) REFERENCES ProductVariants(VariantID),
 CONSTRAINT CK_Inventory_Quantity CHECK(QuantityOnHand >= 0 AND ReorderLevel >= 0)
);
CREATE TABLE InventoryTransactions (
 TransactionID BIGINT IDENTITY(1,1) PRIMARY KEY,
 VariantID INT NOT NULL,
 ChangeQty INT NOT NULL,
 TransactionType NVARCHAR(30) NOT NULL,
 ReferenceCode NVARCHAR(50) NULL,
 Note NVARCHAR(300) NULL,
 CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT FK_InventoryTransactions_Variants FOREIGN KEY(VariantID) REFERENCES ProductVariants(VariantID),
 CONSTRAINT CK_InventoryTransactions_NonZero CHECK(ChangeQty <> 0)
);
CREATE TABLE Vouchers (
 VoucherID INT IDENTITY(1,1) PRIMARY KEY,
 Code VARCHAR(40) NOT NULL UNIQUE,
 Description NVARCHAR(250) NULL,
 DiscountType VARCHAR(10) NOT NULL,
 DiscountValue DECIMAL(18,2) NOT NULL,
 MinOrderValue DECIMAL(18,2) NOT NULL DEFAULT 0,
 MaxDiscount DECIMAL(18,2) NULL,
 StartAt DATETIME2 NOT NULL,
 EndAt DATETIME2 NOT NULL,
 UsageLimit INT NULL,
 IsActive BIT NOT NULL DEFAULT 1,
 CONSTRAINT CK_Vouchers_Type CHECK(DiscountType IN ('AMOUNT','PERCENT')),
 CONSTRAINT CK_Vouchers_Value CHECK(DiscountValue > 0),
 CONSTRAINT CK_Vouchers_Dates CHECK(EndAt > StartAt),
 CONSTRAINT CK_Vouchers_MinOrder CHECK(MinOrderValue >= 0)
);
CREATE TABLE VoucherUsages (
 VoucherUsageID BIGINT IDENTITY(1,1) PRIMARY KEY,
 VoucherID INT NOT NULL,
 UserID INT NOT NULL,
 OrderID INT NULL,
 UsedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT FK_VoucherUsages_Vouchers FOREIGN KEY(VoucherID) REFERENCES Vouchers(VoucherID),
 CONSTRAINT FK_VoucherUsages_Users FOREIGN KEY(UserID) REFERENCES Users(UserID)
);
CREATE TABLE VoucherProducts (
 VoucherID INT NOT NULL,
 ProductID INT NOT NULL,
 CONSTRAINT PK_VoucherProducts PRIMARY KEY(VoucherID, ProductID),
 CONSTRAINT FK_VoucherProducts_Vouchers FOREIGN KEY(VoucherID) REFERENCES Vouchers(VoucherID),
 CONSTRAINT FK_VoucherProducts_Products FOREIGN KEY(ProductID) REFERENCES Products(ProductID)
);
CREATE TABLE Promotions (
 PromotionID INT IDENTITY(1,1) PRIMARY KEY,
 PromotionName NVARCHAR(150) NOT NULL,
 Description NVARCHAR(500) NULL,
 StartAt DATETIME2 NOT NULL,
 EndAt DATETIME2 NOT NULL,
 IsActive BIT NOT NULL DEFAULT 1,
 CONSTRAINT CK_Promotions_Dates CHECK(EndAt > StartAt)
);
CREATE TABLE PromotionVouchers (
 PromotionID INT NOT NULL,
 VoucherID INT NOT NULL,
 CONSTRAINT PK_PromotionVouchers PRIMARY KEY(PromotionID, VoucherID),
 CONSTRAINT FK_PromotionVouchers_Promotions FOREIGN KEY(PromotionID) REFERENCES Promotions(PromotionID),
 CONSTRAINT FK_PromotionVouchers_Vouchers FOREIGN KEY(VoucherID) REFERENCES Vouchers(VoucherID)
);
CREATE TABLE PromotionProducts (
 PromotionID INT NOT NULL,
 ProductID INT NOT NULL,
 CONSTRAINT PK_PromotionProducts PRIMARY KEY(PromotionID, ProductID),
 CONSTRAINT FK_PromotionProducts_Promotions FOREIGN KEY(PromotionID) REFERENCES Promotions(PromotionID),
 CONSTRAINT FK_PromotionProducts_Products FOREIGN KEY(ProductID) REFERENCES Products(ProductID)
);
CREATE TABLE Gifts (
 GiftID INT IDENTITY(1,1) PRIMARY KEY,
 GiftName NVARCHAR(150) NOT NULL,
 Description NVARCHAR(300) NULL,
 GiftValue DECIMAL(18,2) NOT NULL DEFAULT 0,
 QuantityOnHand INT NOT NULL DEFAULT 0,
 IsActive BIT NOT NULL DEFAULT 1,
 CONSTRAINT CK_Gifts_Value CHECK(GiftValue >= 0),
 CONSTRAINT CK_Gifts_Quantity CHECK(QuantityOnHand >= 0)
);
CREATE TABLE ProductGifts (
 ProductID INT NOT NULL,
 GiftID INT NOT NULL,
 PromotionID INT NULL,
 QuantityPerPurchase INT NOT NULL DEFAULT 1,
 CONSTRAINT PK_ProductGifts PRIMARY KEY(ProductID, GiftID),
 CONSTRAINT FK_ProductGifts_Products FOREIGN KEY(ProductID) REFERENCES Products(ProductID),
 CONSTRAINT FK_ProductGifts_Gifts FOREIGN KEY(GiftID) REFERENCES Gifts(GiftID),
 CONSTRAINT FK_ProductGifts_Promotions FOREIGN KEY(PromotionID) REFERENCES Promotions(PromotionID),
 CONSTRAINT CK_ProductGifts_Qty CHECK(QuantityPerPurchase > 0)
);
CREATE TABLE Carts (
 CartID INT IDENTITY(1,1) PRIMARY KEY,
 UserID INT NOT NULL,
 CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT FK_Carts_Users FOREIGN KEY(UserID) REFERENCES Users(UserID)
);
CREATE TABLE CartItems (
 CartItemID INT IDENTITY(1,1) PRIMARY KEY,
 CartID INT NOT NULL,
 VariantID INT NOT NULL,
 Quantity INT NOT NULL,
 AddedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT FK_CartItems_Carts FOREIGN KEY(CartID) REFERENCES Carts(CartID),
 CONSTRAINT FK_CartItems_Variants FOREIGN KEY(VariantID) REFERENCES ProductVariants(VariantID),
 CONSTRAINT UQ_CartItems_CartVariant UNIQUE(CartID, VariantID),
 CONSTRAINT CK_CartItems_Quantity CHECK(Quantity > 0)
);
CREATE TABLE Orders (
 OrderID INT IDENTITY(1,1) PRIMARY KEY,
 OrderCode VARCHAR(30) NOT NULL UNIQUE,
 UserID INT NOT NULL,
 AddressID INT NULL,
 OrderDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 Status NVARCHAR(30) NOT NULL DEFAULT N'Pending',
 PaymentMethod NVARCHAR(30) NOT NULL DEFAULT N'COD',
 PaymentStatus NVARCHAR(30) NOT NULL DEFAULT N'Unpaid',
 Subtotal DECIMAL(18,2) NOT NULL,
 DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
 ShippingFee DECIMAL(18,2) NOT NULL DEFAULT 0,
 TotalAmount DECIMAL(18,2) NOT NULL,
 CustomerNote NVARCHAR(500) NULL,
 CONSTRAINT FK_Orders_Users FOREIGN KEY(UserID) REFERENCES Users(UserID),
 CONSTRAINT FK_Orders_Addresses FOREIGN KEY(AddressID) REFERENCES Addresses(AddressID),
 CONSTRAINT CK_Orders_Status CHECK(Status IN (N'Pending',N'Confirmed',N'Shipping',N'Completed',N'Cancelled')),
 CONSTRAINT CK_Orders_Amounts CHECK(Subtotal >= 0 AND DiscountAmount >= 0 AND ShippingFee >= 0 AND TotalAmount >= 0)
);
CREATE TABLE OrderItems (
 OrderItemID INT IDENTITY(1,1) PRIMARY KEY,
 OrderID INT NOT NULL,
 VariantID INT NOT NULL,
 ProductNameSnapshot NVARCHAR(180) NOT NULL,
 SKU_Snapshot VARCHAR(50) NOT NULL,
 UnitPrice DECIMAL(18,2) NOT NULL,
 Quantity INT NOT NULL,
 LineTotal AS (UnitPrice * Quantity) PERSISTED,
 CONSTRAINT FK_OrderItems_Orders FOREIGN KEY(OrderID) REFERENCES Orders(OrderID),
 CONSTRAINT FK_OrderItems_Variants FOREIGN KEY(VariantID) REFERENCES ProductVariants(VariantID),
 CONSTRAINT CK_OrderItems_Values CHECK(UnitPrice >= 0 AND Quantity > 0)
);
CREATE TABLE OrderVoucherUses (
 OrderID INT NOT NULL,
 VoucherID INT NOT NULL,
 DiscountAmount DECIMAL(18,2) NOT NULL,
 CONSTRAINT PK_OrderVoucherUses PRIMARY KEY(OrderID, VoucherID),
 CONSTRAINT FK_OrderVoucherUses_Orders FOREIGN KEY(OrderID) REFERENCES Orders(OrderID),
 CONSTRAINT FK_OrderVoucherUses_Vouchers FOREIGN KEY(VoucherID) REFERENCES Vouchers(VoucherID),
 CONSTRAINT CK_OrderVoucherUses_Discount CHECK(DiscountAmount >= 0)
);
CREATE TABLE OrderGiftItems (
 OrderGiftItemID INT IDENTITY(1,1) PRIMARY KEY,
 OrderID INT NOT NULL,
 GiftID INT NOT NULL,
 GiftNameSnapshot NVARCHAR(150) NOT NULL,
 Quantity INT NOT NULL DEFAULT 1,
 CONSTRAINT FK_OrderGiftItems_Orders FOREIGN KEY(OrderID) REFERENCES Orders(OrderID),
 CONSTRAINT FK_OrderGiftItems_Gifts FOREIGN KEY(GiftID) REFERENCES Gifts(GiftID),
 CONSTRAINT CK_OrderGiftItems_Quantity CHECK(Quantity > 0)
);
CREATE TABLE TradeInRequests (
 TradeInID INT IDENTITY(1,1) PRIMARY KEY,
 UserID INT NOT NULL,
 OrderID INT NULL,
 OldBrand NVARCHAR(80) NOT NULL,
 OldModel NVARCHAR(150) NOT NULL,
 OldStorage NVARCHAR(30) NULL,
 ConditionDescription NVARCHAR(1000) NOT NULL,
 EstimatedValue DECIMAL(18,2) NOT NULL DEFAULT 0,
 FinalValue DECIMAL(18,2) NULL,
 Status NVARCHAR(30) NOT NULL DEFAULT N'Received',
 CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 AssessedAt DATETIME2 NULL,
 CONSTRAINT FK_TradeInRequests_Users FOREIGN KEY(UserID) REFERENCES Users(UserID),
 CONSTRAINT FK_TradeInRequests_Orders FOREIGN KEY(OrderID) REFERENCES Orders(OrderID),
 CONSTRAINT CK_TradeInRequests_Values CHECK(EstimatedValue >= 0 AND (FinalValue IS NULL OR FinalValue >= 0)),
 CONSTRAINT CK_TradeInRequests_Status CHECK(Status IN (N'Received',N'Assessing',N'Approved',N'Rejected',N'Completed'))
);
CREATE TABLE OrderTradeIns (
 OrderID INT NOT NULL,
 TradeInID INT NOT NULL,
 AppliedValue DECIMAL(18,2) NOT NULL,
 CONSTRAINT PK_OrderTradeIns PRIMARY KEY(OrderID, TradeInID),
 CONSTRAINT FK_OrderTradeIns_Orders FOREIGN KEY(OrderID) REFERENCES Orders(OrderID),
 CONSTRAINT FK_OrderTradeIns_TradeIns FOREIGN KEY(TradeInID) REFERENCES TradeInRequests(TradeInID),
 CONSTRAINT CK_OrderTradeIns_Value CHECK(AppliedValue >= 0)
);
CREATE TABLE OrderStatusHistory (
 HistoryID BIGINT IDENTITY(1,1) PRIMARY KEY,
 OrderID INT NOT NULL,
 OldStatus NVARCHAR(30) NULL,
 NewStatus NVARCHAR(30) NOT NULL,
 ChangedByUserID INT NULL,
 Note NVARCHAR(500) NULL,
 ChangedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 CONSTRAINT FK_OrderStatusHistory_Orders FOREIGN KEY(OrderID) REFERENCES Orders(OrderID),
 CONSTRAINT FK_OrderStatusHistory_Users FOREIGN KEY(ChangedByUserID) REFERENCES Users(UserID)
);
CREATE TABLE Reviews (
 ReviewID INT IDENTITY(1,1) PRIMARY KEY,
 UserID INT NOT NULL,
 ProductID INT NOT NULL,
 OrderID INT NULL,
 Rating TINYINT NOT NULL,
 ReviewText NVARCHAR(1500) NULL,
 CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
 IsApproved BIT NOT NULL DEFAULT 0,
 CONSTRAINT FK_Reviews_Users FOREIGN KEY(UserID) REFERENCES Users(UserID),
 CONSTRAINT FK_Reviews_Products FOREIGN KEY(ProductID) REFERENCES Products(ProductID),
 CONSTRAINT FK_Reviews_Orders FOREIGN KEY(OrderID) REFERENCES Orders(OrderID),
 CONSTRAINT CK_Reviews_Rating CHECK(Rating BETWEEN 1 AND 5)
);
GO

/* Seed data: five rows per main table; bridge tables receive five rows where possible */
INSERT INTO Roles(RoleName) VALUES (N'Customer'),(N'Admin'),(N'SalesStaff'),(N'WarehouseStaff'),(N'SupportStaff');
INSERT INTO Users(FullName,Email,Phone,PasswordHash) VALUES
(N'Nguyễn Minh Anh','minhanh@example.com','0900000001','DEMO_HASH_CHANGE_ME'),
(N'Trần Quốc Bảo','quocbao@example.com','0900000002','DEMO_HASH_CHANGE_ME'),
(N'Lê Thu Hà','thuha@example.com','0900000003','DEMO_HASH_CHANGE_ME'),
(N'Phạm Đức Long','duclong@example.com','0900000004','DEMO_HASH_CHANGE_ME'),
(N'Admin Demo','admin@example.com','0900000005','DEMO_HASH_CHANGE_ME');
INSERT INTO UserRoles(UserID,RoleID) VALUES (1,1),(2,1),(3,1),(4,3),(5,2);
INSERT INTO Addresses(UserID,RecipientName,Phone,Province,District,Ward,StreetAddress,IsDefault) VALUES
(1,N'Nguyễn Minh Anh','0900000001',N'Hà Nội',N'Cầu Giấy',N'Dịch Vọng',N'12 Xuân Thủy',1),
(2,N'Trần Quốc Bảo','0900000002',N'Hà Nội',N'Đống Đa',N'Láng Hạ',N'20 Láng Hạ',1),
(3,N'Lê Thu Hà','0900000003',N'Đà Nẵng',N'Hải Châu',N'Hải Châu 1',N'10 Bạch Đằng',1),
(4,N'Phạm Đức Long','0900000004',N'TP. Hồ Chí Minh',N'Quận 1',N'Bến Nghé',N'15 Nguyễn Huệ',1),
(5,N'Admin Demo','0900000005',N'Hà Nội',N'Ba Đình',N'Điện Biên',N'1 Đội Cấn',1);
INSERT INTO Brands(BrandName) VALUES (N'Apple'),(N'Samsung'),(N'Xiaomi'),(N'OPPO'),(N'Vivo');
INSERT INTO Categories(CategoryName,Description) VALUES
(N'Điện thoại cao cấp',N'Flagship và điện thoại cao cấp'),
(N'Điện thoại phổ thông',N'Điện thoại phục vụ nhu cầu hằng ngày'),
(N'Điện thoại gaming',N'Điện thoại tối ưu chơi game'),
(N'Điện thoại chụp ảnh',N'Điện thoại tập trung camera'),
(N'Điện thoại pin khỏe',N'Điện thoại ưu tiên thời lượng pin');
INSERT INTO Products(BrandID,CategoryID,ProductName,Description,IsFeatured) VALUES
(1,1,N'iPhone 17 Pro 256GB',N'Mẫu flagship Apple minh họa',1),
(2,1,N'Samsung Galaxy S26 Ultra',N'Mẫu flagship Samsung minh họa: 12GB-256GB, 12GB-512GB, 16GB-1TB; màu Xanh Dương, Trắng, Tím, Đen',1),
(3,2,N'Xiaomi 17T 5G',N'Mẫu Xiaomi minh họa: 256GB và 512GB; màu Đen, Tím, Trắng',1),
(4,4,N'OPPO Reno16 Pro 5G',N'Mẫu OPPO minh họa: 256GB màu Đen và Trắng',0),
(5,3,N'Vivo X300 Ultra',N'Mẫu Vivo minh họa: 512GB màu Xanh Lá',1),
(1,2,N'iPhone 17',N'Mẫu iPhone tiêu chuẩn minh họa: 256GB và 512GB; màu Tím Oải Hương, Đen, Trắng, Xanh Lam Khói, Xanh Lá Xô Thơm',1),
(1,1,N'iPhone 18 Pro',N'Mẫu flagship Apple minh họa: 256GB, 512GB, 1TB, 2TB; màu Đỏ Burgundy, Đen, Bạc, Băng Thanh',1),
(1,1,N'iPhone Air',N'iPhone siêu mỏng minh họa: 256GB, 512GB, 1TB; màu Vàng Nhạt, Đen Không Gian, Xanh Da Trời, Trắng Mây',1);
INSERT INTO ProductVariants(ProductID,SKU,StorageGB,RAMGB,ColorName,ListPrice,SalePrice) VALUES
(1,'APL-IP17P-256-BLK',256,8,N'Đen',34990000,31990000),
(2,'SAM-S26U-256-BLU',256,12,N'Xanh Dương',40990000,29490000),
(3,'XIA-17T-256-BLK',256,12,N'Đen',20990000,15990000),
(4,'OPP-R16P-256-BLK',256,12,N'Đen',25990000,23190000),
(5,'VIV-X300-512-GRN',512,16,N'Xanh Lá',49990000,35990000);
/* Galaxy S26 Ultra: đủ 3 dung lượng x 4 màu (VariantID 6-16, dòng 2 là 256GB-Xanh Dương) */
INSERT INTO ProductVariants(ProductID,SKU,StorageGB,RAMGB,ColorName,ListPrice,SalePrice) VALUES
(2,'SAM-S26U-256-WHT',256,12,N'Trắng',40990000,29490000),
(2,'SAM-S26U-256-PUR',256,12,N'Tím',40990000,29490000),
(2,'SAM-S26U-256-BLK',256,12,N'Đen',40990000,29490000),
(2,'SAM-S26U-512-BLU',512,12,N'Xanh Dương',46990000,37490000),
(2,'SAM-S26U-512-WHT',512,12,N'Trắng',46990000,37490000),
(2,'SAM-S26U-512-PUR',512,12,N'Tím',46990000,37490000),
(2,'SAM-S26U-512-BLK',512,12,N'Đen',46990000,37490000),
(2,'SAM-S26U-1TB-BLU',1024,16,N'Xanh Dương',52990000,42890000),
(2,'SAM-S26U-1TB-WHT',1024,16,N'Trắng',52990000,42890000),
(2,'SAM-S26U-1TB-PUR',1024,16,N'Tím',52990000,42890000),
(2,'SAM-S26U-1TB-BLK',1024,16,N'Đen',52990000,42890000);
/* OPPO Reno16 Pro 5G: thêm bản 256GB màu Trắng (VariantID 17; dòng 4 là 256GB màu Đen) */
INSERT INTO ProductVariants(ProductID,SKU,StorageGB,RAMGB,ColorName,ListPrice,SalePrice) VALUES
(4,'OPP-R16P-256-WHT',256,12,N'Trắng',25990000,23190000);
/* Xiaomi 17T 5G: 2 dung lượng x 3 màu (VariantID 18-23; dòng 3 là 256GB màu Đen) */
INSERT INTO ProductVariants(ProductID,SKU,StorageGB,RAMGB,ColorName,ListPrice,SalePrice) VALUES
(3,'XIA-17T-256-PUR',256,12,N'Tím',20990000,15990000),
(3,'XIA-17T-256-WHT',256,12,N'Trắng',20990000,15990000),
(3,'XIA-17T-512-BLK',512,12,N'Đen',22590000,17590000),
(3,'XIA-17T-512-PUR',512,12,N'Tím',22590000,17590000),
(3,'XIA-17T-512-WHT',512,12,N'Trắng',22590000,17590000);
/* iPhone 17: 2 dung lượng x 5 màu (VariantID 23-32) */
INSERT INTO ProductVariants(ProductID,SKU,StorageGB,RAMGB,ColorName,ListPrice,SalePrice) VALUES
(6,'APL-IP17-256-PUR',256,8,N'Tím Oải Hương',28990000,26490000),
(6,'APL-IP17-256-BLK',256,8,N'Đen',28990000,26490000),
(6,'APL-IP17-256-WHT',256,8,N'Trắng',28990000,26490000),
(6,'APL-IP17-256-BLU',256,8,N'Xanh Lam Khói',28990000,26490000),
(6,'APL-IP17-256-GRN',256,8,N'Xanh Lá Xô Thơm',28990000,26490000),
(6,'APL-IP17-512-PUR',512,8,N'Tím Oải Hương',35990000,33490000),
(6,'APL-IP17-512-BLK',512,8,N'Đen',35990000,33490000),
(6,'APL-IP17-512-WHT',512,8,N'Trắng',35990000,33490000),
(6,'APL-IP17-512-BLU',512,8,N'Xanh Lam Khói',35990000,33490000),
(6,'APL-IP17-512-GRN',512,8,N'Xanh Lá Xô Thơm',35990000,33490000);
/* iPhone 18 Pro: 4 dung lượng x 4 màu (VariantID 33-48) */
INSERT INTO ProductVariants(ProductID,SKU,StorageGB,RAMGB,ColorName,ListPrice,SalePrice) VALUES
(7,'APL-IP18P-256-BRG',256,8,N'Đỏ Burgundy',42990000,38990000),
(7,'APL-IP18P-256-BLK',256,8,N'Đen',42990000,38990000),
(7,'APL-IP18P-256-SLV',256,8,N'Bạc',42990000,38990000),
(7,'APL-IP18P-256-TEA',256,8,N'Băng Thanh',42990000,38990000),
(7,'APL-IP18P-512-BRG',512,8,N'Đỏ Burgundy',49490000,45490000),
(7,'APL-IP18P-512-BLK',512,8,N'Đen',49490000,45490000),
(7,'APL-IP18P-512-SLV',512,8,N'Bạc',49490000,45490000),
(7,'APL-IP18P-512-TEA',512,8,N'Băng Thanh',49490000,45490000),
(7,'APL-IP18P-1TB-BRG',1024,12,N'Đỏ Burgundy',62490000,58490000),
(7,'APL-IP18P-1TB-BLK',1024,12,N'Đen',62490000,58490000),
(7,'APL-IP18P-1TB-SLV',1024,12,N'Bạc',62490000,58490000),
(7,'APL-IP18P-1TB-TEA',1024,12,N'Băng Thanh',62490000,58490000),
(7,'APL-IP18P-2TB-BRG',2048,12,N'Đỏ Burgundy',81990000,77990000),
(7,'APL-IP18P-2TB-BLK',2048,12,N'Đen',81990000,77990000),
(7,'APL-IP18P-2TB-SLV',2048,12,N'Bạc',81990000,77990000),
(7,'APL-IP18P-2TB-TEA',2048,12,N'Băng Thanh',81990000,77990000);
/* iPhone Air: 3 dung lượng x 4 màu (VariantID 49-60) */
INSERT INTO ProductVariants(ProductID,SKU,StorageGB,RAMGB,ColorName,ListPrice,SalePrice) VALUES
(8,'APL-IPAIR-256-YLW',256,8,N'Vàng Nhạt',25990000,22990000),
(8,'APL-IPAIR-256-BLK',256,8,N'Đen Không Gian',25990000,22990000),
(8,'APL-IPAIR-256-BLU',256,8,N'Xanh Da Trời',25990000,22990000),
(8,'APL-IPAIR-256-WHT',256,8,N'Trắng Mây',25990000,22990000),
(8,'APL-IPAIR-512-YLW',512,8,N'Vàng Nhạt',31990000,28990000),
(8,'APL-IPAIR-512-BLK',512,8,N'Đen Không Gian',31990000,28990000),
(8,'APL-IPAIR-512-BLU',512,8,N'Xanh Da Trời',31990000,28990000),
(8,'APL-IPAIR-512-WHT',512,8,N'Trắng Mây',31990000,28990000),
(8,'APL-IPAIR-1TB-YLW',1024,12,N'Vàng Nhạt',44990000,40990000),
(8,'APL-IPAIR-1TB-BLK',1024,12,N'Đen Không Gian',44990000,40990000),
(8,'APL-IPAIR-1TB-BLU',1024,12,N'Xanh Da Trời',44990000,40990000),
(8,'APL-IPAIR-1TB-WHT',1024,12,N'Trắng Mây',44990000,40990000);
INSERT INTO ProductImages(ProductID,ImageURL,AltText,SortOrder) VALUES
(1,N'https://placehold.co/500x500/f7f7f7/222?text=iPhone+17+Pro',N'iPhone 17 Pro',1),
(2,N'images/s26u-xanhduong-1.jpg',N'Galaxy S26 Ultra Xanh Dương',1),
(2,N'images/s26u-xanhduong-2.jpg',N'Galaxy S26 Ultra Xanh Dương',2),
(2,N'images/s26u-xanhduong-3.jpg',N'Galaxy S26 Ultra Xanh Dương',3),
(2,N'images/s26u-xanhduong-4.jpg',N'Galaxy S26 Ultra Xanh Dương',4),
(2,N'images/s26u-trang-1.jpg',N'Galaxy S26 Ultra Trắng',5),
(2,N'images/s26u-trang-2.jpg',N'Galaxy S26 Ultra Trắng',6),
(2,N'images/s26u-trang-3.jpg',N'Galaxy S26 Ultra Trắng',7),
(2,N'images/s26u-tim-1.jpg',N'Galaxy S26 Ultra Tím',8),
(2,N'images/s26u-tim-2.jpg',N'Galaxy S26 Ultra Tím',9),
(2,N'images/s26u-tim-3.jpg',N'Galaxy S26 Ultra Tím',10),
(2,N'images/s26u-tim-4.jpg',N'Galaxy S26 Ultra Tím',11),
(2,N'images/s26u-den-1.jpg',N'Galaxy S26 Ultra Đen',12),
(2,N'images/s26u-den-2.jpg',N'Galaxy S26 Ultra Đen',13),
(2,N'images/s26u-den-3.jpg',N'Galaxy S26 Ultra Đen',14),
(2,N'images/s26u-hop.jpg',N'Hộp phụ kiện Galaxy S26 Ultra',15),
(3,N'images/xm17t-den-1.jpg',N'Xiaomi 17T 5G Đen',1),
(3,N'images/xm17t-den-2.jpg',N'Xiaomi 17T 5G Đen',2),
(3,N'images/xm17t-den-3.jpg',N'Xiaomi 17T 5G Đen',3),
(3,N'images/xm17t-den-4.jpg',N'Xiaomi 17T 5G Đen',4),
(3,N'images/xm17t-den-5.jpg',N'Xiaomi 17T 5G Đen',5),
(3,N'images/xm17t-den-6.jpg',N'Xiaomi 17T 5G Đen',6),
(3,N'images/xm17t-tim-1.jpg',N'Xiaomi 17T 5G Tím',7),
(3,N'images/xm17t-tim-2.jpg',N'Xiaomi 17T 5G Tím',8),
(3,N'images/xm17t-tim-3.jpg',N'Xiaomi 17T 5G Tím',9),
(3,N'images/xm17t-tim-4.jpg',N'Xiaomi 17T 5G Tím',10),
(3,N'images/xm17t-tim-5.jpg',N'Xiaomi 17T 5G Tím',11),
(3,N'images/xm17t-tim-6.jpg',N'Xiaomi 17T 5G Tím',12),
(3,N'images/xm17t-trang-1.jpg',N'Xiaomi 17T 5G Trắng',13),
(3,N'images/xm17t-trang-2.jpg',N'Xiaomi 17T 5G Trắng',14),
(3,N'images/xm17t-trang-3.jpg',N'Xiaomi 17T 5G Trắng',15),
(3,N'images/xm17t-trang-4.jpg',N'Xiaomi 17T 5G Trắng',16),
(3,N'images/xm17t-trang-5.jpg',N'Xiaomi 17T 5G Trắng',17),
(3,N'images/xm17t-trang-6.jpg',N'Xiaomi 17T 5G Trắng',18),
(3,N'images/xm17t-trang-7.jpg',N'Xiaomi 17T 5G Trắng',19),
(4,N'images/reno16p-den-1.jpg',N'OPPO Reno16 Pro 5G Đen',1),
(4,N'images/reno16p-den-2.jpg',N'OPPO Reno16 Pro 5G Đen',2),
(4,N'images/reno16p-den-3.jpg',N'OPPO Reno16 Pro 5G Đen',3),
(4,N'images/reno16p-den-4.jpg',N'OPPO Reno16 Pro 5G Đen',4),
(4,N'images/reno16p-den-5.jpg',N'OPPO Reno16 Pro 5G Đen',5),
(4,N'images/reno16p-trang-1.jpg',N'OPPO Reno16 Pro 5G Trắng',6),
(4,N'images/reno16p-trang-2.jpg',N'OPPO Reno16 Pro 5G Trắng',7),
(4,N'images/reno16p-trang-3.jpg',N'OPPO Reno16 Pro 5G Trắng',8),
(4,N'images/reno16p-trang-4.jpg',N'OPPO Reno16 Pro 5G Trắng',9),
(4,N'images/reno16p-trang-5.jpg',N'OPPO Reno16 Pro 5G Trắng',10),
(5,N'images/vivo-x300u-xanhla-1.jpg',N'Vivo X300 Ultra Xanh Lá',1),
(5,N'images/vivo-x300u-xanhla-2.jpg',N'Vivo X300 Ultra Xanh Lá',2),
(5,N'images/vivo-x300u-xanhla-3.jpg',N'Vivo X300 Ultra Xanh Lá',3),
(5,N'images/vivo-x300u-xanhla-4.jpg',N'Vivo X300 Ultra Xanh Lá',4),
(5,N'images/vivo-x300u-xanhla-5.jpg',N'Vivo X300 Ultra Xanh Lá',5),
(5,N'images/vivo-x300u-xanhla-6.jpg',N'Vivo X300 Ultra Xanh Lá',6),
(5,N'images/vivo-x300u-xanhla-7.jpg',N'Vivo X300 Ultra Xanh Lá',7),
(6,N'images/ip17-timoaihuong-1.jpg',N'iPhone 17 Tím Oải Hương',1),
(6,N'images/ip17-timoaihuong-2.jpg',N'iPhone 17 Tím Oải Hương',2),
(6,N'images/ip17-timoaihuong-3.jpg',N'iPhone 17 Tím Oải Hương',3),
(6,N'images/ip17-timoaihuong-4.jpg',N'iPhone 17 Tím Oải Hương',4),
(6,N'images/ip17-den-1.jpg',N'iPhone 17 Đen',5),
(6,N'images/ip17-den-2.jpg',N'iPhone 17 Đen',6),
(6,N'images/ip17-den-3.jpg',N'iPhone 17 Đen',7),
(6,N'images/ip17-den-4.jpg',N'iPhone 17 Đen',8),
(6,N'images/ip17-trang-1.jpg',N'iPhone 17 Trắng',9),
(6,N'images/ip17-trang-2.jpg',N'iPhone 17 Trắng',10),
(6,N'images/ip17-trang-3.jpg',N'iPhone 17 Trắng',11),
(6,N'images/ip17-trang-4.jpg',N'iPhone 17 Trắng',12),
(6,N'images/ip17-xanhlamkhoi-1.jpg',N'iPhone 17 Xanh Lam Khói',13),
(6,N'images/ip17-xanhlamkhoi-2.jpg',N'iPhone 17 Xanh Lam Khói',14),
(6,N'images/ip17-xanhlamkhoi-3.jpg',N'iPhone 17 Xanh Lam Khói',15),
(6,N'images/ip17-xanhlamkhoi-4.jpg',N'iPhone 17 Xanh Lam Khói',16),
(6,N'images/ip17-xanhlaxothom-1.jpg',N'iPhone 17 Xanh Lá Xô Thơm',17),
(6,N'images/ip17-xanhlaxothom-2.jpg',N'iPhone 17 Xanh Lá Xô Thơm',18),
(6,N'images/ip17-xanhlaxothom-3.jpg',N'iPhone 17 Xanh Lá Xô Thơm',19),
(6,N'images/ip17-xanhlaxothom-4.jpg',N'iPhone 17 Xanh Lá Xô Thơm',20),
(7,N'images/ip18pm-doburgundy-1.jpg',N'iPhone 18 Pro Đỏ Burgundy',1),
(7,N'images/ip18pm-doburgundy-2.jpg',N'iPhone 18 Pro Đỏ Burgundy',2),
(7,N'images/ip18pm-trong-hop.jpg',N'Hộp iPhone 18 Pro Đỏ Burgundy',3),
(7,N'images/ip18pm-den-1.jpg',N'iPhone 18 Pro Đen',4),
(7,N'images/ip18pm-den-2.jpg',N'iPhone 18 Pro Đen',5),
(7,N'images/ip18pm-bac-1.jpg',N'iPhone 18 Pro Bạc',6),
(7,N'images/ip18pm-bac-2.jpg',N'iPhone 18 Pro Bạc',7),
(7,N'images/ip18pm-bangthanh-1.jpg',N'iPhone 18 Pro Băng Thanh',8),
(7,N'images/ip18pm-bangthanh-2.jpg',N'iPhone 18 Pro Băng Thanh',9),
(7,N'images/ip18pm-camera-48mp.jpg',N'Camera iPhone 18 Pro',10),
(7,N'images/ip18pm-camera-pro.jpg',N'Hệ thống camera Pro iPhone 18 Pro',11),
(7,N'images/ip18pm-pin-43h.jpg',N'Thời lượng pin iPhone 18 Pro',12),
(7,N'images/ip18pm-chip-a20.jpg',N'Chip A20 iPhone 18 Pro',13),
(7,N'images/ip18pm-ceramic-shield.jpg',N'Ceramic Shield iPhone 18 Pro',14),
(7,N'images/ip18pm-bon-mau.jpg',N'Bốn màu iPhone 18 Pro',15),
(7,N'images/ip18pm-tong-hop.jpg',N'Tổng hợp iPhone 18 Pro',16),
(8,N'images/ipair-vangnhat-1.jpg',N'iPhone Air Vàng Nhạt',1),
(8,N'images/ipair-vangnhat-2.jpg',N'iPhone Air Vàng Nhạt',2),
(8,N'images/ipair-vangnhat-3.jpg',N'iPhone Air Vàng Nhạt',3),
(8,N'images/ipair-vangnhat-4.jpg',N'iPhone Air Vàng Nhạt',4),
(8,N'images/ipair-denkhonggian-1.jpg',N'iPhone Air Đen Không Gian',5),
(8,N'images/ipair-denkhonggian-2.jpg',N'iPhone Air Đen Không Gian',6),
(8,N'images/ipair-denkhonggian-3.jpg',N'iPhone Air Đen Không Gian',7),
(8,N'images/ipair-denkhonggian-4.jpg',N'iPhone Air Đen Không Gian',8),
(8,N'images/ipair-xanhdatroi-1.jpg',N'iPhone Air Xanh Da Trời',9),
(8,N'images/ipair-xanhdatroi-2.jpg',N'iPhone Air Xanh Da Trời',10),
(8,N'images/ipair-xanhdatroi-3.jpg',N'iPhone Air Xanh Da Trời',11),
(8,N'images/ipair-xanhdatroi-4.jpg',N'iPhone Air Xanh Da Trời',12),
(8,N'images/ipair-trangmay-1.jpg',N'iPhone Air Trắng Mây',13),
(8,N'images/ipair-trangmay-2.jpg',N'iPhone Air Trắng Mây',14),
(8,N'images/ipair-trangmay-3.jpg',N'iPhone Air Trắng Mây',15),
(8,N'images/ipair-trangmay-4.jpg',N'iPhone Air Trắng Mây',16),
(8,N'images/ipair-sieumong-1.jpg',N'iPhone Air siêu mỏng, nhẹ bỗng',17),
(8,N'images/ipair-sieumong-2.jpg',N'Tổng hợp ưu điểm iPhone Air',18);
INSERT INTO Inventory(VariantID,QuantityOnHand,ReorderLevel) VALUES (1,12,3),(2,8,3),(3,25,5),(4,16,4),(5,4,2),
(6,8,3),(7,8,3),(8,8,3),(9,6,3),(10,6,3),(11,6,3),(12,6,3),(13,4,2),(14,4,2),(15,4,2),(16,4,2),
(17,10,3),(18,10,3),(19,10,3),(20,6,3),(21,6,3),(22,6,3),
(23,12,3),(24,12,3),(25,12,3),(26,10,3),(27,10,3),
(28,6,3),(29,6,3),(30,6,3),(31,6,3),(32,6,3),
(33,10,3),(34,10,3),(35,8,3),(36,8,3),
(37,8,3),(38,8,3),(39,6,3),(40,6,3),
(41,5,2),(42,5,2),(43,4,2),(44,4,2),
(45,3,2),(46,3,2),(47,2,2),(48,2,2),
(49,10,3),(50,10,3),(51,10,3),(52,10,3),
(53,8,3),(54,8,3),(55,8,3),(56,8,3),
(57,5,2),(58,5,2),(59,5,2),(60,5,2);
INSERT INTO InventoryTransactions(VariantID,ChangeQty,TransactionType,ReferenceCode,Note) VALUES
(1,12,N'InitialStock',N'INIT-001',N'Tồn đầu kỳ'),(2,8,N'InitialStock',N'INIT-002',N'Tồn đầu kỳ'),
(3,25,N'InitialStock',N'INIT-003',N'Tồn đầu kỳ'),(4,16,N'InitialStock',N'INIT-004',N'Tồn đầu kỳ'),
(5,4,N'InitialStock',N'INIT-005',N'Tồn đầu kỳ'),
(6,8,N'InitialStock',N'INIT-006',N'Tồn đầu kỳ Galaxy S26 Ultra 256GB Trắng'),
(7,8,N'InitialStock',N'INIT-007',N'Tồn đầu kỳ Galaxy S26 Ultra 256GB Tím'),
(8,8,N'InitialStock',N'INIT-008',N'Tồn đầu kỳ Galaxy S26 Ultra 256GB Đen'),
(9,6,N'InitialStock',N'INIT-009',N'Tồn đầu kỳ Galaxy S26 Ultra 512GB Xanh Dương'),
(10,6,N'InitialStock',N'INIT-010',N'Tồn đầu kỳ Galaxy S26 Ultra 512GB Trắng'),
(11,6,N'InitialStock',N'INIT-011',N'Tồn đầu kỳ Galaxy S26 Ultra 512GB Tím'),
(12,6,N'InitialStock',N'INIT-012',N'Tồn đầu kỳ Galaxy S26 Ultra 512GB Đen'),
(13,4,N'InitialStock',N'INIT-013',N'Tồn đầu kỳ Galaxy S26 Ultra 1TB Xanh Dương'),
(14,4,N'InitialStock',N'INIT-014',N'Tồn đầu kỳ Galaxy S26 Ultra 1TB Trắng'),
(15,4,N'InitialStock',N'INIT-015',N'Tồn đầu kỳ Galaxy S26 Ultra 1TB Tím'),
(16,4,N'InitialStock',N'INIT-016',N'Tồn đầu kỳ Galaxy S26 Ultra 1TB Đen'),
(17,10,N'InitialStock',N'INIT-017',N'Tồn đầu kỳ OPPO Reno16 Pro 5G 256GB Trắng'),
(18,10,N'InitialStock',N'INIT-018',N'Tồn đầu kỳ Xiaomi 17T 5G 256GB Tím'),
(19,10,N'InitialStock',N'INIT-019',N'Tồn đầu kỳ Xiaomi 17T 5G 256GB Trắng'),
(20,6,N'InitialStock',N'INIT-020',N'Tồn đầu kỳ Xiaomi 17T 5G 512GB Đen'),
(21,6,N'InitialStock',N'INIT-021',N'Tồn đầu kỳ Xiaomi 17T 5G 512GB Tím'),
(22,6,N'InitialStock',N'INIT-022',N'Tồn đầu kỳ Xiaomi 17T 5G 512GB Trắng'),
(23,12,N'InitialStock',N'INIT-023',N'Tồn đầu kỳ iPhone 17 256GB Tím Oải Hương'),
(24,12,N'InitialStock',N'INIT-024',N'Tồn đầu kỳ iPhone 17 256GB Đen'),
(25,12,N'InitialStock',N'INIT-025',N'Tồn đầu kỳ iPhone 17 256GB Trắng'),
(26,10,N'InitialStock',N'INIT-026',N'Tồn đầu kỳ iPhone 17 256GB Xanh Lam Khói'),
(27,10,N'InitialStock',N'INIT-027',N'Tồn đầu kỳ iPhone 17 256GB Xanh Lá Xô Thơm'),
(28,6,N'InitialStock',N'INIT-028',N'Tồn đầu kỳ iPhone 17 512GB Tím Oải Hương'),
(29,6,N'InitialStock',N'INIT-029',N'Tồn đầu kỳ iPhone 17 512GB Đen'),
(30,6,N'InitialStock',N'INIT-030',N'Tồn đầu kỳ iPhone 17 512GB Trắng'),
(31,6,N'InitialStock',N'INIT-031',N'Tồn đầu kỳ iPhone 17 512GB Xanh Lam Khói'),
(32,6,N'InitialStock',N'INIT-032',N'Tồn đầu kỳ iPhone 17 512GB Xanh Lá Xô Thơm'),
(33,10,N'InitialStock',N'INIT-033',N'Tồn đầu kỳ iPhone 18 Pro 256GB Đỏ Burgundy'),
(34,10,N'InitialStock',N'INIT-034',N'Tồn đầu kỳ iPhone 18 Pro 256GB Đen'),
(35,8,N'InitialStock',N'INIT-035',N'Tồn đầu kỳ iPhone 18 Pro 256GB Bạc'),
(36,8,N'InitialStock',N'INIT-036',N'Tồn đầu kỳ iPhone 18 Pro 256GB Băng Thanh'),
(37,8,N'InitialStock',N'INIT-037',N'Tồn đầu kỳ iPhone 18 Pro 512GB Đỏ Burgundy'),
(38,8,N'InitialStock',N'INIT-038',N'Tồn đầu kỳ iPhone 18 Pro 512GB Đen'),
(39,6,N'InitialStock',N'INIT-039',N'Tồn đầu kỳ iPhone 18 Pro 512GB Bạc'),
(40,6,N'InitialStock',N'INIT-040',N'Tồn đầu kỳ iPhone 18 Pro 512GB Băng Thanh'),
(41,5,N'InitialStock',N'INIT-041',N'Tồn đầu kỳ iPhone 18 Pro 1TB Đỏ Burgundy'),
(42,5,N'InitialStock',N'INIT-042',N'Tồn đầu kỳ iPhone 18 Pro 1TB Đen'),
(43,4,N'InitialStock',N'INIT-043',N'Tồn đầu kỳ iPhone 18 Pro 1TB Bạc'),
(44,4,N'InitialStock',N'INIT-044',N'Tồn đầu kỳ iPhone 18 Pro 1TB Băng Thanh'),
(45,3,N'InitialStock',N'INIT-045',N'Tồn đầu kỳ iPhone 18 Pro 2TB Đỏ Burgundy'),
(46,3,N'InitialStock',N'INIT-046',N'Tồn đầu kỳ iPhone 18 Pro 2TB Đen'),
(47,2,N'InitialStock',N'INIT-047',N'Tồn đầu kỳ iPhone 18 Pro 2TB Bạc'),
(48,2,N'InitialStock',N'INIT-048',N'Tồn đầu kỳ iPhone 18 Pro 2TB Băng Thanh'),
(49,10,N'InitialStock',N'INIT-049',N'Tồn đầu kỳ iPhone Air 256GB Vàng Nhạt'),
(50,10,N'InitialStock',N'INIT-050',N'Tồn đầu kỳ iPhone Air 256GB Đen Không Gian'),
(51,10,N'InitialStock',N'INIT-051',N'Tồn đầu kỳ iPhone Air 256GB Xanh Da Trời'),
(52,10,N'InitialStock',N'INIT-052',N'Tồn đầu kỳ iPhone Air 256GB Trắng Mây'),
(53,8,N'InitialStock',N'INIT-053',N'Tồn đầu kỳ iPhone Air 512GB Vàng Nhạt'),
(54,8,N'InitialStock',N'INIT-054',N'Tồn đầu kỳ iPhone Air 512GB Đen Không Gian'),
(55,8,N'InitialStock',N'INIT-055',N'Tồn đầu kỳ iPhone Air 512GB Xanh Da Trời'),
(56,8,N'InitialStock',N'INIT-056',N'Tồn đầu kỳ iPhone Air 512GB Trắng Mây'),
(57,5,N'InitialStock',N'INIT-057',N'Tồn đầu kỳ iPhone Air 1TB Vàng Nhạt'),
(58,5,N'InitialStock',N'INIT-058',N'Tồn đầu kỳ iPhone Air 1TB Đen Không Gian'),
(59,5,N'InitialStock',N'INIT-059',N'Tồn đầu kỳ iPhone Air 1TB Xanh Da Trời'),
(60,5,N'InitialStock',N'INIT-060',N'Tồn đầu kỳ iPhone Air 1TB Trắng Mây');
INSERT INTO Vouchers(Code,Description,DiscountType,DiscountValue,MinOrderValue,MaxDiscount,StartAt,EndAt,UsageLimit) VALUES
('WELCOME50',N'Giảm 50.000đ cho khách hàng mới','AMOUNT',50000,1000000,NULL,'2026-01-01','2027-01-01',1000),
('PHONE5',N'Giảm 5% tối đa 500.000đ','PERCENT',5,5000000,500000,'2026-01-01','2027-01-01',500),
('FLAGSHIP300',N'Giảm 300.000đ cho đơn flagship','AMOUNT',300000,10000000,NULL,'2026-01-01','2027-01-01',200),
('WEEKEND2',N'Giảm 2% cuối tuần','PERCENT',2,3000000,250000,'2026-01-01','2027-01-01',300),
('TRADEIN1M',N'Ưu đãi thu cũ đổi mới tối đa 1 triệu','AMOUNT',1000000,15000000,NULL,'2026-01-01','2027-01-01',100);
INSERT INTO VoucherUsages(VoucherID,UserID,OrderID) VALUES (1,1,NULL),(2,2,NULL),(3,3,NULL),(4,4,NULL),(5,1,NULL);
INSERT INTO VoucherProducts(VoucherID,ProductID) VALUES (1,1),(2,2),(3,3),(4,4),(5,5);
INSERT INTO Promotions(PromotionName,Description,StartAt,EndAt) VALUES
(N'Ngày hội flagship',N'Ưu đãi điện thoại cao cấp','2026-10-01','2026-11-01'),
(N'Tuần lễ Samsung',N'Quà tặng cho dòng Samsung','2026-10-01','2026-11-01'),
(N'Xiaomi tiết kiệm',N'Giảm giá mẫu Xiaomi','2026-10-01','2026-11-01'),
(N'OPPO chân dung đẹp',N'Ưu đãi dòng Reno','2026-10-01','2026-11-01'),
(N'Vivo đổi mới',N'Hỗ trợ khách thu cũ đổi mới','2026-10-01','2026-11-01');
INSERT INTO PromotionVouchers(PromotionID,VoucherID) VALUES (1,1),(2,2),(3,3),(4,4),(5,5);
INSERT INTO PromotionProducts(PromotionID,ProductID) VALUES (1,1),(2,2),(3,3),(4,4),(5,5);
INSERT INTO Gifts(GiftName,Description,GiftValue,QuantityOnHand) VALUES
(N'Ốp lưng điện thoại',N'Ốp lưng tương thích theo mẫu',150000,100),
(N'Củ sạc nhanh',N'Củ sạc USB-C',350000,60),
(N'Tai nghe không dây',N'Tai nghe quà tặng',590000,30),
(N'Phiếu mua hàng 200K',N'Phiếu mua hàng cho lần tiếp theo',200000,100),
(N'Bảo hành mở rộng',N'Gói bảo hành bổ sung',500000,50);
INSERT INTO ProductGifts(ProductID,GiftID,PromotionID) VALUES (1,1,1),(2,2,2),(3,3,3),(4,4,4),(5,5,5);
INSERT INTO Carts(UserID) VALUES (1),(2),(3),(4),(5);
INSERT INTO CartItems(CartID,VariantID,Quantity) VALUES (1,1,1),(2,2,1),(3,3,2),(4,4,1),(5,5,1);
INSERT INTO Orders(OrderCode,UserID,AddressID,Status,PaymentMethod,PaymentStatus,Subtotal,DiscountAmount,ShippingFee,TotalAmount,CustomerNote) VALUES
('TGDT-2026-0001',1,1,N'Pending',N'COD',N'Unpaid',31990000,50000,0,31940000,N'Giao giờ hành chính'),
('TGDT-2026-0002',2,2,N'Confirmed',N'BankTransfer',N'Paid',29490000,300000,0,29190000,NULL),
('TGDT-2026-0003',3,3,N'Shipping',N'COD',N'Unpaid',31980000,0,30000,32010000,NULL),
('TGDT-2026-0004',4,4,N'Completed',N'COD',N'Paid',18790000,100000,0,18690000,NULL),
('TGDT-2026-0005',1,1,N'Cancelled',N'COD',N'Unpaid',35990000,0,0,35990000,N'Khách đổi ý');
INSERT INTO OrderItems(OrderID,VariantID,ProductNameSnapshot,SKU_Snapshot,UnitPrice,Quantity) VALUES
(1,1,N'iPhone 17 Pro 256GB','APL-IP17P-256-BLK',31990000,1),
(2,2,N'Samsung Galaxy S26 Ultra 256GB','SAM-S26U-256-BLU',29490000,1),
(3,3,N'Xiaomi 17T 5G 256GB Đen','XIA-17T-256-BLK',15990000,2),
(4,4,N'OPPO Reno16 Pro 5G 256GB Đen','OPP-R16P-256-BLK',23190000,1),
(5,5,N'Vivo X300 Ultra','VIV-X300-512-GRN',35990000,1);
INSERT INTO OrderVoucherUses(OrderID,VoucherID,DiscountAmount) VALUES (1,1,50000),(2,3,300000),(3,2,0),(4,4,100000),(5,5,0);
INSERT INTO OrderGiftItems(OrderID,GiftID,GiftNameSnapshot,Quantity) VALUES
(1,1,N'Ốp lưng điện thoại',1),(2,2,N'Củ sạc nhanh',1),(3,3,N'Tai nghe không dây',1),
(4,4,N'Phiếu mua hàng 200K',1),(5,5,N'Bảo hành mở rộng',1);
INSERT INTO TradeInRequests(UserID,OrderID,OldBrand,OldModel,OldStorage,ConditionDescription,EstimatedValue,FinalValue,Status) VALUES
(1,1,N'Apple',N'iPhone 13',N'128GB',N'Máy hoạt động bình thường, xước nhẹ',3500000,3200000,N'Approved'),
(2,2,N'Samsung',N'Galaxy S22',N'256GB',N'Màn hình tốt, pin còn tốt',2500000,NULL,N'Assessing'),
(3,3,N'Xiaomi',N'12T',N'256GB',N'Có hộp, ngoại hình khá',1800000,NULL,N'Received'),
(4,4,N'OPPO',N'Reno8',N'128GB',N'Hoạt động bình thường',1200000,1000000,N'Completed'),
(1,5,N'Apple',N'iPhone 12',N'64GB',N'Máy cũ có vết xước',1500000,NULL,N'Rejected');
INSERT INTO OrderTradeIns(OrderID,TradeInID,AppliedValue) VALUES (1,1,3200000),(2,2,0),(3,3,0),(4,4,1000000),(5,5,0);
INSERT INTO OrderStatusHistory(OrderID,OldStatus,NewStatus,ChangedByUserID,Note) VALUES
(1,NULL,N'Pending',5,N'Khách vừa đặt hàng'),(2,N'Pending',N'Confirmed',5,N'Đã xác nhận'),
(3,N'Confirmed',N'Shipping',4,N'Đã bàn giao vận chuyển'),(4,N'Shipping',N'Completed',5,N'Giao thành công'),
(5,N'Pending',N'Cancelled',5,N'Khách yêu cầu hủy');
INSERT INTO Reviews(UserID,ProductID,OrderID,Rating,ReviewText,IsApproved) VALUES
(1,1,1,5,N'Máy đẹp, dùng mượt.',1),(2,2,2,5,N'Màn hình đẹp.',1),(3,3,3,4,N'Hiệu năng tốt trong tầm giá.',1),
(4,4,4,5,N'Chụp ảnh đẹp.',1),(1,5,5,4,N'Thiết kế nổi bật.',0);
GO

/* Useful product listing query */
SELECT p.ProductName, b.BrandName, v.StorageGB, v.RAMGB, v.ColorName,
       v.ListPrice, v.SalePrice, i.QuantityOnHand
FROM Products p
JOIN Brands b ON b.BrandID=p.BrandID
JOIN ProductVariants v ON v.ProductID=p.ProductID
LEFT JOIN Inventory i ON i.VariantID=v.VariantID
WHERE p.IsActive=1 AND v.IsActive=1
ORDER BY p.IsFeatured DESC, p.ProductName;
GO
