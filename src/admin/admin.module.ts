import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'nestjs-prisma';
import { MockWalletModule } from 'src/mock-wallet/mock-wallet.module';
import { CourseModule } from 'src/course/course.module';
import { ProviderModule } from 'src/provider/provider.module';

@Module({
  imports: [PrismaModule, CourseModule, MockWalletModule, ProviderModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService]
})
export class AdminModule {}
