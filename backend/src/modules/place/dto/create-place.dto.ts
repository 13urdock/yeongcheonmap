import { IsInt, IsLatitude, IsLongitude, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';

// POST /places body (API 명세 v4 §4)
export class CreatePlaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  usageType?: string;

  @IsOptional()
  @IsString()
  intro?: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(2100)
  sinceYear?: number;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  thumbnailUrl?: string;
}
