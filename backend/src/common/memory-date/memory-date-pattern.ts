import { MEMORY_DATE_REGEX, UNKNOWN_DIGIT } from './memory-date.constants';

// 기억 날짜 문자열의 형식 처리(정규화·분해). 날짜로서 가능한지는 memory-date-range 가 판단한다.

export interface MemoryDateParts {
  year: string; // 4자리 패턴, 예: '199X'
  month: string; // 2자리 패턴, 예: '0X'
  day: string; // 2자리 패턴, 예: 'XX'
}

/** 소문자 x 를 대문자로, 앞뒤 공백 제거 */
export function normalizeMemoryDate(raw: string): string {
  return raw.trim().replace(/x/g, UNKNOWN_DIGIT);
}

/** 형식(YYYY.MM.DD + 숫자/X)만 검사 */
export function isWellFormedMemoryDate(value: string): boolean {
  return MEMORY_DATE_REGEX.test(value);
}

export function splitMemoryDate(value: string): MemoryDateParts {
  const [year, month, day] = value.split('.');
  return { year, month, day };
}

/** 연도 4자리가 모두 X 인가 (연도 미상) */
export function isYearUnknown(value: string): boolean {
  return splitMemoryDate(value).year === UNKNOWN_DIGIT.repeat(4);
}

/** 패턴의 각 자리가 숫자 n 과 맞는가. 예: matchesDigits('19X5', 1995) === true */
export function matchesDigits(pattern: string, n: number): boolean {
  const text = String(n).padStart(pattern.length, '0');
  if (text.length !== pattern.length) return false;
  for (let i = 0; i < pattern.length; i += 1) {
    if (pattern[i] !== UNKNOWN_DIGIT && pattern[i] !== text[i]) return false;
  }
  return true;
}
