import { Injectable } from '@nestjs/common';
import { PasswordHashService } from './password-hash.service';
import { RegisterDto } from '../dto/register.dto';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { type User } from '../../generated/prisma/client';
import { type PublicUser } from '../types/public-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordHashService: PasswordHashService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

  login(user: PublicUser) {
    const payload = { sub: user.id };
    return { accessToken: this.jwtService.sign(payload) };
  }

  async validateUser(identifier: string, password: string) {
    const user = await this.usersService.findByIdentifierForLogin(identifier);
    if (!user) {
      return null;
    }

    const verifiedPassword = await this.passwordHashService.verifyPassword(
      user.passwordHash,
      password,
    );
    if (!verifiedPassword) {
      return null;
    }

    return this.toPublicUser(user);
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      pseudo: user.pseudo,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
