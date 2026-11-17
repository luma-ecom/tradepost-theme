#!/usr/bin/env python3
"""Generate a large test catalog (about 5,000 variants) for load testing the quick order form.

Reuses the product families of docs/make-demo-catalog.py and multiplies them by vendor and
series, so SKUs stay unique and readable (GLV-MED-S07-M). Output is JSONL for a Shopify bulk
`productSet` mutation, one product per line.

Usage: python3 docs/make-large-catalog.py <locationGid> [target_variants] > catalog.jsonl
"""
import json, os, random, sys

here = os.path.dirname(__file__)
src = open(os.path.join(here, "make-demo-catalog.py"), encoding="utf-8").read()
block = "families = [" + src.split("families = [", 1)[1].split("\n]\n", 1)[0] + "\n]\n"
ns = {}
exec(block, ns)
families = ns["families"]

location = sys.argv[1]
target = int(sys.argv[2]) if len(sys.argv) > 2 else 5000
random.seed(11)

count = 0
series = 1
lines = []
while count < target:
    for coll, base, opt, values, pack, (lo, hi), vendors, prefix in families:
        for vendor in vendors:
            if count >= target:
                break
            vcode = "".join(ch for ch in vendor.upper() if ch.isalnum())[:3]
            handle = f"{prefix}-{vcode}-s{series:02d}".lower()
            base_price = random.uniform(lo, hi)
            variants = []
            for i, val in enumerate(values):
                vslug = "".join(ch for ch in val.upper() if ch.isalnum())[:6] or str(i)
                sku = f"{prefix}-{vcode}-S{series:02d}-{i + 1:02d}{vslug[:4]}"
                variants.append({
                    "optionValues": [{"optionName": opt, "name": val}],
                    "sku": sku,
                    "price": f"{base_price * (1 + 0.04 * i):.2f}",
                    "inventoryItem": {"tracked": True},
                    "inventoryPolicy": "DENY",
                    "inventoryQuantities": [{"locationId": location, "name": "available", "quantity": random.choice([0, 6, 24, 120, 480, 1500])}],
                })
            count += len(variants)
            lines.append({"input": {
                "title": f"{base} — {vendor} Series {series} ({pack})",
                "handle": handle,
                "vendor": vendor,
                "productType": coll,
                "status": "ACTIVE",
                "tags": [coll, vendor, "B2B", "load-test"],
                "descriptionHtml": f"<p>{base} by {vendor}. Pack: {pack}. Load-test catalog.</p>",
                "productOptions": [{"name": opt, "position": 1, "values": [{"name": v} for v in values]}],
                "variants": variants,
            }})
    series += 1

for l in lines:
    print(json.dumps(l, ensure_ascii=False))
print(f"{len(lines)} products, {count} variants", file=sys.stderr)
