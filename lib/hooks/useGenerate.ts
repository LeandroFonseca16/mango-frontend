import { useState } from 'react'
import { toast } from 'react-hot-toast'

export interface GenerationResult {
  generationId: string
  trackId: string
  status: string
  timestamp: string
  input: {
    analysisId: string
    trendId: string
    prompt: string
    config: {
      duration: number
      format: string
      sampleRate: number
    }
  }
  track: {
    id: string
    title: string
    audioUrl: string
    previewUrl: string
    waveformUrl: string
    format: string
    sampleRate: number
    duration: number
    fileSize: number
    features: {
      bpm: number
      key: string
      energy: number
      loudness: number
      spectralCentroid: number
    }
    instruments: string[]
    structure: Array<{ label: string; start: number; end: number }>
  }
  originality: {
    score: number
    threshold: number
    passed: boolean
    checkedAgainstSource: string | null
    similarTracks: any[]
    uniqueElements: string[]
  }
  generation: {
    model: string
    seed: number
    inferenceTimeMs: number
    gpuUsed: string
    tokensGenerated: number
  }
  publishSuggestions: {
    platforms: string[]
    bestTimeToPost: string
    suggestedTags: string[]
    targetDemographic: string
  }
}

export interface GenerationConfig {
  duration?: number
  format?: string
  sampleRate?: number
  model?: string
}

export function useGenerate() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generate = async (
    trendId: string,
    analysisId?: string,
    prompt?: string,
    config?: GenerationConfig
  ) => {
    setIsGenerating(true)
    setProgress(0)
    setError(null)

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 95))
    }, 400)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trendId,
          analysisId,
          prompt,
          config,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao gerar faixa')
      }

      const data = await response.json() as GenerationResult
      setProgress(100)
      setResult(data)
      toast.success('Faixa gerada com sucesso!')
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Geração falhou'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      clearInterval(progressInterval)
      setIsGenerating(false)
    }
  }

  const reset = () => {
    setProgress(0)
    setResult(null)
    setError(null)
  }

  return {
    generate,
    isGenerating,
    progress,
    result,
    error,
    reset,
  }
}
