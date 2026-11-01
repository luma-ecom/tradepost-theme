# DEPOT-STATE — cập nhật cuối mỗi phiên

**Cập nhật:** 01/11/2026 · **Version hiện tại:** 0.1.1 · **WP đang làm:** WP0 Setup → WP1

## Dev store
- `depot-demo.myshopify.com` — org LUMA-E.COM, plan test **Grow** (non-Plus → đúng giới hạn 3 catalog), currency đổi sang **USD** trước khi import.
- Đã import `docs/demo-catalog.csv`: 79 sản phẩm · 314 SKU · tồn kho theo CSV. Chưa gán collection thủ công (CSV có cột Collection → kiểm tra lại trong admin).
- Customer accounts: bản mới (shopify.com/…/account) đang bật — bắt buộc cho B2B companies.
- Theme Depot **chưa upload**: dialog upload nằm trong iframe app nên không đẩy file từ phiên này được. File sạch để kéo thả: `Depot/depot-theme-0.1.1-upload.zip` (chỉ assets/config/layout/locales/sections/snippets/templates).
- Companies / catalogs / payment terms: **chưa tạo** (làm nhanh nhất qua Shopify connector + GraphQL sau khi Leo cấp lại quyền; làm tay trong admin ~60 thao tác).

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
(chưa có — điền sau WP1)

## Việc kế tiếp
1. Leo: kéo `depot-theme-0.1.1-upload.zip` vào Themes → Import; hoặc Claude Code trên Mac + `shopify theme push`.
2. Leo: cấp lại quyền Shopify connector cho `depot-demo` → chị tạo 4 catalog, 3 company, volume pricing, quantity rules, payment terms theo `docs/demo-companies.md` bằng GraphQL.
3. WP1: soi 5 màn desktop+mobile, ghi lỗi vào đây, sửa → 0.2.0.

## Quyết định cần Leo
- Tên theme (tạm Depot).
- Order form toàn catalog + CSV: FREE hay PREMIUM (spec để premium; đề nghị FREE để làm cửa vào).
- Template `customers/*`: giữ hay bỏ (xem Lưu ý kỹ thuật).
