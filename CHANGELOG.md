# Changelog

## 0.1.2 — 2026-11-02
- Fix: `font_face` output was outside `<style>` → raw @font-face text printed at top of every page (first render on depot-demo). Now inside the style block in `snippets/css-variables.liquid`.
- Repo URLs → `luma-ecom/depot-theme`. Theme now deploys from GitHub (`main` → draft theme on depot-demo).
- Finding: on non-Plus plans catalogs can't be assigned to company locations; pricing goes through B2B markets (max 3 active B2B catalogs). Demo store set up that way. No theme code depends on direct assignment.

## 0.1.1 — 2026-11-01
- Repo: CLAUDE.md (rules for Claude Code), docs/DEPOT-STATE.md, docs/demo-companies.md, docs/make-demo-catalog.py + demo-catalog.csv (79 products · 314 SKU dental-supply demo). No theme code changes.

## 0.1.0 — 2026-10-30
- Foundation: layout, settings (B2B, colors, typography, layout, cart), all required templates, section groups.
- Group A: price snippet with gating, compare-at fix, unit label, lowest-tier hint; volume tiers table; quantity input with native rules + stock cap; variant picker with section re-render.
- Group C: location switcher; audience-targeted sections; trade application page; account page with terms, PO and reorder; login/register trade prompts.
- Cart: PO number, notes, net-terms / submit-for-review messaging, drawer and page.
- Original code only. No Dawn/Horizon/Skeleton files.
