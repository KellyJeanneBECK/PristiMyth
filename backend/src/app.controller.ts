import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // HealthCheck Render
  @Get('healthz')
  healthCheck() {
    return { status: 'ok' };
  }
}
