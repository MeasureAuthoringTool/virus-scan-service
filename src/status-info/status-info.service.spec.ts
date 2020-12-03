import { Test, TestingModule } from '@nestjs/testing';
import { StatusInfoService } from './status-info.service';
import { version } from '../../package.json';

describe('StatusInfoService', () => {
  let service: StatusInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusInfoService],
    }).compile();

    service = module.get<StatusInfoService>(StatusInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the version number in the status message', () => {
    expect(service.status()).toBe(`Virus Scanning Service v${version}`);
  });
});
