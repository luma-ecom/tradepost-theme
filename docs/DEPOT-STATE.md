# DEPOT-STATE — cập nhật cuối mỗi phiên

**Cập nhật:** 02/11/2026 (đêm) · **Version hiện tại:** 0.2.0 · **WP:** WP2 xong → WP3 + WP4 (tuần 2)

## Repo
- GitHub `luma-ecom/depot-theme` (private, `main`) là nguồn chuẩn. Store `depot-theme/main` (id 191852413001) = repo (checksum khớp 02/11 đêm).
- Shopify commit ngược về GitHub mỗi lần sửa trên store; JSON Shopify ghi lại có header comment `/* auto-generated */` — bình thường.
- Cách đẩy code từ Cowork (đã chạy 12 lần trong WP2, ổn): trang `github.com/luma-ecom/depot-theme/upload/main/<folder>` + JS: fetch bản raw hiện tại → áp patch theo dòng → kiểm SHA-256 trước/sau → inject File bằng DataTransfer → commit. Chỉ diff đi qua chat, không chép cả file. Không xoá được file qua upload: dùng `github.com/.../delete/main/<path>`.
- Bản local trên Mac: `02-releases/depot-theme-0.1.1-local-snapshot/` (tên cũ, nội dung = 0.2.0).

## Dev store
- `depot-demo.myshopify.com` — plan test Grow (non-Plus), USD, new customer accounts, 79 sản phẩm / 314 SKU, chưa có ảnh.
- 3 company / 4 location; 3 B2B market → 3 catalog → price list −28/−20/−12%; volume pricing 21 SKU gloves+masks; quantity rule KA min 12 / bước 12; metafield `depot.payment_terms` + `depot.review_orders` trên 4 location.
- Buyer demo (OTP về email Leo): `leo+haidang@` (KA, 2 location) · `leo+sgsmile@` (T2) · `leo+bright@` (T1). Chrome của Leo đang giữ phiên Hải Đăng.

## Xong
- 0.1.0–0.1.5: nền theme, WP1 soi + 10 P1 (xem CHANGELOG).
- **0.2.0 (WP2, 02/11)**: PO + notes chỉ B2B (setting mới, mặc định bật) · dòng giỏ hiện bậc giá kế tiếp ("Add 12 more for $4.37/ea") · lỗi 422 hiện tại dòng bằng câu của Shopify · badge đếm số dòng, "Cart (2)" · predictive search hiện đúng SKU/biến thể khớp + link tới biến thể · placeholder ảnh = icon (card + PDP) · list view "Choose options →" dạng link · mobile Filter + Sort cùng hàng · trade form bỏ card xám · PDP tô bậc giá đang áp (đổi qty/biến thể) + bảng bắt đầu từ min rule (12–23) · design v1.1: tabular numerals, SKU mono · xoá `zz-debug` · docs `docs/b2b-setup.md` (markets non-Plus, 2 metafield), README, demo-companies.
- Design Direction v1.1 (khoá): `01-docs/Depot-Design-Direction-v1.1.html`.

## Nghiệm thu WP2 (checklist mục 5 spec, trên depot-demo)
- Ẩn giá bằng 1 setting: có (`price_visibility`), đã chạy 0.1.x. Không soi lại khách chưa login trong WP2 (giữ phiên B2B).
- Compare-at không 0.00, không hiện khi bằng giá: code `compare > price`; B2B ẩn bằng setting 0.1.5.
- Quantity rules enforce: PDP + cart chặn min/bước; server 422 giờ báo tại dòng.
- Location switcher: header desktop + mobile, OK.
- Trade form: OK, buyer B2B thấy "Your trade account is active".
- Mobile 390px: collection grid/list, PDP, cart, trade page — không đè, bấm được.
- Theme check 0 lỗi.

## Lỗi mở / chưa soi
- Khách lẻ chưa login + khách lẻ login: chưa soi lại trên 0.2.0 (logout sẽ mất phiên OTP B2B). Logic PO/notes ẩn cho khách lẻ là 1 điều kiện `customer.b2b?`.
- Company Tier 1 / Tier 2 chưa login thử.
- Account (QA009–010): Shopify host, chỉ soi được trên store classic accounts.
- Demo chưa có ảnh sản phẩm (dữ liệu, không phải theme) → cần trước WP6 public beta.
- Edge: nếu rule min > bậc giá đầu thì dòng đầu bảng tier có thể ra "30–23" — hiếm, sửa khi gặp.
- App embed BSS/SparkLayer (F34) và Markets đa tiền tệ (F35) chưa test.

## Việc kế tiếp
1. Tuần 2: WP3 quick order list có tồn kho (0.3.0) + WP4 order form toàn catalog + dán SKU/CSV (0.4.0).
2. Trước WP6: ảnh demo, soi khách lẻ, test 1 app embed.
3. Sửa spec v1.1 → v1.2 theo phát hiện non-Plus (README/docs đã đúng).

## Quyết định đã chốt
- 02/11: ẩn compare-at với B2B (mặc định bật); giữ `customers/*`.
- 02/11 (WP2): PO + notes chỉ hiện với B2B (setting, mặc định bật); badge giỏ đếm số dòng.
- 02/11: Order form toàn catalog + dán SKU/CSV (B14, B15) là **FREE** — nằm trong lõi GitHub, làm cửa vào.

## Quyết định cần Leo
- Tên theme (tạm Depot).
