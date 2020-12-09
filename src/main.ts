import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { utilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module';
import { version } from '../package.json';
import { AppConfigService } from './app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      // Winston configuration
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike(),
          ),
        }),
      ],
    }),
  });

  app.enableShutdownHooks();

  const logger = app.get(Logger);
  const configService = app.get(AppConfigService);

  const options = new DocumentBuilder()
    .setTitle('Virus Scan Service')
    .setDescription('The Virus Scanning Service API')
    .setVersion(version)
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.use(helmet());

  const portNumber = configService.portNumber;
  await app.listen(portNumber);
  logger.log(`Listening on port ${portNumber}`);
}
bootstrap();
