import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../../users/users.service';
import { PasswordHashService } from './password-hash.service';
import { RegisterDto } from '../dto/register.dto';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  const createUserMock = jest.fn();
  const hashPasswordMock = jest.fn();

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

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { createUser: createUserMock } },
        {
          provide: PasswordHashService,
          useValue: { hashPassword: hashPasswordMock },
        },
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
});
