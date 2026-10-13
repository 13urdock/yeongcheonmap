import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env.validation';

// 환경변수 로드·검증을 한 곳에서. 다른 모듈은 ConfigService 로만 읽는다.
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: validateEnv,
    }),
  ],
})
export class AppConfigModule {}
