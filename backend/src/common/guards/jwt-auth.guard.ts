import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppErrorCode } from '../errors/app-error-code';
import { AppException } from '../errors/app.exception';

// access 토큰 payload 계약 (auth 모듈이 발급할 때 같은 형태를 써야 함)
export interface AccessTokenPayload {
  sub: string; // userId
}

export interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

// Authorization: Bearer {accessToken} 검증 → request.user 주입
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(req);
    if (!token) {
      throw new AppException(AppErrorCode.UNAUTHORIZED, '인증 토큰이 필요합니다');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      req.user = { userId: payload.sub };
      return true;
    } catch {
      throw new AppException(AppErrorCode.UNAUTHORIZED, '유효하지 않은 토큰입니다');
    }
  }

  private extractBearerToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header) return null;
    const [scheme, token] = header.split(' ');
    return scheme === 'Bearer' && token ? token : null;
  }
}
