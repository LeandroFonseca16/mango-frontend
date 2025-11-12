import { FeatureExtractionStatus } from '@prisma/client'
import { spawn } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import process from 'process'
import { prisma } from '../../lib/prisma'

type TrendEventWithFeatures = {
  id: string
  features: {
    status: FeatureExtractionStatus
  } | null
}

async function main() {
  const events = await prisma.trend_events.findMany({
    include: { features: true },
    orderBy: { collectedAt: 'desc' },
  })

  if (events.length === 0) {
    console.log('✨ No trend events found')
    return
  }

  const pending = events.filter(
    (event: TrendEventWithFeatures): event is TrendEventWithFeatures =>
      !event.features || event.features.status !== FeatureExtractionStatus.COMPLETED
  )

  if (pending.length === 0) {
    console.log('✨ No trend events require feature extraction')
    return
  }

  console.log(`🎚️  Extracting audio features for ${pending.length} trend(s) ...`)
  for (const event of pending) {
    await processEvent(event.id)
  }

  console.log('✅ Feature extraction complete')
}

async function processEvent(eventId: string) {
  console.log('Processing event', eventId)
}

main().catch((error) => {
	console.error('❌ Feature extraction pipeline failed', error)
	process.exitCode = 1
}).finally(async () => {
	await prisma.$disconnect()
})
