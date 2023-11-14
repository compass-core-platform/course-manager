import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';
import { CourseService } from 'src/course/course.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    imports: [PrismaModule],
    controllers: [ProviderController],
    providers: [ProviderService, CourseService, PrismaService],
    exports: [ProviderService]
})
export class ProviderModule {}