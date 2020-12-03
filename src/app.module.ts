import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StatusInfoModule } from './status-info/status-info.module';

@Module({
  imports: [StatusInfoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
