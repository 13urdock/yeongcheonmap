import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ACTIVE_STORY_WHERE, PUBLIC_STORY_WHERE } from '../../common/story-visibility/story-visibility';
import { ResolvedMemoryDate } from '../../common/memory-date/memory-date.resolver';
import { StorySource } from './story-source';
import { StoryRow, storyInclude } from './story.mapper';
import { TimelineOrder, timelineOrderBy } from './story-timeline.order';

/** 타임라인 대상: 장소 또는 축제 하나 */
export type TimelineAnchor = { placeId: string } | { eventId: string };

export interface CreateStoryData extends ResolvedMemoryDate {
  userId: string;
  contributorId: string;
  source: StorySource;
  placeId?: string;
  eventId?: string;
  placeNameThen?: string;
  content?: string;
  photoUrls: string[];
}

/** 수정할 값만. undefined = 그대로, null = 지우기. photoUrls 가 있으면 사진 전체 교체 */
export interface UpdateStoryData extends Partial<ResolvedMemoryDate> {
  placeNameThen?: string | null;
  content?: string | null;
  photoUrls?: string[];
}

// 사진 순서 = created_at 오름차순(story.mapper). 한 번에 넣으면 시각이 같아 순서가 섞일 수 있어
// 고른 순서대로 1ms 씩 늦춰 넣는다.
function photoRows(photoUrls: string[]): { imageUrl: string; createdAt: Date }[] {
  const base = Date.now();
  return photoUrls.map((imageUrl, i) => ({ imageUrl, createdAt: new Date(base + i) }));
}

// story / story_photo 쿼리만 (앱·관람객 웹용). 운영진 관리 쿼리는 admin/admin-story.repository
@Injectable()
export class StoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTimeline(
    anchor: TimelineAnchor,
    order: TimelineOrder,
    skip: number,
    take: number,
  ): Promise<[StoryRow[], number]> {
    const where = { ...anchor, ...PUBLIC_STORY_WHERE };
    return Promise.all([
      this.prisma.story.findMany({ where, include: storyInclude, orderBy: timelineOrderBy(order), skip, take }),
      this.prisma.story.count({ where }),
    ]);
  }

  // 앱·관람객 웹 상세: 공개 기록만 (숨김·휴지통은 없는 것으로)
  findPublicById(storyId: string): Promise<StoryRow | null> {
    return this.prisma.story.findFirst({ where: { storyId, ...PUBLIC_STORY_WHERE }, include: storyInclude });
  }

  // 수정·삭제 대상: 휴지통이 아닌 기록 (숨김 포함 — 운영진이 숨긴 기록도 고칠 수 있게)
  findActiveById(storyId: string): Promise<StoryRow | null> {
    return this.prisma.story.findFirst({ where: { storyId, ...ACTIVE_STORY_WHERE }, include: storyInclude });
  }

  // 스토리와 사진을 한 번에 생성(중첩 create → 한 트랜잭션)
  create({ photoUrls, ...data }: CreateStoryData): Promise<StoryRow> {
    return this.prisma.story.create({
      data: { ...data, photos: { create: photoRows(photoUrls) } },
      include: storyInclude,
    });
  }

  // 필드 수정 + (photoUrls 가 있으면) 사진 전체 교체를 한 트랜잭션으로
  update(storyId: string, { photoUrls, ...data }: UpdateStoryData): Promise<StoryRow> {
    const photos = photoUrls ? { deleteMany: {}, create: photoRows(photoUrls) } : undefined;
    return this.prisma.story.update({ where: { storyId }, data: { ...data, photos }, include: storyInclude });
  }

  // 휴지통으로 (사진 행은 그대로 — 복구하면 다시 보인다)
  async softDelete(storyId: string, at: Date): Promise<void> {
    await this.prisma.story.update({ where: { storyId }, data: { deletedAt: at } });
  }
}
