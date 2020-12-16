import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { VersionNumberService } from './health-check/version-number.service';
import { version } from '../package.json';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [VersionNumberService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return name of app and current version', () => {
      expect(appController.getMessage()).toBe(
        `Virus Scanning Service v${version}`,
      );
    });
  });
});
