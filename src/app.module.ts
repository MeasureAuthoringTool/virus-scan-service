import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatusInfoModule } from './status-info/status-info.module';
import { ScanFileModule } from './scan-file/scan-file.module';

@Module({
  imports: [StatusInfoModule, ScanFileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
