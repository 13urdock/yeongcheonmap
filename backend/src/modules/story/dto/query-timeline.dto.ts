import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { TimelineOrder } from '../story-timeline.order';

// GET /places/{id}/stories, GET /events/{id}/stories 쿼리 (API 명세 v4 §4·§5)
export class QueryTimelineDto extends PaginationDto {
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: TimelineOrder = 'asc';
}
