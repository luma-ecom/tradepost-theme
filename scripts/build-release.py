#!/usr/bin/env python3
"""Build the release zip from the current git HEAD.

The demo store's JSON templates point at files that only exist on that store
(e.g. the buyer tour video, shopify://files/...). Shopify rejects a template that
references a file the target store does not have, so a fresh install would lose
that whole template (rc.3: the home page). This script copies the theme folders
from HEAD and blanks every setting whose value is a store file reference.
It also drops app embeds saved in config/settings_data.json (the demo store's
apps, e.g. a B2B app), so a buyer's store does not inherit them.
The zip is named after theme_info.theme_name: tradepost-theme-<v>.zip or tradepost-pro-<v>.zip.

Usage: python3 scripts/build-release.py 1.0.0 [out_dir]
"""
import io, json, re, subprocess, sys, zipfile, pathlib

THEME_DIRS = ["assets", "config", "layout", "locales", "sections", "snippets", "templates"]
STORE_FILE = re.compile(r"^shopify://(files|shop_images)/")

def strip_header(text):
    # Shopify-generated JSON may start with a /* ... */ comment.
    if text.lstrip().startswith("/*"):
        end = text.index("*/") + 2
        return text[:end], text[end:]
    return "", text

def clean(node, removed, path=""):
    if isinstance(node, dict):
        for k in list(node):
            v = node[k]
            if isinstance(v, str) and STORE_FILE.match(v):
                removed.append(f"{path}/{k} = {v}")
                del node[k]
            else:
                clean(v, removed, f"{path}/{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            clean(v, removed, f"{path}[{i}]")

def main():
    version = sys.argv[1]
    out = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else ".")
    files = subprocess.check_output(["git", "ls-files", *THEME_DIRS], text=True).split()
    schema = json.loads(subprocess.check_output(["git", "show", "HEAD:config/settings_schema.json"], text=True))
    name = next((x.get("theme_name", "") for x in schema if x.get("name") == "theme_info"), "")
    slug = "tradepost-pro" if "Pro" in name else "tradepost-theme"
    zpath = out / f"{slug}-{version}.zip"
    removed_all = []
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for f in files:
            data = subprocess.check_output(["git", "show", f"HEAD:{f}"])
            if f.endswith(".json") and (f.startswith("templates/") or f.startswith("sections/")):
                head, body = strip_header(data.decode("utf-8"))
                doc = json.loads(body)
                removed = []
                clean(doc, removed)
                if removed:
                    removed_all += [f"{f}: {r}" for r in removed]
                    data = ((head + "\n") if head else "").encode() + (json.dumps(doc, indent=2, ensure_ascii=False) + "\n").encode()
            if f == "config/settings_data.json":
                head, body = strip_header(data.decode("utf-8"))
                doc = json.loads(body)
                cur = doc.get("current")
                if isinstance(cur, dict) and isinstance(cur.get("blocks"), dict):
                    for bid, b in list(cur["blocks"].items()):
                        if str(b.get("type", "")).startswith("shopify://apps/"):
                            removed_all.append(f"{f}: app embed {b['type'].split('/')[3]}")
                            del cur["blocks"][bid]
                # A fresh install starts from a theme style (like Dawn's "current": "Default"), so every
                # behaviour setting is the schema default: no quote, compare or page links that point at
                # pages the buyer's store does not have yet. Pick the style that matches the demo's design.
                presets = doc.get("presets") or {}
                if isinstance(cur, dict) and presets:
                    match = next((n for n, pv in presets.items() if all(cur.get(k) == v for k, v in pv.items())), next(iter(presets)))
                    doc["current"] = match
                    removed_all.append(f"{f}: current = style \"{match}\" (demo settings left out)")
                data = ((head + "\n") if head else "").encode() + (json.dumps(doc, indent=2, ensure_ascii=False) + "\n").encode()
            z.writestr(f, data)
    print(f"{zpath} ({len(files)} files)")
    for r in removed_all:
        print("  removed", r)

if __name__ == "__main__":
    main()
