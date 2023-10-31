-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "CourseVerificationStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "CourseProgressStatus" AS ENUM ('inProgress', 'completed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('purchase', 'creditRequest', 'settlement');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "walletId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "walletId" INTEGER NOT NULL,
    "paymentInfo" JSONB,
    "status" "ProviderStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "providerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "courseLink" TEXT NOT NULL,
    "imgLink" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "noOfLessons" INTEGER NOT NULL,
    "language" TEXT[],
    "duration" INTEGER NOT NULL,
    "competency" JSONB NOT NULL,
    "author" TEXT NOT NULL,
    "avgRating" DOUBLE PRECISION,
    "status" "CourseStatus" NOT NULL,
    "availabilityTime" TIMESTAMP(3),
    "verificationStatus" "CourseVerificationStatus" NOT NULL,
    "cqfScore" INTEGER,
    "impactScore" DOUBLE PRECISION,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCourse" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "status" "CourseProgressStatus" NOT NULL,
    "courseCompletionScore" DOUBLE PRECISION,
    "rating" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "UserCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourse" ADD CONSTRAINT "UserCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
