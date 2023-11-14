import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CourseService } from "./course.service";
import { CourseController } from "./course.controller";

@Module({
  controllers: [CourseController],
  providers: [PrismaService, CourseService],
  exports: [CourseService]
})
export class CourseModule {}
