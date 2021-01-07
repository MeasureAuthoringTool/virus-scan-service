import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';
import { VersionNumberService } from './version-number.service';
import { VersionHealthIndicator } from './version.health';
import { HealthCheckConfig } from './health-check.config';
import { ClamAvHealth } from './clam-av.health';
import { ScanFileModule } from '../scan-file/scan-file.module';

@Module({
  imports: [TerminusModule, ScanFileModule],
  controllers: [HealthCheckController],
  providers: [
    VersionHealthIndicator,
    VersionNumberService,
    HealthCheckConfig,
    ClamAvHealth,
  ],
  exports: [VersionNumberService],
})
export class HealthCheckModule {}
