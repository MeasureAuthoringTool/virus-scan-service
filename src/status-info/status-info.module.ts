import { Module } from '@nestjs/common';
import { StatusInfoController } from './status-info.controller';
import { StatusInfoService } from './status-info.service';

@Module({
  controllers: [StatusInfoController],
  providers: [StatusInfoService],
})
export class StatusInfoModule {}
