import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ACTIVE_STORY_WHERE } from '../../common/story-visibility/story-visibility';
import { AdminPlaceSort } from './dto/query-admin-places.dto';

// 관리 화면 장소 = 장소 + 기록 수(휴지통 제외, 숨김 포함)
const adminPlaceInclude = { _count: { select: { stories: { where: ACTIVE_STORY_WHERE } } } } satisfies Prisma.PlaceInclude;
export type AdminPlaceRow = Prisma.PlaceGetPayload<{ include: typeof adminPlaceInclude }>;

export type UpdatePlaceData = Prisma.PlaceUpdateInput;

const ORDER: Record<AdminPlaceSort, Prisma.PlaceOrderByWithRelationInput[]> = {
  count: [{ stories: { _count: 'desc' } }, { name: 'asc' }],
  name: [{ name: 'asc' }],
  recent: [{ createdAt: 'desc' }],
};

// 운영진 관리용 place 쿼리만
@Injectable()
export class AdminPlaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(keyword: string | undefined, sort: AdminPlaceSort, skip: number, take: number): Promise<[AdminPlaceRow[], number]> {
    const where: Prisma.PlaceWhereInput = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: 'insensitive' } },
            { address: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : {};
    return Promise.all([
      this.prisma.place.findMany({ where, include: adminPlaceInclude, orderBy: ORDER[sort], skip, take }),
      this.prisma.place.count({ where }),
    ]);
  }

  findById(placeId: string): Promise<AdminPlaceRow | null> {
    return this.prisma.place.findUnique({ where: { placeId }, include: adminPlaceInclude });
  }

  // 지우기 전 확인: 이 장소를 가리키는 기록(휴지통 포함)·축제 개최지 연결 수
  async countReferences(placeId: string): Promise<{ stories: number; eventPlaces: number }> {
    const [stories, eventPlaces] = await Promise.all([
      this.prisma.story.count({ where: { placeId } }),
      this.prisma.eventPlace.count({ where: { placeId } }),
    ]);
    return { stories, eventPlaces };
  }

  update(placeId: string, data: UpdatePlaceData): Promise<AdminPlaceRow> {
    return this.prisma.place.update({ where: { placeId }, data, include: adminPlaceInclude });
  }

  async delete(placeId: string): Promise<void> {
    await this.prisma.place.delete({ where: { placeId } });
  }
}
