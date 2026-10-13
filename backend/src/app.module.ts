import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthModule } from './common/guards/jwt-auth.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { EventModule } from './modules/event/event.module';
import { PlaceModule } from './modules/place/place.module';
import { StoryModule } from './modules/story/story.module';

// 루트 모듈: 인프라(config/prisma/jwt) + 전역 파이프·필터·인터셉터 + 리소스 모듈 등록
@Module({
  imports: [AppConfigModule, PrismaModule, JwtAuthModule, PlaceModule, EventModule, StoryModule],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true, // DTO 인스턴스로 변환(@Type, 기본값 적용)
        whitelist: true, // DTO에 없는 필드 제거
        forbidNonWhitelisted: true, // DTO에 없는 필드가 오면 400 (명세 밖 필드 차단)
      }),
    },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
