'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type WorkflowStage = {
  stage: string
  status: 'completed' | 'running' | 'pending'
  startedAt?: string
  completedAt?: string
  durationMs?: number
  output?: Record<string, unknown>
}

type WorkflowResponse = {
  runId: string
  status: string
  totalDurationMs: number
  trend: {
    id: string
    platform: string
    sourceUrl: string
    title: string
    caption: string
    viralScore: number
  }
  stages: WorkflowStage[]
  outputs: {
    generatedAudioUrl: string
    publishLinks: {
      tiktok: string
      youtube: string
      instagram: string
    }
    analyticsUrl: string
  }
}

const STAGE_LABELS: Record<string, string> = {
  crawling: '🔍 Rastreando Tendências',
  analyzing: '📊 Analisando Viral Score',
  extracting_features: '🎵 Extraindo Features (BPM, Key, Energy)',
  generating: '🤖 Gerando Música com IA',
  checking_originality: '✅ Verificando Originalidade',
  publishing: '🚀 Publicando em TikTok/YouTube/Instagram',
  tracking_analytics: '📈 Coletando Analytics & Feedback',
}

export function WorkflowDemo() {
  const [loading, setLoading] = useState(false)
  const [workflow, setWorkflow] = useState<WorkflowResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runDemo() {
    setLoading(true)
    setError(null)
    setWorkflow(null)

    try {
      const response = await fetch('/api/workflow/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendUrl: 'https://example.com/trending/stub' }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: WorkflowResponse = await response.json()
      setWorkflow(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fase 2 – Pipeline Completo (Demo)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Simulação do fluxo: Análise → Geração → Publicação em modo sintético
          </p>
        </div>
        <button
          onClick={runDemo}
          disabled={loading}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Rodando Pipeline...' : '▶ Executar Demo'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {workflow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{workflow.trend.title}</h3>
                <p className="text-sm text-muted-foreground">{workflow.trend.caption}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{workflow.trend.viralScore}</div>
                <div className="text-xs text-muted-foreground">Viral Score</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-medium">Plataforma:</span> {workflow.trend.platform}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Duração Total:</span> {workflow.totalDurationMs}ms
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Run ID:</span>{' '}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{workflow.runId}</code>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {workflow.stages.map((stage, index) => (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <h4 className="font-medium text-foreground">
                        {STAGE_LABELS[stage.stage] ?? stage.stage}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {stage.durationMs}ms
                      </span>
                    </div>
                    {stage.output && (
                      <pre className="bg-muted p-3 rounded text-xs overflow-x-auto text-muted-foreground">
                        {JSON.stringify(stage.output, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Outputs Finais</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Áudio Gerado</div>
                <code className="block bg-muted px-3 py-2 rounded text-sm text-foreground">
                  {workflow.outputs.generatedAudioUrl}
                </code>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Links de Publicação
                </div>
                <div className="space-y-1">
                  {Object.entries(workflow.outputs.publishLinks).map(([platform, link]) => (
                    <div key={platform} className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase text-muted-foreground w-20">
                        {platform}
                      </span>
                      <code className="flex-1 bg-muted px-3 py-1.5 rounded text-xs text-foreground">
                        {link}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Analytics</div>
                <code className="block bg-muted px-3 py-2 rounded text-sm text-foreground">
                  {workflow.outputs.analyticsUrl}
                </code>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
