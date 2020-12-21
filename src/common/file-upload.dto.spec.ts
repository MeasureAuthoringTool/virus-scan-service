import { FileUploadDto } from './file-upload.dto';

describe('FileUploadDto', () => {
  describe('constructor', () => {
    it('should set the attributes', () => {
      const result = new FileUploadDto('file value');
      expect(result.file).toBe('file value');
    });
  });
});
