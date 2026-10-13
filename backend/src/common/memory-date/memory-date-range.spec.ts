import { computeMemoryDateRange } from './memory-date-range';

// 규칙 표(문서 docs/API명세서_v4.md §2)와 같은 사례를 고정한다. 프론트 테스트도 같은 사례를 쓴다.
const TODAY = { year: 2026, month: 10, day: 10 };
const d = (year: number, month: number, day: number) => ({ year, month, day });

describe('computeMemoryDateRange', () => {
  it('완전한 날짜는 그 하루', () => {
    const r = computeMemoryDateRange('1995.07.15', TODAY)!;
    expect(r.from).toEqual(d(1995, 7, 15));
    expect(r.to).toEqual(d(1995, 7, 15));
    expect([r.yearFrom, r.yearTo, r.yearUnknown]).toEqual([1995, 1995, false]);
  });

  it('월·일 모름 → 그 해 전체', () => {
    const r = computeMemoryDateRange('1995.XX.XX', TODAY)!;
    expect(r.from).toEqual(d(1995, 1, 1));
    expect(r.to).toEqual(d(1995, 12, 31));
  });

  it('연도 끝자리 모름 → 1990년대', () => {
    const r = computeMemoryDateRange('199X.XX.XX', TODAY)!;
    expect(r.from).toEqual(d(1990, 1, 1));
    expect(r.to).toEqual(d(1999, 12, 31));
    expect([r.yearFrom, r.yearTo]).toEqual([1990, 1999]);
  });

  it('중간 자리 모름 → 가능한 연도들(1905…1995) 중 처음과 끝', () => {
    const r = computeMemoryDateRange('19X5.XX.XX', TODAY)!;
    expect(r.from).toEqual(d(1905, 1, 1));
    expect(r.to).toEqual(d(1995, 12, 31));
  });

  it('월 0X, 일 1X → 1~9월, 10~19일', () => {
    const r = computeMemoryDateRange('1995.0X.1X', TODAY)!;
    expect(r.from).toEqual(d(1995, 1, 10));
    expect(r.to).toEqual(d(1995, 9, 19));
  });

  it('월 1X → 10~12월만 (13월 이상 제외)', () => {
    const r = computeMemoryDateRange('2001.1X.XX', TODAY)!;
    expect(r.from).toEqual(d(2001, 10, 1));
    expect(r.to).toEqual(d(2001, 12, 31));
  });

  it('일 3X 는 달마다 다르다: 2월엔 불가', () => {
    expect(computeMemoryDateRange('2001.02.3X', TODAY)).toBeNull();
    expect(computeMemoryDateRange('2001.04.3X', TODAY)!.to).toEqual(d(2001, 4, 30));
  });

  it('윤년: 2월 29일은 윤년만', () => {
    expect(computeMemoryDateRange('2001.02.29', TODAY)).toBeNull();
    expect(computeMemoryDateRange('2000.02.29', TODAY)).not.toBeNull();
    // 200X 중 윤년은 2000, 2004, 2008
    const r = computeMemoryDateRange('200X.02.29', TODAY)!;
    expect(r.from).toEqual(d(2000, 2, 29));
    expect(r.to).toEqual(d(2008, 2, 29));
  });

  it('존재하지 않는 월/일 → null', () => {
    expect(computeMemoryDateRange('1995.00.XX', TODAY)).toBeNull();
    expect(computeMemoryDateRange('1995.13.XX', TODAY)).toBeNull();
    expect(computeMemoryDateRange('1995.XX.00', TODAY)).toBeNull();
  });

  it('미래 날짜는 불가, 올해는 오늘까지만', () => {
    expect(computeMemoryDateRange('2027.XX.XX', TODAY)).toBeNull();
    expect(computeMemoryDateRange('2026.11.XX', TODAY)).toBeNull();
    expect(computeMemoryDateRange('2026.XX.XX', TODAY)!.to).toEqual(TODAY);
    expect(computeMemoryDateRange('202X.XX.XX', TODAY)!.to).toEqual(TODAY);
  });

  it('최소 연도(1800) 이전은 후보에서 제외', () => {
    expect(computeMemoryDateRange('1799.XX.XX', TODAY)).toBeNull();
    expect(computeMemoryDateRange('17XX.XX.XX', TODAY)).toBeNull();
    expect(computeMemoryDateRange('1XXX.XX.XX', TODAY)!.from).toEqual(d(1800, 1, 1));
  });

  it('전부 모름 → 연도 미상, 1800-01-01 ~ 오늘', () => {
    const r = computeMemoryDateRange('XXXX.XX.XX', TODAY)!;
    expect(r.yearUnknown).toBe(true);
    expect(r.from).toEqual(d(1800, 1, 1));
    expect(r.to).toEqual(TODAY);
  });
});
