import { Module } from '@nestjs/common';
import { ScanFileController } from './scan-file.controller';
import { ScanFileService } from './scan-file.service';

@Module({
  controllers: [ScanFileController],
  providers: [ScanFileService],
})
export class ScanFileModule {}
