import { boxAround, distanceMeters } from './geo-distance';

describe('distanceMeters', () => {
  it('같은 점은 0m', () => {
    expect(distanceMeters({ latitude: 35.97, longitude: 128.93 }, { latitude: 35.97, longitude: 128.93 })).toBe(0);
  });

  it('위도 0.001도 ≈ 111m', () => {
    const d = distanceMeters({ latitude: 35.97, longitude: 128.93 }, { latitude: 35.971, longitude: 128.93 });
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });
});

describe('boxAround', () => {
  it('사각형 모서리 쪽 점도 반경 이상 떨어져 있다 (반경 원을 덮는다)', () => {
    const center = { latitude: 35.97, longitude: 128.93 };
    const box = boxAround(center, 50);
    expect(distanceMeters(center, { latitude: box.maxLat, longitude: center.longitude })).toBeGreaterThanOrEqual(49.9);
    expect(distanceMeters(center, { latitude: center.latitude, longitude: box.maxLng })).toBeGreaterThanOrEqual(49.9);
  });
});
