import { ScanResultDto } from './scan-result.dto';

describe('ScanResultDto', () => {
  const fileName = 'The Name of the file';
  const viruses = ['virus1', 'virus2'];

  function expectResult(result: ScanResultDto) {
    expect(result.fileName).toBe(fileName);
    expect(result.infected).toBeTrue();
    expect(result.viruses).toBe(viruses);
  }

  describe('constructor', () => {
    it('should set the attributes', () => {
      const result = new ScanResultDto(fileName, true, viruses);
      expectResult(result);
    });
  });

  describe('#parse()', () => {
    it('should construct a new ScanResultDto', () => {
      const result = ScanResultDto.parse({
        fileName,
        viruses,
        infected: true,
      });
      expectResult(result);
    });
  });
});
