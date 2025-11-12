import { NextResponse } from 'next/server'
import { findSyntheticTrend } from '@/lib/stubs/trends'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackId = searchParams.get('trackId')

  if (!trackId) {
    return NextResponse.json({ error: 'trackId query parameter is required' }, { status: 400 })
  }

  const trend = await findSyntheticTrend(trackId)
  const baseViralScore = trend?.viralScore ?? 250
  const adjustment = Number((Math.random() * 12 - 4).toFixed(2))

  return NextResponse.json({
    trackId,
    trendSource: trend?.sourceUrl ?? null,
    analytics: {
      views: trend?.views ? Math.round(trend.views * 1.35) : 320_000,
      likes: trend?.likes ? Math.round(trend.likes * 1.4) : 18_500,
      comments: trend?.comments ? Math.round(trend.comments * 1.32) : 1_240,
      shares: trend?.shares ? Math.round(trend.shares * 1.5) : 4_650,
      completionRate: Number((0.35 + Math.random() * 0.25).toFixed(2)),
      retentionCurve: [
        { second: 0, rate: 1.0 },
        { second: 5, rate: 0.82 },
        { second: 10, rate: 0.68 },
        { second: 15, rate: 0.61 },
        { second: 20, rate: 0.55 },
      ],
    },
    viralScore: {
      previous: baseViralScore,
      delta: adjustment,
      updated: Number((baseViralScore + adjustment).toFixed(2)),
      updatedAt: new Date().toISOString(),
    },
    reinforcementLearning: {
      algorithm: 'epsilon-greedy-bandit',
      epsilon: 0.2,
      chosenVariant: 'high-energy-hook',
      reward: Number((0.6 + Math.random() * 0.3).toFixed(2)),
      notes: 'Stub analytics response. Replace with live dashboard integration.',
    },
  })
}
