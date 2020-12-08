import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { mockResponse } from 'mock-req-res';
import { ScanFileController } from './scan-file.controller';
import { ScanFileService } from './scan-file.service';
import stubbedMutlerFile from '../../test/stubs/stubbedMutlerFile';
import { NodeClamProvider, ScanFileServiceProvider } from '../constants';
import NodeClam from './clamscan';
import { ScanResult } from './scan-file.types';

describe('ScanFileController', () => {
  let controller: ScanFileController;
  let scanFileStub: SinonStub;
  let scanResult: ScanResult;

  beforeEach(async () => {
    scanResult = {
      fileName: 'fileName',
      infected: false,
      viruses: [],
    };
    scanFileStub = stub(ScanFileService.prototype, 'scanFile');
    scanFileStub.resolves(scanResult);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanFileController],
      providers: [
        {
          provide: ScanFileServiceProvider,
          useClass: ScanFileService,
        },
        {
          provide: NodeClamProvider,
          useClass: NodeClam,
        },
        Logger,
      ],
    }).compile();

    controller = module.get<ScanFileController>(ScanFileController);
  });

  afterEach(() => {
    sinonRestore();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a 200 for a clean file', async () => {
    const response = mockResponse();
    expect(await controller.scanFile(stubbedMutlerFile, response)).toBe(
      scanResult,
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      fileName: 'fileName',
      infected: false,
      viruses: [],
    });
  });

  it('should return a 400 for an infected file', async () => {
    scanResult.infected = true;
    const response = mockResponse();
    expect(await controller.scanFile(stubbedMutlerFile, response)).toBe(
      scanResult,
    );
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      fileName: 'fileName',
      infected: true,
      viruses: [],
    });
  });
});
