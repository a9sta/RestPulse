import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **가로 띠**다. 섹션이 화면 폭을 가로지르는 띠로 쌓이고 한 칸씩 바탕색이
 *   바뀐다. 제목 왼쪽에는 길이가 다른 세로 막대 셋이 선다(들고 나는 결).
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *   ★여기는 **섹션 사이에 테두리가 없다**. 바탕색 교대만으로 칸을 가른다.
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#F5F6F0', card: '#FFFFFF', soft: '#EAEDE1',
  ink: '#1F2419', dim: '#5C6553',
  acc: '#4F6B1A', accDk: '#3B5112', accSoft: '#E4EBD2',
  line: '#D3D8C4', warn: '#9A4A14',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--warn:${t.warn};
  --w:1100px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.82;font-size:16px;letter-spacing:-.008em;padding-bottom:88px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--accDk);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
strong{color:var(--accDk)}
.skipto{position:absolute;left:-9999px}
.skipto:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--accDk);color:#fff;padding:10px 16px}

/* ── 머리 ──────────────────────────────────────────── */
.hd{background:var(--accDk);color:#fff}
.hd-in{max-width:var(--w);margin:0 auto;padding:13px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.mk{display:inline-flex;align-items:center;gap:10px;color:#fff}
.mk:hover{text-decoration:none}
.rmk{width:26px;height:26px;stroke:#D7E89B;fill:none}
.mk-t b{display:block;font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1.1}
.mk-t i{display:block;font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.2em;opacity:.75}
.hd-r{display:flex;align-items:center;gap:13px;flex-wrap:wrap}
.hd-run{margin:0;font-size:11px;text-align:right;opacity:.8;line-height:1.5}
.hd-run span{display:block}
.mn{background:var(--card);border-bottom:1px solid var(--line)}
.mn ul{max-width:var(--w);margin:0 auto;padding:0 20px;list-style:none;display:flex;gap:22px;overflow-x:auto}
.mn a{display:block;padding:12px 0 10px;font-size:14px;font-weight:700;color:var(--dim);white-space:nowrap;border-bottom:2px solid transparent}
.mn a:hover{color:var(--accDk);text-decoration:none}
.mn a[aria-current]{color:var(--accDk);border-bottom-color:var(--acc)}

/* ── 빵부스러기 ────────────────────────────────────── */
.trail{background:var(--card)}
.trail ol{max-width:var(--w);margin:0 auto;padding:10px 20px;list-style:none;display:flex;flex-wrap:wrap;gap:6px;font-size:12px;color:var(--dim)}
.trail li+li::before{content:"▸";margin-right:6px;color:var(--line)}

/* ── 본문 ──────────────────────────────────────────── */
main{display:block}
.hdl{max-width:var(--w);margin:0 auto;padding:26px 20px 6px;font-size:27px;font-weight:800;letter-spacing:-.03em;line-height:1.3}
@media (min-width:720px){.hdl{font-size:34px}}
.hdl-s{display:block;margin-top:9px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.01em}
.intro{max-width:var(--w);margin:0 auto;padding:10px 20px 26px}
.intro p{margin:0 0 .9em;max-width:52rem}
.intro p:last-child{margin-bottom:0}

/* ── 섹션 = 가로 띠 ────────────────────────────────── */
.bd{padding:30px 0}
.bd:nth-of-type(even){background:var(--card)}
.bd-in{max-width:var(--w);margin:0 auto;padding:0 20px}
.bd-h{display:flex;align-items:flex-start;gap:14px;margin:0 0 18px}
.bars{flex:none;display:flex;align-items:flex-end;gap:3px;height:22px;margin-top:6px}
.bars i{display:block;width:4px;background:var(--acc)}
.bars i:nth-child(1){height:10px}
.bars i:nth-child(2){height:22px}
.bars i:nth-child(3){height:15px}
.bd-t{min-width:0;flex:1}
.bd-no{margin:0 0 3px;font-family:var(--mono);font-size:10px;letter-spacing:.24em;color:var(--dim);text-transform:uppercase}
.bd-no em{font-style:normal;color:var(--acc);margin-left:8px}
.bd h2{margin:0;font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1.38}
@media (min-width:720px){.bd h2{font-size:22px}}
.bd-sb{margin:8px 0 0;font-size:14px;color:var(--dim)}
.bd-tail{margin:15px 0 0;font-size:13px;color:var(--dim)}

/* ── 실측 장부 ─────────────────────────────────────── */
.sheet{width:100%;border-collapse:collapse;font-size:14.5px;background:var(--card)}
.bd:nth-of-type(even) .sheet{background:var(--paper)}
.sheet th,.sheet td{padding:11px 13px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.sheet th{width:40%;font-weight:700;color:var(--dim);font-size:13px;background:var(--soft)}
@media (min-width:600px){.sheet th{width:26%}}

/* ── 코스 ──────────────────────────────────────────── */
.ware{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:2px solid var(--acc)}
.ware>li{border-bottom:1px solid var(--line);padding:13px 2px}
.ware a{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;color:var(--ink)}
.ware a:hover{text-decoration:none;color:var(--accDk)}
.w-k{font-size:16px;font-weight:800;letter-spacing:-.02em;min-width:5.5em}
.w-v{font-family:var(--mono);font-size:15px;color:var(--accDk);font-weight:700}
.w-p{font-size:12.5px;color:var(--dim)}
.w-d{margin:9px 0 0;font-size:13px;color:var(--dim);padding-left:2px}

/* ── 흐름 ──────────────────────────────────────────── */
.flow{list-style:none;margin:0;padding:0;display:grid;gap:14px}
@media (min-width:760px){.flow{grid-template-columns:1fr 1fr}}
.flow li{display:flex;gap:12px;align-items:flex-start}
.flow .fn{flex:none;width:30px;height:30px;border-radius:50%;background:var(--acc);color:#fff;
  display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:13px;font-weight:700}
.flow h3{margin:3px 0 4px;font-size:15px;font-weight:800}
.flow p{margin:0;font-size:14px;color:var(--dim)}

/* ── 묻고 답하기 ───────────────────────────────────── */
.ask2{display:grid;gap:18px}
@media (min-width:860px){.ask2{grid-template-columns:1fr 1fr}}
.ask2 div{padding-left:14px;border-left:3px solid var(--acc)}
.ask2 .an{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--acc);margin-bottom:4px}
.ask2 h3{margin:0 0 6px;font-size:16px;font-weight:800;letter-spacing:-.02em}
.ask2 p{margin:0;font-size:14.5px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.heed{list-style:none;margin:0;padding:0;display:grid;gap:11px}
@media (min-width:760px){.heed{grid-template-columns:1fr 1fr}}
.heed li{position:relative;padding-left:17px;font-size:14px;color:var(--dim)}
.heed li::before{content:"";position:absolute;left:0;top:12px;width:9px;height:3px;background:var(--acc)}

/* ── 목록·링크 ─────────────────────────────────────── */
.mesh{list-style:none;margin:0;padding:0;display:grid;gap:0 18px;font-size:14px;
  grid-template-columns:1fr;border-top:1px solid var(--line)}
@media (min-width:600px){.mesh{grid-template-columns:1fr 1fr}}
@media (min-width:900px){.mesh{grid-template-columns:1fr 1fr 1fr}}
.mesh li{border-bottom:1px solid var(--line)}
.mesh a{display:block;padding:9px 2px;color:var(--ink)}
.mesh a:hover{color:var(--accDk)}
.col{list-style:none;margin:0;padding:0;display:grid;gap:0 18px;grid-template-columns:1fr;border-top:1px solid var(--line)}
@media (min-width:600px){.col{grid-template-columns:1fr 1fr}}
@media (min-width:900px){.col{grid-template-columns:1fr 1fr 1fr}}
.col li{border-bottom:1px solid var(--line)}
.col a{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:9px 2px;color:var(--ink)}
.col a:hover{text-decoration:none;color:var(--accDk)}
.col .cur a,.col a[aria-current]{color:var(--accDk);font-weight:700}
.c-n{font-size:14.5px}
.c-m{font-family:var(--mono);font-size:11px;color:var(--dim);white-space:nowrap}
.tags{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:5px 7px}
.tags li{font-size:13px;color:var(--dim);background:var(--soft);padding:3px 10px;border-radius:12px}
.sides{list-style:none;margin:0;padding:0;display:grid;gap:7px}
@media (min-width:600px){.sides{grid-template-columns:1fr 1fr}}
.sides a{display:flex;justify-content:space-between;gap:10px;padding:9px 12px;background:var(--soft);color:var(--ink)}
.sides a:hover{text-decoration:none;background:var(--accSoft)}
.sides span{font-size:11px;color:var(--dim);font-family:var(--mono)}

/* ── 견주기 ────────────────────────────────────────── */
.cross{width:100%;border-collapse:collapse;font-size:14px;background:var(--card)}
.bd:nth-of-type(even) .cross{background:var(--paper)}
.cross th,.cross td{padding:9px 11px;text-align:left;border-bottom:1px solid var(--line)}
.cross thead th{background:var(--accDk);color:#fff;font-size:12px;font-weight:700;border-bottom:0}
.cross tbody tr.cur{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.pb{display:inline-flex;align-items:center;gap:11px;background:var(--acc);color:#fff;padding:9px 18px;border-radius:30px;
  text-decoration:none;box-shadow:0 2px 0 var(--accDk)}
.pb:hover{text-decoration:none;background:var(--accDk);box-shadow:0 2px 0 var(--accDk)}
.hd .pb{background:#D7E89B;color:var(--accDk);box-shadow:none}
.hd .pb:hover{background:#fff}
.pb-bar{flex:none;display:flex;align-items:flex-end;gap:2px;height:16px}
.pb-bar i{display:block;width:3px;background:currentColor;opacity:.9}
.pb-bar i:nth-child(1){height:7px}
.pb-bar i:nth-child(2){height:16px}
.pb-bar i:nth-child(3){height:11px}
.pb-t{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.pb-lb{font-size:10px;letter-spacing:.18em;opacity:.85;font-family:var(--mono)}
.pb-nm{font-family:var(--mono);font-weight:700;white-space:nowrap}
.pb-s .pb-nm{font-size:15px}
.pb-m .pb-nm{font-size:18px}
.pb-l .pb-nm{font-size:21px}
.pb-l{padding:11px 22px}
.pb-w{display:flex;width:100%;justify-content:center}
.call{background:var(--accSoft);padding:24px 0}
.call-in{max-width:var(--w);margin:0 auto;padding:0 20px}
.call-p{margin:0 0 14px;font-size:15px;max-width:48rem}
.call-s{margin:12px 0 0;font-size:12.5px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.open{background:var(--card);border-bottom:1px solid var(--line)}
.open-in{max-width:var(--w);margin:0 auto;padding:34px 20px 30px}
.open-sl{margin:0 0 13px;font-size:21px;font-weight:800;letter-spacing:-.03em;color:var(--accDk);max-width:24em}
@media (min-width:720px){.open-sl{font-size:27px}}
.open-p{margin:0 0 20px;color:var(--dim);font-size:15px;max-width:48rem}
.open-f{display:grid;gap:0;margin:24px 0 0;border-top:1px solid var(--line)}
@media (min-width:640px){.open-f{grid-template-columns:1fr 1fr 1fr 1fr;gap:0 20px}}
.open-f div{padding:13px 0;border-bottom:1px solid var(--line)}
.open-f dt{font-family:var(--mono);font-size:14px;font-weight:700;color:var(--accDk)}
.open-f dd{margin:3px 0 0;font-size:12.5px;color:var(--dim)}
.pair{display:grid;gap:24px}
@media (min-width:780px){.pair{grid-template-columns:1fr 1fr}}
.pair-h{margin:0 0 11px;font-size:13px;font-weight:800;letter-spacing:.05em;color:var(--accDk);font-family:var(--mono)}
.pair ul{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.pair li{border-bottom:1px solid var(--line)}
.pair a{display:flex;justify-content:space-between;gap:10px;align-items:baseline;padding:10px 2px;color:var(--ink)}
.pair a:hover{text-decoration:none;color:var(--accDk)}
.pair b{font-size:15px}
.pair span{font-size:11px;color:var(--dim);font-family:var(--mono)}

/* ── 글 ────────────────────────────────────────────── */
.writ{max-width:46rem}
.writ h2{margin:30px 0 12px;font-size:19px;font-weight:800;color:var(--accDk)}
.writ p{margin:0 0 1em}
.writ ul{margin:0 0 1em;padding-left:1.1em;color:var(--dim)}
.cards{list-style:none;margin:0;padding:0;display:grid;gap:0;border-top:1px solid var(--line)}
.cards li{border-bottom:1px solid var(--line)}
.cards a{display:block;padding:14px 2px;color:var(--ink)}
.cards a:hover{text-decoration:none}
.cards a:hover b{color:var(--accDk)}
.cards b{display:block;font-size:16px;font-weight:800;margin-bottom:5px}
.cards p{margin:0;font-size:13.5px;color:var(--dim)}
.cards time{display:block;margin-top:7px;font-family:var(--mono);font-size:11px;color:var(--acc)}
.papers h2{margin:26px 0 9px;font-size:17px;font-weight:800;color:var(--accDk)}
.papers p,.papers li{font-size:14.5px;color:var(--dim)}
.papers ul,.papers ol{padding-left:1.2em;margin:0 0 1em}
.stamp{max-width:var(--w);margin:0 auto;padding:14px 20px 0;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.bot{background:var(--accDk);color:#E8EFD6;margin-top:0}
.bot a{color:#D7E89B}
.bot-in{max-width:var(--w);margin:0 auto;padding:32px 20px 24px;display:grid;gap:26px}
@media (min-width:860px){.bot-in{grid-template-columns:1.4fr 1fr 1fr}}
.bt-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.24em;color:#B9CE72}
.bt-nm{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.bt-say{margin:0 0 14px;font-size:13.5px;opacity:.86}
.bt-run{margin:12px 0 0;font-size:12px;font-family:var(--mono);opacity:.75}
.bt-ul{list-style:none;margin:0;padding:0;display:grid;gap:6px;font-size:13.5px}
.bt-ul time{display:block;font-family:var(--mono);font-size:10px;opacity:.6}
.bt-chip{list-style:none;margin:0 0 12px;padding:0;display:flex;flex-wrap:wrap;gap:5px 8px;font-size:13px}
.bt-sm{margin:10px 0 0;font-size:12px;opacity:.75}
.bot-end{border-top:1px solid rgba(255,255,255,.16)}
.bot-end div{max-width:var(--w);margin:0 auto;padding:18px 20px}
.bt-biz{margin:0 0 8px;font-size:12px;opacity:.78}
.bt-dim{opacity:.55}
.bt-ai{margin:0 0 8px;font-size:12px;opacity:.78;line-height:1.7}
.bt-ai strong{color:#D7E89B}
.bt-cr{margin:0;font-size:11.5px;opacity:.62}

/* ── 아래 고정 ─────────────────────────────────────── */
.pin{position:fixed;left:0;right:0;bottom:0;z-index:40;background:var(--card);border-top:1px solid var(--line);
  padding:9px 16px calc(9px + env(safe-area-inset-bottom));display:flex;align-items:center;gap:12px;transition:transform .2s}
.pin.off{transform:translateY(130%)}
.pin-s{font-size:11px;color:var(--dim);white-space:nowrap;font-family:var(--mono)}
@media (min-width:900px){.pin{display:none}}
@media print{.pin,.mn,.call{display:none}}
`;

const JS = `(function(){
  /* 발이 보이면 아래 고정 줄을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.pin'),ft=document.querySelector('.bot');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('off',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 들고 나는 결 — 길이가 다른 세로 막대 셋 */
const BARS = (c) => `<g fill="${c}"><rect x="3" y="14" width="5" height="12"/><rect x="11" y="4" width="5" height="22"/><rect x="19" y="10" width="5" height="16"/></g>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="${t.accDk}"/>${BARS('#D7E89B')}</svg>`;
const LOGO = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 48"><rect width="230" height="48" fill="${t.card}"/><g transform="translate(8,10)">${BARS(t.acc)}</g><text x="46" y="27" font-family="system-ui,sans-serif" font-size="19" font-weight="800" fill="${t.ink}">레스트펄스</text><text x="46" y="39" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.dim}">RESTPULSE</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<rect x="0" y="0" width="1200" height="96" fill="${t.accDk}"/>
<g transform="translate(70,160) scale(4.2)">${BARS(t.acc)}</g>
<text x="70" y="62" font-family="ui-monospace,monospace" font-size="24" letter-spacing="6" fill="#D7E89B">RESTPULSE</text>
<text x="70" y="360" font-family="system-ui,sans-serif" font-size="56" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="70" y="424" font-family="system-ui,sans-serif" font-size="30" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="70" y="470" font-family="ui-monospace,monospace" font-size="24" fill="${t.accDk}">서울 · 인천 · 경기 · 부산 동읍까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="70" y="504" width="432" height="68" rx="34" fill="${t.acc}"/>
<text x="106" y="532" font-family="ui-monospace,monospace" font-size="15" letter-spacing="4" fill="#E8EFD6">${cfg.telLabel}</text>
<text x="106" y="560" font-family="ui-monospace,monospace" font-size="27" font-weight="700" fill="#FFFFFF">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'pulse.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'pulse.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
