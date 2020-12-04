import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError, HealthIndicatorResult } from '@nestjs/terminus';
import { VersionHealthIndicator } from './version.health';
import { VersionNumberService } from './version-number.service';

jest.mock('./version-number.service');

describe('VersionHealthIndicator', () => {
  let healthIndicator: VersionHealthIndicator;
  let mockVersionFunc: jest.Mock<string | null, []>;

  beforeEach(async () => {
    // Create a mocked VersionNumberService
    mockVersionFunc = jest.fn();
    const MockedVersionNumberService = VersionNumberService as jest.Mock<VersionNumberService>;
    MockedVersionNumberService.mockImplementation(() => {
      return {
        getVersion: mockVersionFunc,
      };
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VersionHealthIndicator],
      providers: [MockedVersionNumberService],
    }).compile();

    healthIndicator = module.get<VersionHealthIndicator>(
      VersionHealthIndicator,
    );
  });

  it('should be defined', () => {
    expect(healthIndicator).toBeDefined();
  });

  it('should return a successful result when version is available', async () => {
    const mockedServiceResult = 'Some interesting version number';
    mockVersionFunc.mockReturnValue(mockedServiceResult);
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
    mockVersionFunc.mockReturnValue(null);
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
