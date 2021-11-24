import { Logger, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { restore as sinonRestore, stub, SinonStub } from 'sinon';
import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import { Observable } from 'rxjs';
import { count } from 'rxjs/operators';
import { FileStreamService, FormFile } from './file-stream.service';
import { ScanFileConfig } from './scan-file.config';
import { streamToString } from '../../test/utils/stream-utils';
import { PostDataBuilder } from '../../test/utils/post-data-builder';
import { DEFAULT_MAX_FILE_SIZE } from '../constants';

describe('FileStreamService', () => {
  let service: FileStreamService;
  let logDebugStub: SinonStub;
  let logWarnStub: SinonStub;
  let logErrorStub: SinonStub;
  let maxFileSizeStub: SinonStub;
  let postDataBuilder: PostDataBuilder;

  beforeEach(async () => {
    postDataBuilder = new PostDataBuilder();

    // Mock logger
    logDebugStub = stub(Logger.prototype, 'debug');
    logWarnStub = stub(Logger.prototype, 'warn');
    logErrorStub = stub(Logger.prototype, 'error');
    stub(Logger.prototype, 'log');

    // Mock max file size configuration
    maxFileSizeStub = stub(ConfigService.prototype, 'get');
    maxFileSizeStub.withArgs('MAX_FILE_SIZE').returns(DEFAULT_MAX_FILE_SIZE);

    const module: TestingModule = await Test.createTestingModule({
      providers: [FileStreamService, ConfigService, ScanFileConfig, Logger],
    }).compile();

    service = module.get<FileStreamService>(FileStreamService);
  });

  afterEach(() => {
    sinonRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#createFileObservable()', () => {
    const headers: IncomingHttpHeaders = {
      'content-type': 'multipart/form-data; boundary=XXX',
      apikey: '1234567',
      'user-agent': 'PostmanRuntime/7.26.8',
      accept: '*/*',
      'cache-control': 'no-cache',
      'postman-token': 'd65e2c32-364e-4eb8-8fdf-0590d6dd187e',
      host: 'localhost:5000',
      'accept-encoding': 'gzip, deflate, br',
      connection: 'keep-alive',
      'content-length': '686',
    };

    function assertObservable<T>(
      observable: Observable<T>,
      done: jest.DoneCallback,
      nextCallback: (val: T) => void,
    ) {
      observable.subscribe({
        next(val: T) {
          nextCallback(val);
        },
        error(err): void {
          expect(err).toBeUndefined();
        },
        complete(): void {
          done();
        },
      });
    }

    function expectFileTest(
      done: jest.DoneCallback,
      assertions: (file: FormFile, fileContents: string) => void,
    ) {
      const stream = Readable.from([postDataBuilder.build()]);
      const result = service.createFileObservable(headers, stream);
      assertObservable(result, done, (file: FormFile) => {
        streamToString(file.stream)
          .then((fileContents: string) => {
            assertions(file, fileContents);
          })
          .catch((err) => {
            done(err);
          });
      });
    }

    function expectNoFilesTest(
      done: jest.DoneCallback,
      assertions: () => void,
    ) {
      const stream = Readable.from([postDataBuilder.build()]);
      const result = service.createFileObservable(headers, stream);
      const countResult: Observable<number> = result.pipe(count());
      assertObservable(countResult, done, (invocations: number) => {
        expect(invocations).toBe(0);
        assertions();
      });
    }

    function expectErrorTest(
      done: jest.DoneCallback,
      assertions: (err: HttpException) => void,
    ) {
      const stream = Readable.from([postDataBuilder.build()]);
      const result = service.createFileObservable(headers, stream);

      result.subscribe({
        error(err: HttpException): void {
          assertions(err);
          done();
        },
      });
    }

    it('should handle POST with no fields', (done) => {
      expectNoFilesTest(done, () => {
        expect(logDebugStub).toHaveBeenCalledWith(
          'Finished processing HTTP POST stream',
        );
        expect(logWarnStub).not.toHaveBeenCalled();
        expect(logErrorStub).not.toHaveBeenCalled();
      });
    });

    it('should log ignored fields', (done) => {
      postDataBuilder.addField('foo', 'FooValue');
      postDataBuilder.addField('bar', 'BarValue');
      postDataBuilder.addField('baz', 'BazValue');

      expectNoFilesTest(done, () => {
        expect(logWarnStub).toHaveBeenCalledTimes(3);
        expect(logWarnStub).toHaveBeenCalledWith(
          'Encountered (and ignored) HTTP POST field named foo with value FooValue',
        );
        expect(logWarnStub).toHaveBeenCalledWith(
          'Encountered (and ignored) HTTP POST field named bar with value BarValue',
        );
        expect(logWarnStub).toHaveBeenCalledWith(
          'Encountered (and ignored) HTTP POST field named baz with value BazValue',
        );
      });
    });

    it('should handle a single file', (done) => {
      postDataBuilder.addFile('file', 'clean.txt', 'No virus here');

      expectFileTest(done, (file: FormFile, streamData: string) => {
        expect(file.fileName).toBe('clean.txt');
        expect(file.fieldName).toBe('file');
        expect(streamData).toBe('No virus here');
      });
    });

    it('should handle multiple files', (done) => {
      postDataBuilder.addFile('one', 'one.txt', 'File 1');
      postDataBuilder.addFile('two', 'two.txt', 'File 2');
      postDataBuilder.addFile('three', 'three.txt', 'File 3');

      let invocationCount = 0;
      expectFileTest(done, (file: FormFile) => {
        switch (invocationCount) {
          case 0:
            expect(file.fileName).toBe('one.txt');
            break;
          case 1:
            expect(file.fileName).toBe('two.txt');
            break;
          case 2:
            expect(file.fileName).toBe('three.txt');
            break;
        }
        invocationCount++;
      });
    });

    it('should handle errors when there are too many files', (done) => {
      maxFileSizeStub.withArgs('MAX_FILE_COUNT').returns(1);
      postDataBuilder.addFile('one', 'one.txt', 'File 1');
      postDataBuilder.addFile('two', 'two.txt', 'File 2');

      expectErrorTest(done, (err: HttpException) => {
        expect(err.message).toBe('Encountered too many HTTP POST files');
        expect(err.getStatus()).toBe(400);
        expect(logErrorStub).toHaveBeenCalledWith('Busboy filesLimit reached');
      });
    });

    it('should handle errors when files are too large', (done) => {
      maxFileSizeStub.withArgs('MAX_FILE_SIZE').returns(1);
      postDataBuilder.addFile('one', 'one.txt', 'File 1 is way too big');

      expectErrorTest(done, (err: HttpException) => {
        expect(err.message).toBe('File upload size exceeded');
        expect(err.getStatus()).toBe(413);
        expect(logErrorStub).toHaveBeenCalledWith(
          'Busboy file size limit exceeded',
        );
      });
    });

    it('should throw an error if content-type is unspecified', () => {
      delete headers['content-type'];

      postDataBuilder.addFile('file', 'clean.txt', 'No virus here');

      const stream = Readable.from([postDataBuilder.build()]);

      try {
        service.createFileObservable(headers, stream);
        expect.fail('Error not thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpException);
        const error = err as HttpException;
        expect(error.message).toBe('Missing Content-Type');
        expect(error.getStatus()).toBe(400);
        expect(logErrorStub).toHaveBeenCalledWith(
          'Error initializing busboy',
          error.getResponse(),
        );
      }
    });
  });
});
