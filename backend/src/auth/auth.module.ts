import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { PasswordHashService } from './services/password-hash.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  providers: [AuthService, PasswordHashService, LocalStrategy],
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.getOrThrow<string>('JWT_SECRET');
        const jwtAccessTtl = Number(
          configService.getOrThrow<string>('JWT_ACCESS_TTL_SECONDS'),
        );
        if (!Number.isInteger(jwtAccessTtl) || jwtAccessTtl <= 0) {
          throw new Error('JWT_ACCESS_TTL_SECONDS must be a positive integer');
        }
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: jwtAccessTtl },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
