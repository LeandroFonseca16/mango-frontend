'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { AppleCard, AppleButton, AppleBadge } from '@/components/ui/AppleUI'
import { 
  Sparkles, 
  Music, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  BarChart3,
  Zap
} from 'lucide-react'

interface DashboardStats {
  totalTracks: number
  processing: number
  completed: number
  thisMonth: number
}

interface Trend {
  id: string
  platform: 'TIKTOK' | 'YOUTUBE_SHORTS'
  title: string
  viralScore: number
  features: {
    bpm: number | null
    musicalKey: string | null
  } | null
}

interface Track {
  id: string
  title: string
  genre: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats')
      if (!response.ok) return { totalTracks: 0, processing: 0, completed: 0, thisMonth: 0 }
      return response.json() as Promise<DashboardStats>
    },
  })

  const { data: topTrends } = useQuery<Trend[]>({
    queryKey: ['trends', 'top'],
    queryFn: async () => {
      const response = await fetch('/api/trends/top?limit=5')
      if (!response.ok) throw new Error('Failed to load trends')
      const payload = await response.json() as { trends: Trend[] }
      return payload.trends
    },
  })

  const { data: recentTracks } = useQuery<Track[]>({
    queryKey: ['tracks', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/tracks?limit=5')
      if (!response.ok) return []
      const payload = await response.json() as { tracks: Track[] }
      return payload.tracks
    },
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-12 animate-slide-in-up">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-9xl font-semibold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-mango-500 via-mango-400 to-yellow-500 leading-normal">
              mango.
            </h1>
            <p className="text-xl text-muted-foreground">
              Transforme tendências em música viral.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/create">
              <AppleButton variant="primary" size="lg" icon={<Sparkles className="h-5 w-5" />}>
                Criar Nova Faixa
              </AppleButton>
            </Link>
            <Link href="/trends">
              <AppleButton variant="secondary" size="lg" icon={<TrendingUp className="h-5 w-5" />}>
                Explorar Tendências
              </AppleButton>
            </Link>
          </div>
        </div>

        {/* Stats Grid - Estilo Apple */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <AppleCard variant="elevated" interactive className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mango-400 to-mango-600 flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-semibold mb-1 tabular-nums">{stats?.totalTracks || 0}</div>
            <p className="text-sm text-muted-foreground">
              Total de Faixas
            </p>
          </AppleCard>

          <AppleCard variant="elevated" interactive className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-semibold mb-1 tabular-nums">{stats?.processing || 0}</div>
            <p className="text-sm text-muted-foreground">
              Em Progresso
            </p>
          </AppleCard>

          <AppleCard variant="elevated" interactive className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-semibold mb-1 tabular-nums">{stats?.completed || 0}</div>
            <p className="text-sm text-muted-foreground">
              Concluídas
            </p>
          </AppleCard>

          <AppleCard variant="elevated" interactive className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mango-400 via-mango-500 to-orange-600 flex items-center justify-center shadow-mango">
                <Zap className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-4xl font-semibold mb-1 tabular-nums">{stats?.thisMonth || 0}</div>
            <p className="text-sm text-muted-foreground">
              Este Mês
            </p>
          </AppleCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Trends */}
          <AppleCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-mango-500 to-orange-500 bg-clip-text text-transparent">
                Tendências Quentes
              </h2>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-mango-400 to-orange-600 flex items-center justify-center shadow-mango">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            
            {!topTrends || topTrends.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Nenhuma tendência disponível ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topTrends.map((trend, index) => (
                  <div
                    key={trend.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-r from-muted/10 to-muted/30 hover:from-muted/20 hover:to-muted/40 transition-all duration-200 border border-border/50 hover:border-mango-400/30"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-mango-400 to-orange-600 text-white font-bold shrink-0 shadow-mango">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1 line-clamp-1">{trend.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span className="tabular-nums">{trend.viralScore.toFixed(0)}</span>
                        </span>
                        {trend.features?.bpm && (
                          <span className="tabular-nums">{trend.features.bpm} BPM</span>
                        )}
                        {trend.features?.musicalKey && (
                          <span>{trend.features.musicalKey}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/trends">
                <AppleButton variant="ghost" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                  Ver todas as tendências
                </AppleButton>
              </Link>
            </div>
          </AppleCard>

          {/* Recent Tracks */}
          <AppleCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-mango-500 to-orange-500 bg-clip-text text-transparent">
                Faixas Recentes
              </h2>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-mango-400 to-orange-600 flex items-center justify-center shadow-mango">
                <Music className="h-5 w-5 text-white" />
              </div>
            </div>
            
            {!recentTracks || recentTracks.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">Nenhuma faixa ainda</p>
                <Link href="/create">
                  <AppleButton variant="primary" size="md" icon={<Sparkles className="h-4 w-4" />}>
                    Criar Primeira Faixa
                  </AppleButton>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-muted/10 to-muted/30 hover:from-muted/20 hover:to-muted/40 transition-all duration-200 border border-border/50 hover:border-mango-400/30"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-mango-400/20 to-orange-600/20 border border-mango-400/30 shrink-0">
                      <Music className="h-6 w-6 text-mango-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1 line-clamp-1">{track.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{track.genre}</span>
                        <span>•</span>
                        <AppleBadge 
                          variant={
                            track.status === 'COMPLETED' ? 'success' :
                            track.status === 'PROCESSING' ? 'warning' :
                            'danger'
                          }
                        >
                          {track.status === 'COMPLETED' ? 'Concluída' :
                           track.status === 'PROCESSING' ? 'Processando' :
                           'Falhou'}
                        </AppleBadge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/tracks">
                <AppleButton variant="ghost" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                  Ver todas as faixas
                </AppleButton>
              </Link>
            </div>
          </AppleCard>
        </div>
      </div>
    </div>
  )
}
