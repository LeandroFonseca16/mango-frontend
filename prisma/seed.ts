import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'node:crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const generatePasswordHash = (password: string) => {
    const salt = randomBytes(16).toString('hex')
    const derivedKey = scryptSync(password, salt, 32).toString('hex')
    return `${salt}:${derivedKey}`
  }

  // Criar usuário demo (hash simples com scrypt para não depender de bcrypt)
  const demoPassword = generatePasswordHash('demo123')
  
  const demoUser = await prisma.users.upsert({
    where: { email: 'demo@mangobeat.ai' },
    update: {},
    create: {
      id: 'demo-user-' + Date.now(),
      email: 'demo@mangobeat.ai',
      name: 'Demo User',
      password: demoPassword,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Criar algumas trends de exemplo
  const trendsData = [
    {
      id: 'trend-phonk-' + Date.now(),
      title: 'Phonk Drift Racing',
      hashtag: 'phonkdrift',
      category: 'phonk',
      videoCount: 25000,
      viewCount: BigInt(2500000),
      description: 'Som agressivo perfeito para vídeos de drift e corrida',
      updatedAt: new Date(),
    },
    {
      id: 'trend-lofi-' + (Date.now() + 1),
      title: 'Lo-Fi Study Beats',
      hashtag: 'lofistudy',
      category: 'music',
      videoCount: 18000,
      viewCount: BigInt(1800000),
      description: 'Batidas relaxantes para estudar e trabalhar',
      updatedAt: new Date(),
    },
    {
      id: 'trend-funk-' + (Date.now() + 2),
      title: 'Brazilian Funk Dance',
      hashtag: 'funkbr',
      category: 'dance',
      videoCount: 32000,
      viewCount: BigInt(3200000),
      description: 'Funk brasileiro para coreografias virais',
      updatedAt: new Date(),
    },
    {
      id: 'trend-trap-' + (Date.now() + 3),
      title: 'Aggressive Trap',
      hashtag: 'trapwave',
      category: 'viral',
      videoCount: 15000,
      viewCount: BigInt(1500000),
      description: 'Trap pesado para vídeos de impacto',
      updatedAt: new Date(),
    },
    {
      id: 'trend-chill-' + (Date.now() + 4),
      title: 'Chill Vibes Only',
      hashtag: 'chillvibes',
      category: 'music',
      videoCount: 9800,
      viewCount: BigInt(980000),
      description: 'Sons relaxantes para momentos tranquilos',
      updatedAt: new Date(),
    },
  ]

  for (const trend of trendsData) {
    await prisma.trends.upsert({
      where: { hashtag: trend.hashtag },
      update: {},
      create: trend,
    })
  }

  console.log(`✅ Created ${trendsData.length} trends`)

  // Criar algumas tracks de exemplo para o usuário demo
  const tracksData = [
    {
      id: 'track-phonk-' + Date.now(),
      title: 'Sunset Phonk Dreams',
      genre: 'phonk',
      status: 'COMPLETED' as any,
      audioUrl: 'https://example.com/track1.mp3',
      duration: 180,
      userId: demoUser.id,
      updatedAt: new Date(),
      tags: [],
    },
    {
      id: 'track-lofi-' + (Date.now() + 1),
      title: 'Lo-Fi Coffee Shop',
      genre: 'lofi',
      status: 'COMPLETED' as any,
      audioUrl: 'https://example.com/track2.mp3',
      duration: 240,
      userId: demoUser.id,
      updatedAt: new Date(),
      tags: [],
    },
    {
      id: 'track-trap-' + (Date.now() + 2),
      title: 'Trap Beast Mode',
      genre: 'trap',
      status: 'PROCESSING' as any,
      userId: demoUser.id,
      updatedAt: new Date(),
      tags: [],
    },
  ]

  for (const track of tracksData) {
    await prisma.tracks.create({
      data: track,
    })
  }

  console.log(`✅ Created ${tracksData.length} demo tracks`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
