/**
 * Apple-Style Animations & Transitions
 * Micro-interactions inspired by Apple's design language
 */

// Smooth easing curves (Apple uses custom bezier curves)
export const appleEasing = {
  // Standard easing for most animations
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  
  // Deceleration curve (easeOut) - objects enter the screen at full velocity and slowly decelerate
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  
  // Acceleration curve (easeIn) - objects leave the screen at full velocity
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  
  // Sharp curve - used for objects that may return to the screen at any time
  sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  
  // Spring curve - bouncy, playful
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}

// Animation variants for Framer Motion (if needed)
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
}

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }
}

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }
}

// Stagger children animation
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

// Card hover effect with lift and glow
export const cardHoverClass = "transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 active:translate-y-0 active:shadow-lg"

// Button press effect (Apple-style tactile feedback)
export const buttonPressClass = "active:scale-95 transition-transform duration-100"

// Smooth color transition
export const colorTransitionClass = "transition-colors duration-200"

// Glass morphism effect
export const glassMorphismClass = "backdrop-blur-xl bg-background/80 border border-border/50"

// Floating animation for badges or icons
export const floatingAnimation = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
`

// Shimmer effect for loading states
export const shimmerAnimation = `
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
.animate-shimmer {
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
`

// Ripple effect utility (for buttons)
export const createRipple = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget
  const circle = document.createElement('span')
  const diameter = Math.max(button.clientWidth, button.clientHeight)
  const radius = diameter / 2

  circle.style.width = circle.style.height = `${diameter}px`
  circle.style.left = `${event.clientX - button.offsetLeft - radius}px`
  circle.style.top = `${event.clientY - button.offsetTop - radius}px`
  circle.classList.add('ripple')

  const ripple = button.getElementsByClassName('ripple')[0]
  if (ripple) {
    ripple.remove()
  }

  button.appendChild(circle)
}

// Parallax scroll effect
export const useParallax = (speed: number = 0.5) => {
  if (typeof window === 'undefined') return { y: 0 }
  
  const [offsetY, setOffsetY] = React.useState(0)
  
  React.useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return { y: offsetY * speed }
}

// Import React for hooks
import React from 'react'

// CSS class utilities
export const appleStyles = {
  // Text styles
  headline: "text-5xl font-semibold tracking-tight",
  title: "text-3xl font-semibold tracking-tight",
  subheadline: "text-xl font-medium tracking-wide",
  body: "text-base font-normal leading-relaxed",
  caption: "text-sm font-medium text-muted-foreground",
  
  // Container styles
  card: `rounded-3xl border border-border/50 bg-gradient-to-br from-background/95 to-muted/30 backdrop-blur-xl p-6 ${cardHoverClass}`,
  cardFlat: "rounded-2xl border border-border/40 bg-background/50 backdrop-blur-sm p-5",
  
  // Button styles
  buttonPrimary: `rounded-full bg-gradient-to-br from-mango-400 via-mango-500 to-mango-600 text-white font-semibold px-6 py-3 shadow-lg shadow-mango-500/30 hover:shadow-xl hover:shadow-mango-500/50 ${buttonPressClass}`,
  buttonSecondary: `rounded-full border-2 border-border/50 bg-background/50 backdrop-blur-sm px-6 py-3 font-semibold hover:bg-muted/50 ${buttonPressClass}`,
  buttonGhost: `rounded-full px-4 py-2 font-medium hover:bg-muted/30 ${buttonPressClass}`,
  
  // Interactive elements
  input: "rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-4 py-3 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200",
  checkbox: "rounded-md border-2 border-border/50 focus:ring-2 focus:ring-primary/20",
  
  // Badges
  badge: "rounded-full px-3 py-1 text-xs font-semibold bg-muted/50 backdrop-blur-sm border border-border/30",
  badgePrimary: "rounded-full px-3 py-1 text-xs font-semibold bg-mango-500/20 text-mango-600 dark:text-mango-400 border border-mango-500/30",
}

// Accessibility helpers
export const focusRing = "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"

// Reduced motion support
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])
  
  return prefersReducedMotion
}
