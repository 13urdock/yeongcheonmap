import { Prisma } from '../../generated/prisma/client';
import { storyInclude, StoryResponse, toStoryResponse } from '../story/story.mapper';

// 관리 화면 기록 = 공통 기록 + 장소·축제 이름 + 관리 상태 (API 명세 v4.8 §12)
export const adminStoryInclude = {
  ...storyInclude,
  place: { select: { placeId: true, name: true } },
  event: { select: { eventId: true, name: true } },
} satisfies Prisma.StoryInclude;
export type AdminStoryRow = Prisma.StoryGetPayload<{ include: typeof adminStoryInclude }>;

export interface AdminStoryResponse extends StoryResponse {
  place: { placeId: string; name: string } | null;
  event: { eventId: string; name: string } | null;
  source: string;
  hidden: boolean;
  deletedAt: string | null;
  updatedAt: string;
}

export function toAdminStoryResponse(row: AdminStoryRow): AdminStoryResponse {
  return {
    ...toStoryResponse(row),
    place: row.place,
    event: row.event,
    source: row.source,
    hidden: row.hidden,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}
