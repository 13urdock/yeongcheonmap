import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ContributorRepository } from './contributor.repository';
import { ContributorService } from './contributor.service';

// 기록자 리소스 (ERD v6). 지금은 기록 저장 시 기록자 찾기만. 목록·집계는 admin 모듈.
@Module({
  imports: [UserModule],
  providers: [ContributorService, ContributorRepository],
  exports: [ContributorService],
})
export class ContributorModule {}
