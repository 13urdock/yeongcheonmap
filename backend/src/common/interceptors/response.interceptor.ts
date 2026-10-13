import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

// 컨트롤러가 반환한 순수 데이터를 { success:true, data } 로 감싸는 유일한 곳.
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessEnvelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<SuccessEnvelope<T>> {
    return next.handle().pipe(map((data) => ({ success: true as const, data })));
  }
}
