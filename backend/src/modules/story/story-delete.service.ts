import { Injectable } from '@nestjs/common';
import { assertOwnedStory } from './story-ownership';
import { StoryRepository } from './story.repository';

// 스토리 삭제 유스케이스: 본인 기록만. 사진 행은 DB 에서 같이 지워진다(onDelete: Cascade).
// 저장소의 사진 파일은 지우지 않는다 (명세 §8).
@Injectable()
export class StoryDeleteService {
  constructor(private readonly storyRepository: StoryRepository) {}

  async delete(storyId: string, userId: string): Promise<void> {
    assertOwnedStory(await this.storyRepository.findById(storyId), userId);
    await this.storyRepository.delete(storyId);
  }
}
