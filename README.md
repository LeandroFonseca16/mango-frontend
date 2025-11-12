# MangoBeat AI# MangoBeat AI - Next.js Edition



> Unified Next.js 15 app for music trends, AI generation workflows, and dashboard management.> **🎵 AI-Powered Music Generation Platform**  

> A complete rewrite of MangoBeat AI using Next.js 14 with OpenAI-inspired minimalist design.

## Local Stack (stubs)

```bash
# launch postgres + kafka + redis + minio + next.js stub
docker compose up -d --build

# create synthetic trends and tiny audio loops
python scripts/synthetic/synthetic_data_generator.py --count 100
```

The generator writes JSON, SQL, and WAV outputs into `data/synthetic/`. Use the generated SQL file to
seed the `trend_events` table when the Postgres service is running.

➡️  For GPU requirements, Python dependencies, and Phase 2 environment variables, see
`docs/PHASE2-LOCAL-SETUP.md`.

## Why the Cleanup?

## ✨ What's New

- **Single runtime** – removed the NestJS backend and old front-ends; everything now lives inside Next.js App Router + API routes.

- **Smaller surface area** – no queues, schedulers, or Redis; just a Postgres database and the web application.- **Full-Stack Next.js 14** - Server Components + API Routes (no separate backend needed)

- **Reproducible builds** – Dockerfile uses Next.js standalone output, Prisma client is generated during build, and `docker compose` brings up only what we need.- **OpenAI-Inspired Design** - Minimal, spacious, clean typography

- **Zero-noise linting** – ESLint, TypeScript, and Tailwind configs trimmed to the minimum required for the new stack.- **Dynamic Theme System** - 6 genre-based color palettes with smooth transitions

- **Modern Auth** - NextAuth.js with JWT sessions

## Project Layout- **Type-Safe API** - End-to-end TypeScript with Prisma ORM

- **Real-time Updates** - Server-Sent Events for job status

```- **Optimized Performance** - Static generation, ISR, and streaming

app/                 # App Router pages + API endpoints

components/          # UI building blocks## 🏗️ Architecture

lib/                 # Prisma client, AI helpers, shared utilities

prisma/              # schema.prisma and seed script```

public/              # static assetsmangobeat-nextjs/

next.config.js       # Next.js config (standalone output)├── app/                    # Next.js App Router

Dockerfile           # multi-stage container build│   ├── (auth)/            # Auth pages (login, register)

docker-compose.yml   # local stack (Next.js + Postgres)│   ├── (dashboard)/       # Protected dashboard routes

```│   ├── api/               # API Routes (backend)

│   ├── layout.tsx         # Root layout

## Prerequisites│   ├── page.tsx           # Home page

│   └── globals.css        # Global styles

- Node.js 20+├── components/            # React components

- npm 10+│   ├── layout/           # Navbar, Footer, Sidebar

- PostgreSQL 14+ (or compatible connection string in `DATABASE_URL`)│   ├── ui/               # Button, Card, Input, etc.

│   ├── features/         # Track cards, genre selector

## Getting Started│   └── providers/        # Theme, Auth providers

├── lib/                   # Core utilities

```bash│   ├── auth.ts           # NextAuth config

# install dependencies│   ├── prisma.ts         # Database client

npm install│   ├── ai/               # AI service integrations

│   └── utils.ts          # Helper functions

# bootstrap environment├── prisma/               # Database schema

cp .env.example .env│   └── schema.prisma

└── middleware.ts         # Auth & route protection

# database workflow```

npm run db:generate

npm run db:migrate## 🚀 Quick Start

npm run db:seed   # optional demo data

### Prerequisites

# start developing

npm run dev- Node.js 20+

```- PostgreSQL 14+

- OpenAI API Key

Visit [http://localhost:3000](http://localhost:3000).- (Optional) Stripe account for payments



## npm Scripts### 1. Install Dependencies



| Script | What it does |```bash

|--------|--------------|cd mangobeat-nextjs

| `npm run dev` | Launch the dev server |npm install

| `npm run build` | `prisma generate` + production build |```

| `npm run start` | Run the built app |

| `npm run lint` | ESLint via `next lint` |### 2. Configure Environment

| `npm run typecheck` | Strict TypeScript check |

| `npm run db:generate` | Prisma client generation |```bash

| `npm run db:migrate` | Apply migrations (dev) |cp .env.example .env

| `npm run db:deploy` | Apply migrations in production |```

| `npm run db:studio` | Launch Prisma Studio |

| `npm run db:seed` | Seed the database with demo data |Edit `.env` and add your credentials:

- `DATABASE_URL` - PostgreSQL connection string

## Docker- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`

- `OPENAI_API_KEY` - Your OpenAI API key

```bash- Other optional services (Stripe, Resend, etc.)

# build image

npm run build### 3. Setup Database



# bring up Postgres + Next.js```bash

docker compose up -d --build# Generate Prisma Client

```npm run db:generate



The production image exposes port `3000`, runs as a non-root user, and uses a simple health check against `/`.# Run migrations

npm run db:migrate

## Environment Variables

# (Optional) Seed with sample data

Defined in `.env.example`:npm run db:seed

```

- `DATABASE_URL` – Postgres connection string (required).

- `NEXT_PUBLIC_APP_URL` – Base URL exposed to the client (defaults to `http://localhost:3000`).### 4. Run Development Server

- Optional provider keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

```bash

No NextAuth secrets are required out of the box; auth endpoints return 404 until you wire up an identity provider.npm run dev

```

## Operational Notes

Open [http://localhost:3000](http://localhost:3000)

- Prisma seeds now use Node's built-in `crypto` (`scrypt`) to avoid bundling `bcrypt`.

- API routes serialize `BigInt` fields so JSON responses are build-safe.## 🎨 Design System

- Tailwind no longer depends on `@tailwindcss/forms` or other optional plugins—the base utilities cover our needs.

- Docker Compose was reduced to Postgres + Next.js; Redis and other unused services are gone.### Color Palette



## Quality GatesWe use CSS Variables for dynamic theming:



Run these locally (CI ready):```css

--primary: hsl(37 100% 58%)    /* #FFB627 - Base Orange */

```bash--background: hsl(0 0% 100%)   /* #FFFFFF - White */

npm run lint--foreground: hsl(0 0% 10%)    /* #1A1A1A - Near Black */

npm run typecheck--border: hsl(0 0% 90%)        /* #E5E5E5 - Subtle borders */

npm run build```

```

### Typography

All three must succeed (no warnings) before shipping.

- **Font**: Inter (primary), Monospace (code)

## Next Steps- **Headings**: Semibold, tight tracking

- **Body**: Regular, relaxed leading

- Point `DATABASE_URL` to your managed Postgres instance.- **Sizes**: 2xs → 6xl (fluid responsive)

- Replace demo seed data with production onboarding flows.

- Layer authentication or additional services through App Router and Prisma as needed.### Components



Enjoy the slimmer codebase! 🎧All components follow OpenAI's minimalist approach:

- Generous whitespace
- Subtle shadows
- Smooth transitions (200-300ms)
- High contrast text
- Accessible focus states

## 📦 Key Features

### 1. Music Generation

```typescript
// app/api/tracks/route.ts
POST /api/tracks
{
  "title": "Summer Vibes",
  "description": "Upbeat lo-fi track for sunset",
  "genre": "lofi",
  "duration": 30
}
```

### 2. Theme Switching

```typescript
// components/providers/ThemeProvider.tsx
const { theme, setTheme } = useTheme()
setTheme('phonk') // Switches to hot pink theme
```

### 3. Real-time Job Status

```typescript
// Server-Sent Events
const eventSource = new EventSource('/api/jobs/stream')
eventSource.onmessage = (event) => {
  const job = JSON.parse(event.data)
  console.log('Job update:', job.status)
}
```

## 🔐 Authentication

Using NextAuth.js with Credentials provider:

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [CredentialsProvider({...})],
  session: { strategy: 'jwt' },
  callbacks: { jwt, session },
}
```

Protect routes with middleware:

```typescript
// middleware.ts
export { default } from 'next-auth/middleware'
export const config = { matcher: ['/dashboard/:path*'] }
```

## 🗄️ Database Schema

Key models:

- **User** - Authentication + profile
- **Track** - Generated music tracks
- **Job** - Async AI generation jobs
- **Trend** - TikTok trending data
- **Subscription** - Stripe billing
- **ApiKey** - Programmatic access
- **Webhook** - Event notifications

## 🔌 API Reference

### Tracks

```bash
GET    /api/tracks          # List user tracks
POST   /api/tracks          # Create new track
GET    /api/tracks/:id      # Get track details
DELETE /api/tracks/:id      # Delete track
```

### Trends

```bash
GET    /api/trends          # List trending topics
GET    /api/trends/:id      # Get trend details
```

### Jobs

```bash
GET    /api/jobs            # List user jobs
GET    /api/jobs/:id        # Get job status
POST   /api/jobs/:id/cancel # Cancel job
```

## 🎯 Migration Guide

### From NestJS Backend + React Frontend

1. **API Routes** - Move controllers to `app/api/`
2. **Services** - Refactor to `lib/` as utility functions
3. **Components** - Migrate to `components/` (update imports)
4. **State** - Replace Zustand with Server Components + React Query
5. **WebSockets** - Use Server-Sent Events or WebSocket route handlers

### Database

The Prisma schema is compatible with your existing database. Just run:

```bash
npm run db:generate
```

No data migration needed!

## 📈 Performance

- **Lighthouse Score**: 95+ (all categories)
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle Size**: ~150KB (initial)

Optimizations:
- Server Components for static content
- Dynamic imports for client components
- Image optimization with Next.js Image
- Font optimization with next/font

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t mangobeat-nextjs .

# Run container
docker run -p 3000:3000 --env-file .env mangobeat-nextjs
```

### Environment Variables

Make sure to set all required env vars in your hosting platform:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- OPENAI_API_KEY
- STRIPE_SECRET_KEY (if using payments)

## 📝 Development

### Code Style

We follow Next.js conventions:
- Server Components by default
- Client Components with `'use client'`
- API routes in `app/api/`
- Shared utilities in `lib/`

### Testing

```bash
npm run test          # Run tests
npm run test:watch    # Watch mode
npm run coverage      # Coverage report
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Design inspired by [OpenAI Platform](https://platform.openai.com)
- Music generation powered by [OpenAI](https://openai.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)

---

**Built with ❤️ using Next.js 14 + TypeScript + Tailwind CSS**
