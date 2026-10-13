import { HttpException } from '@nestjs/common';
import { APP_ERROR_STATUS, AppErrorCode } from './app-error-code';

// service 계층이 던지는 도메인 예외. 코드만 넘기면 상태코드는 매핑표에서 결정된다.
// 응답 envelope 변환은 http-exception.filter 가 담당(여기서 HTTP 응답을 만들지 않음).
export class AppException extends HttpException {
  constructor(
    readonly code: AppErrorCode,
    message: string,
  ) {
    super({ code, message }, APP_ERROR_STATUS[code]);
  }
}
