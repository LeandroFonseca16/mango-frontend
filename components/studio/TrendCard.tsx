'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { TrendingUp, ExternalLink, Music, Radio, Zap, Eye, Heart, MessageCircle, Share2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendCardProps {
  trend: {
    id: string
    platform: 'TIKTOK' | 'YOUTUBE_SHORTS'
    sourceUrl: string
    title: string
    caption: string
    viralScore: number
    views?: number | null
    likes?: number | null
    comments?: number | null
    shares?: number | null
    features?: {
      bpm: number | null
      musicalKey: string | null
      energy: number | null
      loudness?: number | null
    } | null
    isInstrumentalCandidate?: boolean
  }
  selected?: boolean
  onSelect?: (trendId: string) => void
  onAnalyze?: (trendId: string) => void
  compact?: boolean
}

export function TrendCard({ trend, selected, onSelect, onAnalyze, compact }: TrendCardProps) {
  const formatCount = (value: number | null | undefined) => {
    if (!value) return '—'
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
    return value.toString()
  }

  const getViralScoreColor = (score: number) => {
    if (score >= 200) return 'text-red-500'
    if (score >= 150) return 'text-orange-500'
    if (score >= 100) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg group',
        selected && 'border-primary shadow-xl ring-2 ring-primary/20',
        compact && 'hover:border-primary/50'
      )}
      onClick={() => onSelect?.(trend.id)}
    >
      <CardContent className={cn('space-y-3', compact ? 'p-4' : 'p-5')}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn('font-semibold truncate', compact ? 'text-sm' : 'text-base')}>
              {trend.title}
            </h4>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {trend.caption}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10',
              getViralScoreColor(trend.viralScore)
            )}>
              <TrendingUp className="h-3 w-3" />
              {trend.viralScore.toFixed(0)}
            </span>
            <span className="text-xs text-muted-foreground">
              {trend.platform === 'TIKTOK' ? 'TikTok' : 'YouTube'}
            </span>
          </div>
        </div>

        {/* Music Features */}
        {trend.features && !compact && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {trend.features.bpm && (
              <div className="flex items-center gap-1">
                <Radio className="h-3 w-3" />
                <span className="font-medium">{trend.features.bpm} BPM</span>
              </div>
            )}
            {trend.features.musicalKey && (
              <div className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                <span className="font-medium">{trend.features.musicalKey}</span>
              </div>
            )}
            {trend.features.energy !== null && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span className="font-medium">{(trend.features.energy * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Engagement Stats */}
        {!compact && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/50">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{formatCount(trend.views)}</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/50">
              <Heart className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{formatCount(trend.likes)}</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/50">
              <MessageCircle className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{formatCount(trend.comments)}</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded bg-muted/50">
              <Share2 className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{formatCount(trend.shares)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <a
            href={trend.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Ver original
          </a>
          
          {trend.isInstrumentalCandidate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 ml-auto">
              <Check className="h-3 w-3" />
              Instrumental
            </span>
          )}
          
          {onAnalyze && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAnalyze(trend.id)
              }}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Analisar
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
