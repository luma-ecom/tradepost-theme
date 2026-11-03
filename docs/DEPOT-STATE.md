# DEPOT-STATE — cập nhật cuối mỗi phiên

**Cập nhật:** 03/11/2026 (khuya) · **Version hiện tại:** 0.3.0 · **WP:** WP3 xong (soi khách lẻ) → còn soi B2B; kế tiếp WP4

## Repo
- GitHub `luma-ecom/depot-theme` (private, `main`) là nguồn chuẩn. Store `depot-theme/main` (id 191852413001) tự sync từ main (đã kiểm 03/11: section mới lên store trong ~10 giây).
- Shopify commit ngược về GitHub mỗi lần sửa trên store; JSON Shopify ghi lại có header comment "auto-generated" — bình thường.
- Cách đẩy code từ Cowork (chạy ổn, WP2 12 lần + WP3 9 lần): **Chrome "Browser 1"** (Leo chỉ định; GitHub đang đăng nhập `luma-ecom`). Trang `github.com/luma-ecom/depot-theme/upload/main/<folder>` + JS: fetch raw hiện tại → áp patch theo chuỗi (đếm đúng 1 lần) → giữ bản mới trong `localStorage` (không dùng sessionStorage: mất khi extension rớt) → inject File bằng DataTransfer → đợi file hiện trong danh sách → bấm Commit. Không xoá được file qua upload: dùng `github.com/.../delete/main/<path>`.
- Lưu ý: get_page_text gộp nhiều dấu cách thành một → khi so chuỗi patch phải lấy từ raw thật (JSON.stringify từng dòng), không lấy từ text đã đọc.
- Theme check: chạy được trong cloud bằng `@shopify/theme-check-node` (`themeCheckRun`) trên bản mini (file mới + locale + snippet liên quan). gh CLI trong cloud không có token → không clone repo được.
- Bản local trên Mac: `02-releases/depot-theme-0.1.1-local-snapshot/` (nội dung = 0.2.0, chưa có 0.3.0).

## Dev store
- `depot-demo.myshopify.com` — plan test Grow (non-Plus), USD, new customer accounts, 79 sản phẩm / 314 SKU, chưa có ảnh. Storefront có mật khẩu.
- 3 company / 4 location; 3 B2B market → 3 catalog → price list −28/−20/−12%; volume pricing 21 SKU gloves+masks; quantity rule KA min 12 / bước 12; metafield `depot.payment_terms` + `depot.review_orders` trên 4 location.
- Buyer demo (OTP về email Leo): `leo+haidang@` (KA, 2 location) · `leo+sgsmile@` (T2) · `leo+bright@` (T1). Chị không đăng nhập thay (nhập mã OTP = việc Leo tự làm).
- Giỏ khách lẻ trên Browser 1: XS×12 + M×12 găng Medicom (có từ trước, đã trả về đúng sau khi test).

## Xong
- 0.1.0–0.1.5: nền theme, WP1 soi + 10 P1 (xem CHANGELOG).
- 0.2.0 (WP2, 02/11): xem CHANGELOG.
- **0.3.0 (WP3, 03/11)** — Quick order list (B10):
  - Section mới `quick-order-list` trên template product, dưới main. Bảng mọi biến thể: biến thể · SKU · tồn kho · đơn giá · số lượng · thành tiền; 1 nút "Add to cart" cho tất cả, đếm dòng + subtotal.
  - Tồn kho: "N in stock" / "Only N left" / "Out of stock" / "On backorder". Ô số lượng chặn ở (tồn − đã có trong giỏ); hết chỗ thì hiện "All available stock is in your cart".
  - Kiểm tồn lại trên server ngay trước khi thêm; tồn đổi → chỉnh số + báo tại dòng, không thêm gì cho tới khi buyer bấm lại. Shopify vẫn từ chối (422) → tìm dòng nào chưa vào, thử từng dòng, báo câu của Shopify tại dòng.
  - Quantity rule + bậc giá tính cả số đã có trong giỏ (min hàng giảm khi giỏ đã đủ min; đơn giá hiện bậc sẽ áp "Tier 120+").
  - Setting: heading, text, hiện cho B2B (mặc định) / mọi người, ẩn với sản phẩm 1 biến thể (mặc định bật), ảnh biến thể. Ẩn giá theo `price.liquid`. Nhận app block.
  - `quantity-input` có thêm tham số tuỳ chọn `allow_zero`, `min_qty`, `max_qty`, `available` (chỗ dùng cũ không đổi).
  - Mobile <750px: mỗi biến thể 3 dòng (biến thể · giá / SKU · tồn / số lượng · tổng).

## Nghiệm thu WP3 (DoD: không thêm được vượt tồn; báo tại dòng; app embed không vỡ)
- Soi 03/11 bằng khách lẻ trên găng Medicom (5 size), tạm bật section cho mọi khách rồi trả về B2B:
  - Gõ 200 ở size S (tồn 168) → tự về 168, gợi ý "168 available" tại ô. OK.
  - Giả lập tồn đổi (client tưởng 500, gõ 300) → bấm Add: chỉnh về 168, dòng đỏ "Stock changed: 168 can be added now", không thêm gì vào giỏ. OK.
  - Thêm 3 dòng (XS 1, S 5, XL 10) → 1 request, drawer mở "Cart (4)", bảng reset về 0, "13 in your cart"/tồn khả dụng cập nhật. OK.
  - Desktop + mobile (giả lập 390px trong trang, vì cửa sổ Chrome không đổi cỡ được) — không đè, chữ đủ. OK.
  - Theme check 0 lỗi (bản mini). JS parse OK.
- **Chưa soi:** B2B thật (giá sỉ, bậc giá "Tier 120+", min 12/bước 12, min giảm khi giỏ đã có) — cần Leo đăng nhập buyer Hải Đăng trên Browser 1. Nhánh 422 thử-từng-dòng chưa kích được trên store (code đã review). App embed (F34) vẫn chưa test với app thật — section có nhận `@app` block.

## Lỗi mở / chưa soi
- WP3 soi B2B (như trên).
- Company Tier 1 / Tier 2 chưa login thử.
- Account (QA009–010): Shopify host, chỉ soi được trên store classic accounts.
- Demo chưa có ảnh sản phẩm → cần trước WP6 public beta (cột ảnh của quick order tự ẩn khi sản phẩm không có ảnh).
- Edge: nếu rule min > bậc giá đầu thì dòng đầu bảng tier PDP có thể ra "30–23" — hiếm, sửa khi gặp.
- App embed BSS/SparkLayer (F34) và Markets đa tiền tệ (F35) chưa test.
- Chrome thứ hai ("Browser 2", profile oroca-leo): trong lúc extension rớt, chị đã chuyển tài khoản GitHub ở đó sang `luma-ecom` (account switcher) — Leo đổi lại `oroca-leo` nếu cần.

## GTM1 (02/11)
- G01 Keyword Planner (US): mọi cụm "shopify b2b/wholesale theme", "quick order form", "b2b portal shopify" = 10–100/tháng; "shopify b2b" 1K–10K; "shopify b2b app" / "wholesale app" 100–1K; CPC $6–18. Merchant tìm app, không tìm theme. Traffic chính phải từ Community/Reddit/LinkedIn/Upwork.
- Landing `luma-e.com/depot` (A free / B $89 reserve, nút ERP chung): **PR luma-e-v2 #50**, branch `feat/depot-landing`. Deploy tay (`npm run deploy`, Cloudflare).
- Kit: `01-docs/Depot-GTM1-Kit-v1.0.html`. Preview landing: `01-docs/Depot-Landing-Preview-v1.0.html`.
- **Leo chốt 03/11: GIỮ kit phân phối + ads** tới khi sản phẩm chỉnh chu. Ngày đọc A/B = ngày bắt đầu phân phối + 14.

## Việc kế tiếp
1. Soi WP3 với B2B (Leo đăng nhập Hải Đăng trên Browser 1 → chị soi găng/khẩu trang có volume pricing: Tier hiện đúng, min 12/bước 12, min giảm khi giỏ đã có 12).
2. WP4: order form toàn catalog + dán "SKU, qty" + CSV (0.4.0) — FREE. Tái dùng `depot-quantity allow_zero` và cách kiểm tồn của WP3 (fetch section mới → cap → 1 request → 422 thì thử từng dòng).
3. Deploy PR luma-e-v2 #50 → kiểm /depot?v=a, ?v=b. KHÔNG đẩy kit/ads tới mốc "chỉnh chu".
4. Trước WP6: ảnh demo, soi khách lẻ, test 1 app embed.
5. Sửa spec v1.1 → v1.2 theo phát hiện non-Plus.

## Quyết định đã chốt
- 02/11: ẩn compare-at với B2B (mặc định bật); giữ `customers/*`.
- 02/11 (WP2): PO + notes chỉ hiện với B2B (setting, mặc định bật); badge giỏ đếm số dòng.
- 02/11: Order form toàn catalog + dán SKU/CSV (B14, B15) là **FREE**.
- 03/11: Giữ phân phối (kit Khuê, ads) tới khi sản phẩm chỉnh chu.
- 03/11 (WP3): Quick order list mặc định chỉ hiện cho B2B buyer, ẩn với sản phẩm 1 biến thể; cột tồn kho dùng setting có sẵn "Show stock levels in order lists". Dùng Chrome "Browser 1" cho GitHub/Shopify.

## Quyết định cần Leo
- Tên theme (tạm Depot).
