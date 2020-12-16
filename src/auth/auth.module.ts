import { Module } from '@nestjs/common';
import { ApiKeyStrategy } from './api-key.strategy';

@Module({
  providers: [ApiKeyStrategy],
  exports: [ApiKeyStrategy],
})
export class AuthModule {}
