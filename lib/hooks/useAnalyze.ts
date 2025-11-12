import { useState } from 'react'
import { toast } from 'react-hot-toast'

export interface AnalysisResult {
  analysisId: string
  trendId: string
  sourceUrl: string
  status: string
  timestamp: string
  insights: {
    platform: string
    viralScore: number
    engagement: {
      views: number
      likes: number
      comments: number
      shares: number
    }
    musicFeatures: {
      bpm: number
      key: string
      energy: number
      danceability: number
      valence: number
      loudness: number
    }
    structure: Record<string, { start: number; duration: number }>
    tags: string[]
    mood: string
    genre: string
    recommendations: {
      instrumentalCandidate: boolean
      remixPotential: string
      targetAudience: string[]
      suggestedHashtags: string[]
    }
  }
  processing: {
    durationMs: number
    model: string
    confidence: number
  }
}

export function useAnalyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (trendId: string, sourceUrl?: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendId, sourceUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao analisar tendência')
      }

      const data = await response.json() as AnalysisResult
      setResult(data)
      toast.success('Análise concluída com sucesso!')
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Análise falhou'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setIsAnalyzing(false)
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return {
    analyze,
    isAnalyzing,
    result,
    error,
    reset,
  }
}
