# 🥭 MangoBeat AI Backend - Documentação Completa

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Instalação e Configuração](#instalação-e-configuração)
4. [API Reference](#api-reference)
5. [Banco de Dados](#banco-de-dados)
6. [Filas e Jobs](#filas-e-jobs)
7. [Autenticação](#autenticação)
8. [Testes](#testes)
9. [Deploy](#deploy)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **MangoBeat AI Backend** é uma API REST construída em **NestJS** que oferece:

- 🎵 **Geração de música com IA**
- 📊 **Análise de tendências TikTok**
- 🔐 **Sistema de autenticação JWT**
- ⚡ **Processamento assíncrono com filas**
- 🗃️ **Gerenciamento de usuários e tracks**

### Tecnologias Principais

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **NestJS** | ^10.0.0 | Framework backend |
| **TypeScript** | ^5.0.0 | Linguagem principal |
| **Prisma** | ^6.19.0 | ORM para PostgreSQL |
| **BullMQ** | ^5.0.0 | Sistema de filas |
| **Redis** | ^5.0.0 | Cache e filas |
| **PostgreSQL** | 14+ | Banco de dados |
| **JWT** | ^10.0.0 | Autenticação |

---

## 🏗️ Arquitetura

O projeto segue **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── domain/                    # Camada de Domínio
│   ├── entities/             # Entidades de negócio
│   └── repositories/         # Interfaces dos repositórios
├── application/              # Camada de Aplicação
│   ├── usecases/            # Casos de uso
│   └── interfaces/          # Interfaces de serviços
├── infrastructure/          # Camada de Infraestrutura
│   ├── database/           # Implementações Prisma
│   ├── external-services/  # APIs externas
│   └── queues/            # Implementação BullMQ
├── presentation/           # Camada de Apresentação
│   ├── controllers/       # Controllers REST
│   ├── dto/              # Data Transfer Objects
│   └── guards/           # Guards de autenticação
└── modules/               # Módulos NestJS
    ├── auth/             # Módulo de autenticação
    ├── tracks/           # Módulo de tracks
    ├── trends/           # Módulo de tendências
    └── jobs/             # Módulo de jobs
```

### Princípios SOLID Aplicados

- **SRP**: Cada classe tem uma única responsabilidade
- **OCP**: Extensível via interfaces, fechado para modificação
- **LSP**: Substituição de implementações via DI
- **ISP**: Interfaces específicas para cada domínio
- **DIP**: Dependência de abstrações, não implementações

---

## ⚙️ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **PostgreSQL** 14+
- **Redis** 6+
- **Git**

### 1. Clone e Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd mangobeat-ai-backend

# Instale dependências
npm install
```

### 2. Configuração do Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mangobeat"

# JWT Secrets (MUDE EM PRODUÇÃO!)
JWT_SECRET="seu-jwt-secret-super-secreto"
JWT_REFRESH_SECRET="seu-refresh-secret-super-secreto"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"

# Servidor
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# APIs Externas (opcionais para desenvolvimento)
OPENAI_API_KEY="sk-seu-openai-key"
TIKTOK_API_KEY="seu-tiktok-key"
```

### 3. Configuração do Banco

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# (Opcional) Seed inicial
npm run db:seed
```

### 4. Iniciar Serviços

```bash
# Redis (Docker)
docker run -d --name redis -p 6379:6379 redis:latest

# PostgreSQL (Docker)
docker run -d --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mangobeat \
  -p 5432:5432 postgres:14

# Aplicação
npm run start:dev
```

### 5. Verificar Instalação

```bash
# Verificar saúde da API
curl http://localhost:3001/api/v1/health

# Resposta esperada:
# {"status": "ok", "database": "connected", "redis": "connected"}
```

---

## 🔌 API Reference

### Base URL
```
http://localhost:3001/api/v1
```

### Autenticação

#### Registrar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@mangobeat.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Resposta (201):**
```json
{
  "id": "clp1234567890",
  "email": "usuario@mangobeat.com",
  "name": "Nome do Usuário",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@mangobeat.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "user": {
    "id": "clp1234567890",
    "email": "usuario@mangobeat.com",
    "name": "Nome do Usuário"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Renovar Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Tracks (Músicas)

#### Criar Track
```http
POST /tracks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Minha Track Phonk",
  "description": "Uma track dark phonk com bass pesado",
  "genre": "phonk",
  "tags": ["dark", "phonk", "bass"],
  "audioPrompt": "Dark phonk beat with heavy 808 bass",
  "imagePrompt": "Dark cyberpunk city at night"
}
```

**Resposta (201):**
```json
{
  "id": "clp1234567891",
  "title": "Minha Track Phonk",
  "description": "Uma track dark phonk com bass pesado",
  "genre": "phonk",
  "tags": ["dark", "phonk", "bass"],
  "status": "PROCESSING",
  "userId": "clp1234567890",
  "createdAt": "2024-01-15T10:35:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

#### Listar Minhas Tracks
```http
GET /tracks/my?skip=0&take=10
Authorization: Bearer {accessToken}
```

#### Buscar Track por ID
```http
GET /tracks/{trackId}
Authorization: Bearer {accessToken}
```

#### Atualizar Track
```http
PUT /tracks/{trackId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Novo Título",
  "audioUrl": "https://storage.com/audio.mp3",
  "status": "COMPLETED"
}
```

#### Deletar Track
```http
DELETE /tracks/{trackId}
Authorization: Bearer {accessToken}
```

### Tendências TikTok

#### Tendências Populares
```http
GET /trends/popular?limit=20
```

**Resposta (200):**
```json
[
  {
    "id": "clp1234567892",
    "hashtag": "phonkmusic",
    "title": "Phonk Music Vibes",
    "description": "Dark electronic music with aggressive beats",
    "videoCount": 15420,
    "viewCount": "2500000",
    "category": "music",
    "isActive": true,
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
]
```

#### Tendências em Alta
```http
GET /trends/trending?limit=10
```

#### Buscar por Categoria
```http
GET /trends/category/music?limit=20
```

#### Analisar Hashtag Específica
```http
GET /trends/hashtag/phonkmusic
```

#### Iniciar Análise (Autenticado)
```http
POST /trends/analyze?region=global
Authorization: Bearer {accessToken}
```

### Jobs (Processamento)

#### Meus Jobs
```http
GET /jobs/my?skip=0&take=10&status=PROCESSING
Authorization: Bearer {accessToken}
```

#### Detalhes do Job
```http
GET /jobs/{jobId}
Authorization: Bearer {accessToken}
```

#### Reprocessar Job
```http
POST /jobs/{jobId}/retry
Authorization: Bearer {accessToken}
```

#### Estatísticas dos Jobs
```http
GET /jobs/stats
Authorization: Bearer {accessToken}
```

**Resposta (200):**
```json
{
  "total": 25,
  "pending": 3,
  "processing": 2,
  "completed": 18,
  "failed": 2
}
```

### Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Não autorizado |
| 404 | Não encontrado |
| 500 | Erro interno |

---

## 🗃️ Banco de Dados

### Schema Principal

#### Tabela `users`
```sql
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  name        TEXT,
  avatar      TEXT,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

#### Tabela `tracks`
```sql
CREATE TABLE tracks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  audio_url   TEXT,
  image_url   TEXT,
  genre       TEXT,
  tags        TEXT[],
  duration    INTEGER,
  status      TEXT DEFAULT 'PROCESSING',
  metadata    JSONB,
  user_id     TEXT REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

#### Tabela `jobs`
```sql
CREATE TABLE jobs (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  status       TEXT DEFAULT 'PENDING',
  priority     INTEGER DEFAULT 0,
  data         JSONB NOT NULL,
  result       JSONB,
  error        TEXT,
  attempts     INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  user_id      TEXT REFERENCES users(id),
  track_id     TEXT REFERENCES tracks(id),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);
```

#### Tabela `trends`
```sql
CREATE TABLE trends (
  id          TEXT PRIMARY KEY,
  hashtag     TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  video_count INTEGER DEFAULT 0,
  view_count  BIGINT DEFAULT 0,
  category    TEXT,
  is_active   BOOLEAN DEFAULT true,
  metadata    JSONB,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Comandos Prisma

```bash
# Gerar cliente após mudanças no schema
npm run db:generate

# Criar nova migração
npm run db:migrate

# Reset completo (CUIDADO!)
npm run db:reset

# Visualizar dados no Prisma Studio
npm run db:studio

# Deploy em produção
npm run db:deploy
```

### Backup e Restore

```bash
# Backup
pg_dump mangobeat > backup.sql

# Restore
psql mangobeat < backup.sql
```

---

## ⚡ Filas e Jobs

### Sistema de Filas (BullMQ + Redis)

O sistema usa **BullMQ** para processamento assíncrono:

#### Filas Disponíveis

| Fila | Propósito | Prioridade |
|------|-----------|------------|
| `audio-generation` | Geração de áudio com IA | Alta (1) |
| `image-generation` | Geração de imagem com IA | Média (2) |
| `trend-analysis` | Análise de tendências | Baixa (3) |
| `tiktok-upload` | Upload para TikTok | Média (2) |

#### Tipos de Jobs

```typescript
enum JobType {
  AUDIO_GENERATION = 'AUDIO_GENERATION',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  TIKTOK_UPLOAD = 'TIKTOK_UPLOAD'
}
```

#### Status de Jobs

```typescript
enum JobStatus {
  PENDING = 'PENDING',        // Aguardando processamento
  PROCESSING = 'PROCESSING',  // Sendo processado
  COMPLETED = 'COMPLETED',    // Concluído com sucesso
  FAILED = 'FAILED',         // Falhou
  CANCELLED = 'CANCELLED'     // Cancelado
}
```

#### Configuração de Retry

- **Tentativas máximas**: 3
- **Backoff**: Exponencial (2s, 4s, 8s)
- **Limpeza automática**: 10 jobs completados, 50 falhados

#### Monitoramento

```bash
# Ver estatísticas das filas
curl http://localhost:3001/api/v1/jobs/stats

# Logs em tempo real
tail -f logs/queue.log
```

---

## 🔐 Autenticação

### Sistema JWT

#### Tokens

| Tipo | Duração | Propósito |
|------|---------|-----------|
| **Access Token** | 15 minutos | Autenticação de requests |
| **Refresh Token** | 7 dias | Renovação de access tokens |

#### Headers de Autenticação

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Payload do JWT

```json
{
  "sub": "userId",
  "email": "user@mangobeat.com",
  "type": "access",
  "iat": 1642234567,
  "exp": 1642235467,
  "iss": "mangobeat-ai",
  "aud": "mangobeat-ai-app"
}
```

#### Implementação de Guards

```typescript
// Usar em controllers
@UseGuards(JwtAuthGuard)
@Controller('protected')
export class ProtectedController {
  @Get()
  getProtectedData(@Request() req) {
    // req.user contém dados do usuário
    return req.user;
  }
}
```

#### Renovação Automática

```typescript
// Cliente deve implementar renovação automática
if (response.status === 401) {
  const newToken = await refreshToken();
  // Repetir request original
}
```

---

## 🧪 Testes

### Estrutura de Testes

```
test/
├── unit/           # Testes unitários
├── integration/    # Testes de integração  
├── e2e/           # Testes end-to-end
└── fixtures/      # Dados de teste
```

### Executar Testes

```bash
# Todos os testes
npm test

# Testes unitários
npm run test:unit

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e

# Watch mode
npm run test:watch
```

### Exemplo de Teste Unitário

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      // ... outros métodos
    };
    
    useCase = new CreateUserUseCase(mockRepository);
  });

  it('deve criar usuário com dados válidos', async () => {
    // Arrange
    const userData = {
      email: 'test@mangobeat.com',
      password: 'password123'
    };
    
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(expectedUser);

    // Act
    const result = await useCase.execute(userData);

    // Assert
    expect(result.email).toBe('test@mangobeat.com');
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

### Configuração do Ambiente de Teste

```env
# .env.test
DATABASE_URL="postgresql://test:test@localhost:5433/mangobeat_test"
REDIS_HOST="localhost"
REDIS_PORT="6380"
NODE_ENV="test"
```

---

## 🚀 Deploy

### Produção com Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/mangobeat
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=mangobeat
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    
volumes:
  postgres_data:
```

### Deploy no Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create mangobeat-api

# Configurar variáveis
heroku config:set DATABASE_URL=postgresql://...
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

### Deploy no Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Variáveis de Produção

```env
# Produção
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=super-secret-production-key
REDIS_URL=redis://user:pass@host:6379
```

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] Redis configurado
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] Backup automático
- [ ] SSL/HTTPS configurado

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com o Banco

```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Testar conexão
psql -h localhost -U postgres -d mangobeat

# Verificar logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 2. Erro de Conexão com Redis

```bash
# Verificar se Redis está rodando
redis-cli ping

# Verificar logs
docker logs redis-container
```

#### 3. Jobs não Processando

```bash
# Verificar filas no Redis
redis-cli
> KEYS bull:*
> LLEN bull:audio-generation:waiting

# Verificar workers ativos
curl http://localhost:3001/api/v1/jobs/stats
```

#### 4. Erro de JWT

```bash
# Verificar se JWT_SECRET está configurado
echo $JWT_SECRET

# Verificar formato do token
jwt-cli decode eyJhbGciOiJIUzI1NiIs...
```

### Logs e Monitoramento

#### Configurar Logs

```typescript
// logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});
```

#### Ver Logs

```bash
# Logs em tempo real
tail -f logs/combined.log

# Filtrar por nível
grep "ERROR" logs/combined.log

# Logs específicos
grep "JobProcessor" logs/combined.log
```

### Performance

#### Otimizações de Banco

```sql
-- Índices importantes
CREATE INDEX idx_tracks_user_id ON tracks(user_id);
CREATE INDEX idx_tracks_status ON tracks(status);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_trends_hashtag ON trends(hashtag);
CREATE INDEX idx_trends_active ON trends(is_active);
```

#### Monitoramento de Filas

```typescript
// Adicionar métricas
queue.on('completed', (job) => {
  console.log(`Job ${job.id} completed in ${job.finishedOn - job.processedOn}ms`);
});

queue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
```

### Debugging

#### Debug Mode

```bash
# Iniciar em modo debug
npm run start:debug

# Conectar debugger no VS Code
# Usar porta 9229
```

#### Prisma Debug

```bash
# Ver queries SQL
export DEBUG="prisma:query"
npm run start:dev
```

#### Redis Debug

```bash
# Monitorar comandos Redis
redis-cli monitor
```

---

## 📚 Recursos Adicionais

### Documentação de Referência

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Jest Testing Framework](https://jestjs.io/docs)

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-jest"
  ]
}
```

### Scripts Úteis

```json
{
  "scripts": {
    "dev": "npm run start:dev",
    "db:reset": "prisma migrate reset --force",
    "db:seed": "ts-node prisma/seed.ts",
    "logs": "tail -f logs/combined.log",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "lint:fix": "eslint . --fix"
  }
}
```

---

## 📞 Suporte

Para dúvidas e suporte:

- 📧 **Email**: dev@mangobeat.com
- 🐛 **Issues**: GitHub Issues
- 📖 **Wiki**: GitHub Wiki
- 💬 **Discord**: MangoBeat Dev Community

---

**Desenvolvido com 🥭 pelo time MangoBeat AI**

*Última atualização: Novembro 2024*