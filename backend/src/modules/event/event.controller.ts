import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { EventService } from './event.service';

// 라우팅만. (축제 타임라인 GET /events/:id/stories 는 story 모듈 담당)
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // GET /events
  @Get()
  listPins() {
    return this.eventService.listPins();
  }

  // GET /events/:eventId
  @Get(':eventId')
  getDetail(@Param('eventId', ParseUUIDPipe) eventId: string) {
    return this.eventService.getDetail(eventId);
  }
}
