import { HttpExceptionDto } from './http-exception.dto';

describe('HttpExceptionDto', () => {
  describe('constructor', () => {
    it('should allow all values', () => {
      const result = new HttpExceptionDto(200, 'msg', 'err');
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('msg');
      expect(result.error).toBe('err');
    });

    it('should allow unspecified values', () => {
      const result = new HttpExceptionDto(200);
      expect(result.statusCode).toBe(200);
      expect(result.message).toBeUndefined();
      expect(result.error).toBeUndefined();
    });
  });
});
