import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { ALLOWED_CONTENT_TYPES, AllowedContentType } from '../upload-key';

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_PHOTOS_PER_REQUEST = 5; // 한 기록 최대 5장과 같은 상한

export class PresignFileDto {
  @IsIn(Object.keys(ALLOWED_CONTENT_TYPES))
  contentType: AllowedContentType;

  @IsInt()
  @Min(1)
  @Max(MAX_PHOTO_BYTES)
  size: number;
}

// POST /uploads/presign body (API 명세 §8)
export class PresignUploadDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_PHOTOS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => PresignFileDto)
  files: PresignFileDto[];
}
