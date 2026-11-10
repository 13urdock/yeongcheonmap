import { Injectable } from '@nestjs/common';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { resolveMemoryDate } from '../../common/memory-date/memory-date.resolver';
import { PhotoUrlPolicy } from '../upload/photo-url.policy';
import { UpdateStoryDto } from './dto/update-story.dto';
import { assertOwnedStory } from './story-ownership';
import { normalizeStoryText } from './story-text';
import { StoryResponse, toStoryResponse } from './story.mapper';
import { StoryRepository, UpdateStoryData } from './story.repository';

// 스토리 수정 유스케이스. 규칙:
// 1) 본인 기록만 (FORBIDDEN)
// 2) 보낸 필드만 바꾼다. placeNameThen·content 는 ""/null 이면 지운다
// 3) photoUrls 를 보내면 사진 목록 전체 교체(순서 유지), 우리 저장소 주소만
// 4) 바꾼 결과에도 글 또는 사진이 하나는 남아야 한다
// 5) 저장소의 옛 사진 파일은 지우지 않는다 (명세 §8)
@Injectable()
export class StoryUpdateService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly photoUrlPolicy: PhotoUrlPolicy,
  ) {}

  async update(storyId: string, dto: UpdateStoryDto, userId: string): Promise<StoryResponse> {
    const current = assertOwnedStory(await this.storyRepository.findById(storyId), userId);
    if (dto.photoUrls) this.photoUrlPolicy.assertOwnPhotoUrls(dto.photoUrls);

    const data: UpdateStoryData = {};
    if (dto.memoryDate !== undefined) Object.assign(data, resolveMemoryDate(dto.memoryDate));
    if (dto.placeNameThen !== undefined) data.placeNameThen = normalizeStoryText(dto.placeNameThen) ?? null;
    if (dto.content !== undefined) data.content = normalizeStoryText(dto.content) ?? null;
    if (dto.photoUrls !== undefined) data.photoUrls = dto.photoUrls;

    const nextContent = data.content !== undefined ? data.content : current.content;
    const nextPhotoCount = data.photoUrls !== undefined ? data.photoUrls.length : current.photos.length;
    if (!nextContent && nextPhotoCount === 0) {
      throw new AppException(AppErrorCode.INVALID_PARAMETER, '글 또는 사진 중 하나는 남겨야 합니다');
    }

    return toStoryResponse(await this.storyRepository.update(storyId, data));
  }
}
