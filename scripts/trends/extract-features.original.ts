import { FeatureExtractionStatus } from '@prisma/client'
import { spawn } from 'node:child_process'
import fs from 'fs-extra'
import path from 'node:path'
import process from 'node:process'
import pLimit from 'p-limit'
import { prisma } from '../../lib/prisma'

const CONCURRENCY = 1

async function main() {
  const events = await prisma.trend_events.findMany({
    include: { features: true },
    orderBy: { collectedAt: 'desc' },
  })

  type TrendEventWithFeatures = (typeof events)[number]

  const needsExtraction = (event: TrendEventWithFeatures) =>
    !event.features || event.features.status !== FeatureExtractionStatus.COMPLETED

  const pending = events.filter((event) => needsExtraction(event))

  if (pending.length === 0) {
    console.log('✨ No trend events require feature extraction')
    return
  }

  console.log(`🎚️  Extracting audio features for ${pending.length} trend(s) ...`)
  const limit = pLimit(CONCURRENCY)

  await Promise.all(pending.map((event) => limit(() => processEvent(event.id))))

  console.log('✅ Feature extraction complete')
}

async function processEvent(eventId: string) {
  const event = await prisma.trend_events.findUnique({
    where: { id: eventId },
    include: { features: true },
  })

  if (!event) return

  const audioPath = resolveAudioPath(event.metadata)
  if (!audioPath) {
    await upsertFeature(event.id, {
      status: FeatureExtractionStatus.FAILED,
      errorMessage: 'Nenhum caminho de áudio local encontrado no metadata',
    })
    return
  }

  try {
    const absolutePath = path.isAbsolute(audioPath)
      ? audioPath
      : path.join(process.cwd(), audioPath)

    const exists = await fs.pathExists(absolutePath)
    if (!exists) {
      throw new Error(`Arquivo de áudio não encontrado: ${absolutePath}`)
    }

    const result = await runLibrosa(absolutePath)
    await upsertFeature(event.id, {
      status: FeatureExtractionStatus.COMPLETED,
      bpm: result.bpm,
      musicalKey: result.musicalKey,
      energy: result.energy,
      loudness: result.loudness,
      spectralFlux: result.spectralFlux,
      errorMessage: null,
    })
    console.log(`🎧 Features extracted for ${event.title}`)
  } catch (error) {
    console.error(`❌ Failed to extract features for ${event.title}:`, error)
    await upsertFeature(event.id, {
      status: FeatureExtractionStatus.FAILED,
      errorMessage: (error as Error).message,
    })
  }
}

async function upsertFeature(
  trendEventId: string,
  payload: {
    status: FeatureExtractionStatus
    bpm?: number | null
    musicalKey?: string | null
    energy?: number | null
    loudness?: number | null
    spectralFlux?: number | null
    errorMessage?: string | null
  }
) {
  await prisma.trend_features.upsert({
    where: { trendEventId },
    create: {
      trendEventId,
      status: payload.status,
      bpm: payload.bpm ?? null,
      musicalKey: payload.musicalKey ?? null,
      energy: payload.energy ?? null,
      loudness: payload.loudness ?? null,
      spectralFlux: payload.spectralFlux ?? null,
      errorMessage: payload.errorMessage ?? null,
    },
    update: {
      status: payload.status,
      bpm: payload.bpm ?? null,
      musicalKey: payload.musicalKey ?? null,
      energy: payload.energy ?? null,
      loudness: payload.loudness ?? null,
      spectralFlux: payload.spectralFlux ?? null,
      errorMessage: payload.errorMessage ?? null,
      extractedAt: new Date(),
    },
  })
}

async function runLibrosa(audioPath: string): Promise<LibrosaResult> {
  const pythonExecutable = process.env.PYTHON_EXECUTABLE || process.env.PYTHON || 'python'
  const scriptPath = path.join('scripts', 'trends', 'extract_features.py')

  return new Promise<LibrosaResult>((resolve, reject) => {
    const subprocess = spawn(pythonExecutable, [scriptPath, '--input', audioPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    subprocess.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    subprocess.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    subprocess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr.trim() || `Librosa extractor exited with code ${code}`))
      }
      try {
        const parsed = JSON.parse(stdout) as LibrosaResult
        resolve(parsed)
      } catch (error) {
        reject(new Error(`Failed to parse librosa output: ${(error as Error).message}`))
      }
    })
  })
}

function resolveAudioPath(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null

  const record = metadata as Record<string, unknown>

  if (typeof record.localAudioPath === 'string') {
    return record.localAudioPath
  }

  const fallback = record.fallbackMetrics
  if (fallback && typeof fallback === 'object') {
    const fallbackRecord = fallback as Record<string, unknown>
    if (typeof fallbackRecord.localAudioPath === 'string') {
      return fallbackRecord.localAudioPath
    }
  }

  return null
}

main()
  .catch((error) => {
    console.error('❌ Feature extraction pipeline failed', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

type LibrosaResult = {
  bpm: number | null
  musicalKey: string | null
  energy: number | null
  loudness: number | null
  spectralFlux: number | null
}
