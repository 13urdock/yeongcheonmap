import { Prisma } from '../../generated/prisma/client';
import { ACTIVE_STORY_WHERE, PUBLIC_STORY_WHERE } from '../../common/story-visibility/story-visibility';
import { timelineOrderBy } from '../story/story-timeline.order';
import { StorySource } from '../story/story-source';
import { CreatedAtRange } from './admin-period';

// 관리 화면 기록 목록의 필터·정렬 → Prisma 조건 (순수 함수, DB 접근 없음)

/** active=휴지통 제외(숨김 포함, 기본) · public=앱에 보이는 것 · hidden=숨김만 · trash=휴지통 · all=전부 */
export const ADMIN_STORY_STATUSES = ['active', 'public', 'hidden', 'trash', 'all'] as const;
export type AdminStoryStatus = (typeof ADMIN_STORY_STATUSES)[number];

export const ADMIN_STORY_SORTS = ['created_desc', 'created_asc', 'memory_asc', 'memory_desc'] as const;
export type AdminStorySort = (typeof ADMIN_STORY_SORTS)[number];

export interface AdminStoryFilter {
  placeId?: string;
  eventId?: string;
  contributorId?: string;
  q?: string;
  source?: StorySource;
  status: AdminStoryStatus;
  createdAt?: CreatedAtRange;
}

function statusWhere(status: AdminStoryStatus): Prisma.StoryWhereInput {
  switch (status) {
    case 'active':
      return ACTIVE_STORY_WHERE;
    case 'public':
      return PUBLIC_STORY_WHERE;
    case 'hidden':
      return { ...ACTIVE_STORY_WHERE, hidden: true };
    case 'trash':
      return { deletedAt: { not: null } };
    case 'all':
      return {};
  }
}

export function toAdminStoryWhere(f: AdminStoryFilter): Prisma.StoryWhereInput {
  const q = f.q?.trim();
  return {
    ...statusWhere(f.status),
    ...(f.placeId ? { placeId: f.placeId } : {}),
    ...(f.eventId ? { eventId: f.eventId } : {}),
    ...(f.contributorId ? { contributorId: f.contributorId } : {}),
    ...(f.source ? { source: f.source } : {}),
    ...(f.createdAt ? { createdAt: f.createdAt } : {}),
    ...(q
      ? {
          OR: [
            { content: { contains: q, mode: 'insensitive' } },
            { placeNameThen: { contains: q, mode: 'insensitive' } },
            { place: { name: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };
}

export function toAdminStoryOrderBy(sort: AdminStorySort): Prisma.StoryOrderByWithRelationInput[] {
  switch (sort) {
    case 'created_desc':
      return [{ createdAt: 'desc' }];
    case 'created_asc':
      return [{ createdAt: 'asc' }];
    case 'memory_asc':
      return timelineOrderBy('asc');
    case 'memory_desc':
      return timelineOrderBy('desc');
  }
}
