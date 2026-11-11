import { AdminStatsRepository } from './admin-stats.repository';
import { AdminStatsService } from './admin-stats.service';

describe('AdminStatsService', () => {
  const repo = { storyCounts: jest.fn(), contributorCounts: jest.fn() };
  const service = new AdminStatsService(repo as unknown as AdminStatsRepository);
  const base = { storyCount: 3, photoCount: 5, placeCount: 2, eventCount: 1, contributorCount: 1, hiddenCount: 0, trashCount: 1 };

  beforeEach(() => jest.clearAllMocks());

  it('경로별 수는 없는 경로도 0 으로 채운다', async () => {
    repo.storyCounts.mockResolvedValue({ ...base, bySource: [{ source: 'visitor_web', count: 3 }] });
    const res = await service.stats({});
    expect(res.bySource).toEqual({ app: 0, visitor_web: 3, admin: 0 });
    expect(res.period).toEqual({ from: null, to: null });
    expect(repo.storyCounts).toHaveBeenCalledWith(undefined);
  });

  it('기간은 서울 날짜 범위로 바꿔 넘긴다', async () => {
    repo.storyCounts.mockResolvedValue({ ...base, bySource: [] });
    await service.stats({ from: '2026-11-11', to: '2026-11-11' });
    expect(repo.storyCounts).toHaveBeenCalledWith({ gte: new Date('2026-11-10T15:00:00Z'), lt: new Date('2026-11-11T15:00:00Z') });
  });

  it('사람별: 마지막 기록 시각을 ISO 로', async () => {
    repo.contributorCounts.mockResolvedValue([
      { contributorId: 'c1', nickname: '수집가', accountName: '수집가', hasContact: false, storyCount: 2, photoCount: 3, lastStoryAt: new Date('2026-11-11T00:00:00Z') },
      { contributorId: 'c2', nickname: '운영진', accountName: '운영진', hasContact: false, storyCount: 0, photoCount: 0, lastStoryAt: null },
    ]);
    const { items } = await service.contributors({});
    expect(items[0].lastStoryAt).toBe('2026-11-11T00:00:00.000Z');
    expect(items[1].lastStoryAt).toBeNull();
  });
});
