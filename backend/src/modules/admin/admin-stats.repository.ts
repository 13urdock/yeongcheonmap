import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ACTIVE_STORY_WHERE } from '../../common/story-visibility/story-visibility';
import { CreatedAtRange } from './admin-period';

export interface StoryCounts {
  storyCount: number; // 휴지통 제외(숨김 포함)
  photoCount: number;
  placeCount: number; // 기록이 하나 이상 있는 장소
  eventCount: number; // 기록이 하나 이상 있는 축제
  contributorCount: number; // 기록을 하나 이상 남긴 사람
  hiddenCount: number;
  trashCount: number;
  bySource: { source: string; count: number }[];
}

export interface ContributorCountRow {
  contributorId: string;
  nickname: string;
  accountName: string | null;
  hasContact: boolean;
  storyCount: number;
  photoCount: number;
  lastStoryAt: Date | null;
}

// 운영진 대시보드 집계 쿼리만
@Injectable()
export class AdminStatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async storyCounts(range?: CreatedAtRange): Promise<StoryCounts> {
    const active: Prisma.StoryWhereInput = { ...ACTIVE_STORY_WHERE, ...(range ? { createdAt: range } : {}) };
    const [storyCount, photoCount, placeCount, eventCount, contributorCount, hiddenCount, trashCount, bySource] =
      await Promise.all([
        this.prisma.story.count({ where: active }),
        this.prisma.storyPhoto.count({ where: { story: active } }),
        this.prisma.place.count({ where: { stories: { some: active } } }),
        this.prisma.event.count({ where: { stories: { some: active } } }),
        this.prisma.contributor.count({ where: { stories: { some: active } } }),
        this.prisma.story.count({ where: { ...active, hidden: true } }),
        this.prisma.story.count({ where: { deletedAt: { not: null }, ...(range ? { createdAt: range } : {}) } }),
        this.prisma.story.groupBy({ by: ['source'], where: active, _count: { _all: true } }),
      ]);
    return {
      storyCount,
      photoCount,
      placeCount,
      eventCount,
      contributorCount,
      hiddenCount,
      trashCount,
      bySource: bySource.map((g) => ({ source: g.source, count: g._count._all })),
    };
  }

  // 사람별 기록·사진 수 (휴지통 제외). 기록이 0개인 기록자도 포함, 많이 남긴 순
  contributorCounts(range?: CreatedAtRange): Promise<ContributorCountRow[]> {
    const gte = range?.gte ?? null;
    const lt = range?.lt ?? null;
    return this.prisma.$queryRaw<ContributorCountRow[]>(Prisma.sql`
      SELECT c."contributor_id" AS "contributorId",
             c."nickname",
             u."name" AS "accountName",
             (cc."contributor_id" IS NOT NULL) AS "hasContact",
             COUNT(DISTINCT s."story_id")::int AS "storyCount",
             COUNT(p."story_photo_id")::int AS "photoCount",
             MAX(s."created_at") AS "lastStoryAt"
      FROM "contributor" c
      LEFT JOIN "user" u ON u."user_id" = c."user_id"
      LEFT JOIN "contributor_contact" cc ON cc."contributor_id" = c."contributor_id"
      LEFT JOIN "story" s ON s."contributor_id" = c."contributor_id"
        AND s."deleted_at" IS NULL
        AND (${gte}::timestamptz IS NULL OR s."created_at" >= ${gte}::timestamptz)
        AND (${lt}::timestamptz IS NULL OR s."created_at" < ${lt}::timestamptz)
      LEFT JOIN "story_photo" p ON p."story_id" = s."story_id"
      GROUP BY c."contributor_id", c."nickname", u."name", cc."contributor_id"
      ORDER BY "storyCount" DESC, c."nickname" ASC
      LIMIT 1000
    `);
  }
}
