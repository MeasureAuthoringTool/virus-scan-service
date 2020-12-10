import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { AppConfigService } from './config.service';
import { DEFAULT_API_KEY, DEFAULT_PORT } from '../constants';

describe('AppConfigService', () => {
  let appConfigService: AppConfigService;
  let getStub: SinonStub;

  beforeEach(async () => {
    getStub = stub(ConfigService.prototype, 'get');

    const app: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, AppConfigService],
    }).compile();

    appConfigService = app.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    sinonRestore();
  });

  describe('AppConfigService', () => {
    describe('#get port()', () => {
      it('should return the PORT config value', () => {
        getStub.withArgs('PORT').returns(22);
        expect(appConfigService.portNumber).toBe(22);
      });

      it('should return the default PORT value when PORT not specified', () => {
        getStub.withArgs('PORT').returns(undefined);
        expect(appConfigService.portNumber).toBe(DEFAULT_PORT);
      });
    });

    describe('#get apiKey()', () => {
      it('should return the API_KEY config value', () => {
        getStub.withArgs('API_KEY').returns('some key');
        expect(appConfigService.apiKey).toBe('some key');
      });

      it('should return the default API_KEY config value not specified', () => {
        getStub.withArgs('API_KEY').returns(undefined);
        expect(appConfigService.apiKey).toBe(DEFAULT_API_KEY);
      });
    });
  });
});
