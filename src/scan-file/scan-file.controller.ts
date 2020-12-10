import {
  BadRequestException,
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
import * as multer from 'multer';
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
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async scanFile(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ScanResult> {
    if (!file || file.size === 0) {
      throw new BadRequestException('No file specified for virus scanning');
    }
    return await this.scanFileService.scanFile(file);
  }
}
