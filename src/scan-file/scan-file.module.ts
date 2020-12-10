import { Logger, Module } from '@nestjs/common';
import { ScanFileController } from './scan-file.controller';
import { ScanFileService } from './scan-file.service';
import { ScanFileServiceProvider, NodeClamProvider } from '../constants';
import NodeClam from './clamscan';
import { ScanFileConfig } from './scan-file.config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScanFileController],
  providers: [
    ScanFileConfig,
    {
      provide: ScanFileServiceProvider,
      useFactory: async (
        logger: Logger,
        nodeClam: NodeClam,
        config: ScanFileConfig,
      ) => {
        const service = new ScanFileService(logger, nodeClam, config);
        return service.init();
      },
      inject: [Logger, NodeClamProvider, ScanFileConfig],
    },
    {
      provide: NodeClamProvider,
      useClass: NodeClam,
    },
  ],
})
export class ScanFileModule {}
