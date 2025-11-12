import { NextResponse } from 'next/server'
import { loadSyntheticTrends } from '@/lib/stubs/trends'

type WorkflowStage =
  | 'crawling'
  | 'analyzing'
  | 'extracting_features'
  | 'generating'
  | 'checking_originality'
  | 'publishing'
  | 'tracking_analytics'
  | 'completed'

export async function POST(request: Request) {
  const body = await parseBody(request)
  const trendUrl = body.trendUrl ?? 'https://example.com/trending/stub'

  const synthetic = await loadSyntheticTrends()
  const selectedTrend = synthetic[0]
  const runId = `workflow-${Date.now()}`

  const stages = buildStages(runId, selectedTrend, trendUrl)

  return NextResponse.json({
    runId,
    status: 'completed',
    totalDurationMs: 8420,
    trend: {
      id: selectedTrend.id,
      platform: selectedTrend.platform,
      sourceUrl: trendUrl,
      title: selectedTrend.title,
      caption: selectedTrend.caption,
      viralScore: selectedTrend.viralScore,
    },
    stages,
    outputs: {
      generatedAudioUrl: `/stubs/output/${selectedTrend.id}.wav`,
      publishLinks: {
        tiktok: `https://tiktok.com/@mangobeat/video/${runId}`,
        youtube: `https://youtube.com/shorts/${runId}`,
        instagram: `https://instagram.com/p/${runId}`,
      },
      analyticsUrl: `/api/analytics/track?trackId=${selectedTrend.id}`,
    },
  })
}

function buildStages(runId: string, trend: any, trendUrl: string) {
  const now = Date.now()
  return [
    {
      stage: 'crawling' as WorkflowStage,
      status: 'completed',
      startedAt: new Date(now - 8000).toISOString(),
      completedAt: new Date(now - 7200).toISOString(),
      durationMs: 800,
      output: {
        discoveredTrends: 20,
        selectedTrendId: trend.id,
        sourceUrl: trendUrl,
      },
    },
    {
      stage: 'analyzing' as WorkflowStage,
      status: 'completed',
      startedAt: new Date(now - 7200).toISOString(),
      completedAt: new Date(now - 6500).toISOString(),
      durationMs: 700,
      output: {
        viralScore: trend.viralScore,
        isInstrumental: trend.isInstrumentalCandidate,
        predictedEngagement: 'high',
      },
    },
    {
      stage: 'extracting_features' as WorkflowStage,
      status: 'completed',
      startedAt: new Date(now - 6500).toISOString(),
      completedAt: new Date(now - 5200).toISOString(),
      durationMs: 1300,
      output: {
        bpm: trend.features.bpm,
        key: trend.features.key,
        energy: trend.features.energy,
        loudness: trend.features.loudness,
        spectralFlux: trend.features.spectralFlux,
        instrumentTags: trend.features.instrument_tags,
        sections: trend.features.sections,
      },
    },
    {
      stage: 'generating' as WorkflowStage,
      status: 'completed',
      startedAt: new Date(now - 5200).toISOString(),
      completedAt: new Date(now - 2000).toISOString(),
      durationMs: 3200,
      output: {
        model: 'stub-diffusion-v1',
        prompt: `Generate a high-energy loop inspired by ${trend.title}`,
        loopDurationSec: 15,
        audioUrl: `/stubs/output/${trend.id}.wav`,
        seed: Math.floor(Math.random() * 1_000_000),
      },
    },
    {
      stage: 'checking_originality' as WorkflowStage,
      status: 'completed',
      startedAt: new Date(now - 2000).toISOString(),
      completedAt: new Date(now - 1400).toISOString(),
      durationMs: 600,
      output: {
        originalityScore: 0.91,
        threshold: 0.85,
        passed: true,
        checkedAgainst: trend.sourceUrl,
      },
    },
    {
      stage: 'publishing' as WorkflowStage,
      status: 'completed',
      startedAt: new Date(now - 1400).toISOString(),
      completedAt: new Date(now - 600).toISOString(),
      durationMs: 800,
      output: {
        platforms: ['tiktok', 'youtube', 'instagram'],
        publishIds: {
          tiktok: `publish-tiktok-${runId}`,
          youtube: `publish-youtube-${runId}`,
          instagram: `publish-instagram-${runId}`,
        },
        metadata: {
          title: 'AI generated loop ready for socials',
          hashtags: ['#ai', '#autogen', '#trending'],
        },
      },
    },
    {
      stage: 'tracking_analytics' as WorkflowStage,
      status: 'completed',
      startedAt: new Date(now - 600).toISOString(),
      completedAt: new Date(now - 20).toISOString(),
      durationMs: 580,
      output: {
        initialViews: 320,
        viralScoreDelta: +2.5,
        reinforcementReward: 0.68,
      },
    },
  ]
}

async function parseBody(request: Request) {
  try {
    return await request.json()
  } catch (error) {
    return {}
  }
}
