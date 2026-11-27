import {
  Controller,
  Body,
  Post,
  Get,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Public } from './decorator/public.decorator';
import { AuthService } from './services/auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { AuthenticatedRequest } from './types/authenticated-request.type';
import type { PublicUser } from './types/public-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.authService.register(dto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  login(@Req() req: AuthenticatedRequest): { accessToken: string } {
    return this.authService.login(req.user);
  }

  @Get('me')
  me(@Req() req: AuthenticatedRequest): PublicUser {
    return req.user;
  }
}
