import { IsOptional, IsString, MaxLength } from 'class-validator';

// GET /events 쿼리 (API 명세 v4 §5)
export class QueryEventsDto {
  // 검색어: 축제 이름 또는 주소에 포함 (기록 작성 시 축제 고르기)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;
}
