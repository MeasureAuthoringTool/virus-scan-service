import 'jest-extended';
import * as Joi from 'joi';
import validationSchema from './config.validation';

describe('environment config validation schema', () => {
  function expectValidObject(object: any): void {
    Joi.assert(object, validationSchema, {
      allowUnknown: true,
      abortEarly: false,
    });
  }

  function expectInvalidObject(object: any): void {
    try {
      Joi.assert(object, validationSchema, {
        allowUnknown: true,
        abortEarly: false,
      });
      fail('Exception not caught');
    } catch (error) {
      expect(error.message).not.toBe('Exception not caught');
      expect(error).toBeInstanceOf(Joi.ValidationError);
      expect(error.details).toBeArrayOfSize(1);
    }
  }

  it('should allow missing configuration values', () => {
    expectValidObject({});
  });

  it('should allow extra, unexpected configuration values', () => {
    expectValidObject({ somethingUniqueXX: 'true' });
  });

  it('should enforce PORT port type validation', () => {
    expectInvalidObject({ PORT: 'notAPort' });
    expectInvalidObject({ PORT: -10 });
    expectValidObject({ PORT: 3000 });
  });

  it('should enforce CLAMAV_HOST validation', () => {
    expectInvalidObject({ CLAMAV_HOST: -10 });
    expectValidObject({ CLAMAV_HOST: 'localhost' });
    expectValidObject({ CLAMAV_HOST: '127.0.0.1' });
  });

  it('should enforce CLAMAV_PORT port type validation', () => {
    expectInvalidObject({ CLAMAV_PORT: 'notAPort' });
    expectInvalidObject({ CLAMAV_PORT: -10 });
    expectValidObject({ CLAMAV_PORT: 3000 });
  });

  it('should enforce CLAMAV_TIMEOUT validation', () => {
    expectInvalidObject({ CLAMAV_TIMEOUT: 'notANumber' });
    expectInvalidObject({ CLAMAV_TIMEOUT: -10 });
    expectInvalidObject({ CLAMAV_TIMEOUT: 3.52 });
    expectValidObject({ CLAMAV_TIMEOUT: 5000 });
  });

  it('should enforce HEALTH_PING_URL validation', () => {
    expectInvalidObject({ HEALTH_PING_URL: 'not a URL' });
    expectInvalidObject({ HEALTH_PING_URL: 500 });
    expectValidObject({ HEALTH_PING_URL: 'https://www.google.com' });
  });

  it('should enforce HEALTH_DISK_THRESHOLD_PERCENT validation', () => {
    expectInvalidObject({ HEALTH_DISK_THRESHOLD_PERCENT: 'not a percent' });
    expectInvalidObject({ HEALTH_DISK_THRESHOLD_PERCENT: 50 });
    expectInvalidObject({ HEALTH_DISK_THRESHOLD_PERCENT: -1 });
    expectInvalidObject({ HEALTH_DISK_THRESHOLD_PERCENT: 1 });
    expectInvalidObject({ HEALTH_DISK_THRESHOLD_PERCENT: 0 });
    expectValidObject({ HEALTH_DISK_THRESHOLD_PERCENT: 0.76 });
  });

  it('should enforce HEALTH_DISK_THRESHOLD_PATH validation', () => {
    expectInvalidObject({ HEALTH_DISK_THRESHOLD_PATH: 2 });
    expectValidObject({ HEALTH_DISK_THRESHOLD_PATH: '/somePath' });
  });

  it('should enforce HEALTH_MEMORY_HEAP_THRESHOLD validation', () => {
    expectInvalidObject({ HEALTH_MEMORY_HEAP_THRESHOLD: 'string' });
    expectInvalidObject({ HEALTH_MEMORY_HEAP_THRESHOLD: 0 });
    expectInvalidObject({ HEALTH_MEMORY_HEAP_THRESHOLD: -1 });
    expectInvalidObject({ HEALTH_MEMORY_HEAP_THRESHOLD: 2.5 });
    expectValidObject({ HEALTH_MEMORY_HEAP_THRESHOLD: 3000 });
  });

  it('should enforce HEALTH_MEMORY_RSS_THRESHOLD validation', () => {
    expectInvalidObject({ HEALTH_MEMORY_RSS_THRESHOLD: 'string' });
    expectInvalidObject({ HEALTH_MEMORY_RSS_THRESHOLD: 0 });
    expectInvalidObject({ HEALTH_MEMORY_RSS_THRESHOLD: -1 });
    expectInvalidObject({ HEALTH_MEMORY_RSS_THRESHOLD: 2.5 });
    expectValidObject({ HEALTH_MEMORY_RSS_THRESHOLD: 3000 });
  });
});
