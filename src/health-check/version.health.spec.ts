import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { VersionHealthIndicator } from './version.health';
import { VersionNumberService } from './version-number.service';

describe('VersionHealthIndicator', () => {
  let healthIndicator: VersionHealthIndicator;
  let getVersionStub: SinonStub;

  beforeEach(async () => {
    getVersionStub = stub(VersionNumberService.prototype, 'getVersion');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VersionHealthIndicator],
      providers: [VersionNumberService],
    }).compile();

    healthIndicator = module.get<VersionHealthIndicator>(
      VersionHealthIndicator,
    );
  });

  afterEach(() => {
    sinonRestore();
  });

  it('should be defined', () => {
    expect(healthIndicator).toBeDefined();
  });

  it('should return a successful result when version is available', async () => {
    const mockedServiceResult = 'Some interesting version number';
    getVersionStub.returns(mockedServiceResult);
    const expectedResult: HealthIndicatorResult = {
      'version-key': {
        status: 'up',
        version: mockedServiceResult,
      },
    };
    expect(await healthIndicator.version('version-key')).toStrictEqual(
      expectedResult,
    );
  });

  it('should return an erroneous result when version is unavailable', async () => {
    getVersionStub.returns(null);
    expect.assertions(2);

    try {
      await healthIndicator.version('version-key');
    } catch (err) {
      expect(err).toBeInstanceOf(HealthCheckError);
      expect(err.causes).toStrictEqual({
        'version-key': {
          status: 'down',
          version: null,
        },
      });
    }
  });
});
