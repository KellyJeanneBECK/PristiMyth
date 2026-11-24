import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { PasswordHashService } from './services/password-hash.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, PasswordHashService],
  imports: [UsersModule],
  controllers: [AuthController],
})
export class AuthModule {}
