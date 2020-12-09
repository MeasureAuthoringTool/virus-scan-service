import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ScanFileService } from './scan-file.service';
import { ScanFileServiceProvider } from '../constants';
import { ScanResult } from './scan-file.types';

@Controller('scan-file')
export class ScanFileController {
  constructor(
    @Inject(ScanFileServiceProvider) private scanFileService: ScanFileService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async scanFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ScanResult> {
    return await this.scanFileService.scanFile(file);
  }
}
