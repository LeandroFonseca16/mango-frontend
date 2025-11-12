'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { AppleCard, AppleButton, AppleBadge } from '@/components/ui/AppleUI'
import { Music, Download, Trash2, Search, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { MinimalPlayer } from '@/components/player/MinimalPlayer'

interface Track {
  id: string
  title: string
  genre: string
  status: string
  audioUrl?: string
  createdAt: string
  duration?: number
}

type StatusCategory = 'completed' | 'processing' | 'failed'

export default function TracksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<StatusCategory | 'all'>('all')
  const [_currentPlaying, _setCurrentPlaying] = useState<string | null>(null) // eslint-disable-line @typescript-eslint/no-unused-vars

  const { data: tracks, isLoading, refetch } = useQuery<Track[]>({
    queryKey: ['tracks', searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      
  const res = await fetch(`/api/tracks?${params}`)
  if (!res.ok) throw new Error('Erro ao carregar tracks')
  const payload = await res.json() as { tracks: Track[] }
  return payload.tracks
    },
  })

  // Categorizar tracks por status
  const categorizedTracks = useMemo(() => {
    if (!tracks) return { completed: [], processing: [], failed: [] }
    
    return {
      completed: tracks.filter(t => t.status === 'COMPLETED'),
      processing: tracks.filter(t => t.status === 'PROCESSING'),
      failed: tracks.filter(t => t.status === 'FAILED'),
    }
  }, [tracks])

  // Filtrar por categoria selecionada e busca
  const filteredTracks = useMemo(() => {
    let result = tracks || []
    
    if (selectedCategory !== 'all') {
      result = categorizedTracks[selectedCategory]
    }
    
    if (searchQuery) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return result
  }, [tracks, selectedCategory, searchQuery, categorizedTracks])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta track?')) return

    try {
      const res = await fetch(`/api/tracks/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao deletar track')

      toast.success('Track deletada com sucesso!')
      refetch()
    } catch {
      toast.error('Erro ao deletar track')
    }
  }

  const categories = [
    { 
      id: 'all' as const, 
      label: 'Todas', 
      count: tracks?.length || 0,
      icon: Music,
      color: 'text-foreground'
    },
    { 
      id: 'completed' as const, 
      label: 'Concluídas', 
      count: categorizedTracks.completed.length,
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    { 
      id: 'processing' as const, 
      label: 'Em Progresso', 
      count: categorizedTracks.processing.length,
      icon: Clock,
      color: 'text-yellow-600'
    },
    { 
      id: 'failed' as const, 
      label: 'Falhas', 
      count: categorizedTracks.failed.length,
      icon: XCircle,
      color: 'text-red-600'
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-12 animate-slide-in-up">
        {/* Header */}
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight mb-3 bg-gradient-to-r from-mango-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Minhas Faixas
            </h1>
            <p className="text-xl text-muted-foreground">
              Simples. Poderoso. Suas músicas.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link href="/create">
              <AppleButton
                variant="primary"
                size="lg"
                icon={<Plus className="h-5 w-5" />}
              >
                Criar Nova Faixa
              </AppleButton>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <AppleCard variant="glass" className="p-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar faixas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-transparent bg-background/50 backdrop-blur focus:outline-none focus:border-mango-400 focus:ring-2 focus:ring-mango-400/20 transition-all"
              />
            </div>
          </AppleCard>
        </div>

        {/* Categories - Estilo Steve Jobs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id
            
            return (
              <AppleCard
                key={category.id}
                variant={isActive ? "elevated" : "flat"}
                interactive
                className={`p-6 transition-all duration-200 ${isActive ? 'ring-2 ring-mango-400 scale-105' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isActive 
                      ? 'bg-gradient-to-br from-mango-400 to-orange-600 shadow-mango' 
                      : 'bg-muted/20'
                  }`}>
                    <Icon className={`h-6 w-6 ${isActive ? 'text-white' : category.color}`} />
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-semibold tabular-nums ${isActive ? 'text-mango-500' : 'text-foreground'}`}>
                      {category.count}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {category.label}
                    </div>
                  </div>
                </div>
              </AppleCard>
            )
          })}
        </div>

      {/* Tracks List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <AppleCard key={i} variant="elevated" className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded-full w-3/4"></div>
                <div className="h-4 bg-muted rounded-full w-1/2"></div>
                <div className="h-24 bg-muted rounded-2xl"></div>
              </div>
            </AppleCard>
          ))}
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/20 mb-6">
            <Music className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">Nenhuma faixa encontrada</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            {searchQuery
              ? 'Tente buscar com outros termos'
              : selectedCategory !== 'all'
              ? `Nenhuma faixa ${categories.find(c => c.id === selectedCategory)?.label.toLowerCase()}`
              : 'Comece criando sua primeira música com IA'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <Link href="/create">
              <AppleButton
                variant="primary"
                size="lg"
                icon={<Plus className="h-5 w-5" />}
              >
                Criar Primeira Faixa
              </AppleButton>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track: Track) => (
            <AppleCard
              key={track.id}
              variant="glass"
              interactive
              className="p-6"
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2 line-clamp-2">{track.title}</h3>
                <div className="flex items-center gap-2">
                  <AppleBadge variant="primary">
                    {track.genre}
                  </AppleBadge>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {new Date(track.createdAt).toLocaleDateString('pt-BR', { 
                      day: 'numeric',
                      month: 'short' 
                    })}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 mb-4">
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

              {/* Audio Player - Apple Premium Style */}
              {track.audioUrl && track.status === 'COMPLETED' && (
                <div className="mb-6">
                  <MinimalPlayer 
                    source={track.audioUrl.replace('data:audio/wav;base64,', '')}
                    onPlayState={(playing) => {
                      if (playing) _setCurrentPlaying(track.id)
                      else _setCurrentPlaying(null)
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {track.audioUrl && track.status === 'COMPLETED' && (
                  <button
                    onClick={() => window.open(track.audioUrl, '_blank')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-2xl border-2 border-border hover:border-mango-400 hover:bg-mango-50 dark:hover:bg-mango-950 transition-all active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
                <button
                  onClick={() => handleDelete(track.id)}
                  className="px-4 py-3 text-sm font-medium rounded-2xl border-2 border-border hover:border-red-500 hover:bg-red-500/5 hover:text-red-500 transition-all active:scale-95"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </AppleCard>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
