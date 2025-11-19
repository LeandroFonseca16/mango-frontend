'use client'

import { useState } from 'react'
import { useGenerateMusicMutation, useTracksQuery } from '@/lib/hooks/useMusic'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Music, Sparkles, Download, Loader2, Play, Pause } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function GenerateMusicPage() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(8)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map())

  const generateMutation = useGenerateMusicMutation()
  const { data: tracks, isLoading: tracksLoading } = useTracksQuery(undefined, 20)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    try {
      const result = await generateMutation.mutateAsync({
        prompt,
        duration,
        userId: 'demo-user', // Replace with actual user ID from auth
      })

      if (result.success) {
        toast.success('🎵 Music generated successfully!')
        setPrompt('')
      } else {
        toast.error(result.error || 'Failed to generate music')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate music')
    }
  }

  const handlePlayPause = (trackId: string, audioUrl: string) => {
    let audio = audioElements.get(trackId)
    
    if (!audio) {
      audio = new Audio()
      // Use the audioUrl directly - Next.js rewrites will proxy to backend
      audio.src = audioUrl
      audio.preload = 'metadata'
      setAudioElements(new Map(audioElements.set(trackId, audio)))
    }
    
    if (currentlyPlaying === trackId) {
      audio.pause()
      setCurrentlyPlaying(null)
    } else {
      // Pause any other playing audio
      audioElements.forEach((a, id) => {
        if (id !== trackId) {
          a.pause()
        }
      })

      audio.play().catch(err => {
        console.error('Error playing audio:', err)
        toast.error('Failed to play audio')
      })
      setCurrentlyPlaying(trackId)
      
      audio.onended = () => {
        setCurrentlyPlaying(null)
      }
    }
  }

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      toast.success('Download started!')
    } catch {
      toast.error('Failed to download track')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-surface p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Music className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Music Generator
            </h1>
          </div>
          <p className="text-text-muted text-lg">
            Powered by OpenAI TTS
          </p>
        </div>

        {/* Generator Card */}
        <Card variant="glass" className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Describe the music you want
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Upbeat electronic dance music with heavy bass and synth melodies..."
                className="w-full h-32 px-4 py-3 bg-surface/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-text placeholder:text-text-muted"
                disabled={generateMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Duration: {duration} seconds
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                disabled={generateMutation.isPending}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !prompt.trim()}
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={generateMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Music'}
            </Button>
          </div>
        </Card>

        {/* Tracks List */}
        <div>
          <h2 className="text-2xl font-bold text-text mb-6">Recent Generations</h2>
          
          {tracksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks?.map((track) => (
                <Card key={track.id} variant="glass" className="p-6 hover:border-primary/50 transition-all">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-text line-clamp-1">{track.title}</h3>
                      <p className="text-sm text-text-muted line-clamp-2 mt-1">
                        {track.prompt || track.description || 'No description'}
                      </p>
                    </div>

                    {track.audioUrl && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlayPause(track.id, track.audioUrl!)}
                          leftIcon={currentlyPlaying === track.id ? <Pause /> : <Play />}
                          fullWidth
                        >
                          {currentlyPlaying === track.id ? 'Pause' : 'Play'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(track.audioUrl!, track.title)}
                          leftIcon={<Download />}
                        >
                          Download
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-text-muted">
                      {track.duration && <span>{track.duration}s</span>}
                      {' • '}
                      <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              ))}

              {tracks?.length === 0 && (
                <div className="col-span-full text-center py-12 text-text-muted">
                  <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No tracks yet. Generate your first music!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
