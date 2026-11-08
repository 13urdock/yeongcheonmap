import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { QueryEventsDto } from './dto/query-events.dto';
import { EventService } from './event.service';

// 라우팅만. (축제 타임라인 GET /events/:id/stories 는 story 모듈 담당)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // GET /events?q=
  @Get()
  listPins(@Query() query: QueryEventsDto) {
    return this.eventService.listPins(query.q?.trim() || undefined);
  }

  // GET /events/:eventId
  @Get(':eventId')
  getDetail(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventService.getDetail(eventId);
  }
}
