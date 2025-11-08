# ========================================
# DIAGNOSTICO DE LOGIN - MANGOBEAT AI
# ========================================

Write-Host "`n=== DIAGNOSTICO DE LOGIN ===" -ForegroundColor Cyan

# Teste 1: Usuario que existe
Write-Host "`n1. Teste com usuario CORRETO:" -ForegroundColor Green
Write-Host "   Email: demo@mangobeat.com" -ForegroundColor Gray
Write-Host "   Senha: Demo123!" -ForegroundColor Gray

try {
    $loginBody = @{
        email = "demo@mangobeat.com"
        password = "Demo123!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "`n   RESULTADO: SUCESSO!" -ForegroundColor Green
    Write-Host "   Usuario: $($response.user.name)" -ForegroundColor White
    Write-Host "   Email: $($response.user.email)" -ForegroundColor White
    Write-Host "   Access Token: $($response.accessToken.Substring(0, 30))..." -ForegroundColor Cyan
    Write-Host "   Refresh Token: $($response.refreshToken.Substring(0, 30))..." -ForegroundColor Cyan
} catch {
    Write-Host "`n   RESULTADO: ERRO!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorDetails = $reader.ReadToEnd()
        Write-Host "   Detalhes: $errorDetails" -ForegroundColor Yellow
    }
}

# Teste 2: Senha errada
Write-Host "`n2. Teste com SENHA ERRADA:" -ForegroundColor Yellow
Write-Host "   Email: demo@mangobeat.com" -ForegroundColor Gray
Write-Host "   Senha: SenhaErrada123" -ForegroundColor Gray

try {
    $loginBody = @{
        email = "demo@mangobeat.com"
        password = "SenhaErrada123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "`n   RESULTADO: Nao deveria ter sucesso!" -ForegroundColor Red
} catch {
    Write-Host "`n   RESULTADO: ERRO (esperado)" -ForegroundColor Green
    Write-Host "   Mensagem: $($_.Exception.Message)" -ForegroundColor White
}

# Teste 3: Usuario que nao existe
Write-Host "`n3. Teste com USUARIO INEXISTENTE:" -ForegroundColor Yellow
Write-Host "   Email: naoexiste@mangobeat.com" -ForegroundColor Gray
Write-Host "   Senha: Senha123!" -ForegroundColor Gray

try {
    $loginBody = @{
        email = "naoexiste@mangobeat.com"
        password = "Senha123!"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "`n   RESULTADO: Nao deveria ter sucesso!" -ForegroundColor Red
} catch {
    Write-Host "`n   RESULTADO: ERRO (esperado)" -ForegroundColor Green
    Write-Host "   Mensagem: $($_.Exception.Message)" -ForegroundColor White
}

# Teste 4: JSON invalido
Write-Host "`n4. Teste com JSON INVALIDO:" -ForegroundColor Yellow
Write-Host "   Enviando email sem senha" -ForegroundColor Gray

try {
    $loginBody = @{
        email = "demo@mangobeat.com"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    Write-Host "`n   RESULTADO: Nao deveria ter sucesso!" -ForegroundColor Red
} catch {
    Write-Host "`n   RESULTADO: ERRO (esperado)" -ForegroundColor Green
    Write-Host "   Mensagem: $($_.Exception.Message)" -ForegroundColor White
}

# Teste 5: Servidor rodando?
Write-Host "`n5. Verificando SERVIDOR:" -ForegroundColor Cyan

try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001" -ErrorAction Stop
    Write-Host "   Servidor nao tem rota raiz (404 esperado)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Message -like "*404*") {
        Write-Host "   Servidor RODANDO! (404 na raiz e normal)" -ForegroundColor Green
    } else {
        Write-Host "   Servidor NAO esta rodando!" -ForegroundColor Red
        Write-Host "   Rode: npm run start:dev" -ForegroundColor Yellow
    }
}

# Resumo
Write-Host "`n=== RESUMO ===" -ForegroundColor Cyan
Write-Host "Se o Teste 1 passou: Login funciona!" -ForegroundColor White
Write-Host "Se os Testes 2-4 deram erro: Validacao funciona!" -ForegroundColor White
Write-Host "Se o Teste 5 passou: Servidor esta OK!" -ForegroundColor White

Write-Host "`n=== USUARIOS DISPONIVEIS ===" -ForegroundColor Cyan
Write-Host "1. Email: demo@mangobeat.com | Senha: Demo123!" -ForegroundColor White
Write-Host "2. Email: test@mangobeat.com | Senha: Senha123!" -ForegroundColor White
Write-Host "3. Email: postman@mangobeat.com | Senha: Postman123!" -ForegroundColor White

Write-Host "`nSe teve erro 500, pode ser:" -ForegroundColor Yellow
Write-Host "- Senha errada" -ForegroundColor Gray
Write-Host "- Usuario nao existe" -ForegroundColor Gray
Write-Host "- Banco de dados offline (rode: docker-compose up -d)" -ForegroundColor Gray
Write-Host "- Servidor reiniciando" -ForegroundColor Gray
Write-Host ""
