import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { VersionNumberService } from './health-check/version-number.service';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly versionNumberService: VersionNumberService) {}

  @Get()
  @ApiOkResponse({
    description: 'Request received.',
    type: String,
  })
  getMessage(): string {
    const version = this.versionNumberService.getVersion();
    return `Virus Scanning Service v${version}`;
  }
}
