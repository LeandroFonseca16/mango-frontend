import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/analyze
 * Analisa uma trend viral e retorna insights musicais
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trendId, sourceUrl } = body

    if (!trendId && !sourceUrl) {
      return NextResponse.json(
        { error: 'trendId or sourceUrl required' },
        { status: 400 }
      )
    }

    // Simula processamento de análise
    await new Promise(resolve => setTimeout(resolve, 1200))

    const analysisId = `analysis-${Date.now()}`
    
    // Mock response com dados realistas
    const mockAnalysis = {
      analysisId,
      trendId: trendId || `trend-${Date.now()}`,
      sourceUrl: sourceUrl || 'https://tiktok.com/@user/video/123456',
      status: 'completed',
      timestamp: new Date().toISOString(),
      
      // Insights da trend
      insights: {
        platform: 'TIKTOK',
        viralScore: Math.floor(Math.random() * 200) + 100,
        engagement: {
          views: Math.floor(Math.random() * 5000000) + 500000,
          likes: Math.floor(Math.random() * 500000) + 50000,
          comments: Math.floor(Math.random() * 50000) + 5000,
          shares: Math.floor(Math.random() * 100000) + 10000,
        },
        
        // Features musicais detectadas
        musicFeatures: {
          bpm: Math.floor(Math.random() * 60) + 100, // 100-160 BPM
          key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)] + 
               [' major', ' minor'][Math.floor(Math.random() * 2)],
          energy: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)), // 0.5-0.9
          danceability: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)), // 0.6-0.9
          valence: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)), // 0.3-0.8
          loudness: parseFloat((-Math.random() * 8 - 6).toFixed(1)), // -14 to -6 dB
        },
        
        // Estrutura detectada
        structure: {
          intro: { start: 0, duration: 4 },
          buildup: { start: 4, duration: 4 },
          drop: { start: 8, duration: 8 },
          breakdown: { start: 16, duration: 4 },
          outro: { start: 20, duration: 4 },
        },
        
        // Tags e categorização
        tags: ['phonk', 'drift', 'aggressive', 'bass-heavy'],
        mood: ['energetic', 'dark', 'intense'][Math.floor(Math.random() * 3)],
        genre: 'phonk',
        
        // Recomendações
        recommendations: {
          instrumentalCandidate: true,
          remixPotential: 'high',
          targetAudience: ['gen-z', 'car-enthusiasts', 'gamers'],
          suggestedHashtags: ['#phonk', '#drift', '#aggressive', '#aimusic'],
        },
      },
      
      // Metadados de processamento
      processing: {
        durationMs: 1200,
        model: 'trend-analyzer-v2',
        confidence: 0.89,
      },
    }

    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error('Error in /api/analyze:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
