"use client"

interface AppleSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'muted'
  className?: string
}

export function AppleSpinner({ size = 'md', color = 'primary', className = '' }: AppleSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }
  
  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white',
    muted: 'text-muted-foreground'
  }
  
  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

interface AppleLoadingProps {
  text?: string
  fullScreen?: boolean
}

export function AppleLoading({ text = 'Carregando...', fullScreen = false }: AppleLoadingProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl'
    : 'flex items-center justify-center p-12'
  
  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <AppleSpinner size="lg" color="primary" />
        {text && (
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

interface AppleSkeletonProps {
  className?: string
  count?: number
  variant?: 'text' | 'rect' | 'circle'
}

export function AppleSkeleton({ className = '', count = 1, variant = 'text' }: AppleSkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded-lg',
    rect: 'h-32 rounded-2xl',
    circle: 'rounded-full aspect-square'
  }
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-muted/50 animate-shimmer ${variantClasses[variant]} ${className}`}
        />
      ))}
    </>
  )
}

interface AppleProgressProps {
  value: number // 0-100
  showLabel?: boolean
  color?: 'primary' | 'success' | 'warning'
  className?: string
}

export function AppleProgress({ value, showLabel = false, color = 'primary', className = '' }: AppleProgressProps) {
  const colorClasses = {
    primary: 'from-mango-500 via-mango-400 to-yellow-500',
    success: 'from-green-500 to-emerald-500',
    warning: 'from-yellow-500 to-orange-500'
  }
  
  const clampedValue = Math.min(Math.max(value, 0), 100)
  
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Progresso</span>
          <span className="tabular-nums">{clampedValue}%</span>
        </div>
      )}
      <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorClasses[color]} rounded-full shadow-lg transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

export function ApplePulse({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-full bg-mango-500/30 animate-ping" />
      <div className="absolute inset-0 rounded-full bg-mango-500/50 animate-pulse" />
      <div className="relative w-3 h-3 rounded-full bg-mango-500" />
    </div>
  )
}
