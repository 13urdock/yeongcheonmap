import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export const ADMIN_PLACE_SORTS = ['count', 'name', 'recent'] as const;
export type AdminPlaceSort = (typeof ADMIN_PLACE_SORTS)[number];

// GET /admin/places 쿼리
export class QueryAdminPlacesDto extends PaginationDto {
  /** 지금 이름·주소 부분 일치 */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;

  /** count=기록 많은 순(기본) · name=이름순 · recent=최근 등록순 */
  @IsOptional()
  @IsIn(ADMIN_PLACE_SORTS)
  sort: AdminPlaceSort = 'count';
}
