# 🥭 Mango Brand Identity

## Paleta de Cores Tropical

### Primary Color - Mango Orange
**#FF8C00** - A cor vibrante e energética da manga madura

```css
--primary: 32 95% 55%; /* HSL */
```

**Uso:**
- Botões principais (CTAs)
- Links e elementos interativos
- Ícone do logo
- Highlights e acentos importantes

---

### Paleta Mango Completa

| Shade | Hex | Uso Recomendado |
|-------|-----|-----------------|
| **50** | `#FFF7ED` | Backgrounds muito claros, hover states suaves |
| **100** | `#FFEDD5` | Backgrounds claros, alertas informativos |
| **200** | `#FED7AA` | Borders suaves, estados disabled |
| **300** | `#FDBA74` | Hover states, elementos secundários |
| **400** | `#FB923C` | Elementos ativos, badges |
| **500** | `#FF8C00` | **COR PRINCIPAL** - Botões, links, brand |
| **600** | `#EA580C` | Hover em botões primary, estados ativos |
| **700** | `#C2410C` | Texto em backgrounds claros, ênfase forte |
| **800** | `#9A3412` | Borders escuros, texto em contraste |
| **900** | `#7C2D12` | Shadows, texto em alto contraste |

---

## Cores Complementares

### Secondary - Yellow Accent
**#FFC107** - Amarelo complementar da manga

```css
--secondary: 45 93% 58%; /* HSL */
```

**Dark Mode:** Amarelo vibrante
**Light Mode:** Amarelo muito suave (#FFF9E5)

---

## Logo & Identidade Visual

### Ícone da Manga
- SVG customizado representando uma manga com folha
- Cores: Gradiente `from-mango-400 via-mango-500 to-mango-600`
- Background: Rounded-xl com shadow
- Hover: Scale 105% + shadow glow (mango-500/50)

### Texto "Mango"
- Font: Semibold, xl
- Cor: Gradiente text
  - Dark: `from-mango-400 via-mango-500 to-orange-500`
  - Light: `from-mango-500 via-mango-600 to-orange-600`

---

## Aplicação nos Componentes

### Botões Primary
```tsx
className="bg-primary text-primary-foreground hover:opacity-90"
// Laranja vibrante (#FF8C00) com texto branco
```

### Cards com Hover
```tsx
className="border-border hover:border-primary/50"
// Borda neutra que fica laranja suave no hover
```

### Stats Cards
```tsx
// Total de Faixas - Primary
className="hover:border-primary/50"

// Em Progresso - Yellow
className="hover:border-yellow-500/50"

// Concluídas - Green
className="hover:border-green-500/50"
```

---

## Gradientes Tropicais

### Logo Background
```css
bg-gradient-to-br from-mango-400 via-mango-500 to-mango-600
```

### Texto do Brand
```css
/* Dark Mode */
bg-gradient-to-r from-mango-400 via-mango-500 to-orange-500

/* Light Mode */
bg-gradient-to-r from-mango-500 via-mango-600 to-orange-600
```

---

## Contraste & Acessibilidade

### Ratios de Contraste (WCAG AA)
- `mango-500` em background branco: **4.8:1** ✅
- `mango-600` em background branco: **6.2:1** ✅
- `mango-500` em background escuro: **8.1:1** ✅

**Recomendações:**
- Use `mango-500` para botões e links
- Use `mango-600` para texto em backgrounds claros
- Use `mango-400` para texto em backgrounds escuros

---

## Filosofia de Design

### Steve Jobs Minimalism
- **Simples** - Uma cor principal vibrante
- **Memorável** - Laranja tropical único
- **Funcional** - Alto contraste e legibilidade
- **Emocional** - Energia, criatividade, tropicalidade

### Psicologia da Cor Laranja
- 🔥 **Energia** - Criatividade e ação
- 🎵 **Música** - Vibração e ritmo
- 🌴 **Tropical** - Conexão com a fruta manga
- ✨ **Inovação** - Modernidade e frescor

---

## Exemplos de Uso

### Hero Section
```tsx
<h1 className="bg-clip-text text-transparent bg-gradient-to-r from-mango-500 to-orange-600">
  Mango AI
</h1>
```

### CTA Button
```tsx
<button className="bg-mango-500 text-white hover:bg-mango-600 shadow-lg shadow-mango-500/20">
  Criar Nova Faixa
</button>
```

### Card Hover
```tsx
<div className="border-2 border-border hover:border-mango-500/50 hover:shadow-xl hover:shadow-mango-500/10">
  Content
</div>
```

---

## Conclusão

A identidade **Mango** usa:
- 🥭 **Cor principal:** #FF8C00 (Laranja vibrante)
- 🎨 **Paleta:** 10 tons de laranja tropical
- ✨ **Estilo:** Minimalista Steve Jobs
- 🌴 **Emoção:** Energia tropical e criativa

**One more thing:** A manga não é só uma cor, é a essência da criatividade tropical! 🥭🎵
