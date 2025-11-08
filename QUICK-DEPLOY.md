# 🚀 Deploy em Produção - Quick Start

## ✅ Pré-Deploy Checklist

Rode antes de fazer deploy:

```powershell
.\validar-deploy.ps1
```

Isso verifica:
- ✅ Build compilando
- ✅ Variáveis de ambiente configuradas
- ✅ Docker funcionando
- ✅ Health endpoints criados
- ✅ CORS configurado

---

## 🌐 Deploy Rápido (Escolha 1)

### Opção 1: Render.com (Recomendado - Gratuito)

```bash
# 1. Acesse render.com e faça login
# 2. New → Web Service
# 3. Connect GitHub repository
# 4. Configure:

Name: mangobeat-backend
Runtime: Node
Build Command: npm install && npm run db:generate && npm run build
Start Command: npm run start:prod

# 5. Add Environment Variables:
NODE_ENV=production
CORS_ORIGINS=https://seu-front.vercel.app
DATABASE_URL=<criar PostgreSQL na Render>
JWT_SECRET=<gerar secret forte>
JWT_REFRESH_SECRET=<gerar secret forte>

# 6. Create PostgreSQL Database:
# New → PostgreSQL → Copy "Internal Database URL"

# 7. Deploy!
```

**URL final:** `https://mangobeat-backend.onrender.com/api/v1/health`

---

### Opção 2: Railway.app (Mais Rápido)

```bash
# 1. Acesse railway.app
# 2. New Project → Deploy from GitHub
# 3. Selecione repositório

# 4. Add PostgreSQL:
# Add Service → PostgreSQL

# 5. Configure Variables:
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGINS=https://seu-front.vercel.app
JWT_SECRET=<secret forte>
JWT_REFRESH_SECRET=<secret forte>

# 6. Deploy automático após push!
```

**URL final:** `https://mangobeat-backend.up.railway.app/api/v1/health`

---

### Opção 3: Fly.io (Mais Controle)

```bash
# 1. Install CLI
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# 2. Login
fly auth login

# 3. Launch
fly launch

# 4. Add PostgreSQL
fly postgres create
fly postgres attach <postgres-app>

# 5. Set Secrets
fly secrets set JWT_SECRET=seu-secret
fly secrets set CORS_ORIGINS=https://seu-front.vercel.app

# 6. Deploy
fly deploy
```

**URL final:** `https://mangobeat-backend.fly.dev/api/v1/health`

---

## 🔐 Variáveis de Ambiente Essenciais

```env
# Obrigatórias
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=<gerar com: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<gerar outro>

# CORS (separar por vírgula)
CORS_ORIGINS=https://app.vercel.app,https://mangobeat.com

# Redis (opcional mas recomendado)
REDIS_HOST=us1-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=<password>
```

---

## 🧪 Validar Deploy

Após deploy, teste:

```bash
# 1. Health Check
curl https://seu-backend.com/api/v1/health

# 2. Login
curl -X POST https://seu-backend.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# 3. CORS (do frontend)
# No browser console do seu frontend:
fetch('https://seu-backend.com/api/v1/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 📋 Checklist Pós-Deploy

- [ ] Health check retornando 200: `/api/v1/health`
- [ ] CORS funcionando para domínio do frontend
- [ ] Login funcionando
- [ ] Migrations executadas (automático com `npm run start:prod`)
- [ ] Redis conectado (check em `/api/v1/health`)
- [ ] Logs sem erros
- [ ] HTTPS funcionando

---

## 🐛 Troubleshooting Rápido

**Erro: Cannot connect to database**
```bash
# Verificar DATABASE_URL está correto
# Rodar migrations:
npm run db:deploy
```

**Erro: CORS policy**
```env
# Adicionar domínio correto em CORS_ORIGINS:
CORS_ORIGINS=https://meu-front.vercel.app,https://meu-dominio.com
```

**Erro: Port already in use**
```env
# Em produção, deixe vazio (plataforma define):
# Ou use PORT=3001
```

**App não inicia**
```bash
# Verificar logs da plataforma
# Render: Logs tab
# Railway: Deployments → Logs
# Fly: fly logs
```

---

## 📞 Suporte

- **Documentação Completa:** `DEPLOY.md`
- **Testes:** `COMO-TESTAR-BACKEND.md`
- **Arquitetura:** `docs/ARCHITECTURE.md`

---

## ⚡ Comandos Úteis

```bash
# Build local
npm run build

# Testar produção localmente
npm run start:prod

# Docker local
npm run docker:up

# Validar configuração
.\validar-deploy.ps1
```

**Pronto para produção! 🚀**
