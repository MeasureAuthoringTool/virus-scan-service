import { stub, createStubInstance } from 'sinon';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScanFileModule } from './scan-file.module';
import { ScanFileController } from './scan-file.controller';
import { AuthModule } from '../auth/auth.module';
import { ScanFileConfig } from './scan-file.config';
import { ScanFileServiceProvider, NodeClamProvider } from '../constants';
import NodeClam from './clamscan';
import { ScanFileService } from './scan-file.service';
import { FileStreamService } from './file-stream.service';

describe('ScanFileModule', () => {
  it('should have the specified imports', () => {
    const imports = Reflect.getMetadata('imports', ScanFileModule);
    expect(imports).toBeArrayOfSize(1);
    expect(imports[0]).toBe(AuthModule);
  });

  it('should have the specified controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ScanFileModule);
    expect(controllers).toBeArrayOfSize(1);
    expect(controllers[0]).toBe(ScanFileController);
  });

  it('should have the specified providers', () => {
    const providers = Reflect.getMetadata('providers', ScanFileModule);
    expect(providers).toBeArrayOfSize(4);
    expect(providers[0]).toBe(ScanFileConfig);
    expect(providers[1].provide).toBe(ScanFileServiceProvider);
    expect(providers[2].provide).toBe(NodeClamProvider);
    expect(providers[3]).toBe(FileStreamService);
  });

  it('should have the specified exports', () => {
    const exports = Reflect.getMetadata('exports', ScanFileModule);
    expect(exports).toBeArrayOfSize(1);
    expect(exports[0]).toBe(ScanFileServiceProvider);
  });

  it('should build a ScanFileService correctly in the provider factory', async () => {
    // This is the structure of the useFactory function
    type UseFactory = (
      l: Logger,
      n: NodeClam,
      s: ScanFileConfig,
    ) => Promise<ScanFileService>;

    // Create stubbed parameters and return types
    const loggerStub = createStubInstance(Logger);
    const logger = <Logger>(<unknown>loggerStub);
    const nodeClam: NodeClam = createStubInstance(NodeClam);
    const stubConfigService = createStubInstance(ConfigService);
    const scanFileConfig = new ScanFileConfig(stubConfigService);
    const expectedResult = createStubInstance(ScanFileService);
    const initStub = stub(ScanFileService.prototype, 'init').resolves(
      expectedResult,
    );

    // Get the useFactory method
    const providers = Reflect.getMetadata('providers', ScanFileModule);
    expect(providers[1].provide).toBe(ScanFileServiceProvider);
    const useFactory: UseFactory = providers[1].useFactory;

    // Actually invoke it
    const result = await useFactory(logger, nodeClam, scanFileConfig);

    // Assert results
    expect(result).toBe(expectedResult);
    expect(initStub).toHaveBeenCalledWith();
  });
});
