import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    register: jest.fn(),
  };

  const registerDto: RegisterDto = {
    pseudo: 'pseudoriginal',
    password: 'password1234',
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should pass the DTO to AuthService.register and return nothing', async () => {
      authService.register.mockResolvedValue(registerDto);
      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBeUndefined();
    });

    it('should propagate the error thrown by AuthService.register', async () => {
      authService.register.mockRejectedValue(new ConflictException('refused'));
      await expect(controller.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
