import 'jest-extended';
import { BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { ScanFileController } from './scan-file.controller';
import { ScanFileService } from './scan-file.service';
import stubbedMutlerFile from '../../test/stubs/stubbedMutlerFile';
import { NodeClamProvider, ScanFileServiceProvider } from '../constants';
import NodeClam from './clamscan';
import { ScanResultDto } from './scan-result.dto';
import { ScanFileConfig } from './scan-file.config';

describe('ScanFileController', () => {
  let controller: ScanFileController;
  let scanFileStub: SinonStub;
  let scanResult: ScanResultDto;

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
        ScanFileConfig,
        ConfigService,
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

  it('should throw an error if file is missing', async () => {
    expect.assertions(2);
    try {
      await controller.scanFile(undefined);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('No file specified for virus scanning');
    }
  });

  it('should throw an error if file is empty', async () => {
    expect.assertions(2);
    const fileClone = { ...stubbedMutlerFile };
    fileClone.size = 0;
    try {
      await controller.scanFile(fileClone);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('No file specified for virus scanning');
    }
  });

  it('should return a 200 for a clean file', async () => {
    const result = await controller.scanFile(stubbedMutlerFile);
    expect(result).toBe(scanResult);
    expect(result).toStrictEqual({
      fileName: 'fileName',
      infected: false,
      viruses: [],
    });
  });

  it('should return infected status for an infected file', async () => {
    scanResult.infected = true;
    const result = await controller.scanFile(stubbedMutlerFile);
    expect(result).toBe(scanResult);
    expect(result).toStrictEqual({
      fileName: 'fileName',
      infected: true,
      viruses: [],
    });
  });
});
