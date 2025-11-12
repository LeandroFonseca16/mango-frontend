import { NextResponse } from 'next/server'
import { findSyntheticTrend } from '@/lib/stubs/trends'

export async function POST(request: Request) {
  const body = await parseBody(request)
  const trendId: string | undefined = body.trendId

  if (!trendId) {
    return NextResponse.json({ error: 'trendId is required' }, { status: 400 })
  }

  const trend = await findSyntheticTrend(trendId)
  if (!trend) {
    return NextResponse.json({
      jobId: `features-${Date.now()}`,
      status: 'completed',
      trendId,
      features: {
        status: 'COMPLETED',
        bpm: 120,
        key: 'C major',
        energy: 0.65,
        loudness: -10.5,
        spectralFlux: 0.32,
        instrumentTags: ['synth', 'drums'],
        sections: [
          { label: 'intro', start: 0, duration: 4 },
          { label: 'drop', start: 4, duration: 8 },
        ],
      },
      warnings: ['Trend not found in synthetic dataset; returned generic fixture'],
    })
  }

  return NextResponse.json({
    jobId: `features-${Date.now()}`,
    status: 'completed',
    trendId,
    features: {
      status: 'COMPLETED',
      bpm: trend.features.bpm,
      key: trend.features.key,
      energy: trend.features.energy,
      loudness: trend.features.loudness,
      spectralFlux: trend.features.spectralFlux,
      instrumentTags: trend.features.instrument_tags,
      sections: trend.features.sections,
    },
    artifacts: {
      waveformPreview: `/stubs/waveforms/${trendId}.json`,
      extractedAt: new Date().toISOString(),
    },
  })
}

async function parseBody(request: Request) {
  try {
    return await request.json()
  } catch (error) {
    return {}
  }
}
