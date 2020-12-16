import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DEFAULT_CLAMAV_HOST,
  DEFAULT_CLAMAV_PORT,
  DEFAULT_CLAMAV_TIMEOUT,
} from '../constants';

interface EnvironmentVariables {
  CLAMAV_HOST: string;
  CLAMAV_PORT: number;
  CLAMAV_TIMEOUT: number;
}

@Injectable()
export class ScanFileConfig {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get clamAVHost(): string {
    const configValue = this.configService.get<string>('CLAMAV_HOST');
    return configValue || DEFAULT_CLAMAV_HOST;
  }

  get clamAVPort(): number {
    const configValue = this.configService.get<number>('CLAMAV_PORT');
    return configValue || DEFAULT_CLAMAV_PORT;
  }

  get clamAVTimeout(): number {
    const configValue = this.configService.get<number>('CLAMAV_TIMEOUT');
    return configValue || DEFAULT_CLAMAV_TIMEOUT;
  }
}
