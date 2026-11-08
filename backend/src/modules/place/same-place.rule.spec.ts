import { findSamePlace, isSamePlace, normalizePlaceName } from './same-place.rule';

describe('같은 장소 판정', () => {
  const cafe = { name: '중앙 카페', latitude: 35.97, longitude: 128.93 };

  it('이름은 공백·대소문자를 무시한다', () => {
    expect(normalizePlaceName(' Cafe  중앙 ')).toBe('cafe중앙');
  });

  it('같은 이름 + 50m 안 → 같은 장소', () => {
    expect(isSamePlace(cafe, { name: '중앙카페', latitude: 35.9703, longitude: 128.93 })).toBe(true); // ≈33m
  });

  it('같은 이름이라도 50m 밖 → 다른 장소', () => {
    expect(isSamePlace(cafe, { name: '중앙카페', latitude: 35.971, longitude: 128.93 })).toBe(false); // ≈111m
  });

  it('같은 자리라도 이름이 다르면 다른 장소 (합치지 않음)', () => {
    expect(isSamePlace(cafe, { name: '중앙분식', latitude: 35.97, longitude: 128.93 })).toBe(false);
  });

  it('여럿이면 가장 가까운 것', () => {
    const far = { id: 'far', name: '중앙카페', latitude: 35.9703, longitude: 128.93 };
    const near = { id: 'near', name: '중앙카페', latitude: 35.9701, longitude: 128.93 };
    expect(findSamePlace([far, near], cafe)?.id).toBe('near');
  });
});
