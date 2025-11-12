import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type GenerationStatus = 'idle' | 'generating' | 'ready' | 'error'

export interface TrackData {
  id: string
  prompt: string
  audioBase64: string
  waveform: number[]
  createdAt: Date
}

interface GenerationState {
  prompt: string
  status: GenerationStatus
  current?: TrackData
  history: TrackData[]
  setPrompt: (v: string) => void
  start: (prompt: string) => void
  complete: (audioBase64: string, waveform: number[]) => void
  reset: () => void
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  prompt: 'criar música phonk viral baseada em tendências atuais do tik tok com bass sujo e atmosfera escura',
  status: 'idle',
  history: [],
  setPrompt: (v) => set({ prompt: v }),
  start: (prompt) => set({ status: 'generating', prompt }),
  complete: (audioBase64, waveform) => {
    const prompt = get().prompt
    const track: TrackData = { id: nanoid(), prompt, audioBase64, waveform, createdAt: new Date() }
    set({ status: 'ready', current: track, history: [track, ...get().history].slice(0, 25) })
  },
  reset: () => set({ status: 'idle', current: undefined })
}))
