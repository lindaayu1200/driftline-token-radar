(function () {
  'use strict';
  var D = window.DRIFTLINE, app = document.getElementById('board');
  if (!D) return;
  var state = { q: '', category: 'all', chain: 'all', watch: false, confidence: 'all', sort: 'rank', dir: 1, detail: null, tab: 'board' };
  // Build ordinary DOM nodes while accepting text, numbers, nodes, or child arrays.
  function node(tag, attrs) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      if (key === 'text') n.textContent = attrs[key];
      else if (key === 'html') n.innerHTML = attrs[key];
      else if (key.slice(0, 2) === 'on') n.addEventListener(key.slice(2), attrs[key]);
      else if (attrs[key] !== null && attrs[key] !== undefined) n.setAttribute(key, attrs[key]);
    });
    for (var i = 2; i < arguments.length; i++) {
      var children = Array.isArray(arguments[i]) ? arguments[i] : [arguments[i]];
      children.forEach(function (child) {
        if (child === null || child === undefined || child === false) return;
        n.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
      });
    }
    return n;
  }
  function usd(n) {
    if (n === null || n === undefined) return '—';
    var a = Math.abs(n);
    return '$' + (a >= 1e9 ? (n / 1e9).toFixed(2) + 'B' : a >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : a >= 1e3 ? Math.round(n / 1e3) + 'K' : Math.round(n).toLocaleString());
  }
  function pct(n) { return n === null || n === undefined ? '—' : (n >= 0 ? '+' : '') + n.toFixed(2) + '%'; }
  function age(n) { return n === null || n === undefined ? 'unknown' : n >= 365 ? (n / 365).toFixed(1) + 'y' : Math.round(n) + 'd'; }
  var categories = D.rows.map(function (r) { return r.category || 'Other'; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
  var chains = D.rows.reduce(function (a, r) { return a.concat(r.chains || []); }, []).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
  function filtered() {
    var q = state.q.toLowerCase();
    return D.rows.filter(function (r) {
      var searchable = [r.name, r.slug, r.category, (r.chains || []).join(' ')].join(' ').toLowerCase();
      return (state.category === 'all' || r.category === state.category) &&
        (state.chain === 'all' || (r.chains || []).indexOf(state.chain) >= 0) &&
        (!state.watch || r.watchlisted) &&
        (state.confidence === 'all' || r.confidence === state.confidence) &&
        (!q || searchable.indexOf(q) >= 0);
    }).sort(function (a, b) {
      var key = state.sort;
      var av = sortValue(a, key), bv = sortValue(b, key);
      return av < bv ? -state.dir : av > bv ? state.dir : a.slug.localeCompare(b.slug);
    });
  }

  function sortValue(row, key) {
    if (key === 'name') return row.name.toLowerCase();
    if (key === 'tvl') return row.tvl_usd;
    if (key === 'momentum') return row.change_7d == null ? -Infinity : row.change_7d;
    if (key === 'age') return row.age_days == null ? Infinity : row.age_days;
    if (key === 'signal') return row.signal;
    if (key === 'value') return row.implied_value_usd;
    return row.rank;
  }
  function masthead() {
    var tvl = D.rows.filter(function (r) { return r.watchlisted; }).reduce(function (a, r) { return a + r.tvl_usd; }, 0);
    var stats = node('div', { class: 'stats' });
    var values = [['Total TVL watched', usd(tvl)], ['Protocols ranked', D.board_size], ['Watchlist covered', D.watchlist_size + '/' + D.watchlist_size], ['Floor', usd(D.floor_usd)], ['As of', D.as_of]];
    values.forEach(function (value) {
      stats.appendChild(node('div', { class: 'stat' },
        node('b', { class: 'num', text: String(value[1]) }),
        node('span', { text: value[0] })));
    });
    return node('header', { class: 'mast' }, node('div', { class: 'eyebrow', text: 'NAUTICAL SOUNDINGS / ' + D.model_version }), node('h1', { text: 'Driftline' }), node('p', { class: 'subtitle', text: "where a protocol's token is not yet issued" }), stats);
  }
  function formula() {
    return node('section', { class: 'formula' },
      node('strong', { text: 'How the number is made' }),
      node('code', { text: D.formulae.base + ' · ' + D.formulae.momentum + ' · ' + D.formulae.ageMult }),
      node('span', { class: 'muted', text: 'model ' + D.model_version }));
  }

  function svgNode(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (attrs[key] !== null && attrs[key] !== undefined) n.setAttribute(key, attrs[key]);
    });
    return n;
  }
  function chart() { var w = 900, h = 280, p = { l: 52, r: 15, t: 12, b: 34 }, rs = D.rows, aa = rs.map(function (r) { return Math.max(1, r.age_days == null ? 365 : r.age_days); }), vv = rs.map(function (r) { return Math.max(1, r.tvl_usd); }), amin = Math.min.apply(0, aa), amax = Math.max.apply(0, aa), vmin = Math.min.apply(0, vv), vmax = Math.max.apply(0, vv), lx = function (n) { return p.l + (Math.log(n) - Math.log(amin)) / (Math.log(amax) - Math.log(amin) || 1) * (w - p.l - p.r); }, ly = function (n) { return h - p.b - (Math.log(n) - Math.log(vmin)) / (Math.log(vmax) - Math.log(vmin) || 1) * (h - p.t - p.b); }, svg = svgNode('svg', { class: 'chart', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': 'Soundings chart' }); [0, 1, 2, 3].forEach(function (i) { var y = p.t + i * (h - p.t - p.b) / 3; svg.appendChild(svgNode('line', { class: 'grid', x1: p.l, y1: y, x2: w - p.r, y2: y })); }); svg.appendChild(svgNode('line', { class: 'axis', x1: p.l, y1: h - p.b, x2: w - p.r, y2: h - p.b })); var label = svgNode('text', { x: p.l, y: h - 8 }); label.textContent = 'age in days →'; svg.appendChild(label); rs.forEach(function (r) { var c = svgNode('circle', { class: 'point' + (r.watchlisted ? ' watch' : ''), cx: lx(Math.max(1, r.age_days == null ? 365 : r.age_days)), cy: ly(Math.max(1, r.tvl_usd)), r: Math.max(3, Math.min(11, Math.sqrt(r.implied_value_usd) / 1800)), tabindex: 0 }); c.appendChild(svgNode('title')); c.firstChild.textContent = r.name + ' · ' + usd(r.implied_value_usd); c.onclick = function () { open(r.slug); }; svg.appendChild(c); }); return node('section', { class: 'chartbox' }, node('div', { class: 'charthead' }, node('h2', { text: 'The soundings chart' }), node('span', { class: 'muted', text: 'log age × log TVL · ringed = watchlist' })), svg); }
  function controls() { function select(label, values, current, set) { var s = node('select', { 'aria-label': label }, node('option', { value: 'all', text: 'All ' + label.toLowerCase() })); values.forEach(function (v) { s.appendChild(node('option', { value: v, text: v })); }); s.value = current; s.onchange = function () { set(s.value); render(); }; return node('div', { class: 'field' }, node('label', { text: label }), s); } var q = node('input', { type: 'search', placeholder: 'Search name, category or chain', value: state.q }); q.oninput = function () { state.q = q.value; render(); }; return node('div', { class: 'controls' }, node('div', { class: 'field' }, node('label', { text: 'Search' }), q), select('Category', categories, state.category, function (v) { state.category = v; }), select('Chain', chains, state.chain, function (v) { state.chain = v; }), select('Confidence', ['high', 'medium', 'low'], state.confidence, function (v) { state.confidence = v; }), node('label', { class: 'toggle' }, node('input', { type: 'checkbox', checked: state.watch ? 'checked' : null, onchange: function () { state.watch = this.checked; render(); } }), ' Watchlist only'), node('span', { class: 'count', text: filtered().length + ' rows shown' })); }
  function badges(r) { var c = r.chains || [], b = c.slice(0, 3).map(function (v) { return node('span', { class: 'badge', text: v }); }); if (c.length > 3) b.push(node('span', { class: 'badge', text: '+' + (c.length - 3) })); return node('div', { class: 'badges' }, b); }
  function board() {
    var body = node('tbody'), rs = filtered();
    rs.forEach(function (r) { var tr = node('tr', { tabindex: 0, onclick: function () { open(r.slug); }, onkeydown: function (e) { if (e.key === 'Enter') open(r.slug); } }); [['Rank', r.rank], ['Protocol', node('div', { class: 'name' }, r.name, node('span', { class: 'category', text: r.category || 'Other' }))], ['Chains', badges(r)], ['TVL', usd(r.tvl_usd)], ['7d', node('span', { class: r.change_7d < 0 ? 'neg' : '', text: pct(r.change_7d) })], ['Age', age(r.age_days)], ['Signal', node('div', null, node('div', { class: 'bar' }, node('i', { style: 'width:' + r.signal + '%' })), node('span', { class: 'muted num', text: r.signal.toFixed(1) }))], ['Implied', usd(r.implied_value_usd)], ['Confidence', node('span', { class: 'confidence ' + r.confidence, text: r.confidence })]].forEach(function (c) { tr.appendChild(node('td', { 'data-label': c[0] }, c[1])); }); body.appendChild(tr); });
    if (!rs.length) return node('div', { class: 'panel empty' }, node('h2', { text: 'No soundings match' }));
    var heads = [['rank', 'Rank'], ['name', 'Name'], ['tvl', 'TVL'], ['momentum', '7d'], ['age', 'Age'], ['signal', 'Signal'], ['value', 'Implied value']], head = node('tr');
    heads.forEach(function (h) { head.appendChild(node('th', null, node('button', { text: h[1], onclick: function () { if (state.sort === h[0]) state.dir = -state.dir; else { state.sort = h[0]; state.dir = h[0] === 'name' || h[0] === 'age' ? 1 : -1; } render(); } }))); }); head.appendChild(node('th', { text: 'Confidence' }));
    return node('section', { class: 'panel table-wrap' }, node('table', null, node('thead', null, head), body));
  }
  function live() { var body = node('tbody'); D.live.forEach(function (r) { body.appendChild(node('tr', null, node('td', { text: r.name }), node('td', { class: 'num', text: usd(r.tvl_usd) }), node('td', { class: 'num ' + (r.change_7d < 0 ? 'neg' : ''), text: pct(r.change_7d) }), node('td', { class: 'num', text: usd(r.mcap_usd) }), node('td', { text: r.symbol || 'token' }))); }); return node('section', { class: 'live' }, node('h2', { text: 'Live-token set aside' }), node('p', { class: 'muted', text: 'These protocols already have token records and remain outside the pre-token ranking.' }), node('div', { class: 'panel table-wrap' }, node('table', null, node('thead', null, node('tr', null, ['Protocol', 'TVL', '7d', 'Market cap', 'Token'].map(function (v) { return node('th', { text: v }); }))), body))); }
  function open(slug) { state.detail = D.rows.filter(function (r) { return r.slug === slug; })[0]; history.pushState({ slug: slug }, '', location.pathname + '#' + slug); render(); }
  function farmStep(s) { var match = s.match(/Cost:\s*(.*?)\.\s*Time:\s*(.*?)\.?\s*$/); return node('li', null, node('span', { text: s }), node('div', { class: 'step-meta' }, node('span', { class: 'chip', text: match ? 'cost ' + match[1] : 'cost stated in step' }), node('span', { class: 'chip', text: match ? 'time ' + match[2] : 'time stated in step' }))); }
  function detail(r) { var e = r.decomposition; return node('section', { class: 'panel detail' }, node('div', { class: 'detail-top' }, node('div', null, node('div', { class: 'eyebrow', text: 'Rank ' + r.rank + ' / ' + D.board_size }), node('h2', { text: r.name }), node('p', { class: 'muted', text: (r.category || 'Other') + ' · ' + (r.chains || []).join(', ') })), node('button', { class: 'close', text: 'Back to board', onclick: function () { history.back(); } })), node('div', { class: 'detail-section' }, node('h3', { text: 'Decomposition' }), node('div', { class: 'equation', html: '$' + e.base.toLocaleString() + ' × ' + e.momentum + ' × ' + e.ageMult + ' = <strong>$' + r.implied_value_usd.toLocaleString() + '</strong><br><span class="muted">base = TVL × ' + e.multiple + ' · momentum multiplier · age multiplier</span>' }), node('p', { class: 'muted', text: 'Signal ' + r.signal.toFixed(1) + ' · confidence ' + r.confidence + ' · ' + (r.watchlisted ? 'watchlist covered' : 'board radar') })), node('div', { class: 'detail-section' }, node('h3', { text: 'Farm plan' }), node('ol', { class: 'steps' }, r.farm_steps.map(farmStep)))); }
  function render() { app.textContent = ''; var content = state.detail ? detail(state.detail) : state.tab === 'live' ? live() : node('div', null, chart(), controls(), board()), tabs = node('div', { class: 'tabbar' }, node('button', { 'aria-selected': state.tab === 'board' ? 'true' : 'false', text: 'Pre-token board', onclick: function () { state.tab = 'board'; state.detail = null; render(); } }), node('button', { 'aria-selected': state.tab === 'live' ? 'true' : 'false', text: 'Live-token set aside', onclick: function () { state.tab = 'live'; state.detail = null; render(); } })); app.appendChild(node('div', { class: 'shell' }, masthead(), formula(), tabs, content)); app.setAttribute('aria-busy', 'false'); }
  window.onpopstate = function () { state.detail = null; render(); }; document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.detail) history.back(); }); render();
}());
