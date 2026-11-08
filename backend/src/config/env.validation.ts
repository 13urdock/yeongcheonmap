import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MinLength, validateSync } from 'class-validator';
import { Transform, Type } from 'class-transformer';

// .env 값의 형태를 기동 시점에 검증. 누락되면 서버가 뜨지 않게 한다.
export class EnvVariables {
  @IsString()
  DATABASE_URL: string;

  @Type(() => Number)
  @IsInt()
  PORT: number = 8080;

  @IsString()
  @MinLength(8)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @MinLength(8)
  JWT_REFRESH_SECRET: string;

  // 수집가 등록(POST /auth/signup) 허용 여부. 전시 기간엔 false(기본) — 수집가 계정 하나로만 기록한다.
  // 문자열 "true" 일 때만 켜진다 (Boolean("false") 가 true 가 되는 함정을 피하려고 원래 값으로 판단)
  @Transform(({ obj }) => obj.SIGNUP_ENABLED === true || obj.SIGNUP_ENABLED === 'true')
  @IsBoolean()
  SIGNUP_ENABLED: boolean = false;

  // (선택) 네이버 검색 '지역' 키 — 영천 장소 검색(GET /places/candidates)·주소 찾기에 쓴다.
  // NAVER API HUB(네이버 클라우드 콘솔 > NAVER API HUB > Application Management > 인증 정보)의 Client ID/Secret.
  // 지도 키(Maps)와는 다른 Application 의 키다. 예전 개발자센터(developers.naver.com) 키는 쓸 수 없다.
  // 없어도 서버는 뜬다: 검색 칸만 PLACE_SEARCH_UNAVAILABLE 로 안내되고, 지도 상표로 기록하기는 주소 없이 된다.
  @IsOptional()
  @IsString()
  NAVER_SEARCH_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  NAVER_SEARCH_CLIENT_SECRET?: string;
}

export function validateEnv(config: Record<string, unknown>): EnvVariables {
  const validated = plainToInstance(EnvVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false, whitelist: false });
  if (errors.length > 0) {
    throw new Error(`환경변수 검증 실패: ${errors.map((e) => e.property).join(', ')}`);
  }
  return validated;
}
