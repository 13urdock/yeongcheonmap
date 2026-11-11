// 화면 표시용 글자 만들기 (서버 값 → 사람이 읽는 글)

export const SOURCE_LABEL = { app: '앱', visitor_web: '관람객 웹', admin: '관리 웹' };

/** ISO → 'YYYY.MM.DD HH:mm' (서울) */
export function dateTime(iso) {
  if (!iso) return '—';
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(iso))
      .map((x) => [x.type, x.value]),
  );
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}`;
}

/** 서울 기준 오늘 'YYYY-MM-DD' (days 만큼 앞뒤로) */
export function seoulDate(days = 0) {
  const d = new Date(Date.now() + days * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(d);
}

export function number(n) {
  return new Intl.NumberFormat('ko-KR').format(n ?? 0);
}
