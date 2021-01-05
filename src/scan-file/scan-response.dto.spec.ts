import { ScanResponseDto } from './scan-response.dto';
import { ScanResultDto } from './scan-result.dto';

describe('ScanResponseDto', () => {
  let cleanResult1: ScanResultDto;
  let cleanResult2: ScanResultDto;
  let dirtyResult1: ScanResultDto;
  let dirtyResult2: ScanResultDto;

  beforeEach(() => {
    cleanResult1 = new ScanResultDto('cleanFile1');
    cleanResult2 = new ScanResultDto('cleanFile2');
    dirtyResult1 = new ScanResultDto('dirtyFile1', true, ['virus1']);
    dirtyResult2 = new ScanResultDto('dirtyFile2', true, ['virus2']);
  });

  describe('constructor', () => {
    it('should set the scan results', () => {
      const result = new ScanResponseDto(
        cleanResult1,
        cleanResult2,
        dirtyResult1,
        dirtyResult2,
      );
      expect(result.scanResults).toStrictEqual([
        cleanResult1,
        cleanResult2,
        dirtyResult1,
        dirtyResult2,
      ]);
    });
  });

  describe('filesScanned', () => {
    it('should return the number of files in the scanResults array', () => {
      let result = new ScanResponseDto(cleanResult1, cleanResult2);
      expect(result.filesScanned).toBe(2);
      result = new ScanResponseDto();
      expect(result.filesScanned).toBe(0);
      result = new ScanResponseDto(dirtyResult1);
      expect(result.filesScanned).toBe(1);
    });
  });

  describe('infectedFileCount', () => {
    it('should return the number of infected files', () => {
      let result = new ScanResponseDto(cleanResult1, cleanResult2);
      expect(result.infectedFileCount).toBe(0);
      result = new ScanResponseDto();
      expect(result.infectedFileCount).toBe(0);
      result = new ScanResponseDto(dirtyResult1);
      expect(result.infectedFileCount).toBe(1);
      result = new ScanResponseDto(dirtyResult1, cleanResult1, dirtyResult2);
      expect(result.infectedFileCount).toBe(2);
    });
  });

  describe('cleanFileCount', () => {
    it('should return the number of clean files', () => {
      let result = new ScanResponseDto(cleanResult1, cleanResult2);
      expect(result.cleanFileCount).toBe(2);
      result = new ScanResponseDto(dirtyResult1);
      expect(result.cleanFileCount).toBe(0);
      result = new ScanResponseDto(cleanResult2, dirtyResult2);
      expect(result.cleanFileCount).toBe(1);
      result = new ScanResponseDto(dirtyResult1, dirtyResult2);
      expect(result.cleanFileCount).toBe(0);
    });
  });

  describe('#addResult()', () => {
    it('should return a new ScanResultDto instance with the added result', () => {
      const oldResult = new ScanResponseDto(cleanResult1);
      const newResult = oldResult.addResult(dirtyResult1);

      expect(newResult).not.toBe(oldResult);

      expect(oldResult.scanResults).toStrictEqual([cleanResult1]);
      expect(oldResult.filesScanned).toBe(1);
      expect(oldResult.cleanFileCount).toBe(1);
      expect(oldResult.infectedFileCount).toBe(0);

      expect(newResult.scanResults).toStrictEqual([cleanResult1, dirtyResult1]);
      expect(newResult.filesScanned).toBe(2);
      expect(newResult.cleanFileCount).toBe(1);
      expect(newResult.infectedFileCount).toBe(1);
    });
  });
});
