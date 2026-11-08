import { PlaceRepository } from './place.repository';
import { PlaceResolveService } from './place-resolve.service';
import { NaverLocalClient } from './place-search/naver-local.client';

// 핵심 규칙: 같은 이름+50m 안이면 기존 장소, 아니면 새로 만든다. 주소 찾기 실패는 확정을 막지 않는다.
describe('PlaceResolveService.resolve', () => {
  const userId = '33333333-3333-4333-8333-333333333333';
  const repo = { findInBoxes: jest.fn(), create: jest.fn() };
  const naver = { search: jest.fn() };
  const service = new PlaceResolveService(repo as unknown as PlaceRepository, naver as unknown as NaverLocalClient);

  const tapped = { name: '중앙 카페', latitude: 35.97, longitude: 128.93 };
  const found = (name: string, roadAddress: string, latitude = 35.97) => ({
    name,
    category: null,
    address: null,
    roadAddress,
    latitude,
    longitude: 128.93,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    repo.create.mockImplementation(async (data: Record<string, unknown>) => ({ placeId: 'new-id', ...data }));
    naver.search.mockResolvedValue([]);
  });

  it('같은 이름 + 50m 안의 장소가 있으면 그 장소 (새로 만들지 않음)', async () => {
    repo.findInBoxes.mockResolvedValue([{ placeId: 'old-id', name: '중앙카페', latitude: 35.9702, longitude: 128.93 }]);
    await expect(service.resolve(tapped, userId)).resolves.toEqual({ placeId: 'old-id', created: false });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('같은 자리라도 이름이 다르면 새 장소', async () => {
    repo.findInBoxes.mockResolvedValue([{ placeId: 'old-id', name: '중앙분식', latitude: 35.97, longitude: 128.93 }]);
    await expect(service.resolve(tapped, userId)).resolves.toEqual({ placeId: 'new-id', created: true });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: '중앙 카페', createdBy: userId }));
  });

  it('주소가 없으면 검색 결과 중 같은 이름·100m 안·영천시의 주소를 채운다', async () => {
    repo.findInBoxes.mockResolvedValue([]);
    naver.search.mockResolvedValue([
      found('다른 가게', '경상북도 영천시 A'),
      found('중앙카페', '경상북도 영천시 멀리로 9', 35.98), // ≈1.1km
      found('중앙카페', '경상북도 영천시 중앙로 1'),
    ]);
    await service.resolve(tapped, userId);
    expect(naver.search).toHaveBeenCalledWith('영천 중앙 카페');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ address: '경상북도 영천시 중앙로 1' }));
  });

  it('주소 찾기가 실패해도 장소는 만든다 (주소 없이)', async () => {
    repo.findInBoxes.mockResolvedValue([]);
    naver.search.mockRejectedValue(new Error('키 없음'));
    await expect(service.resolve(tapped, userId)).resolves.toEqual({ placeId: 'new-id', created: true });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ address: undefined }));
  });

  it('주소를 주면 검색하지 않는다', async () => {
    repo.findInBoxes.mockResolvedValue([]);
    await service.resolve({ ...tapped, address: '경상북도 영천시 완산동' }, userId);
    expect(naver.search).not.toHaveBeenCalled();
  });
});
