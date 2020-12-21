import { GlobalModule } from './global.module';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppConfigService } from './config/config.service';

describe('GlobalModule', () => {
  it('should have the specified imports', () => {
    const imports = Reflect.getMetadata('imports', GlobalModule);
    expect(imports).toBeArrayOfSize(1);
    expect(imports[0].global).toBeTrue();
    expect(imports[0].module).toBe(ConfigModule);
  });

  it('should have the specified controllers', () => {
    const controllers = Reflect.getMetadata('controllers', GlobalModule);
    expect(controllers).toBeUndefined();
  });

  it('should have the specified providers', () => {
    const providers = Reflect.getMetadata('providers', GlobalModule);
    expect(providers).toBeArrayOfSize(2);
    expect(providers[0]).toBe(Logger);
    expect(providers[1]).toBe(AppConfigService);
  });

  it('should have the specified exports', () => {
    const exports = Reflect.getMetadata('exports', GlobalModule);
    expect(exports).toBeArrayOfSize(2);
    expect(exports[0]).toBe(Logger);
    expect(exports[1]).toBe(AppConfigService);
  });
});
