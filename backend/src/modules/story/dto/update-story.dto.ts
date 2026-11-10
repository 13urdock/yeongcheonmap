import { ArrayMaxSize, IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

// PATCH /stories/{storyId} body (API 명세 §7). 보낸 필드만 바꾼다.
// - placeNameThen·content 는 빈 문자열("")이나 null 을 보내면 지운다.
// - photoUrls 를 보내면 사진 목록 전체를 그 순서대로 바꾼다(빈 배열 = 사진 모두 빼기).
// 장소·축제(앵커)는 바꿀 수 없다.
export class UpdateStoryDto {
  /** YYYY.MM.DD, 모르는 자리는 X. 형식·가능 여부는 memory-date.resolver 가 판단 */
  @IsOptional()
  @IsString()
  @MaxLength(10)
  memoryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  placeNameThen?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsUrl({}, { each: true })
  photoUrls?: string[];
}
