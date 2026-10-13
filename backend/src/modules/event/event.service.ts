import { Injectable } from '@nestjs/common';
import { Event } from '../../generated/prisma/client';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { EventDetailResponse, EventPinResponse, toEventDetailResponse, toEventPinResponse } from './event.mapper';
import { EventRepository } from './event.repository';

// 축제 조회 유스케이스
@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async listPins(): Promise<{ items: EventPinResponse[] }> {
    const rows = await this.eventRepository.findPins();
    return { items: rows.map(toEventPinResponse) };
  }

  async getDetail(eventId: string): Promise<EventDetailResponse> {
    const row = await this.eventRepository.findDetail(eventId);
    if (!row) {
      throw new AppException(AppErrorCode.EVENT_NOT_FOUND, '존재하지 않는 축제입니다');
    }
    return toEventDetailResponse(row);
  }

  // 다른 서비스(story)가 "존재하는 축제"를 보장받을 때 사용
  async getEventOrThrow(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new AppException(AppErrorCode.EVENT_NOT_FOUND, '존재하지 않는 축제입니다');
    }
    return event;
  }
}
