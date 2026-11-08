import { IsJWT } from 'class-validator';

// POST /auth/refresh body (API 명세 v4 §3)
export class RefreshDto {
  @IsJWT()
  refreshToken: string;
}
