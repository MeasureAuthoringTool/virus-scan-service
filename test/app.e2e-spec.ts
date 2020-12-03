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
      .expect('Hello World!');
  });

  it('/status-info (GET)', () => {
    return request(app.getHttpServer())
      .get('/status-info')
      .expect(200)
      .expect(`Virus Scanning Service v${version}`);
  });

  it('/scan-file (POST) clean', () => {
    return request(app.getHttpServer())
      .post('/scan-file')
      .attach('file', 'test/filesToScan/cleanFile.txt')
      .expect(201)
      .expect('No viruses detected in file cleanFile.txt');
  });
});
