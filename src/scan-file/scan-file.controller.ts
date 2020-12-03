import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ScanFileService } from './scan-file.service';

@Controller('scan-file')
export class ScanFileController {
  constructor(private scanFileService: ScanFileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  scanFile(@UploadedFile() file: Express.Multer.File): string {
    return this.scanFileService.scanFile(file);
  }
}
