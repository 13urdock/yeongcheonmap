import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { StoryRow } from './story.mapper';

// 수정·삭제 공통 규칙: 기록이 있어야 하고, 작성자 본인이어야 한다.
export function assertOwnedStory(row: StoryRow | null, userId: string): StoryRow {
  if (!row) {
    throw new AppException(AppErrorCode.STORY_NOT_FOUND, '존재하지 않는 기록입니다');
  }
  if (row.userId !== userId) {
    throw new AppException(AppErrorCode.FORBIDDEN, '본인이 남긴 기록만 고칠 수 있어요');
  }
  return row;
}
