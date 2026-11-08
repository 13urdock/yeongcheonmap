import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// POST /auth/login body (API 명세 v4 §3)
export class LoginDto {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않아요' })
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}
