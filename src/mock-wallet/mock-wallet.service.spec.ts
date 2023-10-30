import { Test, TestingModule } from '@nestjs/testing';
import { MockWalletService } from './mock-wallet.service';

describe('MockWalletService', () => {
  let service: MockWalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockWalletService],
    }).compile();

    service = module.get<MockWalletService>(MockWalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
