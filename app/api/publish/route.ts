import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_PLATFORMS = ['tiktok', 'youtube', 'instagram', 'all']

export async function POST(request: NextRequest) {
  const body = await parseBody(request)
  const platforms: string[] = body.platforms || (body.platform ? [body.platform] : ['tiktok'])
  const trackId: string | undefined = body.trackId
  const generationId: string | undefined = body.generationId

  if (!trackId && !generationId) {
    return NextResponse.json({ error: 'trackId or generationId is required' }, { status: 400 })
  }

  // Validar plataformas
  const invalidPlatforms = platforms.filter(p => !SUPPORTED_PLATFORMS.includes(p.toLowerCase()))
  if (invalidPlatforms.length > 0) {
    return NextResponse.json({
      error: `Unsupported platforms: ${invalidPlatforms.join(', ')}. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`,
    }, { status: 400 })
  }

  // Simula processamento de publicação
  await new Promise(resolve => setTimeout(resolve, 1500))

  const now = Date.now()
  const publishId = `publish-${now}`
  const targetPlatforms = platforms.includes('all') ? ['tiktok', 'youtube', 'instagram'] : platforms

  // Mock de dados de publicação para cada plataforma
  const publications = targetPlatforms.map(platform => ({
    platform,
    publishId: `${publishId}-${platform}`,
    status: 'scheduled',
    scheduledFor: new Date(now + Math.floor(Math.random() * 20) * 60 * 1000).toISOString(),
    
    metadata: {
      title: body.title || `AI Phonk Track ${Date.now().toString().slice(-4)}`,
      description: body.description || `Generated with AI • Follow for more beats\n\n${platform === 'youtube' ? '🎵 ' : ''}#aimusic #phonk #drift`,
      hashtags: body.hashtags || ['#aimusic', '#phonk', '#drift', '#aggressive', '#beats'],
      thumbnail: `/api/thumbnail/${trackId || generationId}.jpg`,
      category: platform === 'youtube' ? 'Music' : undefined,
      privacy: body.privacy || 'public',
    },
    
    platformSpecific: getPlatformSpecificData(platform, body),
    
    delivery: {
      uploadUrl: `https://api.${platform}.com/upload/simulated`,
      statusUrl: `/api/publish/${publishId}-${platform}/status`,
      webhookUrl: `/api/webhooks/${platform}`,
    },
    
    estimatedPublishTime: new Date(now + (15 + Math.floor(Math.random() * 10)) * 60 * 1000).toISOString(),
  }))

  return NextResponse.json({
    publishId,
    trackId: trackId || generationId,
    status: 'processing',
    timestamp: new Date().toISOString(),
    
    publications,
    
    summary: {
      totalPlatforms: publications.length,
      scheduled: publications.length,
      published: 0,
      failed: 0,
    },
    
    analytics: {
      expectedReach: Math.floor(Math.random() * 50000) + 10000,
      viralPotential: parseFloat((Math.random() * 0.3 + 0.6).toFixed(2)),
      bestPostingTime: determineBestPostingTime(),
    },
    
    logs: [
      {
        level: 'info',
        message: `Initialized publication to ${publications.length} platform(s)`,
        timestamp: new Date().toISOString(),
      },
      ...publications.map(pub => ({
        level: 'info' as const,
        message: `Scheduled ${pub.platform} upload for ${pub.scheduledFor}`,
        timestamp: new Date().toISOString(),
      })),
    ],
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const publishId = searchParams.get('id')

  if (!publishId) {
    return NextResponse.json({ error: 'publishId required' }, { status: 400 })
  }

  // Mock de status de publicação
  return NextResponse.json({
    publishId,
    status: 'completed',
    publications: [
      {
        platform: 'tiktok',
        status: 'published',
        url: `https://tiktok.com/@aimusic/video/${Date.now()}`,
        publishedAt: new Date().toISOString(),
        metrics: {
          views: Math.floor(Math.random() * 10000) + 1000,
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 100) + 10,
          shares: Math.floor(Math.random() * 500) + 50,
        },
      },
      {
        platform: 'youtube',
        status: 'published',
        url: `https://youtube.com/shorts/${Date.now()}`,
        publishedAt: new Date().toISOString(),
        metrics: {
          views: Math.floor(Math.random() * 5000) + 500,
          likes: Math.floor(Math.random() * 500) + 50,
          comments: Math.floor(Math.random() * 50) + 5,
        },
      },
    ],
    totalReach: Math.floor(Math.random() * 15000) + 1500,
  })
}

function getPlatformSpecificData(platform: string, body: Record<string, unknown>) {
  switch (platform) {
    case 'tiktok':
      return {
        allowComments: body.allowComments !== false,
        allowDuet: body.allowDuet !== false,
        allowStitch: body.allowStitch !== false,
        suggestedSounds: body.suggestedSounds || [],
      }
    case 'youtube':
      return {
        madeForKids: false,
        monetization: body.monetization || 'enabled',
        shorts: true,
        tags: body.tags || ['music', 'phonk', 'ai', 'beats'],
      }
    case 'instagram':
      return {
        shareToFeed: body.shareToFeed !== false,
        shareToStory: body.shareToStory || false,
        locationTag: body.locationTag || null,
        collaborators: body.collaborators || [],
      }
    default:
      return {}
  }
}

function determineBestPostingTime() {
  const hour = new Date().getHours()
  if (hour >= 18 && hour <= 22) return 'current (peak evening)'
  if (hour >= 12 && hour <= 14) return 'lunch time'
  return 'evening (18:00-22:00)'
}

async function parseBody(request: Request) {
  try {
    return await request.json()
  } catch (_error) {
    return {}
  }
}
