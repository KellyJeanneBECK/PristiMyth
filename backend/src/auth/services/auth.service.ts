import { Injectable } from '@nestjs/common';
import { PasswordHashService } from './password-hash.service';
import { RegisterDto } from '../dto/register.dto';
import { UsersService } from '../../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordHashService: PasswordHashService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await this.passwordHashService.hashPassword(
      dto.password,
    );
    const user = await this.usersService.createUser({
      pseudo: dto.pseudo,
      email: dto.email,
      passwordHash: hashedPassword,
    });

    return user;
  }
}
