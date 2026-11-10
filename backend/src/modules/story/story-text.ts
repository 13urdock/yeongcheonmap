// 공백뿐인 글은 없는 것으로 본다 (작성·수정 공통)
export function normalizeStoryText(text: string | null | undefined): string | undefined {
  const trimmed = text?.trim();
  return trimmed ? trimmed : undefined;
}
