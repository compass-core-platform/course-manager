import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ProviderModule } from "./provider/provider.module";
import { AdminModule } from './admin/admin.module';
import { MockWalletModule } from './mock-wallet/mock-wallet.module';
import { CourseModule } from "./course/course.module";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProviderModule,
    AdminModule,
    MockWalletModule,
    CourseModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
