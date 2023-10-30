import { CourseStatus, CourseVerificationStatus, PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create dummy data

  const admin1 = await prisma.admin.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'admin1',
      email: "admin1@gmail.com",
      password: "123456",
      walletId: 2
    },
  });

  const admin2 = await prisma.admin.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'admin2',
      email: "admin2@gmail.com",
      password: "admin",
      walletId: 3
    },
  });

  const provider1 = await prisma.provider.upsert({
    where: { id: 1 },
    update: {},
    create: {
        id: 1,
        name: "udemy",
        email: "udemyorg@gmail.in",
        password: "Udemy@9812",
        walletId: 4,
        paymentInfo: {
            bankAccNo: "1111111111",
            otherDetails: {

            }
        },
        status: 'verified',
        // courses: []
    }
  });

  const provider2 = await prisma.provider.upsert({
    where: { id: 2 },
    update: {},
    create: {
        id: 2,
        name: "coursera",
        email: "coursera@gmail.in",
        password: "Coursera@999",
        walletId: 5,
        paymentInfo: {
            bankAccNo: "1111111113",
            otherDetails: {

            }
        },
        status: 'pending',
        // courses: []
    }
  });

  const course1 = await prisma.course.create({
    data: {
        id: 1,
        providerId: 1,
        title: "Learn DevOps & Kubernetes",
        description: "This course enables anyone to get started with devops engineering.",
        courseLink: "https://udemy.com/courses/pYUxbhj",
        imgLink: "https://udemy.com/courses/pYUxbhj/images/cover1.jpg",
        credits: 120,
        noOfLessons: 120,
        language: ["english", "hindi"],
        duration: 48,
        competency: {
            9: ["Level1", "Level3"],
            11: ["Level1"],
            14: [ "Level5" ]
        },
        author: "Jason Frig",
        status: CourseStatus.active,
        availabilityTime: new Date("2023-06-01"),
        verificationStatus: CourseVerificationStatus.accepted,
        cqfScore: 10,
    }
  });

  const resp = await prisma.course.findMany({});
  console.log("All courses: ", resp);

  console.log({ admin1, admin2, provider1, provider2, course1 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });