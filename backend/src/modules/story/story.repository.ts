import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ResolvedMemoryDate } from '../../common/memory-date/memory-date.resolver';
import { StoryRow, storyInclude } from './story.mapper';
import { TimelineOrder, timelineOrderBy } from './story-timeline.order';

/** 타임라인 대상: 장소 또는 축제 하나 */
export type TimelineAnchor = { placeId: string } | { eventId: string };

export interface CreateStoryData extends ResolvedMemoryDate {
  userId: string;
  placeId?: string;
  eventId?: string;
  placeNameThen?: string;
  content?: string;
  photoUrls: string[];
}

// story / story_photo 쿼리만
@Injectable()
export class StoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTimeline(
    anchor: TimelineAnchor,
    order: TimelineOrder,
    skip: number,
    take: number,
  ): Promise<[StoryRow[], number]> {
    return Promise.all([
      this.prisma.story.findMany({ where: anchor, include: storyInclude, orderBy: timelineOrderBy(order), skip, take }),
      this.prisma.story.count({ where: anchor }),
    ]);
  }

  findById(storyId: string): Promise<StoryRow | null> {
    return this.prisma.story.findUnique({ where: { storyId }, include: storyInclude });
  }

  // 스토리와 사진을 한 번에 생성(중첩 create → 한 트랜잭션)
  create({ photoUrls, ...data }: CreateStoryData): Promise<StoryRow> {
    return this.prisma.story.create({
      data: { ...data, photos: { create: photoUrls.map((imageUrl) => ({ imageUrl })) } },
      include: storyInclude,
    });
  }
}
