import { AppErrorCode } from '../../common/errors/app-error-code';
import { PlaceService } from '../place/place.service';
import { AdminPlaceRepository } from './admin-place.repository';
import { AdminPlaceService, toUpdateData } from './admin-place.service';

describe('AdminPlaceService', () => {
  const placeId = '11111111-1111-4111-8111-111111111111';
  const row = {
    placeId,
    name: '영천시장',
    usageType: null,
    intro: null,
    address: null,
    latitude: 35.97,
    longitude: 128.94,
    sinceYear: null,
    thumbnailUrl: null,
    createdAt: new Date('2026-11-01T00:00:00Z'),
    _count: { stories: 0 },
  };
  const repo = { findById: jest.fn(), countReferences: jest.fn(), delete: jest.fn(), update: jest.fn() };
  const service = new AdminPlaceService(repo as unknown as AdminPlaceRepository, {} as PlaceService);
  const code = (c: string) => expect.objectContaining({ code: c });

  beforeEach(() => {
    jest.clearAllMocks();
    repo.findById.mockResolvedValue(row);
  });

  it('기록이 없는 장소는 지운다', async () => {
    repo.countReferences.mockResolvedValue({ stories: 0, eventPlaces: 0 });
    await service.remove(placeId);
    expect(repo.delete).toHaveBeenCalledWith(placeId);
  });

  it('기록(휴지통 포함)이나 축제 개최지가 있으면 PLACE_HAS_STORIES, 지우지 않음', async () => {
    repo.countReferences.mockResolvedValue({ stories: 2, eventPlaces: 0 });
    await expect(service.remove(placeId)).rejects.toEqual(code(AppErrorCode.PLACE_HAS_STORIES));
    repo.countReferences.mockResolvedValue({ stories: 0, eventPlaces: 1 });
    await expect(service.remove(placeId)).rejects.toEqual(code(AppErrorCode.PLACE_HAS_STORIES));
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('없는 장소는 PLACE_NOT_FOUND', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.remove(placeId)).rejects.toEqual(code(AppErrorCode.PLACE_NOT_FOUND));
    await expect(service.update(placeId, { name: 'x' })).rejects.toEqual(code(AppErrorCode.PLACE_NOT_FOUND));
  });

  it('수정: 보낸 필드만, 빈 글 필드는 지우기, 이름은 비울 수 없음', () => {
    expect(toUpdateData({ name: ' 영천공설시장 ', intro: '', address: null })).toEqual({
      name: '영천공설시장',
      intro: null,
      address: null,
    });
    expect(toUpdateData({ sinceYear: null, latitude: 36 })).toEqual({ sinceYear: null, latitude: 36 });
    expect(() => toUpdateData({ name: '   ' })).toThrow(expect.objectContaining({ code: AppErrorCode.INVALID_PARAMETER }));
  });
});
