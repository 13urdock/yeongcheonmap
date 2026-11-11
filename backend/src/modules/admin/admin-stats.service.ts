import { Injectable } from '@nestjs/common';
import { STORY_SOURCES } from '../story/story-source';
import { AdminPeriodDto } from './dto/admin-period.dto';
import { toCreatedAtRange } from './admin-period';
import { AdminStatsRepository } from './admin-stats.repository';

export interface AdminStatsResponse {
  period: { from: string | null; to: string | null };
  storyCount: number;
  photoCount: number;
  placeCount: number;
  eventCount: number;
  contributorCount: number;
  hiddenCount: number;
  trashCount: number;
  bySource: Record<string, number>; // { app, visitor_web, admin } — 없는 경로는 0
}

export interface AdminContributorResponse {
  contributorId: string;
  nickname: string;
  accountName: string | null; // 계정이 있는 기록자(수집가·운영진)면 계정 이름
  hasContact: boolean; // 이벤트 연락처가 있는지 (번호 자체는 내보내지 않음)
  storyCount: number;
  photoCount: number;
  lastStoryAt: string | null;
}

// 운영진 집계 유스케이스: 총계·경로별 수, 사람별 기록 수 (기간 필터 공통)
@Injectable()
export class AdminStatsService {
  constructor(private readonly repository: AdminStatsRepository) {}

  async stats(period: AdminPeriodDto): Promise<AdminStatsResponse> {
    const { bySource, ...counts } = await this.repository.storyCounts(toCreatedAtRange(period.from, period.to));
    const sourceCounts = Object.fromEntries(STORY_SOURCES.map((s) => [s, 0]));
    for (const { source, count } of bySource) sourceCounts[source] = count;
    return { period: { from: period.from ?? null, to: period.to ?? null }, ...counts, bySource: sourceCounts };
  }

  async contributors(period: AdminPeriodDto): Promise<{ items: AdminContributorResponse[] }> {
    const rows = await this.repository.contributorCounts(toCreatedAtRange(period.from, period.to));
    return { items: rows.map((r) => ({ ...r, lastStoryAt: r.lastStoryAt?.toISOString() ?? null })) };
  }
}
