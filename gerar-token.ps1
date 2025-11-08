# ========================================
# TESTE COM TOKEN - MANGOBEAT AI
# ========================================

Write-Host "`n=== GERANDO NOVO TOKEN ===" -ForegroundColor Cyan

# 1. LOGIN
Write-Host "`n1. Fazendo login..." -ForegroundColor Green
try {
    $loginBody = @{
        email = "demo@mangobeat.com"
        password = "Demo123!"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    $token = $login.accessToken
    Write-Host "   Login OK!" -ForegroundColor White
    Write-Host "`n   Seu Token JWT:" -ForegroundColor Yellow
    Write-Host "   $token`n" -ForegroundColor Gray
    
    # Salvar token em arquivo
    $token | Out-File -FilePath "token.txt" -Encoding UTF8
    Write-Host "   Token salvo em: token.txt" -ForegroundColor Green
    
} catch {
    Write-Host "   ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n   Usuario nao existe? Rode primeiro:" -ForegroundColor Yellow
    Write-Host "   .\teste-facil.ps1" -ForegroundColor White
    exit 1
}

# 2. TESTAR TOKEN
Write-Host "`n2. Testando token nas rotas protegidas..." -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
}

# Testar GET /tracks
Write-Host "`n   a) GET /tracks" -ForegroundColor Cyan
try {
    $tracks = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($tracks -is [Array]) {
        Write-Host "      OK! $($tracks.Count) tracks encontradas" -ForegroundColor Green
    } else {
        Write-Host "      OK! 1 track encontrada" -ForegroundColor Green
    }
} catch {
    Write-Host "      ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

# Testar POST /tracks/generate
Write-Host "`n   b) POST /tracks/generate" -ForegroundColor Cyan
try {
    $headers["Content-Type"] = "application/json"
    
    $trackBody = @{
        title = "Track de Teste Token"
        description = "Testando autenticacao JWT"
        genre = "phonk"
        tags = @("test", "jwt")
        audioPrompt = "Test beat"
        imagePrompt = "Test cover"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks/generate" `
        -Method POST `
        -Headers $headers `
        -Body $trackBody `
        -ErrorAction Stop

    Write-Host "      OK! Track ID: $($result.trackId)" -ForegroundColor Green
} catch {
    Write-Host "      ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== EXEMPLOS DE USO ===" -ForegroundColor Cyan

Write-Host "`nPowerShell:" -ForegroundColor Yellow
Write-Host @"
`$token = Get-Content token.txt
`$headers = @{"Authorization" = "Bearer `$token"}
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks" -Headers `$headers
"@ -ForegroundColor White

Write-Host "`nPostman:" -ForegroundColor Yellow
Write-Host @"
1. Copie o token acima
2. Na aba Authorization, escolha: Bearer Token
3. Cole o token no campo
4. Pronto!
"@ -ForegroundColor White

Write-Host "`ncURL:" -ForegroundColor Yellow
Write-Host @"
curl http://localhost:3001/api/v1/tracks \
  -H "Authorization: Bearer $($token.Substring(0, 30))..."
"@ -ForegroundColor White

Write-Host ""
