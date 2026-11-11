import { Controller, Get, Query } from '@nestjs/common';
import { AdminOnly } from './admin-only.decorator';
import { AdminStatsService } from './admin-stats.service';
import { AdminPeriodDto } from './dto/admin-period.dto';

// /admin/stats · /admin/contributors 라우팅만 (API 명세 v4.8 §12)
@Controller('admin')
@AdminOnly()
export class AdminStatsController {
  constructor(private readonly statsService: AdminStatsService) {}

  // GET /admin/stats?from=&to=
  @Get('stats')
  stats(@Query() period: AdminPeriodDto) {
    return this.statsService.stats(period);
  }

  // GET /admin/contributors?from=&to= — 사람별 기록 수
  @Get('contributors')
  contributors(@Query() period: AdminPeriodDto) {
    return this.statsService.contributors(period);
  }
}
