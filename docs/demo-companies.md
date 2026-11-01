# Demo store — companies, catalogs, rules

Store giả lập nhà phân phối vật tư nha khoa (preset "Clinic"). Dùng `docs/demo-catalog.csv` (79 sản phẩm · 314 SKU · 8 collection) rồi dựng B2B như sau trong Shopify admin → Customers → Companies.

## Bảng giá (non-Plus: qua B2B markets)
Trên Grow (non-Plus) không gán catalog thẳng vào company location. Mỗi tier = 1 B2B market (điều kiện = company locations) → 1 catalog → 1 price list. Tối đa 3 catalog B2B active. Retail là giá gốc.

| Catalog | Giá | Dùng cho |
|---|---|---|
| Retail (default) | giá niêm yết trong CSV | khách lẻ |
| Trade Tier 1 | −12% toàn bộ | company nhỏ |
| Trade Tier 2 | −20% toàn bộ, + volume pricing: 48+ −5%, 120+ −10% (áp cho consumables) | company vừa |
| Key Account | −28%, volume 24+ −5%, 96+ −12%; quantity rule min 12, increment 12 cho gloves/masks | company lớn |

## Companies
| Company | Location | Catalog | Payment terms | Checkout | Ghi chú |
|---|---|---|---|---|---|
| Hải Đăng Dental Supply | HCM District 1 · HCM Thủ Đức | Key Account | Net 30 | Submit for review (checkout-to-draft) | 2 location → test switcher |
| Nha khoa Sài Gòn Smile | Quận 3 | Trade Tier 2 | Net 15 | Pay now | 1 location |
| Bright Clinic Group | Hà Nội | Trade Tier 1 | Due on fulfillment | Pay now | tax exempt để test nhãn VAT |

Mỗi company một buyer, login OTP về email Leo: `leo+haidang@` (Key Account, 2 location) · `leo+sgsmile@` (Tier 2) · `leo+bright@` (Tier 1). Mỗi location có metafield `depot.payment_terms` + `depot.review_orders` (xem `docs/b2b-setup.md`).

## Retail test
- Khách chưa login: với `price_visibility = logged_in` phải thấy "Log in to see prices" và link trade account.
- Khách lẻ login (không company): thấy giá Retail, không thấy dải B2B.

## Tồn kho để test
Trong CSV: ~5% sản phẩm `inventory = 0`, ~10% ở mức 3–15 (low stock), còn lại 50–2.000. Policy `deny` để quantity input chặn theo tồn.

## Page
Tạo page "Trade account" với template `page.trade-account`, link vào Theme settings → B2B → Trade application page. Menu: Consumables · Instruments · Equipment · Brands · Trade.
