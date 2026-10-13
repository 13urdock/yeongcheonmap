import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

// POST /stories body (API 명세 v4 §7)
// 형식 검사만 한다. 앵커(placeId/eventId)·내용(content/photoUrls)·기억 날짜의 "규칙"은 service 에서.
export class CreateStoryDto {
  @IsOptional()
  @IsUUID()
  placeId?: string;

  @IsOptional()
  @IsUUID()
  eventId?: string;

  /** YYYY.MM.DD, 모르는 자리는 X. 형식·가능 여부는 memory-date.resolver 가 판단 */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  memoryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  placeNameThen?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  photoUrls?: string[];
}
