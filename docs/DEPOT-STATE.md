# DEPOT-STATE — cập nhật cuối mỗi phiên

**Cập nhật:** 02/11/2026 · **Version hiện tại:** 0.1.2 · **WP đang làm:** WP0 Setup → WP1

## Repo
- GitHub `luma-ecom/depot-theme` (private) tạo 02/11, đủ 65 file theme + docs, 10 commit (upload qua web nên lịch sử khác bản zip; GitHub là nguồn chuẩn, bỏ zip).
- Folder Mac đúng: `LUMA-E AI First Company/06-Products/Depot/` (không dùng `Solo + AI Company`).
- 0.1.2: URL repo đã đổi sang `luma-ecom`.

## Dev store
- `depot-demo.myshopify.com` — org LUMA-E.COM, plan test **Grow** (non-Plus → đúng giới hạn 3 catalog), currency đổi sang **USD** trước khi import.
- Đã import `docs/demo-catalog.csv`: 79 sản phẩm · 314 SKU · tồn kho theo CSV. Chưa gán collection thủ công (CSV có cột Collection → kiểm tra lại trong admin).
- Customer accounts: bản mới (shopify.com/…/account) đang bật — bắt buộc cho B2B companies.
- Theme: GitHub `main` đã nối vào store → draft theme **depot-theme/main** (id 191852413001). Push `main` = tự cập nhật. Render lần đầu OK (xem Lỗi mở).
- B2B data (02/11, qua GraphQL): 3 company / 4 location (Hải Đăng ×2 Net 30 + draft review; Sài Gòn Smile Net 15; Bright Clinic due-on-fulfillment, tax exempt). 3 B2B market (Key Account / Tier 2 / Tier 1) → 3 catalog → 3 price list −28/−20/−12%. Volume pricing trên 21 SKU gloves+masks: KA 24+ −5%, 96+ −12%; T2 48+ −5%, 120+ −10%. Quantity rule KA: min 12, bước 12.
- **Phát hiện plan**: trên non-Plus KHÔNG gán catalog thẳng vào company location (`Catalogs assigned to company locations can't be set to active with your plan`); phải đi qua **B2B markets** (điều kiện = company locations), tối đa 3 catalog B2B active. Trang Products → Catalogs không có trên store này. Theme không phụ thuộc cách gán, nhưng docs/spec/landing phải nói đúng: "3 bảng giá B2B qua markets" chứ không phải "catalog theo company".

## Xong
- 0.1.0: nền theme code gốc, 72 file, theme check 0 lỗi (xem CHANGELOG).
- 0.1.1: CLAUDE.md, docs/, scripts tạo demo catalog + hướng dẫn company.
- Spec v1.1, Design Direction v1.0, Plan v1.0 (Excel), aicrm product #5 + OKR #10.
- Toàn bộ file dự án đã chép về Mac: `Documents/Claude/Projects/Solo + AI Company/Depot/`.

## Chưa chạy trên store thật
Toàn bộ 0.1.x chưa render trên dev store. Mọi "Xong" trong Backlog là code có, chưa nghiệm thu.

## Lưu ý kỹ thuật phát hiện khi setup
- Store dùng **new customer accounts** → các template `customers/*` của theme (login/register/account/order/addresses) **không được dùng**; trang tài khoản do Shopify host. Cần quyết định ở WP1: giữ template cho store classic hay bỏ, và chuyển "reorder / PO column / location switcher" sang nơi theme còn kiểm soát (header, cart, PDP).
- Form đăng ký trade account (`wholesale-register`) vẫn hợp lệ vì nằm trên page của theme.

## Lỗi mở
- [đã sửa 0.1.2] @font-face in ra text đầu trang — `font_face` nằm ngoài `<style>`.
- Featured collection trên home chưa chọn collection (placeholder "Product") — set trong editor hoặc preset.
- Buyer demo chưa có mật khẩu/đăng nhập: new customer accounts dùng mã OTP qua email → email `*@depot-demo.test` không nhận được. Cần đổi email buyer sang email thật của Leo (alias +haidang, +sgsmile, +bright) để test login.

## Việc kế tiếp
1. Đổi email 3 buyer sang alias email thật (Leo) để login được bằng OTP.
2. WP1: soi 5 màn desktop+mobile trong editor/preview (header+B2B bar, PDP, collection, cart, account), ghi lỗi vào đây, sửa → 0.2.0.
3. Sửa spec/README/landing: pricing non-Plus qua B2B markets (3 catalog).

## Quyết định cần Leo
- Tên theme (tạm Depot).
- Order form toàn catalog + CSV: FREE hay PREMIUM (spec để premium; đề nghị FREE để làm cửa vào).
- Template `customers/*`: giữ hay bỏ (xem Lưu ý kỹ thuật).
