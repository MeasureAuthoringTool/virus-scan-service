import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { HealthCheckConfig } from './health-check.config';
import {
  DEFAULT_HEALTH_PING_URL,
  DEFAULT_HEALTH_DISK_THRESHOLD_PERCENT,
  DEFAULT_HEALTH_DISK_THRESHOLD_PATH,
  DEFAULT_HEALTH_MEMORY_HEAP_THRESHOLD,
  DEFAULT_HEALTH_MEMORY_RSS_THRESHOLD,
} from '../constants';

describe('HealthCheckConfig', () => {
  let appConfigService: HealthCheckConfig;
  let getStub: SinonStub;

  beforeEach(async () => {
    getStub = stub(ConfigService.prototype, 'get');

    const app: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, HealthCheckConfig],
    }).compile();

    appConfigService = app.get<HealthCheckConfig>(HealthCheckConfig);
  });

  afterEach(() => {
    sinonRestore();
  });

  describe('HealthCheckConfig', () => {
    describe('#get pingUrl()', () => {
      it('should return the HEALTH_PING_URL config value', () => {
        getStub.withArgs('HEALTH_PING_URL').returns('http://www.google.com');
        expect(appConfigService.pingUrl).toBe('http://www.google.com');
      });

      it('should return the default HEALTH_PING_URL value when config value not specified', () => {
        getStub.withArgs('HEALTH_PING_URL').returns(undefined);
        expect(appConfigService.pingUrl).toBe(DEFAULT_HEALTH_PING_URL);
      });
    });

    describe('#get diskThresholdPercent()', () => {
      it('should return the HEALTH_DISK_THRESHOLD_PERCENT config value', () => {
        getStub.withArgs('HEALTH_DISK_THRESHOLD_PERCENT').returns(0.83);
        expect(appConfigService.diskThresholdPercent).toBe(0.83);
      });

      it('should return the default HEALTH_DISK_THRESHOLD_PERCENT value when config value not specified', () => {
        getStub.withArgs('HEALTH_DISK_THRESHOLD_PERCENT').returns(undefined);
        expect(appConfigService.diskThresholdPercent).toBe(
          DEFAULT_HEALTH_DISK_THRESHOLD_PERCENT,
        );
      });
    });

    describe('#get diskThresholdPath()', () => {
      it('should return the HEALTH_DISK_THRESHOLD_PATH config value', () => {
        getStub.withArgs('HEALTH_DISK_THRESHOLD_PATH').returns('/tmp/foo');
        expect(appConfigService.diskThresholdPath).toBe('/tmp/foo');
      });

      it('should return the default HEALTH_DISK_THRESHOLD_PATH value when config value not specified', () => {
        getStub.withArgs('HEALTH_DISK_THRESHOLD_PATH').returns(undefined);
        expect(appConfigService.diskThresholdPath).toBe(
          DEFAULT_HEALTH_DISK_THRESHOLD_PATH,
        );
      });
    });

    describe('#get memoryHeapThreshold()', () => {
      it('should return the HEALTH_MEMORY_HEAP_THRESHOLD config value converted from MB to bytes', () => {
        getStub.withArgs('HEALTH_MEMORY_HEAP_THRESHOLD').returns(850);
        expect(appConfigService.memoryHeapThreshold).toBe(850 * 1024 * 1024);
      });

      it('should return the default HEALTH_MEMORY_HEAP_THRESHOLD value (converted to bytes) when config value not specified', () => {
        getStub.withArgs('HEALTH_MEMORY_HEAP_THRESHOLD').returns(undefined);
        expect(appConfigService.memoryHeapThreshold).toBe(
          DEFAULT_HEALTH_MEMORY_HEAP_THRESHOLD * 1024 * 1024,
        );
      });
    });

    describe('#get memoryRssThreshold()', () => {
      it('should return the HEALTH_MEMORY_RSS_THRESHOLD config value converted from MB to bytes', () => {
        getStub.withArgs('HEALTH_MEMORY_RSS_THRESHOLD').returns(850);
        expect(appConfigService.memoryRssThreshold).toBe(850 * 1024 * 1024);
      });

      it('should return the default HEALTH_MEMORY_RSS_THRESHOLD value (converted to bytes) when config value not specified', () => {
        getStub.withArgs('HEALTH_MEMORY_RSS_THRESHOLD').returns(undefined);
        expect(appConfigService.memoryRssThreshold).toBe(
          DEFAULT_HEALTH_MEMORY_RSS_THRESHOLD * 1024 * 1024,
        );
      });
    });
  });
});
