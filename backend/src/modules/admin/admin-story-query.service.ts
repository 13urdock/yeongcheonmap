import { Injectable } from '@nestjs/common';
import { PagedResult } from '../../common/dto/pagination.dto';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { QueryAdminStoriesDto } from './dto/query-admin-stories.dto';
import { toCreatedAtRange } from './admin-period';
import { AdminStoryFilter, toAdminStoryOrderBy, toAdminStoryWhere } from './admin-story-filter';
import { AdminStoryResponse, toAdminStoryResponse } from './admin-story.mapper';
import { AdminStoryRepository } from './admin-story.repository';
import { toStoriesCsv } from './story-csv';

/** CSV 한 번에 내보내는 최대 기록 수 */
export const CSV_MAX_ROWS = 5000;

// 운영진 기록 조회 유스케이스: 목록(필터·검색·기간·정렬), 단건, CSV 내보내기
@Injectable()
export class AdminStoryQueryService {
  constructor(private readonly repository: AdminStoryRepository) {}

  async list(query: QueryAdminStoriesDto): Promise<PagedResult<AdminStoryResponse>> {
    const [rows, totalCount] = await this.repository.list(
      toAdminStoryWhere(this.toFilter(query)),
      toAdminStoryOrderBy(query.sort),
      query.skip,
      query.size,
    );
    return { items: rows.map(toAdminStoryResponse), page: query.page, size: query.size, totalCount };
  }

  async get(storyId: string): Promise<AdminStoryResponse> {
    const row = await this.repository.findAnyById(storyId);
    if (!row) throw new AppException(AppErrorCode.STORY_NOT_FOUND, '존재하지 않는 기록입니다');
    return toAdminStoryResponse(row);
  }

  // 페이지와 상관없이 필터에 맞는 기록 전부(최대 CSV_MAX_ROWS)
  async exportCsv(query: QueryAdminStoriesDto): Promise<string> {
    const rows = await this.repository.findMany(
      toAdminStoryWhere(this.toFilter(query)),
      toAdminStoryOrderBy(query.sort),
      CSV_MAX_ROWS,
    );
    return toStoriesCsv(rows.map(toAdminStoryResponse));
  }

  private toFilter(q: QueryAdminStoriesDto): AdminStoryFilter {
    return {
      placeId: q.placeId,
      eventId: q.eventId,
      contributorId: q.contributorId,
      q: q.q,
      source: q.source,
      status: q.status,
      createdAt: toCreatedAtRange(q.from, q.to),
    };
  }
}
