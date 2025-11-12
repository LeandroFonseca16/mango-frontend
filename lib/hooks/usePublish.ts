import { useState } from 'react'
import { toast } from 'react-hot-toast'

export interface Publication {
  platform: string
  publishId: string
  status: string
  scheduledFor: string
  metadata: {
    title: string
    description: string
    hashtags: string[]
    thumbnail: string
    category?: string
    privacy: string
  }
  platformSpecific: Record<string, any>
  delivery: {
    uploadUrl: string
    statusUrl: string
    webhookUrl: string
  }
  estimatedPublishTime: string
}

export interface PublishResult {
  publishId: string
  trackId: string
  status: string
  timestamp: string
  publications: Publication[]
  summary: {
    totalPlatforms: number
    scheduled: number
    published: number
    failed: number
  }
  analytics: {
    expectedReach: number
    viralPotential: number
    bestPostingTime: string
  }
  logs: Array<{
    level: string
    message: string
    timestamp: string
  }>
}

export interface PublishConfig {
  platforms?: string[]
  title?: string
  description?: string
  hashtags?: string[]
  privacy?: string
  [key: string]: any
}

export function usePublish() {
  const [isPublishing, setIsPublishing] = useState(false)
  const [result, setResult] = useState<PublishResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const publish = async (
    trackId: string,
    generationId?: string,
    config?: PublishConfig
  ) => {
    setIsPublishing(true)
    setError(null)

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId,
          generationId,
          ...config,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Falha ao publicar faixa')
      }

      const data = await response.json() as PublishResult
      setResult(data)
      toast.success(`Publicação agendada em ${data.publications.length} plataforma(s)!`)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Publicação falhou'
      setError(message)
      toast.error(message)
      throw err
    } finally {
      setIsPublishing(false)
    }
  }

  const checkStatus = async (publishId: string) => {
    try {
      const response = await fetch(`/api/publish?id=${publishId}`)
      if (!response.ok) throw new Error('Falha ao buscar status de publicação')
      return await response.json()
    } catch (err) {
      console.error('Erro ao verificar status de publicação:', err)
      throw err
    }
  }

  const reset = () => {
    setResult(null)
    setError(null)
  }

  return {
    publish,
    checkStatus,
    isPublishing,
    result,
    error,
    reset,
  }
}
