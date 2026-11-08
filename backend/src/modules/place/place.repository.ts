import { Injectable } from '@nestjs/common';
import { Place, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BoundingBox } from '../../common/utils/bbox.parser';

// 핀·상세 조회 형태: 장소 + 기록 수
const withStoryCount = { _count: { select: { stories: true } } } satisfies Prisma.PlaceInclude;
export type PlaceWithCountRow = Prisma.PlaceGetPayload<{ include: typeof withStoryCount }>;

export interface PinFilter {
  bbox?: BoundingBox;
  usageType?: string;
  keyword?: string; // 이름·주소 부분 일치
}

export interface CreatePlaceData {
  name: string;
  usageType?: string;
  intro?: string;
  latitude: number;
  longitude: number;
  address?: string;
  sinceYear?: number;
  thumbnailUrl?: string;
  createdBy: string;
}

// place 테이블 조회·생성 쿼리만
@Injectable()
export class PlaceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPins(filter: PinFilter, skip: number, take: number): Promise<[PlaceWithCountRow[], number]> {
    const where = this.toPinWhere(filter);
    return Promise.all([
      this.prisma.place.findMany({ where, include: withStoryCount, orderBy: { name: 'asc' }, skip, take }),
      this.prisma.place.count({ where }),
    ]);
  }

  findDetail(placeId: string): Promise<PlaceWithCountRow | null> {
    return this.prisma.place.findUnique({ where: { placeId }, include: withStoryCount });
  }

  findById(placeId: string): Promise<Place | null> {
    return this.prisma.place.findUnique({ where: { placeId } });
  }

  // 여러 사각형 중 하나라도 안에 드는 장소 (같은 장소 판정의 1차 거르기, 한 번의 쿼리)
  findInBoxes(boxes: BoundingBox[]): Promise<Place[]> {
    if (boxes.length === 0) return Promise.resolve([]);
    return this.prisma.place.findMany({
      where: {
        OR: boxes.map((b) => ({
          latitude: { gte: b.minLat, lte: b.maxLat },
          longitude: { gte: b.minLng, lte: b.maxLng },
        })),
      },
    });
  }

  create(data: CreatePlaceData): Promise<Place> {
    return this.prisma.place.create({ data });
  }

  private toPinWhere({ bbox, usageType, keyword }: PinFilter): Prisma.PlaceWhereInput {
    return {
      ...(usageType ? { usageType } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { address: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(bbox
        ? {
            latitude: { gte: bbox.minLat, lte: bbox.maxLat },
            longitude: { gte: bbox.minLng, lte: bbox.maxLng },
          }
        : {}),
    };
  }
}
