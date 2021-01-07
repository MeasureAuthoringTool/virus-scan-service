import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { ClamAvHealth } from './clam-av.health';
import { ScanFileService } from '../scan-file/scan-file.service';
import { ScanFileModule } from '../scan-file/scan-file.module';
import { GlobalModule } from '../global.module';

describe('ClamAvHealth', () => {
  const expectedRawVersion = 'ClamAV 0.102.4/26039/Tue Jan  5 12:41:59 2021';
  const expectedClamVersion = '0.102.4';
  const expectedSignatureVersion = '26039';
  const expectedSignatureDate = new Date(2021, 0, 5, 12, 41, 59);
  const key = 'clamav-key';
  let clamAvHealth: ClamAvHealth;
  let getVersionStub: SinonStub;
  let logErrorStub: SinonStub;
  let expectedResult: HealthIndicatorResult;

  beforeEach(async () => {
    expectedResult = {
      [key]: {
        status: 'up',
        clamAvVersion: expectedClamVersion,
        signatureVersion: expectedSignatureVersion,
        signatureTimestamp: expectedSignatureDate,
      },
    };

    logErrorStub = stub(Logger.prototype, 'error');

    stub(ScanFileService.prototype, 'init').callsFake(function (
      this: Promise<ScanFileService>,
    ) {
      return this;
    });
    getVersionStub = stub(ScanFileService.prototype, 'getVersion').resolves(
      expectedRawVersion,
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [GlobalModule, ScanFileModule],
      controllers: [],
      providers: [ClamAvHealth],
    }).compile();

    clamAvHealth = module.get<ClamAvHealth>(ClamAvHealth);
  });

  afterEach(() => {
    sinonRestore();
  });

  it('should be defined', () => {
    expect(clamAvHealth).toBeDefined();
  });

  it('should return a successful result when the ClamAV version is available', async () => {
    expect(await clamAvHealth.clamVersion(key)).toStrictEqual(expectedResult);
  });

  it('should return an unhealthy result when the ClamAV version is empty for some reason', async () => {
    getVersionStub.resolves('');
    expect.assertions(4);

    try {
      await clamAvHealth.clamVersion(key);
    } catch (err) {
      const message = 'Empty version information returned by ClamAV';
      expect(err).toBeInstanceOf(HealthCheckError);
      expect(err.message).toBe(message);
      expect(err.causes).toBe('');
      expect(logErrorStub).toHaveBeenCalledWith(message);
    }
  });

  it('should return an unhealthy result when the ClamAV version is malformed', async () => {
    getVersionStub.resolves('this is not formatted correctly');
    expect.assertions(4);

    try {
      await clamAvHealth.clamVersion(key);
    } catch (err) {
      const message = 'Malformed version information returned by ClamAV';
      expect(err).toBeInstanceOf(HealthCheckError);
      expect(err.message).toBe(message);
      expect(err.causes).toBe('this is not formatted correctly');
      expect(logErrorStub).toHaveBeenCalledWith(message);
    }
  });

  it('should return an unhealthy result when the ClamAV throws an error', async () => {
    const err = new Error('ClamAV is angry!');
    getVersionStub.rejects(err);
    expect.assertions(4);

    try {
      await clamAvHealth.clamVersion(key);
    } catch (err) {
      expect(err).toBeInstanceOf(HealthCheckError);
      expect(err.causes).toBeInstanceOf(Error);
      const cause: Error = err.causes;
      expect(cause.message).toBe('ClamAV is angry!');
      expect(logErrorStub).toHaveBeenCalled();
    }
  });

  describe('#parseVersionInfo()', () => {
    it('should parse the version info successfully', () => {
      const result = ClamAvHealth.parseVersionInfo(expectedRawVersion);
      expect(result).not.toBeNull();
      expect(result?.clamAvVersion).toBe('0.102.4');
      expect(result?.signatureVersion).toBe('26039');
      expect(result?.signatureTimestamp).toStrictEqual(
        new Date(2021, 0, 5, 12, 41, 59),
      );
    });
  });
});
