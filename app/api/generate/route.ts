import { NextRequest, NextResponse } from 'next/server'
import { findSyntheticTrend } from '@/lib/stubs/trends'

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const trendId: string | undefined = body.trendId
  const analysisId: string | undefined = body.analysisId
  const prompt: string | undefined = body.prompt
  const config = body.config || {}

  if (!trendId && !analysisId) {
    return NextResponse.json({ error: 'trendId or analysisId is required' }, { status: 400 })
  }

  // Simula processamento de geração (mais longo)
  await new Promise(resolve => setTimeout(resolve, 3500))

  const trend = trendId ? await findSyntheticTrend(trendId) : null
  const baseTitle = trend?.title ?? 'AI Generated Track'
  const loopDuration = config.duration || (15 + Math.round(Math.random() * 15))
  
  const generationId = `gen-${Date.now()}`
  const trackId = `track-${Date.now()}`

  return NextResponse.json({
    generationId,
    trackId,
    status: 'completed',
    timestamp: new Date().toISOString(),
    
    input: {
      analysisId: analysisId || `analysis-${Date.now()}`,
      trendId: trendId || `trend-${Date.now()}`,
      prompt: prompt || `Generate aggressive phonk beat inspired by ${baseTitle}`,
      config: {
        duration: loopDuration,
        format: config.format || 'wav',
        sampleRate: config.sampleRate || 44100,
      },
    },
    
    track: {
      id: trackId,
      title: `AI Phonk ${Date.now().toString().slice(-4)}`,
      audioUrl: `/stubs/output/${trendId || trackId}.wav`,
      previewUrl: `/stubs/output/${trendId || trackId}-preview.mp3`,
      waveformUrl: `/api/waveform/${trackId}.json`,
      
      format: 'wav',
      sampleRate: 44100,
      duration: loopDuration,
      fileSize: Math.floor(Math.random() * 2000000) + 1000000,
      
      features: {
        bpm: Math.floor(Math.random() * 40) + 120,
        key: ['C', 'D', 'E', 'F', 'G', 'A'][Math.floor(Math.random() * 6)] + 
             [' major', ' minor'][Math.floor(Math.random() * 2)],
        energy: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
        loudness: parseFloat((-Math.random() * 6 - 8).toFixed(1)),
        spectralCentroid: Math.floor(Math.random() * 2000) + 1000,
      },
      
      instruments: ['bass', 'drums', 'synth', 'effects'],
      
      structure: [
        { label: 'intro', start: 0, end: 4 },
        { label: 'buildup', start: 4, end: 8 },
        { label: 'drop', start: 8, end: Math.min(16, loopDuration) },
        { label: 'outro', start: Math.max(16, loopDuration - 4), end: loopDuration },
      ],
    },
    
    originality: {
      score: parseFloat((Math.random() * 0.15 + 0.82).toFixed(2)),
      threshold: 0.85,
      passed: true,
      checkedAgainstSource: trend?.sourceUrl ?? null,
      similarTracks: [],
      uniqueElements: ['bass-pattern', 'drum-programming', 'synth-melody'],
    },
    
    generation: {
      model: body.model || 'musicgen-v2-phonk',
      seed: Math.floor(Math.random() * 1_000_000),
      inferenceTimeMs: 3500,
      gpuUsed: 'NVIDIA A100 (simulated)',
      tokensGenerated: Math.floor(Math.random() * 5000) + 10000,
    },
    
    publishSuggestions: {
      platforms: ['tiktok', 'youtube', 'instagram'],
      bestTimeToPost: 'evening',
      suggestedTags: ['#aimusic', '#phonk', '#drift', '#aggressive'],
      targetDemographic: 'gen-z, 16-24',
    },
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const generationId = searchParams.get('id')

  if (!generationId) {
    return NextResponse.json({ error: 'generationId required' }, { status: 400 })
  }

  return NextResponse.json({
    generationId,
    status: 'completed',
    progress: 100,
    currentStage: 'finalization',
    stages: [
      { name: 'initialization', status: 'completed', progress: 100 },
      { name: 'feature-extraction', status: 'completed', progress: 100 },
      { name: 'model-inference', status: 'completed', progress: 100 },
      { name: 'post-processing', status: 'completed', progress: 100 },
      { name: 'quality-check', status: 'completed', progress: 100 },
      { name: 'finalization', status: 'completed', progress: 100 },
    ],
    estimatedTimeRemaining: 0,
  })
}

async function parseBody(request: Request) {
  try {
    return await request.json()
  } catch (error) {
    return {}
  }
}
