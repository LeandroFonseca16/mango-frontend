# 🚀 Guia de Deploy - MangoBeat AI Backend

## 📋 Pré-requisitos

- ✅ Node.js 20+ instalado
- ✅ Docker instalado (para teste local)
- ✅ Conta em plataforma cloud (Render, Railway, Fly.io, etc)
- ✅ PostgreSQL database (pode ser criado na própria plataforma)
- ✅ Redis instance (opcional: Upstash Redis para serverless)

---

## 🏠 Teste Local com Docker

### 1. Build da imagem
```bash
npm run docker:build
```

### 2. Rodar com Docker Compose
```bash
# Subir infraestrutura completa (PostgreSQL + Redis)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down
```

### 3. Testar endpoints
```bash
# Health check
curl http://localhost:3001/api/v1/health

# Login (exemplo)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mangobeat.com","password":"Senha123!"}'
```

---

## ☁️ Deploy em Render.com

### Setup:

1. **Criar Web Service**
   - New → Web Service
   - Connect seu repositório GitHub
   - Branch: `main`

2. **Configurações**
   ```
   Name: mangobeat-backend
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run db:generate && npm run build
   Start Command: npm run start:prod
   ```

3. **Variáveis de Ambiente**
   ```env
   NODE_ENV=production
   PORT=3001
   HOST=0.0.0.0
   
   # Database (criar PostgreSQL na Render)
   DATABASE_URL=postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/dbname
   
   # CORS
   CORS_ORIGINS=https://seu-front.vercel.app,https://mangobeat.com
   
   # JWT
   JWT_SECRET=seu-secret-super-forte-aqui
   JWT_REFRESH_SECRET=seu-refresh-secret-aqui
   
   # Redis (Upstash recomendado)
   REDIS_HOST=us1-xxx.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=seu-password-upstash
   ```

4. **Criar Database**
   - New → PostgreSQL
   - Name: `mangobeat-db`
   - Region: Oregon
   - Copiar `Internal Database URL` para `DATABASE_URL`

5. **Deploy**
   - Click em "Create Web Service"
   - Aguardar build (5-10 min)
   - URL: `https://mangobeat-backend.onrender.com`

6. **Validar**
   ```bash
   curl https://mangobeat-backend.onrender.com/api/v1/health
   ```

---

## 🚂 Deploy em Railway.app

### Setup:

1. **Novo Projeto**
   - New Project → Deploy from GitHub repo
   - Selecione seu repositório

2. **Add PostgreSQL**
   - Add Service → PostgreSQL
   - Copiar `DATABASE_URL`

3. **Add Redis** (opcional)
   - Add Service → Redis
   - Copiar connection URL

4. **Configurar Variables**
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}
   CORS_ORIGINS=https://seu-front.vercel.app
   JWT_SECRET=seu-secret-forte
   JWT_REFRESH_SECRET=seu-refresh-secret
   ```

5. **Settings**
   ```
   Build Command: npm install && npm run db:generate && npm run build
   Start Command: npm run start:prod
   Root Directory: /
   ```

6. **Deploy**
   - Push para GitHub = auto deploy
   - URL: `https://seu-projeto.up.railway.app`

7. **Run Migrations**
   ```bash
   # No terminal da Railway ou localmente:
   DATABASE_URL="sua-url" npm run db:deploy
   ```

---

## ✈️ Deploy em Fly.io

### Setup:

1. **Install Fly CLI**
   ```bash
   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Launch App**
   ```bash
   fly launch
   ```

4. **Configurar fly.toml**
   ```toml
   app = "mangobeat-backend"
   primary_region = "mia"
   
   [build]
     dockerfile = "Dockerfile"
   
   [env]
     NODE_ENV = "production"
     PORT = "3001"
     HOST = "0.0.0.0"
   
   [[services]]
     internal_port = 3001
     protocol = "tcp"
   
     [[services.ports]]
       handlers = ["http"]
       port = 80
   
     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443
   
     [services.concurrency]
       type = "connections"
       hard_limit = 25
       soft_limit = 20
   
     [[services.http_checks]]
       interval = "30s"
       timeout = "5s"
       grace_period = "10s"
       method = "get"
       path = "/api/v1/health"
   ```

5. **Add PostgreSQL**
   ```bash
   fly postgres create
   fly postgres attach <postgres-app-name>
   ```

6. **Add Redis** (Upstash recomendado)
   ```bash
   fly secrets set REDIS_HOST=us1-xxx.upstash.io
   fly secrets set REDIS_PORT=6379
   fly secrets set REDIS_PASSWORD=seu-password
   ```

7. **Set Secrets**
   ```bash
   fly secrets set JWT_SECRET=seu-secret-forte
   fly secrets set JWT_REFRESH_SECRET=seu-refresh-secret
   fly secrets set CORS_ORIGINS=https://seu-front.vercel.app
   ```

8. **Deploy**
   ```bash
   fly deploy
   ```

9. **Run Migrations**
   ```bash
   fly ssh console
   npm run db:deploy
   ```

---

## 🌐 Deploy em Vercel (Serverless)

⚠️ **Nota:** Vercel é ideal para frontends. Para backend com Prisma + Redis, use Render ou Railway.

Se ainda quiser usar Vercel:

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Criar vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/main.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/main.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

---

## 🔒 Checklist de Segurança

Antes de ir para produção:

- [ ] Mudar `JWT_SECRET` e `JWT_REFRESH_SECRET`
- [ ] Configurar `CORS_ORIGINS` corretos
- [ ] Usar HTTPS em produção
- [ ] Adicionar rate limiting
- [ ] Configurar logs e monitoring
- [ ] Usar variáveis de ambiente (nunca commitar .env)
- [ ] Validar health checks funcionando
- [ ] Testar migrations em database de staging primeiro
- [ ] Configurar backups automáticos do banco
- [ ] Adicionar Sentry ou similar para error tracking

---

## 📊 Monitoramento

### Health Checks disponíveis:

```bash
# Health geral
GET /api/v1/health

# Readiness (database conectado?)
GET /api/v1/health/ready

# Liveness (app está vivo?)
GET /api/v1/health/live
```

### Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T20:00:00.000Z",
  "uptime": "5m 30s",
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "connected",
      "latency": "15ms"
    },
    "api": {
      "status": "running",
      "responseTime": "2ms"
    }
  }
}
```

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
- Verificar `DATABASE_URL` está correto
- Checar se database aceita conexões externas
- Confirmar migrations foram executadas: `npm run db:deploy`

### Erro: "CORS policy"
- Adicionar domínio do frontend em `CORS_ORIGINS`
- Verificar se tem `https://` no início
- Separar múltiplos domínios por vírgula

### Erro: "Port already in use"
- Mudar `PORT` no .env
- Verificar se outro processo está usando a porta

### App crashing/restarting
- Verificar logs: `docker-compose logs -f`
- Checar health check endpoints
- Confirmar variáveis de ambiente configuradas

---

## 🎯 URLs de Exemplo Após Deploy

**Render:**
```
https://mangobeat-backend.onrender.com/api/v1/health
```

**Railway:**
```
https://mangobeat-backend.up.railway.app/api/v1/health
```

**Fly.io:**
```
https://mangobeat-backend.fly.dev/api/v1/health
```

---

## 📞 Suporte

- Documentação completa: `COMO-TESTAR-BACKEND.md`
- Tokens JWT: `COMO-USAR-TOKEN.md`
- Arquitetura: `docs/ARCHITECTURE.md`

**Tudo pronto para produção! 🚀**
