import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { version } from '../package.json';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(`Virus Scanning Service v${version}`);
  });

  it('/health-check (GET)', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .then((response) => {
        expect(response.body.status).toBe('ok');
      });
  });

  it('/scan-file (POST) clean', () => {
    return request(app.getHttpServer())
      .post('/scan-file')
      .set('apiKey', '1234567')
      .attach('file', 'test/filesToScan/cleanFile.txt')
      .expect(200)
      .expect({ fileName: 'cleanFile.txt', infected: false, viruses: [] });
  });

  it('/scan-file unauthorized', () => {
    return request(app.getHttpServer())
      .post('/scan-file')
      .attach('file', 'test/filesToScan/cleanFile.txt')
      .expect(401)
      .expect({ statusCode: 401, message: 'Unauthorized' });
  });
});
