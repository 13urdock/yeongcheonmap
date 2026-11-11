import { Injectable } from '@nestjs/common';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { CreateStoryDto } from '../story/dto/create-story.dto';
import { UpdateStoryDto } from '../story/dto/update-story.dto';
import { StoryCreateService } from '../story/story-create.service';
import { StoryDeleteService } from '../story/story-delete.service';
import { StorySource } from '../story/story-source';
import { StoryUpdateService } from '../story/story-update.service';
import { AdminStoryResponse, AdminStoryRow, toAdminStoryResponse } from './admin-story.mapper';
import { AdminStoryRepository } from './admin-story.repository';

// 운영진 기록 쓰기 유스케이스.
// 작성·수정·휴지통 보내기는 앱과 같은 story 서비스를 그대로 쓴다(규칙 한 곳). 여기만의 일:
// - 작성 경로 = admin, 기록자 = 로그인한 계정(수집가·운영진)
// - 숨김 전환, 휴지통 복구, 영구 삭제(휴지통에 있는 것만)
@Injectable()
export class AdminStoryCommandService {
  constructor(
    private readonly repository: AdminStoryRepository,
    private readonly storyCreateService: StoryCreateService,
    private readonly storyUpdateService: StoryUpdateService,
    private readonly storyDeleteService: StoryDeleteService,
  ) {}

  async create(dto: CreateStoryDto, userId: string): Promise<AdminStoryResponse> {
    const { storyId } = await this.storyCreateService.create(dto, { userId, source: StorySource.ADMIN });
    return toAdminStoryResponse(await this.findOrThrow(storyId));
  }

  async update(storyId: string, dto: UpdateStoryDto, userId: string): Promise<AdminStoryResponse> {
    await this.storyUpdateService.update(storyId, dto, userId);
    return toAdminStoryResponse(await this.findOrThrow(storyId));
  }

  async trash(storyId: string, userId: string): Promise<void> {
    await this.storyDeleteService.delete(storyId, userId);
  }

  async setHidden(storyId: string, hidden: boolean): Promise<AdminStoryResponse> {
    const row = await this.findOrThrow(storyId);
    if (row.deletedAt) throw new AppException(AppErrorCode.INVALID_PARAMETER, '휴지통의 기록은 먼저 복구해 주세요');
    await this.repository.setHidden(storyId, hidden);
    return toAdminStoryResponse({ ...row, hidden });
  }

  async restore(storyId: string): Promise<AdminStoryResponse> {
    const row = await this.findOrThrow(storyId);
    if (!row.deletedAt) throw new AppException(AppErrorCode.INVALID_PARAMETER, '휴지통에 있는 기록이 아니에요');
    await this.repository.restore(storyId);
    return toAdminStoryResponse({ ...row, deletedAt: null });
  }

  async purge(storyId: string): Promise<void> {
    const row = await this.findOrThrow(storyId);
    if (!row.deletedAt) throw new AppException(AppErrorCode.INVALID_PARAMETER, '휴지통에 넣은 기록만 영구 삭제할 수 있어요');
    await this.repository.hardDelete(storyId);
  }

  private async findOrThrow(storyId: string): Promise<AdminStoryRow> {
    const row = await this.repository.findAnyById(storyId);
    if (!row) throw new AppException(AppErrorCode.STORY_NOT_FOUND, '존재하지 않는 기록입니다');
    return row;
  }
}
