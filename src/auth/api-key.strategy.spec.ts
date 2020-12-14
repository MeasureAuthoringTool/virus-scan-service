import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockRequest } from 'mock-req-res';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { BadRequestError } from 'passport-headerapikey';
import { ApiKeyStrategy } from './api-key.strategy';
import { AppConfigService } from '../config/config.service';
import { DEFAULT_API_KEY } from '../constants';

describe('ApiKeyStrategy', () => {
  let strategy: ApiKeyStrategy;
  let successStub: SinonStub;
  let failStub: SinonStub;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [ApiKeyStrategy, AppConfigService, ConfigService],
    }).compile();

    strategy = app.get<ApiKeyStrategy>(ApiKeyStrategy);
    successStub = stub();
    failStub = stub();
    strategy.success = successStub;
    strategy.fail = failStub;
  });

  afterEach(() => {
    sinonRestore();
  });

  describe('ApiKeyStrategy', () => {
    it('should exist', () => {
      expect(strategy).toBeDefined();
    });

    it('should authenticate successfully when api_key is correct', () => {
      const req = mockRequest({
        headers: {
          apiKey: DEFAULT_API_KEY,
        },
      });
      strategy.authenticate(req);
      expect(successStub).toHaveBeenCalledWith(true, 'Valid API Key');
      expect(failStub).not.toHaveBeenCalled();
    });

    it('should fail authentication when api_key is incorrect', () => {
      const req = mockRequest({
        headers: {
          apiKey: 'totally not valid',
        },
      });
      strategy.authenticate(req);
      expect(successStub).not.toHaveBeenCalled();
      expect(failStub).toHaveBeenCalledTimes(1);
      const failArgs = failStub.getCalls()[0].args;
      expect(failArgs.length).toBe(2);
      expect(failArgs[0]).toBe('Invalid API Key');
      expect(failArgs[1]).toBeNull();
    });

    it('should fail authentication when apiKey is missing', () => {
      const req = mockRequest({
        headers: {},
      });
      strategy.authenticate(req);
      expect(successStub).not.toHaveBeenCalled();
      expect(failStub).toHaveBeenCalledTimes(1);
      const failArgs = failStub.getCalls()[0].args;
      expect(failArgs.length).toBe(2);
      expect(failArgs[0]).toBeInstanceOf(BadRequestError);
      expect(failArgs[0].message).toBe('Missing API Key');
      expect(failArgs[1]).toBeNull();
    });
  });
});
