import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Buffer } from 'buffer';
import { AppModule } from '../src/app.module';
import { version } from '../package.json';

describe('AppController (e2e)', () => {
  const VIRUS_TEXT =
    'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
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
      .set('apikey', '1234567')
      .attach('file', 'test/filesToScan/cleanFile.txt')
      .expect(200)
      .expect({
        scanResults: [
          { fileName: 'cleanFile.txt', infected: false, viruses: [] },
        ],
        filesScanned: 1,
        infectedFileCount: 0,
        cleanFileCount: 1,
      });
  });

  it('/scan-file (POST) with a virus', () => {
    const buffer: Buffer = Buffer.from(VIRUS_TEXT);

    return request(app.getHttpServer())
      .post('/scan-file')
      .set('apikey', '1234567')
      .attach('file', buffer, 'eicar.txt')
      .expect(200)
      .then((response) => {
        const acceptedSignatures = [
          'Eicar-Test-Signature',
          'Win.Test.EICAR_HDB-1',
        ];
        expect(response.body.scanResults).toHaveLength(1);
        expect(response.body.scanResults[0].fileName).toBe('eicar.txt');
        expect(response.body.scanResults[0].infected).toBe(true);
        expect(response.body.scanResults[0].viruses).toHaveLength(1);
        expect(acceptedSignatures).toContain(
          response.body.scanResults[0].viruses[0],
        );
        expect(response.body.filesScanned).toBe(1);
        expect(response.body.infectedFileCount).toBe(1);
        expect(response.body.cleanFileCount).toBe(0);
      });
  });

  it('/scan-file unauthorized', () => {
    return request(app.getHttpServer())
      .post('/scan-file')
      .attach('file', 'test/filesToScan/cleanFile.txt')
      .expect(401)
      .expect({ statusCode: 401, message: 'Unauthorized' });
  });
});
