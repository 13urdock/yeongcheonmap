import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { UserService } from '../user/user.service';
import { AuthResponse, toAuthResponse } from './auth.mapper';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { hashPassword, verifyPassword } from './password-hasher';
import { TokenIssuer } from './token-issuer.service';

// 인증 유스케이스: 가입 · 로그인 · 토큰 갱신(회전)
// 전시 운영: SIGNUP_ENABLED=false(기본)면 가입을 막아, 운영진이 아는 수집가 계정으로 로그인한 전시 기기만 기록할 수 있다.
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenIssuer: TokenIssuer,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    if (!this.config.get<boolean>('SIGNUP_ENABLED', false)) {
      throw new AppException(AppErrorCode.FORBIDDEN, '지금은 수집가 등록을 받지 않아요. 전시 기기에서 기록해 주세요');
    }
    const user = await this.userService.create({
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
      name: dto.name,
    });
    return toAuthResponse(user, await this.tokenIssuer.issue(user.userId));
  }

  // 이메일이 없든 비밀번호가 틀리든 같은 메시지 (어느 쪽인지 알려주지 않는다)
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new AppException(AppErrorCode.UNAUTHORIZED, '이메일 또는 비밀번호가 맞지 않아요');
    }
    return toAuthResponse(user, await this.tokenIssuer.issue(user.userId));
  }

  // 유효한 refresh 토큰이면 그 세션을 버리고 새 한 쌍을 준다
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = await this.tokenIssuer.verifyRefresh(refreshToken);
    const user = payload ? await this.userService.findById(payload.sub) : null;
    if (!payload || !user) {
      throw new AppException(AppErrorCode.UNAUTHORIZED, '로그인이 만료됐어요. 다시 로그인해 주세요');
    }
    await this.tokenIssuer.revoke(payload.sid);
    return toAuthResponse(user, await this.tokenIssuer.issue(user.userId));
  }
}
