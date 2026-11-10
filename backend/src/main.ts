import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

// 부트스트랩: 전역 prefix(/api/v1) 설정 후 기동. 그 외 설정은 app.module 에 둔다.
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Caddy(같은 서버의 docker 네트워크) 뒤에서 실제 접속 IP 를 req.ip 로 받기 위해 (관람객 쓰기 속도 제한)
  app.set('trust proxy', 'loopback, uniquelocal');
  app.setGlobalPrefix('api/v1');
  app.enableCors();

  const port = app.get(ConfigService).get<number>('PORT', 8080);
  await app.listen(port);
  Logger.log(`listening on http://localhost:${port}/api/v1`, 'Bootstrap');
}

void bootstrap();
