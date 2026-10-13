import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppErrorCode } from '../errors/app-error-code';
import { AppException } from '../errors/app.exception';

// 모든 예외를 실패 envelope { success:false, error:{ code, message } } 로 변환하는 유일한 곳.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const { status, code, message } = this.translate(exception);

    if (status >= 500) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    res.status(status).json({ success: false, error: { code, message } });
  }

  private translate(exception: unknown): { status: number; code: string; message: string } {
    if (exception instanceof AppException) {
      return { status: exception.getStatus(), code: exception.code, message: exception.message };
    }

    if (exception instanceof HttpException) {
      return this.translateHttpException(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: AppErrorCode.INTERNAL_ERROR,
      message: '서버 내부 오류',
    };
  }

  // Nest 기본 예외(ValidationPipe 400, 404 라우트 없음 등)를 명세 코드로 대응
  private translateHttpException(exception: HttpException) {
    const status = exception.getStatus();
    const body = exception.getResponse();
    const rawMessage = typeof body === 'string' ? body : (body as { message?: unknown }).message;
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage ?? exception.message);

    const code =
      status === HttpStatus.BAD_REQUEST
        ? AppErrorCode.INVALID_PARAMETER
        : status === HttpStatus.UNAUTHORIZED
          ? AppErrorCode.UNAUTHORIZED
          : status === HttpStatus.FORBIDDEN
            ? AppErrorCode.FORBIDDEN
            : status >= 500
              ? AppErrorCode.INTERNAL_ERROR
              : `HTTP_${status}`;

    return { status, code, message };
  }
}
