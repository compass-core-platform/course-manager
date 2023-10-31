import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ProviderModule } from "./provider/provider.module";
import { PrismaService } from "./prisma/prisma.service";
import { AdminModule } from './admin/admin.module';
import { MockWalletModule } from './mock-wallet/mock-wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProviderModule,
    AdminModule,
    MockWalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
