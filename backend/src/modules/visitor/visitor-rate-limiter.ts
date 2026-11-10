import { Injectable } from '@nestjs/common';
import { VISITOR_RATE_LIMIT, VISITOR_RATE_WINDOW_MS } from './visitor.constants';

// IP 별 고정 창 카운터(메모리). 서버 한 대 전시용이라 재시작하면 초기화돼도 괜찮다.
@Injectable()
export class VisitorRateLimiter {
  private readonly windows = new Map<string, { startedAt: number; count: number }>();

  constructor(
    private readonly limit: number = VISITOR_RATE_LIMIT,
    private readonly windowMs: number = VISITOR_RATE_WINDOW_MS,
  ) {}

  /** 이번 요청을 세고, 한도 안이면 true */
  tryConsume(key: string, now: number = Date.now()): boolean {
    this.sweep(now);
    const current = this.windows.get(key);
    if (!current || now - current.startedAt >= this.windowMs) {
      this.windows.set(key, { startedAt: now, count: 1 });
      return true;
    }
    if (current.count >= this.limit) return false;
    current.count += 1;
    return true;
  }

  // 끝난 창은 버려서 메모리가 쌓이지 않게
  private sweep(now: number): void {
    if (this.windows.size < 1000) return;
    for (const [key, w] of this.windows) {
      if (now - w.startedAt >= this.windowMs) this.windows.delete(key);
    }
  }
}
