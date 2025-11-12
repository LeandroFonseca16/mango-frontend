'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePublish, type PublishConfig } from '@/lib/hooks/usePublish'
import { type GenerationResult } from '@/lib/hooks/useGenerate'
import {
  CheckSquare,
  Square,
  Loader2,
  CheckCircle,
  ExternalLink,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  Music2,
  Video,
  Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublishViewProps {
  generationResult: GenerationResult
  onComplete?: () => void
}

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'bg-pink-500' },
  { id: 'youtube', name: 'YouTube Shorts', icon: Video, color: 'bg-red-500' },
  { id: 'instagram', name: 'Instagram Reels', icon: Camera, color: 'bg-purple-500' },
]

export function PublishView({ generationResult, onComplete }: PublishViewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['tiktok'])
  const [title, setTitle] = useState(generationResult.track.title)
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState(
    generationResult.publishSuggestions.suggestedTags.join(' ')
  )

  const { publish, isPublishing, result } = usePublish()

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handlePublish = async () => {
    const config: PublishConfig = {
      platforms: selectedPlatforms,
      title,
      description,
      hashtags: hashtags.split(/\s+/).filter(Boolean),
    }

    try {
      await publish(generationResult.trackId, generationResult.generationId, config)
    } catch (error) {
      console.error('Publish failed:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Track Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Faixa para Publicar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 shrink-0">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{generationResult.track.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span>{generationResult.track.duration}s</span>
                <span>•</span>
                <span>{generationResult.track.features.bpm} BPM</span>
                <span>•</span>
                <span>{generationResult.track.features.key}</span>
              </div>
              <div className="mt-3">
                <audio controls className="w-full max-w-md">
                  <source src={generationResult.track.audioUrl} type="audio/wav" />
                </audio>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Plataformas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLATFORMS.map(platform => {
              const Icon = platform.icon
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                    selectedPlatforms.includes(platform.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {selectedPlatforms.includes(platform.id) ? (
                    <CheckSquare className="h-5 w-5 text-primary" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Icon className="h-6 w-6" />
                  <span className="font-medium">{platform.name}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Publicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Título da faixa..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Adicione uma descrição..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="#hashtag1 #hashtag2"
            />
            <p className="text-xs text-muted-foreground">
              Sugestões: {generationResult.publishSuggestions.suggestedTags.join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Insights de Publicação IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Potencial Viral</p>
              <p className="text-xs text-muted-foreground">
                {(generationResult.publishSuggestions.targetDemographic)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Melhor Horário para Postar</p>
              <p className="text-xs text-muted-foreground">
                {generationResult.publishSuggestions.bestTimeToPost}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Público-Alvo</p>
              <p className="text-xs text-muted-foreground">
                Gen-Z, 16-24, entusiastas de carros, gamers
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publish Button or Results */}
      {!result ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handlePublish}
          disabled={isPublishing || selectedPlatforms.length === 0}
          leftIcon={isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
        >
          {isPublishing
            ? 'Publicando...'
            : `Publicar em ${selectedPlatforms.length} Plataforma${selectedPlatforms.length !== 1 ? 's' : ''}`
          }
        </Button>
      ) : (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-6 w-6" />
              Publicação Agendada!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sua faixa foi agendada para publicação em {result.publications.length} plataforma(s).
            </p>
            
            <div className="space-y-2">
              {result.publications.map(pub => {
                const platformConfig = PLATFORMS.find(p => p.id === pub.platform)
                const PlatformIcon = platformConfig?.icon
                return (
                  <div
                    key={pub.publishId}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {PlatformIcon && <PlatformIcon className="h-5 w-5" />}
                      <div>
                        <p className="text-sm font-medium capitalize">{pub.platform}</p>
                        <p className="text-xs text-muted-foreground">
                          Agendado para {new Date(pub.scheduledFor).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={pub.delivery.statusUrl}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver status
                    </a>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm text-muted-foreground">Alcance Esperado</p>
                <p className="text-2xl font-bold">{result.analytics.expectedReach.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potencial Viral</p>
                <p className="text-2xl font-bold">{(result.analytics.viralPotential * 100).toFixed(0)}%</p>
              </div>
            </div>

            {onComplete && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onComplete}
              >
                Criar Outra Faixa
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
