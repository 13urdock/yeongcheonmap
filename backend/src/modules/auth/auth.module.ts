import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionRepository } from './session.repository';
import { TokenIssuer } from './token-issuer.service';

// 인증 리소스. JwtService 는 전역 JwtAuthModule 이 제공(access 키), refresh 키는 TokenIssuer 가 호출마다 지정.
@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, TokenIssuer, SessionRepository],
})
export class AuthModule {}
