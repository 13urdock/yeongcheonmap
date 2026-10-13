import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// 목록 조회 공통 쿼리: ?page=1&size=20 (출처: API 명세 v3 §1)
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  size: number = 20;

  get skip(): number {
    return (this.page - 1) * this.size;
  }
}

// 목록 응답 공통 형태: { items, page, size, totalCount }
export interface PagedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalCount: number;
}
