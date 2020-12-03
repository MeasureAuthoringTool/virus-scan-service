import { Controller, Get } from '@nestjs/common';
import { StatusInfoService } from './status-info.service';

@Controller('status-info')
export class StatusInfoController {
  constructor(private statusInfoService: StatusInfoService) {}

  @Get()
  getStatusInfo(): string {
    return this.statusInfoService.status();
  }
}
