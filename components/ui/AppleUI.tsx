"use client"
import { ReactNode } from 'react'
import { appleStyles, cardHoverClass } from '@/lib/apple-animations'

interface AppleCardProps {
  children: ReactNode
  variant?: 'elevated' | 'flat' | 'glass'
  interactive?: boolean
  className?: string
  onClick?: () => void
}

export function AppleCard({ 
  children, 
  variant = 'elevated',
  interactive = false,
  className = '',
  onClick 
}: AppleCardProps) {
  const baseClasses = "relative overflow-hidden transition-all duration-200"
  
  const variantClasses = {
    elevated: `rounded-2xl border border-mango-100/40 dark:border-mango-900/40 bg-gradient-to-br from-background via-mango-50/10 to-orange-50/5 dark:from-card dark:via-mango-950/10 dark:to-orange-950/5 backdrop-blur-sm shadow-sm shadow-mango-500/5 ${interactive ? 'hover:shadow-md hover:shadow-mango-500/10 hover:scale-[1.01] hover:border-mango-300/50 dark:hover:border-mango-700/50' : ''}`,
    flat: "rounded-xl border border-border/30 bg-background/90 backdrop-blur-sm",
    glass: "rounded-2xl border border-mango-200/30 dark:border-mango-800/30 bg-background/40 backdrop-blur-md"
  }
  
  const interactiveClasses = interactive ? 'cursor-pointer' : ''
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface AppleButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function AppleButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}: AppleButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "rounded-full bg-gradient-to-r from-mango-500 to-orange-500 text-white shadow-sm hover:shadow-md hover:scale-[1.02]",
    secondary: "rounded-full border border-border/50 bg-background hover:bg-muted/50 hover:border-border/80",
    ghost: "rounded-full hover:bg-muted/30"
  }
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-7 py-3.5 text-lg"
  }
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  )
}

interface AppleBadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

export function AppleBadge({ children, variant = 'default', className = '' }: AppleBadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm border transition-all duration-200 shadow-sm"
  
  const variantClasses = {
    default: "bg-muted/80 border-border/50 text-foreground shadow-black/5",
    primary: "bg-gradient-to-r from-mango-500/35 via-orange-500/30 to-yellow-500/25 text-mango-800 dark:text-mango-200 border-mango-400/50 shadow-mango-500/15",
    success: "bg-gradient-to-r from-green-500/35 via-emerald-500/30 to-teal-500/25 text-green-800 dark:text-green-200 border-green-400/50 shadow-green-500/15",
    warning: "bg-gradient-to-r from-yellow-500/35 via-amber-500/30 to-orange-500/25 text-yellow-800 dark:text-yellow-200 border-yellow-400/50 shadow-yellow-500/15",
    danger: "bg-gradient-to-r from-red-500/35 via-rose-500/30 to-pink-500/25 text-red-800 dark:text-red-200 border-red-400/50 shadow-red-500/15"
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

interface AppleInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number'
  icon?: ReactNode
  className?: string
  disabled?: boolean
}

export function AppleInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  className = '',
  disabled = false
}: AppleInputProps) {
  return (
    <div className={`relative ${className}`}>
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-4 py-3 ${icon ? 'pl-12' : ''} focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  )
}
