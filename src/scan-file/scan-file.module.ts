import { Logger, Module } from '@nestjs/common';
import { ScanFileController } from './scan-file.controller';
import { ScanFileService } from './scan-file.service';
import { ScanFileServiceProvider, NodeClamProvider } from '../constants';
import NodeClam from './clamscan';

@Module({
  controllers: [ScanFileController],
  providers: [
    {
      provide: ScanFileServiceProvider,
      useFactory: async (logger: Logger, nodeClam: NodeClam) => {
        const service = new ScanFileService(logger, nodeClam);
        return service.init();
      },
      inject: [Logger, NodeClamProvider],
    },
    {
      provide: NodeClamProvider,
      useClass: NodeClam,
    },
  ],
})
export class ScanFileModule {}
