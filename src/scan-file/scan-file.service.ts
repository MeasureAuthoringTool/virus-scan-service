import { Inject, Injectable, Logger } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ScanFileService {
  constructor(@Inject(Logger) private readonly logger: Logger) {
    logger.setContext(ScanFileService.name);
  }

  scanFile(file: Express.Multer.File): string {
    this.logger.log(`Scanning file ${file.originalname}`);
    return `No viruses detected in file ${file.originalname}`;
  }
}
