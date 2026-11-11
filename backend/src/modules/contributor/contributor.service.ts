import { Injectable } from '@nestjs/common';
import { Contributor } from '../../generated/prisma/client';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { UserService } from '../user/user.service';
import { ContributorRepository } from './contributor.repository';

// 기록자 찾기 유스케이스 (ERD v6). 기록을 저장할 때 "누가 남겼는가"를 정한다.
// - 지금: 계정의 기록자(수집가·운영진). 없으면 계정 이름을 닉네임으로 만든다.
// - 나중(이벤트): 관람객이 닉네임·전화번호를 남기면 연락처로 기록자를 찾거나 만드는
//   resolveByContact(nickname, phone) 를 여기에 추가하고, StoryWriter.contributorId 로 넘긴다.
@Injectable()
export class ContributorService {
  constructor(
    private readonly contributorRepository: ContributorRepository,
    private readonly userService: UserService,
  ) {}

  async resolveForUser(userId: string): Promise<Contributor> {
    const found = await this.contributorRepository.findByUserId(userId);
    if (found) return found;
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new AppException(AppErrorCode.UNAUTHORIZED, '계정을 찾을 수 없어요. 다시 로그인해 주세요');
    }
    return this.contributorRepository.upsertForUser(userId, user.name);
  }
}
