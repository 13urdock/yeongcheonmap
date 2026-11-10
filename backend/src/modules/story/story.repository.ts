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
      data: { ...data, photos: { create: photoRows(photoUrls) } },
      include: storyInclude,
    });
  }

  // 필드 수정 + (photoUrls 가 있으면) 사진 전체 교체를 한 트랜잭션으로
  update(storyId: string, { photoUrls, ...data }: UpdateStoryData): Promise<StoryRow> {
    const photos = photoUrls ? { deleteMany: {}, create: photoRows(photoUrls) } : undefined;
    return this.prisma.story.update({ where: { storyId }, data: { ...data, photos }, include: storyInclude });
  }

  async delete(storyId: string): Promise<void> {
    await this.prisma.story.delete({ where: { storyId } });
  }
}
