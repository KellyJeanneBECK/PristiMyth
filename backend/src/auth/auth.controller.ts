import {
  Controller,
  Body,
  Post,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-request.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  login(@Req() req: AuthenticatedRequest): { accessToken: string } {
    return this.authService.login(req.user);
  }
}
