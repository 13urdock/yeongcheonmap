import { Injectable } from '@nestjs/common';
import { StoryEditPolicy } from './story-edit.policy';
import { StoryRepository } from './story.repository';

// 스토리 삭제 유스케이스 (ERD v6): 본인 기록 또는 운영진만. 바로 지우지 않고 휴지통으로 보낸다(deleted_at).
// 복구·영구 삭제는 운영진 관리 웹(admin 모듈)에서. 저장소의 사진 파일은 지우지 않는다 (명세 §8).
@Injectable()
export class StoryDeleteService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly editPolicy: StoryEditPolicy,
  ) {}

  async delete(storyId: string, userId: string, now: Date = new Date()): Promise<void> {
    await this.editPolicy.assertCanEdit(await this.storyRepository.findActiveById(storyId), userId);
    await this.storyRepository.softDelete(storyId, now);
  }
}
