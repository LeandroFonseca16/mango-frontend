'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Music, Sparkles, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function CreateTrackPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    genre: 'phonk',
    description: '',
    duration: 30,
    bpm: 140,
    mood: 'energetic',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao criar track')
      }

      await res.json()
      toast.success('Track criada com sucesso! Processamento iniciado...')
      router.push('/tracks')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar track'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const genres = [
    { value: 'phonk', label: 'Phonk', emoji: '🔥' },
    { value: 'lofi', label: 'Lo-Fi', emoji: '🎧' },
    { value: 'funk', label: 'Funk', emoji: '💃' },
    { value: 'trap', label: 'Trap', emoji: '💎' },
    { value: 'chill', label: 'Chill', emoji: '🌊' },
    { value: 'drill', label: 'Drill', emoji: '⚡' },
  ]

  const moods = [
    { value: 'energetic', label: 'Energético' },
    { value: 'calm', label: 'Calmo' },
    { value: 'dark', label: 'Sombrio' },
    { value: 'happy', label: 'Feliz' },
    { value: 'aggressive', label: 'Agressivo' },
    { value: 'romantic', label: 'Romântico' },
  ]

  return (
    <div className="container-narrow py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/tracks">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Voltar para tracks
          </Button>
        </Link>
        
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Music className="h-10 w-10 text-primary" />
            Criar Nova Track
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure os parâmetros e deixe a IA criar sua música
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Defina o título e descrição da sua track
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título da Track *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Ex: Phonk Sunset Vibes"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <textarea
                id="description"
                placeholder="Descreva o estilo, atmosfera ou qualquer detalhe que ajude a IA..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="text-xs text-muted-foreground">
                A descrição ajuda a IA a entender melhor o que você quer
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Parâmetros Musicais</CardTitle>
            <CardDescription>
              Ajuste o gênero, humor e características técnicas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Genre Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Gênero Musical *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, genre: genre.value })}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.genre === genre.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="text-2xl mb-1">{genre.emoji}</div>
                    <div className="font-medium">{genre.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <label htmlFor="mood" className="text-sm font-medium">
                Clima/Atmosfera *
              </label>
              <select
                id="mood"
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer"
              >
                {moods.map((mood) => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium flex items-center justify-between">
                <span>Duração (segundos)</span>
                <span className="text-muted-foreground">{formData.duration}s</span>
              </label>
              <input
                id="duration"
                type="range"
                min="15"
                max="120"
                step="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15s</span>
                <span>120s</span>
              </div>
            </div>

            {/* BPM */}
            <div className="space-y-2">
              <label htmlFor="bpm" className="text-sm font-medium flex items-center justify-between">
                <span>BPM (Batidas por minuto)</span>
                <span className="text-muted-foreground">{formData.bpm}</span>
              </label>
              <input
                id="bpm"
                type="range"
                min="60"
                max="200"
                step="5"
                value={formData.bpm}
                onChange={(e) => setFormData({ ...formData, bpm: parseInt(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>60 (Lento)</span>
                <span>200 (Rápido)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card variant="default" className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-2 flex-1">
                <h3 className="font-semibold">Preview da Configuração</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Gênero:</span>
                    <span className="ml-2 font-medium capitalize">{formData.genre}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clima:</span>
                    <span className="ml-2 font-medium">{moods.find(m => m.value === formData.mood)?.label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="ml-2 font-medium">{formData.duration}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">BPM:</span>
                    <span className="ml-2 font-medium">{formData.bpm}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Sparkles className="h-5 w-5" />}
            fullWidth
          >
            {isLoading ? 'Criando...' : 'Criar com IA'}
          </Button>
        </div>
      </form>

      {/* Info */}
      <Card variant="default" className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground text-center">
            💡 A geração pode levar de 30 segundos a 2 minutos. Você será notificado quando estiver pronta.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
