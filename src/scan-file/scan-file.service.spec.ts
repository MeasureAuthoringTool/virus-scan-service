import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import NodeClam from './clamscan';
import { ScanFileService } from './scan-file.service';
import stubbedMutlerFile from '../../test/stubs/stubbedMutlerFile';
import { NodeClamProvider } from '../constants';
import ClamException from './ClamException';
import { ScanFileConfig } from './scan-file.config';

describe('ScanFileService', () => {
  let service: ScanFileService;
  let initStub: SinonStub;
  let scanStreamStub: SinonStub;
  let logWarnStub: SinonStub;
  let logErrorStub: SinonStub;

  beforeEach(async () => {
    initStub = stub(NodeClam.prototype, 'init');
    initStub.resolves(new NodeClam());
    scanStreamStub = stub(NodeClam.prototype, 'scan_stream');
    scanStreamStub.resolves({
      is_infected: false,
      viruses: [],
    });

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
      expect(initStub).toHaveBeenCalledWith({
        clamdscan: {
          host: '127.0.0.1',
          port: 3310,
          timeout: 5 * 1000,
        },
      });
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
    it('should throw an error if service is not initalized', async () => {
      expect.assertions(2);
      try {
        await service.scanFile(stubbedMutlerFile);
      } catch (error) {
        expect(error instanceof ClamException).toBeTruthy();
        expect(error.message).toBe('ClamAV has not been initialized');
      }
    });

    it('should return details of a clean file', async () => {
      await service.init();
      expect(await service.scanFile(stubbedMutlerFile)).toStrictEqual({
        fileName: 'originalName.txt',
        infected: false,
        viruses: [],
      });
      expect(logWarnStub).not.toHaveBeenCalled();
      expect(logErrorStub).not.toHaveBeenCalled();
    });

    it('should return details of file infected with one virus', async () => {
      scanStreamStub.resolves({
        is_infected: true,
        viruses: ['bad1'],
      });
      await service.init();
      expect(await service.scanFile(stubbedMutlerFile)).toStrictEqual({
        fileName: 'originalName.txt',
        infected: true,
        viruses: ['bad1'],
      });
      expect(logErrorStub).not.toHaveBeenCalled();
      expect(logWarnStub).toHaveBeenCalledWith(
        'Virus(es) "bad1" detected in file originalName.txt',
      );
    });

    it('should return details of a file infected with multiple viruses', async () => {
      scanStreamStub.resolves({
        is_infected: true,
        viruses: ['bad1', 'bad2'],
      });
      await service.init();
      expect(await service.scanFile(stubbedMutlerFile)).toStrictEqual({
        fileName: 'originalName.txt',
        infected: true,
        viruses: ['bad1', 'bad2'],
      });
      expect(logErrorStub).not.toHaveBeenCalled();
      expect(logWarnStub).toHaveBeenCalledWith(
        'Virus(es) "bad1", "bad2" detected in file originalName.txt',
      );
    });

    it('should handle errors while scanning for viruses', async () => {
      await service.init();
      const expectedError = new Error('Bad stuff happened');
      scanStreamStub.rejects(expectedError);
      expect.assertions(3);
      try {
        await service.scanFile(stubbedMutlerFile);
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
});
