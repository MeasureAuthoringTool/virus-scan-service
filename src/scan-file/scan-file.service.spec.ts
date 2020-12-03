import { Test, TestingModule } from '@nestjs/testing';
import { ScanFileService } from './scan-file.service';
import stubbedMutlerFile from '../../test/stubs/stubbedMutlerFile';

describe('ScanFileService', () => {
  let service: ScanFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScanFileService],
    }).compile();

    service = module.get<ScanFileService>(ScanFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the scanned filename in the message', () => {
    expect(service.scanFile(stubbedMutlerFile)).toBe(
      'No viruses detected in file originalName.txt',
    );
  });
});
