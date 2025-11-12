# 🍎 Apple Design System - Mango AI

## Inovações Implementadas

### 🎵 Audio Visualizer (Canvas API)
**Arquivo:** `components/player/AudioVisualizer.tsx`

Visualizador de áudio em tempo real inspirado no Apple Music:
- **Canvas API** com Web Audio API integration
- **Visualização circular** com 64 barras de frequência
- **Gradientes dinâmicos** que reagem à música (HSL amarelo → laranja)
- **Centro pulsante** que responde ao volume médio
- **Efeitos de glow** e shadow blur
- **Mix blend mode** para integração perfeita com o background

```tsx
<AudioVisualizer 
  audioElement={audioRef.current} 
  isPlaying={playing}
  color="#FF8C00"
/>
```

---

### 🎛️ Player Premium com Micro-interações
**Arquivo:** `components/player/MinimalPlayer.tsx`

Player de áudio completamente redesenhado:
- ✨ **Botão Play/Pause** circular com:
  - Gradiente mango vibrante
  - Animação de pulse quando tocando
  - Efeito ripple ao clicar
  - Shadow glow com hover scale 110%
  
- 🎚️ **Progress Bar elegante**:
  - Gradiente tricolor (mango-500 → mango-400 → yellow-500)
  - Playhead indicator que aparece ao hover
  - Seek arrastável com z-index otimizado
  - Shadow glow na barra de progresso

- 🔊 **Controle de Volume sofisticado**:
  - Botão mute/unmute com ícones dinâmicos
  - Volume indicator que aparece ao hover
  - Porcentagem em font-mono tabular-nums
  - Opacity transition no hover (70% → 100%)

- ⏱️ **Display de tempo Apple-style**:
  - Font-mono com tabular-nums
  - Separador diamante (◆) no centro
  - Tracking aumentado para legibilidade

---

### 🎨 Design System Completo
**Arquivo:** `components/ui/AppleUI.tsx`

Componentes reutilizáveis estilo Apple:

#### **AppleCard**
```tsx
<AppleCard variant="elevated" interactive>
  {children}
</AppleCard>
```
- 3 variantes: elevated, flat, glass
- Hover lift animation
- Gradient overlay em estados interativos
- Border radius 3xl (24px)

#### **AppleButton**
```tsx
<AppleButton variant="primary" size="md" icon={<Plus />}>
  Nova Faixa
</AppleButton>
```
- 3 variantes: primary (gradient mango), secondary (outline), ghost
- 3 tamanhos: sm, md, lg
- Active scale-95 feedback tátil
- Shadow com glow mango

#### **AppleBadge**
```tsx
<AppleBadge variant="primary">EM ALTA</AppleBadge>
```
- 5 variantes: default, primary, success, warning, danger
- Rounded-full com backdrop-blur
- Border sutil e cores semânticas

#### **AppleInput**
```tsx
<AppleInput 
  value={search} 
  onChange={setSearch}
  icon={<Search />}
  placeholder="Buscar..."
/>
```
- Rounded-2xl com glassmorphism
- Suporte a ícone esquerdo
- Focus ring estilo Apple (2px primary/20)

---

### ⚡ Animações & Transições
**Arquivo:** `lib/apple-animations.ts`

Sistema completo de animações com curvas de Bézier da Apple:

#### **Easing Curves**
```ts
appleEasing = {
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}
```

#### **Motion Variants**
- `fadeInUp` - Entra de baixo com fade
- `fadeInScale` - Scale de 95% → 100%
- `slideInRight` - Slide lateral
- `staggerContainer` - Stagger children com delay

#### **Utility Classes**
- `cardHoverClass` - Hover lift com shadow
- `buttonPressClass` - Active scale feedback
- `glassMorphismClass` - Backdrop blur effect

---

### 🌀 Loading States Premium
**Arquivo:** `components/ui/AppleLoading.tsx`

Componentes de loading elegantes:

#### **AppleSpinner**
```tsx
<AppleSpinner size="lg" color="primary" />
```
- SVG animado com rotate
- Opacity gradient (25% + 75%)
- 3 tamanhos e 3 cores

#### **AppleLoading**
```tsx
<AppleLoading text="Gerando música..." fullScreen />
```
- Modal fullscreen opcional
- Backdrop blur-xl
- Texto com pulse animation

#### **AppleSkeleton**
```tsx
<AppleSkeleton variant="rect" count={3} />
```
- 3 variantes: text, rect, circle
- Shimmer animation integrada
- Count prop para múltiplos

#### **AppleProgress**
```tsx
<AppleProgress value={75} showLabel color="primary" />
```
- Gradient tricolor
- Shimmer effect interno
- Transição suave de 500ms
- Label opcional com porcentagem

#### **ApplePulse**
```tsx
<ApplePulse />
```
- 3 camadas de animação (ping + pulse + solid)
- Mango-500 com opacidades 30%, 50%, 100%

---

### 🎭 CSS Animations Globais
**Arquivo:** `app/globals.css`

Animações keyframes customizadas:

#### **Keyframes**
- `@keyframes float` - Flutuação suave vertical
- `@keyframes shimmer` - Efeito brilho deslizante
- `@keyframes ripple` - Ondulação ao clicar
- `@keyframes slideInUp` - Entrada de baixo
- `@keyframes scaleIn` - Escala de entrada

#### **Utility Classes**
- `.animate-float` - Float 3s ease-in-out infinite
- `.animate-shimmer` - Gradient deslizante
- `.glass` - Glass morphism leve
- `.glass-strong` - Glass morphism forte
- `.text-glow` - Text shadow mango
- `.shadow-apple-{sm|md|lg|xl}` - Elevações Apple
- `.shadow-mango` - Shadow com glow laranja
- `.transition-apple` - Transition 0.3s Apple curve

---

### ⚙️ Tailwind Config Expandido
**Arquivo:** `tailwind.config.ts`

Novas animações no Tailwind:

```ts
animation: {
  'float': 'float 3s ease-in-out infinite',
  'slide-in-up': 'slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  'scale-in': 'scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  'ripple': 'ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
}
```

---

## 🎯 Filosofia de Design

### **Simplicidade Radical**
- **Menos é mais** - Remover tudo que não é essencial
- **Hierarquia clara** - Tamanhos e pesos bem definidos
- **Espaçamento generoso** - Breathing room entre elementos

### **Fluidez & Naturalidade**
- **Curvas de Bézier Apple** - Movimentos que sentem naturais
- **Feedback tátil** - Toda interação tem resposta visual
- **Transições suaves** - Nada acontece instantaneamente

### **Atenção aos Detalhes**
- **Gradientes sutis** - Profundidade sem exagero
- **Shadows contextuais** - Elevação que faz sentido
- **Micro-interações** - Polimento em cada pixel

### **Performance em Primeiro Lugar**
- **GPU acceleration** - Transform e opacity
- **Reduced motion** - Respeito às preferências de acessibilidade
- **Debounce & throttle** - Animações otimizadas

---

## 🚀 Como Usar

### **Importar Componentes**
```tsx
import { AppleCard, AppleButton, AppleBadge } from '@/components/ui/AppleUI'
import { AppleSpinner, AppleProgress } from '@/components/ui/AppleLoading'
import { AudioVisualizer } from '@/components/player/AudioVisualizer'
```

### **Usar Animações**
```tsx
import { appleEasing, appleStyles } from '@/lib/apple-animations'

// Class utilities
<div className={appleStyles.card}>
  <h1 className={appleStyles.headline}>Título</h1>
</div>

// Custom animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: appleEasing.decelerate }}
>
  Conteúdo
</motion.div>
```

### **Aplicar Estilos CSS**
```tsx
<div className="glass shadow-apple-lg transition-apple hover:shadow-apple-xl">
  Glassmorphism Card
</div>

<div className="animate-slide-in-up">
  Elemento que entra suavemente
</div>
```

---

## 🎨 Paleta de Cores Integrada

Todas as animações e componentes usam a **paleta Mango**:
- `mango-500` (#FF8C00) - Cor principal
- `mango-400` - Highlights
- `mango-600` - Shadows e hover states
- Gradientes: `from-mango-400 via-mango-500 to-mango-600`

---

## ✨ Benefícios

1. **Consistência Visual** - Mesmo estilo em toda aplicação
2. **Reutilização de Código** - Componentes prontos
3. **Performance Otimizada** - Animações GPU-accelerated
4. **Acessibilidade** - Suporte a reduced motion
5. **Manutenibilidade** - Estilos centralizados
6. **Experiência Premium** - Nível Apple de polimento

---

**One more thing:** Este design system transforma o Mango AI em uma experiência de classe mundial! 🥭✨
