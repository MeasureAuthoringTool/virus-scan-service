import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiHeader,
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import * as multer from 'multer';
import { ScanFileService } from './scan-file.service';
import { ScanFileServiceProvider } from '../constants';
import { ScanResultDto } from './scan-result.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { HttpExceptionDto } from '../common/http-exception.dto';
import { FileUploadDto } from '../common/file-upload.dto';

@ApiTags('File Scanning')
@Controller('scan-file')
export class ScanFileController {
  constructor(
    @Inject(ScanFileServiceProvider) private scanFileService: ScanFileService,
  ) {}

  @Post()
  @ApiHeader({
    name: 'apikey',
    description: 'Custom header',
  })
  @ApiOkResponse({
    description:
      'The file has been scanned successfully. Viruses may or may not have been detected.',
    type: ScanResultDto,
  })
  @ApiBadRequestResponse({
    description: 'Received no file or empty file',
    type: HttpExceptionDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access: missing or invalid apikey header',
    type: HttpExceptionDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The file to be scanned',
    type: FileUploadDto,
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async scanFile(
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ScanResultDto> {
    if (!file || file.size === 0) {
      throw new BadRequestException('No file specified for virus scanning');
    }
    return await this.scanFileService.scanFile(file);
  }
}
