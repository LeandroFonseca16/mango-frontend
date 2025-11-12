export interface GeneratedTrackMeta {
  id: string
  prompt: string
  duration: number
  sampleRate: number
  waveform: number[]
  createdAt: string
}

function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

export async function generateMockTrack(prompt: string): Promise<GeneratedTrackMeta> {
  // Build deterministic pseudo-random based on prompt hash
  const hash = [...prompt].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rand = seededRandom(hash)
  const len = 160
  const waveform = Array.from({ length: len }, (_, i) => {
    const base = Math.sin(i * 0.12) * 0.5 + Math.sin(i * 0.031) * 0.25
    const noise = (rand() - 0.5) * 0.6
    return Math.max(0, Math.min(1, 0.5 + base * 0.3 + noise * 0.3))
  })
  await new Promise((r) => setTimeout(r, 1400))
  return {
    id: crypto.randomUUID(),
    prompt,
    duration: 12,
    sampleRate: 44100,
    waveform,
    createdAt: new Date().toISOString(),
  }
}
