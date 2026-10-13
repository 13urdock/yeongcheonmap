import { parseBbox } from './bbox.parser';

describe('parseBbox', () => {
  it('minLng,minLat,maxLng,maxLat 순서로 파싱한다', () => {
    expect(parseBbox('128.90,35.90,129.05,36.05')).toEqual({
      minLng: 128.9,
      minLat: 35.9,
      maxLng: 129.05,
      maxLat: 36.05,
    });
  });

  it('요소 수가 4가 아니면 null', () => {
    expect(parseBbox('128.9,35.9,129.05')).toBeNull();
  });

  it('숫자가 아니면 null', () => {
    expect(parseBbox('a,b,c,d')).toBeNull();
  });

  it('min > max 이면 null', () => {
    expect(parseBbox('129.05,35.9,128.9,36.05')).toBeNull();
  });

  it('위경도 범위를 벗어나면 null', () => {
    expect(parseBbox('128.9,-95,129.05,36.05')).toBeNull();
  });
});
