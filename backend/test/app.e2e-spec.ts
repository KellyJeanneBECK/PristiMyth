import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['healthz'] });
    await app.init();
  });

  describe('health check', () => {
    it('/healthz (GET)', () => {
      return request(app.getHttpServer())
        .get('/healthz')
        .expect(200)
        .expect({ status: 'ok' });
    });

    it('/api/healthz (GET)', () => {
      return request(app.getHttpServer()).get('/api/healthz').expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
