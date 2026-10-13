import { MEMORY_DATE_MIN_YEAR } from './memory-date.constants';
import { isYearUnknown, matchesDigits, splitMemoryDate } from './memory-date-pattern';

// 기억 날짜 패턴 → 실제로 가능한 날짜 범위 계산. 순수 함수(오늘 날짜는 인자로 받음).
//
// 규칙
// - X 자리를 0~9로 채워 만들 수 있는 "실제 달력 날짜" 중 [MIN_YEAR-01-01, 오늘] 안의 것만 후보.
// - from = 후보 중 가장 이른 날, to = 가장 늦은 날. 후보가 없으면 null(= 잘못된 날짜).
// - yearFrom/yearTo = 연도 자리만 보고 가능한 연도 범위(정렬 시 같은 연도 패턴끼리 묶는 데 사용).

export interface MemoryDateRange {
  from: CalendarDate;
  to: CalendarDate;
  yearFrom: number;
  yearTo: number;
  yearUnknown: boolean;
}

export interface CalendarDate {
  year: number;
  month: number; // 1~12
  day: number; // 1~31
}

export function computeMemoryDateRange(pattern: string, today: CalendarDate): MemoryDateRange | null {
  const parts = splitMemoryDate(pattern);
  const years = range(MEMORY_DATE_MIN_YEAR, today.year).filter((y) => matchesDigits(parts.year, y));
  const months = range(1, 12).filter((m) => matchesDigits(parts.month, m));
  const days = range(1, 31).filter((d) => matchesDigits(parts.day, d));
  if (years.length === 0 || months.length === 0 || days.length === 0) return null;

  const from = findFirstValid(years, months, days, today);
  const to = findFirstValid([...years].reverse(), [...months].reverse(), [...days].reverse(), today);
  if (!from || !to) return null;

  return {
    from,
    to,
    yearFrom: years[0],
    yearTo: years[years.length - 1],
    yearUnknown: isYearUnknown(pattern),
  };
}

// 주어진 순서(오름 또는 내림)대로 훑어 처음 만나는 유효 날짜. 연→월→일 순 중첩이라 곧 시간순.
function findFirstValid(years: number[], months: number[], days: number[], today: CalendarDate): CalendarDate | null {
  for (const year of years) {
    for (const month of months) {
      for (const day of days) {
        const date = { year, month, day };
        if (isRealDate(date) && compareDate(date, today) <= 0) return date;
      }
    }
  }
  return null;
}

export function isRealDate({ year, month, day }: CalendarDate): boolean {
  return day <= daysInMonth(year, month);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function compareDate(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let n = start; n <= end; n += 1) out.push(n);
  return out;
}
