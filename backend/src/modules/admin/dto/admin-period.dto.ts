import { IsOptional, Matches } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// 기간 필터 ?from=YYYY-MM-DD&to=YYYY-MM-DD (서울 날짜, 등록일 기준, 양끝 포함)
export class AdminPeriodDto {
  @IsOptional()
  @Matches(DATE, { message: 'from 형식: YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(DATE, { message: 'to 형식: YYYY-MM-DD' })
  to?: string;
}

// 기간 + 페이지
export class AdminPagedPeriodDto extends PaginationDto {
  @IsOptional()
  @Matches(DATE, { message: 'from 형식: YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(DATE, { message: 'to 형식: YYYY-MM-DD' })
  to?: string;
}
