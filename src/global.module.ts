import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppConfigService } from './app-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().port(),
      }),
      isGlobal: true,
    }),
  ],
  providers: [Logger, AppConfigService],
  exports: [Logger, AppConfigService],
})
export class GlobalModule {}
