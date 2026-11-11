import { AppErrorCode } from '../../common/errors/app-error-code';
import { UserService } from '../user/user.service';
import { ContributorRepository } from './contributor.repository';
import { ContributorService } from './contributor.service';

describe('ContributorService.resolveForUser', () => {
  const userId = '11111111-1111-4111-8111-111111111111';
  const repo = { findByUserId: jest.fn(), upsertForUser: jest.fn() };
  const users = { findById: jest.fn() };
  const service = new ContributorService(repo as unknown as ContributorRepository, users as unknown as UserService);

  beforeEach(() => jest.clearAllMocks());

  it('계정의 기록자가 있으면 그대로', async () => {
    repo.findByUserId.mockResolvedValue({ contributorId: 'c1', nickname: '수집가' });
    await expect(service.resolveForUser(userId)).resolves.toEqual({ contributorId: 'c1', nickname: '수집가' });
    expect(repo.upsertForUser).not.toHaveBeenCalled();
  });

  it('없으면 계정 이름을 닉네임으로 만든다', async () => {
    repo.findByUserId.mockResolvedValue(null);
    users.findById.mockResolvedValue({ userId, name: '운영진' });
    repo.upsertForUser.mockResolvedValue({ contributorId: 'c2', nickname: '운영진' });
    await service.resolveForUser(userId);
    expect(repo.upsertForUser).toHaveBeenCalledWith(userId, '운영진');
  });

  it('계정이 없으면 UNAUTHORIZED', async () => {
    repo.findByUserId.mockResolvedValue(null);
    users.findById.mockResolvedValue(null);
    await expect(service.resolveForUser(userId)).rejects.toEqual(expect.objectContaining({ code: AppErrorCode.UNAUTHORIZED }));
  });
});
