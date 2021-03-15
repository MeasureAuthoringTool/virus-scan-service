import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { VersionHealthIndicator } from './version.health';
import { HealthCheckConfig } from './health-check.config';
import { ClamAvHealth } from './clam-av.health';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private version: VersionHealthIndicator,
    private config: HealthCheckConfig,
    private clamHealth: ClamAvHealth,
  ) {}

  @Get()
  @HealthCheck()
  checkHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.version.version('app-version'),
      () =>
        this.http.pingCheck('clam-av-dns', this.config.pingUrl, {
          headers: { 'User-Agent': 'Virus Scan  v1' },
        }),
      () =>
        this.disk.checkStorage('disk-storage', {
          thresholdPercent: this.config.diskThresholdPercent,
          path: this.config.diskThresholdPath,
        }),
      () =>
        this.memory.checkHeap('memory-heap', this.config.memoryHeapThreshold),
      () => this.memory.checkRSS('memory-rss', this.config.memoryRssThreshold),
      () => this.clamHealth.clamVersion('clamav-version'),
    ]);
  }
}
