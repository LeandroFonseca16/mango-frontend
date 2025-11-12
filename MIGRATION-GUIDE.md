# 🚀 Guia de Migração: NestJS + React → Next.js 14

Este guia detalha como migrar seu projeto MangoBeat AI do stack atual (NestJS backend + React frontend) para Next.js 14 full-stack.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Migração do Backend](#migração-do-backend)
5. [Migração do Frontend](#migração-do-frontend)
6. [Database e Prisma](#database-e-prisma)
7. [Autenticação](#autenticação)
8. [Integrações Externas](#integrações-externas)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### Stack Antigo
```
┌─────────────────────┐     ┌──────────────────────┐
│  React + Vite       │────▶│  NestJS Backend      │
│  Frontend (5174)    │     │  (3001)              │
│  - Zustand          │     │  - Controllers       │
│  - React Query      │     │  - Services          │
│  - Axios            │     │  - Modules           │
└─────────────────────┘     └──────────────────────┘
                                     │
                            ┌────────▼─────────┐
                            │  PostgreSQL      │
                            │  Prisma ORM      │
                            └──────────────────┘
```

### Stack Novo
```
┌────────────────────────────────────────────┐
│         Next.js 14 (3000)                  │
│  ┌──────────────┐  ┌───────────────────┐  │
│  │  App Router  │  │  API Routes       │  │
│  │  - Pages     │  │  - /api/tracks    │  │
│  │  - Layouts   │  │  - /api/trends    │  │
│  │  - Components│  │  - /api/auth      │  │
│  └──────────────┘  └───────────────────┘  │
└───────────────────────┬────────────────────┘
                        │
               ┌────────▼─────────┐
               │  PostgreSQL      │
               │  Prisma ORM      │
               └──────────────────┘
```

**Vantagens:**
- ✅ Um único repositório e servidor
- ✅ Server Components = performance melhor
- ✅ API routes co-localizadas com páginas
- ✅ Type-safety end-to-end
- ✅ Deploy simplificado (Vercel/Netlify)
- ✅ Melhor SEO e meta tags

---

## 🔧 Pré-requisitos

```bash
# Instale as ferramentas necessárias
npm install -g vercel
npm install -g @prisma/cli

# Backup do banco de dados atual
pg_dump mangobeat > backup.sql

# Clone o novo projeto
cd mangobeat-nextjs
npm install
```

---

## 📁 Estrutura de Pastas

### Mapeamento de Diretórios

| **Antigo (NestJS/React)** | **Novo (Next.js)** | **Descrição** |
|---------------------------|---------------------|---------------|
| `backend/src/modules/tracks/tracks.controller.ts` | `app/api/tracks/route.ts` | Controllers → API Routes |
| `backend/src/modules/tracks/tracks.service.ts` | `lib/services/tracks.ts` | Services → Lib utilities |
| `frontend/src/components/` | `components/` | Componentes React |
| `frontend/src/features/dashboard/` | `app/(dashboard)/dashboard/` | Páginas agrupadas |
| `frontend/src/contexts/` | `components/providers/` | Contexts → Providers |
| `backend/prisma/schema.prisma` | `prisma/schema.prisma` | Schema (compatível!) |

---

## 🔄 Migração do Backend

### 1. Controllers → API Routes

**Antes (NestJS):**
```typescript
// backend/src/modules/tracks/tracks.controller.ts
@Controller('api/v1/tracks')
export class TracksController {
  @Get()
  async findAll(@Query('page') page: number) {
    return this.tracksService.findAll(page);
  }

  @Post()
  async create(@Body() createTrackDto: CreateTrackDto) {
    return this.tracksService.create(createTrackDto);
  }
}
```

**Depois (Next.js):**
```typescript
// app/api/tracks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { tracksService } from '@/lib/services/tracks'

export async function GET(request: NextRequest) {
  const user = await requireAuth()
  const page = request.nextUrl.searchParams.get('page')
  const tracks = await tracksService.findAll(user.id, Number(page))
  return NextResponse.json(tracks)
}

export async function POST(request: NextRequest) {
  const user = await requireAuth()
  const body = await request.json()
  const track = await tracksService.create(user.id, body)
  return NextResponse.json(track, { status: 201 })
}
```

### 2. Services → Lib Functions

**Antes (NestJS):**
```typescript
// backend/src/modules/tracks/tracks.service.ts
@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, page: number) {
    return this.prisma.track.findMany({
      where: { userId },
      skip: (page - 1) * 20,
      take: 20,
    })
  }
}
```

**Depois (Next.js):**
```typescript
// lib/services/tracks.ts
import { prisma } from '@/lib/prisma'

export const tracksService = {
  async findAll(userId: string, page: number) {
    return prisma.track.findMany({
      where: { userId },
      skip: (page - 1) * 20,
      take: 20,
    })
  },

  async create(userId: string, data: any) {
    return prisma.track.create({
      data: { ...data, userId },
    })
  },
}
```

### 3. Middlewares → Next.js Middleware

**Antes (NestJS):**
```typescript
// backend/src/guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    return validateToken(request.headers.authorization)
  }
}
```

**Depois (Next.js):**
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/tracks/:path*'],
}
```

---

## 🎨 Migração do Frontend

### 1. Páginas React → Next.js Pages

**Antes (React Router):**
```tsx
// frontend/src/features/dashboard/pages/DashboardPage.tsx
export function DashboardPage() {
  const [tracks, setTracks] = useState([])
  
  useEffect(() => {
    axios.get('/api/tracks').then(res => setTracks(res.data))
  }, [])

  return <div>{/* ... */}</div>
}
```

**Depois (Next.js Server Component):**
```tsx
// app/(dashboard)/dashboard/page.tsx
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const user = await requireAuth()
  
  // Fetch direto no servidor!
  const tracks = await prisma.track.findMany({
    where: { userId: user.id },
  })

  return <DashboardContent tracks={tracks} />
}
```

### 2. Client Components quando necessário

```tsx
// app/(dashboard)/dashboard/DashboardContent.tsx
'use client' // Marca como Client Component

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

export function DashboardContent({ tracks }: { tracks: Track[] }) {
  const [filter, setFilter] = useState('')
  // Lógica interativa aqui
  return <div>{/* ... */}</div>
}
```

### 3. Contextos → Providers

**Antes (React Context):**
```tsx
// frontend/src/contexts/ThemeContext.tsx
export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('base')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**Depois (Next.js - mesmo código!):**
```tsx
// components/providers/ThemeProvider.tsx
'use client' // Importante!

import { createContext, useContext, useState } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('base')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

---

## 🗄️ Database e Prisma

### Schema já é compatível!

O `schema.prisma` do Next.js é 100% compatível com o do NestJS. Apenas:

```bash
# 1. Copie o schema
cp ../mangobeat-ai-backend/prisma/schema.prisma ./prisma/

# 2. Atualize o output path (se necessário)
generator client {
  provider = "prisma-client-js"
  # output = "../generated/prisma" # Remova isso
}

# 3. Gere o client
npx prisma generate

# 4. Crie as tabelas (se banco novo)
npx prisma migrate deploy
```

### Migrando dados existentes

Se você já tem dados no banco do NestJS:

```bash
# Nenhuma migração necessária!
# Use a mesma DATABASE_URL no .env do Next.js
DATABASE_URL="postgresql://user:pass@localhost:5432/mangobeat"
```

---

## 🔐 Autenticação

### De Passport.js (NestJS) → NextAuth.js

**Configuração NextAuth:**

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })
        
        if (!user) return null
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        return isValid ? user : null
      },
    }),
  ],
  session: { strategy: 'jwt' },
}
```

**Protegendo rotas:**

```typescript
// app/api/tracks/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Continue...
}
```

---

## 🔌 Integrações Externas

### 1. OpenAI

```typescript
// lib/ai/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateMusic(prompt: string) {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: prompt,
  })
  
  return response
}
```

### 2. Stripe Webhooks

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
  
  // Handle event
  return Response.json({ received: true })
}
```

### 3. Resend (Emails)

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: 'MangoBeat <noreply@mangobeat.ai>',
    to,
    subject: 'Welcome to MangoBeat!',
    html: `<h1>Hi ${name}!</h1>`,
  })
}
```

---

## 🚢 Deployment

### Vercel (Recomendado)

```bash
# 1. Instale a CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configure env vars no dashboard
# DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, etc.
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 🐛 Troubleshooting

### "Cannot find module 'next'"

```bash
# Certifique-se de instalar dependências
npm install
```

### "Prisma Client not generated"

```bash
# Gere o client Prisma
npx prisma generate
```

### "Database connection failed"

```bash
# Verifique a DATABASE_URL no .env
# Use a mesma URL do projeto antigo
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mangobeat"
```

### "Session callback error"

```typescript
// Adicione callbacks no NextAuth
callbacks: {
  async jwt({ token, user }) {
    if (user) token.id = user.id
    return token
  },
  async session({ session, token }) {
    session.user.id = token.id
    return session
  },
}
```

---

## 📊 Checklist de Migração

- [ ] Instalar Next.js e dependências
- [ ] Copiar schema.prisma
- [ ] Migrar API routes (controllers → route.ts)
- [ ] Migrar services para lib/
- [ ] Configurar NextAuth.js
- [ ] Migrar páginas React
- [ ] Migrar componentes UI
- [ ] Configurar integrações (Stripe, OpenAI, etc.)
- [ ] Testar localmente
- [ ] Deploy para staging
- [ ] Migrar variáveis de ambiente
- [ ] Deploy para produção
- [ ] Monitorar logs e erros

---

## 🎓 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Guide](https://next-auth.js.org)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
- [Vercel Deployment](https://vercel.com/docs)

---

**Dúvidas? Abra uma issue no repositório!** 🚀
