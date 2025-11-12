"use client"
import { motion } from 'framer-motion'

export interface TrendItem { id: number; label: string; velocity: string; energy: number }

export function TrendsFeed({ items }: { items: TrendItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map(t => (
        <motion.div
          key={t.id}
          layout
          whileHover={{ scale: 1.015 }}
          className="group flex items-center justify-between rounded-lg border border-border px-3 py-2 bg-card/40 hover:bg-card/70 transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{t.label}</span>
            <span className="text-[11px] text-primary font-mono">{t.velocity}</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 8 }).map((_, i) => {
              const active = i < Math.round(t.energy * 8)
              return <div key={i} className={`h-5 w-1 rounded-sm ${active ? 'bg-primary/80' : 'bg-border'}`}></div>
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
