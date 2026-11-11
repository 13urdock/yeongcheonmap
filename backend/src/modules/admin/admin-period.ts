import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';

// 관리 화면 기간 필터: 등록일(created_at) 기준, 서울 날짜 YYYY-MM-DD 를 하루 단위로 포함.
// from=2026-11-11&to=2026-11-11 → [2026-11-11 00:00 KST, 2026-11-12 00:00 KST)
export interface CreatedAtRange {
  gte?: Date;
  lt?: Date;
}

const SEOUL_OFFSET_MS = 9 * 3600 * 1000;
const DAY_MS = 24 * 3600 * 1000;

// 'YYYY-MM-DD'(서울) 의 자정 시각. 2월 30일처럼 없는 날짜는 거절
function seoulMidnight(date: string, field: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  if (utc.getUTCFullYear() !== y || utc.getUTCMonth() !== m - 1 || utc.getUTCDate() !== d) {
    throw new AppException(AppErrorCode.INVALID_PARAMETER, `${field} 는 있는 날짜(YYYY-MM-DD)여야 합니다`);
  }
  return new Date(utc.getTime() - SEOUL_OFFSET_MS);
}

/** 둘 다 없으면 undefined(전체 기간) */
export function toCreatedAtRange(from?: string, to?: string): CreatedAtRange | undefined {
  if (!from && !to) return undefined;
  const range: CreatedAtRange = {};
  if (from) range.gte = seoulMidnight(from, 'from');
  if (to) range.lt = new Date(seoulMidnight(to, 'to').getTime() + DAY_MS);
  if (range.gte && range.lt && range.gte >= range.lt) {
    throw new AppException(AppErrorCode.INVALID_PARAMETER, 'from 이 to 보다 늦습니다');
  }
  return range;
}
