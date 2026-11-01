#!/usr/bin/env python3
"""Generate docs/demo-catalog.csv — a Shopify product CSV for a dental-supply distributor demo (79 products, 314 SKU).
Deterministic (seeded). Run: python3 docs/make-demo-catalog.py
"""
import csv, random, os
random.seed(7)
OUT = os.path.join(os.path.dirname(__file__), "demo-catalog.csv")

families = [
    # (collection, product base, variant option name, variants, pack, price range, vendor list, sku prefix)
    ("Consumables", "Nitrile Exam Gloves, Powder-Free", "Size", ["XS", "S", "M", "L", "XL"], "100/box", (5.9, 7.9), ["Medicom", "Kimberly-Clark", "Sempermed"], "GLV"),
    ("Consumables", "3-Ply Surgical Mask Type IIR", "Color", ["Blue", "White", "Black"], "50/box", (2.9, 4.2), ["Medicom", "Halyard"], "MSK"),
    ("Consumables", "Patient Bibs 2-Ply", "Color", ["Blue", "Green", "Lavender"], "500/case", (16.0, 22.0), ["Crosstex", "Medicom"], "BIB"),
    ("Consumables", "Saliva Ejector Tips", "Color", ["Clear", "Blue", "White"], "100/bag", (3.6, 5.1), ["Crosstex", "Plasdent"], "SUC"),
    ("Consumables", "Cotton Rolls #2", "Pack", ["2000/box"], "2000/box", (9.5, 13.0), ["Richmond", "Crosstex"], "CTR"),
    ("Consumables", "Sterilization Pouches Self-Seal", "Size", ["2.25x4", "3.5x9", "5.25x10", "7.5x13"], "200/box", (8.0, 19.0), ["Crosstex", "Medicom"], "STP"),
    ("Consumables", "Prophy Angles Disposable", "Cup", ["Soft", "Firm"], "100/box", (28.0, 42.0), ["Young", "Preventech"], "PRA"),
    ("Consumables", "Prophy Paste Unit-Dose", "Flavor", ["Mint", "Cherry", "Bubblegum", "Orange"], "200/box", (24.0, 36.0), ["Preventech", "Young"], "PRP"),
    ("Restorative", "Universal Composite Syringe 4g", "Shade", ["A1", "A2", "A3", "A3.5", "B1", "B2", "C2", "D3"], "1 syringe", (34.0, 58.0), ["3M", "Kerr", "Ivoclar", "GC"], "CMP"),
    ("Restorative", "Flowable Composite 2g", "Shade", ["A1", "A2", "A3", "B1"], "2 syringes", (29.0, 46.0), ["3M", "Kerr", "Ivoclar"], "FLW"),
    ("Restorative", "Universal Bonding Agent", "Size", ["5 mL", "Unit-dose 50"], "1 bottle", (62.0, 118.0), ["3M", "Kuraray", "Ivoclar"], "BND"),
    ("Restorative", "Glass Ionomer Cement", "Shade", ["A2", "A3", "B2"], "15g/8mL", (48.0, 72.0), ["GC", "3M"], "GIC"),
    ("Restorative", "Etching Gel 37%", "Size", ["3 mL x 4", "12 mL"], "1 kit", (14.0, 32.0), ["Ultradent", "3M"], "ETC"),
    ("Endodontics", "Rotary Files", "Size", ["15/.04", "20/.04", "25/.04", "25/.06", "30/.04", "35/.04", "40/.04"], "6/pack", (38.0, 56.0), ["Dentsply", "VDW", "Coltene"], "RTF"),
    ("Endodontics", "Gutta Percha Points", "Size", ["15", "20", "25", "30", "35", "40", "Assorted"], "120/box", (9.0, 14.0), ["Dentsply", "Meta"], "GPP"),
    ("Endodontics", "Paper Points", "Size", ["15", "20", "25", "30", "Assorted"], "200/box", (7.0, 11.0), ["Dentsply", "Meta"], "PPP"),
    ("Endodontics", "Sodium Hypochlorite 3%", "Size", ["250 mL", "1 L"], "1 bottle", (8.0, 22.0), ["Cerkamed", "Vista"], "NAO"),
    ("Instruments", "Extraction Forceps", "Pattern", ["#150", "#151", "#17", "#18L", "#18R", "#23", "#65", "#69"], "1 pc", (42.0, 78.0), ["Hu-Friedy", "Medesy", "Carl Martin"], "FRC"),
    ("Instruments", "Dental Mirror Handle + Head #5", "Type", ["Plane", "Front-surface", "Magnifying"], "12/box", (18.0, 34.0), ["Hu-Friedy", "Medesy"], "MIR"),
    ("Instruments", "Scaler / Curette", "Type", ["Gracey 1/2", "Gracey 11/12", "Gracey 13/14", "Universal", "Sickle H6/H7"], "1 pc", (24.0, 46.0), ["Hu-Friedy", "LM"], "SCL"),
    ("Instruments", "Composite Instrument", "Type", ["PFI", "IPC", "Ball burnisher", "Goldstein"], "1 pc", (22.0, 39.0), ["Hu-Friedy", "LM"], "CIN"),
    ("Rotary", "Diamond Bur FG", "Shape", ["Round", "Flat-end cylinder", "Taper", "Pear", "Flame", "Football"], "5/pack", (9.0, 16.0), ["Komet", "MANI", "Jota"], "DBR"),
    ("Rotary", "Carbide Bur FG", "Shape", ["#330", "#245", "#557", "#2", "#4", "#6"], "10/pack", (12.0, 24.0), ["SS White", "Komet", "MANI"], "CBR"),
    ("Rotary", "Polishing Discs", "Grit", ["Coarse", "Medium", "Fine", "Superfine", "Assorted"], "50/box", (26.0, 44.0), ["3M", "Shofu"], "PDC"),
    ("Equipment", "LED Curing Light", "Model", ["Standard", "Pro"], "1 unit", (189.0, 420.0), ["Woodpecker", "Ivoclar", "3M"], "CUR"),
    ("Equipment", "Ultrasonic Scaler Unit", "Model", ["Built-in", "Portable"], "1 unit", (240.0, 690.0), ["Woodpecker", "EMS"], "USC"),
    ("Equipment", "Apex Locator", "Model", ["Standard"], "1 unit", (260.0, 520.0), ["Woodpecker", "Morita"], "APX"),
    ("Equipment", "Autoclave Class B", "Capacity", ["18 L", "23 L"], "1 unit", (2100.0, 3900.0), ["Woson", "Melag"], "AUT"),
    ("Infection Control", "Surface Disinfectant Wipes", "Pack", ["160/tub", "Refill 160"], "1 tub", (9.0, 14.0), ["Metrex", "Schülke"], "WIP"),
    ("Infection Control", "Instrument Enzymatic Cleaner", "Size", ["1 L", "5 L"], "1 bottle", (18.0, 64.0), ["Metrex", "Schülke"], "ENZ"),
    ("Infection Control", "Barrier Film", "Color", ["Clear", "Blue"], "1200 sheets", (11.0, 16.0), ["Plasdent", "Crosstex"], "BRF"),
    ("Impression", "Alginate Fast-Set", "Size", ["453 g", "1 kg"], "1 bag", (12.0, 26.0), ["Zhermack", "Dentsply"], "ALG"),
    ("Impression", "PVS Impression Material", "Viscosity", ["Light body", "Medium body", "Heavy body", "Putty"], "2 x 50 mL", (36.0, 58.0), ["3M", "Zhermack", "Kettenbach"], "PVS"),
    ("Impression", "Impression Trays Disposable", "Size", ["S upper", "M upper", "L upper", "S lower", "M lower", "L lower"], "12/bag", (6.0, 10.0), ["Plasdent", "Premium Plus"], "TRY"),
]

header = ["Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
          "Option1 Name", "Option1 Value", "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty",
          "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
          "Variant Requires Shipping", "Variant Taxable", "Status", "Collection"]

rows = []
n_products = 0
for coll, base, opt, variants, pack, (lo, hi), vendors, prefix in families:
    for vendor in vendors:
        n_products += 1
        handle = f"{prefix.lower()}-{vendor.lower().replace(' ', '-').replace('&', '')}-{n_products}"
        title = f"{base} — {vendor} ({pack})"
        body = f"<p>{base} by {vendor}. Pack: {pack}. Professional use only.</p><table><tr><td>Pack</td><td>{pack}</td></tr><tr><td>Brand</td><td>{vendor}</td></tr><tr><td>Category</td><td>{coll}</td></tr></table>"
        base_price = round(random.uniform(lo, hi), 2)
        for i, v in enumerate(variants):
            sku = f"{prefix}-{vendor[:3].upper()}-{v.replace('/', '').replace('.', '').replace(' ', '')[:6].upper()}-{n_products:03d}"
            r = random.random()
            qty = 0 if r < 0.05 else (random.randint(3, 15) if r < 0.15 else random.randint(50, 2000))
            price = round(base_price * random.uniform(0.97, 1.08), 2)
            compare = round(price * 1.15, 2) if random.random() < 0.2 else ""
            rows.append([handle, title if i == 0 else "", body if i == 0 else "", vendor if i == 0 else "", "", coll if i == 0 else "",
                         f"{coll}, {vendor}, B2B" if i == 0 else "", "TRUE" if i == 0 else "",
                         opt if i == 0 else "", v, sku, random.choice([50, 120, 250, 500, 900]), "shopify", qty,
                         "deny", "manual", f"{price:.2f}", compare, "TRUE", "TRUE", "active" if i == 0 else "", coll if i == 0 else ""])

with open(OUT, "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(header); w.writerows(rows)
print(f"products={n_products} variants={len(rows)} → {OUT}")
