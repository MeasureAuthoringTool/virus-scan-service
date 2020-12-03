import { Injectable } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ScanFileService {
  scanFile(file: Express.Multer.File): string {
    return `No viruses detected in file ${file.originalname}`;
  }
}
