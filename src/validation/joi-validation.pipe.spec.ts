import 'jest-extended';
import { BadRequestException } from '@nestjs/common';
import { JoiValidationPipe } from './joi-validation.pipe';
import validationSchema from '../config/config.validation';

describe('JoiValidationPipe', () => {
  let validationPipe: JoiValidationPipe;

  beforeEach(async () => {
    validationPipe = new JoiValidationPipe(validationSchema);
  });

  it('should be defined', () => {
    expect(validationPipe).toBeDefined();
  });

  describe('#transform()', () => {
    const validInput = {
      PORT: 23,
      CLAMAV_HOST: 'localhost',
      CLAMAV_PORT: 43,
      CLAMAV_TIMEOUT: 234,
      HEALTH_PING_URL: 'https://www.google.com',
      HEALTH_DISK_THRESHOLD_PERCENT: 0.23,
      HEALTH_DISK_THRESHOLD_PATH: '/',
      HEALTH_MEMORY_HEAP_THRESHOLD: 522,
      HEALTH_MEMORY_RSS_THRESHOLD: 1024,
    };

    it('should handle objects conforming to the schema', () => {
      const result = validationPipe.transform(validInput);
      expect(result).toBe(validInput);
    });

    it('should handle objects that does not conform to the schema', () => {
      expect.assertions(2);
      try {
        validationPipe.transform({ bad: 'input' });
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        const error = err as BadRequestException;
        expect(error.message).toBe('"bad" is not allowed');
      }
    });
  });
});
