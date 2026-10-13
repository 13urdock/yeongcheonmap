import { AppErrorCode } from '../errors/app-error-code';
import { AppException } from '../errors/app.exception';
import { isWellFormedMemoryDate, normalizeMemoryDate } from './memory-date-pattern';
import { CalendarDate, computeMemoryDateRange } from './memory-date-range';
import { UNKNOWN_MEMORY_DATE } from './memory-date.constants';
import { seoulToday, toDbDate } from './seoul-today';

// 입력 문자열 → 저장할 값 일체(정규화된 패턴 + 정렬용 파생값). 잘못되면 INVALID_PARAMETER.
// 파생값은 오직 이 함수로만 만든다(패턴이 유일한 원천).
export interface ResolvedMemoryDate {
  memoryDate: string;
  memoryDateFrom: Date;
  memoryDateTo: Date;
  memoryYearFrom: number;
  memoryYearTo: number;
  memoryYearUnknown: boolean;
}

export function resolveMemoryDate(raw: string | undefined, today: CalendarDate = seoulToday()): ResolvedMemoryDate {
  const pattern = normalizeMemoryDate(raw ?? UNKNOWN_MEMORY_DATE);
  if (!isWellFormedMemoryDate(pattern)) {
    throw new AppException(AppErrorCode.INVALID_PARAMETER, 'memoryDate 형식: YYYY.MM.DD (모르는 자리는 X)');
  }

  const range = computeMemoryDateRange(pattern, today);
  if (!range) {
    throw new AppException(AppErrorCode.INVALID_PARAMETER, `가능한 날짜가 없습니다: ${pattern}`);
  }

  return {
    memoryDate: pattern,
    memoryDateFrom: toDbDate(range.from),
    memoryDateTo: toDbDate(range.to),
    memoryYearFrom: range.yearFrom,
    memoryYearTo: range.yearTo,
    memoryYearUnknown: range.yearUnknown,
  };
}
