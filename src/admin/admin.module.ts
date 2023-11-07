import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'nestjs-prisma';
import { MockWalletModule } from 'src/mock-wallet/mock-wallet.module';
import { MockWalletService } from 'src/mock-wallet/mock-wallet.service';
import { ProviderService } from 'src/provider/provider.service';
import { CourseService } from 'src/course/course.service';

@Module({
  imports: [PrismaModule, MockWalletModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, MockWalletService, ProviderService, CourseService]
})
export class AdminModule {}
