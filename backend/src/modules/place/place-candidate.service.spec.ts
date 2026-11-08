import { PlaceCandidateService } from './place-candidate.service';
import { PlaceRepository } from './place.repository';
import { NaverLocalClient } from './place-search/naver-local.client';

describe('PlaceCandidateService.search', () => {
  const repo = { findInBoxes: jest.fn() };
  const naver = { search: jest.fn() };
  const service = new PlaceCandidateService(naver as unknown as NaverLocalClient, repo as unknown as PlaceRepository);

  const place = (name: string, address: string, latitude = 35.97, longitude = 128.93) => ({
    name,
    category: '카페,디저트>카페',
    address,
    roadAddress: null,
    latitude,
    longitude,
  });

  beforeEach(() => jest.clearAllMocks());

  it("검색어에 '영천'을 붙여 찾고, 주소가 영천시인 곳만 돌려준다", async () => {
    naver.search.mockResolvedValue([
      place('영천 카페', '경상북도 영천시 완산동 1'),
      place('영천동 카페', '서울특별시 서대문구 영천동 1'),
    ]);
    repo.findInBoxes.mockResolvedValue([]);
    const res = await service.search({ q: '카페' });
    expect(naver.search).toHaveBeenCalledWith('영천 카페');
    expect(res.items.map((i) => i.name)).toEqual(['영천 카페']);
    expect(res.items[0]).toMatchObject({ address: '경상북도 영천시 완산동 1', placeId: null });
  });

  it('이미 등록된 같은 장소면 placeId 를 붙인다', async () => {
    naver.search.mockResolvedValue([place('중앙카페', '경상북도 영천시 1')]);
    repo.findInBoxes.mockResolvedValue([{ placeId: 'p1', name: '중앙 카페', latitude: 35.9701, longitude: 128.93 }]);
    const res = await service.search({ q: '중앙' });
    expect(res.items[0].placeId).toBe('p1');
  });

  it('영천 결과가 없으면 DB 를 보지 않는다', async () => {
    naver.search.mockResolvedValue([]);
    await service.search({ q: '없는곳' });
    expect(repo.findInBoxes).not.toHaveBeenCalled();
  });
});
