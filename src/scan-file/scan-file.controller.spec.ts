import 'jest-extended';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { Readable } from 'stream';
import { Request } from 'express';
import { from } from 'rxjs';
import { ScanFileController } from './scan-file.controller';
import { ScanFileService } from './scan-file.service';
import { FileStreamService, FormFile } from './file-stream.service';
import { NodeClamProvider, ScanFileServiceProvider } from '../constants';
import NodeClam from './clamscan';
import { ScanResultDto } from './scan-result.dto';
import { ScanFileConfig } from './scan-file.config';
import { stringToStream } from '../../test/utils/stream-utils';
import { ScanResponseDto } from './scan-response.dto';

interface PartialRequest extends Readable {
  headers?: {
    [headerKey: string]: any;
  };
}

describe('ScanFileController', () => {
  let controller: ScanFileController;
  let scanFileStub: SinonStub;
  let createFileObservableStub: SinonStub;
  let scanResult: ScanResultDto;
  let request: Request;

  beforeEach(async () => {
    // Mock a request object
    const fileStream: PartialRequest = stringToStream('The file contents');
    fileStream.headers = {
      key: 'val',
    };
    request = fileStream as Request;

    scanResult = {
      fileName: 'fileName',
      infected: false,
      viruses: [],
    };
    scanFileStub = stub(ScanFileService.prototype, 'scanFile');
    scanFileStub.resolves(scanResult);

    createFileObservableStub = stub(
      FileStreamService.prototype,
      'createFileObservable',
    );

    const formFile: FormFile = {
      fieldName: 'theField',
      fileName: 'theFileName',
      stream: stringToStream('File contents'),
    };
    createFileObservableStub.returns(from([formFile]));

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
        FileStreamService,
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

  it('should return ScanResponseDto for a clean file', (done) => {
    const result = controller.scanFile(request);

    expect.assertions(3);
    result.subscribe({
      next: (scanResponse: ScanResponseDto) => {
        expect(scanResponse.scanResults.length).toBe(1);
        expect(scanResponse.scanResults[0]).toBe(scanResult);
        expect(scanResponse.scanResults[0]).toStrictEqual({
          fileName: 'fileName',
          infected: false,
          viruses: [],
        });
      },
      complete: () => done(),
    });
  });

  it('should return infected status for an infected file', (done) => {
    scanResult.infected = true;
    const result = controller.scanFile(request);

    expect.assertions(3);
    result.subscribe({
      next: (scanResponse: ScanResponseDto) => {
        expect(scanResponse.scanResults.length).toBe(1);
        expect(scanResponse.scanResults[0]).toBe(scanResult);
        expect(scanResponse.scanResults[0]).toStrictEqual({
          fileName: 'fileName',
          infected: true,
          viruses: [],
        });
      },
      complete: () => done(),
    });
  });
});
