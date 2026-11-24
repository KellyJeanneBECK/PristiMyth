import { Test, TestingModule } from '@nestjs/testing';
import { PasswordHashService } from './password-hash.service';

describe('PasswordHashService', () => {
  let service: PasswordHashService;

  const plainPassword = 'password1234';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordHashService],
    }).compile();

    service = module.get<PasswordHashService>(PasswordHashService);
  });

  it('should return a hash different from the plain password', async () => {
    const hashed = await service.hashPassword(plainPassword);
    expect(hashed).not.toBe(plainPassword);
  });

  it('should produce different hashes for the same password', async () => {
    const firstHash = await service.hashPassword(plainPassword);
    const secondHash = await service.hashPassword(plainPassword);

    expect(firstHash).not.toBe(secondHash);
  });

  it('hould produce an argon2id hash', async () => {
    const hashed = await service.hashPassword(plainPassword);
    expect(hashed).toMatch(/^\$argon2id\$/);
  });

  it('should accept the correct password and reject a wrong one', async () => {
    const hashed = await service.hashPassword(plainPassword);
    const otherPassword = 'other-password';

    const verifiedTrue = await service.verifyPassword(hashed, plainPassword);
    const verifiedFalse = await service.verifyPassword(hashed, otherPassword);

    expect(verifiedTrue).toBe(true);
    expect(verifiedFalse).toBe(false);
  });
});
