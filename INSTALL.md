# 🚀 INSTRUÇÕES DE INSTALAÇÃO - MANGOBEAT NEXT.JS

## ⚡ Instalação Rápida (5 minutos)

### 1. Navegue até a pasta do projeto

```powershell
cd e:\personal\phonk-ai\mangobeat-nextjs
```

### 2. Execute o script de setup automatizado

```powershell
.\setup.ps1
```

Este script irá:
- ✅ Verificar versão do Node.js (20+)
- ✅ Instalar todas as dependências
- ✅ Criar arquivo `.env` com secret gerado
- ✅ Gerar Prisma Client
- ✅ Rodar migrations do banco
- ✅ Build da aplicação

### 3. Configure o arquivo .env

Abra `.env` e edite:

```env
# Database (use o mesmo do projeto antigo)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mangobeat?schema=public"

# OpenAI (obrigatório para geração de música)
OPENAI_API_KEY="sk-..." # Sua chave da OpenAI

# Stripe (opcional - comentar se não usar)
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Resend (opcional - comentar se não usar)
# RESEND_API_KEY="re_..."
```

### 4. Rode o projeto em desenvolvimento

```powershell
npm run dev
```

✅ **Abra:** http://localhost:3000

---

## 🐳 Alternativa: Docker (Recomendado para Produção)

Se preferir rodar tudo com Docker:

```powershell
# 1. Configure variáveis de ambiente
cp .env.docker .env

# 2. Edite .env com suas chaves de API

# 3. Suba os containers
docker-compose up -d

# 4. Acompanhe os logs
docker-compose logs -f app
```

✅ **Acesse:** http://localhost:3000  
📊 **Database:** localhost:5432

---

## 📦 Estrutura de Comandos

```powershell
# Desenvolvimento
npm run dev              # Roda em http://localhost:3000

# Build
npm run build            # Build de produção
npm start                # Roda build em produção

# Database
npm run db:generate      # Gera Prisma Client
npm run db:migrate       # Roda migrations
npm run db:studio        # Abre Prisma Studio (GUI)

# Qualidade
npm run lint             # Lint do código
npm run typecheck        # Verifica TypeScript

# Docker
docker-compose up -d     # Sobe containers
docker-compose down      # Para containers
docker-compose logs -f   # Vê logs
```

---

## 🔍 Verificação da Instalação

Após rodar `npm run dev`, teste:

1. **Home Page:** http://localhost:3000
   - Deve mostrar landing page com hero e features

2. **API Health:** http://localhost:3000/api/health
   - Deve retornar `{ "status": "ok" }`

3. **Database:**
   ```powershell
   npm run db:studio
   ```
   - Abre Prisma Studio em http://localhost:5555

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module 'next'"

```powershell
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Prisma Client not generated"

```powershell
npm run db:generate
```

### Erro: "Database connection failed"

Verifique se o PostgreSQL está rodando:

```powershell
# Se usando Docker do projeto antigo
docker ps | findstr postgres

# Se usando PostgreSQL local
Get-Service -Name postgresql*
```

Ajuste `DATABASE_URL` no `.env` se necessário.

### Erro: "Port 3000 already in use"

```powershell
# Encontre o processo
netstat -ano | findstr :3000

# Mate o processo (substitua <PID>)
taskkill /PID <PID> /F
```

---

## 🎯 Próximos Passos Após Instalação

1. **Explorar o código:**
   - `app/` - Páginas e API routes
   - `components/` - Componentes React
   - `lib/` - Utilities e serviços

2. **Ler documentação:**
   - `README.md` - Overview completo
   - `MIGRATION-GUIDE.md` - Guia de migração
   - `REFACTORING-SUMMARY.md` - Resumo executivo

3. **Testar funcionalidades:**
   - Criar conta de usuário
   - Gerar primeira track
   - Trocar temas (6 disponíveis)

4. **Integrar com projeto antigo:**
   - Mesma database = dados compartilhados
   - Pode rodar ambos simultaneamente
   - Migre gradualmente as features

---

## 📞 Suporte

- **Documentação:** Veja `README.md` e `MIGRATION-GUIDE.md`
- **Issues:** Abra uma issue no repositório
- **Logs:** `npm run dev` mostra erros em tempo real

---

**Boa sorte! 🚀🎵**
