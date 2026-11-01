/* Depot theme — original code. No build step, no dependencies.
   Components: depot-quantity, depot-variant-picker, depot-product-form, depot-cart-drawer, depot-gallery,
   plus header menu / predictive search / reorder helpers. */

const Depot = window.depot || {};

const money = (cents) => {
  const fmt = Depot.moneyFormat || '${{amount}}';
  const n = (cents / 100);
  const two = n.toFixed(2);
  const comma = two.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fmt
    .replace(/\{\{\s*amount\s*\}\}/, comma)
    .replace(/\{\{\s*amount_no_decimals\s*\}\}/, Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','))
    .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, two.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
    .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
};

const t = (key, vars = {}) => {
  let s = (Depot.strings && Depot.strings[key]) || key;
  Object.keys(vars).forEach(k => { s = s.replace(`[${k}]`, vars[k]); });
  return s;
};

const debounce = (fn, ms = 250) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };

/* ---------- Quantity with native B2B rules + stock ---------- */
class DepotQuantity extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('[data-qty-input]');
    this.hint = this.querySelector('[data-qty-hint]');
    this.min = parseInt(this.dataset.min || '1', 10);
    this.step = parseInt(this.dataset.step || '1', 10);
    this.max = this.dataset.max ? parseInt(this.dataset.max, 10) : null;
    this.stock = this.dataset.stock !== undefined ? parseInt(this.dataset.stock, 10) : null;
    this.querySelector('[data-qty-minus]').addEventListener('click', () => this.change(-this.step));
    this.querySelector('[data-qty-plus]').addEventListener('click', () => this.change(this.step));
    this.input.addEventListener('change', () => this.validate(true));
    this.input.addEventListener('input', debounce(() => this.validate(false), 400));
    const before = this.input.value;
    this.validate(false);
    // Cart line below the B2B rule (e.g. added before login): push the corrected quantity to the cart once.
    if (this.dataset.lineKey && this.input.value !== before) {
      // theme.js is deferred: the cart controller only exists after DOMContentLoaded.
      const sync = () => this.validate(true);
      if (window.depotCart) sync();
      else document.addEventListener('DOMContentLoaded', () => setTimeout(sync, 0), { once: true });
    }
  }
  get ceiling() {
    const caps = [];
    if (this.max) caps.push(this.max);
    if (this.stock !== null) caps.push(this.stock);
    return caps.length ? Math.min(...caps) : null;
  }
  change(delta) {
    const v = (parseInt(this.input.value, 10) || this.min) + delta;
    this.input.value = v;
    this.validate(true);
  }
  validate(emit) {
    let v = parseInt(this.input.value, 10);
    let msg = '';
    if (isNaN(v) || v < this.min) { v = this.min; msg = t('qtyMin', { min: this.min }); }
    if ((v - this.min) % this.step !== 0) { v = this.min + Math.ceil((v - this.min) / this.step) * this.step; msg = t('qtyStep', { step: this.step }); }
    const cap = this.ceiling;
    if (cap !== null && v > cap) {
      v = cap - ((cap - this.min) % this.step);
      if (v < this.min) v = this.min;
      msg = this.stock !== null && cap === this.stock ? t('stockLeft', { count: this.stock }) : t('qtyMax', { max: this.max });
    }
    if (this.stock === 0) { msg = t('outOfStock'); }
    if (String(v) !== this.input.value) this.input.value = v;
    if (this.hint) this.hint.textContent = msg;
    this.classList.toggle('qty--warn', !!msg);
    if (emit) this.dispatchEvent(new CustomEvent('depot:quantity', { bubbles: true, detail: { value: v, lineKey: this.dataset.lineKey || null } }));
  }
}
customElements.define('depot-quantity', DepotQuantity);

/* ---------- Variant picker: swaps price, tiers, buy buttons, sku, stock via Section Rendering ---------- */
class DepotVariantPicker extends HTMLElement {
  connectedCallback() {
    this.variants = JSON.parse(this.querySelector('[data-variants]').textContent);
    this.selects = [...this.querySelectorAll('select[data-option-index]')];
    this.selects.forEach(s => s.addEventListener('change', () => this.onChange()));
    this.section = this.closest('[data-section]');
  }
  current() {
    const opts = this.selects.map(s => s.value);
    return this.variants.find(v => v.options.every((o, i) => o === opts[i]));
  }
  async onChange() {
    const v = this.current();
    if (!v) { this.unavailable(); return; }
    const url = `${this.dataset.url}?variant=${v.id}&section_id=${this.dataset.sectionId}`;
    history.replaceState({}, '', `${this.dataset.url}?variant=${v.id}`);
    this.section.classList.add('is-loading');
    try {
      const html = await (await fetch(url)).text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      ['[data-price-wrapper]', '[data-volume-wrapper]', '[data-buy-wrapper]', '[data-sku]', '[data-stock]'].forEach(sel => {
        const next = doc.querySelector(sel); const cur = this.section.querySelector(sel);
        if (next && cur) cur.replaceWith(next);
      });
      const media = this.section.querySelector(`[data-media-id="${v.featured_media && v.featured_media.id}"]`);
      if (media) this.section.querySelector('depot-gallery')?.show(v.featured_media.id);
    } finally { this.section.classList.remove('is-loading'); }
  }
  unavailable() {
    const btn = this.section.querySelector('[data-add-to-cart]');
    if (btn) { btn.disabled = true; btn.querySelector('[data-add-label]').textContent = t('outOfStock'); }
  }
}
customElements.define('depot-variant-picker', DepotVariantPicker);

/* ---------- Product form: AJAX add, opens drawer ---------- */
class DepotProductForm extends HTMLElement {
  connectedCallback() {
    this.form = this.querySelector('form');
    this.form.addEventListener('submit', (e) => this.submit(e));
  }
  async submit(e) {
    e.preventDefault();
    const btn = this.form.querySelector('[data-add-to-cart]');
    const err = this.form.querySelector('[data-form-error]');
    const qty = this.form.querySelector('depot-quantity');
    if (qty) qty.validate(false);
    btn.disabled = true; btn.classList.add('is-loading'); err.hidden = true;
    try {
      const fd = new FormData(this.form);
      fd.append('sections', 'cart-drawer-contents');
      const res = await fetch(Depot.routes.cartAdd, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (data.status) { err.textContent = data.description || data.message; err.hidden = false; return; }
      document.dispatchEvent(new CustomEvent('depot:cart-updated', { detail: { open: true } }));
    } catch (ex) {
      err.textContent = ex.message; err.hidden = false;
    } finally { btn.disabled = false; btn.classList.remove('is-loading'); }
  }
}
customElements.define('depot-product-form', DepotProductForm);

/* ---------- Cart (drawer + page) ---------- */
class DepotCart {
  constructor() {
    this.drawer = document.querySelector('[data-cart-drawer]');
    document.addEventListener('depot:cart-updated', (e) => this.refresh(e.detail && e.detail.open));
    document.addEventListener('depot:quantity', (e) => { if (e.detail.lineKey) this.changeLine(e.detail.lineKey, e.detail.value); });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cart-open]') && this.drawer) { e.preventDefault(); this.open(); }
      if (e.target.closest('[data-cart-close]')) this.close();
      const rm = e.target.closest('[data-line-remove]');
      if (rm) this.changeLine(rm.closest('[data-line-key]').dataset.lineKey, 0);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    document.addEventListener('change', debounce((e) => {
      if (e.target.matches('[data-cart-note]')) this.update({ note: e.target.value });
      if (e.target.matches('[data-cart-attribute]')) this.update({ attributes: { [e.target.dataset.cartAttribute]: e.target.value } });
    }, 300));
    document.addEventListener('submit', (e) => {
      const f = e.target.closest('[data-reorder]');
      if (f) { e.preventDefault(); this.reorder(f); }
    });
  }
  open() { if (!this.drawer) return; this.drawer.hidden = false; document.body.classList.add('drawer-open'); }
  close() { if (!this.drawer) return; this.drawer.hidden = true; document.body.classList.remove('drawer-open'); }
  async changeLine(key, quantity) {
    let error = null;
    try {
      const res = await fetch(Depot.routes.cartChange, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ id: key, quantity }) });
      if (!res.ok) {
        // 422: quantity rule, stock or price-list limit. Keep the message at the line instead of failing silently.
        const data = await res.json().catch(() => ({}));
        error = data.description || data.message || t('updateError');
      }
    } catch (ex) { error = t('updateError'); }
    await this.refresh(false);
    if (error) this.lineError(key, error);
  }
  lineError(key, message) {
    document.querySelectorAll(`[data-line-key="${CSS.escape(key)}"] [data-line-error]`).forEach(el => { el.textContent = message; el.hidden = false; });
  }
  async update(payload) {
    await fetch(Depot.routes.cartUpdate, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  async reorder(form) {
    const items = [];
    const ids = form.querySelectorAll('input[name$="[id]"]');
    ids.forEach((el, i) => {
      const q = form.querySelector(`input[name="items[${i}][quantity]"]`);
      items.push({ id: parseInt(el.value, 10), quantity: parseInt(q.value, 10) });
    });
    const res = await fetch(Depot.routes.cartAdd, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
    if (res.ok) { if (this.drawer) { this.refresh(true); } else { window.location.href = Depot.routes.cart; } }
  }
  async refresh(open) {
    const html = await (await fetch(`${Depot.routes.cart}?section_id=cart-drawer-contents`)).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fresh = doc.querySelector('[data-cart-drawer-body]');
    const body = document.querySelector('[data-cart-drawer-body]');
    if (fresh && body) body.innerHTML = fresh.innerHTML;
    const pageBody = document.querySelector('[data-cart-page-body]');
    if (fresh && pageBody) pageBody.innerHTML = fresh.innerHTML;
    const count = doc.querySelector('[data-cart-count]');
    if (count) document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count.textContent;
      el.classList.toggle('is-empty', count.textContent.trim() === '0' && el.classList.contains('header__cart-count'));
    });
    if (open) this.open();
  }
}
class DepotCartDrawer extends HTMLElement {}
customElements.define('depot-cart-drawer', DepotCartDrawer);
document.addEventListener('DOMContentLoaded', () => { window.depotCart = new DepotCart(); });

/* ---------- Gallery ---------- */
class DepotGallery extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (e) => { const th = e.target.closest('[data-thumb]'); if (th) this.show(th.dataset.mediaId); });
  }
  show(id) {
    this.querySelectorAll('.gallery__item').forEach(el => el.classList.toggle('is-active', el.dataset.mediaId === String(id)));
    this.querySelectorAll('[data-thumb]').forEach(el => el.classList.toggle('is-active', el.dataset.mediaId === String(id)));
  }
}
customElements.define('depot-gallery', DepotGallery);

/* ---------- Header: mobile menu, predictive search (SKU-aware) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('[data-mobile-menu]');
  document.querySelector('[data-menu-open]')?.addEventListener('click', (e) => { menu.hidden = false; e.currentTarget.setAttribute('aria-expanded', 'true'); });
  document.querySelector('[data-menu-close]')?.addEventListener('click', () => { menu.hidden = true; document.querySelector('[data-menu-open]').setAttribute('aria-expanded', 'false'); });

  const input = document.querySelector('[data-predictive-input]');
  const results = document.querySelector('[data-predictive-results]');
  if (input && results && Depot.routes.predictiveSearch) {
    input.addEventListener('input', debounce(async () => {
      const q = input.value.trim();
      if (q.length < 2) { results.hidden = true; return; }
      const url = `${Depot.routes.predictiveSearch}?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=8&resources[options][unavailable_products]=last&resources[options][fields]=title,product_type,variants.title,variants.sku,vendor&section_id=predictive-search`;
      const html = await (await fetch(url)).text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const inner = doc.querySelector('#PredictiveSearchResults');
      if (inner) { results.innerHTML = inner.innerHTML; results.hidden = false; }
    }, 250));
    document.addEventListener('click', (e) => { if (!e.target.closest('.header__search')) results.hidden = true; });
  }

  // Address province selector
  document.querySelectorAll('[data-address-country]').forEach((country) => {
    const province = country.closest('form').querySelector('[data-address-province]');
    const fill = () => {
      const opt = country.options[country.selectedIndex];
      const provinces = JSON.parse(opt.getAttribute('data-provinces') || '[]');
      province.innerHTML = provinces.map(p => `<option value="${p[0]}">${p[1]}</option>`).join('');
      province.closest('.field').hidden = provinces.length === 0;
      if (province.dataset.default) province.value = province.dataset.default;
    };
    if (country.dataset.default) country.value = country.dataset.default;
    country.addEventListener('change', fill); fill();
  });
});
