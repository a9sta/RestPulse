import { layout, band, telBtn } from '../lib/html.mjs';
import { esc, hash, km2, won, shuffle } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseGrid, stepList, factTable, faqBlock, noticeBlock,
  longtail, telCta, siteLinks,
} from '../lib/blocks.mjs';
import { SEC } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="open" aria-label="처음 안내">
  <p class="open-sl">${esc(cfg.brand.slogan)}</p>
  <p class="open-p">매장이 없습니다. 거시면 관리사가 그 주소로 갑니다. 수도권과 부산은 동과 읍을 한 칸씩 갈라 적었고, 대전·대구·울산과 지정한 시·군은 시군구에서 멈춰 적었습니다.</p>
  ${telBtn(cfg, { size: 'l' })}
  <dl class="open-f">
    <div><dt>${esc(cfg.hours)}</dt><dd>시곗바늘을 가리지 않습니다</dd></div>
    <div><dt>${esc(cfg.pay)}</dt><dd>셈은 다 끝나고</dd></div>
    <div><dt>${esc(cfg.arrive)}</dt><dd>문 앞에 닿기까지</dd></div>
    <div><dt>동·읍 ${counts.spot}칸</dt><dd>시군구 ${counts.gu}곳에 나뉘어</dd></div>
  </dl>
</section>`;

  const areaBlock = band('area', 'where', '어느 지역에서 거시나요',
    `<div class="pair">
      <div>
        <p class="pair-h">동읍 한 칸까지</p>
        <ul class="">${main.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length} / 동읍 ${r.spotCount}</span></a></li>`).join('\n')}</ul>
      </div>
      <div>
        <p class="pair-h">시군구 선까지</p>
        <ul class="">${sub.map((r) => `<li><a href="/${r.slug}/"><b>${esc(r.name)}</b><span>시군구 ${r.gu.length}</span></a></li>`).join('\n')}</ul>
      </div>
    </div>
    <p class="bd-tail">층이 갈려도 거는 번호와 내는 숫자는 하나입니다. <a href="/area/">받는 자리 전부</a>를 한 장에 모아 두었습니다.</p>`,
    '층을 둘로 둔 것은 글을 적어 둔 세밀함이 다를 뿐, 가는 지역을 가린 것이 아닙니다.', '01');

  const whyBlock = band('why', 'method', '왜 바깥선부터 재나요?',
    `<div class="intro">
      <p>동 쪽을 열면 그 자리의 <strong>바깥선까지의 거리</strong>가 적혀 있습니다. 그 동이 속한 시·도의 바깥 테두리에서 동 복판까지 그은 가장 짧은 선의 길이입니다.</p>
      <p>이 값이 크면 시 바깥에서 들어오는 차가 경계를 넘고도 한참 더 달려야 합니다. 작으면 옆 시군에서 바로 넘어오는 쪽이 빠릅니다. 결국 <strong>어느 쪽에서 붙일지</strong>를 고르는 데 쓰는 숫자이고, 그 선택이 몇 분을 가릅니다.</p>
      <p>모두 공개 경계 자료를 100m 바둑판에 올려 재어 나온 값이고, 같은 자료로 다시 재면 같은 값이 나옵니다. 재는 방법은 <a href="/magazine/what-is-the-rim-distance/">기록에 적어 두었습니다</a>.</p>
    </div>`, null, '02');

  const postBlock = band('note', 'notes', '걸기 전에 읽어 두면 좋은 글',
    `<ul class="cards">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="bd-tail"><a href="/magazine/">기록 전부 보기</a></p>`,
    '체험담이 아닙니다. 걸기 전에 알아 두면 수월해지는 것만 골라 적었습니다.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 계신 곳'), 6, '06');

  const pool = [];
  for (const r of regions) {
    if (r.main) for (const g of r.gu) for (const s of g.spots) pool.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
    else for (const g of r.gu) pool.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  }

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseGrid(courses, seed, '부르시는 곳', '03'),
    stepList(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    longtail(pool, seed, 30, 'popular', '자주 들어오는 자리', null, '08'),
    telCta(cfg, '지금 계신 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="hdl-s">서울·인천·경기·부산 동읍 ${counts.spot}곳 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/`, qa),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const lead = `<div class="intro">
  <p>쪽을 낸 자리를 모두 여기에 펼쳐 두었습니다. 시군구 ${counts.gu}곳과 동·읍 ${counts.spot}칸입니다. 면 ${counts.myeon}칸에는 쪽을 내지 않았지만 전화도 발길도 그대로 닿습니다.</p>
  <p>수도권과 부산은 동·읍을 한 칸씩 짚어 보실 수 있습니다. 나머지 지역은 시군구 쪽 안에 동 이름을 목록으로 넣었습니다. 층이 갈린 것은 연락이 몰리는 쪽을 더 잘게 쪼갠 결과입니다.</p>
</div>`;

  const blocks = regions.map((r, i) => band(`sd-${r.slug}`, r.main ? 'to dong' : 'to district', `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동·읍 ${r.spotCount}곳` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="col">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/"><span class="c-n">${esc(g.name)}</span><span class="c-m">동 ${g.dongCount}${g.myeonCount ? `+면 ${g.myeonCount}` : ''}</span></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}은 시군구를 짚으면 그 아래 동·읍이 이어집니다. 행정동 수를 전부 더하면 ${r.dongCount}칸입니다.`
      : `${r.name}은 시군구에서 멈춥니다. 행정동 ${r.dongCount}칸 이름은 그 시군구 쪽 안에 담겨 있습니다.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 동네'), 4, '98');

  const body = [lead, telCta(cfg, '사시는 곳', seed), blocks, faqHtml, stepList(seed, '99')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `받는 자리 전부 <span class="hdl-s">시군구 ${counts.gu}곳, 그 아래 동·읍 ${counts.spot}칸</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '받는 자리', url: `${siteUrl}/area/` }],
      jsonld: [
        S.itemList(`${siteUrl}/area/#list`, '받는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.faqPage(`${siteUrl}/area/`, qa),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const lead = `<div class="intro">
  <p>모두 ${courses.length}가지입니다. 정하실 것은 셋입니다 — 세기, 길이, 기름 여부. 이 셋만 넘기시면 남은 것은 통화하면서 맞춥니다.</p>
  <p>제일 짧은 쪽은 ${esc(shortest.ko)} ${shortest.min}분, 제일 긴 쪽은 ${esc(longest.ko)} ${longest.min}분입니다. 시간이 길다고 힘이 센 것도, 숫자가 높다고 더 나은 것도 아닙니다. 그날 몸이 어느 쪽을 바라느냐의 문제입니다.</p>
</div>`;

  const table = band('all', 'table', `${courses.length}가지 한 표로`,
    `<table class="cross"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">금액</th><th scope="col">세기</th><th scope="col">속도</th><th scope="col">기름</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '값이 낮은 쪽부터 세웠습니다. 어느 지역에서 거시든 숫자가 바뀌지 않습니다.', '01');

  const pickBy = band('bycase', 'choose', '이럴 때는 무엇을 고르나요?',
    `<ul class="cards">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '고르신 뒤에 바꾸셔도 됩니다. 셈은 마지막에 정해진 코스로 합니다.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [lead, table, pickBy, telCta(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역을 짚어 코스 보기', null, '04')].join('\n');

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: title.page(`코스 ${courses.length}가지 출장마사지 홈타이`),
      desc: clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기와 길이, 기름 여부로 한 표에 세웠습니다. ${won(sorted[0].price)}원부터이고 지역에 따라 달라지지 않습니다.`),
      h1: `코스 ${courses.length}가지 <span class="hdl-s">세기와 길이, 기름 여부로 세운 표</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 금액 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const lead = `<div class="intro">
  <p>아래 표 하나가 전부입니다. 여기 없는 돈은 받지 않습니다.</p>
  <p>시 테두리 안쪽이든 바깥에서 한참 들어오든 숫자가 같습니다. 유난히 멀리 가는 날이 있어도 그 몫을 이용자께 넘기지 않기로 정했습니다.</p>
</div>`;

  const table = band('tbl', 'prices', '코스마다 기본 길이와 값',
    `<table class="cross"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">금액</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 칸은 견주어 보시라고 넣은 것입니다. 실제로 분을 떼어 셈하지는 않습니다.', '01');

  const noExtra = band('nox', 'never', '표 밖에서 붙는 돈',
    `<ul class="heed">
      <li>오가는 기름값 — 거리가 얼마든 따로 받지 않습니다.</li>
      <li>새벽 웃돈 — 동트기 전에 거셔도 표의 숫자 그대로입니다.</li>
      <li>명절과 공휴일 웃돈 — 달력으로 숫자를 올리지 않습니다.</li>
      <li>선금 — 예약금으로도 보증금으로도 받지 않습니다.</li>
      <li>무르실 때 무는 돈 — 옮기셔도 접으셔도 없습니다.</li>
      <li>주차 요금 — 관리사가 부담합니다.</li>
    </ul>`,
    '계좌를 먼저 불러 주는 연락은 저희 쪽이 아닙니다.', '02');

  const pay = band('how', 'payment', '셈은 어떻게 하나요?',
    factTable([
      ['셈하는 때', '다 끝난 자리에서'],
      ['수단', '현금도 카드도 — 가리지 않고 같은 숫자'],
      ['영수증', '달라고 하시면 드립니다'],
      ['길게 받으실 때', '전화에서 미리 잡으시면 늘어난 만큼 더합니다'],
      ['두 분이 받으실 때', '한 분씩 따로 셉니다. 묶음값이 없습니다'],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '사시는 자리'), 4, '04');

  const body = [lead, table, noExtra, pay, telCta(cfg, '금액 확인', seed), faqHtml, siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`금액표 ${won(sorted[0].price)}원부터`),
      desc: clampDesc(`코스마다 기본 길이와 값을 적었습니다. ${won(sorted[0].price)}원부터이고 기름값·심야 웃돈·예약금이 붙지 않습니다. 끝난 뒤 현금이나 카드로 받습니다.`),
      h1: `값 <span class="hdl-s">${won(sorted[0].price)}원에서 시작하고 표 밖에서 붙는 것이 없습니다</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '금액', url: `${siteUrl}/price/` }],
      jsonld: [S.faqPage(`${siteUrl}/price/`, qa)],
    }),
  };
}

/* ── 이용안내 ─────────────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const lead = `<div class="intro">
  <p>처음 이용하시는 분께 맞춰 적었습니다. 통화 한 번이면 끝나는 일이라 길게 보실 것이 없습니다.</p>
</div>`;

  const what = band('need', 'ready', '집에 뭐가 있어야 하나요?',
    `<ul class="heed">
      <li>누울 자리 — 방바닥이든 침대든 괜찮습니다.</li>
      <li>수건 두 장 — 집에 있는 것으로 충분하고, 기름 안 쓰는 코스면 한 장이면 됩니다.</li>
      <li>닫히는 문이 있는 방 하나 — 식구가 같이 계셔도 상관없습니다.</li>
    </ul>
    <p class="bd-tail">깔개와 기름, 접는 베드는 관리사가 들고 갑니다. 미리 사 두실 것이 없습니다.</p>`,
    null, '01');

  const timing = band('when', 'hours', '언제 걸 수 있나요?',
    factTable([
      ['받는 때', `${esc(cfg.hours)} — 어느 시각이든 번호 하나`],
      ['닿는 때', `보통 ${esc(cfg.arrive)}, 안으로 더 들어갈수록 붙습니다`],
      ['옮기기', '언제든 하실 수 있고 무는 돈이 없습니다'],
      ['접기', '관리사가 이미 문 앞이면 그 사실만 알려 주십시오'],
      ['가장 몰리는 때', '금요일 밤과 토요일 밤'],
      ['가장 비는 때', '평일 낮 — 기다림이 거의 없습니다'],
    ]), null, '02');

  const refuse = band('no', 'declined', '어떤 때 돌려보내나요?',
    `<ul class="heed">
      <li>성적인 요구가 나올 때 — 통화를 바로 끝냅니다.</li>
      <li>열이 있거나 다친 데가 부었을 때 — 다른 날로 미뤄 드립니다.</li>
      <li>주소를 끝까지 말씀하지 않으실 때 — 누구를 어디로 보낼지 정할 수 없습니다.</li>
      <li>관리사 번호를 따로 달라고 하실 때.</li>
      <li>병원이 맞아 보일 때 — 그쪽부터 가시라고 말씀드립니다.</li>
      <li>만 열아홉 살 미만이실 때 — 받지 않습니다.</li>
    </ul>`,
    '돌려보낼 때에도 받는 돈은 없습니다.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르시는 곳'), 6, '05');

  const body = [lead, what, timing, stepList(seed, '04'), refuse, telCta(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('이용안내 — 부르는 법과 내는 법'),
      desc: clampDesc('처음 거실 때 알아야 할 것만 모았습니다. 준비물, 받는 시각, 돌려보내는 경우, 셈하는 법을 차례로 적었습니다.'),
      h1: `이용안내 <span class="hdl-s">통화 한 번이면 끝나는 차례</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용안내', url: `${siteUrl}/guide/` }],
      jsonld: [S.faqPage(`${siteUrl}/guide/`, qa)],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data, regions } = ctx;
  const seed = 'company';

  const lead = `<div class="intro">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 가게를 두지 않고 찾아가기만 하는 곳입니다. 여러 업소를 모아 보여 주는 목록 사이트가 아니라, 저희가 직접 받는 창구 하나로 돌립니다.</p>
  <p>이름은 쉼(rest)과 맥박(pulse)을 붙여 지었습니다. 쉬는 동안에도 몸은 제 박자로 돌아간다는 뜻이고, 들고 나는 결을 먼저 읽고 찾아간다는 뜻이기도 합니다.</p>
</div>`;

  const line = band('line', 'limits', '어디까지 하고 어디서 그만두나요?',
    `<ul class="heed">
      <li>하는 일 — 손으로 굳은 자리를 풀어 드리는 것까지.</li>
      <li>하지 않는 일 — 성적인 서비스는 어떤 형식으로도 없습니다.</li>
      <li>하지 않는 일 — 병을 가려내고 고치는 것은 의사가 할 일입니다.</li>
      <li>만 열아홉 살 미만은 받지 않습니다.</li>
      <li>화면에 없는 것 — 후기와 별점. 지어낸 글을 가려낼 길이 없습니다.</li>
      <li>화면에 없는 것 — 인물 사진. 실제와 다른 사진이 너무 흔합니다.</li>
      <li>먼저 나가는 돈 — 예약금도 보증금도 아예 없습니다.</li>
    </ul>`, null, '01');

  const how = band('data', 'sources', '숫자는 어디서 왔나요?',
    `<div class="intro">
      <p>지역 쪽의 땅 넓이와 바깥선까지의 거리는 모두 공개된 행정동 경계 자료를 계산해 뽑았습니다. 넓이는 경계 도형의 면적이고, 바깥선까지의 거리는 그 동이 속한 시·도의 테두리에서 동 복판까지 그은 가장 짧은 선입니다.</p>
      <p>재는 방식은 격자입니다. 시도에 속한 행정동을 전부 100m 바둑판에 칠하고, 칠하지 않은 칸까지 몇 칸인지를 셉니다. 경계선 선분을 세는 방식도 써 봤지만 원자료의 작은 어긋남에 통째로 끌려가 버려 접었습니다.</p>
      <p>몫(%)은 시도 전체 넓이를 기준으로 냅니다. 우리가 받는 넓이로 나누면 "공주시가 충남의 31%" 같은 사실이 아닌 수가 나오기 때문입니다.</p>
      <p>경계 자료가 갱신되면 다시 재고 화면의 숫자도 따라 바뀝니다. 손으로 쳐 넣은 칸이 한 군데도 없습니다.</p>
    </div>
    ${factTable([
      ['바탕 자료', esc(data.source)],
      ['자료 판 번호', esc(data.version)],
      ['재는 값', esc(data.axis)],
      ['쪽을 내는 범위', esc(data.coverageFrom)],
      ['쪽을 낸 층', `시도 ${counts.sido} / 시군구 ${counts.gu} / 동읍 ${counts.spot}`],
      ['쪽이 없는 층', `면 ${counts.myeon}칸 — 이름만 적음`],
      ['시도 가운데 받는 몫', regions.map((r) => `${r.name} ${r.coverPct}%`).join(' · ')],
    ])}`, null, '02');

  const body = [lead, line, how, telCta(cfg, '문의', seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}는 어떤 곳인가`),
      desc: clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 쪽 숫자를 어떤 자료로 어떻게 쟀는지 적었습니다.`),
      h1: `${esc(cfg.brand.ko)} 소개 <span class="hdl-s">그만두는 선과 자료 출처</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (이 글의 쓰임)', '레스트펄스(아래 "회사")가 하는 출장 방문 관리에 대하여 이용 조건과 차례, 회사와 이용자가 서로 지킬 것을 적어 둔 글입니다.'],
  ['제2조 (들어오는 길)', '접수는 사이트에 적힌 번호로 거시는 통화 하나로만 받습니다. 이 번호는 중계 번호라 거신 분의 전화번호가 관리사에게 그대로 건너가지 않습니다. 메신저와 게시판, 전자우편으로는 받지 않습니다.'],
  ['제3조 (하는 일)', '회사는 이용자가 알려 준 자리로 관리사를 보내 손으로 굳은 근육을 풀어 드립니다. 질병을 진단하거나 치료하는 행위는 하지 않으며, 성적인 서비스 또한 제공하지 않습니다.'],
  ['제4조 (이용할 수 있는 분)', '만 열아홉 살 이상만 이용하실 수 있습니다. 그보다 어린 분의 접수는 받지 않습니다.'],
  ['제5조 (지역 숫자를 어떻게 봐야 하는가)', '사이트에 적힌 땅 넓이와 바깥선까지의 거리는 공개된 행정동 경계 자료를 계산해 나온 값입니다. 길 사정이나 실제 이동 시간을 약속하는 값이 아니며 어림잡는 데에만 쓰셔야 합니다.'],
  ['제6조 (값과 셈)', '값은 사이트의 값 표와 같으며 지역에 따라 오르내리지 않습니다. 관리가 끝난 자리에서 현금이나 카드로 받고, 예약금이나 보증금처럼 앞서 내는 돈은 어떤 이름으로도 받지 않습니다.'],
  ['제7조 (옮기기와 접기)', '방문 전이라면 언제든 시각을 옮기거나 접으실 수 있고 무는 돈이 없습니다. 다만 관리사가 이미 문 앞에 닿은 뒤라면 그 사실을 바로 알려 주셔야 합니다.'],
  ['제8조 (회사가 돌려보낼 수 있는 때)', '다음에 해당하면 회사는 접수를 돌려보내거나 하던 관리를 멈출 수 있습니다. 하나, 성적인 서비스를 요구하실 때. 둘, 관리사에게 거친 말이나 힘을 쓰거나 개인 번호를 달라고 하실 때. 셋, 주소를 끝까지 말씀하지 않으실 때. 넷, 열이 있거나 상처가 벌어진 상태처럼 관리가 알맞지 않을 때.'],
  ['제9조 (이용자가 해 주실 일)', '누울 자리와 수건을 마련해 주시고, 관리에 영향을 줄 수 있는 몸 상태가 있으면 접수하실 때 알려 주셔야 합니다.'],
  ['제10조 (후기와 별점)', '회사는 후기나 별점을 모으지도 싣지도 않습니다. 이 사이트의 문장 가운데 특정 이용자의 경험을 옮긴 것은 하나도 없습니다.'],
  ['제11조 (책임의 범위)', '관리 중 회사의 과실로 생긴 손해는 회사가 책임집니다. 다만 사전에 알려 주지 않으신 건강 상태에서 비롯한 일, 그리고 자연재해나 통신 장애로 늦어진 일에는 책임이 미치지 않습니다.'],
  ['제12조 (약관이 바뀔 때)', '고칠 일이 생기면 사이트에 먼저 올리고 올린 날부터 적용합니다. 고친 뒤에 접수를 주시면 새 약관에 동의하신 것으로 봅니다.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="intro"><p>${esc(cfg.brand.ko)} 이용약관 전문입니다. 전화를 거시는 순간 아래 내용에 동의하신 것으로 봅니다.</p></div>`,
    band('terms', 'terms', '전문', `<div class="papers">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '약관 문의', 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관입니다. 들어오는 길, 하는 일, 값과 셈, 옮기기와 접기를 ${TERMS.length}개 조문에 담았습니다.`),
      h1: `이용약관 <span class="hdl-s">조문 ${TERMS.length}개</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['첫째. 전화에서 듣는 것', '적는 항목은 넷입니다 — 가실 주소, 닿을 번호, 고르신 코스, 바라시는 시각. 이름과 생년월일, 주민등록번호는 묻지 않습니다.'],
  ['둘째. 어디에 쓰는가', '받아 적은 것은 관리사를 배정하고 출발·도착을 알리는 데에만 씁니다. 나중에 안내 문자를 보내거나 먼저 연락을 드리는 일이 없습니다.'],
  ['셋째. 번호의 성격', '화면에 적힌 번호는 중계용입니다. 그래서 이용자의 번호가 관리사에게 그대로 전달되지 않습니다.'],
  ['넷째. 얼마나 두는가', '방문이 문제없이 끝나면 당일에 삭제합니다. 분쟁이 있었던 건만 처리가 마무리될 때까지 별도로 보관합니다.'],
  ['다섯째. 밖으로 돌리지 않음', '어떤 업체에도 제공하거나 위탁하지 않습니다. 법령에 따른 수사기관의 적법한 요청이 있을 때만 예외로 둡니다.'],
  ['여섯째. 저절로 쌓이는 것', '이 사이트는 미리 만들어 둔 파일을 그대로 내보내기만 합니다. 로그인도 장바구니도 댓글도 두지 않았고 광고 추적이나 방문자 분석 도구를 붙이지 않았습니다. 쿠키 또한 쓰지 않습니다.'],
  ['일곱째. 요구하실 수 있는 것', '어떤 내용을 가지고 있는지 열람하거나 삭제해 달라고 요구하실 수 있습니다. 같은 번호로 연락 주시면 그 통화에서 끝냅니다. 개인정보를 맡은 사람은 사업자 정보가 확정되는 대로 아래에 적습니다.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="intro"><p>분량이 적습니다. 애초에 받아 적는 항목이 넷뿐이기 때문입니다.</p></div>`,
    band('pp', 'privacy', '전문', `<div class="papers">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    telCta(cfg, '개인정보 문의', 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('전화에서 듣는 항목과 쓰는 곳, 두는 기간을 적었습니다. 쿠키도 추적 코드도 없는 정적 사이트입니다.'),
      h1: `개인정보처리방침 <span class="hdl-s">적는 항목은 주소·번호·코스·시각 넷</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 노트 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="intro"><p>부르기 전에 알면 덜 헤매실 것만 적습니다. 누가 받아 봤다는 소감은 올리지 않습니다.</p></div>`,
    band('list', 'notes', `쌓아 둔 글 ${list.length}편`,
      `<ul class="cards">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS 로도 함께 나갑니다.', '01'),
    telCta(cfg, '접수', 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('들머리 기록'),
      desc: clampDesc(`받기 전에 알아 두면 좋은 것들을 ${list.length}편에 나눠 적었습니다. 후기와 체험담은 싣지 않습니다.`),
      h1: `들머리 기록 <span class="hdl-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '기록', url: `${siteUrl}/magazine/` }],
      jsonld: [S.itemList(`${siteUrl}/magazine/#list`, '들머리 기록', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` })))],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="stamp"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 들머리 기록</p>`,
    `<article class="writ">${html}</article>`,
    telCta(cfg, '접수', p.slug),
    band('more', 'next', '다음으로 읽을 것',
      `<ul class="cards">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '기록', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="intro"><p>찾으시는 주소가 옮겨졌거나 처음부터 없던 자리입니다. 아래에서 다시 짚어 주십시오.</p></div>`,
    band('back', 'back', '많이 가는 쪽',
      `<ul class="mesh">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">받는 자리 전부</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">금액</a></li>
        <li><a href="/guide/">이용안내</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    telCta(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('그 주소에는 쪽이 없습니다'),
      desc: '주소가 옮겨졌거나 애초에 만든 적 없는 자리입니다.',
      h1: '그 주소에는 쪽이 없습니다',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
