import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { AdminPagedPeriodDto } from './admin-period.dto';
import { STORY_SOURCES, StorySource } from '../../story/story-source';
import { ADMIN_STORY_SORTS, ADMIN_STORY_STATUSES, AdminStorySort, AdminStoryStatus } from '../admin-story-filter';

// GET /admin/stories · /admin/stories/export 쿼리 (API 명세 v4.8 §12)
export class QueryAdminStoriesDto extends AdminPagedPeriodDto {
  @IsOptional()
  @IsUUID()
  placeId?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  @IsOptional()
  @IsUUID()
  contributorId?: string;

  /** 글·그때 이름·장소 이름 부분 일치 */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;

  @IsOptional()
  @IsIn(STORY_SOURCES)
  source?: StorySource;

  @IsOptional()
  @IsIn(ADMIN_STORY_STATUSES)
  status: AdminStoryStatus = 'active';

  @IsOptional()
  @IsIn(ADMIN_STORY_SORTS)
  sort: AdminStorySort = 'created_desc';
}
