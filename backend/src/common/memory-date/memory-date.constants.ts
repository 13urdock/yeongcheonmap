// 기억 날짜(부분 날짜) 규칙의 고정값. 프론트 lib/core/memory_date/memory_date_constants.dart 와 반드시 같은 값.
// 규칙 원문: docs/API명세서_v4.md §2 "기억 날짜"

/** 표기 형식: YYYY.MM.DD, 각 자리는 숫자 또는 X(모름) */
export const MEMORY_DATE_REGEX = /^[0-9X]{4}\.[0-9X]{2}\.[0-9X]{2}$/;

/** 아무것도 모를 때의 값 (기본값) */
export const UNKNOWN_MEMORY_DATE = 'XXXX.XX.XX';

/** X 를 채울 때 고려하는 가장 이른 해. 그 이전 연도는 후보에서 제외. */
export const MEMORY_DATE_MIN_YEAR = 1800;

/** 모르는 자리 문자 */
export const UNKNOWN_DIGIT = 'X';
