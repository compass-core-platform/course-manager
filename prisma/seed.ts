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

  const admin3 = await prisma.admin.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: 'admin3',
      email: "admin3@gmail.com",
      password: "admin3",
      walletId: 4
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

  const provider3 = await prisma.provider.upsert({
    where: { id: 3 },
    update: {},
    create: {
        id: 3,
        name: "lern",
        email: "lern@gmail.in",
        password: "lern@999",
        walletId: 6,
        paymentInfo: {
            bankAccNo: "1111111116",
            otherDetails: {

            }
        },
        status: 'rejected',
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

  const course2 = await prisma.course.create({
    data: {
        id: 2,
        providerId: 1,
        title: "Introduction to Programming",
        description: "This course covers all the fundamentals of programming",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imgLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        noOfLessons: 100,
        language: ["english", "hindi"],
        duration: 50,
        competency: {
            6: ["Level5", "Level4"],
            10: [ "Level1", "Level2" ]
        },
        author: "James Franco",
        status: CourseStatus.active,
        availabilityTime: new Date("2023-08-10"),
        verificationStatus: CourseVerificationStatus.pending,
    }
  });

  const course3 = await prisma.course.create({
    data: {
        id: 3,
        providerId: 1,
        title: "Introduction to Compiler Engineering",
        description: "This course covers how compilers are built and also teaches you about how to create custom programming languages",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imgLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        noOfLessons: 100,
        language: ["english", "hindi"],
        duration: 50,
        competency: {
            3: ["Level2", "Level3"],
            5: [ "Level4" ]
        },
        author: "Ramakrishna Upadrasta",
        status: CourseStatus.active,
        availabilityTime: new Date("2023-10-10"),
        verificationStatus: CourseVerificationStatus.rejected,
    }
  });

  const resp = await prisma.course.findMany({});
  console.log("All courses: ", resp);

  console.log({ admin1, admin2, admin3, provider1, provider2, provider3, course1, course2, course3 });
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