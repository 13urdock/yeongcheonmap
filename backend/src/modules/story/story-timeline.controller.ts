import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { StoryQueryService } from './story-query.service';

// 장소·축제 핀을 눌렀을 때의 타임라인. 경로는 장소/축제 아래지만 다루는 리소스는 story.
@Controller()
export class StoryTimelineController {
  constructor(private readonly storyQueryService: StoryQueryService) {}

  // GET /places/:placeId/stories?order=asc|desc&page=&size=
  @Get('places/:placeId/stories')
  placeTimeline(@Param('placeId', ParseUUIDPipe) placeId: string, @Query() query: QueryTimelineDto) {
    return this.storyQueryService.placeTimeline(placeId, query);
  }

  // GET /events/:eventId/stories?order=asc|desc&page=&size=
  @Get('events/:eventId/stories')
  eventTimeline(@Param('eventId', ParseUUIDPipe) eventId: string, @Query() query: QueryTimelineDto) {
    return this.storyQueryService.eventTimeline(eventId, query);
  }
}
