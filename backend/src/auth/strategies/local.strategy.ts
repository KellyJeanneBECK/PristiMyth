import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { type PublicUser } from '../types/public-user.type';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'identifier' });
  }

  async validate(identifier: unknown, password: unknown): Promise<PublicUser> {
    const unauthorizedMessage = 'Identifiants invalides';

    if (typeof identifier !== 'string' || typeof password !== 'string') {
      throw new UnauthorizedException(unauthorizedMessage);
    }
    const user = await this.authService.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException(unauthorizedMessage);
    }

    return user;
  }
}
