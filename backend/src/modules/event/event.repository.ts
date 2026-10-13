import { Injectable } from '@nestjs/common';
import { Event, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const withStoryCount = { _count: { select: { stories: true } } } satisfies Prisma.EventInclude;
export type EventPinRow = Prisma.EventGetPayload<{ include: typeof withStoryCount }>;

const detailInclude = {
  hosts: true,
  occurrences: { orderBy: { year: 'asc' } },
  _count: { select: { stories: true } },
} satisfies Prisma.EventInclude;
export type EventDetailRow = Prisma.EventGetPayload<{ include: typeof detailInclude }>;

// event 테이블 조회 쿼리만
@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 지도에 올릴 수 있는(좌표가 있는) 축제만
  findPins(): Promise<EventPinRow[]> {
    return this.prisma.event.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      include: withStoryCount,
      orderBy: { name: 'asc' },
    });
  }

  findDetail(eventId: string): Promise<EventDetailRow | null> {
    return this.prisma.event.findUnique({ where: { eventId }, include: detailInclude });
  }

  findById(eventId: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { eventId } });
  }
}
