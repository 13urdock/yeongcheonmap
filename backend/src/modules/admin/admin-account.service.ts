import { Injectable } from '@nestjs/common';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { ContributorService } from '../contributor/contributor.service';
import { UserService } from '../user/user.service';

export interface AdminMeResponse {
  userId: string;
  email: string;
  name: string;
  role: string;
  contributor: { contributorId: string; nickname: string }; // 이 계정으로 올리면 이 이름으로 집계된다
}

// 관리 웹 첫 화면: 로그인한 운영 계정 정보
@Injectable()
export class AdminAccountService {
  constructor(
    private readonly userService: UserService,
    private readonly contributorService: ContributorService,
  ) {}

  async me(userId: string): Promise<AdminMeResponse> {
    const user = await this.userService.findById(userId);
    if (!user) throw new AppException(AppErrorCode.UNAUTHORIZED, '계정을 찾을 수 없어요. 다시 로그인해 주세요');
    const { contributorId, nickname } = await this.contributorService.resolveForUser(userId);
    return { userId, email: user.email, name: user.name, role: user.role, contributor: { contributorId, nickname } };
  }
}
