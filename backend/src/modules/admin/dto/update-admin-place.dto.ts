import { IsInt, IsLatitude, IsLongitude, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

// PATCH /admin/places/{placeId} body — 보낸 필드만 바꾼다. 이름 외의 글 필드는 null 이면 지운다.
export class UpdateAdminPlaceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(100)
  usageType?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  intro?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  @Min(1800)
  @Max(2100)
  sinceYear?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsUrl()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
