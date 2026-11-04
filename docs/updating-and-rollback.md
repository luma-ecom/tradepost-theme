# Updating Depot and rolling back

Depot ships as numbered releases (`0.4.0`, `1.0.0-beta`, …). Every release has a `CHANGELOG.md` entry and a matching `theme_version` in `config/settings_schema.json`. Settings are never renamed between releases, so your theme editor settings carry over.

## Update without risk

1. **Keep your live theme as it is.** In Shopify admin → Online Store → Themes, upload the new release zip (Add theme → Upload zip file). It arrives as an unpublished theme.
2. **Copy your settings across.** Open the current live theme → ⋯ → Download theme file, take `config/settings_data.json` and the `templates/*.json` you customised, and upload them into the new theme with Edit code (or keep both themes connected to the same GitHub branch, see below).
3. **Preview** the new theme (⋯ → Preview) logged in as a B2B buyer: product page, collection, cart, quick order form.
4. **Publish** the new theme. The old one stays in your theme library as a draft.

## Roll back

Something looks wrong after an update: Online Store → Themes → the previous Depot version → **Publish**. That is the whole rollback. Shopify keeps up to 20 themes, so keep the previous release until the new one has run for a week.

## Using GitHub

If you work from your own fork: connect the repo in Online Store → Themes → Add theme → Connect from GitHub. Each branch becomes a theme. Keep `main` for the live theme and create a branch per release (`release/1.0.0`). To roll back, publish the theme of the previous branch, or revert the merge commit on `main`.

## What a release will never do

- Rename or remove a setting id (old ids are kept and mapped).
- Change the meaning of an existing setting.
- Add an app, tracking script or external dependency.

If a release has to change behaviour you rely on, the CHANGELOG entry says so in its first line.
