// 기억 날짜(YYYY.MM.DD, 모르는 자리 X) 규칙 — 앱 lib/core/memory_date/ 와 같은 규칙. 원문: docs/ERD_v5.md §2
// 최종 판단은 서버(memory-date.resolver)가 한다. 여기서는 숫자판이 고를 수 있는 글자와 "가능한 날짜 없음" 안내만.

export const UNKNOWN = 'X';
export const MIN_YEAR = 1800;
const SYMBOLS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', UNKNOWN];

/** 서울 기준 오늘 {year, month, day} */
export function seoulToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(now)
    .split('-')
    .map(Number);
  return { year: parts[0], month: parts[1], day: parts[2] };
}

/** digits: 8글자 배열 → "YYYY.MM.DD" */
export function toPattern(digits) {
  const s = digits.join('');
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
}

function matches(patternDigits, value) {
  const s = String(value).padStart(patternDigits.length, '0');
  for (let i = 0; i < patternDigits.length; i++) {
    if (patternDigits[i] !== UNKNOWN && patternDigits[i] !== s[i]) return false;
  }
  return true;
}

function anyYearMatches(yearPattern, currentYear) {
  for (let y = MIN_YEAR; y <= currentYear; y++) if (matches(yearPattern, y)) return true;
  return false;
}

/** index 칸(0~7)이 지금 고를 수 있는 글자들 */
export function allowedSymbolsAt(digits, index, currentYear) {
  if (index < 4) {
    const left = digits.slice(0, index).join('');
    const right = UNKNOWN.repeat(3 - index);
    const out = [];
    for (let d = 0; d <= 9; d++) if (anyYearMatches(`${left}${d}${right}`, currentYear)) out.push(String(d));
    return [...out, UNKNOWN];
  }
  if (index === 4) return tens(12);
  if (index === 5) return ones(digits[4], 12);
  if (index === 6) return tens(31);
  return ones(digits[6], 31);
}

function tens(max) {
  const out = [];
  for (let t = 0; t <= Math.floor(max / 10); t++) out.push(String(t));
  return [...out, UNKNOWN];
}

function ones(tensDigit, max) {
  if (tensDigit === UNKNOWN) return SYMBOLS;
  const t = Number(tensDigit);
  const out = [];
  for (let o = 0; o <= 9; o++) if (t * 10 + o >= 1 && t * 10 + o <= max) out.push(String(o));
  return [...out, UNKNOWN];
}

/** 한 칸을 바꾼 뒤: 불가능해진 연도 칸은 X, 월·일은 범위 안으로 */
export function normalizeDigits(digits, currentYear) {
  const next = [...digits];
  for (let i = 0; i < 4; i++) {
    if (next[i] !== UNKNOWN && !allowedSymbolsAt(next, i, currentYear).includes(next[i])) next[i] = UNKNOWN;
  }
  clampPair(next, 4, 12);
  clampPair(next, 6, 31);
  return next;
}

function clampPair(digits, tensIndex, max) {
  const a = digits[tensIndex];
  const b = digits[tensIndex + 1];
  if (a === UNKNOWN || b === UNKNOWN) return;
  const value = Number(a + b);
  if (value >= 1 && value <= max) return;
  const fixed = String(value < 1 ? 1 : max).padStart(2, '0');
  digits[tensIndex] = fixed[0];
  digits[tensIndex + 1] = fixed[1];
}

/** X 를 채워 만들 수 있는 실제 날짜가 1800-01-01 ~ 오늘 사이에 하나라도 있는지 */
export function hasPossibleDate(digits, today = seoulToday()) {
  const y = digits.slice(0, 4);
  const m = digits.slice(4, 6);
  const d = digits.slice(6, 8);
  for (let year = today.year; year >= MIN_YEAR; year--) {
    if (!matches(y, year)) continue;
    for (let month = 1; month <= 12; month++) {
      if (!matches(m, month)) continue;
      const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
      for (let day = 1; day <= last; day++) {
        if (!matches(d, day)) continue;
        const future = year > today.year || (year === today.year && (month > today.month || (month === today.month && day > today.day)));
        if (!future) return true;
      }
    }
  }
  return false;
}
