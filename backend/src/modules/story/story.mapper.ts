import { Prisma } from '../../generated/prisma/client';
import { toIsoDate } from '../../common/memory-date/seoul-today';

// 스토리 공통 구조 (API 명세 v4 §7)
export const storyInclude = {
  user: { select: { userId: true, name: true, profile: { select: { profileUrl: true } } } },
  photos: { select: { storyPhotoId: true, imageUrl: true }, orderBy: { createdAt: 'asc' } },
} satisfies Prisma.StoryInclude;
export type StoryRow = Prisma.StoryGetPayload<{ include: typeof storyInclude }>;

export interface MemoryDateResponse {
  pattern: string;
  from: string; // YYYY-MM-DD
  to: string;
  yearFrom: number;
  yearTo: number;
}

export interface StoryResponse {
  storyId: string;
  user: { userId: string; name: string; profileUrl: string | null };
  placeId: string | null;
  eventId: string | null;
  memoryDate: MemoryDateResponse;
  placeNameThen: string | null;
  content: string | null;
  photos: { storyPhotoId: string; imageUrl: string }[];
  createdAt: string;
}

export function toStoryResponse(row: StoryRow): StoryResponse {
  return {
    storyId: row.storyId,
    user: { userId: row.user.userId, name: row.user.name, profileUrl: row.user.profile?.profileUrl ?? null },
    placeId: row.placeId,
    eventId: row.eventId,
    memoryDate: {
      pattern: row.memoryDate,
      from: toIsoDate(row.memoryDateFrom),
      to: toIsoDate(row.memoryDateTo),
      yearFrom: row.memoryYearFrom,
      yearTo: row.memoryYearTo,
    },
    placeNameThen: row.placeNameThen,
    content: row.content,
    photos: row.photos,
    createdAt: row.createdAt.toISOString(),
  };
}
