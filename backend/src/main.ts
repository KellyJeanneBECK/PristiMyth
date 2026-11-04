import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.useSecurityHeaders();
  app.setGlobalPrefix('api', { exclude: ['healthz'] }); // healthz => HealthCheck Render
  app.enableCors({
    origin: configService.getOrThrow<string>('FRONT_URL'),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });
  app.enableCsrfProtection({
    trustedOrigins: [configService.getOrThrow<string>('FRONT_URL')],
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
