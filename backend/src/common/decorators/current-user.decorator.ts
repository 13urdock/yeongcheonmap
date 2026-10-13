import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../guards/jwt-auth.guard';

export interface CurrentUserInfo {
  userId: string;
}

// JwtAuthGuard 가 주입한 사용자 정보를 컨트롤러 파라미터로 꺼내는 데코레이터
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): CurrentUserInfo => {
  const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return req.user;
});
