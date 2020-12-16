import { Test, TestingModule } from '@nestjs/testing';
import { VersionNumberService } from './version-number.service';
import { version } from '../../package.json';

describe('VersionNumberService', () => {
  let service: VersionNumberService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VersionNumberService],
    }).compile();

    service = module.get<VersionNumberService>(VersionNumberService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the version number in the response message', () => {
    expect(service.getVersion()).toBe(version);
  });
});
