import { AppModule } from './app.module';
import { GlobalModule } from './global.module';
import { AppController } from './app.controller';
import { HealthCheckModule } from './health-check/health-check.module';
import { ScanFileModule } from './scan-file/scan-file.module';

describe('AppModule', () => {
  it('should have the specified imports', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toBeArrayOfSize(3);
    expect(imports[0]).toBe(GlobalModule);
    expect(imports[1]).toBe(HealthCheckModule);
    expect(imports[2]).toBe(ScanFileModule);
  });

  it('should have the specified controllers', () => {
    const controllers = Reflect.getMetadata('controllers', AppModule);
    expect(controllers).toBeArrayOfSize(1);
    expect(controllers[0]).toBe(AppController);
  });

  it('should have the specified providers', () => {
    const providers = Reflect.getMetadata('providers', AppModule);
    expect(providers).toBeUndefined();
  });

  it('should have the specified exports', () => {
    const exports = Reflect.getMetadata('exports', AppModule);
    expect(exports).toBeUndefined();
  });
});
