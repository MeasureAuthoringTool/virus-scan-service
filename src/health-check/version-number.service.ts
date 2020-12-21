import { Injectable } from '@nestjs/common';
import { version } from '../../package.json';

@Injectable()
export class VersionNumberService {
  getVersion(): string {
    return version;
  }
}
