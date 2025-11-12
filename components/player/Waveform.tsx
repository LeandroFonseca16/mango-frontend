"use client"
import { motion } from 'framer-motion'

export function Waveform({ data, barWidth = 3, gap = 2, color = 'bg-primary/60' }: { data: number[]; barWidth?: number; gap?: number; color?: string }) {
  return (
    <div className="h-40 relative flex items-end overflow-hidden" style={{ gap }}>
      {data.map((v, i) => (
        <div
          key={i}
          className={`${color} rounded-t`}
          style={{ height: `${Math.max(4, v * 60)}px`, width: `${barWidth}px` }}
        />
      ))}
    </div>
  )
}

export function GeneratingWave({ count = 120, barWidth = 3, gap = 2 }: { count?: number; barWidth?: number; gap?: number }) {
  return (
    <div className="absolute inset-0 flex items-end" style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-primary/30 rounded-t"
          style={{ width: `${barWidth}px` }}
          animate={{ height: [8, 32, 14, 48, 20, 36][i % 6] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.02 }}
        />
      ))}
    </div>
  )
}
