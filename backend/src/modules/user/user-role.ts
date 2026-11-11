// 계정 역할 (ERD v6). 수집가·운영진 계정은 admin 이고 권한이 같다(이름만 다름).
export const UserRole = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export function isAdminRole(role: string | null | undefined): boolean {
  return role === UserRole.ADMIN;
}
