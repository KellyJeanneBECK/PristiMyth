import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorator/public.decorator';

@Controller()
export class AppController {
  // HealthCheck Render
  @Public()
  @Get('healthz')
  healthCheck() {
    return { status: 'ok' };
  }
}
