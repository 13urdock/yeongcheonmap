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
}
