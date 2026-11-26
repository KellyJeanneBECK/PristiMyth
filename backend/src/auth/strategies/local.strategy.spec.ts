import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../services/auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { type PublicUser } from '../types/public-user.type';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  const validateUserMock = jest.fn();

  const publicUser: PublicUser = {
    id: 'uuid',
    pseudo: 'pseudoriginal',
    email: 'pseudoriginal@example.com',
    role: 'USER',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: { validateUser: validateUserMock } },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it.each([
      {
        label: 'identifier is a number',
        identifier: 123,
        password: 'password',
      },
      {
        label: 'identifier is missing',
        identifier: undefined,
        password: 'password',
      },
      {
        label: 'password is a number',
        identifier: 'pseudoriginal',
        password: 123,
      },
      {
        label: 'password is an object',
        identifier: 'pseudoriginal',
        password: {},
      },
    ])(
      'should throw UnauthorizedException when $label',
      async ({ identifier, password }) => {
        await expect(strategy.validate(identifier, password)).rejects.toThrow(
          UnauthorizedException,
        );
        expect(validateUserMock).not.toHaveBeenCalled();
      },
    );

    it('should throw UnauthorizedException for invalid credentials', async () => {
      validateUserMock.mockResolvedValue(null);

      await expect(strategy.validate('unknown', 'password')).rejects.toThrow(
        new UnauthorizedException('Identifiants invalides'),
      );
    });

    it('should return the user when credentials are valid', async () => {
      validateUserMock.mockResolvedValue(publicUser);

      const result = await strategy.validate('pseudoriginal', 'password1234');

      expect(validateUserMock).toHaveBeenCalledWith(
        'pseudoriginal',
        'password1234',
      );
      expect(result).toBe(publicUser);
    });
  });
});
