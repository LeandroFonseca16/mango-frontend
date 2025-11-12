import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type TrendEntry = Awaited<ReturnType<typeof prisma.trends.findMany>>[number]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where = category && category !== 'all' ? { category } : {}

    const trends = await prisma.trends.findMany({
      where,
      orderBy: [
        { viewCount: 'desc' },
        { videoCount: 'desc' },
      ],
      take: 50,
    })

  const serialized = trends.map((trend: TrendEntry) => ({
      ...trend,
      viewCount: Number(trend.viewCount), 
      createdAt: trend.createdAt.toISOString(),
      updatedAt: trend.updatedAt.toISOString(),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('Erro ao buscar trends:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar trends' },
      { status: 500 } 
    )
  }
}
