import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { ScanFileConfig } from './scan-file.config';
import {
  DEFAULT_CLAMAV_HOST,
  DEFAULT_CLAMAV_PORT,
  DEFAULT_CLAMAV_TIMEOUT,
} from '../constants';

describe('ScanFileConfig', () => {
  let appConfigService: ScanFileConfig;
  let getStub: SinonStub;

  beforeEach(async () => {
    getStub = stub(ConfigService.prototype, 'get');

    const app: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, ScanFileConfig],
    }).compile();

    appConfigService = app.get<ScanFileConfig>(ScanFileConfig);
  });

  afterEach(() => {
    sinonRestore();
  });

  describe('ScanFileConfig', () => {
    describe('#get clamAVHost()', () => {
      it('should return the CLAMAV_HOST config value', () => {
        getStub.withArgs('CLAMAV_HOST').returns('localhost');
        expect(appConfigService.clamAVHost).toBe('localhost');
      });

      it('should return the default CLAMAV_HOST value when CLAMAV_HOST not specified', () => {
        getStub.withArgs('CLAMAV_HOST').returns(undefined);
        expect(appConfigService.clamAVHost).toBe(DEFAULT_CLAMAV_HOST);
      });
    });

    describe('#get clamAVPort()', () => {
      it('should return the CLAMAV_PORT config value', () => {
        getStub.withArgs('CLAMAV_PORT').returns(22);
        expect(appConfigService.clamAVPort).toBe(22);
      });

      it('should return the default CLAMAV_PORT value when CLAMAV_PORT not specified', () => {
        getStub.withArgs('CLAMAV_PORT').returns(undefined);
        expect(appConfigService.clamAVPort).toBe(DEFAULT_CLAMAV_PORT);
      });
    });

    describe('#get clamAVTimeout()', () => {
      it('should return the CLAMAV_TIMEOUT config value', () => {
        getStub.withArgs('CLAMAV_TIMEOUT').returns(8000);
        expect(appConfigService.clamAVTimeout).toBe(8000);
      });

      it('should return the default CLAMAV_TIMEOUT value when CLAMAV_TIMEOUT not specified', () => {
        getStub.withArgs('CLAMAV_TIMEOUT').returns(undefined);
        expect(appConfigService.clamAVTimeout).toBe(DEFAULT_CLAMAV_TIMEOUT);
      });
    });
  });
});
