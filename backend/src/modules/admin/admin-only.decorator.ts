import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminRoleGuard } from './admin-role.guard';

// /admin/* 컨트롤러에 붙이는 한 줄: 로그인(JWT) → 운영진 역할 순서로 확인
export const AdminOnly = () => applyDecorators(UseGuards(JwtAuthGuard, AdminRoleGuard));
