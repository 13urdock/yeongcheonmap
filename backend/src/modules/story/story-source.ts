// 기록이 들어온 경로 (ERD v6). 경로별 집계·CSV 에 쓴다.
export const StorySource = {
  APP: 'app', // 앱 (전시 기기 등)
  VISITOR_WEB: 'visitor_web', // 관람객 웹 (QR)
  ADMIN: 'admin', // 운영진 관리 웹
} as const;

export type StorySource = (typeof StorySource)[keyof typeof StorySource];

export const STORY_SOURCES: StorySource[] = Object.values(StorySource);
