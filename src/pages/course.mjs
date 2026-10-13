import { layout, band } from '../lib/html.mjs';
import { esc, hash, won, josa, km2 } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import { factTable, faqBlock, stepList, noticeBlock, longtail, telCta, courseGrid } from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/* ★동·읍 × 코스는 만들지 않는다. 1,275 × 8 = 1만 쪽이 되는데 자리가 바뀌어도
   코스 설명이 같아 전부 얇은 조합 쪽이 된다(도어웨이로 읽힌다).
   코스는 전국 한 장 + 시도별 한 장까지만 낸다. */

const OIL_NOTE = {
  true: '기름을 쓰는 코스입니다. 끝나고 씻으실 수 있는 상황인지만 먼저 헤아려 주십시오.',
  false: '기름을 쓰지 않습니다. 옷을 걸친 채 받으시고 마치는 대로 일어서시면 됩니다.',
};
const PRESSURE_NOTE = [
  '힘 세기는 받는 도중에 손봅니다. 십 분쯤 지나면 어느 선이 맞는지 서로 알게 됩니다.',
  '표에 적힌 세기는 출발선일 뿐입니다. 삼키지 마시고 그때그때 알려 주시는 쪽이 훨씬 낫습니다.',
  '같은 힘도 받는 분에 따라 전혀 다르게 옵니다. 적힌 등급보다 그날 몸 상태가 앞섭니다.',
];
const WHY = [
  (c) => `${c.ko}${josa(c.ko, '을/를')} 짚으시는 분은 대개 ${c.for} 거십니다.`,
  (c) => `${c.for} 어울리는 코스입니다. 사정이 다르면 통화에서 다른 쪽으로 바꿔 드립니다.`,
  (c) => `${c.for} 이쪽을 권해 드립니다. 고르신 뒤에 바꾸셔도 되고, 셈은 마지막에 정해진 코스로 합니다.`,
];

/* ── 코스 한 장 ───────────────────────────────────────────────── */
export function coursePage(ctx, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `course/${c.slug}`;
  const h = hash(seed, 'cp');

  const fc = {
    place: '사시는 곳', hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const lead = `<div class="intro">
  <p>${esc(at(h, WHY, 0)(c))} ${esc(c.lines[0])}</p>
  <p>${esc(c.lines[1])} ${esc(c.lines[2])}</p>
  <p>${esc(OIL_NOTE[String(c.oil)])} ${esc(at(h, PRESSURE_NOTE, 1))}</p>
</div>`;

  const facts = band('fact', 'course', `${esc(c.ko)} 숫자 요약`,
    factTable([
      ['기본 길이', `${c.min}분`],
      ['값', `${won(c.price)}원 — 어느 지역이든 한 가지`],
      ['힘 세기', esc(c.pressure)],
      ['손놀림', esc(c.tempo)],
      ['손이 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '쓰지 않습니다'],
      ['챙기실 것', c.oil ? '수건 두 장과 누울 자리' : '누울 자리 하나 — 수건은 한 장이면 됩니다'],
      ['여는 시각', `${esc(cfg.hours)} · 셈 ${esc(cfg.pay)} · 닿기까지 ${esc(cfg.arrive)}`],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const others = courses.filter((x) => x.slug !== c.slug);
  const compare = band('cmp', 'compare', `다른 코스와 무엇이 다른가`,
    `<table class="cross"><thead><tr><th scope="col">코스</th><th scope="col">분</th><th scope="col">값</th><th scope="col">힘</th><th scope="col">기름</th></tr></thead>
     <tbody>
      <tr class="cur"><th scope="row">${esc(c.ko)}</th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>
      ${others.map((x) => `<tr><th scope="row"><a href="/course/${x.slug}/">${esc(x.ko)}</a></th><td>${x.min}분</td><td>${won(x.price)}원</td><td>${esc(x.pressure)}</td><td>${x.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}
     </tbody></table>`,
    '시간이 길다고 힘이 센 것이 아닙니다. 두 칸을 따로 보십시오.', '01');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 5, '03');

  const pool = [];
  for (const r of regions) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  for (const r of regions) {
    if (!r.main) continue;
    for (const g of r.gu) pool.push({ label: `${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, c.ko, seed),
    compare,
    stepList(seed, '02'),
    faqHtml,
    noticeBlock(seed, '04'),
    longtail(pool, seed, 22, 'regions', `지역을 짚어 ${c.ko} 보기`, '시도 이름을 짚으시면 그 지역 쪽으로 넘어갑니다.', '05'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.course(c),
      desc: clampDesc(desc.course(c)),
      h1: `${esc(c.ko)} <span class="hdl-s">기본 ${c.min}분에 ${won(c.price)}원, 힘 세기 ${esc(c.pressure)}</span>`,
      body,
      pageKind: 'course',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '코스', url: `${siteUrl}/course/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${c.ko} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.course(c)),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}

/* ── 시도 × 코스 ──────────────────────────────────────────────── */
export function sidoCoursePage(ctx, sd, c) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/course/${c.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/course/${c.slug}`;
  const h = hash(seed, 'sc');

  const fc = {
    place: sd.name, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = [
    `${sd.name} 안쪽이라면 번지가 어디든 ${c.ko}${josa(c.ko, '은/는')} ${c.min}분 ${won(c.price)}원입니다. 거리로 숫자를 흔들지 않습니다.`,
    `${c.ko} 구성은 ${sd.name} 어디서 거시든 똑같이 갑니다. 달라지는 것은 문 앞까지 드는 시간뿐입니다.`,
    `${sd.name}에서 오는 ${c.ko} 연락도 같은 번호로 받습니다. ${c.min}분 ${won(c.price)}원으로 셉니다.`,
  ];
  const second = sd.main
    ? `${sd.name}은 동·읍 ${sd.spotCount}칸까지 쪽을 냈습니다. 사시는 칸을 짚으면 시 테두리에서 얼마나 들어와 있는지가 뜨는데, 바깥에서 붙일지 안쪽에서 돌릴지가 거기서 갈립니다.`
    : `${sd.name}은 시군구 ${sd.gu.length}곳에서 멈췄습니다. 동 이름은 그 안쪽 목록에 담아 두었으니 통화에서 그대로 불러 주시면 됩니다.`;

  const lead = `<div class="intro">
  <p>${esc(at(h, open, 0))}</p>
  <p>${esc(second)}</p>
  <p>${esc(c.lines[(parseInt(h.substr(3, 3), 16)) % c.lines.length])}</p>
</div>`;

  const facts = band('fact', 'course', `${esc(sd.name)} ${esc(c.ko)} 숫자 요약`,
    factTable([
      ['지역', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
      ['쪽을 낸 층', sd.main ? `시군구 ${sd.gu.length} → 동·읍 ${sd.spotCount}` : `시군구 ${sd.gu.length}`],
      ['기본 길이', `${c.min}분`],
      ['값', `${won(c.price)}원 — ${esc(sd.name)} 안쪽 한 가지`],
      ['힘 세기와 손놀림', `${esc(c.pressure)} / ${esc(c.tempo)}`],
      ['손이 머무는 자리', esc(c.focus)],
      ['기름', c.oil ? '씁니다' : '쓰지 않습니다'],
      ['받는 땅', km2(sd.area)],
    ]), esc(at(h, SEC.factSub, 7)), '00');

  const { html: faqHtml, qa } = faqBlock(seed, fc, 4, '02');

  /* ★시군구가 한두 곳뿐인 서브 시도는 이것만으로 링크가 스무 개가 안 된다.
     다른 시도의 같은 코스 쪽을 함께 걸어 얇은 쪽이 생기지 않게 한다. */
  const pool = [];
  for (const g of sd.gu) pool.push({ label: `${g.name} ${c.ko}`, href: `/${sd.slug}/${g.slug}/` });
  for (const x of courses) {
    if (x.slug === c.slug) continue;
    pool.push({ label: `${sd.name} ${x.ko}`, href: `/${sd.slug}/course/${x.slug}/` });
  }
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  }

  const body = [
    lead,
    facts,
    telCta(cfg, `${sd.name} ${c.ko}`, seed),
    courseGrid(courses, seed, sd.name, '01'),
    faqHtml,
    stepList(seed, '03'),
    longtail(pool, seed, 20, 'nearby', `${sd.name}에서 이어 볼 곳`, null, '04'),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sidoCourse(sd, c),
      desc: clampDesc(desc.sidoCourse(sd, c)),
      h1: `${esc(sd.name)} ${esc(c.ko)} <span class="hdl-s">출장마사지 홈타이, 기본 ${c.min}분에 ${won(c.price)}원</span>`,
      body,
      pageKind: 'sidocourse',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '받는 자리', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: c.ko, url },
      ],
      jsonld: [
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${c.ko} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sidoCourse(sd, c)),
          areaServed: { '@type': 'AdministrativeArea', name: sd.full },
          courses: [c],
        }),
        S.faqPage(url, qa),
      ],
    }),
  };
}
