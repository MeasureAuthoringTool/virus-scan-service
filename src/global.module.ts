import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config/config.service';
import validationSchema from './config/config.validation';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: validationSchema,
      isGlobal: true,
    }),
  ],
  providers: [Logger, AppConfigService],
  exports: [Logger, AppConfigService],
})
export class GlobalModule {}
