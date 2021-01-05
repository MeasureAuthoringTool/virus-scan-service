import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiHeader,
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiPayloadTooLargeResponse,
} from '@nestjs/swagger';
import { ScanFileService } from './scan-file.service';
import { ScanFileServiceProvider } from '../constants';
import { ScanResponseDto } from './scan-response.dto';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { HttpExceptionDto } from '../common/http-exception.dto';
import { FileUploadDto } from '../common/file-upload.dto';
import { Request } from 'express';
import { FileStreamService, FormFile } from './file-stream.service';
import { mergeMap, reduce } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { ScanResultDto } from './scan-result.dto';

@ApiTags('File Scanning')
@Controller('scan-file')
export class ScanFileController {
  constructor(
    @Inject(ScanFileServiceProvider) private scanFileService: ScanFileService,
    @Inject(FileStreamService) private fileStreamService: FileStreamService,
  ) {}

  @ApiHeader({
    name: 'apikey',
    description: 'Custom header',
  })
  @ApiOkResponse({
    description:
      'The files have been scanned successfully. Viruses may or may not have been detected.',
    type: ScanResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Received too many files ',
    type: HttpExceptionDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized access: missing or invalid apikey header',
    type: HttpExceptionDto,
  })
  @ApiPayloadTooLargeResponse({
    description: 'The file being uploaded is too large',
    type: HttpExceptionDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'The file to be scanned',
    type: FileUploadDto,
  })
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(ApiKeyGuard)
  scanFile(@Req() req: Request): Observable<ScanResponseDto> {
    // Create an Observable that emits a Stream every time it encounters a file
    const fileObservable = this.fileStreamService.createFileObservable(
      req.headers,
      req,
    );

    // Convert the above Observable into an Observable that emits our result object
    return fileObservable.pipe(
      mergeMap((file: FormFile) => {
        return from(this.scanFileService.scanFile(file.stream, file.fileName));
      }),
      reduce(
        (acc: ScanResponseDto, scanResult: ScanResultDto): ScanResponseDto => {
          return acc.addResult(scanResult);
        },
        new ScanResponseDto(),
      ),
    );
  }
}
