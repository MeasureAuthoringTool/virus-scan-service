import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';
import { VersionNumberService } from './version-number.service';
import { VersionHealthIndicator } from './version.health';
import { HealthCheckConfig } from './health-check.config';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckController],
  providers: [VersionHealthIndicator, VersionNumberService, HealthCheckConfig],
  exports: [VersionNumberService],
})
export class HealthCheckModule {}
