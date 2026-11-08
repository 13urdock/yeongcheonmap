import { User } from '../../generated/prisma/client';
import { TokenPair } from './token-issuer.service';

// POST /auth/signup · /auth/login · /auth/refresh 공통 응답 (API 명세 v4 §3)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: { userId: string; email: string; name: string };
}

export function toAuthResponse(user: User, tokens: TokenPair): AuthResponse {
  return { ...tokens, user: { userId: user.userId, email: user.email, name: user.name } };
}
