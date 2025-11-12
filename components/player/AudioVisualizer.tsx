"use client"
import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null
  isPlaying: boolean
  color?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
}

export function AudioVisualizer({ audioElement, isPlaying, color = '#FF8C00' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()
  const audioContextRef = useRef<AudioContext>()
  const sourceRef = useRef<MediaElementAudioSourceNode>()
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)

  useEffect(() => {
    if (!audioElement || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with pixel density
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    // Initialize Web Audio API
    if (!audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (!analyserRef.current && audioContextRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 128 // Reduzido para melhor performance
      analyserRef.current.smoothingTimeConstant = 0.8 // Mais suave
    }

    // Connect audio element to analyser
    if (!sourceRef.current && audioContextRef.current && analyserRef.current) {
      try {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement)
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      } catch (_e) {
        // Already connected
      }
    }

    const analyser = analyserRef.current
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    // Particle system
    const createParticle = (x: number, y: number, intensity: number): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * intensity * 3,
      vy: (Math.random() - 0.5) * intensity * 3,
      life: 0,
      maxLife: 40 + Math.random() * 40,
      size: 1.5 + Math.random() * 2.5,
      hue: 25 + Math.random() * 35
    })

    const draw = () => {
      if (!ctx || !canvas) return

      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const centerX = width / 2
      const centerY = height / 2

      analyser.getByteFrequencyData(dataArray)
      timeRef.current += 0.03

      // Clear with fade for trail effect - muito mais claro
      ctx.fillStyle = isPlaying ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.4)'
      ctx.fillRect(0, 0, width, height)

      const radius = Math.min(width, height) * 0.26
      const barCount = 48 // Reduzido ainda mais para melhor performance
      const angleStep = (Math.PI * 2) / barCount
      const avgFrequency = dataArray.reduce((a, b) => a + b) / bufferLength / 255

      if (isPlaying) {
        // Background glow - muito mais suave
        const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 2)
        bgGradient.addColorStop(0, `rgba(255, 160, 0, ${avgFrequency * 0.06})`)
        bgGradient.addColorStop(0.6, `rgba(255, 140, 0, ${avgFrequency * 0.03})`)
        bgGradient.addColorStop(1, 'rgba(255, 100, 0, 0)')
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, width, height)

        // Draw waveform bars com APENAS 1 layer
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * bufferLength)
          const value = dataArray[dataIndex] / 255
          const angle = i * angleStep - Math.PI / 2

          for (let layer = 0; layer < 1; layer++) {
            const layerRadius = radius * (1 + layer * 0.15)
            const layerValue = value * (1 - layer * 0.3)
            const barLength = layerRadius * 0.45 * layerValue // Barras um pouco menores
            
            const x1 = centerX + Math.cos(angle) * layerRadius
            const y1 = centerY + Math.sin(angle) * layerRadius
            const x2 = centerX + Math.cos(angle) * (layerRadius + barLength)
            const y2 = centerY + Math.sin(angle) * (layerRadius + barLength)

            const hue = 30 + (i / barCount) * 30 // Range de cor mais suave
            const opacity = 0.6 + layerValue * 0.4 - layer * 0.25

            const barGradient = ctx.createLinearGradient(x1, y1, x2, y2)
            barGradient.addColorStop(0, `hsla(${hue}, 95%, 60%, ${opacity * 0.5})`)
            barGradient.addColorStop(1, `hsla(${hue}, 95%, 55%, ${opacity})`)
            
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = barGradient
            ctx.lineWidth = 2.5 - layer * 0.5
            ctx.lineCap = 'round'
            ctx.stroke()

            ctx.shadowBlur = 10 - layer * 3 // Blur mais suave
            ctx.shadowColor = `hsla(${hue}, 95%, 55%, ${opacity * 0.5})`
          }

          // Spawn particles - muito reduzido
          if (value > 0.75 && Math.random() < 0.08) { // Threshold muito maior, 50% menos partículas
            const pAngle = angle + (Math.random() - 0.5) * 0.3
            const pRadius = radius * 1.3
            particlesRef.current.push(
              createParticle(
                centerX + Math.cos(pAngle) * pRadius,
                centerY + Math.sin(pAngle) * pRadius,
                value
              )
            )
          }
        }

        // Center orb - minimalista
        const orbPulse = 1 + avgFrequency * 0.2 + Math.sin(timeRef.current * 1.5) * 0.05
        const orbRadius = radius * 0.18 * orbPulse // Orbe menor
        
        // Orb gradient - simples e leve
        const orbGradient = ctx.createRadialGradient(
          centerX - orbRadius * 0.3,
          centerY - orbRadius * 0.3,
          0,
          centerX,
          centerY,
          orbRadius
        )
        orbGradient.addColorStop(0, 'rgba(255, 245, 180, 0.7)')
        orbGradient.addColorStop(0.4, 'rgba(255, 200, 80, 0.6)')
        orbGradient.addColorStop(1, 'rgba(255, 140, 30, 0.5)')
        
        ctx.fillStyle = orbGradient
        ctx.shadowBlur = 12 // Blur muito reduzido
        ctx.shadowColor = 'rgba(255, 150, 0, 0.5)'
        ctx.beginPath()
        ctx.arc(centerX, centerY, orbRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Outer ring - simples
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 150, 0, ${0.15 + avgFrequency * 0.25})`
        ctx.lineWidth = 1.2
        ctx.stroke()

        // Anel interno removido para claridade

      } else {
        // Idle state - mais clean
        const idleBarCount = 48 // Menos barras no idle
        const idleAngleStep = (Math.PI * 2) / idleBarCount
        
        for (let i = 0; i < idleBarCount; i++) {
          const angle = i * idleAngleStep - Math.PI / 2
          const idleValue = 0.1 + Math.sin(timeRef.current * 0.5 + i * 0.2) * 0.05
          const barLength = radius * 0.15 * idleValue
          
          const x1 = centerX + Math.cos(angle) * radius
          const y1 = centerY + Math.sin(angle) * radius
          const x2 = centerX + Math.cos(angle) * (radius + barLength)
          const y2 = centerY + Math.sin(angle) * (radius + barLength)

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = `rgba(255, 140, 0, ${0.3 + idleValue * 0.5})`
          ctx.lineWidth = 1.5
          ctx.lineCap = 'round'
          ctx.stroke()
        }

        // Idle orb - mais claro
        const orbGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.18)
        orbGrad.addColorStop(0, 'rgba(255, 200, 80, 0.5)')
        orbGrad.addColorStop(1, 'rgba(255, 140, 30, 0.25)')
        ctx.fillStyle = orbGrad
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius * 0.18, 0, Math.PI * 2)
        ctx.fill()
      }

      // Particles - renderização otimizada
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.95
        p.vy *= 0.95
        p.life++

        const alpha = 1 - (p.life / p.maxLife)
        if (alpha <= 0) return false

        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${alpha * 0.7})` // Mais transparente
        ctx.shadowBlur = 6 // Blur reduzido
        ctx.shadowColor = `hsla(${p.hue}, 95%, 60%, ${alpha * 0.6})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        return true
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioElement, isPlaying, color])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}
