import { Logger } from '@nestjs/common';
import { CourseProgressStatus, CourseStatus, CourseVerificationStatus, Prisma, PrismaClient, ProviderStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt';
import * as fs from "fs";
import { createViewQueries } from "./scripts/createViewQueries";
import { copyViewQueries } from "./scripts/moveViewsQueries"
const prisma = new PrismaClient();
const { Client } = require('pg');
const telemetryDbName = process.env.TELEMETRY_DATABASE_NAME;

async function seed() {
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash("Dilu@123", saltRounds);
  const hashedPassword1 = await bcrypt.hash("Favas@456", saltRounds);
  const hashedPassword2 = await bcrypt.hash("Udemy@9812", saltRounds);
  const hashedPassword3 = await bcrypt.hash("Coursera@999", saltRounds);
  const hashedPassword4 = await bcrypt.hash("lern@999", saltRounds);
  const provider = await prisma.provider.create({
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
        title: "Comprehensive Floor Inspection Techniques",
        description: "Develop skills for thorough and accurate floor inspections.",
        courseLink: "https://www.udemy.com/course/nestjs-the-complete-developers-guide/",
        imageLink: "https://courses.nestjs.com/img/logo.svg",
        credits: 4,
        language: ["en"],
        competency: JSON.stringify([{
            "id": 1,
            "name": "Floor Planning and Mapping",
            "levels": [
              {
                "levelNumber": 2,
                "name": "Level 2",
                "id": 2
              },
              {
                "levelNumber": 3,
                "name": "Level 3",
                "id": 3
              }
            ]
          }, {
            "id": 8,
            "name": "Floor Inspection",
            "levels": [
              {
                 "levelNumber": 1,
                 "name": "Level 1",
                 "id": 1
              },
              {
                  "levelNumber": 2,
                  "name": "Level 2",
                  "id": 2
              },
              {
                  "levelNumber": 3,
                  "name": "Level 3",
                  "id": 3
              }
            ]
          }, {
            "id": 7,
            "name": "Survey",
            "levels": null
          }
      ]),
        author: "Stephen Grider",
        startDate: new Date("2023-05-01").toISOString(),
        endDate: new Date("2024-07-01").toISOString(),
        verificationStatus: CourseVerificationStatus.ACCEPTED,
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440051",
        providerId: provider1.id,
        title: "Advanced Floor Planning and Inspection",
        description: "Master the skills of creating detailed floor plans and conducting thorough floor inspections.",
        courseLink: "https://www.udemy.com/course/graphic-design-masterclass-everything-you-need-to-know/",
        imageLink: "https://www.unite.ai/wp-content/uploads/2023/05/emily-bernal-v9vII5gV8Lw-unsplash.jpg",
        credits: 5,
        language: ["en"],
        competency: JSON.stringify([{
            "id": 8,
            "name": "Floor Inspection",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 1,
            "name": "Floor Planning and Mapping",
            "levels": [
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
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
        title: "Strategic Coverage and Survey Techniques",
        description: "Learn to plan effective surveillance coverage and conduct comprehensive site surveys.",
        courseLink: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
        imageLink: "https://blog.imarticus.org/wp-content/uploads/2021/12/learn-Python-for-data-science.jpg",
        credits: 2,
        language: ["en"],
        competency: JSON.stringify([{
            "id": 2,
            "name": "Coverage and surveillance",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 7,
            "name": "Survey",
            "levels": null
        }

  ]),
        author: "Jose Portilla",
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440053",
        providerId: provider.id,
        title: "Earth Core and Land Assessment Essentials",
        description: "Understand the core concepts of earth cutting and digging along with documenting land assessments.",
        courseLink: "https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/",
        imageLink: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microsoft_Excel_2013-2019_logo.svg/587px-Microsoft_Excel_2013-2019_logo.svg.png",
        credits: 4,
        language: ["en"],
        competency: JSON.stringify([{
            "id": 3,
            "name": "Earth core concepts",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 4,
            "name": "Assessment Documentations",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }]),
        author: "Kyle Pew",
        startDate: new Date("2024-05-01").toISOString(),
    }, {
        courseId: "123e4567-e89b-42d3-a456-556642440054",
        providerId: provider1.id,
        title: "Comprehensive Spatial and Interior Design",
        description: "Gain holistic spatial insight and learn to design visually pleasing and functional interior spaces.",
        courseLink: "https://www.udemy.com/course/devops-with-docker-kubernetes-and-azure-devops/",
        imageLink: "https://img-c.udemycdn.com/course/240x135/5030480_b416_2.jpg",
        credits: 120,
        language: ["english", "hindi"],
        competency: JSON.stringify([{
            "id": 19,
            "name": "Comprehensive Spatial Insight",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 23,
            "name": "Interior Engineering",
            "levels": [
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
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
        title: "Integrated Survey and Documentation Mastery",
        description: "Develop expertise in site surveying and documenting assessments for land evaluation.",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imageLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        language: ["english", "hindi"],
        avgRating: 3.5,
        competency: JSON.stringify([{
            "id": 4,
            "name": "Assessment Documentations",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 2,
            "name": "Coverage and surveillance",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 7,
            "name": "Survey",
            "levels": null
        }]),
        author: "James Franco",
        verificationStatus: CourseVerificationStatus.PENDING,
    }, 
    {
        courseId: "999e4567-e89b-42d3-a456-556642440055",
        providerId: provider1.id,
        title: "Architecture",
        description: "This course covers all the fundamentals needed for building aesthetic architectures",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imageLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        language: ["english", "hindi"],
        avgRating: 3.5,
        competency: JSON.stringify([{
          "id": 1,
          "name": "Floor Planning and Mapping",
          "levels": [
              {
                  "id": 2,
                  "levelNumber": 2,
                  "name": "Level 2"
              }, {
                "id": 3,
                "levelNumber": 3,
                "name": "Level 3"
            }
          ]
      }, {
          "id": 3,
          "name": "Earth core concepts",
          "levels": [
              {
                  "id": 1,
                  "levelNumber": 1,
                  "name": "Level 1"
              }, {
                  "id": 2,
                  "levelNumber": 2,
                  "name": "Level 2"
              },  {
                "id": 3,
                "levelNumber": 3,
                "name": "Level 3"
            }
          ]
      }]),
        author: "James Franco",
        verificationStatus: CourseVerificationStatus.ACCEPTED,
    },
    {
        courseId: "123e4567-e89b-42d3-a456-556642440056",
        providerId: provider1.id,
        title: "Holistic Site and Interior Planning",
        description: "Master site surveys, floor planning, and interior engineering to create functional and visually appealing spaces.",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imageLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        language: ["english", "hindi"],
        competency: JSON.stringify([{
            "id": 7,
            "name": "Survey",
            "levels": null
        }, {
            "id": 1,
            "name": "Floor Planning and Mapping",
            "levels": [
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 23,
            "name": "Interior Engineering",
            "levels": [
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
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
        title: "Complete Earth Core and Spatial Engineering",
        description: "Learn the fundamentals of earth core concepts, floor inspection, and achieve absolute clarity in spatial and structural planning.",
        courseLink: "https://udemy.com/courses/jQKsLpm",
        imageLink: "https://udemy.com/courses/jQKsLpm/images/cover2.jpg",
        credits: 160,
        language: ["english", "hindi"],
        competency: JSON.stringify([{
            "id": 3,
            "name": "Earth core concepts",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 8,
            "name": "Floor Inspection",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
                }
            ]
        }, {
            "id": 19,
            "name": "Comprehensive Spatial Insight",
            "levels": [
                {
                    "levelNumber": 1,
                    "name": "Level 1",
                    "id": 1
                },
                {
                    "levelNumber": 2,
                    "name": "Level 2",
                    "id": 2
                },
                {
                    "levelNumber": 3,
                    "name": "Level 3",
                    "id": 3
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
  
  const admin = await prisma.admin.create({
    data: {
        name: "dilu",
        email: "dilu@yopmail.com",
        password: hashedPassword,
        image: "https://avatars.githubusercontent.com/u/46641520?v=4",
        id: "87fd80a9-63e9-4e90-81bb-4b6956c2561b",
    }
  });

  const admin1 = await prisma.admin.create({
    data: {
      name: 'favas',
      email: "favas@yopmail.com",
      image: "https://avatars.githubusercontent.com/u/46641520?v=4",
      password: hashedPassword1,
      id: "890f2839-866f-4524-9eac-bebe0d35d607",
    },
  });

  // const resp = await prisma.course.findMany({});
  // console.log("All courses: ", resp);
  const response3 = await prisma.userCourse.createMany({
    data: [{
      userId: "9f4611d4-ab92-4acd-b3ce-13594e362eca",
      feedback: "Great course",
      rating: 4,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440050"
    }, {
      userId: "9f4611d4-ab92-4acd-b3ce-13594e362eca",
      courseId: "123e4567-e89b-42d3-a456-556642440051",
      status: CourseProgressStatus.COMPLETED,
    }, {
      userId: "836ba369-fc24-4464-95ec-505d61b67ef0",
      feedback: "Instructor is very friendly",
      rating: 4,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440050"
    }, {
      userId: "836ba369-fc24-4464-95ec-505d61b67ef0",
      courseId: "123e4567-e89b-42d3-a456-556642440051"
    }, {
      userId: "836ba369-fc24-4464-95ec-505d61b67ef0",
      feedback: "Some more real world applications could be discussed",
      rating: 3,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440052"
    }, {
      userId: "c8a43816-5a1b-4e29-9e1f-e8ef22efc669",
      feedback: "Not satisfied with the content",
      rating: 2,
      status: CourseProgressStatus.COMPLETED,
      courseCompletionScore: 100,
      courseId: "123e4567-e89b-42d3-a456-556642440052"
    }]
  })
  console.log({ response1, response3, admin, admin1, provider, provider1, provider2, provider3 });

}

async function createViews() {
    let logger = new Logger("CreatingViews");
    logger.log(`Started creating views`);
  
    for (const sql of createViewQueries) {
      logger.log(sql);
      await prisma.$executeRaw`${Prisma.raw(sql)}`;
    }
  
    const res:any = await prisma.$queryRaw`${Prisma.raw(`SELECT datname FROM pg_database WHERE datname = '${telemetryDbName}'`)}`;
    if (res.length === 0) {
      // Create the telemetry-views database if it does not exist
      await prisma.$queryRaw`${Prisma.raw(`CREATE DATABASE "${telemetryDbName}"`)}`;
      logger.log(`Database "${telemetryDbName}" created.`);
    } else {
      logger.log(`Database "${telemetryDbName}" already exists.`);
    }
  
    logger.log(`Successfully created views`);
}

async function moveViews() {
    let logger = new Logger("MovingViews");

  const telemetryClient =  new Client({
    user: process.env.DATABASE_USERNAME,
    host: '172.17.0.1',
    database: process.env.TELEMETRY_DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: 5432,
  });

  await telemetryClient.connect();

  logger.log(copyViewQueries);

  logger.log(`Started moving views`);
  
  for (const sql of copyViewQueries) {
    logger.log(sql);
    await telemetryClient.query(sql);
  }

  await telemetryClient.end();

  logger.log(`Successfully moved views`);
  }


// execute the functions
async function main() {
  try {
    await seed();
    await createViews();
    await moveViews();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
