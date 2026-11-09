import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { UploadService } from './upload.service';

// /uploads 라우팅만
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // POST /uploads/presign (인증)
  @Post('presign')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  presign(@Body() dto: PresignUploadDto) {
    return this.uploadService.presign(dto.files);
  }
}
