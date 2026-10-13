import { AppErrorCode } from '../../common/errors/app-error-code';
import { EventService } from '../event/event.service';
import { PlaceService } from '../place/place.service';
import { StoryCreateService } from './story-create.service';
import { StoryRepository } from './story.repository';

// 핵심 규칙: 앵커(장소/축제), 내용(글/사진), 기억 날짜
describe('StoryCreateService.create', () => {
  const placeId = '11111111-1111-4111-8111-111111111111';
  const userId = '33333333-3333-4333-8333-333333333333';

  const repo = { create: jest.fn() };
  const placeService = { getPlaceOrThrow: jest.fn().mockResolvedValue({ placeId }) };
  const eventService = { getEventOrThrow: jest.fn() };
  const service = new StoryCreateService(
    repo as unknown as StoryRepository,
    placeService as unknown as PlaceService,
    eventService as unknown as EventService,
  );

  const storedRow = (data: Record<string, unknown>) => ({
    storyId: 's1',
    user: { userId, name: '홍길동', profile: null },
    photos: [],
    createdAt: new Date('2026-10-10T00:00:00Z'),
    placeId: null,
    eventId: null,
    placeNameThen: null,
    content: null,
    ...data,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    repo.create.mockImplementation(async (data: Record<string, unknown>) => storedRow(data));
  });

  const invalid = expect.objectContaining({ code: AppErrorCode.INVALID_PARAMETER });

  it('장소·축제 둘 다 없으면 거절', async () => {
    await expect(service.create({ content: '기억' }, userId)).rejects.toEqual(invalid);
  });

  it('글도 사진도 없으면 거절 (공백 글 포함)', async () => {
    await expect(service.create({ placeId, content: '   ' }, userId)).rejects.toEqual(invalid);
  });

  it('불가능한 기억 날짜는 거절하고 저장하지 않는다', async () => {
    await expect(service.create({ placeId, content: '기억', memoryDate: '2001.02.3X' }, userId)).rejects.toEqual(
      invalid,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('사진만 있어도 저장, 날짜 생략 시 XXXX.XX.XX', async () => {
    const res = await service.create({ placeId, photoUrls: ['https://storage/1.jpg'] }, userId);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ memoryDate: 'XXXX.XX.XX', memoryYearUnknown: true, photoUrls: ['https://storage/1.jpg'] }),
    );
    expect(res.memoryDate.pattern).toBe('XXXX.XX.XX');
  });

  it('부분 날짜와 그때 이름을 정규화해 저장', async () => {
    const res = await service.create(
      { placeId, content: ' 떡볶이 ', memoryDate: '199x.xx.xx', placeNameThen: ' 중앙분식 ' },
      userId,
    );
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        memoryDate: '199X.XX.XX',
        memoryYearFrom: 1990,
        memoryYearTo: 1999,
        placeNameThen: '중앙분식',
        content: '떡볶이',
        userId,
        placeId,
      }),
    );
    expect(res.memoryDate).toEqual({ pattern: '199X.XX.XX', from: '1990-01-01', to: '1999-12-31', yearFrom: 1990, yearTo: 1999 });
  });

  it('존재 확인: 지정한 장소/축제만 확인한다', async () => {
    await service.create({ placeId, content: '기억' }, userId);
    expect(placeService.getPlaceOrThrow).toHaveBeenCalledWith(placeId);
    expect(eventService.getEventOrThrow).not.toHaveBeenCalled();
  });
});
