import { Injectable } from '@nestjs/common';
import { PagedResult } from '../../common/dto/pagination.dto';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { EventService } from '../event/event.service';
import { PlaceService } from '../place/place.service';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { StoryResponse, toStoryResponse } from './story.mapper';
import { StoryRepository, TimelineAnchor } from './story.repository';

// 스토리 조회 유스케이스: 장소·축제 타임라인(기억 날짜 순), 단건 상세
@Injectable()
export class StoryQueryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly placeService: PlaceService,
    private readonly eventService: EventService,
  ) {}

  async placeTimeline(placeId: string, query: QueryTimelineDto): Promise<PagedResult<StoryResponse>> {
    await this.placeService.getPlaceOrThrow(placeId);
    return this.timeline({ placeId }, query);
  }

  async eventTimeline(eventId: string, query: QueryTimelineDto): Promise<PagedResult<StoryResponse>> {
    await this.eventService.getEventOrThrow(eventId);
    return this.timeline({ eventId }, query);
  }

  async getStory(storyId: string): Promise<StoryResponse> {
    const row = await this.storyRepository.findById(storyId);
    if (!row) {
      throw new AppException(AppErrorCode.STORY_NOT_FOUND, '존재하지 않는 기록입니다');
    }
    return toStoryResponse(row);
  }

  private async timeline(anchor: TimelineAnchor, query: QueryTimelineDto): Promise<PagedResult<StoryResponse>> {
    const [rows, totalCount] = await this.storyRepository.findTimeline(anchor, query.order, query.skip, query.size);
    return { items: rows.map(toStoryResponse), page: query.page, size: query.size, totalCount };
  }
}
