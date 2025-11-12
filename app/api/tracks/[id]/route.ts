import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type TrackRouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  context: TrackRouteContext
) {
  try {
    const { id } = await context.params
    const track = await prisma.tracks.findFirst({
      where: {
        id,
      },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(track)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: TrackRouteContext
) {
  try {
    const { id } = await context.params

    // Deletion disabled until auth-free ownership model defined.
    return NextResponse.json(
      { error: `Deletion disabled for track ${id} (auth removed).` },
      { status: 501 }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
