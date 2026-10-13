import { Injectable } from '@nestjs/common';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { resolveMemoryDate } from '../../common/memory-date/memory-date.resolver';
import { EventService } from '../event/event.service';
import { PlaceService } from '../place/place.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { StoryResponse, toStoryResponse } from './story.mapper';
import { StoryRepository } from './story.repository';

// 스토리 작성 유스케이스. 규칙:
// 1) placeId 또는 eventId 중 최소 하나 (둘 다 가능)
// 2) content 또는 photoUrls(1개 이상) 중 최소 하나 — 사진만 / 글만 가능
// 3) memoryDate 는 resolver 가 가능한 날짜인지 검증하고 정렬용 값까지 계산
@Injectable()
export class StoryCreateService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly placeService: PlaceService,
    private readonly eventService: EventService,
  ) {}

  async create(dto: CreateStoryDto, userId: string): Promise<StoryResponse> {
    this.assertAnchor(dto);
    const content = this.normalizeText(dto.content);
    const photoUrls = dto.photoUrls ?? [];
    this.assertHasContent(content, photoUrls);

    const memory = resolveMemoryDate(dto.memoryDate);
    if (dto.placeId) await this.placeService.getPlaceOrThrow(dto.placeId);
    if (dto.eventId) await this.eventService.getEventOrThrow(dto.eventId);

    const row = await this.storyRepository.create({
      ...memory,
      userId,
      placeId: dto.placeId,
      eventId: dto.eventId,
      placeNameThen: this.normalizeText(dto.placeNameThen),
      content,
      photoUrls,
    });
    return toStoryResponse(row);
  }

  private assertAnchor(dto: CreateStoryDto): void {
    if (!dto.placeId && !dto.eventId) {
      throw new AppException(AppErrorCode.INVALID_PARAMETER, 'placeId 또는 eventId 중 하나는 필요합니다');
    }
  }

  private assertHasContent(content: string | undefined, photoUrls: string[]): void {
    if (!content && photoUrls.length === 0) {
      throw new AppException(AppErrorCode.INVALID_PARAMETER, '글 또는 사진 중 하나는 필요합니다');
    }
  }

  // 공백뿐인 글은 없는 것으로 본다
  private normalizeText(text: string | undefined): string | undefined {
    const trimmed = text?.trim();
    return trimmed ? trimmed : undefined;
  }
}
