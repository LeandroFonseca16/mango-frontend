'use client'

import React from 'react'
import { Music4, Sparkles, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

type DashboardUser = {
  name?: string | null
}

type DashboardStats = {
  totalTracks: number
  processing: number
  completed: number
  thisMonth: number
  remainingCredits: number
}

type DashboardTrack = {
  id: string
  title: string
  genre: string
  status: string
}

type ViralTrend = {
  id: string
  platform: 'TIKTOK' | 'YOUTUBE_SHORTS'
  sourceUrl: string
  title: string
  caption: string
  hashtags: string[]
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  durationSec: number | null
  viralScore: number
  collectedAt: string
  isInstrumentalCandidate: boolean
  features: {
    status: string
    bpm: number | null
    musicalKey: string | null
    energy: number | null
    loudness: number | null
    spectralFlux: number | null
    extractedAt: string
  } | null
}

export function DashboardContent({ user }: { user: DashboardUser }) {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas do dashboard')
      }
      return response.json() as Promise<DashboardStats>
    },
  })

  const { data: recentTracks } = useQuery<DashboardTrack[]>({
    queryKey: ['tracks', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/tracks?limit=5')
      if (!response.ok) {
        throw new Error('Falha ao carregar tracks recentes')
      }
      const payload = await response.json() as { tracks: DashboardTrack[] }
      return payload.tracks
    },
  })

  const { data: topTrends, isLoading: isLoadingTopTrends } = useQuery<ViralTrend[]>({
    queryKey: ['trends', 'top'],
    queryFn: async () => {
      const response = await fetch('/api/trends/top')
      if (!response.ok) {
        throw new Error('Falha ao carregar tendências virais')
      }
      const payload = await response.json() as { trends: ViralTrend[] }
      return payload.trends
    },
    staleTime: 60_000,
  })

  const formatCount = (value: number | null) => {
    if (value == null) return '—'
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  const platformLabel = (platform: ViralTrend['platform']) => {
    switch (platform) {
      case 'TIKTOK':
        return 'TikTok'
      case 'YOUTUBE_SHORTS':
        return 'YouTube Shorts'
      default:
        return platform
    }
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome back, {user.name || 'Creator'}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Create amazing music with AI. Choose a genre and start generating.
          </p>
        </div>

        <Link
          href="/create"
          className={cn(
            buttonVariants({ variant: 'primary', size: 'lg' }),
            'inline-flex items-center gap-2'
          )}
        >
          <Sparkles className="h-5 w-5" />
          Create New Track
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tracks"
          value={stats?.totalTracks || 0}
          icon={<Music4 className="h-6 w-6 text-primary" />}
          trend="+12% from last month"
        />
        <StatCard
          title="Processing"
          value={stats?.processing || 0}
          icon={<Clock className="h-6 w-6 text-primary" />}
          trend="Currently generating"
        />
        <StatCard
          title="Completed"
          value={stats?.completed || 0}
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
          trend="Ready to download"
        />
        <StatCard
          title="This Month"
          value={stats?.thisMonth || 0}
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          trend={`${stats?.remainingCredits || 0} credits left`}
        />
      </div>

      {/* Viral Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Top Viral Instrumentals</CardTitle>
          <CardDescription>
            Ten hottest instrumental-ready sounds detected by the Trend Analytics Engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTopTrends ? (
            <div className="text-muted-foreground">Loading viral trends…</div>
          ) : topTrends && topTrends.length > 0 ? (
            <div className="space-y-4">
              {topTrends.map((trend, index) => (
                <TrendRow
                  key={trend.id}
                  rank={index + 1}
                  trend={trend}
                  formatCount={formatCount}
                  platformLabel={platformLabel}
                />
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">Nenhuma tendência encontrada. Rode a ingestão para popular a lista.</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Tracks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tracks</CardTitle>
          <CardDescription>
            Your latest AI-generated music tracks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTracks && recentTracks.length > 0 ? (
            <div className="space-y-4">
              {recentTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Music4 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{track.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {track.genre} • {track.status}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/tracks/${track.id}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Music4 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tracks yet. Create your first one!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  trend?: string
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs text-muted-foreground mt-1">{trend}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TrendRow({
  rank,
  trend,
  formatCount,
  platformLabel,
}: {
  rank: number
  trend: ViralTrend
  formatCount: (value: number | null) => string
  platformLabel: (platform: ViralTrend['platform']) => string
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="text-2xl font-semibold text-primary">#{rank}</div>
        <div>
          <h4 className="font-medium leading-tight">
            <a
              href={trend.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              {trend.title}
            </a>
          </h4>
          <p className="text-sm text-muted-foreground">
            {platformLabel(trend.platform)} • ViralScore {trend.viralScore.toFixed(1)}
          </p>
          <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {trend.caption}
          </div>
          {trend.hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-primary">
              {trend.hashtags.slice(0, 4).map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
        <Metric label="Views" value={formatCount(trend.views)} />
        <Metric label="Likes" value={formatCount(trend.likes)} />
        <Metric label="Shares" value={formatCount(trend.shares)} />
        {trend.features ? (
          <Metric
            label="BPM / Key"
            value={`${trend.features.bpm ?? '—'} • ${trend.features.musicalKey ?? '—'}`}
          />
        ) : (
          <Metric label="Analysing" value={<span className="text-amber-500">pending</span>} />
        )}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}
