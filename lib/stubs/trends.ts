import fs from 'fs/promises'
import path from 'path'

export type SyntheticTrendFeature = {
  bpm: number
  key: string
  energy: number
  loudness: number
  spectralFlux: number
  instrument_tags: string[]
  sections: Array<{ label: string; start: number; duration: number }>
}

export type SyntheticTrendEvent = {
  id: string
  platform: string
  sourceUrl: string
  title: string
  caption: string
  hashtags: string[]
  views: number
  likes: number
  comments: number
  shares: number
  durationSec: number
  collectedAt: string
  isInstrumentalCandidate: boolean
  viralScore: number
  metadata: Record<string, unknown>
  features: SyntheticTrendFeature
}

type SyntheticFilePayload = {
  events?: SyntheticTrendEvent[]
}

const SYNTHETIC_FILE_PATH = path.join(
  process.cwd(),
  'data',
  'synthetic',
  'synthetic_trend_events.json'
)

const FALLBACK_TRENDS: SyntheticTrendEvent[] = Array.from({ length: 12 }).map((_, index) => {
  const id = `stub-trend-${index + 1}`
  return {
    id,
    platform: index % 2 === 0 ? 'TIKTOK' : 'YOUTUBE_SHORTS',
    sourceUrl: `https://example.com/trends/${id}`,
    title: `Stub Trend ${index + 1}`,
    caption: 'Synthetic trend fixture generated for local testing',
    hashtags: ['stub', 'autogen', 'trend'],
    views: 100_000 + index * 5_000,
    likes: 5_000 + index * 500,
    comments: 400 + index * 40,
    shares: 750 + index * 60,
    durationSec: 15 + (index % 3) * 3,
    collectedAt: new Date(Date.now() - index * 36_000).toISOString(),
    isInstrumentalCandidate: true,
    viralScore: Number((250 + index * 8.5).toFixed(2)),
    metadata: {
      synthetic: true,
      audioPath: `data/synthetic/audio/stub_${index + 1}.wav`,
    },
    features: {
      bpm: 90 + index,
      key: index % 2 === 0 ? 'C major' : 'A minor',
      energy: Number((0.5 + (index % 5) * 0.08).toFixed(2)),
      loudness: Number((-12 + (index % 4)).toFixed(2)),
      spectralFlux: Number((0.2 + (index % 4) * 0.05).toFixed(3)),
      instrument_tags: ['synth', 'drums', 'bass'].slice(0, 2 + (index % 2)),
      sections: [
        { label: 'intro', start: 0, duration: 4 },
        { label: 'build', start: 4, duration: 4 },
        { label: 'drop', start: 8, duration: 4 },
        { label: 'outro', start: 12, duration: 4 },
      ],
    },
  }
})

export async function loadSyntheticTrends(): Promise<SyntheticTrendEvent[]> {
  try {
    const contents = await fs.readFile(SYNTHETIC_FILE_PATH, 'utf-8')
    const payload = JSON.parse(contents) as SyntheticFilePayload
    if (!payload.events || payload.events.length === 0) {
      return FALLBACK_TRENDS
    }

    return payload.events.map((event) => ({
      ...event,
      collectedAt: event.collectedAt ?? new Date().toISOString(),
      features: {
        ...event.features,
        sections: event.features.sections ?? [],
      },
    }))
  } catch (error) {
    return FALLBACK_TRENDS
  }
}

export async function findSyntheticTrend(trendId: string): Promise<SyntheticTrendEvent | null> {
  const trends = await loadSyntheticTrends()
  return trends.find((trend) => trend.id === trendId) ?? null
}
