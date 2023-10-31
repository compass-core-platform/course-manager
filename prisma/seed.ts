import { PrismaClient } from '@prisma/client'
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
  })

  const response1 = await prisma.course.createMany({
    data: [{
        providerId: response.id,
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
        providerId: response.id,
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
        providerId: response.id,
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