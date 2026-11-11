import { Prisma } from '../../generated/prisma/client';

// 기록이 "어디에 보이는가"의 기준 한 곳 (ERD v6 §2).
// - 공개: 앱·관람객 웹(지도 기록 수, 타임라인, 상세)에 보이는 기록 = 숨김 아님 + 휴지통 아님
// - 활성: 휴지통이 아닌 기록(숨김 포함) = 운영진 관리 화면의 기본 목록·집계 대상

export const PUBLIC_STORY_WHERE = { hidden: false, deletedAt: null } satisfies Prisma.StoryWhereInput;

export const ACTIVE_STORY_WHERE = { deletedAt: null } satisfies Prisma.StoryWhereInput;
