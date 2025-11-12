"use client"
import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { AudioVisualizer } from './AudioVisualizer'

export function MinimalPlayer({ source, onPlayState }: { source: string; onPlayState?: (playing: boolean) => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)

  // Ensure single audio element and update src safely
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
      audioRef.current.volume = volume
      
      audioRef.current.addEventListener('ended', () => {
        setPlaying(false)
        onPlayState?.(false)
      })
      audioRef.current.addEventListener('pause', () => {
        setPlaying(false)
        onPlayState?.(false)
      })
      audioRef.current.addEventListener('play', () => {
        setPlaying(true)
        onPlayState?.(true)
      })
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0)
      })
    }
    if (audioRef.current) {
      const el = audioRef.current
      const wasPlaying = !el.paused
      el.pause()
      el.src = `data:audio/wav;base64,${source}`
      el.currentTime = 0
      // Optionally resume if it was playing before source change
      if (wasPlaying) {
        el.play().catch(() => {/* ignore AbortError */})
      }
    }
  }, [source, onPlayState, volume])

  async function toggle() {
    const el = audioRef.current
    if (!el) return
    if (!el.src) {
      el.src = `data:audio/wav;base64,${source}`
      el.load()
    }
    if (!el.paused) {
      el.pause()
      return
    }
    try {
      if (el.ended || el.currentTime === 0 && el.readyState === 0) {
        el.currentTime = 0
      }
      await el.play()
    } catch {
      try { await Promise.resolve(); el.currentTime = 0; await el.play() } catch {}
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  function toggleMute() {
    if (audioRef.current) {
      if (volume > 0) {
        setVolume(0)
        audioRef.current.volume = 0
      } else {
        setVolume(0.8)
        audioRef.current.volume = 0.8
      }
    }
  }

  function formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="group relative w-full rounded-3xl bg-gradient-to-br from-background/95 to-muted/30 backdrop-blur-2xl border border-border/40 overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.01]">
      {/* Audio Visualizer - Apple Music Style */}
      <div className="absolute inset-0 pointer-events-none">
        <AudioVisualizer 
          audioElement={audioRef.current} 
          isPlaying={playing}
          color="#FF8C00"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-6 p-8">
        {/* Play Button & Time */}
        <div className="flex items-center gap-6">
          {/* Play/Pause Button - Apple Style with Ripple Effect */}
          <button
            onClick={toggle}
            className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-mango-400 via-mango-500 to-mango-600 text-white shadow-2xl shadow-mango-500/40 transition-all duration-300 hover:scale-110 hover:shadow-3xl hover:shadow-mango-500/60 active:scale-95 before:absolute before:inset-0 before:rounded-full before:bg-white/20 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300"
          >
            <div className="relative z-10">
              {playing ? (
                <Pause className="h-7 w-7 fill-current drop-shadow-lg" />
              ) : (
                <Play className="h-7 w-7 fill-current ml-1 drop-shadow-lg" />
              )}
            </div>
            {/* Pulse animation when playing */}
            {playing && (
              <>
                <span className="absolute inset-0 rounded-full bg-mango-500/50 animate-ping" />
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-mango-400/50 to-mango-600/50 animate-pulse" />
              </>
            )}
          </button>

          {/* Progress Bar - Apple Style */}
          <div className="flex-1 space-y-3">
            <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm group/progress">
              {/* Progress Fill with Glow */}
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-mango-500 via-mango-400 to-yellow-500 transition-all duration-150 rounded-full shadow-lg shadow-mango-500/50"
                style={{ width: `${progress}%` }}
              />
              {/* Playhead Indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
              />
              {/* Seek Input */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>

            {/* Time Display - Apple Typography */}
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground/80 tracking-wider">
              <span className="tabular-nums">{formatTime(currentTime)}</span>
              <span className="text-[10px] text-muted-foreground/50">◆</span>
              <span className="tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Volume Control - Elegant Apple Style */}
        <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-muted/50 transition-all duration-200 active:scale-95"
          >
            {volume > 0 ? (
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <div className="relative flex-1 h-1 bg-muted/30 rounded-full overflow-hidden group/volume">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-mango-500/70 to-mango-400/70 rounded-full transition-all shadow-md shadow-mango-500/30"
              style={{ width: `${volume * 100}%` }}
            />
            {/* Volume Indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg opacity-0 group-hover/volume:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${volume * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground/70 tabular-nums w-12 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
