import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { API_KEY_GUARD } from '../constants';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  API_KEY_GUARD,
) {
  constructor(
    @Inject(AppConfigService) private configService: AppConfigService,
  ) {
    super({ header: 'apikey', prefix: '' }, false);
  }

  validate(apiKey: string): [boolean | null, string] {
    if (apiKey === this.configService.apiKey) {
      return [true, 'Valid API Key'];
    }
    return [null, 'Invalid API Key'];
  }
}
