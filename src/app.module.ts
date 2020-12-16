import { Module } from '@nestjs/common';
import { GlobalModule } from './global.module';
import { AppController } from './app.controller';
import { HealthCheckModule } from './health-check/health-check.module';
import { ScanFileModule } from './scan-file/scan-file.module';

@Module({
  imports: [GlobalModule, HealthCheckModule, ScanFileModule],
  controllers: [AppController],
})
export class AppModule {}
