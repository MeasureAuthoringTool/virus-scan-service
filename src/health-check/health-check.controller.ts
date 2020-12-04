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

@Controller('health-check')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private disk: DiskHealthIndicator,
    private dns: DNSHealthIndicator,
    private memory: MemoryHealthIndicator,
    private version: VersionHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  checkHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.version.version('app-version'),
      () => this.dns.pingCheck('clam-av-dns', 'https://www.clamav.net'),
      () =>
        this.disk.checkStorage('disk-storage', {
          // threshold: 250 * 1024,
          thresholdPercent: 0.75,
          path: '/',
        }),
      () => this.memory.checkHeap('memory-heap', 300 * 1024 * 1024), // 300 MB
      () => this.memory.checkRSS('memory-rss', 300 * 1024 * 1024), // 300 MB
    ]);
  }
}
