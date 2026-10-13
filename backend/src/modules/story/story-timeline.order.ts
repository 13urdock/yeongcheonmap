import { Prisma } from '../../generated/prisma/client';

// 타임라인 정렬 규칙 — 이 파일 한 곳에만 둔다. 원문: docs/ERD_v5.md §3
// - 연도 전부 모름(XXXX)은 방향과 상관없이 항상 맨 뒤
// - 나머지 키는 방향(asc/desc)을 그대로 따른다 → 내림차순은 오름차순을 정확히 뒤집은 것
// - 마지막 storyId 는 완전 동률일 때 순서를 고정해 페이지네이션이 흔들리지 않게 한다

export type TimelineOrder = 'asc' | 'desc';

export function timelineOrderBy(order: TimelineOrder): Prisma.StoryOrderByWithRelationInput[] {
  return [
    { memoryYearUnknown: 'asc' },
    { memoryYearFrom: order },
    { memoryYearTo: order },
    { memoryDateFrom: order },
    { memoryDateTo: order },
    { createdAt: order },
    { storyId: order },
  ];
}
