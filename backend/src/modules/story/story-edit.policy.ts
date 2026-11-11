import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { assertEditableStory } from './story-ownership';
import { StoryRow } from './story.mapper';

// "이 계정이 이 기록을 고칠 수 있나" 판단. 본인 기록이면 바로 통과, 아니면 운영진인지 DB 에서 확인.
@Injectable()
export class StoryEditPolicy {
  constructor(private readonly userService: UserService) {}

  async assertCanEdit(row: StoryRow | null, userId: string): Promise<StoryRow> {
    const isAdmin = row && row.userId !== userId ? await this.userService.isAdmin(userId) : false;
    return assertEditableStory(row, userId, isAdmin);
  }
}
