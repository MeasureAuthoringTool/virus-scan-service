import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_HEALTH_PING_URL,
  DEFAULT_HEALTH_DISK_THRESHOLD_PERCENT,
  DEFAULT_HEALTH_DISK_THRESHOLD_PATH,
  DEFAULT_HEALTH_MEMORY_HEAP_THRESHOLD,
  DEFAULT_HEALTH_MEMORY_RSS_THRESHOLD,
} from '../constants';

interface EnvironmentVariables {
  HEALTH_PING_URL: string;
  HEALTH_DISK_THRESHOLD_PERCENT: number;
  HEALTH_DISK_THRESHOLD_PATH: string;
  HEALTH_MEMORY_HEAP_THRESHOLD: number;
  HEALTH_MEMORY_RSS_THRESHOLD: number;
}

@Injectable()
export class HealthCheckConfig {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get pingUrl(): string {
    const configValue = this.configService.get<string>('HEALTH_PING_URL');
    return configValue || DEFAULT_HEALTH_PING_URL;
  }

  get diskThresholdPercent(): number {
    const configValue = this.configService.get<number>(
      'HEALTH_DISK_THRESHOLD_PERCENT',
    );
    return configValue || DEFAULT_HEALTH_DISK_THRESHOLD_PERCENT;
  }

  get diskThresholdPath(): string {
    const configValue = this.configService.get<string>(
      'HEALTH_DISK_THRESHOLD_PATH',
    );
    return configValue || DEFAULT_HEALTH_DISK_THRESHOLD_PATH;
  }

  get memoryHeapThreshold(): number {
    const configValue = this.configService.get<number>(
      'HEALTH_MEMORY_HEAP_THRESHOLD',
    );
    const mbValue = configValue || DEFAULT_HEALTH_MEMORY_HEAP_THRESHOLD;
    return mbValue * 1024 * 1024;
  }

  get memoryRssThreshold(): number {
    const configValue = this.configService.get<number>(
      'HEALTH_MEMORY_RSS_THRESHOLD',
    );
    const mbValue = configValue || DEFAULT_HEALTH_MEMORY_RSS_THRESHOLD;
    return mbValue * 1024 * 1024;
  }
}
