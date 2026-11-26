import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { PasswordHashService } from './password-hash.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '../dto/register.dto';
import { ConflictException } from '@nestjs/common';
import { type PublicUser } from '../types/public-user.type';

describe('AuthService', () => {
  let service: AuthService;
  const createUserMock = jest.fn();
  const findByIdentifierForLoginMock = jest.fn();
  const hashPasswordMock = jest.fn();
  const verifyPasswordMock = jest.fn();
  const signMock = jest.fn();

  const hashedPassword = 'hashed-password';
  const registerDto: RegisterDto = {
    pseudo: 'pseudoriginal',
    email: 'pseudoriginal@example.com',
    password: 'password1234',
  };
  const createdUser = {
    pseudo: 'pseudoriginal',
    email: 'pseudoriginal@example.com',
  };

  const publicUser: PublicUser = {
    id: 'uuid',
    pseudo: 'pseudoriginal',
    email: 'pseudoriginal@example.com',
    role: 'USER',
    createdAt: new Date(),
  };
  const userWithHash = { ...publicUser, passwordHash: hashedPassword };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createUser: createUserMock,
            findByIdentifierForLogin: findByIdentifierForLoginMock,
          },
        },
        {
          provide: PasswordHashService,
          useValue: {
            hashPassword: hashPasswordMock,
            verifyPassword: verifyPasswordMock,
          },
        },
        { provide: JwtService, useValue: { sign: signMock } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    beforeEach(() => {
      hashPasswordMock.mockResolvedValue(hashedPassword);
      createUserMock.mockResolvedValue(createdUser);
    });
    it('should hash the password from the DTO', async () => {
      await service.register(registerDto);
      expect(hashPasswordMock).toHaveBeenCalledWith(registerDto.password);
    });

    it('should create the user with the hashed password, not the plain one', async () => {
      await service.register(registerDto);

      expect(createUserMock).toHaveBeenCalledWith({
        pseudo: 'pseudoriginal',
        email: 'pseudoriginal@example.com',
        passwordHash: hashedPassword,
      });
    });

    it('should return the user created by UsersService', async () => {
      const result = await service.register(registerDto);

      expect(result).toBe(createdUser);
    });

    it('should propagate the ConflictException thrown by createUser', async () => {
      createUserMock.mockRejectedValue(new ConflictException('refused'));

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should not create the user if password hashing fails', async () => {
      hashPasswordMock.mockRejectedValue(new Error('refused'));

      await expect(service.register(registerDto)).rejects.toThrow('refused');
      expect(createUserMock).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should sign a payload containing only the user id', () => {
      signMock.mockReturnValue('signed-token');

      service.login(publicUser);

      expect(signMock).toHaveBeenCalledWith({ sub: publicUser.id });
    });

    it('should return the signed token as accessToken', () => {
      signMock.mockReturnValue('signed-token');

      const result = service.login(publicUser);
      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });

  describe('validateUser', () => {
    it('should return null for an unknown identifier', async () => {
      findByIdentifierForLoginMock.mockResolvedValue(null);

      const result = await service.validateUser('unknown', 'password');

      expect(result).toBeNull();
      expect(verifyPasswordMock).not.toHaveBeenCalled();
    });

    it('should return null if the password fails validation', async () => {
      findByIdentifierForLoginMock.mockResolvedValue(userWithHash);
      verifyPasswordMock.mockResolvedValue(false);

      const result = await service.validateUser(
        'pseudoriginal',
        'wrong-password',
      );

      expect(result).toBeNull();
      expect(verifyPasswordMock).toHaveBeenCalledWith(
        hashedPassword,
        'wrong-password',
      );
    });

    it('should return the user without passwordHash', async () => {
      findByIdentifierForLoginMock.mockResolvedValue(userWithHash);
      verifyPasswordMock.mockResolvedValue(true);

      const result = await service.validateUser('pseudoriginal', 'password');

      expect(result).toStrictEqual(publicUser);
      expect(result).not.toHaveProperty('passwordHash');
    });
  });
});
