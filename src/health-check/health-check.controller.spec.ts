import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckResult,
  HealthIndicatorResult,
  TerminusModule,
} from '@nestjs/terminus';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { HealthCheckController } from './health-check.controller';
import { VersionHealthIndicator } from './version.health';
import { VersionNumberService } from './version-number.service';
import { HealthCheckConfig } from './health-check.config';
import { ClamAvHealth } from './clam-av.health';
import { GlobalModule } from '../global.module';
import { ScanFileModule } from '../scan-file/scan-file.module';
import { ScanFileService } from '../scan-file/scan-file.service';

describe('HealthCheckController', () => {
  const versionResult = 'VERSION';
  const expectedClamVersion = 'ClamAV 0.102.4/26039/Tue Jan  5 12:41:59 2021';
  let expectedDetails: HealthIndicatorResult;
  let expectedResult: HealthCheckResult;
  let controller: HealthCheckController;
  let getVersionStub: SinonStub;
  let getClamVersionStub: SinonStub;

  beforeEach(async () => {
    // Build up the expected response object the service will return
    expectedDetails = {
      'app-version': {
        status: 'up',
        version: versionResult,
      },
      'clam-av-dns': {
        status: 'up',
      },
      'disk-storage': {
        status: 'up',
      },
      'memory-heap': {
        status: 'up',
      },
      'memory-rss': {
        status: 'up',
      },
      'clamav-version': {
        status: 'up',
        clamAvVersion: '0.102.4',
        signatureVersion: '26039',
        signatureTimestamp: new Date(2021, 0, 5, 12, 41, 59),
      },
    };
    expectedResult = {
      status: 'ok',
      info: { ...expectedDetails },
      error: {},
      details: expectedDetails,
    };

    stub(ScanFileService.prototype, 'init').callsFake(function (
      this: Promise<ScanFileService>,
    ) {
      return this;
    });
    getVersionStub = stub(VersionNumberService.prototype, 'getVersion').returns(
      versionResult,
    );

    getClamVersionStub = stub(ScanFileService.prototype, 'getVersion');
    getClamVersionStub.resolves(expectedClamVersion);

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, GlobalModule, ScanFileModule],
      controllers: [HealthCheckController],
      providers: [
        Logger,
        VersionHealthIndicator,
        VersionNumberService,
        HealthCheckConfig,
        ConfigService,
        ClamAvHealth,
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
  });

  afterEach(() => {
    sinonRestore();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the health check results when successful', async () => {
    expect(await controller.checkHealth()).toStrictEqual(expectedResult);
  });

  it('should return an erroneous result a health check fails', async () => {
    // Mock out logger (so we don't clutter up the logs with expected errors)
    stub(Logger.prototype, 'error');

    getVersionStub.returns(null);

    expectedResult.status = 'error';
    if (expectedResult.info) {
      delete expectedResult.info['app-version'];
    }
    expectedResult.error = {
      'app-version': {
        status: 'down',
        version: null,
      },
    };
    expectedResult.details['app-version'].status = 'down';
    expectedResult.details['app-version'].version = null;

    expect.assertions(2);

    try {
      await controller.checkHealth();
    } catch (err) {
      expect(err).toBeInstanceOf(ServiceUnavailableException);
      const error = err as ServiceUnavailableException;
      expect(error.getResponse()).toStrictEqual(expectedResult);
    }
  });
});
