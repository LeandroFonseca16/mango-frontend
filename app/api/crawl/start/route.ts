import { NextResponse } from 'next/server'
import { loadSyntheticTrends } from '@/lib/stubs/trends'

export async function POST(request: Request) {
  const synthetic = await loadSyntheticTrends()
  const body = await parseBody(request)

  const jobId = `crawl-${Date.now()}`
  const sample = synthetic.slice(0, 20)

  return NextResponse.json({
    jobId,
    status: 'completed',
    sourceUrl: body.url ?? 'https://example.com/stub-feed',
    discoveredCount: sample.length,
    nextScheduledRun: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    trends: sample,
  })
}

async function parseBody(request: Request) {
  try {
    return await request.json()
  } catch (error) {
    return {}
  }
}
