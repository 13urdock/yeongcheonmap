import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

// 회원 리소스. 지금은 auth 모듈이 쓰는 조회·생성만 (GET /users/me 등은 다음 단계)
@Module({
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
