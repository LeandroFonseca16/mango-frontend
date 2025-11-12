'use client'

import { Palette } from 'lucide-react'
import { useTheme, themes } from '../providers/ThemeProvider'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-ghost btn-sm"
        aria-label="Select theme"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{themes[theme].name}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-72 z-50"
            >
              <div className="glass rounded-lg border border-border shadow-lg p-3">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                  Choose Your Vibe
                </div>
                <div className="space-y-1">
                  {(Object.entries(themes) as [keyof typeof themes, typeof themes[keyof typeof themes]][]).map(
                    ([key, { name, color, description }]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setTheme(key)
                          setIsOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          theme === key
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {description}
                          </div>
                        </div>
                        {theme === key && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
