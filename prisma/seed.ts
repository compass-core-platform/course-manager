import { CourseProgressStatus, CourseStatus, CourseVerificationStatus, PrismaClient, ProviderStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient()

async function main() {
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("123456", saltRounds);
  const hashedPassword2 = await bcrypt.hash("Udemy@9812", saltRounds);
  const hashedPassword3 = await bcrypt.hash("Coursera@999", saltRounds);
  const hashedPassword4 = await bcrypt.hash("lern@999", saltRounds);
  const response = await prisma.provider.create({
    data: {
        id: "123e4567-e89b-42d3-a456-556642440010",
        name: "Vijay Salgaonkar",
        email: "vijaysalgaonkar@gmail.com",
        password: hashedPassword,
        status: ProviderStatus.VERIFIED,
        orgLogo: "https://logos-world.net/wp-content/uploads/2021/11/Udemy-Logo.png",
        orgName: "NPTEL",
        phone: "9999999999",
    }
  });

  const provider1 = await prisma.provider.create({
    data: {
      id: "123e4567-e89b-42d3-a456-556642440011",
        name: "udemy",
        email: "udemyorg@gmail.in",
        password: hashedPassword2,
        paymentInfo: {
            bankAccNo: "1111111111",
            otherDetails: {

            }
        },
        status: ProviderStatus.VERIFIED,
        orgLogo: "https://logos-world.net/wp-content/uploads/2021/11/Udemy-Logo.png",
        orgName: "Udemy",
        phone: "9999999999",
    }
  });

  const provider2 = await prisma.provider.create({
    data: {
        id: "123e4567-e89b-42d3-a456-556642440012",
        name: "coursera",
        email: "coursera@gmail.in",
        password: hashedPassword3,
        paymentInfo: {
            bankAccNo: "1111111113",
            otherDetails: {

            }
        },
        status: ProviderStatus.PENDING,
        orgLogo: "https://1000logos.net/wp-content/uploads/2022/06/Coursera-Logo-2012.png",
        orgName: "Coursera",
        phone: "9999999999",
    }
  });

  const provider3 = await prisma.provider.create({
    data: {
        id: "123e4567-e89b-42d3-a456-556642440013",
        name: "lern",
        email: "lern@gmail.in",
        password: hashedPassword4,
        paymentInfo: {
            bankAccNo: "1111111116",
            otherDetails: {

            }
        },
        status: ProviderStatus.REJECTED,
        rejectionReason: "Invalid backAccNo",
        orgLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/2491px-Logo_of_Twitter.svg.png",
        orgName: "Sunbird",
        phone: "9999999999",
    }
  });

  const response1 = await prisma.course.createMany({
    data: [{
        courseId: "123e4567-e89b-42d3-a456-556642440050",
        providerId: provider1.id,
        title: "NestJS Complete",
        description: "Build full featured backend APIs incredibly quickly with Nest, TypeORM, and Typescript. Includes testing and deployment!",
        courseLink: "https://www.udemy.com/course/nestjs-the-complete-developers-guide/",
        imageLink: "https://courses.nestjs.com/img/logo.svg",
        credits: 4,
        language: ["en"],
        competency: JSON.stringify([{
              "id": 1,
              "name": "API Development",
              "levels": [
                  {
                      "id": 1,
                      "levelNumber": 1,
                      "name": "Basic"
                  }, {
                      "id": 2,
                      "levelNumber": 2,
                      "name": "Intermediate"
                  }, {
                      "id": 3,
                      "levelNumber": 3,
                      "name": "Advanced"
                  }
              ]
          }, {
              "id": 2,
              "name": "Typescript",
              "levels": [
                  {
                      "id": 4,
                      "levelNumber": 1,
                      "name": "Basic"
                  }, {
                      "id": 5,
                      "levelNumber": 2,
                      "name": "Intermediate"
                  }, {
                      "id": 6,
                      "levelNumber": 3,
                      "name": "Advanced"
                  }
              ]
          }, {
              "id": 3,
              "name": "Backend engineering",
              "levels": [
                  {
                      "id": 7,
                      "levelNumber": 1,
                      "name": "Basic"
                  }, {
                      "id": 8,
                      "levelNumber": 2,
                      "name": "Intermediate"
                  }, {
                      "id": 9,
                      "levelNumber": 3,
                      "name": "Advanced"
                  }
              ]
          }
      ]),
        author: "Stephen Grider",
        startDate: new Date("2023-05-01").toISOString(),
        endDate: new Date("2024-07-01").toISOString(),
        verificationStatus: CourseVerificationStatus.ACCEPTED,
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440051",
        providerId: provider1.id,
        title: "Graphic Design Masterclass",
        description: "The Ultimate Graphic Design Course Which Covers Photoshop, Illustrator, InDesign, Design Theory, Branding & Logo Design",
        courseLink: "https://www.udemy.com/course/graphic-design-masterclass-everything-you-need-to-know/",
        imageLink: "https://www.unite.ai/wp-content/uploads/2023/05/emily-bernal-v9vII5gV8Lw-unsplash.jpg",
        credits: 5,
        language: ["en"],
        competency: JSON.stringify([{
              "id": 1,
              "name": "Photoshop",
              "levels": [{
                      "id": 2,
                      "levelNumber": 2,
                      "name": "Intermediate"
                  }, {
                      "id": 3,
                      "levelNumber": 3,
                      "name": "Advanced"
                  }
              ]
          }, {
              "id": 2,
              "name": "Understanding brand",
              "levels": [
                  {
                      "id": 4,
                      "levelNumber": 1,
                      "name": "Basic"
                  }
              ]
          }
      ]),
        author: "Lindsay Marsh",
        startDate: new Date("2023-05-01").toISOString(),
        endDate: new Date("2024-09-01").toISOString(),
        verificationStatus: CourseVerificationStatus.ACCEPTED,
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440052",
        providerId: provider1.id,
        title: "Python for Data Science",
        description: "Learn how to use NumPy, Pandas, Seaborn , Matplotlib , Plotly , Scikit-Learn , Machine Learning, Tensorflow , and more",
        courseLink: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        imageLink: "https://blog.imarticus.org/wp-content/uploads/2021/12/learn-Python-for-data-science.jpg",
        credits: 2,
        language: ["en"],
        competency: JSON.stringify([{
          "id": 1,
          "name": "Statistics",
          "levels": [
              {
                  "id": 1,
                  "levelNumber": 1,
                  "name": "Basic"
              }
          ]
      }, {
          "id": 2,
          "name": "Machine Learning",
          "levels": [
              {
                  "id": 4,
                  "levelNumber": 1,
                  "name": "Basic"
              }, {
                  "id": 5,
                  "levelNumber": 2,
                  "name": "Intermediate"
              }, {
                  "id": 6,
                  "levelNumber": 3,
                  "name": "Advanced"
              }
          ]
      }, {
          "id": 3,
          "name": "MySQL",
          "levels": [{
                  "id": 7,
                  "levelNumber": 1,
                  "name": "Basic"
          }]
      }
  ]),
        author: "Jose Portilla",
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440053",
        providerId: response.id,
        title: "Microsoft Excel",
        description: "Excel with this A-Z Microsoft Excel Course. Microsoft Excel 2010, 2013, 2016, Excel 2019 and Microsoft/Office 365/2023",
        courseLink: "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/",
        imageLink: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microsoft_Excel_2013-2019_logo.svg/587px-Microsoft_Excel_2013-2019_logo.svg.png",
        credits: 4,
        language: ["en"],
        competency: JSON.stringify([{
          "id": 1,
          "name": "Excel",
          "levels": [
              {
                  "id": 1,
                  "levelNumber": 1,
                  "name": "Basic"
              }, {
                "id": 5,
                "levelNumber": 2,
                "name": "Intermediate"
            }, {
                "id": 6,
                "levelNumber": 3,
                "name": "Advanced"
            }, {
              "id": 9,
              "levelNumber": 4,
              "name": "Export"
          }
          ]
      }]),
        author: "Kyle Pew",
        startDate: new Date("2024-05-01").toISOString(),
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440054",
        providerId: provider1.id,
        title: "Learn DevOps & Kubernetes",
        description: "This course enables anyone to get started with devops engineering.",
        courseLink: "https://www.udemy.com/course/devops-with-docker-kubernetes-and-azure-devops/",
        imageLink: "https://img-c.udemycdn.com/course/240x135/5030480_b416_2.jpg",
        credits: 120,
        language: ["english", "hindi"],
        competency: JSON.stringify([{
              "id": 1,
              "name": "Docker",
              "levels": [
                  {
                      "id": 1,
                      "levelNumber": 1,
                      "name": "Basic"
                  }, {
                    "id": 6,
                    "levelNumber": 3,
                    "name": "Advanced"
                }
              ]
          }, {
              "id": 2,
              "name": "Kubernetes",
              "levels": [
                  {
                      "id": 4,
                      "levelNumber": 1,
                      "name": "Basic"
                  }, {
                      "id": 5,
                      "levelNumber": 2,
                      "name": "Intermediate"
                  }
              ]
          }, {
              "id": 3,
              "name": "Orchestration",
              "levels": [{
                      "id": 7,
                      "levelNumber": 2,
                      "name": "Intermediate"
              }]
          }, {
              "id": 4,
              "name": "Micro Architecture",
              "levels": [{
                      "id": 7,
                      "levelNumber": 1,
                      "name": "Basic"
              }]
          }
        ]),
        author: "Jason Frig",
        startDate: new Date("2023-06-01"),
        endDate: new Date("2024-08-01"),
        avgRating: 3.9,
        verificationStatus: CourseVerificationStatus.ACCEPTED,
        cqfScore: 10,
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440055",
        providerId: provider1.id,
        title: "Introduction to Programming",
        description: "This course covers all the fundamentals of programming",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imageLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        language: ["english", "hindi"],
        avgRating: 3.5,
        competency: JSON.stringify([{
          "id": 1,
          "name": "Logical Thinking",
          "levels": [
              {
                  "id": 1,
                  "levelNumber": 1,
                  "name": "Basic"
              }, {
                "id": 6,
                "levelNumber": 3,
                "name": "Advanced"
            }
          ]
      }, {
          "id": 2,
          "name": "Python",
          "levels": [
              {
                  "id": 4,
                  "levelNumber": 1,
                  "name": "Basic"
              }, {
                  "id": 5,
                  "levelNumber": 2,
                  "name": "Intermediate"
              }
          ]
      }]),
        author: "James Franco",
        verificationStatus: CourseVerificationStatus.PENDING,
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440056",
        providerId: provider1.id,
        title: "Introduction to Compiler Engineering",
        description: "This course covers how compilers are built and also teaches you about how to create custom programming languages",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imageLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        language: ["english", "hindi"],
        competency: JSON.stringify([{
            "id": 1,
            "name": "Compiler Design",
            "levels": [
                {
                    "id": 1,
                    "levelNumber": 2,
                    "name": "Intermediate"
                }, {
                  "id": 6,
                  "levelNumber": 3,
                  "name": "Advanced"
              }
            ]
        }, {
            "id": 2,
            "name": "LLVM",
            "levels": [
                {
                    "id": 4,
                    "levelNumber": 4,
                    "name": "Expert"
                }
            ]
        }]),
        author: "Ramakrishna Upadrasta",
        startDate: new Date("2023-10-10"),
        endDate: new Date("2023-11-10"),
        verificationStatus: CourseVerificationStatus.REJECTED,
        rejectionReason: "Level associated with LLVM is wrong"
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440057",
        providerId: provider1.id,
        title: "Introduction to Compiler Engineering 2",
        description: "This course covers how compilers are built and also teaches you about how to create custom programming languages",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imageLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        language: ["english", "hindi"],
        competency: JSON.stringify([{
          "id": 1,
          "name": "Compiler Design",
          "levels": [
              {
                  "id": 1,
                  "levelNumber": 2,
                  "name": "Intermediate"
              }, {
                "id": 6,
                "levelNumber": 3,
                "name": "Advanced"
            }
          ]
      }, {
          "id": 2,
          "name": "LLVM",
          "levels": [
              {
                  "id": 4,
                  "levelNumber": 4,
                  "name": "Expert"
              }
          ]
      }]),
        author: "Ramakrishna Upadrasta",
        startDate: new Date("2023-10-10"),
        endDate: new Date("2023-11-10"),
        rejectionReason: "Level associated with LLVM is wrong",
        status: CourseStatus.ARCHIVED
    }]
  })
  const hashedPassword1 = await bcrypt.hash("asdfghjkl", saltRounds);
  const admin = await prisma.admin.create({
    data: {
        name: "Sanchit Uke",
        email: "sanchit@esmagico.in",
        password: hashedPassword1,
        image: "https://avatars.githubusercontent.com/u/46641520?v=4",
        id: "123e4567-e89b-42d3-a456-556642440020",
    }
  });

  const admin1 = await prisma.admin.create({
    data: {
      name: 'admin1',
      email: "admin1@gmail.com",
      image: "https://avatars.githubusercontent.com/u/46641520?v=4",
      password: hashedPassword,
      id: "123e4567-e89b-42d3-a456-556642440021",
    },
  });

  // const resp = await prisma.course.findMany({});
  // console.log("All courses: ", resp);
  const response3 = await prisma.userCourse.createMany({
    data: [{
      userId: "4d45a9e9-4a4d-4c92-aaea-7b5abbd6ff98",
      feedback: "Great course",
      rating: 4,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440050"
    }, {
      userId: "4d45a9e9-4a4d-4c92-aaea-7b5abbd6ff98",
      courseId: "123e4567-e89b-42d3-a456-556642440051",
      status: CourseProgressStatus.COMPLETED,
    }, {
      userId: "abaa7220-5d2e-4e05-842a-95b2c4ce1876",
      feedback: "Instructor is very friendly",
      rating: 4,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440050"
    }, {
      userId: "abaa7220-5d2e-4e05-842a-95b2c4ce1876",
      courseId: "123e4567-e89b-42d3-a456-556642440051"
    }, {
      userId: "abaa7220-5d2e-4e05-842a-95b2c4ce1876",
      feedback: "Some more real world applications could be discussed",
      rating: 3,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440052"
    }, {
      userId: "0f5d0b13-8d72-46c9-a7c4-c1f7e5aa1f17",
      feedback: "Not satisfied with the content",
      rating: 2,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440052"
    }]
  })
  console.log(response)
  console.log({ response1, response3, admin1, provider1, provider2, provider3, admin });

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
