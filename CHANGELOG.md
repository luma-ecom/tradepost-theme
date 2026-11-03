# Changelog

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
