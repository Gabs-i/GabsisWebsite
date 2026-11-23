/* Umriss-Tagesrunde (Welt und USA): Tageskarte, 5 Runden, Ergebnis, „Weiter spielen“.
   Wird von welt.html und usa.html mit UmrissTag.init(cfg) gestartet. Daten liegen in daten/*.js. */
(function () {
  'use strict';
  var CATS = ['G', 'H', 'K', 'S', 'R', 'L', 'W', 'T'];
  var CATN = { G: 'Geografie', H: 'Geschichte', K: 'Essen & Kultur', S: 'Sport', R: 'Rekorde', L: 'Sprache', W: 'Wirtschaft', T: 'Tiere & Natur' };
  var SQN = ['Land', 'Hauptstadt', 'Lage', 'Bild', 'Frage', 'Flagge'];
  var EMO = { ok: '🟩', near: '🟧', far: '🟥', skip: '⬜' };
  var STEPN = ['Umriss', 'Lage der Hauptstadt', 'Bilderfrage', 'Zufallsfrage', 'Flagge'];
  var PIC = ['vogel', 'baum', 'blume', 'tier']; /* Fragearten mit Fotos von Wikipedia */

  var CSS = '\
.tr{--ink:#3d405b;--muted:#7b7d93;--green:#81b29a;--ok:#5fae84;--near:#f59a2f;--far:#d6574a;--line:rgba(61,64,91,.12);--soft:#faf9f4;font-family:Inter,system-ui,sans-serif;color:var(--ink);text-align:left}\
.tr *{box-sizing:border-box}\
.tr .hidden{display:none!important}\
.tr-card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04);width:100%}\
.tr-daily{display:flex;align-items:center;gap:12px;margin-bottom:12px}\
.tr-daily .tx{flex:1;min-width:0}\
.tr-tag{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#e07a5f;margin-bottom:2px}\
.tr-daily b{display:block;font-size:17px;font-weight:900;letter-spacing:-.01em;line-height:1.2}\
.tr-daily small{display:block;font-size:13px;color:var(--muted);font-weight:600;margin-top:2px}\
.tr-daily .sqs{display:flex;gap:3px;margin-top:5px}\
.tr-btn{border:0;border-radius:12px!important;padding:12px 16px;font:800 15px Inter,system-ui,sans-serif;background:var(--ink)!important;color:#fff!important;cursor:pointer;white-space:nowrap}\
.tr-btn:hover{opacity:.92}\
.tr-btn.green{background:var(--green)!important}\
.tr-btn.soft{background:#e2dec9!important;color:var(--ink)!important}\
.tr-btn.wide{display:block;width:100%}\
.tr-btn:disabled{opacity:.45;cursor:default}\
.tr-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px}\
.tr-bar select{flex:1 1 120px;font:700 14px Inter,system-ui,sans-serif!important;color:var(--ink)!important;background:#fff!important;border:1px solid var(--line)!important;border-radius:12px!important;padding:10px 10px!important;min-width:0;cursor:pointer}\
.tr-game{margin-bottom:12px}\
.tr-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}\
.tr-head .tr-tag{margin:0;white-space:nowrap}\
.tr-back{white-space:nowrap;display:inline-flex;align-items:center;border:1px solid var(--line);background:#fff;border-radius:999px;padding:6px 12px 6px 9px;font:700 14px Inter,system-ui,sans-serif;color:var(--ink);cursor:pointer}\
.tr-head .sqs{display:flex;gap:4px;margin-left:auto}\
.tr-sq{display:inline-block;width:14px;height:14px;border-radius:4px;background:#e5e2d3}\
.tr-sq.ok{background:var(--ok)}.tr-sq.near{background:var(--near)}.tr-sq.far{background:var(--far)}.tr-sq.skip{background:#cfccbd}\
.tr-sq.cur{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--ink)}\
.tr-step{font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}\
.tr-q{font-size:21px;font-weight:900;letter-spacing:-.02em;line-height:1.25;margin:2px 0 12px}\
.tr-map{position:relative;height:250px;background:#faf9f4;border:1px solid var(--line);border-radius:14px;overflow:hidden;margin-bottom:12px;touch-action:manipulation}\
.tr-map svg{display:block;width:100%;height:100%}\
@media(max-width:520px){.tr-map{height:210px}.tr-map.big{height:250px!important}.tr-q{font-size:19px;margin-bottom:10px}}\
.tr-map .shape{fill:#81b29a;stroke:#4a3a2a;stroke-linejoin:round}\
/* Punkte wie im Welt-Städte-Pin: dunkel mit weißem Rand; eigener falscher Tipp orange, richtige Stadt grün */\
.tr-map .pt{fill:#3d405b;stroke:#fff;stroke-width:2px;transition:fill .2s}\
.tr-map .pt.bad{fill:#e07a5f}\
.tr-map .pt.good{fill:var(--ok)}\
.tr-map .pt.show{fill:var(--ok);animation:trpulse .9s ease-in-out 3}\
@keyframes trpulse{50%{stroke-width:5px}}\
.tr-map .hit{fill:transparent;cursor:pointer}\
.tr-map .lbl{font:700 12px Inter,system-ui,sans-serif;fill:#3d405b;paint-order:stroke;stroke:#fff;stroke-width:3.5px;stroke-linejoin:round;pointer-events:none}\
.tr-map .lbl.cap{font-weight:900}\
.tr-fields{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}\
@media(max-width:520px){.tr-fields{grid-template-columns:1fr}}\
.tr-f{position:relative}\
.tr-f label{display:block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:4px}\
.tr input.tr-in{width:100%;font:600 16px Inter,system-ui,sans-serif!important;padding:12px 14px!important;border-radius:12px!important;border:2px solid #e5e2d3!important;background:#faf9f4!important;color:var(--ink)!important;outline:none;text-align:left}\
.tr input.tr-in:focus{border-color:var(--green)!important}\
.tr input.tr-in.bad{border-color:var(--far)!important;background:#fbeeec!important}\
.tr input.tr-in.good{border-color:var(--ok)!important;background:#edf6f0!important}\
.tr input.tr-in.near{border-color:var(--near)!important;background:#fdf1e3!important}\
.tr input.tr-in:disabled{opacity:1}\
.tr-hist{font-size:14px;font-weight:700;color:var(--ink)}\
.tr-hist div{display:flex;gap:6px;align-items:baseline;margin-top:2px}\
.tr-hist .x{color:var(--far)}\
.tr-hist b{margin-left:auto;font-weight:800;white-space:nowrap}\
.tr-hist small{color:var(--muted);font-weight:600}\
.tr-f .note{font-size:12px;font-weight:700;margin-top:3px;min-height:16px;color:var(--far)}\
.tr-sug{list-style:none;margin:0;padding:4px;position:absolute;left:0;right:0;top:calc(100% - 14px);z-index:20;background:#fff;border-radius:12px;box-shadow:0 12px 28px rgba(61,64,91,.25);max-height:180px;overflow:auto}\
.tr-sug:empty{display:none}\
.tr-sug li{padding:10px 12px;border-radius:8px;cursor:pointer;font-weight:600}\
.tr-sug li.act,.tr-sug li:hover{background:rgba(129,178,154,.2)}\
.tr-row{display:flex;gap:8px}\
.tr-row .tr-btn{flex:1}\
.tr-opts{display:grid;gap:8px}\
.tr-opts.two{grid-template-columns:1fr 1fr}\
.tr-opt{width:100%;text-align:left;border:2px solid #e5e2d3;background:#faf9f4;border-radius:12px;padding:12px 14px;font:600 15px/1.4 Inter,system-ui,sans-serif;color:var(--ink);cursor:pointer}\
.tr-opts.two .tr-opt{text-align:center;font-weight:700}\
.tr-opt:hover:not(:disabled){border-color:var(--green)}\
.tr-opt:disabled{cursor:default}\
.tr-opt.good{border-color:var(--ok);background:#edf6f0}\
.tr-opt.bad{border-color:var(--far);background:#fbeeec}\
.tr-opt.dim{opacity:.55}\
.tr-flags{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\
.tr-flag{min-width:0;border:2px solid #e5e2d3;background:#faf9f4;border-radius:10px;padding:5px 5px 3px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;font:inherit}\
.tr-flag .fi{width:100%;aspect-ratio:4/3;display:grid;place-items:center}\
.tr-flag img{max-width:100%;max-height:100%;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.08)}\
.tr-flag.good{border-color:var(--ok);background:#edf6f0;box-shadow:0 0 0 2px var(--ok)}\
.tr-flag.bad{border-color:var(--far);background:#fbeeec}\
.tr-flag.bad img{opacity:.45}\
.tr-flag:disabled{cursor:default}\
.tr-flag span{display:block;width:100%;min-height:15px;font-size:11px;line-height:15px;font-weight:700;text-align:center;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\
.tr-fb{margin-top:12px;border-radius:12px;padding:11px 13px;font-weight:700;font-size:15px;line-height:1.4}\
.tr-fb:empty{display:none}\
.tr-fb.ok{background:#edf6f0;color:#2f7a55}.tr-fb.near{background:#fdf1e3;color:#9a5a12}.tr-fb.far{background:#fbeeec;color:#a3402f}.tr-fb.info{background:#f3f1e6;color:var(--ink)}\
.tr-next{margin-top:12px}\
.tr-res h2{font-size:24px;font-weight:900;letter-spacing:-.02em;margin:2px 0 4px}\
.tr-res .score{font-size:15px;font-weight:700;color:var(--muted);margin-bottom:12px}\
.tr-res .score b{color:var(--ink)}\
.tr-list{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;margin:0 0 14px;padding:0;list-style:none}\
.tr-list li{display:flex;align-items:center;gap:8px;font-weight:700;font-size:14px}\
.tr-list .tr-sq{width:20px;height:20px;border-radius:5px;flex:none}\
.tr-end{display:grid;grid-template-columns:1fr 1fr;gap:8px}\
.tr-end .full{grid-column:1/-1}\
.tr-copied{font-size:13px;color:var(--ok);text-align:center;margin-top:6px;min-height:18px;font-weight:700}\
.tr-wait{display:grid;place-items:center;height:100%;color:var(--muted);font-weight:700}\
.tr-give{margin-top:14px}\
.tr-grows{display:grid;gap:4px;margin:4px 0 10px}\
.tr-grow{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(0,1.05fr) 38px 52px;gap:4px;font:700 13px/1.1 Inter,system-ui,sans-serif;color:#3d405b}\
.tr-grow>span{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:4px;text-align:center;height:30px;padding:0 8px;border:1.5px solid #ddd8c4;background:#faf9f4;border-radius:999px;min-width:0;font-variant-numeric:tabular-nums;white-space:nowrap}\
.tr-grow>span:first-child{overflow:hidden}\
.tr-grow b{display:block;min-width:0;flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:800}\
.tr-grow small{display:block;min-width:0;flex:0 10 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:700}\
.tr-grow small.y{color:#2f7a55}.tr-grow small.n{color:#c25a3f;text-decoration:line-through}\
.tr-grow .ar{font-size:16px;padding:0}\
.tr-grow>span:not(:first-child){white-space:nowrap}\
.tr-hist .tr-grows{display:grid!important;margin-top:6px}\
.tr-hist .tr-grow{display:grid!important;align-items:stretch;margin:0}\
.tr-hist .tr-grow b{margin:0;white-space:nowrap}\
.tr-grow.ok>span{border-color:#5fae84;background:#edf6f0}\
.tr-grow.far .pc{color:#a3402f}.tr-grow.mid .pc{color:#9a5a12}.tr-grow.near .pc{color:#2f7a55}\
.tr-bar.tr-bar-in{display:block;margin:-6px 0 18px;text-align:left}\
.tr-bar-l{display:block;font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:rgba(61,64,91,.7);margin:0 0 4px 2px}\
.tr-bar.tr-bar-in select{width:100%;background:#faf9f4!important}\
.tr-more{margin-top:10px;width:100%;border:0;border-radius:12px;padding:14px;font:800 16px Inter,system-ui,sans-serif;background:#81b29a;color:#fff;cursor:pointer;box-shadow:0 4px 10px -4px rgba(61,64,91,.35)}\
.tr-more:hover{opacity:.92}\
.tr-flags{grid-template-columns:1fr 1fr!important;gap:10px!important}\
.tr-flag{position:relative;padding:12px 10px 6px!important;border-radius:14px!important}\
.tr-flag .fi{aspect-ratio:1/1!important;width:100%;display:flex!important;align-items:center;justify-content:center;overflow:hidden}\
.tr-flag .fi img{max-width:100%!important;max-height:100%!important;width:auto;height:auto}\
.tr-flag span{font-size:13px!important;line-height:18px!important;min-height:18px!important}\
.tr-flag .tr-zoom{position:absolute;top:6px;right:6px;width:34px;height:34px;border-radius:9px;border:0;background:rgba(255,255,255,.95);box-shadow:0 1px 4px rgba(0,0,0,.25);display:grid;place-items:center;cursor:zoom-in;padding:0;z-index:2}\
.tr-zoom svg{width:18px;height:18px;fill:none;stroke:#3d405b;stroke-width:2.4;stroke-linecap:round}\
.tr-lb{position:fixed;inset:0;z-index:1000;background:rgba(29,31,48,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;cursor:zoom-out}\
.tr-lb img{max-width:94vw;max-height:72vh;display:block;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.5)}\
.tr-lb span{color:#fff;font:700 14px Inter,system-ui,sans-serif;opacity:.85}\
.tr-opt .pic{position:relative;display:block;width:100%;aspect-ratio:4/3;border-radius:8px;background:#ece8d8 center/cover no-repeat;margin-bottom:8px}\
.tr-opt .pic .tr-zoom{position:absolute;top:5px;right:5px;width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.95);box-shadow:0 1px 4px rgba(0,0,0,.25);display:grid;place-items:center;cursor:zoom-in}\
.tr-opt .pic .tr-zoom.hidden{display:none}\
.tr-opt .pic .tr-zoom svg{width:16px;height:16px;fill:none;stroke:#3d405b;stroke-width:2.4;stroke-linecap:round}\
.tr-opt .pic.none{display:none}\
.tr-credit{font-size:11px;color:var(--muted);margin-top:8px;text-align:left}\
.tr-credit a{color:inherit}\
';

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim(); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffle(a, rnd) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a, rnd) { return a[Math.floor(rnd() * a.length)]; }

  /* ---------- Tag nach Europe/Vienna ---------- */
  function todayKey() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  }
  function keyToUTC(k) { var p = k.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function dayNum(k) { return Math.round((keyToUTC(k) - Date.UTC(2026, 0, 1)) / 864e5); }
  function shiftKey(k, n) { var d = new Date(keyToUTC(k) + n * 864e5); return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + d.getUTCDate()).slice(-2); }
  var MON = ['Jän.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
  function fmtShort(k) { var p = k.split('-'); return (+p[2]) + '. ' + MON[+p[1] - 1]; }
  function fmtLong(k) { var p = k.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }

  var C = null; /* Konfiguration */
  var G = null; /* laufendes Spiel */
  var IDX = {}; /* id -> Eintrag */

  function sqName(i) { return i === 0 && C.us ? 'Staat' : SQN[i]; }
  /* Richtung und Entfernung von einem getippten Land zum gesuchten (Mittelpunkt zu Mittelpunkt, wie bei Worldle) */
  var ARROWS = ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'];
  function hint(from, to) {
    if (!from || !to || from === to || !from.mitte || !to.mitte) return null;
    return hintPos(from.mitte, to.mitte);
  }
  function hintPos(a, c) {
    if (!a || !c) return null;
    var R = Math.PI / 180, la1 = a[0] * R, la2 = c[0] * R, dl = (c[1] - a[1]) * R;
    var d = 2 * 6371 * Math.asin(Math.sqrt(Math.pow(Math.sin((la2 - la1) / 2), 2) + Math.cos(la1) * Math.cos(la2) * Math.pow(Math.sin(dl / 2), 2)));
    var b = Math.atan2(Math.sin(dl) * Math.cos(la2), Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dl)) / R;
    var km = d < 100 ? Math.round(d / 5) * 5 : Math.round(d / 10) * 10;
    return { km: km, arrow: ARROWS[Math.round(((b + 360) % 360) / 45) % 8], text: km.toLocaleString('de-DE') + ' km ' + ARROWS[Math.round(((b + 360) % 360) / 45) % 8] };
  }
  /* Versuchszeile wie bei Worldle: Name | km | Richtung | Nähe in % */
  function guessRow(guessName, target, ok, cap, capOk) {
    var o = byName(guessName), row = el('div', 'tr-grow'), km = '–', ar = '', pc = '';
    if (ok) { km = '0 km'; ar = '🎉'; pc = '100 %'; row.classList.add('ok'); }
    else if (o && target) {
      var h = hint(o, target);
      if (h) {
        var maxD = C.us ? 5000 : 20000, p = Math.max(0, Math.min(99, Math.round(100 * (1 - h.km / maxD))));
        km = h.km.toLocaleString('de-DE') + ' km'; ar = h.arrow; pc = p + ' %';
        row.classList.add(p >= 85 ? 'near' : p >= 60 ? 'mid' : 'far');
      }
    }
    var nm = el('span'), b = el('b'); b.textContent = o ? o.name : (guessName || '?'); nm.appendChild(b);
    if (cap) { var sm = el('small', capOk ? 'y' : 'n'); sm.textContent = cap; nm.appendChild(sm); }
    row.appendChild(nm); row.appendChild(el('span', null, esc(km))); row.appendChild(el('span', 'ar', ar)); row.appendChild(el('span', 'pc', pc));
    return row;
  }
  /* Hauptstadt-Versuch: getippte Hauptstadt → gesuchte Hauptstadt */
  function byCap(v) {
    var n = norm(v); if (!n) return null;
    for (var i = 0; i < C.items.length; i++) { var it = C.items[i]; if ([it.hs].concat(it.hsAlt || []).some(function (a) { return norm(a) === n; })) return it; }
    return null;
  }
  function capRow(guess, target) {
    var o = byCap(guess), row = el('div', 'tr-grow'), km = '–', ar = '', pc = '';
    var h = o && target && o !== target ? hintPos(o.hsPos, target.hsPos) : null;
    if (h) {
      var maxD = C.us ? 5000 : 20000, p = Math.max(0, Math.min(99, Math.round(100 * (1 - h.km / maxD))));
      km = h.km.toLocaleString('de-DE') + ' km'; ar = h.arrow; pc = p + ' %';
      row.classList.add(p >= 85 ? 'near' : p >= 60 ? 'mid' : 'far');
    }
    var nm = el('span'), b = el('b'); b.textContent = o ? o.hs : (guess || '?'); nm.appendChild(b);
    var sm = el('small'); sm.style.color = '#7b7d93'; sm.textContent = o ? o.name : 'unbekannt'; nm.appendChild(sm);
    row.appendChild(nm); row.appendChild(el('span', null, esc(km))); row.appendChild(el('span', 'ar', ar)); row.appendChild(el('span', 'pc', pc));
    return row;
  }
  function byName(v) {
    var n = norm(v); if (!n) return null;
    for (var i = 0; i < C.items.length; i++) { var it = C.items[i]; if ([it.name, it.topo].concat(it.alias || []).some(function (a) { return norm(a) === n; })) return it; }
    return null;
  }
  function idOf(it) { return it.iso || it.ab; }
  function lowerIn(it) { return it['in'].charAt(0).toLowerCase() + it['in'].slice(1); }
  function groupOf(it) { return C.us ? [it.region] : it.kont; }
  function sameGroup(a, b) { var ga = groupOf(a), gb = groupOf(b); return ga.some(function (g) { return gb.indexOf(g) >= 0; }); }

  /* ---------- Reihenfolge: feste, gemischte Liste, die zyklisch durchlaufen wird ---------- */
  function dailyItem(k) {
    var ids = C.items.map(idOf).sort();
    var order = shuffle(ids, mulberry32(hashStr(C.key + ':reihenfolge:v1')));
    var n = order.length, i = ((dayNum(k) % n) + n) % n;
    return IDX[order[i]];
  }

  /* ---------- Inhalte der Runden erzeugen ---------- */
  function makeRound(it, rnd, k) {
    var R = { id: idOf(it) };
    /* Runde 3: Bilderfrage (Vogel, Baum, Blume, Tier) mit Fotos */
    R.bild = makeQuestion(it, rnd, function (k) { return PIC.indexOf(k) >= 0; });
    /* Runde 4: Zufallsfrage aus den übrigen Fragearten */
    R.frage = makeQuestion(it, rnd, function (k) { return PIC.indexOf(k) < 0; }) ||
      makeQuestion(it, rnd, function (k) { return !R.bild || k !== R.bild.kind; });
    /* ohne Tier/Blume/Vogel/Baum: Runde 3 wird eine zweite Textfrage einer anderen Art */
    if (!R.bild) R.bild = makeQuestion(it, rnd, function (k) { return PIC.indexOf(k) < 0 && (!R.frage || k !== R.frage.kind); });
    /* Runde 5: Flaggen */
    var nb = shuffle((it.nb || []).filter(function (x) { return IDX[x] && C.flaggen.datei[x]; }), rnd).slice(0, 3);
    var others = C.items.filter(function (o) { return o !== it && nb.indexOf(idOf(o)) < 0; });
    var same = shuffle(others.filter(function (o) { return sameGroup(o, it); }), rnd).slice(0, Math.max(0, 3 - nb.length)).map(idOf);
    var rest = same.concat(shuffle(others.map(idOf).filter(function (x) { return same.indexOf(x) < 0; }), rnd));
    var fl = shuffle([R.id].concat(nb, rest.slice(0, 5 - nb.length)), rnd);
    R.flags = { opts: fl, right: fl.indexOf(R.id) };
    /* Runde 2: Städte – Reihenfolge der Punkte */
    R.pts = shuffle([[it.hs, it.hsPos[0], it.hsPos[1], 1]].concat(it.staedte.map(function (s) { return [s[0], s[1], s[2], 0]; })), rnd);
    return R;
  }

  function makeQuestion(it, rnd, only) {
    var M = C.merkmale, id = idOf(it), kinds = [];
    Object.keys(C.fragen).forEach(function (k) { if (only && !only(k)) return; if (M[k] && M[k][id] && (!Array.isArray(M[k][id]) || M[k][id].length)) kinds.push(k); });
    if (!kinds.length) return null;
    var kind = pick(kinds, rnd), right, others = [];
    var val = M[kind][id];
    if (Array.isArray(val)) {
      right = pick(val, rnd);
      var seen = {}; val.forEach(function (v) { seen[norm(v)] = 1; });
      var near = [], far = [];
      C.items.forEach(function (o) {
        var v = M[kind][idOf(o)]; if (!v) return;
        v.forEach(function (x) { if (!seen[norm(x)]) { (sameGroup(o, it) ? near : far).push(x); } });
      });
      others = [near, far];
    } else {
      right = val;
      var nr = [], fr = [];
      C.items.forEach(function (o) {
        if (o === it) return;
        var v = M[kind][idOf(o)]; if (!v) return;
        if (kind === 'abk') (v.charAt(0) === id.charAt(0) || v.charAt(1) === id.charAt(1) ? nr : fr).push(v);
        else (sameGroup(o, it) ? nr : fr).push(v);
      });
      others = [nr, fr];
    }
    var nR = norm(right), wrong = [];
    others.forEach(function (p) {
      shuffle(p, rnd).forEach(function (x) {
        var n = norm(x);
        if (wrong.length >= 3 || !n || n === nR || n.indexOf(nR) >= 0 || nR.indexOf(n) >= 0) return;
        if (wrong.some(function (w) { return norm(w) === n; })) return;
        wrong.push(x);
      });
    });
    var opts = shuffle([right].concat(wrong), rnd);
    return { kind: kind, q: C.fragen[kind](it), opts: opts, right: opts.indexOf(right) };
  }

  /* ---------- Spielstand ---------- */
  function newGame(mode, it, k) {
    var rnd = k ? mulberry32(hashStr(C.key + ':' + k)) : Math.random;
    return { mode: mode, key: k || null, id: idOf(it), step: 0, res: [null, null, null, null, null, null], part: {}, R: makeRound(it, rnd, k) };
  }
  function save() { if (G && G.mode === 'daily') store.set(C.key + 'Daily', G); }
  function hist() { return store.get(C.key + 'Hist', {}); }
  function record() {
    var h = hist(); if (h[G.key]) return;
    h[G.key] = { id: G.id, res: G.res.join(','), pts: points(G.res) };
    store.set(C.key + 'Hist', h);
  }
  function points(res) {
    var p = 0, m = 0;
    res.forEach(function (r) { if (r === 'skip' || r == null) return; m++; if (r === 'ok') p += 1; else if (r === 'near') p += .5; });
    return [p, m];
  }
  function fmtPts(p) { return String(p).replace('.', ','); }
  function streak() {
    var h = hist(), k = todayKey(), n = 0;
    if (!h[k]) k = shiftKey(k, -1);
    while (h[k]) { n++; k = shiftKey(k, -1); }
    return n;
  }

  /* ---------- Ansichten ---------- */
  var V = {};
  function setView(v) {
    V.view = v;
    var playingDaily = v === 'daily';
    V.daily.classList.toggle('hidden', playingDaily);
    V.bar.classList.toggle('hidden', playingDaily);
    V.game.classList.toggle('hidden', v === 'outline');
    C.outline.classList.toggle('hidden', v !== 'outline');
  }

  function renderDaily() {
    var k = todayKey(), h = hist(), done = h[k], st = store.get(C.key + 'Daily', null);
    var started = st && st.key === k && !done;
    var s = streak(), sqs = '';
    if (done) sqs = '<div class="sqs">' + done.res.split(',').map(function (r) { return '<i class="tr-sq ' + r + '"></i>'; }).join('') + '</div>';
    var sub = done ? 'Heute: ' + fmtPts(done.pts[0]) + ' von ' + done.pts[1] + ' Punkten · ' + esc(IDX[done.id] ? IDX[done.id].name : '')
      : started ? 'Angefangen – Runde ' + (st.step + 1) + ' von 5' : '5 Runden zu einem ' + (C.us ? 'Bundesstaat' : 'Land');
    if (s) sub += ' · 🔥 ' + s + (s === 1 ? ' Tag' : ' Tage');
    V.daily.innerHTML = '<div class="tx"><span class="tr-tag">Tagesrunde · ' + fmtShort(k) + '</span><b>' + (C.us ? 'Staat' : 'Land') + ' des Tages</b><small>' + sub + '</small>' + sqs + '</div>';
    var b = el('button', 'tr-btn' + (done ? ' soft' : ''), done ? 'Ergebnis' : started ? 'Weiter' : 'Spielen');
    b.onclick = startDaily;
    V.daily.appendChild(b);
  }

  function startDaily() {
    var k = todayKey(), st = store.get(C.key + 'Daily', null);
    if (st && st.key === k && IDX[st.id]) G = st;
    else { G = newGame('daily', dailyItem(k), k); save(); }
    setView('daily');
    if (hist()[k] || G.step >= 5) { G.step = 5; showResult(); } else renderStep();
    scrollTop();
  }
  function startFree() {
    var pool = C.items.filter(inFilter); if (!pool.length) pool = C.items;
    var last = G && G.mode === 'free' ? G.id : null;
    var p2 = pool.filter(function (x) { return idOf(x) !== last; }); if (p2.length) pool = p2;
    var recent = store.get(C.key + 'Recent', []);
    var p3 = pool.filter(function (x) { return recent.indexOf(idOf(x)) < 0; }); if (p3.length) pool = p3;
    var it = pool[Math.floor(Math.random() * pool.length)];
    store.set(C.key + 'Recent', recent.concat([idOf(it)]).slice(-Math.min(40, Math.floor(C.items.length * .6))));
    G = newGame('free', it, null);
    setView('free');
    renderStep();
  }
  function scrollTop() { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); } }

  function header() {
    var h = el('div', 'tr-head');
    var b = el('button', 'tr-back', '‹ Zurück'); b.onclick = function () { setView('outline'); renderDaily(); scrollTop(); };
    h.appendChild(b);
    h.appendChild(el('span', 'tr-tag', G.mode === 'daily' ? 'Tagesrunde' : 'Weiter spielen'));
    var sq = el('div', 'sqs'), cur = G.step === 0 ? [0, 1] : G.step < 5 ? [G.step + 1] : [];
    G.res.forEach(function (r, i) { var s = el('i', 'tr-sq' + (r ? ' ' + r : '') + (cur.indexOf(i) >= 0 ? ' cur' : '')); s.title = sqName(i); sq.appendChild(s); });
    h.appendChild(sq);
    return h;
  }

  function frame(q) {
    V.game.innerHTML = '';
    V.game.appendChild(header());
    V.game.appendChild(el('div', 'tr-step', 'Runde ' + (G.step + 1) + ' von 5 · ' + STEPN[G.step]));
    V.game.appendChild(el('h2', 'tr-q', q));
    var body = el('div'); V.game.appendChild(body);
    var fb = el('div', 'tr-fb'); V.game.appendChild(fb);
    var nx = el('button', 'tr-btn wide tr-next hidden', G.step < 4 ? 'Weiter' : 'Zum Ergebnis'); V.game.appendChild(nx);
    nx.onclick = function () { G.step++; save(); if (G.step >= 5) finish(); else renderStep(); };
    return { body: body, fb: fb, next: nx };
  }
  /* Bild groß anzeigen (Flaggen, Blumen); Tippen schließt */
  function lightbox(src, cap) {
    var lb = el('div', 'tr-lb'), im = el('img'); im.src = src; im.alt = cap || '';
    lb.appendChild(im); lb.appendChild(el('span', null, esc(cap || '') + ' · Tippen zum Schließen'));
    var close = function () { lb.remove(); document.removeEventListener('keydown', key); };
    var key = function (e) { if (e.key === 'Escape') close(); };
    lb.onclick = close; document.addEventListener('keydown', key); document.body.appendChild(lb);
  }

  /* ---------- Bilder von Wikipedia (State Flower / Nationalblume) ---------- */
  var WIKI = {
    'Kamelie': 'Camellia', 'Vergissmeinnicht': 'Myosotis', 'Saguaro-Blüte': 'Saguaro', 'Apfelblüte': ['Apple blossom', 'Malus'],
    'Kalifornischer Mohn': 'Eschscholzia californica', 'Rocky-Mountain-Akelei': 'Aquilegia coerulea', 'Berglorbeer': 'Kalmia latifolia',
    'Pfirsichblüte': ['Peach blossom', 'Prunus persica'], 'Orangenblüte': ['Orange blossom', 'Orange (fruit)'], 'Cherokee-Rose': 'Rosa laevigata',
    'Gelber Hibiskus': 'Hibiscus brackenridgei', 'Pfeifenstrauch': 'Philadelphus lewisii', 'Veilchen': 'Viola sororia', 'Pfingstrose': 'Paeonia',
    'Wildrose': ['Rosa arkansana', 'Rosa blanda'], 'Sonnenblume': 'Helianthus annuus', 'Goldrute': 'Solidago', 'Magnolie': 'Magnolia grandiflora',
    'Kiefernzapfen und -quaste': 'Pinus strobus', 'Schwarzäugige Susanne': 'Rudbeckia hirta', 'Mayflower': 'Epigaea repens',
    'Frauenschuh': 'Cypripedium reginae', 'Weißdorn': 'Crataegus', 'Bitterroot': 'Lewisia rediviva', 'Beifuß': 'Artemisia tridentata',
    'Flieder': 'Syringa vulgaris', 'Yucca': 'Yucca', 'Rose': 'Rose', 'Blüten-Hartriegel': 'Cornus florida', 'Rote Nelke': 'Dianthus caryophyllus',
    'Mahonie': 'Mahonia aquifolium', 'Gelber Jasmin': 'Gelsemium sempervirens', 'Küchenschelle': 'Pulsatilla patens', 'Iris': 'Iris (plant)',
    'Texas-Lupine': 'Lupinus texensis', 'Mormonentulpe': 'Calochortus nuttallii', 'Rotklee': 'Trifolium pratense',
    'Pazifischer Rhododendron': 'Rhododendron macrophyllum', 'Rhododendron': 'Rhododendron', 'Kastilleja': 'Castilleja linariifolia',
    'Flor de Maga': 'Thespesia grandiflora', 'Bougainvillea': 'Bougainvillea', 'Gelbe Trompetenblume': 'Tecoma stans', 'Plumeria': 'Plumeria',
    'Edelweiß': 'Leontopodium nivale', 'Tulpe': 'Tulip', 'Kirschblüte': 'Cherry blossom', 'Lotus': 'Nelumbo nucifera', 'Kornblume': 'Centaurea cyanus',
    'Nelke': 'Dianthus caryophyllus', 'Maiglöckchen': 'Convallaria majalis', 'Moosglöckchen': 'Linnaea borealis', 'Heidekraut': 'Calluna vulgaris',
    'Margerite': 'Leucanthemum vulgare', 'Kleeblatt': 'Shamrock', 'Dahlie': 'Dahlia', 'Ceibo': 'Erythrina crista-galli', 'Copihue': 'Lapageria',
    'Cantuta': 'Cantua buxifolia', 'Orchidee': 'Orchidaceae', 'Hibiskus (Mugunghwa)': 'Hibiscus syriacus', 'Hibiskus': 'Hibiscus',
    'Röhrenkassie': 'Cassia fistula', 'Jasmin': 'Jasmine', 'Sampaguita-Jasmin': 'Jasminum sambac', 'Seerose': 'Nymphaea',
    'Blaue Seerose': 'Nymphaea caerulea', 'Goldakazie': 'Acacia pycnantha', 'Königsprotea': 'Protea cynaroides', 'Anemone': 'Anemone coronaria',
    'Raute': 'Ruta graveolens', 'Silberwurz': 'Dryas octopetala', 'Weiße Schmetterlingsblume': 'Hedychium coronarium',
    'Lignum vitae': 'Guaiacum officinale', 'Passionsblume': 'Passiflora', 'Weiße Nonne (Orchidee)': 'Lycaste skinneri',
    'Guaria Morada (Orchidee)': 'Guarianthe skinneri', 'Heilig-Geist-Orchidee': 'Peristeria elata', 'Kalla': 'Zantedeschia aethiopica',
    'Stolz von Barbados': 'Caesalpinia pulcherrima', 'Bwa Kwaib': 'Sabinea carinalis', 'Orchidee (Vanda Miss Joaquim)': 'Papilionanthe Miss Joaquim',
    'Maltesische Flockenblume': 'Cheirolophus crassifolius',
    'Goldspecht': 'Northern flicker',
    'Moorschneehuhn': 'Willow ptarmigan',
    'Kaktuszaunkönig': 'Cactus wren',
    'Spottdrossel': 'Northern mockingbird',
    'Schopfwachtel': 'California quail',
    'Lerchenammer': 'Lark bunting',
    'Wanderdrossel': 'American robin',
    'Blue-Hen-Huhn': ['Blue Hen chicken', 'Delaware Blue Hen'],
    'Rote Spottdrossel': 'Brown thrasher',
    'Hawaiigans (Nene)': 'Nene (bird)',
    'Berghüttensänger': 'Mountain bluebird',
    'Rotkardinal': 'Northern cardinal',
    'Goldzeisig': 'American goldfinch',
    'Wiesenstärling': 'Western meadowlark',
    'Brauner Pelikan': 'Brown pelican',
    'Schwarzkopfmeise': 'Black-capped chickadee',
    'Baltimoretrupial': 'Baltimore oriole',
    'Eistaucher': 'Common loon',
    'Rotkehl-Hüttensänger': 'Eastern bluebird',
    'Purpurgimpel': 'Purple finch',
    'Rennkuckuck': 'Greater roadrunner',
    'Scherenschwanz-Tyrann': 'Scissor-tailed flycatcher',
    'Kragenhuhn': 'Ruffed grouse',
    'Rhode-Island-Red-Huhn': 'Rhode Island Red',
    'Carolinazaunkönig': 'Carolina wren',
    'Jagdfasan': 'Common pheasant',
    'Kalifornienmöwe': 'California gull',
    'Einsiedlerdrossel': 'Hermit thrush',
    'Puerto-Rico-Spindalis': 'Puerto Rican spindalis',
    'Guamralle (Koʻkoʻ)': 'Guam rail',
    'Zuckervogel': 'Bananaquit',
    'Marianen-Fruchttaube': 'Mariana fruit dove',
    'Sumpfkiefer': 'Pinus palustris',
    'Sitka-Fichte': 'Sitka spruce',
    'Palo Verde': ['Parkinsonia florida', 'Parkinsonia'],
    'Weihrauch-Kiefer': 'Pinus taeda',
    'Küstenmammutbaum': 'Sequoia sempervirens',
    'Stech-Fichte': 'Picea pungens',
    'Weiß-Eiche': 'Quercus alba',
    'Amerikanische Stechpalme': 'Ilex opaca',
    'Palmettopalme': 'Sabal palmetto',
    'Virginia-Eiche': 'Quercus virginiana',
    'Lichtnussbaum': 'Aleurites moluccanus',
    'Westliche Weymouth-Kiefer': 'Pinus monticola',
    'Tulpenbaum': 'Liriodendron tulipifera',
    'Eiche': 'Oak',
    'Pappel': 'Populus deltoides',
    'Sumpfzypresse': 'Taxodium distichum',
    'Weymouth-Kiefer': 'Pinus strobus',
    'Amerikanische Ulme': 'Ulmus americana',
    'Amerikanische Rotkiefer': 'Pinus resinosa',
    'Gelb-Kiefer': 'Pinus ponderosa',
    'Pinyon-Kiefer': 'Pinus edulis',
    'Papier-Birke': 'Betula papyrifera',
    'Rot-Eiche': 'Quercus rubra',
    'Zucker-Ahorn': 'Acer saccharum',
    'Ohio-Rosskastanie': 'Aesculus glabra',
    'Judasbaum': 'Cercis canadensis',
    'Douglasie': 'Pseudotsuga menziesii',
    'Kanadische Hemlocktanne': 'Tsuga canadensis',
    'Rot-Ahorn': 'Acer rubrum',
    'Black-Hills-Fichte': 'Picea glauca',
    'Pekannussbaum': 'Pecan',
    'Amerikanische Zitterpappel': 'Populus tremuloides',
    'Westamerikanische Hemlocktanne': 'Tsuga heterophylla',
    'Ceiba': 'Ceiba pentandra',
    'Ifit': 'Intsia bijuga',
    'Flammenbaum': 'Delonix regia',
    'Känguru': 'Red kangaroo',
    'Großer Panda': 'Giant panda',
    'Biber': 'North American beaver',
    'Weißkopfseeadler': 'Bald eagle',
    'Springbock': 'Springbok',
    'Komodowaran': 'Komodo dragon',
    'Bengalischer Tiger': 'Bengal tiger',
    'Kiwi': 'Kiwi (bird)',
    'Löwe': 'Lion',
    'Gallischer Hahn': 'Gallic rooster',
    'Adler': 'Golden eagle',
    'Braunbär': 'Brown bear',
    'Steinadler': 'Golden eagle',
    'Jaguar': 'Jaguar',
    'Rotbauchtöpfer': 'Rufous hornero',
    'Andenkondor': 'Andean condor',
    'Vikunja': 'Vicuña',
    'Trupial': 'Venezuelan troupial',
    'Quetzal': 'Resplendent quetzal',
    'Grüner Fasan': 'Green pheasant',
    'Tiger': 'Tiger',
    'Asiatischer Elefant': 'Asian elephant',
    'Kuh': 'Cattle',
    'Ceylonhuhn': 'Sri Lankan junglefowl',
    'Philippinenadler': 'Philippine eagle',
    'Przewalski-Pferd': 'Przewalski\'s horse',
    'Achal-Tekkiner-Pferd': 'Akhal-Teke',
    'Falke': 'Saker falcon',
    'Arabische Oryx': 'Arabian oryx',
    'Wiedehopf': 'Eurasian hoopoe',
    'Giraffe': 'Giraffe',
    'Kronenkranich': 'Grey crowned crane',
    'Schreiseeadler': 'African fish eagle',
    'Steppenzebra': 'Plains zebra',
    'Katta': 'Ring-tailed lemur',
    'Gerfalke': 'Gyrfalcon',
    'Elch': 'Moose',
    'Höckerschwan': 'Mute swan',
    'Wolf': 'Wolf',
    'Stier': 'Bull',
    'Hahn von Barcelos': 'Rooster of Barcelos',
    'Seeadler': 'White-tailed eagle',
    'Turul': 'Turul',
    'Marder': 'European pine marten',
    'Wisent': 'European bison',
    'Weißstorch': 'White stork',
    'Bachstelze': 'White wagtail',
    'Rauchschwalbe': 'Barn swallow',
    'Schraubenziege (Markhor)': 'Markhor',
    'Schneeleopard': 'Snow leopard',
    'Wasserbüffel': 'Water buffalo',
    'Kouprey': 'Kouprey',
    'Tocororo': 'Cuban trogon',
    'Wimpelschwanz-Kolibri': 'Red-billed streamertail',
    'Harpyie': 'Harpy eagle',
    'Weißwedelhirsch': 'White-tailed deer',
    'Sägeracke': 'Turquoise-browed motmot',
    'Paradiesvogel': 'Raggiana bird-of-paradise',
    'Takin': 'Takin',
    'Nacktkehlglockenvogel': 'Bare-throated bellbird',
    'Hoatzin': 'Hoatzin',
    'Scharlachsichler': 'Scarlet ibis',
    'Flamingo': 'American flamingo',
    'Oryx (Gemsbok)': 'Gemsbok',
    'Kaiseramazone': 'Imperial amazon',
    'Blaumaskenamazone': 'Saint Lucia amazon',
    'Königsamazone': 'St. Vincent amazon',
    'Dodo': 'Dodo',
    'Pharaonenhund': 'Pharaoh Hound'
  };
  function wikiThumb(name, cb) {
    var titles = WIKI[name]; if (!titles) return cb(null);
    titles = [].concat(titles);
    var cache = store.get('trWikiImg', {});
    if (cache[name] !== undefined) return cb(cache[name]);
    (function next(i) {
      if (i >= titles.length) { cache[name] = null; store.set('trWikiImg', cache); return cb(null); }
      fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(titles[i].replace(/ /g, '_')) + '?redirect=true')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          var src = j && (j.thumbnail && j.thumbnail.source);
          if (!src) return next(i + 1);
          var c = store.get('trWikiImg', {}); c[name] = { src: src, big: (j.originalimage && j.originalimage.source) || src, page: (j.content_urls && j.content_urls.desktop && j.content_urls.desktop.page) || '' };
          store.set('trWikiImg', c); cb(c[name]);
        })
        .catch(function () { cb(null); });
    })(0);
  }

  /* Städtenamen ohne Überlappung: rechts, links, oben, unten oder schräg – die erste freie Stelle gewinnt, Hauptstadt zuerst */
  function placeLabels(gl, kept, W, H) {
    var placed = [], pad = 2;
    var dotsBox = kept.map(function (k) { return { x: k.xy[0] - 9, y: k.xy[1] - 9, w: 18, h: 18 }; });
    var hit = function (a, b) { return a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad; };
    var order = kept.map(function (k, i) { return i; }).sort(function (a, b) { return (kept[b].p[3] ? 1 : 0) - (kept[a].p[3] ? 1 : 0); });
    order.forEach(function (i) {
      var k = kept[i], x = k.xy[0], y = k.xy[1];
      var t = gl.append('text').attr('class', 'lbl' + (k.p[3] ? ' cap' : '')).text(k.p[0]);
      var cands = [[x + 13, y + 4, 'start'], [x - 13, y + 4, 'end'], [x, y - 13, 'middle'], [x, y + 21, 'middle'],
        [x + 10, y - 9, 'start'], [x - 10, y - 9, 'end'], [x + 10, y + 17, 'start'], [x - 10, y + 17, 'end']];
      var best = null;
      cands.forEach(function (c, ci) {
        if (best && best.score === 0) return;
        t.attr('x', c[0]).attr('y', c[1]).attr('text-anchor', c[2]);
        var bb; try { bb = t.node().getBBox(); } catch (e) { bb = { x: c[0], y: c[1] - 10, width: 60, height: 12 }; }
        var box = { x: bb.x, y: bb.y, w: bb.width, h: bb.height }, score = ci * 0.01;
        if (box.x < 2 || box.y < 2 || box.x + box.w > W - 2 || box.y + box.h > H - 2) score += 50;
        placed.forEach(function (p) { if (hit(box, p)) score += 100; });
        dotsBox.forEach(function (d, di) { if (di !== i && hit(box, d)) score += 80; });
        if (!best || score < best.score) best = { c: c, box: box, score: score < 1 ? 0 : score };
      });
      t.attr('x', best.c[0]).attr('y', best.c[1]).attr('text-anchor', best.c[2]);
      placed.push(best.box);
    });
  }

  /* „Weiß ich nicht“: Runde ohne weitere Versuche auflösen */
  function giveRow(F, fn) {
    var row = el('div', 'tr-row tr-give'), b = el('button', 'tr-btn soft', 'Weiß ich nicht');
    b.type = 'button'; b.onclick = fn; row.appendChild(b); F.body.appendChild(row); return row;
  }
  function feedback(f, cls, html) { f.className = 'tr-fb ' + cls; f.innerHTML = html; }
  function doneStep(F) { F.next.classList.remove('hidden'); save(); refreshHead(); }
  function refreshHead() { var h = V.game.querySelector('.tr-head'); if (h) h.replaceWith(header()); }

  function renderStep() {
    var it = IDX[G.id];
    if (G.step === 0) return stepOutline(it);
    if (G.step === 1) return stepCity(it);
    if (G.step === 2) return stepPic(it);
    if (G.step === 3) return stepQuestion(it);
    if (G.step === 4) return stepFlag(it);
  }

  /* ---------- Karte ---------- */
  /* genaue Umrisse (daten/umrisse/…) erst laden, wenn das Land drankommt */
  var FEIN = {}, FEINW = {};
  function fein(name, onLoaded) {
    if (FEIN[name]) return FEIN[name];
    var url = window.TAG && TAG.feinUmrisse && TAG.feinUmrisse[name]; if (!url) return null;
    var w = FEINW[name] || (FEINW[name] = []); if (onLoaded) w.push(onLoaded);
    if (!w.started) {
      w.started = true;
      fetch(url).then(function (r) { return r.json(); }).then(function (f) {
        FEIN[name] = f; var cbs = FEINW[name].slice(); FEINW[name] = [];
        cbs.forEach(function (fn) { try { fn(f); } catch (e) {} });
      }).catch(function () { FEINW[name] = []; });
    }
    return null;
  }
  function withFeature(box, it, cb) {
    if (FEIN[it.topo]) { cb(FEIN[it.topo]); return; }
    var gid = G && G.id, gstep = G && G.step;
    fein(it.topo, function (ff) { if (G && G.id === gid && G.step === gstep && box.isConnected) { box.innerHTML = ''; cb(ff); } });
    var f = C.feature(it);
    if (f) { cb(f); return; }
    box.innerHTML = '<div class="tr-wait">Karte lädt …</div>';
    var tries = 0, t = setInterval(function () {
      f = FEIN[it.topo] ? null : C.feature(it); tries++;
      if (FEIN[it.topo] && box.querySelector('svg')) { clearInterval(t); return; }
      if (f) { clearInterval(t); box.innerHTML = ''; cb(f); }
      else if (tries > 150) { clearInterval(t); box.innerHTML = '<div class="tr-wait">Karte konnte nicht geladen werden.</div>'; }
    }, 200);
  }
  function mapSize(box) { return [box.clientWidth || 340, box.clientHeight || 250]; }

  /* zeichnet den Umriss; gibt eine Funktion zurück, die [lat,lon] auf Pixel abbildet */
  function drawShape(box, it, feature, pts) {
    var wh = mapSize(box), w = wh[0], h = wh[1], pad = pts ? 26 : 14;
    var svg = d3.select(box).append('svg').attr('viewBox', '0 0 ' + w + ' ' + h)
      .style('filter', 'drop-shadow(0px 6px 12px rgba(61,64,91,.22))');
    var g = svg.append('g'), proj;
    if (C.us && !(feature.properties && feature.properties.geo)) {
      var path = d3.geoPath(), b = path.bounds(feature);
      var dx = b[1][0] - b[0][0], dy = b[1][1] - b[0][1];
      var sc = Math.min((w - 2 * pad) / dx, (h - 2 * pad) / dy), tx = w / 2 - sc * (b[0][0] + b[1][0]) / 2, ty = h / 2 - sc * (b[0][1] + b[1][1]) / 2;
      g.append('path').datum(feature).attr('class', 'shape').attr('d', path).attr('transform', 'translate(' + tx + ',' + ty + ')scale(' + sc + ')').style('stroke-width', 1.6 / sc);
      var alb = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
      proj = function (la, lo) { var p = alb([lo, la]); return p ? [tx + sc * p[0], ty + sc * p[1]] : null; };
    } else {
      var f = pts ? mainland(feature, pts) : feature;
      var c = d3.geoCentroid(f);
      var pr = d3.geoMercator().rotate([-c[0], 0]).fitExtent([[pad, pad], [w - pad, h - pad]], f);
      var gp2 = d3.geoPath(pr);
      var mainP = g.append('path').datum(feature).attr('class', 'shape').attr('d', gp2).style('stroke-width', 1.4);
      if (!pts) zeichne(g, feature, gp2, 1, mainP); else zeichne(g, feature, gp2, 1, mainP);
      proj = function (la, lo) { return pr([lo, la]); };
    }
    return { svg: svg, proj: proj, w: w, h: h };
  }
  /* Umriss nachzeichnen: bei Inselgruppen werden sehr kleine Inseln um ihren Mittelpunkt vergrößert
     (echte Form und Lage bleiben erhalten, Atollringe und Inselbögen werden erkennbar);
     winzige Splitter werden zu Punkten. sc = Bildschirm-Pixel pro Pfad-Einheit, main = schon gezeichneter Umriss */
  function zeichne(g, feature, path, sc, main) {
    var gm = feature.geometry; if (!gm) return;
    var info = (gm.type === 'MultiPolygon' ? gm.coordinates : [gm.coordinates]).map(function (c) {
      var p = { type: 'Polygon', coordinates: c }, b = path.bounds(p);
      return { p: p, b: b, s: Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) * sc, c: path.centroid(p) };
    }).filter(function (x) { return isFinite(x.c[0]) && isFinite(x.s); });
    if (!info.length) return;
    var mx = Math.max.apply(null, info.map(function (x) { return x.s; }));
    var fill = main.style('fill'), stroke = main.style('stroke'), ink = stroke || '#4a3a2a';
    function dot(x) { g.append('circle').attr('cx', x.c[0]).attr('cy', x.c[1]).attr('r', 1.6 / sc).style('fill', ink); }
    if (mx >= 40) {
      info.forEach(function (x) {
        if (x.s >= 2.5) return;
        var inside = info.some(function (y) { return y.s >= 25 && x.c[0] >= y.b[0][0] && x.c[0] <= y.b[1][0] && x.c[1] >= y.b[0][1] && x.c[1] <= y.b[1][1]; });
        if (!inside) dot(x);
      });
      if (mx < 70) main.style('stroke-width', 1 / sc);
      return;
    }
    main.style('display', 'none');
    info.sort(function (a, b) { return b.s - a.s; }).forEach(function (x) {
      var f = x.s < 16 ? Math.min(16 / Math.max(x.s, 0.05), 8) : 1;
      if (x.s * f < 3) { dot(x); return; }
      var tr = f === 1 ? null : 'translate(' + x.c[0] + ',' + x.c[1] + ') scale(' + f + ') translate(' + (-x.c[0]) + ',' + (-x.c[1]) + ')';
      g.append('path').attr('d', path(x.p)).attr('transform', tr).style('fill', fill).style('stroke', stroke)
        .style('stroke-width', 0.9 / (sc * f)).style('stroke-linejoin', 'round');
    });
  }
  /* nur die Landesteile, auf denen die Städte liegen (sonst wird z. B. Frankreich samt Überseegebieten winzig) */
  function mainland(feature, pts) {
    var gm = feature.geometry; if (!gm || gm.type !== 'MultiPolygon') return feature;
    var parts = gm.coordinates.map(function (c) { return { type: 'Feature', geometry: { type: 'Polygon', coordinates: c } }; });
    var areas = parts.map(function (p) { return d3.geoArea(p); }), max = Math.max.apply(null, areas);
    var keep = parts.filter(function (p, i) {
      if (areas[i] >= max * .2) return true;
      var b = d3.geoBounds(p);
      return pts.some(function (q) { var la = q[1], lo = q[2]; return la >= b[0][1] - 1 && la <= b[1][1] + 1 && lo >= b[0][0] - 1 && lo <= b[1][0] + 1; });
    });
    return { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: keep.map(function (p) { return p.geometry.coordinates; }) } };
  }

  /* ---------- Runde 1: Umriss ---------- */
  function stepOutline(it) {
    var F = frame(C.us ? 'Welcher Bundesstaat ist das?' : 'Welches Land ist das?');
    var box = el('div', 'tr-map'); F.body.appendChild(box);
    withFeature(box, it, function (f) { drawShape(box, it, f, null); });
    var P = G.part.r1 || (G.part.r1 = { n: 0, c: 0, nv: '', cv: '' }); P.ng = P.ng || []; P.cg = P.cg || [];
    var fields = el('div', 'tr-fields'); F.body.appendChild(fields);
    var fN = field(C.us ? 'Bundesstaat' : 'Land', C.namen), fC = field('Hauptstadt', C.hauptstaedte);
    fields.appendChild(fN.w); fields.appendChild(fC.w);
    var row = el('div', 'tr-row'), chk = el('button', 'tr-btn green', 'Überprüfen'), giv = el('button', 'tr-btn soft', 'Weiß ich nicht');
    giv.style.flex = '0 0 auto'; row.appendChild(chk); row.appendChild(giv); F.body.appendChild(row);
    fN.inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !fN.sugOpen()) { e.preventDefault(); if (!fC.inp.disabled && !fC.inp.value.trim()) fC.inp.focus(); else check(); } });
    fC.inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !fC.sugOpen()) { e.preventDefault(); check(); } });
    chk.onclick = check;
    giv.onclick = function () { if (G.res[0] == null) G.res[0] = 'far'; if (G.res[1] == null) G.res[1] = 'far'; paint(); };
    function okName(v) { var n = norm(v); return !!n && [it.name].concat(it.alias || []).some(function (a) { return norm(a) === n; }); }
    function okCap(v) { var n = norm(v); return !!n && [it.hs].concat(it.hsAlt || []).some(function (a) { return norm(a) === n; }); }
    function check() {
      fN.close(); fC.close();
      /* leere Felder zählen nicht als Versuch */
      var nv = fN.inp.value.trim(), cv = fC.inp.value.trim();
      if ((G.res[0] != null || !nv) && (G.res[1] != null || !cv)) { (G.res[0] == null ? fN : fC).inp.focus(); return; }
      if (G.res[0] == null && nv) { P.nv = nv; P.n++; if (okName(P.nv)) G.res[0] = P.n === 1 ? 'ok' : 'near'; else { P.ng.push(P.nv); if (P.n >= 2) G.res[0] = 'far'; } }
      if (G.res[1] == null && cv) { P.cv = cv; P.c++; if (okCap(P.cv)) G.res[1] = P.c === 1 ? 'ok' : 'near'; else { if (P.cv) P.cg.push(P.cv); if (P.c >= 2) G.res[1] = 'far'; } }
      paint(true);
    }
    function mark(fl, r, tries, sol) {
      fl.inp.classList.remove('bad', 'good', 'near');
      if (r) {
        fl.inp.disabled = true; fl.inp.classList.add(r === 'ok' ? 'good' : r === 'near' ? 'near' : 'bad');
        fl.note.style.color = r === 'far' ? '' : r === 'near' ? '#9a5a12' : '#2f7a55';
        fl.note.textContent = r === 'far' ? 'Richtig wäre: ' + sol : r === 'near' ? 'Im 2. Versuch richtig' : 'Richtig!';
        if (r === 'far') fl.inp.value = sol;
      } else if (tries) {
        fl.inp.classList.add('bad'); fl.note.style.color = ''; fl.note.textContent = 'Falsch – noch ein Versuch'; fl.inp.value = '';
      }
    }
    function paint(fromCheck) {
      mark(fN, G.res[0], P.n, it.name); mark(fC, G.res[1], P.c, it.hs);
      fN.hist.innerHTML = '';
      if (P.ng.length) { var gl = el('div', 'tr-grows'); P.ng.forEach(function (g) { gl.appendChild(guessRow(g, it, false)); }); fN.hist.appendChild(gl); }
      fC.hist.innerHTML = '';
      if (P.cg.length) { var cl = el('div', 'tr-grows'); P.cg.forEach(function (g) { cl.appendChild(capRow(g, it)); }); fC.hist.appendChild(cl); }
      if (G.res[0] && G.res[1]) {
        chk.parentNode && row.remove();
        var cls = G.res[0] === 'far' && G.res[1] === 'far' ? 'far' : (G.res[0] === 'ok' && G.res[1] === 'ok') ? 'ok' : 'near';
        feedback(F.fb, cls, (C.us ? 'Gesucht war ' : 'Gesucht war ') + '<b>' + esc(it.name) + '</b> mit der Hauptstadt <b>' + esc(it.hs) + '</b>.');
        doneStep(F);
        if (fromCheck) F.next.focus();
      } else {
        save(); refreshHead();
        if (fromCheck) { if (G.res[0] == null) fN.inp.focus(); else fC.inp.focus(); }
      }
    }
    paint(false);
    if (G.res[0] == null) setTimeout(function () { if (!('ontouchstart' in window)) fN.inp.focus(); }, 50);
  }

  function field(label, list) {
    var w = el('div', 'tr-f'), lb = el('label', null, esc(label)), inp = el('input', 'tr-in'), ul = el('ul', 'tr-sug'), note = el('div', 'note');
    inp.type = 'text'; inp.autocomplete = 'off'; inp.setAttribute('autocorrect', 'off'); inp.setAttribute('autocapitalize', 'words'); inp.spellcheck = false;
    inp.placeholder = label === 'Hauptstadt' ? 'Hauptstadt …' : label + ' …';
    var hist = el('div', 'tr-hist');
    w.appendChild(lb); w.appendChild(inp); w.appendChild(note); w.appendChild(hist); w.appendChild(ul);
    var idx = 0, items = [];
    function draw() {
      var q = norm(inp.value); ul.innerHTML = ''; idx = 0; items = [];
      if (!q || inp.disabled) return;
      var a = [], b = [];
      list.forEach(function (x) { var n = norm(x); if (n.indexOf(q) === 0) a.push(x); else if (n.indexOf(q) > 0) b.push(x); });
      items = a.concat(b).slice(0, 6);
      if (items.length === 1 && norm(items[0]) === q) { items = []; return; }
      items.forEach(function (x, i) {
        var li = el('li', i === 0 ? 'act' : '', esc(x));
        li.addEventListener('mousedown', function (e) { e.preventDefault(); inp.value = x; close(); });
        li.addEventListener('touchend', function (e) { e.preventDefault(); inp.value = x; close(); });
        ul.appendChild(li);
      });
    }
    function close() { ul.innerHTML = ''; items = []; }
    inp.addEventListener('input', function () { inp.classList.remove('bad'); note.textContent = ''; draw(); });
    inp.addEventListener('keydown', function (e) {
      var li = ul.children;
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && li.length) { e.preventDefault(); idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + li.length) % li.length; [].forEach.call(li, function (x, i) { x.classList.toggle('act', i === idx); }); }
      else if (e.key === 'Enter' && items.length) { e.preventDefault(); inp.value = items[idx]; close(); }
      else if (e.key === 'Escape') close();
    });
    inp.addEventListener('blur', function () { setTimeout(close, 150); });
    return { w: w, inp: inp, note: note, hist: hist, close: close, sugOpen: function () { return items.length > 0; } };
  }

  /* ---------- Runde 2: Lage der Hauptstadt ---------- */
  function stepCity(it) {
    if (G.res[2] === 'skip') { G.step++; save(); return renderStep(); }
    var F = frame('Wo liegt ' + esc(it.hs) + '?');
    var box = el('div', 'tr-map big'); box.style.height = '280px'; F.body.appendChild(box);
    var P = G.part.r2 || (G.part.r2 = { wrong: [] });
    withFeature(box, it, function (f) {
      var S = drawShape(box, it, f, G.R.pts);
      /* Punkte, die sich überlappen, fallen weg; zu wenige → Runde entfällt (Stadt- und Mikrostaaten) */
      var kept = [], minD = 20;
      var cap = G.R.pts.filter(function (p) { return p[3]; })[0];
      [cap].concat(G.R.pts.filter(function (p) { return !p[3]; })).forEach(function (p) {
        var xy = S.proj(p[1], p[2]); if (!xy || !isFinite(xy[0])) return;
        if (xy[0] < 8 || xy[1] < 8 || xy[0] > S.w - 8 || xy[1] > S.h - 8) return;
        if (kept.some(function (k) { return Math.hypot(k.xy[0] - xy[0], k.xy[1] - xy[1]) < minD; })) return;
        kept.push({ p: p, xy: xy });
      });
      if (kept.length < 3 || !kept[0].p[3]) {
        G.res[2] = 'skip'; save();
        feedback(F.fb, 'info', (C.us ? 'Dieser Staat' : 'Dieses Land') + ' ist zu klein, um Städte darauf zu verteilen – diese Runde entfällt.');
        F.next.classList.remove('hidden'); refreshHead(); return;
      }
      kept = G.R.pts.map(function (p) { return kept.filter(function (k) { return k.p === p; })[0]; }).filter(Boolean);
      var gp = S.svg.append('g'), gl = S.svg.append('g');
      var dots = kept.map(function (k, i) {
        var c = gp.append('circle').attr('class', 'pt').attr('cx', k.xy[0]).attr('cy', k.xy[1]).attr('r', 7);
        var near = Math.min.apply(null, kept.map(function (o) { return o === k ? 99 : Math.hypot(o.xy[0] - k.xy[0], o.xy[1] - k.xy[1]); }));
        gp.append('circle').attr('class', 'hit').attr('cx', k.xy[0]).attr('cy', k.xy[1]).attr('r', Math.max(10, Math.min(22, near / 2)))
          .on('click', function () { tap(i); });
        return c;
      });
      /* die Karte wird nach dem Laden der genauen Umrisse neu gezeichnet: alten Knopf entfernen */
      var oldGv = F.body.querySelector('.tr-give'); if (oldGv) oldGv.remove();
      var gv = G.res[2] == null ? giveRow(F, function () { if (G.res[2] != null) return; G.res[2] = 'far'; paint(true); }) : null;
      function tap(i) {
        if (G.res[2] != null || P.wrong.indexOf(i) >= 0) return;
        if (kept[i].p[3]) { G.res[2] = P.wrong.length ? 'near' : 'ok'; }
        else { P.wrong.push(i); if (P.wrong.length >= 2) G.res[2] = 'far'; }
        paint(true);
      }
      function paint(live) {
        P.wrong.forEach(function (i) { dots[i] && dots[i].classed('bad', true); });
        if (G.res[2] == null) {
          if (P.wrong.length) feedback(F.fb, 'far', 'Das ist nicht ' + esc(it.hs) + ' – noch ein Versuch.');
          save(); refreshHead(); return;
        }
        if (gv) gv.remove();
        kept.forEach(function (k, i) { if (k.p[3]) dots[i].classed(G.res[2] === 'far' ? 'show' : 'good', true); });
        placeLabels(gl, kept, S.w, S.h);
        feedback(F.fb, G.res[2], G.res[2] === 'ok' ? 'Richtig – das ist ' + esc(it.hs) + '!' : G.res[2] === 'near' ? 'Im zweiten Versuch richtig.' : 'Leider nicht – ' + esc(it.hs) + ' ist grün markiert.');
        doneStep(F);
      }
      paint(false);
    });
  }

  /* ---------- Runde 3: Bilderfrage ---------- */
  function stepPic(it) {
    var R = G.R.bild;
    if (!R) { G.res[3] = 'skip'; G.step++; save(); return renderStep(); }
    var F = frame(esc(R.q));
    if (PIC.indexOf(R.kind) >= 0) return picChoice(F, R, 3);
    V.game.querySelector('.tr-step').textContent = 'Runde 3 von 5 · Zusatzfrage';
    choice(F, R.opts.map(esc), R.right, 3, R.opts.every(function (o) { return o.length <= 22; }), function (r) {
      feedback(F.fb, r, r === 'ok' ? 'Richtig!' : 'Richtig wäre: <b>' + esc(R.opts[R.right]) + '</b>.');
    });
  }

  /* ---------- Runde 4: Zufallsfrage ---------- */
  function stepQuestion(it) {
    var R = G.R.frage;
    if (!R) { G.res[4] = 'skip'; G.step++; save(); return renderStep(); }
    var F = frame(esc(R.q));
    if (PIC.indexOf(R.kind) >= 0) return picChoice(F, R, 4);
    choice(F, R.opts.map(esc), R.right, 4, R.opts.every(function (o) { return o.length <= 22; }), function (r) {
      feedback(F.fb, r, r === 'ok' ? 'Richtig!' : 'Richtig wäre: <b>' + esc(R.opts[R.right]) + '</b>.');
    });
  }

  /* Auswahl mit Foto je Antwort; die Lupe zeigt das Foto groß, ohne zu antworten */
  function picChoice(F, R, slot) {
    var LUPE = '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg>';
    var bs = choice(F, R.opts.map(function (o) { return '<span class="pic"><i class="tr-zoom hidden" role="button" aria-label="Foto vergrößern">' + LUPE + '</i></span>' + esc(o); }), R.right, slot, true, function (r) {
      feedback(F.fb, r, r === 'ok' ? 'Richtig!' : 'Richtig wäre: <b>' + esc(R.opts[R.right]) + '</b>.');
    });
    var any = false, credit = el('div', 'tr-credit hidden', 'Fotos: <a href="https://en.wikipedia.org" target="_blank" rel="noopener">Wikipedia / Wikimedia Commons</a>');
    F.body.appendChild(credit);
    R.opts.forEach(function (o, i) {
      var pic = bs[i].querySelector('.pic'), zb = pic.querySelector('.tr-zoom');
      wikiThumb(o, function (w) {
        if (!w) { pic.classList.add('none'); return; }
        pic.style.backgroundImage = 'url("' + w.src.replace(/"/g, '%22') + '")';
        zb.classList.remove('hidden');
        zb.onclick = function (e) { e.stopPropagation(); e.preventDefault(); lightbox(w.big || w.src, o); };
        if (!any) { any = true; credit.classList.remove('hidden'); }
      });
    });
  }

  function choice(F, opts, right, slot, two, after) {
    var box = el('div', 'tr-opts' + (two ? ' two' : '')); F.body.appendChild(box);
    var P = G.part['r' + slot] || (G.part['r' + slot] = { pick: null });
    var bs = opts.map(function (o, i) {
      var b = el('button', 'tr-opt', o); b.onclick = function () { if (G.res[slot] != null) return; P.pick = i; G.res[slot] = i === right ? 'ok' : 'far'; paint(); };
      box.appendChild(b); return b;
    });
    var gv = G.res[slot] == null ? giveRow(F, function () { if (G.res[slot] != null) return; P.pick = null; G.res[slot] = 'far'; paint(); }) : null;
    function paint() {
      if (G.res[slot] == null) return;
      if (gv) gv.remove();
      bs.forEach(function (b, i) { b.disabled = true; if (i === right) b.classList.add('good'); else if (i === P.pick) b.classList.add('bad'); else b.classList.add('dim'); });
      after(G.res[slot]); doneStep(F);
    }
    paint();
    return bs;
  }

  /* ---------- Runde 5: Flagge ---------- */
  function stepFlag(it) {
    var R = G.R.flags;
    var F = frame('Welche Flagge gehört zu ' + esc(it.name) + '?');
    var box = el('div', 'tr-flags'); F.body.appendChild(box);
    var P = G.part.r5 || (G.part.r5 = { wrong: [] });
    var bs = R.opts.map(function (id, i) {
      var b = el('button', 'tr-flag'); b.type = 'button';
      var img = el('img'); img.alt = 'Flagge ' + (i + 1); img.src = C.flaggen.ordner + C.flaggen.datei[id]; img.draggable = false;
      var fi = el('div', 'fi'); fi.appendChild(img); b.appendChild(fi); b.appendChild(el('span'));
      var zb = el('i', 'tr-zoom', '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg>');
      zb.setAttribute('role', 'button'); zb.setAttribute('aria-label', 'Flagge vergrößern'); zb.tabIndex = 0;
      zb.onclick = function (e) { e.stopPropagation(); e.preventDefault(); lightbox(img.src, G.res[5] != null ? IDX[id].name : 'Flagge ' + (i + 1)); };
      zb.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') zb.onclick(e); };
      b.appendChild(zb);
      b.onclick = function () {
        if (G.res[5] != null || P.wrong.indexOf(i) >= 0) return;
        if (i === R.right) G.res[5] = P.wrong.length ? 'near' : 'ok';
        else { P.wrong.push(i); if (P.wrong.length >= 2) G.res[5] = 'far'; }
        paint();
      };
      box.appendChild(b); return b;
    });
    var gv = G.res[5] == null ? giveRow(F, function () { if (G.res[5] != null) return; G.res[5] = 'far'; paint(); }) : null;
    function paint() {
      P.wrong.forEach(function (i) { bs[i].classList.add('bad'); });
      if (G.res[5] != null && gv) gv.remove();
      if (G.res[5] == null) { if (P.wrong.length) feedback(F.fb, 'far', 'Falsch – noch ein Versuch.'); save(); refreshHead(); return; }
      bs.forEach(function (b, i) {
        b.disabled = true; if (i === R.right) b.classList.add('good');
        b.querySelector('span').textContent = IDX[R.opts[i]].name;
      });
      feedback(F.fb, G.res[5], G.res[5] === 'ok' ? 'Richtig!' : G.res[5] === 'near' ? 'Im zweiten Versuch richtig.' : 'Leider nicht – die richtige Flagge ist markiert.');
      doneStep(F);
    }
    paint();
  }

  /* ---------- Ergebnis ---------- */
  function finish() { if (G.mode === 'daily') { record(); save(); } showResult(); }
  function showResult() {
    var it = IDX[G.id], pt = points(G.res);
    V.game.innerHTML = '';
    V.game.appendChild(header());
    var r = el('div', 'tr-res');
    r.appendChild(el('h2', null, esc(it.name)));
    var s = G.mode === 'daily' ? streak() : 0;
    r.appendChild(el('div', 'score', '<b>' + fmtPts(pt[0]) + ' von ' + pt[1] + '</b> Punkten' + (s ? ' · 🔥 ' + s + (s === 1 ? ' Tag' : ' Tage') + ' in Folge' : '')));
    var ul = el('ul', 'tr-list');
    G.res.forEach(function (x, i) { ul.appendChild(el('li', null, '<i class="tr-sq ' + (x || 'skip') + '"></i>' + sqName(i) + (x === 'skip' ? ' <small style="color:#7b7d93;font-weight:600">(entfällt)</small>' : ''))); });
    r.appendChild(ul);
    var end = el('div', 'tr-end'), cp = el('div', 'tr-copied');
    if (G.mode === 'daily') {
      var sh = el('button', 'tr-btn full', 'Ergebnis teilen'); sh.onclick = function () { share(cp); }; end.appendChild(sh);
      var more = el('button', 'tr-btn green full', 'Weiter spielen'); more.onclick = function () { startFree(); scrollTop(); }; end.appendChild(more);
    } else {
      var nx = el('button', 'tr-btn green full', 'Nächstes ' + (C.us ? 'Bundesstaat' : 'Land')); if (C.us) nx.textContent = 'Nächster Staat';
      nx.onclick = function () { startFree(); scrollTop(); }; end.appendChild(nx);
    }
    r.appendChild(end); r.appendChild(cp);
    V.game.appendChild(r);
    if (G.mode === 'daily') renderDaily();
  }
  function shareText() {
    var pt = points(G.res);
    return C.titel + ' · ' + fmtLong(G.key) + '\n' + G.res.map(function (x) { return EMO[x || 'skip']; }).join('') + '\n' + fmtPts(pt[0]) + ' von ' + pt[1] + ' Punkten';
  }
  function share(cp) {
    var t = shareText(), ok = function () { cp.textContent = 'Ergebnis kopiert!'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () { fallback(t, ok); });
    else fallback(t, ok);
  }
  function fallback(t, ok) { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) {} ta.remove(); }

  /* ---------- Filter ---------- */
  function inFilter(it) { var f = store.get(C.key + 'Filter', ''); return !f || groupOf(it).indexOf(f) >= 0; }

  /* ---------- Start ---------- */
  function init(cfg) {
    C = cfg;
    C.items.forEach(function (it) { IDX[idOf(it)] = it; });
    var names = []; C.items.forEach(function (it) { names.push(it.name); (it.alias || []).forEach(function (a) { names.push(a); }); });
    C.namen = names.filter(function (x, i) { return names.indexOf(x) === i; }).sort(function (a, b) { return a.localeCompare(b, 'de'); });
    var caps = []; C.items.forEach(function (it) { caps.push(it.hs); });
    C.hauptstaedte = caps.filter(function (x, i) { return caps.indexOf(x) === i; }).sort(function (a, b) { return a.localeCompare(b, 'de'); });
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var host = C.host; host.classList.add('tr');
    V.daily = el('div', 'tr-card tr-daily'); host.appendChild(V.daily);
    V.bar = el('div', 'tr-bar');
    /* Filter direkt in der Quiz-Karte unter Versuch/Rotation, nicht als eigene Leiste */
    var rot = document.getElementById('quiz-rotation-select'), hdr = rot && rot.closest('.border-b');
    if (hdr && hdr.parentNode) { V.bar.classList.add('tr-bar-in'); V.bar.appendChild(el('label', 'tr-bar-l', esc(C.filterName))); hdr.parentNode.insertBefore(V.bar, hdr.nextSibling); }
    else host.appendChild(V.bar);
    var sel = el('select'); sel.setAttribute('aria-label', C.filterName);
    sel.innerHTML = C.filter.map(function (f) { return '<option value="' + f[0] + '">' + esc(f[1]) + '</option>'; }).join('');
    sel.value = store.get(C.key + 'Filter', '');
    if (sel.value !== store.get(C.key + 'Filter', '')) { sel.value = ''; store.set(C.key + 'Filter', ''); }
    sel.onchange = function () { store.set(C.key + 'Filter', sel.value); if (V.view === 'free') startFree(); else if (C.onFilter) C.onFilter(); };
    V.bar.appendChild(sel);
    V.game = el('div', 'tr-card tr-game hidden'); host.appendChild(V.game);
    moreButton();
    /* freies Umriss-Quiz: Versuche als Tabelle (wird von logGuess in welt.html/usa.html benutzt) */
    window.trRow = function (guess, cap, ok) {
      var cur = null; try { cur = currentQuizItem; } catch (e) {}
      var topo = cur && (cur.topoName || cur.state), it = null;
      C.items.forEach(function (x) { if (!it && x.topo === topo) it = x; });
      var capOk = !!(it && cap && [it.hs].concat(it.hsAlt || []).some(function (a) { return norm(a) === norm(cap); }));
      return guessRow(guess, it, ok, cap, capOk);
    };
    setView('outline');
    renderDaily();
    /* neuer Tag um Mitternacht (Wien) */
    var last = todayKey();
    setInterval(function () { var k = todayKey(); if (k !== last) { last = k; if (V.view !== 'daily') renderDaily(); } }, 30000);
  }

  /* Im freien Umriss-Quiz nach dem Lösen oder Aufgeben: mit Runde 2–5 zum selben Land weitermachen */
  function moreButton() {
    var nextBtn = document.getElementById('quiz-next-btn'); if (!nextBtn) return;
    var mb = el('button', 'tr-more hidden', 'Weitere Runden zu ' + (C.us ? 'diesem Staat' : 'diesem Land') + ' →'); mb.type = 'button';
    nextBtn.parentNode.insertBefore(mb, nextBtn.nextSibling);
    var gave = false;
    if (typeof window.giveUp === 'function') { var g0 = window.giveUp; window.giveUp = function () { gave = true; return g0.apply(this, arguments); }; }
    if (typeof window.initQuiz === 'function') { var i0 = window.initQuiz; window.initQuiz = function () { gave = false; return i0.apply(this, arguments); }; }
    var sync = function () { mb.classList.toggle('hidden', nextBtn.classList.contains('hidden')); };
    try { new MutationObserver(sync).observe(nextBtn, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}
    sync();
    mb.onclick = function () {
      var cur = window.currentQuizItem; try { cur = cur || currentQuizItem; } catch (e) {}
      if (!cur) return;
      var topo = cur.topoName || cur.state, it = null;
      C.items.forEach(function (x) { if (!it && x.topo === topo) it = x; });
      if (!it) return;
      var sI = document.getElementById('quiz-state-input'), cI = document.getElementById('quiz-capital-input'), tries = 1;
      try { tries = guesses; } catch (e) {}
      var okN = !gave && sI && [it.name].concat(it.alias || []).some(function (a) { return norm(a) === norm(sI.value); });
      var okC = !gave && cI && [it.hs].concat(it.hsAlt || []).some(function (a) { return norm(a) === norm(cI.value); });
      G = newGame('free', it, null);
      G.res[0] = okN ? (tries <= 1 ? 'ok' : 'near') : 'far';
      G.res[1] = okC ? (tries <= 1 ? 'ok' : 'near') : 'far';
      G.step = 1; setView('free'); renderStep(); scrollTop();
    };
  }

  window.UmrissTag = {
    init: init,
    inFilter: function (id) { var it = IDX[id]; return !it || inFilter(it); },
    /* für das freie Umriss-Spiel: Hinweis „1.230 km ↗️“ vom getippten zum gesuchten Land */
    zeichne: zeichne,
    fein: fein,
    hinweis: function (guessName, targetId) { var a = byName(guessName), h = a && hint(a, IDX[targetId]); return h ? h.text : ''; },
    _debug: { todayKey: todayKey, dailyItem: function (k) { return dailyItem(k); }, play: function (id, step) { G = newGame('free', IDX[id], null); G.step = step || 0; setView('free'); renderStep(); return G; }, state: function () { return G; }, makeRound: function (id, k) { return makeRound(IDX[id], k ? mulberry32(hashStr(C.key + ':' + k)) : Math.random, k); } }
  };
})();
