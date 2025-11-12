import { TrendPlatform } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { calculateViralScore } from '../../lib/trends/viralScore'

const SOURCES: ManualTrendSource[] = [
  {
    platform: TrendPlatform.TIKTOK,
    url: 'https://www.tiktok.com/@artistbeat/video/7423891200308184330',
    title: 'Phonk Drift Loop - ArtistBeat',
    caption: 'Phonk drift beat • instrumental 🔥 #phonk #drift #beat',
    hashtags: ['phonk', 'drift', 'beat'],
    fallbackMetrics: {
      views: 1450000,
      likes: 120000,
      comments: 4800,
      shares: 6200,
      durationSec: 22,
    },
    localAudioPath: 'data/trends/phonk-drift.wav',
    isInstrumentalCandidate: true,
  },
  {
    platform: TrendPlatform.TIKTOK,
    url: 'https://www.tiktok.com/@looplab/video/7394211133067418881',
    title: 'LoopLab Synthwave Pulse',
    caption: 'Synthwave loop for creators ✨ #synthwave #instrumental #loop',
    hashtags: ['synthwave', 'instrumental', 'loop'],
    fallbackMetrics: {
      views: 980000,
      likes: 86000,
      comments: 2600,
      shares: 4100,
      durationSec: 18,
    },
    localAudioPath: 'data/trends/synthwave-loop.wav',
    isInstrumentalCandidate: true,
  },
  {
    platform: TrendPlatform.YOUTUBE_SHORTS,
    url: 'https://www.youtube.com/shorts/41Uqw-ambient',
    title: 'Atmos Drift - Ambient Pads',
    caption: 'Ambient pads for viral reels // no vocals // #ambient #lofi',
    hashtags: ['ambient', 'lofi', 'pads'],
    fallbackMetrics: {
      views: 1270000,
      likes: 53000,
      comments: 1200,
      shares: 2100,
      durationSec: 24,
    },
    localAudioPath: 'data/trends/ambient-pads.wav',
    isInstrumentalCandidate: true,
  },
  {
    platform: TrendPlatform.YOUTUBE_SHORTS,
    url: 'https://www.youtube.com/shorts/beatkit-loop',
    title: 'BeatKit 808 Bounce',
    caption: 'Quick 808 bounce loop ready for trends #808 #typebeat',
    hashtags: ['808', 'typebeat', 'loop'],
    fallbackMetrics: {
      views: 870000,
      likes: 43000,
      comments: 900,
      shares: 1500,
      durationSec: 16,
    },
    localAudioPath: 'data/trends/808-bounce.wav',
    isInstrumentalCandidate: true,
  },
]

type ManualTrendSource = {
  platform: TrendPlatform
  url: string
  title: string
  caption: string
  hashtags: string[]
  fallbackMetrics: {
    views: number
    likes?: number
    comments?: number
    shares?: number
    durationSec?: number
  }
  localAudioPath: string
  isInstrumentalCandidate?: boolean
}

async function main() {
  console.log('📥 Starting trend ingestion...')
  for (const source of SOURCES) {
    const caption = source.caption.trim()
    const hashtagSet = new Set<string>([...source.hashtags.map(normalizeTag), ...extractHashtags(caption)])
    const hashtags = Array.from(hashtagSet)

    const views = source.fallbackMetrics.views
    const likes = source.fallbackMetrics.likes ?? null
    const comments = source.fallbackMetrics.comments ?? null
    const shares = source.fallbackMetrics.shares ?? null
    const durationSec = source.fallbackMetrics.durationSec ?? null

    const isInstrumental = source.isInstrumentalCandidate ?? inferInstrumental(caption)

    const viralScore = calculateViralScore({
      views,
      likes,
      comments,
      shares,
      durationSec,
      isInstrumentalCandidate: isInstrumental,
      platform: source.platform,
    })

    await prisma.trend_events.upsert({
      where: { sourceUrl: source.url },
      create: {
        platform: source.platform,
        sourceUrl: source.url,
        title: source.title,
        caption,
        hashtags,
        views: BigInt(Math.round(views)),
        likes: likes != null ? BigInt(Math.round(likes)) : null,
        comments: comments != null ? BigInt(Math.round(comments)) : null,
        shares: shares != null ? BigInt(Math.round(shares)) : null,
        durationSec,
        isInstrumentalCandidate: isInstrumental,
        viralScore,
        metadata: {
          localAudioPath: source.localAudioPath,
          fallbackMetrics: source.fallbackMetrics,
        },
      },
      update: {
        title: source.title,
        caption,
        hashtags,
        views: BigInt(Math.round(views)),
        likes: likes != null ? BigInt(Math.round(likes)) : null,
        comments: comments != null ? BigInt(Math.round(comments)) : null,
        shares: shares != null ? BigInt(Math.round(shares)) : null,
        durationSec,
        isInstrumentalCandidate: isInstrumental,
        viralScore,
        metadata: {
          localAudioPath: source.localAudioPath,
          fallbackMetrics: source.fallbackMetrics,
        },
      },
    })

    console.log(`✅ Ingested ${source.title} (${source.platform})`)
  }

  console.log('✅ Trend ingestion completed')
}

function extractHashtags(text: string): string[] {
  return (text.match(/#[0-9A-Za-z_]+/g) ?? []).map(normalizeTag)
}

function normalizeTag(tag: string): string {
  return tag.replace(/^#+/, '').toLowerCase()
}

const INSTRUMENT_KEYWORDS = ['instrumental', 'loop', 'beat', 'no vocals', 'synth', '808', 'phonk', 'lofi', 'pad', 'ambient']
const VOCAL_KEYWORDS = ['vocal', 'lyrics', 'sing', 'cover']

function inferInstrumental(caption: string): boolean {
  const lower = caption.toLowerCase()
  const hasInstrumentKeyword = INSTRUMENT_KEYWORDS.some((keyword) => lower.includes(keyword))
  const hasVocalKeyword = VOCAL_KEYWORDS.some((keyword) => lower.includes(keyword))
  return hasInstrumentKeyword && !hasVocalKeyword
}

main()
  .catch((error) => {
    console.error('❌ Trend ingestion failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
