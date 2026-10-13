import { layout, band } from '../lib/html.mjs';
import { esc, hash, km, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock, longtail,
  rimKin, spotIndex, myeonList, dongNameList, guIndex, nearList, telCta,
} from '../lib/blocks.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_A_EUP, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC, rimWord, gateWord, shareWord, strideWord,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 경계 자료를 재어 나온 사실이다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses } = ctx;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, kind: s.kind,
    area: km2(s.area), guArea: km2(g.area),
    rim: km(s.rim), rimRank: s.rimRank, sidoRank: s.sidoRimRank,
    share: s.share, shareRank: s.shareRank,
    rimNote: rimWord(s.rim), gateWord: gateWord(s.rim),
    shareNote: shareWord(s.share), stride: strideWord(s.area),
    guSpotCount: g.spotCount,
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동·읍 쪽 — 메인 네 시도에서만 낸다 ────────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const poolA = s.kind === '읍' ? SPOT_LEAD_A_EUP : SPOT_LEAD_A;
  const lead = `<div class="intro">
  <p>${at(h, poolA, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = band('fact', 'measured', `${esc(s.name)} 숫자로 보기`,
    factTable([
      ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['시군구', `<a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`],
      ['갈래', s.kind === '읍' ? '읍 — 군 안에서 집과 가게가 가장 빽빽한 자리' : '행정동'],
      ['땅', `${km2(s.area)} — ${esc(strideWord(s.area))}`],
      ['바깥선까지', `${km(s.rim)} · ${esc(sd.name)} 테두리에서 복판까지의 최단 거리`],
      ['깊이 차례', `${esc(g.name)} 안 ${s.rimRank}번째 · ${esc(sd.name)} 전체 ${s.sidoRimRank}번째`],
      ['구 안 몫', `${s.share}% — ${esc(shareWord(s.share))}`],
      ['여는 시각', `${esc(cfg.hours)} · 셈 ${esc(cfg.pay)} · 닿기까지 ${esc(cfg.arrive)}`],
    ]),
    esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) pool.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${g.name} ${s.name}`, seed),
    courseGrid(courses, seed, s.name, '01'),
    rimKin(sd, g, s, seed, '02'),
    spotIndex(sd, g, seed, s.slug, '03'),
    stepList(seed, '04'),
    guIndex(sd, seed, g.slug, '05'),
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 24, 'elsewhere', esc(at(h, SEC.crossHead, 8)), null, '08'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="hdl-s">출장마사지 홈타이 · ${esc(sd.name)} 테두리에서 ${km(s.rim)} 안쪽</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시군구 쪽 ────────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main,
    unitW: g.main ? '동·읍' : '행정동',
    unitN: g.main ? g.spotCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount, myeonCount: g.myeonCount,
    area: km2(g.area), share: g.share, rim: km(g.rim),
    inmost: g.inmost || '', inmostKm: g.inmostKm ? km(g.inmostKm) : '',
    outmost: g.outmost || '', outmostKm: g.outmostKm ? km(g.outmostKm) : '',
    widest: g.widest || '', widestPct: g.widestPct || 0,
    narrowest: g.narrowest || '', narrowestPct: g.narrowestPct || 0,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  // 같은 풀에서 둘을 뽑으므로 겹치지 않게 뒤 칸을 밀어 준다
  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const lead = `<div class="intro">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['시도', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}칸`],
    g.main ? ['쪽을 낸 동·읍', `${g.spotCount}칸`] : ['쪽을 낸 층', '시군구까지 — 동 이름은 이 쪽 목록에'],
    ['면', g.myeonCount ? `${g.myeonCount}칸 — 이름만 올림` : '없음'],
    ['땅', km2(g.area)],
    ['시도에서 쥔 몫', `${g.share}% — ${esc(sd.name)} 전체를 100으로 놓았을 때`],
    ['바깥선까지', `${km(g.rim)} — ${esc(sd.name)} 테두리에서 구 복판까지`],
    ['여는 시각', `${esc(cfg.hours)} · 셈 ${esc(cfg.pay)}`],
  ];
  if (g.main && g.inmost) {
    rows.splice(7, 0,
      ['가장 깊이 든 자리', `<a href="/${sd.slug}/${g.slug}/${g.inmostSlug}/">${esc(g.inmost)}</a> ${km(g.inmostKm)}`],
      ['경계에 가장 붙은 자리', `<a href="/${sd.slug}/${g.slug}/${g.outmostSlug}/">${esc(g.outmost)}</a> ${km(g.outmostKm)}`],
      ['땅을 가장 많이 쥔 자리', `<a href="/${sd.slug}/${g.slug}/${g.widestSlug}/">${esc(g.widest)}</a> ${g.widestPct}%`]);
  }
  const facts = band('fact', 'measured', `${esc(g.name)} 숫자로 보기`, factTable(rows), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '05');

  const pool = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${g.name}`, seed),
    g.main ? spotIndex(sd, g, seed, null, '01') : dongNameList(g, seed, '01'),
    myeonList(g, seed, '02'),
    courseGrid(courses, seed, g.name, '03'),
    nearList(sd, g, seed, '04'),
    faqHtml,
    stepList(seed, '06'),
    noticeBlock(seed, '07'),
    guIndex(sd, seed, g.slug, '08'),
    longtail(pool, seed, 20, 'districts', '옆 시군구에서 받는 자리', null, '09'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="hdl-s">출장마사지 홈타이 — ${g.main ? `동·읍 ${g.spotCount}칸까지 쪽을 냈습니다` : `행정동 ${g.dongCount}칸 전부 방문합니다`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.main && g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동·읍`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 쪽 ──────────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byShare = sd.gu.slice().sort((a, b) => b.share - a.share);

  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, myeonCount: sd.myeonCount,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lead = `<div class="intro"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const facts = band('fact', 'measured', `${esc(sd.name)} 숫자로 보기`,
    factTable([
      ['행정 명칭', esc(sd.full)],
      ['쪽을 낸 층', sd.main ? '시군구 → 동·읍' : '시군구까지'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}칸`],
      sd.main ? ['쪽을 낸 동·읍', `${sd.spotCount}칸`] : ['동 이름', '시군구 쪽 목록 안에'],
      ['면', sd.myeonCount ? `${sd.myeonCount}칸 — 시군구 쪽에 이름만` : '없음'],
      ['받는 땅', `${km2(sd.area)} / 시도 전체 ${km2(sd.realArea)} 가운데 ${sd.coverPct}%`],
      ['가장 깊은 자리', sd.rimMaxName ? `${esc(sd.rimMaxName)} — 테두리에서 ${km(sd.rimMax)}` : '동 쪽을 내지 않은 지역'],
      ['몫이 가장 큰 시군구', `<a href="/${sd.slug}/${byShare[0].slug}/">${esc(byShare[0].name)}</a> ${byShare[0].share}%`],
      ['여는 시각', `${esc(cfg.hours)} · 셈 ${esc(cfg.pay)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '05');

  const csLinks = band('sidocourse', 'courses', `${esc(sd.name)}에서 고를 수 있는 코스`,
    `<ul class="mesh">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)}에서 ${esc(x.ko)} 부르기</a></li>`).join('\n')}\n</ul>`,
    `코스에 따라 손이 오래 머무는 데가 달라집니다. ${esc(sd.name)} 안쪽이라면 값은 하나입니다.`, '03');

  let pickBlock = '';
  if (sd.main) {
    const deep = [];
    for (const g of sd.gu) for (const s of g.spots) deep.push({ g, s });
    deep.sort((a, b) => b.s.rim - a.s.rim);
    pickBlock = band('deep', 'inland', `${esc(sd.name)}에서 테두리와 가장 먼 동·읍`,
      `<ul class="mesh">\n${deep.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)} ${km(x.s.rim)}</a></li>`).join('\n')}\n</ul>`,
      `시 바깥에서 들어오면 경계를 넘고도 이만큼 더 달려야 하는 자리입니다. 나머지 ${sd.spotCount}칸은 시군구를 짚어 들어가십시오.`, '02');
  } else {
    const byDong = sd.gu.slice().sort((a, b) => b.dongCount - a.dongCount);
    pickBlock = band('gupick', 'dense', `${esc(sd.name)}에서 주소가 가장 촘촘한 곳`,
      `<ul class="mesh">\n${byDong.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)} 행정동 ${g.dongCount}칸</a></li>`).join('\n')}\n</ul>`,
      '행정동이 많다는 것은 같은 땅을 더 잘게 나눠 썼다는 뜻입니다.', '02');
  }

  const pool = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) pool.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, sd.name, seed),
    guIndex(sd, seed, null, '01'),
    pickBlock,
    csLinks,
    courseGrid(courses, seed, sd.name, '04'),
    faqHtml,
    stepList(seed, '06'),
    longtail(pool, seed, 20, 'provinces', '다른 시도에서 받는 자리', null, '07'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="hdl-s">출장마사지 홈타이, ${sd.main ? `동·읍 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.faqPage(url, qa),
      ],
    }),
  };
}
