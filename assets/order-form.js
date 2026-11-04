/* Tradepost — quick order form for the whole catalog (WP4). Original code, no dependencies.
   <depot-order-form>: find by SKU or name, paste "SKU, qty" lines, upload CSV, add every line at once.
   Catalog pages come from sections/order-form-data.liquid (buyer's price, tiers, quantity rules, stock).
   Quantities already in the cart count against stock, rules and tiers; lines with no stock never reach the cart. */
(() => {
  if (customElements.get('depot-order-form')) return;

  const D = window.depot || {};
  const routes = D.routes || {};
  const cartUrl = routes.cart || '/cart';
  const cartAddUrl = routes.cartAdd || '/cart/add';
  const STORE_KEY = 'depot.orderForm.v1';
  const CHUNK = 100;
  const PARALLEL = 4;

  const money = (cents) => {
    const fmt = D.moneyFormat || '${{amount}}';
    const n = (cents || 0) / 100;
    const two = n.toFixed(2);
    const group = (s, sep) => s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    const [int, dec] = two.split('.');
    return fmt
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, group(String(Math.round(n)), '.'))
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, `${group(int, '.')},${dec}`)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, group(String(Math.round(n)), ','))
      .replace(/\{\{\s*amount\s*\}\}/, `${group(int, ',')}.${dec}`);
  };
  const fill = (s, vars) => Object.keys(vars).reduce((out, k) => out.split(`[${k}]`).join(vars[k]), s || '');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const debounce = (fn, ms) => { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); }; };
  const qs = (strings, key, vars) => fill((strings && strings[key]) || (D.strings && D.strings[key]) || '', vars || {});
  const toInt = (v) => { const n = parseInt(String(v == null ? '' : v).replace(/[^\d-]/g, ''), 10); return isNaN(n) ? null : n; };
  const normSku = (s) => String(s || '').trim().toUpperCase();

  /* Run fn over items with at most `size` requests in flight. */
  const pool = async (items, size, fn) => {
    const queue = [...items];
    const workers = Array.from({ length: Math.min(size, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift());
    });
    await Promise.all(workers);
  };

  /* One line of text → cells. CSV quotes respected; comma, semicolon or tab separate. */
  const splitCells = (line) => {
    const delim = line.includes('\t') ? '\t' : (line.includes(';') && !line.includes(',') ? ';' : ',');
    if (!line.includes(delim)) {
      // "SKU 12": the last number is the quantity, the rest is the SKU (SKUs may contain spaces).
      const m = line.trim().match(/^(.*\S)\s+(\d+)$/);
      return m ? [m[1], m[2]] : [line.trim()];
    }
    const cells = []; let cur = ''; let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === delim) { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  };

  /* Text (pasted or CSV) → [{ sku, qty|null }]. Header row optional; columns found by name when present. */
  const parseList = (text) => {
    const rows = String(text || '').replace(/^﻿/, '').split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(splitCells);
    if (!rows.length) return [];
    let skuCol = 0; let qtyCol = 1;
    const head = rows[0].map(c => c.toLowerCase().replace(/[^a-z]/g, ''));
    const s = head.findIndex(c => ['sku', 'variantsku', 'itemsku', 'code', 'itemcode', 'partnumber', 'mpn'].includes(c));
    const q = head.findIndex(c => ['qty', 'quantity', 'quantities', 'qte', 'soluong', 'amount', 'units'].includes(c));
    if (s !== -1) { skuCol = s; qtyCol = q !== -1 ? q : (s === 0 ? 1 : 0); rows.shift(); }
    return rows.map(r => ({ sku: (r[skuCol] || '').trim(), qty: toInt(r[qtyCol]) })).filter(e => e.sku);
  };

  class DepotOrderForm extends HTMLElement {
    connectedCallback() {
      if (this.started) return;
      this.started = true;
      try { this.s = JSON.parse(this.querySelector('[data-of-strings]').textContent); } catch (e) { this.s = {}; }
      this.showStock = this.dataset.showStock === 'true';
      this.showSku = this.dataset.showSku === 'true';
      this.lowStock = parseInt(this.dataset.lowStock || '0', 10);
      this.records = []; this.byId = new Map(); this.bySku = new Map();
      this.lines = []; this.inCart = {};
      this.$ = (sel) => this.querySelector(sel);
      this.el = {
        search: this.$('[data-of-search]'), results: this.$('[data-of-results]'), meta: this.$('[data-of-meta]'),
        paste: this.$('[data-of-paste]'), pasteAdd: this.$('[data-of-paste-add]'), file: this.$('[data-of-file]'),
        template: this.$('[data-of-template]'), imp: this.$('[data-of-import]'),
        form: this.$('[data-of-form]'), body: this.$('[data-of-body]'), empty: this.$('[data-of-empty]'),
        count: this.$('[data-of-count]'), subtotal: this.$('[data-of-subtotal]'), submit: this.$('[data-of-submit]'),
        clear: this.$('[data-of-clear]'), status: this.$('[data-of-status]')
      };
      // Phones: keep the list near the top; the paste / CSV panel opens on demand.
      const bulk = this.querySelector('.order-form__bulk');
      if (bulk && window.matchMedia('(max-width: 749px)').matches) bulk.open = false;
      this.bind();
      this.render();
      this.ready = this.load();
    }

    /* ---------- catalog ---------- */
    pageUrl(page) {
      const u = new URL(this.dataset.source, window.location.origin);
      u.searchParams.set('section_id', 'order-form-data');
      u.searchParams.set('page', page);
      return u.pathname + u.search;
    }
    async fetchPage(page) {
      const html = await (await fetch(this.pageUrl(page), { credentials: 'same-origin' })).text();
      const m = html.match(/<script[^>]*data-of-data[^>]*>([\s\S]*?)<\/script>/);
      if (!m) throw new Error('catalog');
      const data = JSON.parse(m[1]);
      (data.v || []).forEach(a => this.put(a, page));
      return data;
    }
    put(a, page) {
      const rec = {
        id: a[0], sku: a[1] || '', product: a[2] || '', variant: a[3] || '', url: a[4] || '#', price: a[5] || 0,
        breaks: a[6] || [], min: a[7] || 1, step: a[8] || 1, max: a[9] || null,
        stock: a[10] === null || a[10] === undefined ? null : a[10], available: !!a[11], backorder: !!a[12], page
      };
      rec.key = `${rec.sku} ${rec.product} ${rec.variant}`.toLowerCase();
      const old = this.byId.get(rec.id);
      if (old) { Object.assign(old, rec); return; }
      this.records.push(rec); this.byId.set(rec.id, rec);
      if (rec.sku && !this.bySku.has(normSku(rec.sku))) this.bySku.set(normSku(rec.sku), rec);
    }
    async fetchCart() {
      const cart = await (await fetch(`${cartUrl}.js`, { headers: { Accept: 'application/json' }, credentials: 'same-origin' })).json();
      const have = {};
      (cart.items || []).forEach(i => { have[i.variant_id] = (have[i.variant_id] || 0) + i.quantity; });
      this.inCart = have;
      return have;
    }
    async load() {
      try {
        const [first] = await Promise.all([this.fetchPage(1), this.fetchCart()]);
        const rest = [];
        for (let p = 2; p <= (first.pages || 1); p += 1) rest.push(p);
        if (rest.length) {
          let done = 1;
          this.meta(qs(this.s, 'loading') + ` ${Math.round(100 / first.pages)}%`);
          await pool(rest, PARALLEL, async (p) => {
            await this.fetchPage(p);
            done += 1;
            this.meta(qs(this.s, 'loading') + ` ${Math.round((done * 100) / first.pages)}%`);
          });
        }
        this.loaded = true;
        this.meta(qs(this.s, 'loaded', { count: this.bySku.size }));
        const { search, pasteAdd, file } = this.el;
        if (search) { search.disabled = false; search.placeholder = search.dataset.placeholder || ''; }
        if (pasteAdd) pasteAdd.disabled = false;
        if (file) file.disabled = false;
        this.restore();
      } catch (e) {
        this.meta(qs(this.s, 'loadError'), true);
      }
    }
    meta(text, isError) {
      if (!this.el.meta) return;
      this.el.meta.textContent = text;
      this.el.meta.classList.toggle('is-error', !!isError);
    }

    /* ---------- rules: what this line may add, given the cart ---------- */
    limits(rec) {
      const c = this.inCart[rec.id] || 0;
      let min = rec.min; let max = rec.max;
      if (c > 0) {
        min = Math.max(rec.min - c, rec.step);
        if (rec.max) max = rec.max - c;
      }
      let room = null;
      if (rec.stock !== null) room = Math.max(rec.stock - c, 0);
      let cap = max;
      if (room !== null) cap = cap === null ? room : Math.min(cap, room);
      let blocked = '';
      if (!rec.available || (room !== null && room <= 0)) {
        blocked = c > 0 && rec.available ? qs(this.s, 'noneLeft') : qs(this.s, 'outOfStock');
      } else if (max !== null && max < min) {
        blocked = qs(this.s, 'maxReached');
      } else if (room !== null && room < min) {
        blocked = qs(this.s, 'belowMin', { count: room, min });
      }
      return { min, step: rec.step, max, room, cap, inCart: c, blocked };
    }
    /* Bring a wanted quantity inside min / step / max / stock. Returns { qty, note, blocked }. */
    fit(rec, want) {
      const L = this.limits(rec);
      if (L.blocked) return { qty: 0, note: L.blocked, blocked: true };
      if (want === null || want === undefined) want = L.min;
      if (!(want > 0)) return { qty: 0, note: '' };
      let q = want; let note = '';
      if (q < L.min) { q = L.min; note = qs(this.s, 'qtyMin', { min: L.min }); }
      const off = (q - L.min) % L.step;
      if (off) { q += L.step - off; note = qs(this.s, 'qtyStep', { step: L.step }); }
      if (L.cap !== null && q > L.cap) {
        q = L.cap - ((L.cap - L.min) % L.step);
        note = L.room !== null && L.cap === L.room ? qs(this.s, 'stockLeft', { count: L.room }) : qs(this.s, 'qtyMax', { max: L.max });
      }
      return { qty: q, note };
    }
    unit(rec, qty) {
      const total = qty + (this.inCart[rec.id] || 0);
      let unit = rec.price; let tier = 0;
      rec.breaks.forEach(([min, cents]) => { if (total >= min && cents <= unit) { unit = cents; tier = min; } });
      return { unit, tier };
    }

    /* ---------- list ---------- */
    find(id) { return this.lines.find(l => l.rec.id === id); }
    addRec(rec, qty, merge) {
      let line = this.find(rec.id);
      let want = qty;
      if (line && merge && line.qty > 0) want = line.qty + (qty === null ? this.limits(rec).min : qty);
      if (!line) { line = { rec, qty: 0, note: '', error: false }; this.lines.push(line); }
      const f = this.fit(rec, want);
      line.qty = f.qty; line.note = f.note; line.error = !!f.blocked; line.blocked = !!f.blocked;
      return line;
    }
    stockText(rec) {
      if (rec.backorder) return { cls: 'stock--low', text: qs(this.s, 'backorder') };
      if (rec.stock === null) return rec.available ? { cls: 'stock--in', text: qs(this.s, 'inStock') } : { cls: 'stock--out', text: qs(this.s, 'outOfStock') };
      if (rec.stock <= 0 || !rec.available) return { cls: 'stock--out', text: qs(this.s, 'outOfStock') };
      if (rec.stock <= this.lowStock) return { cls: 'stock--low', text: qs(this.s, 'lowStock', { count: rec.stock }) };
      return { cls: 'stock--in', text: qs(this.s, 'inStockCount', { count: rec.stock }) };
    }
    rowHtml(line) {
      const r = line.rec;
      const st = this.stockText(r);
      const c = this.inCart[r.id] || 0;
      const label = r.sku || r.product;
      return `<tr class="order-form__row" data-of-row data-id="${r.id}">`
        + (this.showSku ? `<td class="order-form__c-sku"><span class="order-form__sku">${esc(r.sku || '—')}</span></td>` : '')
        + `<td class="order-form__c-name"><span class="order-form__name"><a href="${esc(r.url)}">${esc(r.product)}</a></span>`
        + (r.variant ? `<span class="order-form__variant">${esc(r.variant)}</span>` : '')
        + `<span class="order-form__incart" data-of-incart>${c ? esc(qs(this.s, 'inCart', { count: c })) : ''}</span>`
        + `<p class="order-form__msg" data-of-msg role="alert"></p></td>`
        + (this.showStock ? `<td class="order-form__c-stock"><span class="stock ${st.cls}">${esc(st.text)}</span></td>` : '')
        + `<td class="order-form__c-unit is-num"><span data-of-unit></span>${this.s.perUnit ? `<span class="price__unit">${esc(this.s.perUnit)}</span>` : ''}<span class="order-form__tier" data-of-tier></span></td>`
        + `<td class="order-form__c-qty is-qty"><input class="order-form__qty" type="number" inputmode="numeric" min="0" step="${r.step}" value="${line.qty || ''}"`
        + ` aria-label="${esc(qs(this.s, 'qtyFor', { item: label }))}" data-of-qty${line.blocked ? ' disabled' : ''}></td>`
        + `<td class="order-form__c-total is-num" data-of-total>—</td>`
        + `<td class="order-form__c-remove"><button type="button" class="order-form__remove" data-of-remove aria-label="${esc(qs(this.s, 'remove', { item: label }))}">×</button></td>`
        + '</tr>';
    }
    rowOf(line) { return this.el.body.querySelector(`[data-of-row][data-id="${line.rec.id}"]`); }
    paintRow(line, row) {
      row = row || this.rowOf(line);
      if (!row) return;
      const { unit, tier } = this.unit(line.rec, line.qty);
      row.querySelector('[data-of-unit]').textContent = money(unit);
      row.querySelector('[data-of-tier]').textContent = tier ? fill(this.s.tier, { qty: tier }) : '';
      row.querySelector('[data-of-total]').textContent = line.qty ? money(unit * line.qty) : '—';
      const msg = row.querySelector('[data-of-msg]');
      // The stock column already says "Out of stock": don't repeat it under the name.
      const repeat = this.showStock && line.blocked && line.note === qs(this.s, 'outOfStock');
      msg.textContent = repeat ? '' : (line.note || '');
      msg.classList.toggle('is-error', !!line.error);
      row.classList.toggle('is-active', line.qty > 0);
      row.classList.toggle('is-blocked', !!line.blocked);
    }
    render() {
      const { body, empty } = this.el;
      body.innerHTML = this.lines.map(l => this.rowHtml(l)).join('');
      [...body.children].forEach((row, i) => this.paintRow(this.lines[i], row));
      if (empty) empty.hidden = this.lines.length > 0;
      this.totals();
    }
    totals() {
      let lines = 0; let subtotal = 0;
      this.lines.forEach(l => {
        if (l.qty > 0 && !l.blocked) { lines += 1; subtotal += this.unit(l.rec, l.qty).unit * l.qty; }
      });
      if (this.el.count) this.el.count.textContent = lines === 1 ? this.s.lineOne : fill(this.s.lineOther, { count: lines });
      if (this.el.subtotal) this.el.subtotal.textContent = money(subtotal);
      if (this.el.submit && !this.busy) this.el.submit.disabled = lines === 0;
      if (this.el.empty) this.el.empty.hidden = this.lines.length > 0;
    }
    save() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(this.lines.map(l => [l.rec.id, l.qty]))); } catch (e) { /* storage off */ }
    }
    restore() {
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { saved = []; }
      if (!Array.isArray(saved) || !saved.length) return;
      saved.forEach(([id, qty]) => { const rec = this.byId.get(id); if (rec) this.addRec(rec, typeof qty === 'number' ? qty : null, false); });
      this.render();
      this.save();
    }
    status(text, isError) {
      if (!this.el.status) return;
      this.el.status.textContent = text || '';
      this.el.status.classList.toggle('is-error', !!isError);
    }
    importMsg(text, isError) {
      if (!this.el.imp) return;
      this.el.imp.textContent = text || '';
      this.el.imp.hidden = !text;
      this.el.imp.classList.toggle('is-error', !!isError);
    }

    /* ---------- search ---------- */
    match(q) {
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return [];
      const up = normSku(q);
      const hits = [];
      for (const r of this.records) {
        if (!terms.every(t => r.key.includes(t))) continue;
        const s = normSku(r.sku);
        const rank = s === up ? 0 : (s.startsWith(up) ? 1 : (s.includes(up) ? 2 : 3));
        hits.push([rank, r]);
        if (hits.length > 400) break;
      }
      return hits.sort((a, b) => a[0] - b[0]).slice(0, 8).map(h => h[1]);
    }
    showResults() {
      const { search, results } = this.el;
      const q = search.value.trim();
      this.hits = q ? this.match(q) : [];
      this.active = this.hits.length ? 0 : -1;
      if (!q) { this.closeResults(); return; }
      results.innerHTML = this.hits.length
        ? this.hits.map((r, i) => {
          const L = this.limits(r);
          return `<li class="order-form__result${L.blocked ? ' is-out' : ''}" role="option" id="${search.id}-opt-${i}" data-index="${i}" aria-selected="${i === 0}">`
            + `<span class="order-form__result-sku">${esc(r.sku || '—')}</span>`
            + `<span class="order-form__result-name">${esc(r.product)}${r.variant ? ` · ${esc(r.variant)}` : ''}</span>`
            + `<span class="order-form__result-note">${esc(L.blocked ? qs(this.s, 'outOfStock') : money(r.price))}</span></li>`;
        }).join('')
        : `<li class="order-form__result order-form__result-note" role="option" aria-disabled="true">${esc(qs(this.s, 'noResults', { q }))}</li>`;
      results.hidden = false;
      search.setAttribute('aria-expanded', 'true');
      search.setAttribute('aria-activedescendant', this.hits.length ? `${search.id}-opt-0` : '');
    }
    closeResults() {
      const { search, results } = this.el;
      results.hidden = true; results.innerHTML = '';
      search.setAttribute('aria-expanded', 'false');
      search.removeAttribute('aria-activedescendant');
      this.hits = []; this.active = -1;
    }
    moveActive(delta) {
      if (!this.hits || !this.hits.length) return;
      this.active = (this.active + delta + this.hits.length) % this.hits.length;
      this.el.results.querySelectorAll('[role="option"]').forEach((li, i) => li.setAttribute('aria-selected', String(i === this.active)));
      const id = `${this.el.search.id}-opt-${this.active}`;
      this.el.search.setAttribute('aria-activedescendant', id);
      document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
    }
    pick(rec) {
      if (!rec) return;
      const existing = this.find(rec.id);
      if (!existing) { this.addRec(rec, null, false); this.render(); this.save(); }
      this.el.search.value = '';
      this.closeResults();
      const line = this.find(rec.id);
      const row = this.rowOf(line);
      if (row) {
        row.classList.add('is-flash');
        setTimeout(() => row.classList.remove('is-flash'), 900);
        const input = row.querySelector('[data-of-qty]');
        if (input && !input.disabled) { input.focus(); input.select(); } else this.el.search.focus();
      }
    }

    /* ---------- paste / CSV ---------- */
    async importText(text) {
      const entries = parseList(text);
      if (!entries.length) { this.importMsg(qs(this.s, 'nothingFound'), true); return 0; }
      await this.ready;
      const merged = new Map();
      entries.forEach(e => {
        const k = normSku(e.sku);
        const prev = merged.get(k);
        merged.set(k, { sku: e.sku, qty: prev ? (prev.qty || 0) + (e.qty || 0) || null : e.qty });
      });
      const missing = []; let added = 0;
      merged.forEach((e, k) => {
        const rec = this.bySku.get(k);
        if (!rec) { missing.push(e.sku); return; }
        this.addRec(rec, e.qty, true);
        added += 1;
      });
      this.render(); this.save();
      let msg = added === 1 ? this.s.importedOne : fill(this.s.importedOther, { count: added });
      if (missing.length) {
        const list = missing.slice(0, 12).join(', ') + (missing.length > 12 ? ` +${missing.length - 12}` : '');
        msg = `${added ? `${msg} ` : ''}${fill(this.s.notFound, { count: missing.length, skus: list })}`;
      }
      this.importMsg(msg, missing.length > 0);
      return added;
    }
    downloadTemplate() {
      const sample = this.records.filter(r => r.sku && r.available).slice(0, 2);
      const rows = ['sku,quantity'].concat(sample.map(r => `${r.sku.includes(',') ? `"${r.sku}"` : r.sku},${r.min}`));
      const url = URL.createObjectURL(new Blob([`${rows.join('\n')}\n`], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'quick-order-template.csv';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /* ---------- events ---------- */
    bind() {
      const { search, results, paste, pasteAdd, file, template, form, body, clear } = this.el;
      if (search) {
        search.addEventListener('input', debounce(() => this.showResults(), 120));
        search.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); this.moveActive(1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); this.moveActive(-1); }
          else if (e.key === 'Enter') {
            e.preventDefault();
            if (!this.hits || !this.hits.length) this.showResults();
            const exact = this.bySku.get(normSku(search.value));
            this.pick(this.hits && this.hits[this.active] ? this.hits[this.active] : exact);
          } else if (e.key === 'Escape') this.closeResults();
        });
        results.addEventListener('mousedown', (e) => {
          const li = e.target.closest('[data-index]');
          if (li) { e.preventDefault(); this.pick(this.hits[parseInt(li.dataset.index, 10)]); }
        });
        search.addEventListener('blur', () => setTimeout(() => this.closeResults(), 150));
      }
      if (pasteAdd) {
        pasteAdd.addEventListener('click', async () => {
          const n = await this.importText(paste.value);
          if (n) paste.value = '';
        });
      }
      if (file) {
        file.addEventListener('change', () => {
          const f = file.files && file.files[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = async () => { await this.importText(String(reader.result || '')); file.value = ''; };
          reader.onerror = () => this.importMsg(qs(this.s, 'fileError'), true);
          reader.readAsText(f);
        });
      }
      if (template) template.addEventListener('click', () => this.downloadTemplate());
      body.addEventListener('input', (e) => {
        if (!e.target.matches('[data-of-qty]')) return;
        const line = this.find(parseInt(e.target.closest('[data-of-row]').dataset.id, 10));
        if (!line) return;
        line.qty = Math.max(toInt(e.target.value) || 0, 0);
        line.note = ''; line.error = false;
        this.paintRow(line); this.totals(); this.status('');
      });
      body.addEventListener('change', (e) => {
        if (!e.target.matches('[data-of-qty]')) return;
        const line = this.find(parseInt(e.target.closest('[data-of-row]').dataset.id, 10));
        if (!line) return;
        const f = this.fit(line.rec, toInt(e.target.value) || 0);
        line.qty = f.qty; line.note = f.note; line.error = false;
        if (String(f.qty || '') !== e.target.value) e.target.value = f.qty || '';
        this.paintRow(line); this.totals(); this.save();
      });
      body.addEventListener('keydown', (e) => {
        // Enter in a quantity jumps back to search: type SKU → Enter → qty → Enter → next SKU.
        if (e.key === 'Enter' && e.target.matches('[data-of-qty]')) { e.preventDefault(); e.target.blur(); search && search.focus(); }
      });
      body.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-of-remove]');
        if (!btn) return;
        const id = parseInt(btn.closest('[data-of-row]').dataset.id, 10);
        this.lines = this.lines.filter(l => l.rec.id !== id);
        btn.closest('[data-of-row]').remove();
        this.totals(); this.save();
      });
      if (clear) clear.addEventListener('click', () => { this.lines = []; this.render(); this.save(); this.status(''); this.importMsg(''); });
      form.addEventListener('submit', (e) => { e.preventDefault(); this.submit(); });
    }

    /* ---------- add to cart ---------- */
    async post(items) {
      const res = await fetch(`${cartAddUrl}.js`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: items.map(({ id, quantity }) => ({ id, quantity })) })
      });
      if (res.ok) return { ok: true };
      const d = await res.json().catch(() => ({}));
      return { ok: false, message: d.description || d.message || this.s.error };
    }
    /* Add a group; if Shopify refuses it (422), keep what went in and split the rest in halves
       until the refused lines are isolated, so each one shows Shopify's reason at the line. */
    async addItems(items, before) {
      const r = await this.post(items);
      if (r.ok) { items.forEach(it => { it.ok = true; }); return; }
      const have = await this.fetchCart();
      const left = items.filter(it => {
        if ((have[it.id] || 0) >= (before[it.id] || 0) + it.quantity) { it.ok = true; return false; }
        return true;
      });
      if (!left.length) return;
      if (left.length === 1) {
        const one = items.length === 1 ? r : await this.post(left);
        if (one.ok) { left[0].ok = true; return; }
        left[0].line.error = true;
        left[0].line.note = `${this.s.notAdded} ${one.message}`.trim();
        return;
      }
      const mid = Math.ceil(left.length / 2);
      await this.addItems(left.slice(0, mid), before);
      await this.addItems(left.slice(mid), before);
    }
    async submit() {
      if (this.busy) return;
      await this.ready;
      const btn = this.el.submit;
      this.busy = true; btn.disabled = true; btn.classList.add('is-loading');
      this.status('');
      try {
        // 1. Fresh stock and cart: only the catalog pages that hold these lines.
        const wanted = this.lines.filter(l => l.qty > 0 && !l.blocked);
        if (!wanted.length) return;
        const pages = [...new Set(wanted.map(l => l.rec.page))];
        await Promise.all([this.fetchCart(), pool(pages, PARALLEL, p => this.fetchPage(p))]);
        let changed = false;
        this.lines.forEach(l => {
          if (!(l.qty > 0)) return;
          const f = this.fit(l.rec, l.qty);
          if (f.blocked) { changed = true; l.qty = 0; l.blocked = true; l.error = true; l.note = f.note; return; }
          if (f.qty !== l.qty) { changed = true; l.qty = f.qty; l.error = true; l.note = fill(this.s.stockChanged, { count: f.qty }); }
        });
        if (changed) { this.render(); this.save(); this.status(this.s.review, true); return; }

        // 2. Add in chunks; 3. a refused chunk is retried line by line, Shopify's reason shown at the line.
        const before = { ...this.inCart };
        const items = wanted.map(l => ({ id: l.rec.id, quantity: l.qty, line: l }));
        for (let i = 0; i < items.length; i += CHUNK) await this.addItems(items.slice(i, i + CHUNK), before);
        const added = items.filter(it => it.ok).length;
        const failed = items.length - added;
        const done = new Set(items.filter(it => it.ok).map(it => it.id));
        this.lines = this.lines.filter(l => !done.has(l.rec.id));
        await this.fetchCart();
        this.lines.forEach(l => { if (!l.error) { const f = this.fit(l.rec, l.qty || 0); l.blocked = !!f.blocked; } });
        this.render(); this.save();
        if (added) document.dispatchEvent(new CustomEvent('depot:cart-updated', { detail: { open: !failed } }));
        const addedMsg = added ? fill(this.s.added, { count: added }) : '';
        if (failed) this.status(`${addedMsg} ${this.s.review}`.trim(), true);
        else this.status(addedMsg);
      } catch (e) {
        this.status(this.s.error, true);
      } finally {
        this.busy = false;
        btn.classList.remove('is-loading');
        this.totals();
      }
    }
  }

  customElements.define('depot-order-form', DepotOrderForm);
})();
