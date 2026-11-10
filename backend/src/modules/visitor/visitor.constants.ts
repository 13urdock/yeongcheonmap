// 관람객 웹에서 남긴 기록의 작성자 = 시드 수집가 계정 (prisma/seed.ts 의 SEED_USER_ID 와 같아야 한다).
// 전시 기기(운영진)도 같은 계정으로 로그인하므로, 운영진이 관람객 기록을 수정·삭제할 수 있다.
export const VISITOR_STORY_USER_ID = 'b0000000-0000-4000-8000-000000000001';

/** 관람객 웹이 쓰기 코드를 보내는 헤더 */
export const VISITOR_CODE_HEADER = 'x-visitor-code';

/** 같은 IP 에서 RATE_WINDOW_MS 동안 쓰기 요청 RATE_LIMIT 번까지 (기록 하나 = 요청 2~3번) */
export const VISITOR_RATE_LIMIT = 120;
export const VISITOR_RATE_WINDOW_MS = 10 * 60 * 1000;
