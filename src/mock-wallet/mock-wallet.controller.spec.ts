import { Test, TestingModule } from '@nestjs/testing';
import { MockWalletController } from './mock-wallet.controller';

describe('MockWalletController', () => {
  let controller: MockWalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MockWalletController],
    }).compile();

    controller = module.get<MockWalletController>(MockWalletController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
