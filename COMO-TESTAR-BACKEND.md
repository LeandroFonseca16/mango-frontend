# 🧪 Como Testar o Backend - 3 Formas Fáceis

## ✅ 1. PowerShell (MAIS FÁCIL - Automático)

### Rode o script pronto:
```powershell
.\teste-facil.ps1
```

Esse script faz TUDO automaticamente:
- ✅ Cria usuário
- ✅ Faz login
- ✅ Gera track com IA
- ✅ Aguarda processamento
- ✅ Mostra resultado completo

---

## 📮 2. Postman (Visual e Profissional)

### Passo a passo:

1. **Baixar Postman**
   - Acesse: https://www.postman.com/downloads/
   - Ou use a versão web: https://web.postman.com/

2. **Importar Collection**
   - Abra o Postman
   - Click em `Import`
   - Selecione o arquivo: `MangoBeat-API.postman_collection.json`
   - Click em `Import`

3. **Testar em Ordem**
   ```
   1. Auth → 1.1 Registrar Usuário
   2. Auth → 1.2 Login (salva token automaticamente)
   3. Tracks → 2.1 Gerar Track com IA
   4. Aguarde 10 segundos...
   5. Tracks → 2.2 Buscar Track por ID
   ```

### Dicas Postman:
- O token é salvo **automaticamente** após login
- Variável `{{baseUrl}}` já configurada
- Variável `{{trackId}}` salva após gerar track
- Console mostra mensagens de sucesso

---

## ⚡ 3. Thunder Client (Extensão VS Code)

### Instalar:
1. Abra VS Code
2. Extensions (Ctrl+Shift+X)
3. Procure: `Thunder Client`
4. Click em `Install`

### Usar:
1. Click no ícone do raio ⚡ na barra lateral
2. Click em `Collections` → `Import`
3. Selecione: `MangoBeat-API.postman_collection.json`
4. Pronto! Use igual o Postman

**Vantagem:** Não precisa sair do VS Code!

---

## 🎯 Endpoints Principais

### Base URL:
```
http://localhost:3001/api/v1
```

### 1. Criar Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "seu@email.com",
  "password": "SuaSenha123!",
  "name": "Seu Nome"
}
```

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "seu@email.com",
  "password": "SuaSenha123!"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGci...",
  "user": { ... }
}
```

### 3. Gerar Track (precisa do token!)
```http
POST /tracks/generate
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "title": "Meu Phonk",
  "description": "Beat massa",
  "genre": "phonk",
  "tags": ["phonk", "trap"],
  "audioPrompt": "Heavy phonk beat with 808 bass",
  "imagePrompt": "Dark aesthetic cover"
}
```

### 4. Buscar Track
```http
GET /tracks/{trackId}
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## 🐛 Problemas Comuns

### ❌ Erro 404
**Causa:** Esqueceu o prefixo `/api/v1`
**Solução:** Use `http://localhost:3001/api/v1/...`

### ❌ Erro 401 Unauthorized
**Causa:** Token inválido ou expirado
**Solução:** Faça login novamente

### ❌ Erro 500 Internal Server Error
**Causa:** Servidor não está rodando
**Solução:** Rode `npm run start:dev`

### ❌ Cannot connect
**Causa:** PostgreSQL ou Redis não estão rodando
**Solução:** 
```powershell
docker-compose up -d
```

---

## 📊 Monitorar Servidor

### Ver logs em tempo real:
O terminal com `npm run start:dev` mostra:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [RoutesResolver] TrackController {/api/v1/tracks}
🚀 MangoBeat AI Backend rodando na porta 3001
```

### Verificar se está rodando:
```powershell
curl http://localhost:3001/api/v1/tracks -Headers @{"Authorization"="Bearer TOKEN"}
```

---

## 🎓 Fluxo Completo de Teste

```
1. Servidor rodando? ✅
   npm run start:dev

2. Docker rodando? ✅
   docker-compose up -d

3. Rodar teste automático ✅
   .\teste-facil.ps1

4. Ou usar Postman ✅
   - Importar collection
   - Rodar requests em ordem

5. Ver resultado ✅
   Track com status COMPLETED
   Audio e image URLs geradas
```

---

## 💡 Dicas

### PowerShell (Recomendado para começar):
- ✅ Mais rápido
- ✅ Testa tudo de uma vez
- ✅ Mostra resultado colorido
- ✅ Não precisa instalar nada

### Postman (Melhor para desenvolvimento):
- ✅ Interface visual
- ✅ Salva histórico
- ✅ Testa endpoints individuais
- ✅ Gera documentação

### Thunder Client (Dentro do VS Code):
- ✅ Não precisa sair do editor
- ✅ Mais leve que Postman
- ✅ Integrado com VS Code

---

## 🚀 Próximos Passos

Após testar com sucesso:
1. ✅ Experimenta mudar o `audioPrompt` e `imagePrompt`
2. ✅ Testa gêneros diferentes (trap, funk, drill)
3. ✅ Lista suas tracks criadas
4. ✅ Ve os metadados gerados (BPM, instruments, etc)

**Divirta-se! 🎵**
