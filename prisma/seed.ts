import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

enum Role {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'user1', name: 'User One', password: '$2b$10$QRqib43G528vDM4wF1Ialu3X3yT2Oty0BNcciMOykjl4clWC0UK2K', role: Role.USER },
      { email: 'user2', name: 'User Two', password: '$2b$10$QRqib43G528vDM4wF1Ialu3X3yT2Oty0BNcciMOykjl4clWC0UK2K', role: Role.USER },
      { email: 'user3', name: 'User Three', password: '$2b$10$QRqib43G528vDM4wF1Ialu3X3yT2Oty0BNcciMOykjl4clWC0UK2K', role: Role.USER },
      { email: 'admin', name: 'User Four', password: '$2b$10$QRqib43G528vDM4wF1Ialu3X3yT2Oty0BNcciMOykjl4clWC0UK2K', role: Role.ADMIN },
      { email: 'moderator', name: 'User Five', password: 'pas$2b$10$QRqib43G528vDM4wF1Ialu3X3yT2Oty0BNcciMOykjl4clWC0UK2Ksword5', role: Role.MODERATOR },
    ],
  })

  const allUsers = await prisma.user.findMany()

  // Категории
  await prisma.category.createMany({
    data: [
      { name: 'Electronics' },
      { name: 'Books' },
      { name: 'Furniture' },
      { name: 'Vehicles' },
      { name: 'Clothing' },
    ],
  })

  const allCategories = await prisma.category.findMany()

  // Объявления
  const adsData = [
    {
      authorId: allUsers[0].id,
      title: 'iPhone 13 for sale',
      description: 'Almost new, black color',
      categoryId: allCategories.find((c: any) => c.name === 'Electronics')?.id,
      price: 700,
    },
    {
      authorId: allUsers[1].id,
      title: 'Fantasy book collection',
      description: '10 novels, great condition',
      categoryId: allCategories.find((c: any) => c.name === 'Books')?.id,
      price: 100,
    },
    {
      authorId: allUsers[2].id,
      title: 'Wooden dining table',
      description: 'Seats 6 people, lightly used',
      categoryId: allCategories.find((c: any) => c.name === 'Furniture')?.id,
      price: 250,
    },
    {
      authorId: allUsers[3].id,
      title: 'Used bike',
      description: 'Good condition, needs minor repair',
      categoryId: allCategories.find((c: any) => c.name === 'Vehicles')?.id,
      price: 150,
    },
    {
      authorId: allUsers[4].id,
      title: 'Winter jacket',
      description: 'Size M, warm and waterproof',
      categoryId: allCategories.find((c: any) => c.name === 'Clothing')?.id,
      price: 80,
    },
    {
      authorId: allUsers[0].id,
      title: 'Gaming laptop',
      description: '16GB RAM, RTX 3060, barely used',
      categoryId: allCategories.find((c: any) => c.name === 'Electronics')?.id,
      price: 1200,
    },
    {
      authorId: allUsers[1].id,
      title: 'Office chair',
      description: 'Ergonomic, adjustable height',
      categoryId: allCategories.find((c: any) => c.name === 'Furniture')?.id,
      price: 90,
    },
  ]

  await prisma.ad.createMany({ data: adsData })

  const allAds = await prisma.ad.findMany()

  // Отклики
  const responsesData = [
    {
      adId: allAds[0].id,
      userId: allUsers[1].id,
      message: 'Is the iPhone still available?',
    },
    {
      adId: allAds[0].id,
      userId: allUsers[2].id,
      message: 'Can you provide more photos?',
    },
    {
      adId: allAds[2].id,
      userId: allUsers[4].id,
      message: 'Is the dining table solid wood?',
    },
    {
      adId: allAds[3].id,
      userId: allUsers[0].id,
      message: 'What kind of repair does the bike need?',
    },
  ]

  await prisma.response.createMany({ data: responsesData })

  console.log('✅ Seed data successfully created.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
