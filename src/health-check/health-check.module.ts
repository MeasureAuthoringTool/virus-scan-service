import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';
import { VersionNumberService } from './version-number.service';
import { VersionHealthIndicator } from './version.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthCheckController],
  providers: [VersionHealthIndicator, VersionNumberService],
  exports: [VersionNumberService],
})
export class HealthCheckModule {}
