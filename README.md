# Depot — the B2B theme for Shopify on every plan

Depot is built for distributors, importers and manufacturers who sell to trade customers: customer-specific pricing, quantity rules, volume pricing, net terms, PO numbers and quick reordering, using Shopify's **native B2B**, available on Basic, Grow, Advanced and Plus since April 2026.

It fixes the things merchants complain about in Shopify's free Trade theme: stock-aware quantity inputs, prices that can be hidden until login, a location switcher, B2B-vs-retail content on any plan, SKU-first search, and a release process that does not break your store.

## Status

`0.1.0` — foundation. Group A (pricing) and Group C (company accounts) in progress. Not yet for production.

## What is in the core (free)

- Volume pricing table on product pages that re-renders on variant change
- Quantity rules (min / max / increments) enforced in every quantity input, with live stock cap
- Unit prices with `/ea`, line totals, correct compare-at handling
- `Who can see prices`: everyone / logged-in / approved B2B accounts, with login and trade-application prompts
- Lowest volume tier on product cards ("From $X at 12+")
- Company and location switcher in the header
- Sections that target B2B buyers or retail visitors (works on all plans via `customer.b2b?`)
- Trade account application page (Shopify Forms app block or built-in form) with a pending state
- Account page with payment terms, PO numbers and one-click reorder
- Cart with PO number and notes, net-terms and submit-for-review messaging
- Collection grid / list view, faceted filters, SKU-aware predictive search, spec and document blocks from metafields

## Install

1. Download the latest release zip.
2. Shopify admin → Online Store → Themes → Add theme → Upload zip file.
3. Create a page with template `page.trade-account` and link it in Theme settings → B2B & wholesale → Trade application page.
4. Set up companies, catalogs, quantity rules and payment terms in Shopify admin → Customers → Companies.

## Need help connecting pricing and orders to QuickBooks, Xero, Odoo or your ERP?

That is the work LUMA-E does behind this theme: net-terms orders posting as open invoices, company ↔ ERP customer mapping, price lists pushed from the ERP, more than three price lists on non-Plus plans, migrations from Woo/Presta. → https://luma-e.com

## License

Source-available, free to use on your own or your clients' stores, no resale or redistribution. See `LICENSE.md`.
