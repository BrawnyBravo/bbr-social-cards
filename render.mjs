import { chromium } from 'playwright';
import fs from 'fs';

const d = JSON.parse(fs.readFileSync(process.argv[2] || 'weekend.json', 'utf8'));

// Tokens from styles.css + share-card.png in the site repo
const T = { pine:'#173c31', pine2:'#245947', deep:'#102b23', moss:'#a8bea0',
            moss2:'#7f9a6d', clay:'#c65f35', cream:'#f3f1e9', paper:'#fffefa', muted:'#9db3a6' };

const wx = d.weather.map(w=>`
  <div class="wx"><div class="wxd">${w.d}</div>
  <div class="wxv">${w.hi}<span class="deg">°</span> <em>/ ${w.lo}°</em></div></div>`).join('');

const cols = d.columns.map(c=>`
  <div class="col"><div class="colhead">${c.head}</div>
  ${c.items.map(([k,v])=>`<div class="row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}
  </div>`).join('');

const hasLake = Array.isArray(d.lake) && d.lake.length > 0;
const lake = hasLake ? d.lake.map(l=>`<div class="lk"><div class="lkk">${l.k}</div><div class="lkv">${l.v}</div></div>`).join('') : '';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px}
body{background:${T.pine};color:${T.cream};
  font-family:'Carlito','DejaVu Sans',sans-serif;-webkit-font-smoothing:antialiased;
  position:relative;overflow:hidden}
.serif{font-family:'TeX Gyre Termes','Bitstream Charter','DejaVu Serif',Georgia,serif;font-weight:500}
.ridge{position:absolute;left:0;right:0;bottom:0;height:300px}
.wrap{position:relative;padding:58px 64px 0;height:100%;display:flex;flex-direction:column}
.brand{display:flex;align-items:center;gap:17px}
.bname{font-size:33px;letter-spacing:-.005em;line-height:1}
.btag{font-size:13.5px;letter-spacing:.32em;color:${T.moss2};margin-top:6px;font-weight:700}
.eyebrow{margin-top:40px;color:${T.clay};font-size:19px;font-weight:700;letter-spacing:.26em}
h1{font-size:71px;line-height:1.07;letter-spacing:-.018em;margin-top:15px;max-width:935px;color:${T.paper}}
.wxbar{margin-top:30px;display:flex;gap:16px}
.wx{flex:1;background:rgba(243,241,233,.075);border:1px solid rgba(168,190,160,.28);
  border-radius:20px;padding:19px 26px}
.wxd{font-size:15px;font-weight:700;letter-spacing:.2em;color:${T.moss}}
.wxv{font-size:50px;font-weight:700;line-height:1.1;margin-top:3px;letter-spacing:-.02em}
.wxv .deg{font-size:29px;vertical-align:top;line-height:1}
.wxv em{font-style:normal;font-size:28px;font-weight:400;color:${T.muted}}
.wxnote{margin-top:13px;font-size:22px;color:${T.muted}}
.hero{margin-top:30px;background:${T.clay};border-radius:24px;padding:27px 36px 31px;color:${T.paper}}
.htag{font-size:18px;font-weight:700;letter-spacing:.26em;color:#fbe3d6}
.hname{font-size:53px;line-height:1.02;margin-top:9px;letter-spacing:-.015em}
.hwho{font-size:29px;font-weight:700;margin-top:12px}
.hwhere{font-size:25px;margin-top:6px;color:#f8ddcf}
.cols{margin-top:34px;display:flex;gap:46px}
.col{flex:1}
.colhead{font-size:17px;font-weight:700;letter-spacing:.26em;color:${T.moss};
  padding-bottom:11px;border-bottom:2px solid rgba(168,190,160,.35)}
.row{display:flex;gap:14px;padding:15px 0;border-bottom:1px solid rgba(168,190,160,.17)}
.k{flex:0 0 116px;font-size:15.5px;font-weight:700;color:${T.moss2};letter-spacing:.14em;padding-top:6px}
.v{font-size:24.5px;line-height:1.24}
.lakebar{margin-top:28px;background:${T.deep};border:1px solid rgba(168,190,160,.22);
  border-radius:22px;padding:20px 32px;display:flex;gap:14px}
.lk{flex:1}
.lkk{font-size:14.5px;font-weight:700;letter-spacing:.22em;color:${T.moss2}}
.lkv{font-size:33px;font-weight:700;margin-top:3px;letter-spacing:-.01em;color:${T.paper}}
.foot{margin-top:auto;padding:26px 0 46px;display:flex;align-items:baseline;
  justify-content:space-between;border-top:1px solid rgba(168,190,160,.25)}
.url{font-size:34px;letter-spacing:.01em}
.fnote{font-size:18px;color:${T.moss2};letter-spacing:.19em;font-weight:700}
</style></head><body>

<svg class="ridge" viewBox="0 0 1080 300" preserveAspectRatio="none">
  <path d="M0,208 L150,150 L300,196 L470,120 L620,190 L780,132 L920,192 L1080,146 L1080,300 L0,300 Z"
        fill="${T.pine2}" opacity=".38"/>
  <path d="M0,252 L190,200 L340,246 L520,178 L680,244 L860,190 L1010,246 L1080,222 L1080,300 L0,300 Z"
        fill="${T.deep}" opacity=".75"/>
</svg>

<div class="wrap">
  <div class="brand">
    <svg width="62" height="62" viewBox="0 0 40 40">
      <rect width="40" height="40" rx="10" fill="${T.pine2}"/>
      <path d="M4 29 14 15l5 7 5-9 12 16H4Z" fill="#fff"/>
      <path d="M11 29h18l-4-5-3 3-5-7-6 9Z" fill="${T.moss}"/>
    </svg>
    <div>
      <div class="bname serif">Big Bear Ready</div>
      <div class="btag">LAKE · MOUNTAIN · LOCAL</div>
    </div>
  </div>

  <div class="eyebrow">${d.eyebrow}</div>
  <h1 class="serif">${d.title}</h1>
  <div class="wxbar">${wx}</div>
  <div class="wxnote">${d.weatherNote}</div>
  <div class="hero">
    <div class="htag">${d.headline.tag}</div>
    <div class="hname serif">${d.headline.name}</div>
    <div class="hwho">${d.headline.who}</div>
    <div class="hwhere">${d.headline.where}</div>
  </div>
  <div class="cols">${cols}</div>
  ${hasLake ? `<div class="lakebar">${lake}</div>` : ''}
  <div class="foot">
    <div class="url serif">bigbearready.com</div>
    <div class="fnote">${d.footerNote.toUpperCase()}</div>
  </div>
</div>
</body></html>`;

fs.writeFileSync('/tmp/poster.html', html);
const b = await chromium.launch({ args: ['--no-sandbox'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await p.goto('file:///tmp/poster.html');
await p.waitForTimeout(600);
await p.screenshot({ path: process.argv[3] || 'weekend.png' });
await b.close();
console.log('rendered');
