import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_API_KEY, DEFAULT_PORT } from '../constants';

interface EnvironmentVariables {
  PORT: number;
  API_KEY: string;
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get portNumber(): number {
    const configValue = this.configService.get<number>('PORT');
    return configValue || DEFAULT_PORT;
  }

  get apiKey(): string {
    const configValue = this.configService.get<string>('API_KEY');
    return configValue || DEFAULT_API_KEY;
  }
}
