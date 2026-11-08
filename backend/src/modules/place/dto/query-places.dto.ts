import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

// GET /places 쿼리 (API 명세 v4 §4)
export class QueryPlacesDto extends PaginationDto {
  // "minLng,minLat,maxLng,maxLat" — 숫자 4개 형식만 여기서 검사, 범위 검사는 parseBbox
  @IsOptional()
  @Matches(/^\s*-?\d+(\.\d+)?(\s*,\s*-?\d+(\.\d+)?){3}\s*$/, { message: 'bbox 형식: minLng,minLat,maxLng,maxLat' })
  bbox?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  usageType?: string;

  // 검색어: 지금 이름 또는 주소에 포함 (기록 작성 시 장소 고르기)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;
}
