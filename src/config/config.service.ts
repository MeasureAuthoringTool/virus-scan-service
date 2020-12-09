import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_PORT } from '../constants';

interface EnvironmentVariables {
  PORT: number;
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get portNumber(): number {
    const configValue = this.configService.get<number>('PORT');
    return configValue || DEFAULT_PORT;
  }
}
