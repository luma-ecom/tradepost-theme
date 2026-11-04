# Tradepost — instructions for Claude Code

Tradepost is an original Shopify theme for B2B distributors. It is LUMA-E's new-customer door: the free core on GitHub leads to paid services (ERP/accounting sync, >3 price lists, migrations). Read `README.md` and `CHANGELOG.md` before touching code.

## Hard rules
1. **Original code only.** Never open, copy, paraphrase or "take inspiration from" files of Shopify's Dawn, Horizon or Skeleton themes, or any Theme Store theme. Their licenses forbid redistribution of derived themes. Use only Shopify's Liquid/theme documentation.
2. **Native B2B first.** Build on company accounts, catalogs, quantity rules, volume pricing, net terms, quick order list, checkout-to-draft (all paid plans since Apr 2026). Apps are for >3 price lists only; never inject app-style code into theme files.
3. **Every release bumps the version** in `config/settings_schema.json` and adds a `CHANGELOG.md` entry. No silent changes.
4. **No breaking updates.** Changing a section's schema must keep existing settings valid. Never rename a setting id; deprecate and map.
5. **Visual QA before any version tag**: 5 screens (header+B2B bar, PDP, collection grid+list, cart, account) on desktop and mobile. Screenshot, compare, fix.
6. `shopify theme check` must pass with zero offenses before commit.

## Design direction (locked after WP2 as v1.1)
Quiet catalog, clear numbers, no decoration. Hairlines not cards; one accent color for primary button, active tier and B2B state; tabular numerals everywhere; SKU in mono; two densities (list for logged-in buyers, grid for retail); no hero carousel; states written as full sentences. Tokens live in `snippets/css-variables.liquid` and `assets/base.css`. Do not add new colors or fonts without updating tokens.

## Structure
- `layout/theme.liquid` — shell, section groups, `window.depot` runtime config.
- `sections/main-*.liquid` — page templates; `header`, `footer`, `trade-cta`, `rich-text`, `featured-collection`, `wholesale-register`.
- `sections/cart-drawer-contents.liquid`, `sections/predictive-search.liquid` — Section Rendering endpoints only.
- `snippets/price.liquid` — the only place that decides whether a price is visible (settings.price_visibility). Reuse it; never duplicate gating logic elsewhere except `buy-buttons.liquid` (buy gating).
- `snippets/quantity-input.liquid` + `<depot-quantity>` — the only quantity control; it enforces `quantity_rule` and tracked stock.
- `snippets/volume-tiers.liquid` — tier table, re-rendered on variant change.
- `snippets/location-switcher.liquid` — company location switcher (native `url_to_set_as_current`).
- `assets/theme.js` — web components: depot-quantity, depot-variant-picker, depot-product-form, depot-cart-drawer, depot-gallery. No build step, no dependencies.
- `locales/en.default.json` (storefront) and `en.default.schema.json` (editor). Every user-facing string goes through `t`.

## Commands
```
shopify theme dev --store <dev-store>.myshopify.com     # hot reload
shopify theme check
shopify theme push --store <store> --password <theme-access-password> --unpublished --theme "Tradepost x.y.z"
```

## Work packages (current status is tracked outside the repo)
WP1 demo store + visual QA → WP2 fixes, lock design → WP3 quick order list with stock → WP4 catalog order form + CSV → WP6 public beta → WP5 premium (presets, RFQ, VAT, saved lists) → WP7 1.0.

## Definition of done for a work package
Theme check clean · 5 screens QA'd desktop+mobile · CHANGELOG + version bumped · pushed to the dev store as an unpublished theme named with the version.
