import { Module } from '@nestjs/common';
import { MockWalletController } from './mock-wallet.controller';
import { MockWalletService } from './mock-wallet.service';

@Module({
  controllers: [MockWalletController],
  providers: [MockWalletService]
})
export class MockWalletModule {}
