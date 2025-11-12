import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Auth removed: return latest public tracks
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [tracks, total] = await Promise.all([
      prisma.tracks.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          audioUrl: true,
          imageUrl: true,
          genre: true,
          tags: true,
          duration: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.tracks.count(),
    ])

    return NextResponse.json({
      tracks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function POST() {
  // Track creation via API disabled until new auth-free model implemented.
  return NextResponse.json(
    { error: 'Track creation disabled (auth removed). Use the generation board.' },
    { status: 501 }
  )
}
