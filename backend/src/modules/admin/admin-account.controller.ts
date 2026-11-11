import { Controller, Get } from '@nestjs/common';
import { CurrentUser, CurrentUserInfo } from '../../common/decorators/current-user.decorator';
import { AdminAccountService } from './admin-account.service';
import { AdminOnly } from './admin-only.decorator';

// /admin/me 라우팅만
@Controller('admin')
@AdminOnly()
export class AdminAccountController {
  constructor(private readonly accountService: AdminAccountService) {}

  // GET /admin/me
  @Get('me')
  me(@CurrentUser() user: CurrentUserInfo) {
    return this.accountService.me(user.userId);
  }
}
