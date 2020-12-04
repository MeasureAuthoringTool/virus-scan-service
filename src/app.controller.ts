import { Controller, Get } from '@nestjs/common';
import { VersionNumberService } from './health-check/version-number.service';

@Controller()
export class AppController {
  constructor(private readonly versionNumberService: VersionNumberService) {}

  @Get()
  getMessage(): string {
    const version = this.versionNumberService.getVersion();
    return `Virus Scanning Service v${version}`;
  }
}
