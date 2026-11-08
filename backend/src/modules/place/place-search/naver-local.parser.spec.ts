import { cleanTitle, parseNaverLocalItem, toDegrees } from './naver-local.parser';

describe('네이버 지역 검색 응답 해석', () => {
  it('제목의 강조 태그와 HTML 엔티티를 걷어낸다', () => {
    expect(cleanTitle('<b>영천</b>시장 칼국수 &amp; 국밥')).toBe('영천시장 칼국수 & 국밥');
  });

  it('mapx/mapy 는 10^7 로 나눈 경위도', () => {
    expect(toDegrees('1289386000', 'lng')).toBeCloseTo(128.9386, 6);
    expect(toDegrees('359733000', 'lat')).toBeCloseTo(35.9733, 6);
  });

  it('경위도로 볼 수 없는 좌표(예전 카텍 값)는 버린다', () => {
    expect(toDegrees('311277', 'lng')).toBeNull();
    expect(parseNaverLocalItem({ title: '가게', mapx: '311277', mapy: '552097' })).toBeNull();
  });

  it('한 건을 우리 모양으로', () => {
    expect(
      parseNaverLocalItem({
        title: '중앙<b>카페</b>',
        category: '카페,디저트>카페',
        address: '경상북도 영천시 완산동 1',
        roadAddress: '',
        mapx: '1289386000',
        mapy: '359733000',
      }),
    ).toEqual({
      name: '중앙카페',
      category: '카페,디저트>카페',
      address: '경상북도 영천시 완산동 1',
      roadAddress: null,
      latitude: 35.9733,
      longitude: 128.9386,
    });
  });
});

describe('좌표 형식 (API HUB 는 자릿수 미표기)', () => {
  it('소수 경위도도 그대로 받는다', () => {
    expect(toDegrees('128.9386', 'lng')).toBeCloseTo(128.9386, 6);
    expect(toDegrees('35.9733', 'lat')).toBeCloseTo(35.9733, 6);
  });
});
