# 🚀 GUIA PASSO-A-PASSO: Deploy no Render.com

## ✅ Preparação Completa

Git inicializado e pronto! Agora siga os passos:

---

## 📋 PASSO 1: Criar conta no Render

1. Acesse: https://render.com
2. Click em **"Get Started"**
3. Cadastre com GitHub (recomendado) ou email
4. Confirme seu email

---

## 📦 PASSO 2: Criar Repositório no GitHub

### Opção A: GitHub Desktop (Mais Fácil)

1. Baixe: https://desktop.github.com
2. Instale e faça login
3. Click em **"Add" → "Add Existing Repository"**
4. Selecione a pasta: `E:\personal\phonk-ai\mangobeat-ai-backend`
5. Click em **"Publish repository"**
6. Nome: `mangobeat-ai-backend`
7. Desmarque "Keep this code private" (ou marque se quiser privado)
8. Click em **"Publish Repository"**

### Opção B: Linha de Comando

```powershell
# 1. Crie repositório no GitHub: https://github.com/new
# Nome: mangobeat-ai-backend

# 2. Adicione remote (substitua SEU-USUARIO):
git remote add origin https://github.com/SEU-USUARIO/mangobeat-ai-backend.git
git branch -M main
git push -u origin main
```

---

## 🗄️ PASSO 3: Criar Database PostgreSQL no Render

1. No Render Dashboard, click em **"New +"**
2. Escolha **"PostgreSQL"**
3. Configure:
   ```
   Name: mangobeat-db
   Database: mangobeat
   User: mangobeat_user
   Region: Oregon (US West)
   PostgreSQL Version: 16
   Plan: Free
   ```
4. Click em **"Create Database"**
5. Aguarde ~2 minutos até Status: **Available**
6. **COPIE** a **"Internal Database URL"** (começando com `postgresql://`)
   ```
   Exemplo:
   postgresql://mangobeat_user:senha@dpg-xxx.oregon-postgres.render.com/mangobeat
   ```
7. **SALVE** essa URL em um arquivo temporário

---

## 🌐 PASSO 4: Criar Web Service (Backend)

1. No Render Dashboard, click em **"New +"**
2. Escolha **"Web Service"**
3. Click em **"Connect account"** (GitHub)
4. Autorize o Render a acessar seus repositórios
5. Selecione **"mangobeat-ai-backend"**
6. Configure:

   ```
   Name: mangobeat-backend
   Region: Oregon (US West)
   Branch: main
   Runtime: Node
   
   Build Command:
   npm install && npm run db:generate && npm run build
   
   Start Command:
   npm run start:prod
   
   Plan: Free
   ```

7. **NÃO CLIQUE EM "Create Web Service" AINDA!**

---

## 🔐 PASSO 5: Configurar Variáveis de Ambiente

**ANTES** de criar o Web Service, adicione as variáveis:

1. Scroll até **"Environment Variables"**
2. Click em **"Add Environment Variable"**
3. Adicione **CADA UMA** dessas:

```env
NODE_ENV
production

PORT
3001

HOST
0.0.0.0

DATABASE_URL
[COLE A URL DO PASSO 3 AQUI]

JWT_SECRET
[GERE UM SECRET - VER ABAIXO]

JWT_REFRESH_SECRET
[GERE OUTRO SECRET - VER ABAIXO]

CORS_ORIGINS
http://localhost:5173,http://localhost:3000

REDIS_HOST
localhost

REDIS_PORT
6379

REDIS_PASSWORD
[DEIXE VAZIO]
```

### 🔑 Como gerar JWT_SECRET forte:

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Execute 2 vezes: uma para `JWT_SECRET` e outra para `JWT_REFRESH_SECRET`

Exemplo de resultado:
```
a7f3c9e1b8d4f6a2c5e8b1d7f9a3c6e2b8d5f1a7c4e9b2d6f8a1c3e7b5d9f2a4c8
```

---

## 🚀 PASSO 6: Deploy!

1. Depois de adicionar **TODAS** as variáveis de ambiente
2. Click em **"Create Web Service"**
3. Aguarde o build (5-10 minutos)
4. Acompanhe os logs em tempo real
5. Quando aparecer: **"Your service is live 🎉"** está pronto!

---

## ✅ PASSO 7: Validar Deploy

Sua URL será algo como:
```
https://mangobeat-backend.onrender.com
```

### Teste 1: Health Check

Abra no navegador:
```
https://mangobeat-backend.onrender.com/api/v1/health
```

Deve retornar:
```json
{
  "status": "ok",
  "environment": "production",
  "services": {
    "database": {
      "status": "connected"
    }
  }
}
```

### Teste 2: PowerShell

```powershell
# Substitua pela sua URL
$url = "https://mangobeat-backend.onrender.com"

# Health check
Invoke-RestMethod "$url/api/v1/health"

# Criar usuário
$userBody = @{
    email = "test@mangobeat.com"
    password = "Test123!"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod "$url/api/v1/auth/register" -Method POST -ContentType "application/json" -Body $userBody

# Login
$loginBody = @{
    email = "test@mangobeat.com"
    password = "Test123!"
} | ConvertTo-Json

$login = Invoke-RestMethod "$url/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
$token = $login.accessToken

Write-Host "Token: $token"
```

---

## 🎨 PASSO 8: Conectar Frontend

### No seu projeto frontend (Vite/React):

1. Crie arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=https://mangobeat-backend.onrender.com/api/v1
```

2. No seu código:

```typescript
// src/config/api.ts
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// src/services/api.ts
import axios from 'axios';
import { API_URL } from '../config/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

3. Use a API:

```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.accessToken);
  return response.data;
};

// Gerar track
const generateTrack = async (data: any) => {
  const response = await api.post('/tracks/generate', data);
  return response.data;
};

// Listar tracks
const getTracks = async () => {
  const response = await api.get('/tracks');
  return response.data;
};
```

---

## 🔄 PASSO 9: Atualizar CORS para seu frontend

Depois que fizer deploy do frontend (ex: Vercel):

1. Volte ao Render Dashboard
2. Clique no seu Web Service
3. Vá em **"Environment"**
4. Edite `CORS_ORIGINS`
5. Adicione a URL do seu frontend:

```
https://seu-frontend.vercel.app,http://localhost:5173,http://localhost:3000
```

6. Click **"Save Changes"**
7. O Render vai fazer redeploy automático

---

## 📊 Monitoramento

### Logs em tempo real:
```
Render Dashboard → Seu Service → Logs
```

### Métricas:
```
Render Dashboard → Seu Service → Metrics
```

### Redeploy manual:
```
Render Dashboard → Seu Service → Manual Deploy → Deploy latest commit
```

---

## 🐛 Troubleshooting

### Build falhou?
- Verifique os logs no Render
- Confirme que todas env vars estão configuradas
- Teste build local: `npm run build`

### Database error?
- Verifique se `DATABASE_URL` está correta
- Confira se migrations rodaram (ver logs)
- Teste conexão manual com a URL

### CORS error no frontend?
- Adicione URL do frontend em `CORS_ORIGINS`
- Verifique se tem `https://` (não `http://`)
- Separe múltiplas URLs com vírgula (sem espaços)

### App muito lento?
- Normal na primeira request (cold start no plano free)
- Depois de 15min sem uso, app "dorme"
- Considere upgrade para plano pago ($7/mês) para manter ativo

---

## ✅ Checklist Final

- [ ] Repositório GitHub criado e código enviado
- [ ] Database PostgreSQL criado no Render
- [ ] Web Service criado e deployado
- [ ] Todas variáveis de ambiente configuradas
- [ ] Health check retornando 200
- [ ] Consegue criar usuário e fazer login
- [ ] Frontend conectado e testado
- [ ] CORS configurado para domínio do frontend

---

## 🎉 Pronto!

Seu backend está no ar em:
```
https://mangobeat-backend.onrender.com/api/v1
```

URLs importantes:
- Health: `/health`
- Register: `/auth/register`
- Login: `/auth/login`
- Generate Track: `/tracks/generate`
- List Tracks: `/tracks`

**Backend em produção funcionando! 🚀**

---

## 📞 Precisa de ajuda?

Se algo der errado:
1. Verifique os logs no Render
2. Teste localmente primeiro
3. Confira se env vars estão corretas
4. Me mande o erro específico!
