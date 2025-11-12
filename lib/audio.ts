export function encodeWavFromEnvelope(envelope: number[], durationSec: number, sampleRate = 44100): string {
  const totalSamples = Math.floor(durationSec * sampleRate)
  const channels = 1
  const bitsPerSample = 16
  const data = new Float32Array(totalSamples)

  for (let i = 0; i < totalSamples; i++) {
    const t = i / totalSamples
    const idx = Math.floor(t * (envelope.length - 1))
    const amp = envelope[idx]
    // Simple tone stack shaped by envelope
    const s =
      Math.sin(2 * Math.PI * 220 * (i / sampleRate)) * 0.5 +
      Math.sin(2 * Math.PI * 440 * (i / sampleRate)) * 0.3 +
      Math.sin(2 * Math.PI * 110 * (i / sampleRate)) * 0.2
    data[i] = s * amp * 0.6
  }

  // Convert Float32 -> 16-bit PCM
  const buffer = new ArrayBuffer(44 + totalSamples * 2)
  const view = new DataView(buffer)

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  const blockAlign = channels * (bitsPerSample / 8)
  const byteRate = sampleRate * blockAlign

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + totalSamples * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // PCM chunk size
  view.setUint16(20, 1, true) // format PCM
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, totalSamples * 2, true)

  let offset = 44
  for (let i = 0; i < totalSamples; i++, offset += 2) {
  const sample = Math.max(-1, Math.min(1, data[i]))
  view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }

  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}
