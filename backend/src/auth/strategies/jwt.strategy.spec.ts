import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import type { PublicUser } from '../types/public-user.type';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const findByIdMock = jest.fn();

  const publicUser: PublicUser = {
    id: 'uuid',
    pseudo: 'pseudoriginal',
    email: 'pseudoriginal@example.com',
    role: 'USER',
    createdAt: new Date(),
  };
  const userFromDatabase = { ...publicUser, passwordHash: 'hashed-password' };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => 'test-secret' },
        },
        { provide: UsersService, useValue: { findById: findByIdMock } },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should look up the user with the id found in the token', async () => {
      findByIdMock.mockResolvedValue(userFromDatabase);

      await strategy.validate({ sub: 'uuid' });

      expect(findByIdMock).toHaveBeenCalledWith('uuid');
    });

    it('should return the public user without passwordHash', async () => {
      findByIdMock.mockResolvedValue(userFromDatabase);

      const result = await strategy.validate({ sub: 'uuid' });

      expect(result).toStrictEqual(publicUser);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException when the user no longer exists', async () => {
      findByIdMock.mockResolvedValue(null);

      await expect(strategy.validate({ sub: 'uuid' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it.each([
      { label: 'missing', sub: undefined },
      { label: 'null', sub: null },
      { label: 'a number', sub: 123 },
      { label: 'an object', sub: {} },
    ])(
      'should throw UnauthorizedException without querying the database when sub is $label',
      async ({ sub }) => {
        await expect(strategy.validate({ sub })).rejects.toThrow(
          UnauthorizedException,
        );
        expect(findByIdMock).not.toHaveBeenCalled();
      },
    );
  });
});
