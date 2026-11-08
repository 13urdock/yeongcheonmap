import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// GET /places/candidates 쿼리 (API 명세 v4.5 §4). 외부 검색 한도로 한 번에 최대 5곳, 페이지 없음.
export class QueryPlaceCandidatesDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  q: string;

  // 카카오 시절 앱(v4.4)이 보내던 값. 받아만 두고 쓰지 않는다 — 옛 빌드가 400 으로 막히지 않게.
  @IsOptional()
  @IsString()
  page?: string;
}
