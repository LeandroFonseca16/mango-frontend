# 🥭 MangoBeat AI Backend

Backend da aplicação **MangoBeat AI** - Plataforma de geração de música com IA e análise de tendências do TikTok.

---

## 🎯 COMECE AQUI

**👉 Primeira vez? Leia:** **[COMECE-AQUI.md](COMECE-AQUI.md)** ← Deploy em 30 minutos!

---

## ⚡ Quick Start - Deploy em 30 Minutos

**🎯 Quer colocar em produção AGORA?** Leia o **[README-DEPLOY.md](README-DEPLOY.md)** - 30 minutos do código ao ar!

**📖 Guia passo-a-passo completo:** [PASSO-A-PASSO-DEPLOY.md](PASSO-A-PASSO-DEPLOY.md) (em português)

**💻 Integração com Frontend:** [FRONTEND-SETUP.md](FRONTEND-SETUP.md) - Código pronto para React/TypeScript

---

## 🚀 Tecnologias

- **NestJS v11** - Framework Node.js com Clean Architecture
- **Prisma ORM** - PostgreSQL com migrations automáticas
- **BullMQ** - Filas assíncronas com Redis
- **JWT + Passport** - Autenticação stateless
- **TypeScript** - Type-safety completa
- **Docker** - Multi-stage build otimizado
- **Jest** - Testes unitários e E2E

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** e **SOLID**:

```
src/
├── domain/           # Entidades puras e interfaces de repositório
├── application/      # Use cases e serviços (lógica de negócio)
├── infrastructure/   # Prisma, APIs externas, Redis/BullMQ
├── presentation/     # Controllers REST, DTOs, Guards
└── modules/          # Injeção de dependência com NestJS
```

**📚 Documentação Completa:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 📦 Instalação Local

### Com Docker (Recomendado)

```powershell
# 1. Clone o repositório
git clone <repo-url>
cd mangobeat-ai-backend

# 2. Copie e configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves de API

# 3. Inicie PostgreSQL e Redis
npm run docker:up

# 4. Gere o Prisma Client e rode migrations
npm run db:generate
npm run db:migrate

# 5. Inicie o servidor
npm run start:dev
```

**Servidor rodando em:** `http://localhost:3001`  
**Prisma Studio:** `npm run db:studio` → `http://localhost:5555`

### Sem Docker

```powershell
# Pré-requisitos: PostgreSQL 14+ e Redis instalados localmente

# 1. Clone e instale
git clone <repo-url>
cd mangobeat-ai-backend
npm install

# 2. Configure .env com suas URLs de banco/Redis
cp .env.example .env

# 3. Setup do banco
npm run db:generate
npm run db:migrate

# 4. Inicie
npm run start:dev
```

## 🗃️ Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Reset do banco (cuidado!)
npm run db:reset

# Abrir Prisma Studio
npm run db:studio
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📡 API Endpoints

**Base URL:** `http://localhost:3001/api/v1`

### 🏥 Health Checks
- `GET /health` - Métricas completas (DB latency, memory, uptime)
- `GET /health/ready` - Readiness probe (database check)
- `GET /health/live` - Liveness probe

### 🔐 Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login (retorna access + refresh token)
- `POST /auth/refresh` - Renovar token

### 🎵 Tracks/Músicas
- `GET /tracks` - Listar tracks públicas (paginado)
- `POST /tracks/generate` - **Gerar música com IA** (async com BullMQ)
- `GET /tracks/my` - Minhas tracks (requer autenticação)
- `GET /tracks/:id` - Detalhes da track
- `PUT /tracks/:id` - Atualizar metadados
- `DELETE /tracks/:id` - Deletar track

### 📈 Tendências TikTok
- `GET /trends/popular` - Tendências populares
- `GET /trends/trending` - Trending agora
- `GET /trends/category/:category` - Filtrar por categoria
- `POST /trends/analyze` - Analisar tendências (job assíncrono)

### ⚙️ Jobs/Processamento
- `GET /jobs` - Listar meus jobs
- `GET /jobs/:id` - Status do job (pending/processing/completed/failed)
- `POST /jobs/:id/retry` - Tentar novamente

**📖 Documentação Swagger:** `http://localhost:3001/api/docs` (em desenvolvimento)

## 🔧 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# 🗄️ Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mangobeat"

# 🔐 JWT (NUNCA use estes valores em produção!)
JWT_SECRET="dev-secret-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# 🔴 Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# 🌐 Server
NODE_ENV="development"
PORT="3001"
HOST="0.0.0.0"
FRONTEND_URL="http://localhost:5173"

# 🔀 CORS (múltiplas origens separadas por vírgula)
CORS_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:4200"

# 🤖 APIs Externas (opcional para dev local)
OPENAI_API_KEY=""
TIKTOK_API_KEY=""
```

**🔒 Para produção:** Use `.\gerar-secrets.ps1` (Windows) para gerar JWT secrets fortes.

**📄 Arquivo completo:** [.env.example](.env.example)

## 🏃‍♂️ Scripts Disponíveis

### Desenvolvimento
```powershell
npm run start:dev      # Hot reload com watch mode
npm run start:debug    # Debug mode (port 9229)
npm run db:studio      # Prisma Studio UI
```

### Build & Produção
```powershell
npm run build          # Compile TypeScript
npm run start:prod     # Produção (roda migrations antes)
```

### Docker
```powershell
npm run docker:up      # PostgreSQL + Redis
npm run docker:down    # Para containers
npm run docker:build   # Build da imagem Docker
```

### Database
```powershell
npm run db:generate    # Gera Prisma Client
npm run db:migrate     # Cria e aplica migrations
npm run db:deploy      # Deploy migrations (produção)
npm run db:reset       # ⚠️ Reset completo (cuidado!)
```

### Testes
```powershell
npm test               # Testes unitários
npm run test:watch     # Watch mode
npm run test:cov       # Coverage report
npm run test:e2e       # Testes E2E
```

### Utilidades
```powershell
npm run lint           # ESLint check
.\validar-deploy.ps1   # Valida configuração de deploy
.\gerar-secrets.ps1    # Gera JWT secrets seguros
```

## 🌐 Deploy para Produção

### Deploy Rápido (30 min)

1. **GitHub** - Publique o repositório
2. **Render.com** - Crie conta gratuita
3. **Database** - PostgreSQL gratuito no Render
4. **Web Service** - Conecte GitHub, configure env vars
5. **Frontend** - Configure `VITE_API_URL` e CORS

**📖 Guia completo:** [README-DEPLOY.md](README-DEPLOY.md) - Checklist de 30 minutos  
**🇧🇷 Passo a passo:** [PASSO-A-PASSO-DEPLOY.md](PASSO-A-PASSO-DEPLOY.md) - Em português

### Outras Plataformas

- **Railway** - Deploy com `railway up`, $5/mês inclui PostgreSQL
- **Fly.io** - Dockerfile automático, 3 VMs gratuitas
- **AWS/Azure/GCP** - Docker + RDS/Cloud SQL

**📚 Guias detalhados:** [DEPLOY.md](DEPLOY.md)

### Checklist Pré-Deploy

```powershell
# Validar configuração
.\validar-deploy.ps1

# Gerar secrets JWT seguros
.\gerar-secrets.ps1

# Build local
npm run build

# Verificar saúde da aplicação
curl http://localhost:3001/api/v1/health
```

## 📚 Documentação Completa

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Visão geral da Clean Architecture
- **[API.md](docs/API.md)** - Referência completa de endpoints
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** - Guia para desenvolvedores
- **[DEPLOY.md](DEPLOY.md)** - Opções de deploy (Render, Railway, Fly.io)
- **[FRONTEND-SETUP.md](FRONTEND-SETUP.md)** - Integração com React/TypeScript
- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)** - Como contribuir

## 🔍 Monitoramento e Logs

### Health Checks em Produção

```bash
# Status geral com métricas
curl https://seu-app.onrender.com/api/v1/health

# Readiness probe (banco de dados)
curl https://seu-app.onrender.com/api/v1/health/ready

# Liveness probe
curl https://seu-app.onrender.com/api/v1/health/live
```

### Logs no Render

```bash
# Via Render CLI
render logs --service=mangobeat-backend --follow

# Via Dashboard
# https://dashboard.render.com → Service → Logs
```

## 🧪 Testando a API

### Com cURL

```powershell
# Registrar usuário
curl -X POST http://localhost:3001/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\"}'

# Gerar música (requer token)
curl -X POST http://localhost:3001/api/v1/tracks/generate `
  -H "Authorization: Bearer SEU_TOKEN_AQUI" `
  -H "Content-Type: application/json" `
  -d '{\"prompt\":\"phonk agressivo com 808 pesado\"}'
```

### Com Postman/Insomnia

Importe a collection em `docs/postman_collection.json` (em desenvolvimento)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

**Leia:** [CONTRIBUTING.md](docs/CONTRIBUTING.md) para convenções de código e commits.

## � Troubleshooting

### Erro de conexão com PostgreSQL

```powershell
# Verifique se o Docker está rodando
docker ps

# Reinicie os containers
npm run docker:down
npm run docker:up
```

### Prisma Client desatualizado

```powershell
# Regenere o cliente
npm run db:generate
```

### Redis não conecta

```powershell
# Teste conexão
docker exec -it mangobeat-redis redis-cli ping
# Deve retornar: PONG
```

### Build falha em produção

```powershell
# Limpe cache e node_modules
rm -rf node_modules dist generated
npm install
npm run db:generate
npm run build
```

## �📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙋 Suporte

- 📧 Email: suporte@mangobeat.ai
- 💬 Discord: [discord.gg/mangobeat](https://discord.gg/mangobeat) (em breve)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/mangobeat-ai-backend/issues)

---

**Desenvolvido com 🥭 pelo time MangoBeat AI**

⭐ Se este projeto te ajudou, deixe uma estrela no GitHub!