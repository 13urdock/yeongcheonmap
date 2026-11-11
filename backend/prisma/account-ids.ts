// 운영 계정(수집가·운영진)과 그 기록자의 고정 ID. seed.ts 와 migration(20261111000000_admin_contributor)이 같이 쓴다.
// 수집가 ID 는 src/modules/visitor/visitor.constants.ts 의 VISITOR_STORY_USER_ID 와 같아야 한다.

export const COLLECTOR_USER_ID = 'b0000000-0000-4000-8000-000000000001'; // 수집가 (seed@yeongcheonmap.local)
export const OPERATOR_USER_ID = 'b0000000-0000-4000-8000-000000000002'; // 운영진 (staff@yeongcheonmap.local)

export const COLLECTOR_CONTRIBUTOR_ID = 'f0000000-0000-4000-8000-000000000001';
export const OPERATOR_CONTRIBUTOR_ID = 'f0000000-0000-4000-8000-000000000002';
