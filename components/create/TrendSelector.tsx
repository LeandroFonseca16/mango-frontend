'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/Card'
import { TrendingUp, ExternalLink, Music, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Trend {
  id: string
  platform: 'TIKTOK' | 'YOUTUBE_SHORTS'
  sourceUrl: string
  title: string
  caption: string
  viralScore: number
  features: {
    bpm: number | null
    musicalKey: string | null
    energy: number | null
  } | null
}

interface TrendSelectorProps {
  selectedTrendId?: string
  onSelectTrend: (trendId: string) => void
}

export function TrendSelector({ selectedTrendId, onSelectTrend }: TrendSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: trends, isLoading } = useQuery<Trend[]>({
    queryKey: ['trends', 'top'],
    queryFn: async () => {
      const response = await fetch('/api/trends/top')
      if (!response.ok) throw new Error('Failed to load trends')
      const payload = await response.json() as { trends: Trend[] }
      return payload.trends
    },
  })

  const filteredTrends = trends?.filter(trend =>
    trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trend.caption.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const formatViralScore = (score: number) => {
    return score.toFixed(0)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search trends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            Loading trends...
          </div>
        ) : filteredTrends.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No trends found. Try adjusting your search.
          </div>
        ) : (
          filteredTrends.map((trend) => (
            <Card
              key={trend.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
                selectedTrendId === trend.id && 'border-primary shadow-lg ring-2 ring-primary/20'
              )}
              onClick={() => onSelectTrend(trend.id)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{trend.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {trend.caption}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <TrendingUp className="h-3 w-3" />
                      {formatViralScore(trend.viralScore)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {trend.platform === 'TIKTOK' ? 'TikTok' : 'YouTube'}
                    </span>
                  </div>
                </div>

                {/* Features */}
                {trend.features && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {trend.features.bpm && (
                      <div className="flex items-center gap-1">
                        <Radio className="h-3 w-3" />
                        <span>{trend.features.bpm} BPM</span>
                      </div>
                    )}
                    {trend.features.musicalKey && (
                      <div className="flex items-center gap-1">
                        <Music className="h-3 w-3" />
                        <span>{trend.features.musicalKey}</span>
                      </div>
                    )}
                    {trend.features.energy !== null && (
                      <div className="flex items-center gap-1">
                        <span>⚡ {(trend.features.energy * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Source Link */}
                <a
                  href={trend.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View source
                </a>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
