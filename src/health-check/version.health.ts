import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { VersionNumberService } from './version-number.service';

export interface versionInfo {
  version: string | null;
}

@Injectable()
export class VersionHealthIndicator extends HealthIndicator {
  constructor(private versionNumberService: VersionNumberService) {
    super();
  }

  async version(key: string): Promise<HealthIndicatorResult> {
    const version = this.versionNumberService.getVersion();
    const isHealthy = !!version;
    const info: versionInfo = { version };
    const result = this.getStatus(key, isHealthy, info);
    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Unable to retrieve version number', result);
  }
}
