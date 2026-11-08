import { IsLatitude, IsLongitude, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// POST /places/resolve body (API 명세 v4.4 §4): 지도 상표·영천 장소 검색에서 고른 곳
export class ResolvePlaceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
