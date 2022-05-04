import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Observable, Subscriber } from 'rxjs';
import * as Busboy from 'busboy';
import { Readable } from 'stream';
import { ScanFileConfig } from './scan-file.config';
import http from 'http';

type BusboyHeaders = { 'content-type': string } & http.IncomingHttpHeaders;

/**
 * This represents an HTTP POST form file
 */
export interface FormFile {
  fieldName: string;
  filename: string;
  stream: Readable;
}

@Injectable()
export class FileStreamService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(ScanFileConfig) private config: ScanFileConfig,
  ) {}

  createFileObservable(
    headers: http.IncomingHttpHeaders,
    requestStream: Readable,
  ): Observable<FormFile> {
    // Cast the header type for busboy
    // Note- if the content-type is missing, Busboy will complain (which is what we want)
    const busboyHeaders: BusboyHeaders = headers as BusboyHeaders;

    const limits = {
      files: this.config.maxFileCount,
      fileSize: this.config.maxFileSize,
    };

    let busboy: Busboy.Busboy;
    try {
      busboy = Busboy({ headers: busboyHeaders, limits });
    } catch (err) {
      this.logger.error('Error initializing busboy', err);
      throw new BadRequestException(err);
    }

    const result = new Observable<FormFile>(
      (subscriber: Subscriber<FormFile>) => {
        busboy.on(
          'file',
          (fieldName: string, stream: Readable, fileInfo: Busboy.FileInfo) => {
            const { filename } = fileInfo;
            this.logger.debug('Encountered HTTP POST file stream');
            const result: FormFile = {
              fieldName,
              filename,
              stream,
            };

            stream.on('limit', () => {
              this.logger.error('Busboy file size limit exceeded');
              subscriber.error(
                new PayloadTooLargeException('File upload size exceeded'),
              );
            });

            subscriber.next(result);
          },
        );

        busboy.on('field', (fieldName: string, fieldValue: string) => {
          this.logger.warn(
            `Encountered (and ignored) HTTP POST field named ${fieldName} with value ${fieldValue}`,
          );
        });

        busboy.on('filesLimit', () => {
          this.logger.error('Busboy filesLimit reached');
          subscriber.error(
            new BadRequestException('Encountered too many HTTP POST files'),
          );
        });

        busboy.on('finish', () => {
          this.logger.debug('Finished processing HTTP POST stream');
          subscriber.complete();
        });
      },
    );

    requestStream.pipe(busboy);
    return result;
  }
}
