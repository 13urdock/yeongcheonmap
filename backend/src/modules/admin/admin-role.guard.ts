import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { AuthenticatedRequest } from '../../common/guards/jwt-auth.guard';
import { UserService } from '../user/user.service';

// 운영진(admin) 계정만 통과. JwtAuthGuard 다음에 붙인다(@AdminOnly 가 순서를 보장).
// 역할은 토큰이 아니라 DB 에서 매번 확인한다 → 역할을 바꾸면 바로 반영된다.
@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!(await this.userService.isAdmin(req.user.userId))) {
      throw new AppException(AppErrorCode.FORBIDDEN, '운영진 계정만 쓸 수 있어요');
    }
    return true;
  }
}
