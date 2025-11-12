'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Plus, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'

// Ícone customizado de Manga - Steve Jobs Style
const MangoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
  >
    <defs>
      <linearGradient id="mangoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FF8C00" />
        <stop offset="100%" stopColor="#FF6347" />
      </linearGradient>
      <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Corpo da Manga */}
    <path 
      d="M12 3c-1.5 0-3 1-4 2.5C7 7 6 9 6 11.5c0 3.5 2 6.5 6 7.5 4-1 6-4 6-7.5 0-2.5-1-4.5-2-6C15 4 13.5 3 12 3z" 
      fill="url(#mangoGradient)"
      stroke="none"
    />
    {/* Folha */}
    <path 
      d="M12 3c1 0 2 .5 3 1.5M15 4.5c.5.5 1 1.5 1 2.5" 
      fill="none"
      stroke="url(#leafGradient)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: 'Painel', href: '/dashboard' },
    { name: 'Criar Faixa', href: '/create' },
    { name: 'Minhas Faixas', href: '/tracks' },
    { name: 'Tendências', href: '/trends' },
    { name: '🍎 Apple Demo', href: '/apple-test' },
  ]
  
  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - Estilo Steve Jobs com Manga */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-muted/20 shadow-lg group-hover:shadow-xl group-hover:shadow-mango-500/30 transition-all duration-200 group-hover:scale-105">
              <MangoIcon className="h-7 w-7" />
            </div>
            <span className="font-semibold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-mango-500 via-mango-600 to-orange-600 dark:from-mango-400 dark:via-mango-500 dark:to-orange-500">
              Mango
            </span>
          </Link>

          {/* Desktop Navigation - Minimalista */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side - Clean */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-mango-500" />
                ) : (
                  <Moon className="h-5 w-5 text-mango-600" />
                )}
              </button>
            )}
            <Link 
              href="/create" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Nova Faixa
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted/50 rounded-xl transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-5 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2 space-y-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors text-sm font-medium w-full"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 text-mango-500" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-mango-600" />
                      <span>Modo Escuro</span>
                    </>
                  )}
                </button>
              )}
              <Link
                href="/create"
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-lg w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plus className="h-4 w-4" />
                Nova Faixa
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
