import 'reflect-metadata';
import { GlobalModule } from './global.module';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppConfigService } from './config/config.service';

describe('GlobalModule', () => {
  it('should have the specified imports', async () => {
    const imports = Reflect.getMetadata('imports', GlobalModule) as unknown[]; //promise?
    expect(Array.isArray(imports)).toBe(true);
    expect(imports).toHaveLength(1);

    // imports[0] is a promise now?
    const first = imports[0] as any;
    const resolved = typeof first?.then === 'function' ? await first : first;
    expect(resolved).toEqual(
      expect.objectContaining({
        module: ConfigModule,
        global: true,
      }),
    );
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
