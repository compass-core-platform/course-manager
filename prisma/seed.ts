import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {

  const response = await prisma.provider.create({
    data: {
        name: "provider 1",
        email: "provider1@xyz.com",
        password: "abc",
        wallet: {
            create: {
                type: 'provider',
            }
        }
    }
  })

  const response1 = await prisma.course.createMany({
    data: [{
        providerId: response.id,
        title: "course1",
        description: "course1",
        courseLink: "abc1",
        imgLink: "qwe1",
        credits: 4,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "abcd1",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }, {
        providerId: response.id,
        title: "course2",
        description: "course2",
        courseLink: "abc2",
        imgLink: "qwe2",
        credits: 5,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "abcd2",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }, {
        providerId: response.id,
        title: "course3",
        description: "course3",
        courseLink: "abc3",
        imgLink: "qwe3",
        credits: 2,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "abcd3",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }, {
        providerId: response.id,
        title: "course4",
        description: "course4",
        courseLink: "abc4",
        imgLink: "qwe4",
        credits: 4,
        noOfLessons: 3,
        language: ["en"],
        duration: 4,
        competency: [],
        author: "abcd4",
        status: "active",
        availabilityTime: new Date("2024-05-01").toISOString()
    }]
  })

  const response3 = await prisma.userCourse.createMany({
    data: [{
      userId: "xyz1",
      feedback: "sample feedback 1",
      rating: 2,
      courseId: 1
    }, {
      userId: "xyz2",
      feedback: "sample feedback 2",
      rating: 4,
      courseId: 2
    }, {
      userId: "xyz3",
      feedback: "sample feedback 3",
      rating: 3,
      courseId: 2
    }, {
      userId: "xyz4",
      feedback: "sample feedback 4",
      rating: 3,
      courseId: 3
    }]
  })
  console.log(response)
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })