// 에러 코드 ↔ HTTP 상태 매핑 (출처: docs/API명세서_v4.md §1 에러 코드 표)
// 명세에 없는 코드를 추가할 때는 명세부터 갱신한다.

export const AppErrorCode = {
  INVALID_PARAMETER: 'INVALID_PARAMETER', // 400
  UNAUTHORIZED: 'UNAUTHORIZED', // 401
  FORBIDDEN: 'FORBIDDEN', // 403
  PLACE_NOT_FOUND: 'PLACE_NOT_FOUND', // 404
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND', // 404
  STORY_NOT_FOUND: 'STORY_NOT_FOUND', // 404
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL', // 409
  INTERNAL_ERROR: 'INTERNAL_ERROR', // 500
} as const;

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode];

export const APP_ERROR_STATUS: Record<AppErrorCode, number> = {
  INVALID_PARAMETER: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  PLACE_NOT_FOUND: 404,
  EVENT_NOT_FOUND: 404,
  STORY_NOT_FOUND: 404,
  DUPLICATE_EMAIL: 409,
  INTERNAL_ERROR: 500,
};
