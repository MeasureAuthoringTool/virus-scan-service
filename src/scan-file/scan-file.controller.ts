import {
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { ScanFileService } from './scan-file.service';
import { ScanFileServiceProvider } from '../constants';
import { ScanResult } from './scan-file.types';

@Controller('scan-file')
export class ScanFileController {
  constructor(
    @Inject(ScanFileServiceProvider) private scanFileService: ScanFileService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async scanFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ): Promise<ScanResult> {
    const result = await this.scanFileService.scanFile(file);
    if (result.infected) {
      res.status(HttpStatus.BAD_REQUEST);
    } else {
      res.status(HttpStatus.OK);
    }
    res.json(result);
    return result;
  }
}
