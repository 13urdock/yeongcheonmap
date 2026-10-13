import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 전역 모듈: 모든 repository 가 PrismaService 를 import 없이 주입받는다.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
