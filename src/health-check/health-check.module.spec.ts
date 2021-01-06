import { HealthCheckModule } from './health-check.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './health-check.controller';
import { VersionNumberService } from './version-number.service';
import { VersionHealthIndicator } from './version.health';
import { HealthCheckConfig } from './health-check.config';
import { ClamAvHealth } from './clam-av.health';
import { ScanFileModule } from '../scan-file/scan-file.module';

describe('HealthCheckModule', () => {
  it('should have the specified imports', () => {
    const imports = Reflect.getMetadata('imports', HealthCheckModule);
    expect(imports).toBeArrayOfSize(2);
    expect(imports[0]).toBe(TerminusModule);
    expect(imports[1]).toBe(ScanFileModule);
  });

  it('should have the specified controllers', () => {
    const controllers = Reflect.getMetadata('controllers', HealthCheckModule);
    expect(controllers).toBeArrayOfSize(1);
    expect(controllers[0]).toBe(HealthCheckController);
  });

  it('should have the specified providers', () => {
    const providers = Reflect.getMetadata('providers', HealthCheckModule);
    expect(providers).toBeArrayOfSize(4);
    expect(providers[0]).toBe(VersionHealthIndicator);
    expect(providers[1]).toBe(VersionNumberService);
    expect(providers[2]).toBe(HealthCheckConfig);
    expect(providers[3]).toBe(ClamAvHealth);
  });

  it('should have the specified exports', () => {
    const exports = Reflect.getMetadata('exports', HealthCheckModule);
    expect(exports).toBeArrayOfSize(1);
    expect(exports[0]).toBe(VersionNumberService);
  });
});
