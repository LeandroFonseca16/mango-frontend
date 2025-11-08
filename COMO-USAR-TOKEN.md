# 🔐 Como Usar Token JWT - Guia Completo

## ❌ O Erro que Você Viu:
```json
{
    "message": "Token de acesso não fornecido",
    "error": "Unauthorized",
    "statusCode": 401
}
```

**Causa:** Você tentou acessar uma rota protegida sem enviar o token JWT.

---

## ✅ Solução Rápida

### 1. Gerar Token:
```powershell
.\gerar-token.ps1
```

Isso vai:
- ✅ Fazer login
- ✅ Gerar token
- ✅ Salvar em `token.txt`
- ✅ Testar se funciona

---

## 📱 Como Usar em Cada Ferramenta

### 🔷 PowerShell

#### Opção 1: Usando arquivo token.txt
```powershell
# Ler token do arquivo
$token = Get-Content token.txt

# Criar headers
$headers = @{
    "Authorization" = "Bearer $token"
}

# Fazer request
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks" -Headers $headers
```

#### Opção 2: Inline (tudo em uma linha)
```powershell
$token = Get-Content token.txt; Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks" -Headers @{"Authorization"="Bearer $token"}
```

#### Opção 3: POST com token
```powershell
$token = Get-Content token.txt
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    title = "Nova Track"
    genre = "phonk"
    tags = @("test")
    audioPrompt = "Heavy beat"
    imagePrompt = "Dark cover"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks/generate" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

### 📮 Postman

#### Método 1: Bearer Token (Recomendado)
1. Abra a request
2. Vá na aba **Authorization**
3. Type: Selecione **"Bearer Token"**
4. Token: Cole o token (sem o "Bearer ")
5. Send!

#### Método 2: Header Manual
1. Vá na aba **Headers**
2. Add key: `Authorization`
3. Add value: `Bearer SEU_TOKEN_AQUI`
4. Send!

#### Dica: Token Automático
Se você importou a collection:
- O token já é salvo automaticamente após login!
- Basta rodar "1.2 Login" primeiro
- Depois todas as outras requests funcionam

---

### ⚡ Thunder Client (VS Code)

#### Passo a passo:
1. Abra a request
2. Aba **Auth**
3. Auth Type: **Bearer**
4. Token: Cole o token
5. Send!

Ou adicione header manual:
```
Key: Authorization
Value: Bearer SEU_TOKEN_AQUI
```

---

### 🌐 cURL

```bash
curl http://localhost:3001/api/v1/tracks \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Com POST:
```bash
curl -X POST http://localhost:3001/api/v1/tracks/generate \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Track via cURL",
    "genre": "phonk",
    "tags": ["test"],
    "audioPrompt": "Heavy beat",
    "imagePrompt": "Dark cover"
  }'
```

---

## 🔑 Entendendo o Token JWT

### Estrutura:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  <- Header (algoritmo)
.
eyJzdWIiOiJ1c2VyLWlkIiwiZW1haWwiOi... <- Payload (dados do usuário)
.
nSWXJT8ELP2YiEAZtre1WBZ4UPWL7D2ocCm... <- Signature (assinatura)
```

### O que tem dentro (Payload):
```json
{
  "sub": "user-id",           // ID do usuário
  "email": "demo@mangobeat.com",
  "type": "access",
  "iat": 1234567890,          // Criado em
  "exp": 1234568790,          // Expira em (15 min)
  "aud": "mangobeat-ai-app",
  "iss": "mangobeat-ai"
}
```

### Expiração:
- ⏰ Token expira em **15 minutos**
- 🔄 Quando expirar, faça login novamente
- 📝 Ou rode `.\gerar-token.ps1` de novo

---

## 🔍 Testando se Token Funciona

### Teste Rápido:
```powershell
# Opção 1: Com token válido
$token = Get-Content token.txt
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks" -Headers @{"Authorization"="Bearer $token"}

# Opção 2: Sem token (deve dar erro 401)
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks"
```

### Resultado Esperado:
- ✅ **Com token:** Retorna lista de tracks
- ❌ **Sem token:** Erro 401 Unauthorized

---

## 🚨 Erros Comuns

### Erro: "Token de acesso não fornecido"
**Causa:** Não enviou header `Authorization`
**Solução:** Adicione header com token

### Erro: "Token inválido"
**Causa:** Token corrompido ou formato errado
**Solução:** Gere novo token com `.\gerar-token.ps1`

### Erro: "Token expirado"
**Causa:** Token passou de 15 minutos
**Solução:** Faça login novamente

### Erro: "Unauthorized" mesmo com token
**Causa:** Esqueceu a palavra "Bearer " antes do token
**Solução:** Use: `Bearer SEU_TOKEN` (com espaço)

---

## 📋 Checklist de Uso

Antes de fazer qualquer request protegida:

- [ ] Token gerado? (`.\gerar-token.ps1`)
- [ ] Header `Authorization` presente?
- [ ] Formato correto? `Bearer TOKEN` (com espaço)
- [ ] Token não expirou? (< 15 min)
- [ ] Servidor rodando? (`npm run start:dev`)

---

## 🎯 Rotas Protegidas vs Públicas

### 🔓 Rotas Públicas (sem token):
- `POST /api/v1/auth/register` - Criar conta
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/trends/popular` - Trends populares
- `GET /api/v1/trends/trending` - Trends em alta

### 🔒 Rotas Protegidas (precisa token):
- `GET /api/v1/tracks` - Listar tracks
- `GET /api/v1/tracks/:id` - Buscar track
- `POST /api/v1/tracks/generate` - Gerar track
- `PUT /api/v1/tracks/:id` - Atualizar track
- `DELETE /api/v1/tracks/:id` - Deletar track
- `GET /api/v1/jobs/:id` - Buscar job
- `GET /api/v1/jobs/user/me` - Jobs do usuário

---

## 💡 Dicas Pro

### 1. Salvar Token em Variável
```powershell
# Sessão inteira usa o mesmo token
$global:token = Get-Content token.txt
$global:headers = @{"Authorization" = "Bearer $global:token"}

# Agora use em qualquer request
Invoke-RestMethod -Uri "..." -Headers $global:headers
```

### 2. Função Helper
```powershell
# Adicione no seu perfil PowerShell
function Invoke-MangoBeatAPI {
    param($Endpoint, $Method = "GET", $Body = $null)
    
    $token = Get-Content token.txt
    $headers = @{"Authorization" = "Bearer $token"}
    
    if ($Body) {
        $headers["Content-Type"] = "application/json"
    }
    
    Invoke-RestMethod `
        -Uri "http://localhost:3001/api/v1$Endpoint" `
        -Method $Method `
        -Headers $headers `
        -Body $Body
}

# Uso:
Invoke-MangoBeatAPI "/tracks"
Invoke-MangoBeatAPI "/tracks/generate" -Method POST -Body $json
```

### 3. Auto-Refresh Token
```powershell
# Verifica se token existe e não expirou
if (!(Test-Path token.txt) -or ((Get-Date) - (Get-Item token.txt).LastWriteTime).TotalMinutes -gt 14) {
    Write-Host "Token expirado, gerando novo..."
    .\gerar-token.ps1
}
```

---

## 🎓 Resumo

1. **Gere token:** `.\gerar-token.ps1`
2. **Use em PowerShell:** `$token = Get-Content token.txt`
3. **Use em Postman:** Aba Authorization → Bearer Token
4. **Formato:** `Authorization: Bearer SEU_TOKEN`
5. **Expira em:** 15 minutos
6. **Quando expirar:** Gere novo token

**Pronto para testar! 🚀**
