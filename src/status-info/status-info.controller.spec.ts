import { Test, TestingModule } from '@nestjs/testing';
import { StatusInfoController } from './status-info.controller';
import { StatusInfoService } from './status-info.service';

jest.mock('./status-info.service');

describe('StatusInfoController', () => {
  const mockedStatus = 'Some cool status from the service';
  let controller: StatusInfoController;
  let mockStatusFunc: () => string;

  beforeEach(async () => {
    mockStatusFunc = jest.fn().mockReturnValue(mockedStatus);
    const MockedStatusInfoService = StatusInfoService as jest.Mock<StatusInfoService>;
    MockedStatusInfoService.mockImplementation(() => {
      return {
        status: mockStatusFunc,
      };
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusInfoController],
      providers: [MockedStatusInfoService],
    }).compile();

    controller = module.get<StatusInfoController>(StatusInfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the value from the StatusInfoService', () => {
    expect(controller.getStatusInfo()).toBe(mockedStatus);
  });
});
