import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { Readable } from 'stream';
import NodeClam from './clamscan';
import { ScanFileService } from './scan-file.service';
import { NodeClamProvider } from '../constants';
import ClamException from './ClamException';
import { ScanFileConfig } from './scan-file.config';
import { ScanResultDto } from './scan-result.dto';
import { stringToStream } from '../../test/utils/stream-utils';

describe('ScanFileService', () => {
  const expectedClamAvVersion = '1.2.3';
  const fileName = 'someFile.txt';
  const expectedInitParams = {
    clamdscan: {
      host: '127.0.0.1',
      port: 3310,
      timeout: 2 * 60 * 1000, // the service converts from seconds to milliseconds
    },
  };
  let fileStream: Readable;
  let service: ScanFileService;
  let initStub: SinonStub;
  let scanStreamStub: SinonStub;
  let getVersionStub: SinonStub;
  let logWarnStub: SinonStub;
  let logErrorStub: SinonStub;

  beforeEach(async () => {
    fileStream = stringToStream('These are the file contents');
    initStub = stub(NodeClam.prototype, 'init');
    initStub.resolves(new NodeClam());
    scanStreamStub = stub(NodeClam.prototype, 'scan_stream');
    scanStreamStub.resolves({
      is_infected: false,
      viruses: [],
    });
    getVersionStub = stub(NodeClam.prototype, 'get_version');
    getVersionStub.resolves(expectedClamAvVersion);

    // Mock logger
    logWarnStub = stub(Logger.prototype, 'warn');
    logErrorStub = stub(Logger.prototype, 'error');
    stub(Logger.prototype, 'log');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        ScanFileConfig,
        ScanFileService,
        Logger,
        {
          provide: NodeClamProvider,
          useClass: NodeClam,
        },
      ],
    }).compile();

    service = module.get<ScanFileService>(ScanFileService);
  });

  afterEach(() => {
    sinonRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#init()', () => {
    it('should initialize the clamscan client successfully', async () => {
      const result = await service.init();
      expect(initStub).toHaveBeenCalledWith(expectedInitParams);
      expect(result).toBe(service);
    });

    it('should handle errors while initializing clamscan', async () => {
      initStub.rejects(new Error('something bad'));
      expect.assertions(2);
      try {
        await service.init();
      } catch (error) {
        expect(error instanceof ClamException).toBeTruthy();
        expect(error.message).toBe('Unable to initialize ClamAV');
      }
    });
  });

  describe('#scanFile()', () => {
    it('should call ScanFileService.init() if not already initialized', async () => {
      expect(await service.scanFile(fileStream, fileName)).toStrictEqual(
        ScanResultDto.parse({
          fileName: 'someFile.txt',
          infected: false,
          viruses: [],
        }),
      );
      expect(initStub).toHaveBeenCalledWith(expectedInitParams);
    });

    it('should throw an error if ClamAV cannot be initialized', async () => {
      initStub.rejects(new Error('something bad'));
      expect.assertions(2);
      try {
        await service.scanFile(fileStream, fileName);
      } catch (error) {
        expect(error instanceof ClamException).toBeTruthy();
        expect(error.message).toBe('Unable to initialize ClamAV');
      }
    });

    it('should return details of a clean file', async () => {
      await service.init();
      expect(await service.scanFile(fileStream, fileName)).toStrictEqual(
        ScanResultDto.parse({
          fileName: 'someFile.txt',
          infected: false,
          viruses: [],
        }),
      );
      expect(logWarnStub).not.toHaveBeenCalled();
      expect(logErrorStub).not.toHaveBeenCalled();
    });

    it('should return details of file infected with one virus', async () => {
      scanStreamStub.resolves({
        is_infected: true,
        viruses: ['bad1'],
      });
      await service.init();
      expect(await service.scanFile(fileStream, fileName)).toStrictEqual(
        ScanResultDto.parse({
          fileName: 'someFile.txt',
          infected: true,
          viruses: ['bad1'],
        }),
      );
      expect(logErrorStub).not.toHaveBeenCalled();
      expect(logWarnStub).toHaveBeenCalledWith(
        'Virus(es) "bad1" detected in file someFile.txt',
      );
    });

    it('should return details of a file infected with multiple viruses', async () => {
      scanStreamStub.resolves({
        is_infected: true,
        viruses: ['bad1', 'bad2'],
      });
      await service.init();
      expect(await service.scanFile(fileStream, fileName)).toStrictEqual(
        ScanResultDto.parse({
          fileName: 'someFile.txt',
          infected: true,
          viruses: ['bad1', 'bad2'],
        }),
      );
      expect(logErrorStub).not.toHaveBeenCalled();
      expect(logWarnStub).toHaveBeenCalledWith(
        'Virus(es) "bad1", "bad2" detected in file someFile.txt',
      );
    });

    it('should handle errors while scanning for viruses', async () => {
      await service.init();
      const expectedError = new Error('Bad stuff happened');
      scanStreamStub.rejects(expectedError);
      expect.assertions(3);
      try {
        await service.scanFile(fileStream, fileName);
      } catch (error) {
        expect(error instanceof ClamException).toBeTruthy();
        expect(error.message).toBe('An error occurred while scanning file');
        expect(logErrorStub).toHaveBeenCalledWith(
          'An error occurred while scanning file',
          expectedError,
        );
      }
    });
  });

  describe('#getVersion()', () => {
    it('should call ScanFileService.init() if not already initialized', async () => {
      await service.getVersion();
      expect(initStub).toHaveBeenCalledWith(expectedInitParams);
    });

    it('should return the ClamAV version using clamscan', async () => {
      await service.init();
      const result: string = await service.getVersion();
      expect(result).toBe(expectedClamAvVersion);
    });

    it('should return the ClamAV version using clamscan', async () => {
      await service.init();
      const result: string = await service.getVersion();
      expect(result).toBe(expectedClamAvVersion);
    });

    it('should handle errors while getting the ClamAV version ', async () => {
      await service.init();
      const expectedError = new Error('Bad stuff happened');
      getVersionStub.rejects(expectedError);
      expect.assertions(3);
      try {
        await service.getVersion();
      } catch (error) {
        const expectedMessage =
          'An error occurred while getting the ClamAV version';
        expect(error instanceof ClamException).toBeTruthy();
        expect(error.message).toBe(expectedMessage);
        expect(logErrorStub).toHaveBeenCalledWith(
          expectedMessage,
          expectedError,
        );
      }
    });
  });
});
