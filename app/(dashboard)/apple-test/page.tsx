'use client'

import { useState } from 'react'
import { MinimalPlayer } from '@/components/player/MinimalPlayer'
import { AppleCard, AppleButton, AppleBadge } from '@/components/ui/AppleUI'
import { AppleSpinner, AppleProgress, ApplePulse, AppleSkeleton } from '@/components/ui/AppleLoading'
import { Music, Play, Heart, Download, Search, Plus, Star, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AppleTestPage() {
  const [progress, setProgress] = useState(45)

  // Sample audio data (base64 encoded short beep for testing)
  const sampleAudio = "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Back Button */}
        <Link href="/dashboard">
          <AppleButton variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
            Voltar ao Dashboard
          </AppleButton>
        </Link>

        {/* Header */}
        <div className="text-center space-y-4 animate-slide-in-up">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mango-500 via-mango-400 to-yellow-500">
            Apple Design System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Componentes premium com animações fluidas e micro-interações elegantes
          </p>
        </div>

        {/* Audio Player Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-mango-500" />
            <h2 className="text-3xl font-semibold">Audio Player Premium</h2>
          </div>
          
          <AppleCard variant="elevated" className="p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold mb-1">Phonk Beat Vibes</h3>
                  <p className="text-muted-foreground">Criado com IA • Estilo Memphis</p>
                </div>
                <AppleBadge variant="primary">
                  <Star className="h-3 w-3 mr-1" />
                  EM ALTA
                </AppleBadge>
              </div>
              
              <MinimalPlayer 
                source={sampleAudio}
                onPlayState={(playing) => console.log('Playing:', playing)}
              />
              
              <div className="flex gap-3">
                <AppleButton variant="primary" icon={<Heart className="h-4 w-4" />}>
                  Favoritar
                </AppleButton>
                <AppleButton variant="secondary" icon={<Download className="h-4 w-4" />}>
                  Download
                </AppleButton>
              </div>
            </div>
          </AppleCard>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Buttons</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Primary</h3>
              <div className="space-y-3">
                <AppleButton variant="primary" size="lg" icon={<Plus />}>
                  Criar Nova Faixa
                </AppleButton>
                <AppleButton variant="primary" size="md" icon={<Play />}>
                  Reproduzir
                </AppleButton>
                <AppleButton variant="primary" size="sm">
                  Pequeno
                </AppleButton>
              </div>
            </AppleCard>

            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Secondary</h3>
              <div className="space-y-3">
                <AppleButton variant="secondary" size="lg">
                  Explorar
                </AppleButton>
                <AppleButton variant="secondary" size="md" icon={<Search />}>
                  Buscar
                </AppleButton>
                <AppleButton variant="secondary" size="sm">
                  Filtrar
                </AppleButton>
              </div>
            </AppleCard>

            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Ghost</h3>
              <div className="space-y-3">
                <AppleButton variant="ghost" size="lg">
                  Cancelar
                </AppleButton>
                <AppleButton variant="ghost" size="md">
                  Editar
                </AppleButton>
                <AppleButton variant="ghost" size="sm">
                  Ver Mais
                </AppleButton>
              </div>
            </AppleCard>
          </div>
        </section>

        {/* Progress Bars */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Progress</h2>
          
          <AppleCard variant="elevated" className="p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Processando música...</h3>
                <button
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  className="text-sm text-mango-500 hover:text-mango-400 px-4 py-2 rounded-full hover:bg-muted/30 transition-colors"
                >
                  +10%
                </button>
              </div>
              <AppleProgress value={progress} showLabel color="primary" />
            </div>
          </AppleCard>
        </section>

        {/* Loading States */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Loading States</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Spinners</h3>
              <div className="flex items-center gap-4">
                <AppleSpinner size="sm" color="primary" />
                <AppleSpinner size="md" color="primary" />
                <AppleSpinner size="lg" color="primary" />
              </div>
            </AppleCard>

            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Pulse</h3>
              <div className="flex items-center gap-6">
                <ApplePulse />
                <div className="flex items-center gap-2">
                  <ApplePulse />
                  <span className="text-sm text-muted-foreground">Ao vivo</span>
                </div>
              </div>
            </AppleCard>

            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Skeletons</h3>
              <div className="space-y-3">
                <AppleSkeleton variant="text" count={3} className="w-full" />
              </div>
            </AppleCard>
          </div>
        </section>

        {/* Animation Classes */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold">Animations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Float Animation</h3>
              <div className="flex justify-center py-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-mango-400 to-mango-600 animate-float shadow-2xl flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
            </AppleCard>

            <AppleCard variant="flat" className="p-6">
              <h3 className="font-semibold mb-4">Shimmer Effect</h3>
              <div className="py-8">
                <div className="h-20 rounded-2xl bg-muted/50 animate-shimmer" />
              </div>
            </AppleCard>
          </div>
        </section>

      </div>
    </div>
  )
}
