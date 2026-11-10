import { AppErrorCode } from '../../common/errors/app-error-code';
import { PhotoUrlPolicy } from '../upload/photo-url.policy';
import { StoryDeleteService } from './story-delete.service';
import { StoryUpdateService } from './story-update.service';
import { StoryRepository } from './story.repository';

// 핵심 규칙: 본인만, 보낸 필드만, 바꾼 뒤에도 글 또는 사진 하나는 남아야 함
describe('StoryUpdateService / StoryDeleteService', () => {
  const storyId = '22222222-2222-4222-8222-222222222222';
  const ownerId = '33333333-3333-4333-8333-333333333333';
  const otherId = '44444444-4444-4444-8444-444444444444';

  const row = (data: Record<string, unknown> = {}) => ({
    storyId,
    userId: ownerId,
    user: { userId: ownerId, name: '수집가', profile: null },
    placeId: null,
    eventId: null,
    memoryDate: 'XXXX.XX.XX',
    memoryDateFrom: new Date('1800-01-01'),
    memoryDateTo: new Date('2026-11-10'),
    memoryYearFrom: 1800,
    memoryYearTo: 2026,
    memoryYearUnknown: true,
    placeNameThen: null,
    content: '기억',
    photos: [{ storyPhotoId: 'p1', imageUrl: 'https://storage/stories/1.jpg' }],
    createdAt: new Date('2026-11-10T00:00:00Z'),
    ...data,
  });

  const repo = { findById: jest.fn(), update: jest.fn(), delete: jest.fn() };
  const photoUrlPolicy = { assertOwnPhotoUrls: jest.fn() };
  const updater = new StoryUpdateService(repo as unknown as StoryRepository, photoUrlPolicy as unknown as PhotoUrlPolicy);
  const deleter = new StoryDeleteService(repo as unknown as StoryRepository);

  const code = (c: string) => expect.objectContaining({ code: c });

  beforeEach(() => {
    jest.clearAllMocks();
    repo.findById.mockResolvedValue(row());
    repo.update.mockImplementation(async (_id: string, data: Record<string, unknown>) => row(data));
  });

  it('없는 기록이면 STORY_NOT_FOUND', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(updater.update(storyId, { content: 'x' }, ownerId)).rejects.toEqual(code(AppErrorCode.STORY_NOT_FOUND));
    await expect(deleter.delete(storyId, ownerId)).rejects.toEqual(code(AppErrorCode.STORY_NOT_FOUND));
  });

  it('남의 기록은 FORBIDDEN, 아무것도 바꾸지 않는다', async () => {
    await expect(updater.update(storyId, { content: 'x' }, otherId)).rejects.toEqual(code(AppErrorCode.FORBIDDEN));
    await expect(deleter.delete(storyId, otherId)).rejects.toEqual(code(AppErrorCode.FORBIDDEN));
    expect(repo.update).not.toHaveBeenCalled();
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('보낸 필드만 넘긴다', async () => {
    await updater.update(storyId, { content: '  새 글 ' }, ownerId);
    expect(repo.update).toHaveBeenCalledWith(storyId, { content: '새 글' });
  });

  it('빈 문자열·null 은 지우기', async () => {
    await updater.update(storyId, { placeNameThen: '', content: null }, ownerId);
    expect(repo.update).toHaveBeenCalledWith(storyId, { placeNameThen: null, content: null });
  });

  it('기억 날짜는 resolver 로 정렬 값까지 계산, 불가능하면 거절', async () => {
    await updater.update(storyId, { memoryDate: '1995.XX.XX' }, ownerId);
    expect(repo.update).toHaveBeenCalledWith(storyId, expect.objectContaining({ memoryDate: '1995.XX.XX', memoryYearFrom: 1995 }));
    await expect(updater.update(storyId, { memoryDate: '2001.02.3X' }, ownerId)).rejects.toEqual(
      code(AppErrorCode.INVALID_PARAMETER),
    );
  });

  it('사진 목록 교체 전에 주소 검사', async () => {
    const urls = ['https://storage/stories/2.jpg', 'https://storage/stories/3.jpg'];
    await updater.update(storyId, { photoUrls: urls }, ownerId);
    expect(photoUrlPolicy.assertOwnPhotoUrls).toHaveBeenCalledWith(urls);
    expect(repo.update).toHaveBeenCalledWith(storyId, { photoUrls: urls });
  });

  it('글을 지워도 사진이 남으면 허용', async () => {
    await expect(updater.update(storyId, { content: '' }, ownerId)).resolves.toBeDefined();
  });

  it('글·사진을 모두 비우면 거절', async () => {
    await expect(updater.update(storyId, { content: '', photoUrls: [] }, ownerId)).rejects.toEqual(
      code(AppErrorCode.INVALID_PARAMETER),
    );
    repo.findById.mockResolvedValue(row({ photos: [] }));
    await expect(updater.update(storyId, { content: '   ' }, ownerId)).rejects.toEqual(code(AppErrorCode.INVALID_PARAMETER));
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('본인 기록은 삭제', async () => {
    await deleter.delete(storyId, ownerId);
    expect(repo.delete).toHaveBeenCalledWith(storyId);
  });
});
