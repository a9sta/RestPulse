/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동·읍마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   면(面)은 어느 층에서도 쪽을 내지 않는다. 이름만 적고 접수는 받는다.
 *
 * ★★이 사이트가 쓰는 사실은 **바깥선까지 남은 거리**다.
 *   시도의 바깥선 = 그 시도 안 행정동 경계선 가운데 **한 번만 나오는 선분**.
 *   두 번 나오는 선분은 같은 시도 안 두 동이 나눠 가진 안쪽 선이고,
 *   한 번만 나오는 선분이 시도를 둘러싼 테두리다.
 *   거기서 동 복판까지 몇 km 인지를 잰다. 바깥에서 들어오는 차가
 *   시 경계를 넘고도 더 달려야 하는 몫에 가장 가까운 숫자다.
 *
 *   함께 적는 값 — 그 동이 시군구 넓이에서 차지하는 **몫(%)**,
 *   시군구가 시도 넓이에서 차지하는 **몫(%)**, 시도 안 깊이 차례.
 *
 *   앞서 만든 일곱 사이트의 축(중심점 거리·방위·면적순위·행정동 수·구 사이 거리·
 *   끝과 끝 거리·맞닿음·가로세로 폭·둘레·뭉침·안쪽 깊이·매듭점)과 겹치지 않는다.
 *   저쪽은 동 하나를 들여다본 값이고, 이쪽은 **시도 전체를 놓고 잰 값**이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ─────────────────────────────────────────────────── */
const R = 6371.0088;
const rad = (d) => (d * Math.PI) / 180;
function haversine(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function ringStats(ring, lat0) {
  const kx = Math.cos(rad(lat0)) * 111.32, ky = 110.574;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length - 1; i < n; i++) {
    const x1 = ring[i][0] * kx, y1 = ring[i][1] * ky;
    const x2 = ring[i + 1][0] * kx, y2 = ring[i + 1][1] * ky;
    const f = x1 * y2 - x2 * y1;
    a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  a /= 2;
  if (!a) return { area: 0, cx: 0, cy: 0 };
  return { area: a, cx: cx / (6 * a), cy: cy / (6 * a), kx, ky };
}
function shapeStats(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const lat0 = polys[0][0][0][1];
  let A = 0, X = 0, Y = 0, kx = 0, ky = 0;
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const st = ringStats(ring, lat0);
      if (!st.area) return;
      kx = st.kx; ky = st.ky;
      const sign = (idx === 0 ? 1 : -1) * Math.abs(st.area);
      A += sign; X += st.cx * sign; Y += st.cy * sign;
    });
  }
  if (!A) return null;
  return { area: Math.abs(A), lng: (X / A) / kx, lat: (Y / A) / ky };
}
/** 점에서 선분까지의 거리(평면 근사·km) */
function segDist(px, py, ax, ay, bx, by, kx, ky) {
  const PX = px * kx, PY = py * ky, AX = ax * kx, AY = ay * ky, BX = bx * kx, BY = by * ky;
  const dx = BX - AX, dy = BY - AY;
  const L = dx * dx + dy * dy;
  let t = L ? ((PX - AX) * dx + (PY - AY) * dy) / L : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(PX - (AX + t * dx), PY - (AY + t * dy));
}
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const r3 = (v) => Math.round(v * 1000) / 1000;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 시도 바깥선까지의 거리 ──────────────────────────────────
   ★처음에는 "한 번만 나오는 선분"을 바깥선으로 삼았는데 틀렸다. 원자료에 이웃끼리
     꼭짓점이 어긋난 자리가 몇 군데 있어, 서울 한복판(용산 언저리)에 가짜 테두리가
     생기고 명동이 '바깥선 3.2km'로 찍혔다. 선분을 세는 방식은 자료의 작은 흠에
     통째로 끌려간다.
   ⇒ **격자로 바꿨다.** 시도에 속한 행정동을 전부 100m 격자에 칠한 다음, 칠해지지
     않은 칸(= 시도 바깥)까지의 거리를 재는 방식이다. 꼭짓점이 몇 개 어긋나도
     칠한 넓이는 그대로이므로 값이 흔들리지 않는다. */
const RAD_ = rad;
function fillRaster(feats, CELL = 0.1) {
  let w = 1e9, e = -1e9, s0 = 1e9, n0 = -1e9;
  for (const ft of feats) {
    const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
    for (const poly of polys) for (const c of poly[0]) {
      if (c[0] < w) w = c[0]; if (c[0] > e) e = c[0];
      if (c[1] < s0) s0 = c[1]; if (c[1] > n0) n0 = c[1];
    }
  }
  const kx = Math.cos(RAD_((s0 + n0) / 2)) * 111.32, ky = 110.574;
  const x0 = w * kx - CELL, y0 = s0 * ky - CELL;
  const W = Math.ceil((e * kx - x0) / CELL) + 2;
  const H = Math.ceil((n0 * ky - y0) / CELL) + 2;
  const inside = new Uint8Array(W * H);
  const xs = [];
  for (const ft of feats) {
    const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
    for (const poly of polys) {
      // 고리를 전부 모아 홀짝 규칙으로 한 번에 칠한다(구멍이 저절로 비워진다)
      const edges = [];
      let ys = 1e9, yn = -1e9;
      for (const ring of poly) {
        for (let i = 0, m = ring.length - 1; i < m; i++) {
          const ax = ring[i][0] * kx, ay = ring[i][1] * ky;
          const bx = ring[i + 1][0] * kx, by = ring[i + 1][1] * ky;
          if (ay === by) continue;
          edges.push(ax, ay, bx, by);
          if (ay < ys) ys = ay; if (ay > yn) yn = ay;
          if (by < ys) ys = by; if (by > yn) yn = by;
        }
      }
      if (!edges.length) continue;
      const j0 = Math.max(0, Math.floor((ys - y0) / CELL));
      const j1 = Math.min(H - 1, Math.ceil((yn - y0) / CELL));
      for (let j = j0; j <= j1; j++) {
        const y = y0 + (j + 0.5) * CELL;
        xs.length = 0;
        for (let t = 0; t < edges.length; t += 4) {
          const ay = edges[t + 1], by = edges[t + 3];
          if ((ay <= y) === (by <= y)) continue;
          xs.push(edges[t] + ((y - ay) * (edges[t + 2] - edges[t])) / (by - ay));
        }
        if (xs.length < 2) continue;
        xs.sort((a, b) => a - b);
        for (let t = 0; t + 1 < xs.length; t += 2) {
          let i0 = Math.ceil((xs[t] - x0) / CELL - 0.5);
          let i1 = Math.floor((xs[t + 1] - x0) / CELL - 0.5);
          if (i1 < 0 || i0 > W - 1) continue;
          if (i0 < 0) i0 = 0; if (i1 > W - 1) i1 = W - 1;
          const base = j * W;
          for (let i = i0; i <= i1; i++) inside[base + i] = 1;
        }
      }
    }
  }
  /* 채움 거리 변환 — 칠하지 않은 칸까지 몇 칸인가(두 번 훑기·3-4 체임퍼) */
  const INF = 1e9;
  const dist = new Float32Array(W * H);
  for (let i = 0; i < dist.length; i++) dist[i] = inside[i] ? INF : 0;
  const A = 1, B = Math.SQRT2;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const p = j * W + i;
    if (!dist[p]) continue;
    let v = dist[p];
    if (i > 0) v = Math.min(v, dist[p - 1] + A);
    if (j > 0) v = Math.min(v, dist[p - W] + A);
    if (i > 0 && j > 0) v = Math.min(v, dist[p - W - 1] + B);
    if (i < W - 1 && j > 0) v = Math.min(v, dist[p - W + 1] + B);
    dist[p] = v;
  }
  for (let j = H - 1; j >= 0; j--) for (let i = W - 1; i >= 0; i--) {
    const p = j * W + i;
    if (!dist[p]) continue;
    let v = dist[p];
    if (i < W - 1) v = Math.min(v, dist[p + 1] + A);
    if (j < H - 1) v = Math.min(v, dist[p + W] + A);
    if (i < W - 1 && j < H - 1) v = Math.min(v, dist[p + W + 1] + B);
    if (i > 0 && j < H - 1) v = Math.min(v, dist[p + W - 1] + B);
    dist[p] = v;
  }
  return {
    at(lat, lng) {
      const i = Math.round((lng * kx - x0) / CELL - 0.5);
      const j = Math.round((lat * ky - y0) / CELL - 0.5);
      if (i < 0 || j < 0 || i >= W || j >= H) return 0;
      const v = dist[j * W + i];
      return v >= 1e8 ? 0 : v * CELL;
    },
  };
}
/** 시도이름(sidonm) → 격자. 한 번에 하나씩 만들고 다 쓰면 버린다. */
const NEEDED = new Set([...Object.values(MAIN), ...Object.values(SUB)].map((m) => m.src));
const featBySido = new Map();
for (const ft of geo.features) {
  const sn = ft.properties.sidonm;
  if (!NEEDED.has(sn)) continue;
  if (!featBySido.has(sn)) featBySido.set(sn, []);
  featBySido.get(sn).push(ft);
}
const rasterCache = new Map();
function rimDist(sn, lat, lng) {
  if (!rasterCache.has(sn)) rasterCache.set(sn, fillRaster(featBySido.get(sn) || []));
  return rasterCache.get(sn).at(lat, lng);
}

/* ── 시도 전체 넓이 ───────────────────────────────────────
   ★`only`(지정 시·군)와 뺀 군(옹진·군위)을 **걷어낸** 값이다. 몫(%)을 낼 때
     우리가 받는 넓이로 나누면 "공주시가 충남의 31%"처럼 사실이 아닌 수가 나온다. */
const sidoRealArea = new Map();
function sidoKeyOf(p) {
  for (const [short, m] of Object.entries(MAIN)) if (m.src === p.sidonm) return short;
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isG = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isG) continue;
      if (short === '전남' && isG) continue;
    }
    return short;
  }
  return null;
}
for (const ft of geo.features) {
  const k = sidoKeyOf(ft.properties);
  if (!k) continue;
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  sidoRealArea.set(k, (sidoRealArea.get(k) || 0) + st.area);
}

/* ── 레코드 만들기 ────────────────────────────────────────── */
const byCode = new Map();
const buckets = new Map();
const vertex = new Map();                    // 길 걸기용 이웃 판정에만 쓴다
const vkey = (c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`;
for (const ft of geo.features) {
  const p = ft.properties;
  const code = String(p.adm_cd2);
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const polys = ft.geometry.type === 'Polygon' ? [ft.geometry.coordinates] : ft.geometry.coordinates;
  const vs = new Set();
  for (const poly of polys) for (const ring of poly) for (const c of ring) vs.add(vkey(c));
  for (const k of vs) {
    if (!vertex.has(k)) vertex.set(k, new Set());
    vertex.get(k).add(code);
  }
  const [sidoKey, meta, isMain] = sidoOf(p);
  const st = shapeStats(ft.geometry);
  if (!st) continue;
  const rec = {
    code, name, kind: kindOf(name), sidoKey, isMain,
    sggnm: p.sggnm, sidonm: p.sidonm,
    lat: r6(st.lat), lng: r6(st.lng), area: r2(st.area),
  };
  if (sidoKey && isMain && rec.kind !== '면') rec.rim = r3(rimDist(p.sidonm, st.lat, st.lng));
  byCode.set(code, rec);
  if (!sidoKey) continue;
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  let A = 0, X = 0, Y = 0;
  for (const d of list) { A += d.area; X += d.lng * d.area; Y += d.lat * d.area; }
  const spots = list.filter((d) => d.kind !== '면');
  const myeon = list.filter((d) => d.kind === '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko'));
  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    rim: r3(rimDist(list[0].sidonm, Y / A, X / A)),
    dongCount: list.length, myeon, myeonCount: myeon.length,
    spots: [],
    dongNames: isMain ? [] : list.filter((d) => d.kind !== '면').map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    codes: list.map((d) => d.code),
  };
  if (isMain) {
    const used = new Set();
    for (const d of spots) {
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        rim: d.rim || 0,
        share: 0,                                  // 아래에서 채운다
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  for (const s of g.spots) s.share = r1((s.area / A) * 100);
  guAll.push(g);
}

/* 길 걸기용 이웃 — 문장에서 숫자로 내세우지 않는다(맞닿음은 다른 사이트의 축이다). */
const touchPair = new Map();
for (const set of vertex.values()) {
  if (set.size < 2) continue;
  const arr = [...set];
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
    for (const [a, b] of [[arr[i], arr[j]], [arr[j], arr[i]]]) {
      if (!touchPair.has(a)) touchPair.set(a, new Map());
      touchPair.get(a).set(b, (touchPair.get(a).get(b) || 0) + 1);
    }
  }
}
const neighborsOf = (code) => {
  const m = touchPair.get(code);
  return m ? [...m.entries()].filter(([, n]) => n >= 2).map(([c]) => c) : [];
};
const codeGu = new Map();
for (const g of guAll) for (const c of g.codes) codeGu.set(c, g);
for (const g of guAll) {
  const set = new Set();
  for (const c of g.codes) for (const n of neighborsOf(c)) {
    const o = codeGu.get(n);
    if (o && o !== g) set.add(o);
  }
  g.near = [...set].map((o) => ({ sidoSlug: (MAIN[o.sidoKey] || SUB[o.sidoKey]).slug, gu: o.name, slug: o.slug, same: o.sidoKey === g.sidoKey }));
  g.nearCount = g.near.length;
}

/* 시군구 안에서 바깥선 거리가 극단인 자리 */
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byRim = g.spots.slice().sort((a, b) => b.rim - a.rim);
  g.inmost = byRim[0].name; g.inmostKm = byRim[0].rim; g.inmostSlug = byRim[0].slug;
  g.outmost = byRim[byRim.length - 1].name; g.outmostKm = byRim[byRim.length - 1].rim;
  g.outmostSlug = byRim[byRim.length - 1].slug;
  byRim.forEach((s, i) => { s.rimRank = i + 1; });
  const byShare = g.spots.slice().sort((a, b) => b.share - a.share);
  g.widest = byShare[0].name; g.widestPct = byShare[0].share; g.widestSlug = byShare[0].slug;
  g.narrowest = byShare[byShare.length - 1].name; g.narrowestPct = byShare[byShare.length - 1].share;
  byShare.forEach((s, i) => { s.shareRank = i + 1; });
}

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  let A = 0, X = 0, Y = 0;
  for (const g of gus) { A += g.area; X += g.lng * g.area; Y += g.lat * g.area; }
  gus.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const RA = sidoRealArea.get(key) || A;
  for (const g of gus) g.share = r2((g.area / RA) * 100);
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  allSpots.sort((a, b) => b.rim - a.rim).forEach((s, i) => { s.sidoRimRank = i + 1; });
  const deep = allSpots[0], edge = allSpots[allSpots.length - 1];
  for (const g of gus) {
    g.spots.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    delete g.sidoKey; delete g.codes;
  }
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: !!MAIN[key],
    lat: r6(Y / A), lng: r6(X / A), area: r1(A),
    realArea: r1(RA), coverPct: r1((A / RA) * 100),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    rimMax: deep ? deep.rim : 0, rimMaxName: deep ? deep.name : '',
    rimMin: edge ? edge.rim : 0, rimMinName: edge ? edge.name : '',
    gu: gus,
  });
}

const out = {
  version: VERSION,
  source: 'admdongkor (https://github.com/vuski/admdongkor) · CC BY 4.0 · 원자료 국가공간정보포털 행정동 경계',
  built: new Date().toISOString().slice(0, 10),
  axis: '바깥선까지 남은 거리 — 시도 테두리에서 동 복판까지의 최단 거리',
  coverageFrom: '서울·인천·경기·부산은 동과 읍을 한 칸씩 갈라 쪽을 내고, 대전·대구·울산 전역과 광주 광산구, 지정한 시·군은 시군구에서 멈춘다. 면은 어느 층에서도 쪽을 두지 않고 이름만 목록에 올린다.',
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    dong: spotAll.filter((s) => s.kind === '동').length,
    eup: spotAll.filter((s) => s.kind === '읍').length,
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점 ${C.spot} = 동 ${C.dong} + 읍 ${C.eup} · 면 ${C.myeon} · 행정동 합 ${C.admin}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 거점 ${String(s.spotCount).padStart(4)} · 바깥선 최대 ${s.rimMax}km(${s.rimMaxName}) 최소 ${s.rimMin}km(${s.rimMinName})`);
const rims = spotAll.map((s) => s.rim).sort((a, b) => a - b);
console.log(`바깥선 거리 min ${rims[0]} · 중앙 ${rims[rims.length >> 1]} · max ${rims[rims.length - 1]}`);
