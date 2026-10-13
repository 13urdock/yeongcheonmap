import { CalendarDate } from './memory-date-range';

// "오늘"은 서비스 지역(영천) 기준 한국 시간으로 정한다. 서버가 어느 시간대에서 돌든 같은 결과.
export function seoulToday(now: Date = new Date()): CalendarDate {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return { year: kst.getUTCFullYear(), month: kst.getUTCMonth() + 1, day: kst.getUTCDate() };
}

/** CalendarDate → DB DATE 컬럼용 Date (UTC 자정) */
export function toDbDate({ year, month, day }: CalendarDate): Date {
  const date = new Date(Date.UTC(2000, month - 1, day));
  date.setUTCFullYear(year); // 0~99년대 보정 방지용으로 연도는 따로 지정
  return date;
}

/** DB DATE → 'YYYY-MM-DD' */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
