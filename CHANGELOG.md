# Changelog

## 1.0.0 — 2026-11-17
First stable release. No breaking changes from 1.0.0-beta; settings carry over. It gathers 1.0.0-rc.1 to rc.3 (below) plus the quality checks here.
- **Fresh install fixed.** The rc.3 zip carried the demo store's home page, which points at a video file only that store has; Shopify rejected the whole home template on any other store. Release zips are now built with `scripts/build-release.py`, which drops store-only file references. Checked on an empty development store: home, collection, product, cart, search, 404, blog, pages and the quick order page render with no Liquid errors and no sideways scroll, desktop and mobile. Minimum steps are in `docs/b2b-setup.md` → Fresh install.
- Header → Menu style now defaults to **Dropdown**. In rc.3 the default was Mega menu, which turns each top link with children into a button (no longer a link to its page): a store updating from the beta would get that change without choosing it. The theme's own header (`sections/header-group.json`), and so fresh installs and the demo store, keep Mega menu.
- **Speed:** the first two collection-list images near the top of the home page and the first four product cards on a collection page load right away instead of lazily. Collection page on mobile: LCP 5.3 s → 3.2 s.
- **Lighthouse** (home, collection, product; median of 3 runs; measured through `shopify theme dev` on the demo store, so performance is indicative, not a CDN number): performance mobile 90 / 82 / 91, desktop 99 / 94 / 100, average 92. Accessibility 95 / 98 / 99 on both, average 97. Layout shift 0.002 or less.
- **Large catalog:** quick order form with 1,259 products / 5,000 variants on the empty store: the full catalog loads in 3.7 s (13 requests of 100 products), page LCP 0.95 s, SKU search answers in about 1 ms, pasting 500 "SKU, qty" lines renders in 0.2 s (420 valid lines, 80 out of stock and left out). Adding the 420 lines to the cart took 30 s: that is Shopify's cart, called in groups of 100. `docs/make-large-catalog.py` generates the test catalog.
- **Markets:** with a second market (4 EU countries) the country selector shows in the header, mobile menu and footer. Not checked end to end: the test store's payment provider does not allow a second currency, and the local preview cannot post the country form. A second language was enabled but not attached to a market, so the language selector did not show.
- Country and language options no longer carry stray whitespace.

## 1.0.0-rc.3 — 2026-11-17
Standard Shopify features the theme was missing. No breaking changes from 1.0.0-rc.2; settings carry over.
- **Country and language selector** (`snippets/localization-form.liquid`, native localization form): in the header (desktop and mobile menu) and the footer, each with its own on/off settings. Country shows with its currency. Renders nothing when the store sells to one country in one language. Changes apply on select; a plain Update button stays for visitors without JavaScript. B2B buyers never see the country selector (their prices follow their company location; switching market could drop their catalog prices). They still get the language selector.
- **Mega menu** (Header → Menu style, default Mega menu; Dropdown keeps the old behaviour). Top links with children open a full-width panel: second-level links are columns, third-level links are listed under each. Opens on hover with a mouse, on click, and on Enter or Space; Esc closes and returns focus to the trigger; Tab moves through the panel and closes it on the way out; `aria-expanded` on each trigger. Each panel starts with an "All <menu item>" link, since the top item is now a button. Optional collection images per column (off by default).
- Mobile menu: second and third levels open as nested accordions, each with an "All <item>" link.
- **Pickup availability** on the product page (`snippets/pickup-availability.liquid`, Product section → Show pickup availability): "Pickup available at <location>, usually ready in …" under the buy buttons, and a list of every pickup location with its address. Re-rendered on variant change. Nothing shows unless a location offers local pickup. Also a Section Rendering endpoint, `sections/pickup-availability.liquid`, for quick views. Not yet tried with real pickup data: the demo store has no location with local pickup turned on.
- **Selling plans (subscriptions)**: when a product has selling plan groups, the product page shows One-time purchase / each plan group with a frequency select and sends `selling_plan` with the add to cart. The price follows the chosen plan (with per-delivery price for prepaid plans). Cart lines show the plan name. Hidden for B2B buyers (native B2B does not support subscriptions). Not yet tried with real data: the demo store has no subscription app; checked by code review and theme check only.
- Trade account application: new setting "Submit button label" (empty = "Submit application"). Demo store: "Request demo login".
- Docs: `docs/b2b-setup.md` explains why B2B buyers do not get a country selector.

## 1.0.0-rc.2 — 2026-11-17
Content sections, batch 2. No breaking changes from 1.0.0-rc.1; settings carry over.
- New section **Logo list** (`sections/logo-list.liquid`): heading, 3–6 logos per row, up to 24. Each logo: image, brand name (shown as text when there is no image), alt text, link. Logos in grey that turn to color on hover (can be turned off).
- New section **FAQ** (`sections/faq.liquid`): heading, intro text, up to 30 questions with rich-text answers. Built on `<details>`/`<summary>`: no JavaScript, opens and closes with Enter or Space. Adds `FAQPage` structured data (JSON-LD) by default. Default questions cover trade accounts, minimum order, shipping, net terms and delivery to several locations.
- New section **Contact form** (`sections/contact-form.liquid`): name, email, message, plus company, phone and account number (each can be turned off). Logged-in customers get name, email and company filled in. Email subject and layout (text beside the form, or narrow with text above to match page content) are settings. Success and error messages at the top of the form.
- New section **Newsletter** (`sections/newsletter.liquid`) and a **Newsletter** block in the footer, both using `snippets/newsletter-form.liquid`. Sign-ups become customers tagged `newsletter` with email marketing on.
- New template `page.contact` (page content + contact form).
- Footer: columns follow the number of blocks (up to 4).
- All four sections have the "Show to" setting (everyone / B2B buyers / retail visitors). Styles at the end of `assets/base.css`, one block per section.
- Demo store: home gains a brand list (names as text, no brand logos) and an FAQ at the end; Contact page uses the new template; footer has the newsletter block and a link to the Contact page.

## 1.0.0-rc.1 — 2026-11-17
Content sections, batch 1. No breaking changes from 1.0.0-beta; settings carry over.
- New section **Image banner** (`sections/image-banner.liquid`): main image plus an optional mobile image (below 750px), height small / medium / large / adapt to image, text left or centered, dark overlay 0–80%, light or dark text. Blocks: heading, text, buttons (up to 2, each with label, link and style). As the first section on the page the image loads with `fetchpriority="high"` and the heading is the page `h1`. With no image, the theme editor shows a placeholder and the live store shows the plain surface color with dark text.
- New section **Image with text** (`sections/image-with-text.liquid`): image left or right, ratio square / 4:3 / 16:9 / adapt, text aligned top / middle / bottom. Blocks: heading, text, button. Stacks on mobile with the image first.
- New section **Multicolumn** (`sections/multicolumn.liquid`): heading, 2–4 columns on desktop, up to 8 columns. Each column: image, title, text, link. Small icon or large image. On mobile: one column, or a sideways swipe row (CSS scroll-snap, no JavaScript). Default content is written for distributors (Net 30 terms, Order by SKU, Volume pricing, Dedicated rep).
- New section **Collection list** (`sections/collection-list.liquid`): heading, 2–5 columns, image ratio square / portrait / landscape, "View all" link, up to 12 collections. A collection with no image uses its first product's image. Product count can be turned off. Empty blocks show placeholders.
- All four have the "Show to" setting (everyone / B2B buyers / retail visitors), responsive images with `srcset` and fixed ratios (no layout shift), and styles at the end of `assets/base.css`, one block per section.
- Theme info: documentation and support links point to the renamed repo (`tradepost-theme`).
- Demo store home: image banner (text only, the demo has no wide photo yet), multicolumn with four B2B strengths, collection list of six categories. Retail visitors still see the trade CTA and the buyer tour video; B2B buyers skip both.

## 1.0.0-beta — 2026-11-04
WP6: public beta candidate. No breaking changes from 0.4.0; settings carry over.
- Product page: the main product image loads with `fetchpriority="high"` (faster LCP on first visit).
- Docs: new `docs/updating-and-rollback.md` (update as an unpublished theme, preview as a B2B buyer, publish; rollback = publish the previous version). `docs/b2b-setup.md` gains a section on the quick order form and quick order list. README: quick order page install step and an Updating section.
- Checked before tagging: 5 screens on desktop and mobile (390px) as a retail visitor and as a B2B buyer (Key Account, 2 locations); quick order list and quick order form with account prices, volume tiers, quantity rules and stock; cart prices match the form. CLS 0 on home, collection and product pages. An app embed (BSS B2B Wholesale Pricing, free plan) turned on: product page, cart drawer and collection keep working, no console errors.
- Demo store: product illustrations on all 79 demo products; duplicate demo SKUs fixed.

## 0.4.0 — 2026-11-03
WP4: quick order form for the whole catalog (backlog B14, B15). Free core.
- New section **Quick order form** (`sections/order-form.liquid`) and template `page.order-form`. Buyers find items by SKU or name, paste "SKU, qty" lines, or upload a CSV, then add every line to the cart with one button. Line count and subtotal at the bottom.
- Catalog loads in pages of 100 products from a Section Rendering endpoint (`sections/order-form-data.liquid`) with the buyer's own price (B2B catalog applied), volume tiers, quantity rules and stock. 310 SKUs load in about 0.25 s; a 500-line list renders and recalculates without lag (no per-keystroke re-render).
- Search: SKU first (exact, starts with, contains), then product and variant name; arrow keys + Enter pick a SKU, Enter in the quantity jumps back to search.
- Paste / CSV: comma, semicolon, tab (Excel) or space separated; header row optional (columns named sku / qty / quantity are found in any order); quoted CSV cells; SKUs with spaces; duplicate SKUs merged; no quantity means the minimum. Unknown SKUs are listed by name. "Download a CSV template".
- Every line is brought inside min / increment / max / stock, counting what is already in the cart (same rules as the quick order list). Out-of-stock lines stay in the list, greyed, and are never sent to the cart; a variant whose stock is all in the cart says so.
- Unit price shows the volume tier that will apply ("Tier 120+") counting the cart; subtotal is the buyer's account price.
- Right before adding, stock and the cart are read again for the affected catalog pages. If anything moved, lines are adjusted with the reason at the line and nothing is added until the buyer confirms. Lines are added in groups of 100; if Shopify refuses a group (422), the theme keeps what went in and splits the rest until each refused line shows Shopify's message.
- The list is kept in the browser (localStorage) so a page reload does not lose it.
- Settings: heading, text, show to B2B buyers only (default) or everyone, products from a collection (default: all the buyer can see), paste box, CSV upload, panel open by default. Price visibility follows `snippets/price.liquid`. Accepts app blocks. JS lives in `assets/order-form.js`, loaded only on this page.
- Header: new setting **Quick order page** — B2B buyers get a "Quick order" link in the top bar.
- Mobile (<750px): each line is a 3-row card (name · remove / SKU · stock / price · qty · total); the paste / CSV panel starts closed.

## 0.3.0 — 2026-11-03
WP3: quick order list with live stock (backlog B10).
- New section **Quick order list** (`sections/quick-order-list.liquid`), on the product template under the main product. One table for every variant: variant, SKU, stock, unit price, quantity, line total; one "Add to cart" for all lines, line count and subtotal at the bottom.
- Stock: column shows "N in stock" / "Only N left" (low-stock threshold) / "Out of stock" / "On backorder". Quantity is capped at stock minus what is already in the cart; a variant with no room left shows "All available stock is in your cart" instead of an input.
- Stock is checked again on the server right before adding. If it moved, the line is adjusted and the reason shows at the line; nothing is added until the buyer confirms.
- If Shopify still refuses (422), the theme works out which lines went in, retries the rest one by one and shows Shopify's message at each refused line.
- Quantity rules and volume pricing count what is already in the cart: the row minimum drops once the rule minimum is in the cart, and the unit price shows the tier that will apply ("Tier 120+").
- Settings: heading, text, show to B2B buyers only (default) or everyone, hide on single-variant products (default on), variant images. Uses the existing theme setting B2B › "Show stock levels in order lists". Price visibility follows `snippets/price.liquid` (gated visitors see the login / trade prompt, no table). Accepts app blocks.
- `depot-quantity` / `snippets/quantity-input.liquid`: new optional params `allow_zero`, `min_qty`, `max_qty`, `available` (existing uses unchanged).
- Mobile (<750px): each variant is a 3-line row (variant · price / SKU · stock / quantity · total).

## 0.2.0 — 2026-11-02
WP2: P2 fixes from the WP1 pass, design v1.1 locked.
- Cart: PO number and notes show to B2B buyers only by default (new setting Cart › "Show PO number and notes to B2B buyers only").
- Cart line shows the next volume tier ("Add 12 more for $4.10/ea") when the line has price breaks.
- Cart line shows Shopify's error at the line when a quantity change is refused (422) instead of failing silently.
- Cart count badge counts lines, not units (a B2B cart of 3 SKUs × 120 reads 3). Drawer title "Cart (3)". Badge hidden when empty.
- Predictive search: when the query matches a variant SKU, the result shows that SKU and variant and links to it.
- Product card without image: quiet image icon instead of underlined "No image" text.
- List view: "Choose options" is a text link, not a heavy button.
- Mobile collection: Filter button sits on the same row as Sort.
- Trade application form: no grey card; hairline top rule like the rest of the theme.
- Docs: `docs/b2b-setup.md` (B2B markets on non-Plus, 2 company-location metafields `depot.payment_terms` / `depot.review_orders`, settings). README and demo-companies updated.
- PDP: the volume tier that applies to the chosen quantity is highlighted (updates on quantity and variant change); the table starts at the quantity-rule minimum (12–23, not 1–23); empty gallery shows the same quiet image icon.
- Design v1.1 locked: tabular numerals for prices, tier tables, quantities and totals; SKUs in a mono stack (`--font-mono`), as set in Design Direction v1.0. Mobile list view and cart line media sized to their column.
- Removed temporary `sections/zz-debug.liquid`.

## 0.1.5 — 2026-11-02
- New setting B2B › "Hide compare-at price for B2B buyers" (`b2b_hide_compare_at`, on by default). B2B price lists make Shopify show the retail price as compare-at on every trade price.
- Kept `customers/*` templates for stores on classic customer accounts (decision 02/11).

## 0.1.4 — 2026-11-02
- WP1 B2B pass (buyer logged in on depot-demo).
- Volume pricing table and card tier hint now render: check `variant.quantity_price_breaks.size` (`quantity_price_breaks_configured?` returns nil in this context). Quantity rule line (min / multiples) shows even without tiers.
- Location switcher no longer shows "Translation missing" for the location name.
- Payment terms and submit-for-review messages read company-location metafields `depot.payment_terms` (text) and `depot.review_orders` (boolean). Liquid does not expose a location's payment terms or checkout-to-draft setting.
- Cart line under the B2B minimum (added before login) is corrected in the cart once, so the shown quantity matches the subtotal (waits for the cart controller; theme.js is deferred).

## 0.1.3 — 2026-11-02
- WP1 fixes from first run on depot-demo: PDP accordion title no longer shows "Translation missing"; search count no longer double-escapes quotes, singular/plural; product count singular/plural.
- Collection grid/list now uses an alternate template (`collection.list.json`, `?view=list`); the old query-param check never worked.
- Footer ships with default blocks (menu, trade, contact) instead of rendering empty.
- Mobile: header icons back on the first row; filters collapse behind a Filter button (section-level `{% stylesheet %}` / `{% javascript %}`).

## 0.1.2 — 2026-11-01
- Font-face declarations moved inside the `<style>` tag (synced from the store copy).

## 0.1.1 — 2026-11-01
- Repo: CLAUDE.md (rules for Claude Code), docs/DEPOT-STATE.md, docs/demo-companies.md, docs/make-demo-catalog.py + demo-catalog.csv (79 products · 314 SKU dental-supply demo). No theme code changes.

## 0.1.0 — 2026-10-30
- Foundation: layout, settings (B2B, colors, typography, layout, cart), all required templates, section groups.
- Group A: price snippet with gating, compare-at fix, unit label, lowest-tier hint; volume tiers table; quantity input with native rules + stock cap; variant picker with section re-render.
- Group C: location switcher; audience-targeted sections; trade application page; account page with terms, PO and reorder; login/register trade prompts.
- Cart: PO number, notes, net-terms / submit-for-review messaging, drawer and page.
- Original code only. No Dawn/Horizon/Skeleton files.
