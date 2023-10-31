import { CourseStatus, CourseVerificationStatus, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {

  const response = await prisma.provider.create({
    data: {
        name: "Vijay Salgaonkar",
        email: "vijaysalgaonkar@gmail.com",
        password: "9d209aacaed4088d68c41bd8dfb20de39cbd8339",
        wallet: {
            create: {
                type: 'provider',
            }
        }
    }
  });

  const provider1 = await prisma.provider.create({
    data: {
        name: "udemy",
        email: "udemyorg@gmail.in",
        password: "Udemy@9812",
        wallet: {
            create: {
                type: 'provider',
            }
        },
        paymentInfo: {
            bankAccNo: "1111111111",
            otherDetails: {

            }
        },
        status: 'verified',
        // courses: []
    }
  });

  const provider2 = await prisma.provider.create({
    data: {
        name: "coursera",
        email: "coursera@gmail.in",
        password: "Coursera@999",
        wallet: {
            create: {
                type: 'provider',
            }
        },
        paymentInfo: {
            bankAccNo: "1111111113",
            otherDetails: {

            }
        },
        status: 'pending',
        // courses: []
    }
  });

  const provider3 = await prisma.provider.create({
    data: {
        name: "lern",
        email: "lern@gmail.in",
        password: "lern@999",
        wallet: {
            create: {
                type: 'provider',
            }
        },
        paymentInfo: {
            bankAccNo: "1111111116",
            otherDetails: {

            }
        },
        status: 'rejected',
        // courses: []
    }
  });

  const response1 = await prisma.course.createMany({
    data: [{
        providerId: provider1.id,
        title: "NestJS Complete",
        description: "Build full featured backend APIs incredibly quickly with Nest, TypeORM, and Typescript. Includes testing and deployment!",
        courseLink: "https://www.udemy.com/course/nestjs-the-complete-developers-guide/",
        imgLink: "https://courses.nestjs.com/img/logo.svg",
        credits: 4,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "Stephen Grider",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }, {
        providerId: provider1.id,
        title: "Graphic Design Masterclass",
        description: "The Ultimate Graphic Design Course Which Covers Photoshop, Illustrator, InDesign, Design Theory, Branding & Logo Design",
        courseLink: "https://www.udemy.com/course/graphic-design-masterclass-everything-you-need-to-know/",
        imgLink: "https://www.unite.ai/wp-content/uploads/2023/05/emily-bernal-v9vII5gV8Lw-unsplash.jpg",
        credits: 5,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "Lindsay Marsh",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }, {
        providerId: provider1.id,
        title: "Python for Data Science",
        description: "Learn how to use NumPy, Pandas, Seaborn , Matplotlib , Plotly , Scikit-Learn , Machine Learning, Tensorflow , and more",
        courseLink: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        imgLink: "https://blog.imarticus.org/wp-content/uploads/2021/12/learn-Python-for-data-science.jpg",
        credits: 2,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "Jose Portilla",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }, {
        providerId: response.id,
        title: "Microsoft Excel",
        description: "Excel with this A-Z Microsoft Excel Course. Microsoft Excel 2010, 2013, 2016, Excel 2019 and Microsoft/Office 365/2023",
        courseLink: "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/",
        imgLink: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microsoft_Excel_2013-2019_logo.svg/587px-Microsoft_Excel_2013-2019_logo.svg.png",
        credits: 4,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "Kyle Pew",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }]
  })

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

  

  const course1 = await prisma.course.create({
    data: {
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
  const response3 = await prisma.userCourse.createMany({
    data: [{
      userId: "56e2b",
      feedback: "Great course",
      rating: 4,
      courseId: 1
    }, {
      userId: "c8200",
      feedback: "Instructor is very friendly",
      rating: 4,
      courseId: 2
    }, {
      userId: "f9464",
      feedback: "Some more real world applications could be discussed",
      rating: 3,
      courseId: 2
    }, {
      userId: "91e61",
      feedback: "Not satisfied with the content",
      rating: 2,
      courseId: 3
    }]
  })
  console.log(response)
  console.log({ response1, response3, admin1, admin2, admin3, provider1, provider2, provider3, course1, course2, course3 });

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
