'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppleCard, AppleButton } from '@/components/ui/AppleUI'
import { TrendCard } from '@/components/studio/TrendCard'
import { StudioView } from '@/components/studio/StudioView'
import { PublishView } from '@/components/studio/PublishView'
import { type GenerationResult } from '@/lib/hooks/useGenerate'
import { Sparkles, ArrowLeft, Search } from 'lucide-react'

type CreateStage = 'select' | 'studio' | 'publish'

interface Trend {
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

export default function CreatePage() {
  const [stage, setStage] = useState<CreateStage>('select')
  const [selectedTrendId, setSelectedTrendId] = useState<string>() // eslint-disable-line @typescript-eslint/no-unused-vars
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: trends, isLoading } = useQuery<Trend[]>({
    queryKey: ['trends', 'top'],
    queryFn: async () => {
      const response = await fetch('/api/trends/top')
      if (!response.ok) throw new Error('Falha ao carregar tendências')
      const payload = await response.json() as { trends: Trend[] }
      return payload.trends
    },
  })

  const filteredTrends = trends?.filter(trend =>
    trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trend.caption.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleTrendSelect = (trendId: string) => {
    setSelectedTrendId(trendId)
    setStage('studio')
  }

  const handlePublish = (result: GenerationResult) => {
    setGenerationResult(result)
    setStage('publish')
  }

  const handleReset = () => {
    setStage('select')
    setSelectedTrendId(undefined)
    setGenerationResult(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              {stage !== 'select' && (
                <AppleButton
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  icon={<ArrowLeft className="h-4 w-4" />}
                >
                  Recomeçar
                </AppleButton>
              )}
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mango-400 to-orange-600 flex items-center justify-center shadow-mango">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-mango-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  {stage === 'select' && 'Selecionar Tendência Viral'}
                  {stage === 'studio' && 'Criar Faixa'}
                  {stage === 'publish' && 'Publicar Faixa'}
                </span>
              </h1>
            </div>
            <p className="text-muted-foreground mt-2">
              {stage === 'select' && 'Escolha um som em tendência para inspirar sua faixa gerada por IA'}
              {stage === 'studio' && 'Analise a tendência e gere sua faixa personalizada'}
              {stage === 'publish' && 'Agende a publicação em plataformas sociais'}
            </p>
          </div>
        </div>

        {/* Content */}
        {stage === 'select' && (
          <div className="space-y-6">
            {/* Search */}
            <AppleCard variant="glass" className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar tendências por título, legenda ou hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border bg-background/50 backdrop-blur focus:outline-none focus:border-mango-400 focus:ring-2 focus:ring-mango-400/20 transition-all"
                />
              </div>
            </AppleCard>

            {/* Trends Grid */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="inline-flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-mango-400 border-t-transparent rounded-full animate-spin"></div>
                  Carregando tendências...
                </div>
              </div>
            ) : filteredTrends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">Nenhuma tendência encontrada</p>
                {searchQuery && (
                  <AppleButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpar busca
                  </AppleButton>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrends.map(trend => (
                  <TrendCard
                    key={trend.id}
                    trend={trend}
                    onSelect={handleTrendSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {stage === 'studio' && trends && (
          <StudioView
            trends={trends}
            onPublish={handlePublish}
          />
        )}

        {stage === 'publish' && generationResult && (
          <PublishView
            generationResult={generationResult}
            onComplete={handleReset}
          />
        )}
      </div>
    </div>
  )
}
