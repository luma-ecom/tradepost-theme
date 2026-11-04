# B2B setup for Depot

Depot reads Shopify's native B2B data. Nothing here needs an app.

## 1. Pricing: markets on non-Plus, catalogs on Plus

- **Basic, Grow, Advanced**: B2B pricing runs through **B2B markets**. Create a market per price tier (Markets → Add market → B2B), set its condition to the company locations in that tier, and give the market a catalog with a price list. Shopify allows **3 active B2B catalogs** on these plans. You cannot assign a catalog straight to a company location.
- **Plus**: assign catalogs directly to company locations, no limit of 3.

The theme does not care which route you use. Volume pricing (quantity price breaks) and quantity rules set on the price list show up on product pages, cards and in the cart.

Need more than 3 price lists on a non-Plus plan, or price lists pushed from your ERP? That is service work, not theme work: https://luma-e.com

## 2. Payment terms and order review: two metafields

Liquid cannot read a company location's payment terms or its "submit orders for review" setting. Depot uses two **company location metafields** so the cart and product page can tell the buyer what happens next.

| Namespace and key | Type | Example | What the buyer sees |
|---|---|---|---|
| `depot.payment_terms` | Single line text | `Net 30` | Cart: "Payment terms on this account: Net 30." |
| `depot.review_orders` | True or false | `true` | Product page and cart explain the order goes for review; the checkout button reads "Submit order for review". |

Set up once: Settings → Custom data → Company locations → Add definition (both keys above, namespace `depot`). Then open each company location and fill them in. Keep them in line with the real terms on the location (Customers → Companies → location → Payment terms / Checkout).

If your terms live in an ERP, LUMA-E can sync these two fields for you.

## 3. Theme settings

Theme settings → B2B & wholesale:

- **Who can see prices**: everyone / logged-in customers / approved B2B accounts.
- **Hide add to cart when prices are hidden**: on by default.
- **Hide compare-at price for B2B buyers**: on by default. A percentage price list makes Shopify show the retail price as compare-at on every trade price; most merchants do not want that.
- **Trade application page**: a page using template `page.trade-account`.

Theme settings → Cart:

- **PO number** and **Order notes** fields, and **Show PO number and notes to B2B buyers only** (on by default).

## 4. Customer accounts

B2B needs the new customer accounts. On those stores Shopify hosts the account pages, so Depot's `customers/*` templates are not used; the company name, location switcher, payment terms and PO field live in the header, product page and cart instead. The templates stay in the theme for stores on classic accounts.

## 5. Quick order form and quick order list

- **Quick order form (whole catalog):** create a page (Online Store → Pages → Add page, e.g. "Quick order") and pick the template `page.order-form`. Then in the theme editor open the Header section → **Quick order page**: pick that page. B2B buyers get a "Quick order" link in the top bar. Buyers can search by SKU, paste "SKU, qty" lines from a spreadsheet or upload a CSV (columns `sku`, `quantity`).
- **Quick order list (per product):** already on the product template under the main product. It shows to B2B buyers on products with more than one variant (both are section settings).
- Both use the theme setting B2B & wholesale → **Show stock levels in order lists**.
