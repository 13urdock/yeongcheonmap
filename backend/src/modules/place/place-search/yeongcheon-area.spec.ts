import { isYeongcheonAddress, withRegion } from './yeongcheon-area';

describe('영천 한정', () => {
  it("검색어에 '영천'이 없으면 앞에 붙인다", () => {
    expect(withRegion(' 카페 ')).toBe('영천 카페');
    expect(withRegion('영천시장')).toBe('영천시장');
  });

  it("주소에 '영천시'가 있어야 영천", () => {
    expect(isYeongcheonAddress('경상북도 영천시 완산동 1', null)).toBe(true);
    expect(isYeongcheonAddress('', '경북 영천시 중앙동로 1')).toBe(true);
    expect(isYeongcheonAddress('경상북도 경산시 중방동 1', '')).toBe(false);
  });
});
