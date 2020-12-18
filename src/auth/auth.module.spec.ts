import { AuthModule } from './auth.module';
import { ApiKeyStrategy } from './api-key.strategy';

describe('AuthModule', () => {
  it('should have the specified imports', () => {
    const imports = Reflect.getMetadata('imports', AuthModule);
    expect(imports).toBeUndefined();
  });

  it('should have the specified controllers', () => {
    const controllers = Reflect.getMetadata('controllers', AuthModule);
    expect(controllers).toBeUndefined();
  });

  it('should have the specified providers', () => {
    const providers = Reflect.getMetadata('providers', AuthModule);
    expect(providers).toBeArrayOfSize(1);
    expect(providers[0]).toBe(ApiKeyStrategy);
  });

  it('should have the specified exports', () => {
    const exports = Reflect.getMetadata('exports', AuthModule);
    expect(exports).toBeArrayOfSize(1);
    expect(exports[0]).toBe(ApiKeyStrategy);
  });
});
