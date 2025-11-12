'use client'

import { useState, useMemo, memo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { TrendingUp, Music, ExternalLink, RefreshCw, Sparkles, Zap, Heart, Radio } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { AppleCard, AppleButton, AppleBadge } from '@/components/ui/AppleUI'

interface Trend {
  id: string
  title: string
  hashtag: string
  category: string
  popularity: number
  usageCount: number
  description?: string
  updatedAt: string
}

// Componente TrendCard memoizado para melhor performance
const TrendCard = memo(({ trend }: { trend: Trend }) => (
  <AppleCard
    variant="elevated"
    interactive
    className="p-5"
  >
    {/* Header */}
    <div className="mb-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-lg font-semibold line-clamp-2 flex-1 text-foreground">{trend.title}</h3>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mango-400 to-orange-600 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-mango-500 tabular-nums">
            {trend.popularity}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <AppleBadge variant="primary">
          #{trend.hashtag}
        </AppleBadge>
        <AppleBadge variant="default">
          {trend.category}
        </AppleBadge>
      </div>
    </div>

    {/* Description */}
    {trend.description && (
      <p className="text-sm text-foreground/60 line-clamp-2 mb-3">
        {trend.description}
      </p>
    )}

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-gradient-to-br from-mango-50/60 via-orange-50/50 to-yellow-50/40 dark:from-mango-900/40 dark:via-orange-900/30 dark:to-yellow-900/20 mb-3 border border-mango-200/50 dark:border-mango-700/50">
      <div>
        <div className="text-xs font-medium text-mango-700 dark:text-mango-300 mb-0.5">Usos</div>
        <div className="text-xl font-bold tabular-nums bg-gradient-to-r from-mango-600 to-orange-600 dark:from-mango-300 dark:to-orange-300 bg-clip-text text-transparent">
          {trend.usageCount >= 1000000
            ? `${(trend.usageCount / 1000000).toFixed(1)}M`
            : trend.usageCount >= 1000
            ? `${(trend.usageCount / 1000).toFixed(1)}K`
            : trend.usageCount}
        </div>
      </div>
      <div>
        <div className="text-xs font-medium text-mango-700 dark:text-mango-300 mb-0.5">Atualizado</div>
        <div className="text-sm font-semibold text-foreground tabular-nums">
          {new Date(trend.updatedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })}
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Link href={`/create?trend=${trend.id}`} className="flex-1">
        <AppleButton
          variant="primary"
          size="sm"
          icon={<Music className="h-4 w-4" />}
          className="w-full"
        >
          Criar Faixa
        </AppleButton>
      </Link>
      <button
        onClick={() => window.open(`https://www.tiktok.com/tag/${trend.hashtag}`, '_blank')}
        className="px-3 py-2 rounded-xl border border-mango-300 dark:border-mango-700 bg-gradient-to-br from-mango-100/80 to-orange-100/60 dark:from-mango-900/50 dark:to-orange-900/40 hover:border-mango-400 hover:from-mango-200 hover:to-orange-200 dark:hover:from-mango-800 dark:hover:to-orange-800 transition-all active:scale-95"
        aria-label="Ver no TikTok"
      >
        <ExternalLink className="h-4 w-4 text-mango-700 dark:text-mango-300" />
      </button>
    </div>
  </AppleCard>
))

TrendCard.displayName = 'TrendCard'

export default function TrendsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const { data: trends, isLoading, refetch, isFetching } = useQuery<Trend[]>({
    queryKey: ['trends'],
    queryFn: async () => {
      const res = await fetch(`/api/trends`)
      if (!res.ok) throw new Error('Erro ao carregar trends')
      return res.json() as Promise<Trend[]>
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (cacheTime renomeado para gcTime)
    refetchOnWindowFocus: false,
  })

  const handleRefresh = async () => {
    try {
      await refetch()
      toast.success('Trends atualizadas!')
    } catch {
      toast.error('Erro ao atualizar trends')
    }
  }

  const categories = [
    { value: 'all', label: 'Todas', icon: Sparkles },
    { value: 'music', label: 'Música', icon: Music },
    { value: 'dance', label: 'Dança', icon: Heart },
    { value: 'phonk', label: 'Phonk', icon: Zap },
    { value: 'viral', label: 'Viral', icon: Radio },
  ]

  // Filtrar trends por categoria
  const filteredTrends = useMemo(() => {
    if (!trends) return []
    if (selectedCategory === 'all') return trends
    return trends.filter(t => t.category === selectedCategory)
  }, [trends, selectedCategory])

  // Contar trends por categoria
  const categoryCounts = useMemo(() => {
    if (!trends) return {}
    return trends.reduce((acc, trend) => {
      acc[trend.category] = (acc[trend.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [trends])

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-12 animate-slide-in-up">
        {/* Header */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight mb-3 bg-gradient-to-r from-mango-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              TikTok Trends
            </h1>
            <p className="text-xl text-muted-foreground">
              Descubra. Inspire-se. Crie.
            </p>
          </div>
          
          <div className="flex justify-center">
            <AppleButton
              onClick={handleRefresh}
              disabled={isFetching}
              variant="secondary"
              size="lg"
              icon={<RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin text-mango-500' : 'text-mango-600 dark:text-mango-400'}`} />}
            >
              {isFetching ? 'Atualizando...' : 'Atualizar Trends'}
            </AppleButton>
          </div>
        </div>

        {/* Categories - Estilo Steve Jobs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            const count = category.value === 'all' 
              ? trends?.length || 0 
              : categoryCounts[category.value] || 0
            const isActive = selectedCategory === category.value
            
            return (
              <AppleCard
                key={category.value}
                variant={isActive ? "elevated" : "flat"}
                interactive
                className={`p-6 transition-all duration-200 ${isActive ? 'ring-2 ring-mango-400 scale-105' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-mango-400 via-orange-500 to-yellow-500 shadow-lg shadow-mango-500/30' 
                      : 'bg-gradient-to-br from-mango-200/70 to-orange-200/50 dark:from-mango-800/50 dark:to-orange-800/40'
                  }`}>
                    <Icon className={`h-6 w-6 transition-colors ${isActive ? 'text-white' : 'text-mango-700 dark:text-mango-300'}`} />
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-semibold tabular-nums transition-colors ${isActive ? 'bg-gradient-to-r from-mango-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent' : 'text-foreground'}`}>
                      {count}
                    </div>
                    <div className={`text-sm font-medium mt-1 transition-colors ${isActive ? 'text-mango-600 dark:text-mango-400' : 'text-foreground/70'}`}>
                      {category.label}
                    </div>
                  </div>
                </div>
              </AppleCard>
            )
          })}
        </div>

      {/* Trends List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <AppleCard key={i} variant="elevated" className="p-5">
              <div className="animate-pulse space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="h-5 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded-full w-3/4"></div>
                  <div className="w-9 h-9 bg-gradient-to-br from-mango-300 via-orange-400 to-yellow-400 dark:from-mango-800 dark:via-orange-900 dark:to-yellow-900 rounded-xl"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gradient-to-r from-mango-200 via-orange-200 to-yellow-100 dark:from-mango-900 dark:via-orange-900 dark:to-yellow-900 rounded-full w-20 shadow-sm"></div>
                  <div className="h-5 bg-muted/60 rounded-full w-16"></div>
                </div>
                <div className="h-12 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted rounded-xl"></div>
                <div className="h-20 bg-gradient-to-br from-mango-50/40 via-orange-50/30 to-yellow-50/20 dark:from-mango-950/30 dark:via-orange-950/20 dark:to-yellow-950/10 rounded-xl border border-mango-200/30 dark:border-mango-800/30"></div>
                <div className="h-10 bg-gradient-to-r from-mango-400 via-orange-500 to-yellow-500 rounded-full shadow-sm"></div>
              </div>
            </AppleCard>
          ))}
        </div>
      ) : filteredTrends.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/20 mb-6">
            <TrendingUp className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Nenhuma trend encontrada</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            {selectedCategory !== 'all'
              ? 'Tente selecionar outra categoria'
              : 'Não há trends disponíveis no momento'}
          </p>
          <AppleButton
            onClick={handleRefresh}
            variant="primary"
            size="lg"
            icon={<RefreshCw className="h-5 w-5" />}
          >
            Atualizar Trends
          </AppleButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
