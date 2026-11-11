import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminStoryRow, adminStoryInclude } from './admin-story.mapper';

// 운영진 관리용 story 쿼리만: 숨김·휴지통 포함 조회, 숨김 전환, 복구, 영구 삭제
@Injectable()
export class AdminStoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    where: Prisma.StoryWhereInput,
    orderBy: Prisma.StoryOrderByWithRelationInput[],
    skip: number,
    take: number,
  ): Promise<[AdminStoryRow[], number]> {
    return Promise.all([
      this.prisma.story.findMany({ where, orderBy, skip, take, include: adminStoryInclude }),
      this.prisma.story.count({ where }),
    ]);
  }

  findMany(where: Prisma.StoryWhereInput, orderBy: Prisma.StoryOrderByWithRelationInput[], take: number): Promise<AdminStoryRow[]> {
    return this.prisma.story.findMany({ where, orderBy, take, include: adminStoryInclude });
  }

  findAnyById(storyId: string): Promise<AdminStoryRow | null> {
    return this.prisma.story.findUnique({ where: { storyId }, include: adminStoryInclude });
  }

  async setHidden(storyId: string, hidden: boolean): Promise<void> {
    await this.prisma.story.update({ where: { storyId }, data: { hidden } });
  }

  async restore(storyId: string): Promise<void> {
    await this.prisma.story.update({ where: { storyId }, data: { deletedAt: null } });
  }

  // 영구 삭제 — 사진 행은 함께 지워진다(onDelete: Cascade). 저장소 파일은 남는다(명세 §8)
  async hardDelete(storyId: string): Promise<void> {
    await this.prisma.story.delete({ where: { storyId } });
  }
}
