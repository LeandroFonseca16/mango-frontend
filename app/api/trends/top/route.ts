import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { loadSyntheticTrends } from '@/lib/stubs/trends'

type PrismaTrendEvent = Awaited<ReturnType<typeof fetchTopTrends>>[number]

async function fetchTopTrends() {
  return prisma.trend_events.findMany({
    orderBy: [
      { viralScore: 'desc' },
      { collectedAt: 'desc' },
    ],
    take: 20,
    include: {
      features: true,
    },
  })
}

export async function GET() {
  try {
    const synthetic = await loadSyntheticTrends()
    let trends: Array<Record<string, unknown>> = []

    try {
      const fromDb = await fetchTopTrends()
      if (fromDb.length >= 10) {
        trends = fromDb.map(serializePrismaTrend)
      }
    } catch (dbError) {
      console.warn('⚠️ Falling back to synthetic trends (database unavailable)', dbError)
    }

    if (trends.length < 10) {
      trends = synthetic
        .sort((a, b) => b.viralScore - a.viralScore)
        .slice(0, 10)
        .map((trend) => ({
          id: trend.id,
          platform: trend.platform,
          sourceUrl: trend.sourceUrl,
          title: trend.title,
          caption: trend.caption,
          hashtags: trend.hashtags,
          views: trend.views,
          likes: trend.likes,
          comments: trend.comments,
          shares: trend.shares,
          durationSec: trend.durationSec,
          viralScore: trend.viralScore,
          collectedAt: trend.collectedAt,
          isInstrumentalCandidate: trend.isInstrumentalCandidate,
          features: {
            status: 'COMPLETED',
            bpm: trend.features.bpm,
            musicalKey: trend.features.key,
            energy: trend.features.energy,
            loudness: trend.features.loudness,
            spectralFlux: trend.features.spectralFlux,
            instrumentTags: trend.features.instrument_tags,
            sections: trend.features.sections,
          },
        }))
    }

    return NextResponse.json({ trends })
  } catch (error) {
    console.error('Erro ao carregar trends promissoras:', error)
    return NextResponse.json({ error: 'Erro ao carregar trends promissoras' }, { status: 500 })
  }
}

function serializePrismaTrend(event: PrismaTrendEvent) {
  return {
    id: event.id,
    platform: event.platform,
    sourceUrl: event.sourceUrl,
    title: event.title,
    caption: event.caption,
    hashtags: event.hashtags,
    views: event.views != null ? Number(event.views) : null,
    likes: event.likes != null ? Number(event.likes) : null,
    comments: event.comments != null ? Number(event.comments) : null,
    shares: event.shares != null ? Number(event.shares) : null,
    durationSec: event.durationSec,
    viralScore: event.viralScore,
    collectedAt: event.collectedAt.toISOString(),
    isInstrumentalCandidate: event.isInstrumentalCandidate,
    features: event.features
      ? {
          status: event.features.status,
          bpm: event.features.bpm,
          musicalKey: event.features.musicalKey,
          energy: event.features.energy,
          loudness: event.features.loudness,
          spectralFlux: event.features.spectralFlux,
          instrumentTags: [],
          sections: [],
        }
      : null,
  }
}
