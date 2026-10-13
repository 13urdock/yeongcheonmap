import { AppErrorCode } from '../errors/app-error-code';
import { resolveMemoryDate } from './memory-date.resolver';
import { seoulToday, toIsoDate } from './seoul-today';

const TODAY = { year: 2026, month: 10, day: 10 };

describe('resolveMemoryDate', () => {
  it('생략하면 XXXX.XX.XX (연도 미상)', () => {
    const r = resolveMemoryDate(undefined, TODAY);
    expect(r.memoryDate).toBe('XXXX.XX.XX');
    expect(r.memoryYearUnknown).toBe(true);
    expect(toIsoDate(r.memoryDateTo)).toBe('2026-10-10');
  });

  it('소문자 x 와 공백을 정규화하고 DB 값으로 변환', () => {
    const r = resolveMemoryDate(' 1995.0x.1x ', TODAY);
    expect(r.memoryDate).toBe('1995.0X.1X');
    expect(toIsoDate(r.memoryDateFrom)).toBe('1995-01-10');
    expect(toIsoDate(r.memoryDateTo)).toBe('1995-09-19');
    expect([r.memoryYearFrom, r.memoryYearTo]).toEqual([1995, 1995]);
  });

  it.each(['1995-07-15', '1995.7.15', '199?.XX.XX', '19950715'])('형식 오류 %s → INVALID_PARAMETER', (raw) => {
    expect(() => resolveMemoryDate(raw, TODAY)).toThrow(expect.objectContaining({ code: AppErrorCode.INVALID_PARAMETER }));
  });

  it('형식은 맞지만 불가능한 날짜 → INVALID_PARAMETER', () => {
    expect(() => resolveMemoryDate('2001.02.30', TODAY)).toThrow(
      expect.objectContaining({ code: AppErrorCode.INVALID_PARAMETER }),
    );
  });
});

describe('seoulToday', () => {
  it('UTC 15:00 이후는 한국 날짜로 다음날', () => {
    expect(seoulToday(new Date('2026-10-09T15:30:00Z'))).toEqual({ year: 2026, month: 10, day: 10 });
    expect(seoulToday(new Date('2026-10-09T14:59:00Z'))).toEqual({ year: 2026, month: 10, day: 9 });
  });
});
