import { Test, TestingModule } from '@nestjs/testing';
import { ScanFileController } from './scan-file.controller';
import { ScanFileService } from './scan-file.service';
import stubbedMutlerFile from '../../test/stubs/stubbedMutlerFile';

jest.mock('./scan-file.service');

describe('ScanFileController', () => {
  const mockedScanResult = 'Some virus scanning result from the service';
  let controller: ScanFileController;
  let mockScanFileFunc: () => string;

  beforeEach(async () => {
    mockScanFileFunc = jest.fn().mockReturnValue(mockedScanResult);
    const MockedScanFileService = ScanFileService as jest.Mock<ScanFileService>;
    MockedScanFileService.mockImplementation(() => {
      return {
        scanFile: mockScanFileFunc,
      };
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanFileController],
      providers: [MockedScanFileService],
    }).compile();

    controller = module.get<ScanFileController>(ScanFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the value from the ScanFileService', () => {
    expect(controller.scanFile(stubbedMutlerFile)).toBe(mockedScanResult);
  });
});
