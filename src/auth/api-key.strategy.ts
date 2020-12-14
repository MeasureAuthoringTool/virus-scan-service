import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { API_KEY_GUARD } from '../constants';
import { AppConfigService } from '../config/config.service';

type VerifiedType = (err: Error | null, user?: any, info?: any) => void;

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  API_KEY_GUARD,
) {
  constructor(
    @Inject(AppConfigService) private configService: AppConfigService,
  ) {
    super(
      { header: 'apiKey', prefix: '' },
      false,
      (apiKey: string, verified: VerifiedType) => {
        if (apiKey === configService.apiKey) {
          return verified(null, true, 'Valid API Key');
        }
        return verified(null, false, 'Invalid API Key');
      },
    );
  }
}
