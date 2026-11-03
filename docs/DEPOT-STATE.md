# DEPOT-STATE — cập nhật cuối mỗi phiên

**Cập nhật:** 03/11/2026 (phiên WP4) · **Version hiện tại:** 0.4.0 · **WP:** WP3 + WP4 xong, đã soi cả khách lẻ lẫn B2B; kế tiếp WP6 chuẩn bị public beta

## Repo
- GitHub `luma-ecom/depot-theme` (private, `main`) là nguồn chuẩn. Store `depot-theme/main` (id 191852413001) tự sync từ main (~10–20 giây; asset JS có lúc trễ hơn, reload lại là có).
- Shopify commit ngược về GitHub mỗi lần sửa trên store; JSON Shopify ghi lại có header comment "auto-generated" — bình thường.
- Cách đẩy code từ Cowork (WP2 12 lần, WP3 9 lần, WP4 13 lần): **Chrome "Browser 1"** (GitHub đăng nhập `luma-ecom`). Trang `github.com/luma-ecom/depot-theme/upload/main/<folder>` + JS inject File bằng DataTransfer → kiểm tên file hiện trong trang → click "Commit changes" bằng JS.
  - File mới lớn: trong cloud nén gzip+base64 một bundle JSON {path: nội dung} → dán vào JS → `DecompressionStream('gzip')` → so SHA-256 với bản cloud → upload. Sửa file đã có: tạo patch [old,new] bằng difflib trong cloud, áp trên raw hiện tại (đếm đúng 1 lần), so SHA-256.
  - JSON locale / header-group: fetch raw → bỏ header comment → JSON.parse → sửa → stringify 2 space.
  - Output của javascript_tool bị cắt ~1.000 ký tự và chặn chuỗi giống query string → đọc file dài bằng cách ghi vào `<pre>` rồi `get_page_text`.
- Theme check: `@shopify/theme-check-node` (`themeCheckRun`) trên bản mini trong cloud (file mới + locale tối thiểu + stub snippet). Test JS bằng jsdom với fetch giả (catalog 520 SKU).
- Bản local trên Mac: `02-releases/depot-theme-0.1.1-local-snapshot/` (nội dung = 0.2.0).

## Dev store
- `depot-demo.myshopify.com` — plan test Grow (non-Plus), USD, new customer accounts, 79 sản phẩm / 314 SKU (310 SKU khác nhau: 4 SKU trùng trong data demo), chưa có ảnh. Storefront có mật khẩu → soi bằng Preview từ admin (Themes → ⋯ → Preview), chị không nhập mật khẩu storefront.
- **Depot là theme live** trên depot-demo từ 03/11 (Horizon còn lại làm draft, bấm Publish là quay lại được). Page **Quick order** (`/pages/quick-order`) đã gán template `page.order-form`; link "Quick order" trên thanh B2B trỏ `/pages/quick-order`. Storefront vẫn có mật khẩu.
- 3 company / 4 location; 3 B2B market → 3 catalog → price list −28/−20/−12%; volume pricing 21 SKU gloves+masks; quantity rule KA min 12 / bước 12; metafield `depot.payment_terms` + `depot.review_orders`.
- Buyer demo (OTP về email Leo): `leo+haidang@` (KA, 2 location) · `leo+sgsmile@` (T2) · `leo+bright@` (T1).
- Giỏ khách lẻ trong phiên preview: đã dọn sạch sau test WP4.
- Shopify connector của Cowork đang cần đăng nhập lại (lỗi auth 03/11) — phiên này làm qua admin trên Chrome.

## Xong
- 0.1.0–0.3.0: xem CHANGELOG (nền theme, WP1–WP2 sửa lỗi + khoá design v1.1, WP3 quick order list).
- **0.4.0 (WP4, 03/11)** — Quick order form toàn catalog (B14 + B15, FREE):
  - Section mới `order-form` + template `page.order-form`; endpoint `order-form-data` (Section Rendering, 100 sản phẩm/trang) trả giá theo account, bậc giá, quantity rule, tồn kho. JS riêng `assets/order-form.js`, chỉ tải trên trang này.
  - Tìm theo SKU (đúng → bắt đầu bằng → chứa) rồi theo tên; phím ↑↓ Enter chọn, Enter ở ô số lượng quay lại ô tìm.
  - Dán "SKU, qty": dấu phẩy / chấm phẩy / tab Excel / dấu cách; header tuỳ chọn (cột sku/qty/quantity ở vị trí nào cũng được); CSV có ngoặc kép; SKU có dấu cách; SKU trùng cộng dồn; thiếu số lượng = min. SKU không có liệt kê tên. Có link tải CSV mẫu.
  - Mỗi dòng ép vào min / bước / max / tồn, tính cả số đã có trong giỏ (cùng luật quick order list). Dòng hết hàng giữ trong danh sách, xám, không bao giờ gửi vào giỏ.
  - Trước khi thêm: đọc lại tồn + giỏ cho các trang catalog liên quan; có thay đổi → chỉnh + báo tại dòng, không thêm gì. Thêm theo nhóm 100; 422 → giữ phần đã vào, chia đôi phần còn lại tới khi cô lập dòng lỗi, báo câu của Shopify tại dòng.
  - Danh sách lưu trong localStorage (reload không mất).
  - Header: setting mới "Quick order page" → B2B buyer thấy link "Quick order" trên thanh trên. Demo trỏ `/pages/quick-order`.
  - Setting section: heading, text, B2B (mặc định) / mọi người, collection nguồn (mặc định tất cả), ô dán, CSV, mở panel sẵn. Ẩn giá theo `price.liquid`. Nhận app block.
  - Mobile <750px: mỗi dòng 3 hàng (tên · xoá / SKU · tồn / giá · số lượng · tổng); panel dán/CSV đóng sẵn.
  - README + CHANGELOG + version 0.4.0.

## Nghiệm thu WP4 (DoD: 500 SKU không lag; dòng hết hàng không vào cart; tổng tiền theo giá account)
- Soi 03/11 bằng khách lẻ (tạm bật "mọi người" rồi trả về B2B):
  - Tải catalog 314 SKU: 1 request, ~0,25 giây. Dán 310 dòng: render 18 ms; 20 lần gõ số lượng trên bảng 310 dòng: 3 ms. jsdom 520 SKU / 500 dòng: OK. → 500 SKU không lag.
  - Dán 6 dòng (header, tab, phẩy, chấm phẩy, SKU lạ, thiếu số lượng): 5 vào, "1 not found: NOT-A-SKU"; MSK-HAL-BLACK (tồn 10) gõ 50 → 10 "10 available"; Autoclave hết hàng → xám.
  - Giả lập tồn đổi (500 > tồn thật 394) → "Stock changed: 394…", không thêm gì. Bấm lại → drawer "Cart (5)", dòng hết hàng ở lại, không vào giỏ.
  - Sau khi thêm, MSK-HAL-BLACK (10 trong giỏ = hết tồn) → "All available stock is in your cart".
  - CSV header "Item SKU","Quantity" có ngoặc kép + cột thừa: OK. SKU có dấu cách "CBR-SS -#245-053 4": OK.
  - Desktop + mobile (giả lập 390px bằng cách áp rule media trong trang) — không tràn ngang, không đè chữ.
  - Theme check 0 lỗi (bản mini). Regression nhanh: PDP, collection, cart drawer bình thường.
- **Soi B2B 03/11 (Hải Đăng, location HCM Thủ Đức, Browser 2):** thanh B2B có link Quick order + tên company + location; giá −28% đúng (MSK 3,04 → 2,19); dán 5 dòng: 5 → 12 "Minimum 12", 30 → 36 "multiples of 12" + Tier 24+, MSK-BLACK tồn 10 < min 12 → chặn "Only 10 available, below the minimum of 12", găng XS đã có 12 trong giỏ + 12 → Tier 24+ $4.37. Thêm vào giỏ: đơn giá trong giỏ khớp 100% với form (211/219/437/1187). Ghi chú checkout-to-draft hiện đúng. WP3 quick order list trên PDP găng Medicom: giá sỉ, Tier 24+, min 12/bước 12, "N in your cart" đúng. Giỏ Hải Đăng đã trả về XS×12 + M×12.

## Lỗi mở / chưa soi
- Company Tier 1 / Tier 2 chưa login thử.
- Browser: Hải Đăng đăng nhập trên **Browser 2** (Leo chọn 03/11) → soi B2B ở Browser 2; GitHub + admin vẫn làm trên Browser 1.
- Account (QA009–010): Shopify host, chỉ soi được trên store classic accounts.
- Demo chưa có ảnh sản phẩm → cần trước WP6.
- Data demo có 4 SKU trùng → order form lấy biến thể đầu tiên; nên sửa data trước WP6.
- Edge: rule min > bậc giá đầu → dòng đầu bảng tier PDP có thể ra "30–23" — hiếm.
- App embed BSS/SparkLayer (F34) và Markets đa tiền tệ (F35) chưa test.
- Catalog >25.000 sản phẩm: pagination Shopify có giới hạn; order form chưa test ở cỡ đó (mục tiêu đang là 5.000 SKU).
- Chrome "Browser 2" (profile oroca-leo): GitHub đang ở `luma-ecom` — Leo đổi lại `oroca-leo` nếu cần.

## GTM1 (02/11)
- G01 Keyword Planner (US): "shopify b2b/wholesale theme", "quick order form", "b2b portal shopify" = 10–100/tháng; "shopify b2b" 1K–10K; CPC $6–18. Merchant tìm app, không tìm theme → traffic từ Community/Reddit/LinkedIn/Upwork.
- Landing `luma-e.com/depot` (A free / B $89 reserve, nút ERP): **PR luma-e-v2 #50**, branch `feat/depot-landing`. Deploy tay (`npm run deploy`, Cloudflare).
- Kit: `01-docs/Depot-GTM1-Kit-v1.0.html`. Preview landing: `01-docs/Depot-Landing-Preview-v1.0.html`.
- **Leo chốt 03/11: GIỮ kit phân phối** tới khi sản phẩm chỉnh chu (WP6).
- **Leo chốt 03/11 (sau): BỎ A/B và ads $150.** Landing còn 1 bản + nút ERP; traffic chỉ từ kênh free (Leo sẽ nghĩ cách làm). Lý do: CPC $6–18 → $150 chỉ ~10–25 click, không đủ đọc số. OKR #10 bỏ KR6 (người trả $89).

## Việc kế tiếp
1. WP6 chuẩn bị public beta: ảnh demo, sửa 4 SKU trùng, README/docs/LICENSE, test 1 app embed, Lighthouse.
2. Landing PR luma-e-v2 #50: gộp về 1 bản (bỏ biến thể A/B), giữ nút ERP + đo click; deploy khi WP6 chỉnh chu. Kênh free: chờ Leo.
3. WP5 (premium) làm sau WP6, không chờ số; ưu tiên preset y tế–nha khoa + RFQ.
4. Sửa spec v1.1 → v1.2 theo phát hiện non-Plus.

## Quyết định đã chốt
- 02/11: ẩn compare-at với B2B (mặc định bật); giữ `customers/*`.
- 02/11 (WP2): PO + notes chỉ hiện với B2B; badge giỏ đếm số dòng.
- 02/11: Order form toàn catalog + dán SKU/CSV (B14, B15) là **FREE**.
- 03/11: Giữ phân phối (kit Khuê, ads) tới khi sản phẩm chỉnh chu.
- 03/11 (WP3): Quick order list mặc định chỉ hiện cho B2B, ẩn với sản phẩm 1 biến thể. Dùng Chrome "Browser 1".
- 03/11: Bỏ A/B + ads $150; landing 1 bản + nút ERP; chỉ kênh free. WP5 làm sau WP6, không gate bằng số A/B (thay quyết định 31/10 "premium chỉ khi A/B ≥10 pre-order").
- 03/11: Publish Depot làm theme live trên depot-demo.
- 03/11 (WP4): Order form mặc định chỉ cho B2B (giống quick order list); ô số lượng của form là input thường dựng bằng JS (bảng 500 dòng dựng phía client) nhưng áp đúng luật của `depot-quantity`; JS tách file riêng, không nhồi vào theme.js.

## Quyết định cần Leo
- Tên theme (tạm Depot).
