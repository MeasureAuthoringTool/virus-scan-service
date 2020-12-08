import { Logger, ServiceUnavailableException } from '@nestjs/common';
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

describe('HealthCheckController', () => {
  const versionResult = 'VERSION';
  let expectedDetails: HealthIndicatorResult;
  let expectedResult: HealthCheckResult;
  let controller: HealthCheckController;
  let getVersionStub: SinonStub;

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
    };
    expectedResult = {
      status: 'ok',
      info: { ...expectedDetails },
      error: {},
      details: expectedDetails,
    };

    getVersionStub = stub(VersionNumberService.prototype, 'getVersion').returns(
      versionResult,
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthCheckController],
      providers: [Logger, VersionHealthIndicator, VersionNumberService],
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
