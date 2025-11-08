## 🚀 Como Testar o MangoBeat AI Backend

Enquanto resolvemos alguns problemas de dependências, aqui estão várias formas de testar o sistema:

### 📋 **Opções de Teste Disponíveis:**

1. **Teste via PowerShell (Mais Fácil)**
   ```powershell
   # Execute no PowerShell
   .\test-api.ps1
   ```

2. **Teste via Node.js**
   ```bash
   # Instale axios primeiro
   npm install axios

   # Execute o teste
   node test-system.js
   ```

3. **Teste Manual via cURL/Postman**
   ```bash
   # 1. Health Check
   curl http://localhost:3001/

   # 2. Registrar usuário
   curl -X POST http://localhost:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@mangobeat.com","password":"password123","name":"Test User"}'

   # 3. Login
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@mangobeat.com","password":"password123"}'
   ```

### ⚠️ **Problemas Conhecidos e Soluções:**

**Problema 1: Banco de dados não configurado**
```bash
# Solução: Configure PostgreSQL ou use SQLite para teste
# Edite .env e mude DATABASE_URL para:
DATABASE_URL="file:./dev.db"
```

**Problema 2: Redis não disponível**
```bash
# Solução: Instale Redis localmente ou use modo mock
# Ou comente as linhas do Redis temporariamente
```

**Problema 3: Dependências de HttpService**
```bash
# O sistema está sendo ajustado, mas você pode testar:
# 1. Apenas o build: npm run build
# 2. Testes unitários: npm run test
```

### 🧪 **Testes que Funcionam Agora:**

1. **Build do Sistema:**
   ```bash
   npm run build
   # ✅ Deve compilar sem erros
   ```

2. **Geração do Prisma:**
   ```bash
   npm run db:generate
   # ✅ Gera o cliente do banco
   ```

3. **Validação dos Serviços:**
   - ✅ MusicGenService (fake beats)
   - ✅ StableDiffusionService (fake images)  
   - ✅ TrackGenerationWorker (processamento)
   - ✅ SchedulerService (tarefas automáticas)

### 🎯 **Fluxo de Teste Completo (Quando Servidor Estiver OK):**

```javascript
// 1. POST /tracks/generate
{
  "title": "Meu Beat Trap",
  "audioPrompt": "Heavy 808 bass with sharp hi-hats and dark melody",
  "imagePrompt": "Dark urban street art with neon colors",
  "genre": "trap",
  "bpm": 140,
  "duration": 60,
  "mood": "dark"
}

// 2. Resposta esperada:
{
  "message": "Track generation started successfully",
  "trackId": "track-123...",
  "jobId": "job-456...",
  "estimatedTime": "2-5 minutes"
}

// 3. Monitorar progresso:
GET /tracks/{trackId}

// 4. Resultado final:
{
  "id": "track-123...",
  "title": "Meu Beat Trap",
  "status": "COMPLETED",
  "audioUrl": "https://mangobeat.s3.amazonaws.com/generated/...",
  "imageUrl": "https://mangobeat.s3.amazonaws.com/covers/...",
  "duration": 60
}
```

### 🔧 **Quick Fix para Testar Agora:**

Vou criar uma versão simplificada sem dependências complexas para você testar imediatamente!