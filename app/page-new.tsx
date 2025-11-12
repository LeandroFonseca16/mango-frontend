import Link from 'next/link'
import { Sparkles, Zap, TrendingUp, ArrowRight, Play } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - OpenAI Style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              Create music with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                artificial intelligence
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into professional music tracks in seconds. 
              Powered by cutting-edge AI models trained on millions of songs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-all duration-200 active:scale-95"
              >
                Start creating
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200"
              >
                <Play className="h-5 w-5" />
                See it in action
              </Link>
            </div>

            {/* Social Proof */}
            <p className="text-sm text-gray-500 dark:text-gray-500 pt-4">
              Join 10,000+ creators making music with AI
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything you need to create
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Professional tools, powered by AI
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-200">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-6">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">AI-Powered Generation</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Advanced algorithms create unique, professional-quality tracks tailored to your style and mood.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-200">
                  <div className="h-12 w-12 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center mb-6">
                    <Zap className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Generate complete tracks in under 60 seconds. No waiting, no complexity, just instant music.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-200">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">Trending Sounds</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    Stay ahead with viral TikTok trends and create music that resonates with your audience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Every genre, perfectly crafted
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                From lo-fi to phonk, trap to chill beats
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Phonk', emoji: '🔥', color: 'from-red-500 to-pink-500' },
                { name: 'Lo-Fi', emoji: '🎧', color: 'from-purple-500 to-blue-500' },
                { name: 'Trap', emoji: '💎', color: 'from-yellow-500 to-orange-500' },
                { name: 'Funk', emoji: '💃', color: 'from-pink-500 to-purple-500' },
                { name: 'Chill', emoji: '🌊', color: 'from-blue-500 to-cyan-500' },
                { name: 'Drill', emoji: '⚡', color: 'from-gray-700 to-gray-900' },
              ].map((genre) => (
                <div
                  key={genre.name}
                  className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="text-4xl mb-3">{genre.emoji}</div>
                  <div className="font-medium text-sm">{genre.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-gray-600 dark:text-gray-400">Active Creators</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100K+</div>
                <div className="text-gray-600 dark:text-gray-400">Tracks Generated</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50M+</div>
                <div className="text-gray-600 dark:text-gray-400">Plays on TikTok</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-400">AI Availability</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl sm:text-5xl font-bold">
              Ready to create your first track?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of creators using AI to make professional music
            </p>
            <div>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-all duration-200 active:scale-95"
              >
                Get started for free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              No credit card required • 10 free tracks to start
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
