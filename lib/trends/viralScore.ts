import type { TrendPlatform } from '@prisma/client'

export type ViralScoreInput = {
  views?: number | null
  likes?: number | null
  comments?: number | null
  shares?: number | null
  durationSec?: number | null
  isInstrumentalCandidate?: boolean
  platform?: TrendPlatform
}

/**
 * Simple heuristic to score how promising a trend is.
 * We combine reach (views), engagement (likes/comments/shares) and
 * platform-specific multipliers, plus a bonus for instrumental-friendly clips.
 */
export function calculateViralScore(input: ViralScoreInput): number {
  const views = Math.max(0, input.views ?? 0)
  const likes = Math.max(0, input.likes ?? 0)
  const comments = Math.max(0, input.comments ?? 0)
  const shares = Math.max(0, input.shares ?? 0)
  const duration = input.durationSec ?? null

  const reachScore = Math.log10(views + 1) * 40

  const engagementWeight = views > 0 ? ((likes * 1.5) + (comments * 3) + (shares * 4)) / views : 0
  const engagementScore = clamp(engagementWeight * 100, 0, 50)

  let durationScore = 0
  if (duration) {
    if (duration >= 12 && duration <= 25) {
      durationScore = 6
    } else if (duration > 35) {
      durationScore = -4
    }
  }

  const simplicityBonus = input.isInstrumentalCandidate ? 12 : 0

  const platformMultiplier = input.platform === 'TIKTOK' ? 1.05 : 1

  const rawScore = (reachScore + engagementScore + durationScore + simplicityBonus) * platformMultiplier

  return Number(rawScore.toFixed(2))
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
