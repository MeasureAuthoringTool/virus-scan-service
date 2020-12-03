import { Injectable } from '@nestjs/common';
import { version } from '../../package.json';

@Injectable()
export class StatusInfoService {
  status(): string {
    return `Virus Scanning Service v${version}`;
  }
}
