import fs from 'node:fs'
import path from 'node:path'

const SAMPLE_RATE = 44100

type SampleSpec = {
  fileName: string
  durationSec: number
  pattern: (t: number) => number
}

const SAMPLES: SampleSpec[] = [
  {
    fileName: 'phonk-drift.wav',
    durationSec: 12,
    pattern: (t) => {
      const base = Math.sin(2 * Math.PI * 90 * t)
      const bass = Math.sin(2 * Math.PI * 45 * t) * 0.6
      const hat = Math.sin(2 * Math.PI * 360 * t) * (Math.sin(2 * Math.PI * 2 * t) > 0 ? 0.2 : 0)
      return base * 0.4 + bass * 0.5 + hat
    },
  },
  {
    fileName: 'synthwave-loop.wav',
    durationSec: 14,
    pattern: (t) => {
      const pad = Math.sin(2 * Math.PI * 160 * t) * 0.3
      const arp = Math.sin(2 * Math.PI * 320 * t + Math.sin(2 * Math.PI * 0.5 * t)) * 0.4
      const bass = Math.sin(2 * Math.PI * 80 * t) * 0.2
      return pad + arp + bass
    },
  },
  {
    fileName: 'ambient-pads.wav',
    durationSec: 20,
    pattern: (t) => {
      const slowPad = Math.sin(2 * Math.PI * 70 * t) * 0.3
      const shimmer = Math.sin(2 * Math.PI * 540 * t) * 0.1
      return slowPad + shimmer
    },
  },
  {
    fileName: '808-bounce.wav',
    durationSec: 10,
    pattern: (t) => {
      const bass = Math.sin(2 * Math.PI * 55 * t) * (Math.sin(2 * Math.PI * 1 * t) > 0 ? 0.7 : 0.2)
      const click = Math.sin(2 * Math.PI * 880 * t) * (Math.sin(2 * Math.PI * 4 * t) > 0.9 ? 0.3 : 0)
      return bass + click
    },
  },
]

function main() {
  const targetDir = path.join(process.cwd(), 'data', 'trends')
  fs.mkdirSync(targetDir, { recursive: true })

  for (const sample of SAMPLES) {
    const buffer = createWavBuffer(sample, SAMPLE_RATE)
    const filePath = path.join(targetDir, sample.fileName)
    fs.writeFileSync(filePath, buffer)
    console.log(`Generated ${filePath}`)
  }
}

function createWavBuffer(spec: SampleSpec, sampleRate: number): Buffer {
  const totalSamples = Math.floor(spec.durationSec * sampleRate)
  const dataBuffer = Buffer.alloc(totalSamples * 2) // 16-bit mono

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate
    let sampleValue = spec.pattern(t)
    sampleValue = Math.max(-1, Math.min(1, sampleValue))
    const intSample = Math.floor(sampleValue * 32767)
    dataBuffer.writeInt16LE(intSample, i * 2)
  }

  const header = createWavHeader(totalSamples, sampleRate)
  return Buffer.concat([header, dataBuffer])
}

function createWavHeader(totalSamples: number, sampleRate: number): Buffer {
  const blockAlign = 2 // mono 16-bit
  const byteRate = sampleRate * blockAlign
  const dataChunkSize = totalSamples * blockAlign
  const riffChunkSize = 36 + dataChunkSize

  const buffer = Buffer.alloc(44)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(riffChunkSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16) // Subchunk1Size
  buffer.writeUInt16LE(1, 20) // AudioFormat PCM
  buffer.writeUInt16LE(1, 22) // NumChannels
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(blockAlign, 32)
  buffer.writeUInt16LE(16, 34) // BitsPerSample
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataChunkSize, 40)
  return buffer
}

main()
