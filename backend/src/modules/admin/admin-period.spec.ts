import { AppErrorCode } from '../../common/errors/app-error-code';
import { toCreatedAtRange } from './admin-period';

describe('toCreatedAtRange (서울 날짜 → 등록일 범위)', () => {
  it('없으면 전체 기간', () => {
    expect(toCreatedAtRange()).toBeUndefined();
  });

  it('하루: 서울 자정부터 다음 날 자정 전까지', () => {
    expect(toCreatedAtRange('2026-11-11', '2026-11-11')).toEqual({
      gte: new Date('2026-11-10T15:00:00Z'),
      lt: new Date('2026-11-11T15:00:00Z'),
    });
  });

  it('한쪽만 있어도 된다', () => {
    expect(toCreatedAtRange('2026-11-01')).toEqual({ gte: new Date('2026-10-31T15:00:00Z') });
    expect(toCreatedAtRange(undefined, '2026-11-30')).toEqual({ lt: new Date('2026-11-30T15:00:00Z') });
  });

  it('없는 날짜·거꾸로 된 범위는 INVALID_PARAMETER', () => {
    const invalid = expect.objectContaining({ code: AppErrorCode.INVALID_PARAMETER });
    for (const [from, to] of [['2026-02-30', undefined], [undefined, '2026-13-01'], ['2026-11-12', '2026-11-11']]) {
      let error: unknown;
      try {
        toCreatedAtRange(from, to);
      } catch (e) {
        error = e;
      }
      expect(error).toEqual(invalid);
    }
  });
});
