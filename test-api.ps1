# Script PowerShell para testar o MangoBeat Backend
# Execute este script para testar o sistema

Write-Host "🚀 Testando MangoBeat AI Backend..." -ForegroundColor Green
Write-Host ""

# URL base
$baseUrl = "http://localhost:3001"

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null,
        [string]$Description
    )
    
    Write-Host "🔍 $Description" -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $url = "$baseUrl$Endpoint"
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $url -Method $Method -Headers $headers
        }
        
        Write-Host "✅ Sucesso!" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3)
        return $response
    }
    catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
        }
        return $null
    }
    
    Write-Host ""
}

# 1. Teste de health check
Write-Host "=" * 60 -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/" -Description "Health Check do Servidor"

# 2. Registro de usuário
Write-Host "=" * 60 -ForegroundColor Cyan
$newUser = @{
    email = "test@mangobeat.com"
    password = "password123"
    name = "Test User"
}

$registerResponse = Test-Endpoint -Method "POST" -Endpoint "/auth/register" -Body $newUser -Description "Registrando usuário de teste"

# 3. Login
Write-Host "=" * 60 -ForegroundColor Cyan
$loginData = @{
    email = "test@mangobeat.com"
    password = "password123"
}

$loginResponse = Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Body $loginData -Description "Fazendo login"

if ($loginResponse -and $loginResponse.access_token) {
    $token = $loginResponse.access_token
    Write-Host "🎫 Token obtido: $($token.Substring(0, [Math]::Min(30, $token.Length)))..." -ForegroundColor Green
    
    # 4. Gerar track
    Write-Host "=" * 60 -ForegroundColor Cyan
    $trackData = @{
        title = "Meu Beat Trap Teste"
        audioPrompt = "Heavy 808 bass with sharp hi-hats and dark atmospheric melody"
        imagePrompt = "Dark urban street art with neon purple colors"
        genre = "trap"
        bpm = 140
        duration = 60
        mood = "dark"
        tags = @("trap", "dark", "test")
    }
    
    $trackResponse = Test-Endpoint -Method "POST" -Endpoint "/tracks/generate" -Body $trackData -Token $token -Description "Gerando track com IA"
    
    if ($trackResponse -and $trackResponse.trackId) {
        $trackId = $trackResponse.trackId
        Write-Host "🎵 Track criada com ID: $trackId" -ForegroundColor Green
        
        # 5. Verificar status da track
        Write-Host "=" * 60 -ForegroundColor Cyan
        Start-Sleep -Seconds 2
        Test-Endpoint -Method "GET" -Endpoint "/tracks/$trackId" -Token $token -Description "Verificando status da track"
        
        # 6. Listar minhas tracks
        Write-Host "=" * 60 -ForegroundColor Cyan
        Test-Endpoint -Method "GET" -Endpoint "/tracks/my" -Token $token -Description "Listando minhas tracks"
    }
    
    # 7. Testar tendências
    Write-Host "=" * 60 -ForegroundColor Cyan
    Test-Endpoint -Method "GET" -Endpoint "/trends" -Token $token -Description "Buscando tendências"
}

Write-Host ""
Write-Host "🎉 Teste concluído!" -ForegroundColor Green
Write-Host "Verifique os resultados acima para ver se tudo funcionou corretamente." -ForegroundColor Yellow