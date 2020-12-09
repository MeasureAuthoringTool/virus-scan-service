import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  DNSHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { VersionHealthIndicator } from './version.health';
import { HealthCheckConfig } from './health-check.config';

@Controller('health-check')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private dns: DNSHealthIndicator,
    private memory: MemoryHealthIndicator,
    private version: VersionHealthIndicator,
    private config: HealthCheckConfig,
  ) {}

  @Get()
  @HealthCheck()
  checkHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.version.version('app-version'),
      () => this.dns.pingCheck('clam-av-dns', this.config.pingUrl),
      () =>
        this.disk.checkStorage('disk-storage', {
          thresholdPercent: this.config.diskThresholdPercent,
          path: this.config.diskThresholdPath,
        }),
      () =>
        this.memory.checkHeap('memory-heap', this.config.memoryHeapThreshold),
      () => this.memory.checkRSS('memory-rss', this.config.memoryRssThreshold),
    ]);
  }
}
