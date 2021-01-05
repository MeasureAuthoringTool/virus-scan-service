import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Observable, Subscriber } from 'rxjs';
import * as Busboy from 'busboy';
import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';
import { ScanFileConfig } from './scan-file.config';

/**
 * This represents an HTTP POST form file
 */
export interface FormFile {
  fieldName: string;
  fileName: string;
  stream: Readable;
}

@Injectable()
export class FileStreamService {
  constructor(
    @Inject(Logger) private readonly logger: Logger,
    @Inject(ScanFileConfig) private config: ScanFileConfig,
  ) {}

  createFileObservable(
    headers: IncomingHttpHeaders,
    requestStream: Readable,
  ): Observable<FormFile> {
    const limits = {
      files: this.config.maxFileCount,
      fileSize: this.config.maxFileSize,
    };
    const busboy = new Busboy({ headers, limits });

    const result = new Observable<FormFile>(
      (subscriber: Subscriber<FormFile>) => {
        busboy.on(
          'file',
          (fieldName: string, stream: Readable, fileName: string) => {
            this.logger.debug('Encountered HTTP POST file stream');
            const result: FormFile = {
              fieldName,
              fileName,
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
