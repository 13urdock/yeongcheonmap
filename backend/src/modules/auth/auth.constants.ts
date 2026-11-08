// 토큰 수명. access 는 짧게(요청마다 부착), refresh 는 길게(앱이 저장해 두고 access 를 재발급받음).
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60; // 1시간
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30일
