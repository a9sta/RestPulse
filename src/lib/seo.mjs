/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막 모양을 앞선 일곱 사이트와 전부 다르게 둔다. 같은 뼈대에 단어만 갈면 그것도 중복이다.
 *     루네사       `{동} 출장 {코스어} 마사지·홈타이 - 루네사 | {시도} {행동어}`
 *     리바이브모션 `{구} 출장마사지 {코스어} 홈타이 | {시도} {구} 방문 {행동어} - 리바이브모션`
 *     세린터치     `{동} 출장마사지 홈타이 {코스어} · {구} {동} 방문 {행동어} | 세린터치`
 *     벨벳럽       `{동} {코스어} 출장마사지 홈타이 — {구} {동} 방문 {행동어} · 벨벳럽`
 *     마루온       `{동} 출장마사지·홈타이 {코스어} | {구} {동} {행동어} — 마루온`
 *     바이탈리즈   `{동} 출장마사지 홈타이 ({구}) · {코스어} {행동어} | 바이탈리즈`
 *     블리스놋     `{구} {동} 출장마사지 홈타이 — {코스어} {행동어} | 블리스놋`
 *     레스트펄스   `{동} 출장마사지 홈타이, {구} {코스어} {행동어} — 레스트펄스`
 *   ★**쉼표**로 앞뒤를 가르는 모양은 여기서 처음 쓴다. 일곱 곳 모두 쉼표를 쓰지 않는다.
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**으로 둔다(80자 안팎이 가장 안전하다). 가운데 토막은
 *   그 자리에서만 나오는 실측값(바깥선까지의 거리·구 안 몫)으로 채워 전부 달라지게 한다.
 */
import { hash, km, km2, josa } from './util.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '레스트펄스';
const KEY = '출장마사지 홈타이';

/** 제목에 끼우는 코스어 — 실제로 받는 일곱 가지에서만 돌린다. */
const COURSE_WORD = ['스웨디시', '아로마', '타이', '딥티슈', '스포츠', '림프', '건식'];
/** 제목 꼬리 행동어 */
const ACT = ['바깥선부터', '언제 닿나', '밤에도 열림', '통화로 확인', '지금 부르기'];

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY}, 서울 인천 경기 부산 동읍 방문 관리 24시 — 지금 부르기`,
  areaHub: (c) => `${KEY} 받는 자리 동읍 ${c.spot}칸, 시군구 ${c.gu}곳 전체 목록 — ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY}, ${sd.main ? `동읍 ${sd.spotCount}칸` : `시군구 ${sd.gu.length}곳`} 방문 ${at(hash(sd.name, 'sdt'), ACT)} — ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    return `${g.name} ${KEY}, ${sd.name} ${g.main ? `동읍 ${g.spotCount}칸` : `행정동 ${g.dongCount}칸`} ${at(h, ACT, 0)} — ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY}, ${g.name} ${at(h, COURSE_WORD, 0)} ${at(h, ACT, 1)} — ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY}, ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 세기 ${c.pressure} — ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY}, ${sd.name} 방문 ${at(hash(sd.name, c.slug), ACT)} — ${BRAND}`,
  page: (t) => `${t} — ${BRAND} ${KEY}`,
  post: (p) => `${p.title} — ${BRAND} 들머리 기록`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
/** 동 설명 가운데 토막 — 바깥선까지의 거리와 구 안 몫으로만 짠다. */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `${sd.name} 바깥 테두리에서 ${km(s.rim)} 들어온 자리`,
    () => `테두리까지 ${km(s.rim)}, ${g.name} 땅의 ${s.share}%를 씁니다`,
    () => `${g.name} 안에서 ${s.rimRank}번째로 깊고 넓이는 ${km2(s.area)}`,
    () => `${s.kind === '읍' ? `${g.name}에서 사람이 몰린 읍, 테두리까지 ${km(s.rim)}` : `바깥선 ${km(s.rim)}·구 몫 ${s.share}%짜리 자리`}`,
    () => `넓이 ${km2(s.area)}에 시 경계까지 ${km(s.rim)}`,
    () => `${sd.name} 전체로 보면 ${s.sidoRimRank}번째로 깊은 자리`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '셈은 마친 뒤에 합니다',
  '먼저 나가는 돈이 없습니다',
  '새벽에도 숫자가 같습니다',
  '오가는 기름값을 붙이지 않습니다',
  '값은 끝내고 받습니다',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동·읍까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 방문 안내. 시 테두리에서 얼마나 더 들어가는지부터 셉니다.',
  areaHub: (c) =>
    `출장마사지 홈타이를 받는 동·읍 ${c.spot}칸과 시군구 ${c.gu}곳. 자리마다 시 바깥선까지의 거리를 적어 두었습니다.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳과 동·읍 ${sd.spotCount}칸에 쪽을 냈습니다. 후불이고 24시간 받습니다.`
      : `${sd.name} ${KEY} 방문 안내. 시군구 ${sd.gu.length}곳에 쪽을 냈고 동 이름은 그 안에 있습니다. 후불이고 24시간 받습니다.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main
      ? [
        `동·읍 ${g.spotCount}칸에 쪽을 냈고 땅은 ${km2(g.area)}`,
        g.inmost ? `가장 깊은 자리는 ${g.inmost}, 테두리에서 ${km(g.inmostKm)}` : `땅 ${km2(g.area)}`,
        g.widest ? `땅을 가장 많이 쥔 자리는 ${g.widest}, 구의 ${g.widestPct}%` : `땅 ${km2(g.area)}`,
        `${sd.name} 넓이의 ${g.share}%를 쓰는 ${g.spotCount}칸`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : [
        `행정동 ${g.dongCount}칸이 들어 있고 땅은 ${km2(g.area)}`,
        `시 테두리에서 ${km(g.rim)} 들어온 ${km2(g.area)}`,
        g.myeonCount ? `동 ${g.dongNames.length}칸과 면 ${g.myeonCount}칸 모두 받습니다` : `동 ${g.dongNames.length}칸 어디서나 같은 번호로 받습니다`,
      ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY} 방문. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY} 방문. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문 안내. ${c.focus}에 손을 두고 세기는 ${c.pressure}입니다. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역에 따라 달라지지 않습니다.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY} 방문. ${c.focus}에 시간을 쓰고 세기는 ${c.pressure}입니다. ${sd.name} 안쪽이면 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
