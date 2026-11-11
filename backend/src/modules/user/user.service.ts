import { Injectable } from '@nestjs/common';
import { User } from '../../generated/prisma/client';
import { AppErrorCode } from '../../common/errors/app-error-code';
import { AppException } from '../../common/errors/app.exception';
import { CreateUserData, UserRepository } from './user.repository';
import { isAdminRole } from './user-role';

// 회원 조회·생성 유스케이스. 이메일은 소문자·앞뒤 공백 제거로 맞춰 저장·조회한다.
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(normalizeEmail(email));
  }

  findById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  // 운영진 권한(수집가·운영진 계정)인지. 없는 계정이면 false
  async isAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return isAdminRole(user?.role);
  }

  // 같은 이메일이 있으면 DUPLICATE_EMAIL(409)
  async create(data: CreateUserData): Promise<User> {
    const email = normalizeEmail(data.email);
    if (await this.userRepository.findByEmail(email)) {
      throw new AppException(AppErrorCode.DUPLICATE_EMAIL, '이미 가입된 이메일입니다');
    }
    return this.userRepository.create({ ...data, email, name: data.name.trim() });
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
