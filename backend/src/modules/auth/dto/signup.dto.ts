import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// POST /auth/signup body (API 명세 v4 §3). name = 앱에 보이는 수집가 이름
export class SignupDto {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않아요' })
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 해요' })
  @MaxLength(72)
  password: string;

  @IsString()
  @MinLength(1, { message: '수집가 이름을 적어 주세요' })
  @MaxLength(50)
  name: string;
}
