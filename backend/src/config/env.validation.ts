import { plainToInstance } from 'class-transformer';
import { IsInt, IsString, MinLength, validateSync } from 'class-validator';
import { Type } from 'class-transformer';

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
}

export function validateEnv(config: Record<string, unknown>): EnvVariables {
  const validated = plainToInstance(EnvVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false, whitelist: false });
  if (errors.length > 0) {
    throw new Error(`환경변수 검증 실패: ${errors.map((e) => e.property).join(', ')}`);
  }
  return validated;
}
