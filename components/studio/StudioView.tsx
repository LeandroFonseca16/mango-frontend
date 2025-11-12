'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TrendCard } from '@/components/studio/TrendCard'
import { useAnalyze, type AnalysisResult } from '@/lib/hooks/useAnalyze'
import { useGenerate, type GenerationResult } from '@/lib/hooks/useGenerate'
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Music, 
  BarChart3,
  Zap,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudioViewProps {
  trends: any[]
  onPublish?: (generationResult: GenerationResult) => void
}

type StudioStage = 'select' | 'analyze' | 'generate' | 'preview'

export function StudioView({ trends, onPublish }: StudioViewProps) {
  const [currentStage, setCurrentStage] = useState<StudioStage>('select')
  const [selectedTrendId, setSelectedTrendId] = useState<string>()
  const [customPrompt, setCustomPrompt] = useState('')
  
  const { analyze, isAnalyzing, result: analysisResult } = useAnalyze()
  const { generate, isGenerating, progress, result: generationResult } = useGenerate()

  const selectedTrend = trends.find(t => t.id === selectedTrendId)

  const handleAnalyze = async (trendId: string) => {
    try {
      await analyze(trendId)
      setCurrentStage('analyze')
    } catch (error) {
      console.error('Análise falhou:', error)
    }
  }

  const handleGenerate = async () => {
    if (!selectedTrendId) return
    
    try {
      await generate(
        selectedTrendId,
        analysisResult?.analysisId,
        customPrompt || undefined
      )
      setCurrentStage('preview')
    } catch (error) {
      console.error('Geração falhou:', error)
    }
  }

  const handlePublishClick = () => {
    if (generationResult && onPublish) {
      onPublish(generationResult)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Trend Selection & Analysis */}
      <div className="space-y-6">
        {/* Stage 1: Select Trend */}
        <Card className={cn(currentStage === 'select' && 'ring-2 ring-primary/20')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold',
                currentStage === 'select' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                1
              </span>
              Selecionar Tendência
              {selectedTrendId && currentStage !== 'select' && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTrend ? (
              <TrendCard
                trend={selectedTrend}
                selected
                compact
                onAnalyze={currentStage === 'select' ? handleAnalyze : undefined}
              />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Selecione uma tendência da grade para começar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage 2: Analysis */}
        <Card className={cn(currentStage === 'analyze' && 'ring-2 ring-primary/20')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold',
                currentStage === 'analyze' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                2
              </span>
              Resultados da Análise
              {analysisResult && currentStage !== 'analyze' && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analisando tendência...</p>
              </div>
            ) : analysisResult ? (
              <AnalysisDisplay analysis={analysisResult} />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Clique em "Analisar" na tendência selecionada
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Generation & Preview */}
      <div className="space-y-6">
        {/* Stage 3: Generate */}
        <Card className={cn(currentStage === 'generate' && 'ring-2 ring-primary/20')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold',
                currentStage === 'generate' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                3
              </span>
              Gerar Faixa
              {generationResult && currentStage !== 'generate' && (
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Instruções Personalizadas (Opcional)
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="ex: Deixe mais agressivo com grave mais pesado..."
                    className="w-full min-h-[100px] px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                    disabled={isGenerating}
                  />
                </div>

                {isGenerating ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gerando...</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : generationResult ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-500">
                      Faixa gerada com sucesso!
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleGenerate}
                    leftIcon={<Sparkles className="h-5 w-5" />}
                  >
                    Gerar Faixa
                  </Button>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                Complete a análise primeiro
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage 4: Preview & Publish */}
        {generationResult && (
          <Card className={cn(currentStage === 'preview' && 'ring-2 ring-primary/20')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold bg-primary text-primary-foreground">
                  4
                </span>
                Pré-visualização e Publicação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TrackPreview track={generationResult.track} />
              
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handlePublishClick}
                rightIcon={<ArrowRight className="h-5 w-5" />}
              >
                Prosseguir para Publicação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function AnalysisDisplay({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
          <Music className="h-4 w-4 text-muted-foreground" />
          <span className="font-bold text-base">{analysis.insights.musicFeatures.bpm}</span>
          <span className="text-muted-foreground">BPM</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <span className="font-bold text-base">{analysis.insights.musicFeatures.key}</span>
          <span className="text-muted-foreground">Tom</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="font-bold text-base">{(analysis.insights.musicFeatures.energy * 100).toFixed(0)}%</span>
          <span className="text-muted-foreground">Energia</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Humor:</span>
          <span className="font-medium capitalize">{analysis.insights.mood}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Gênero:</span>
          <span className="font-medium capitalize">{analysis.insights.genre}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confiança:</span>
          <span className="font-medium">{(analysis.processing.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  )
}

function TrackPreview({ track }: { track: GenerationResult['track'] }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/50 space-y-3">
        <div>
          <h4 className="font-semibold">{track.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {track.duration}s • {track.features.bpm} BPM • {track.features.key}
          </p>
        </div>
        
        <audio controls className="w-full">
          <source src={track.audioUrl} type="audio/wav" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Energia:</span>
          <span className="font-medium ml-1">{(track.features.energy * 100).toFixed(0)}%</span>
        </div>
        <div className="p-2 rounded bg-muted/30">
          <span className="text-muted-foreground">Volume:</span>
          <span className="font-medium ml-1">{track.features.loudness}dB</span>
        </div>
      </div>
    </div>
  )
}
