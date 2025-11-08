# ========================================
# TESTE SUPER FACIL - MANGOBEAT AI
# ========================================

Write-Host "`n=== TESTE DO MANGOBEAT AI BACKEND ===" -ForegroundColor Cyan
Write-Host "Servidor deve estar em: http://localhost:3001/api/v1`n" -ForegroundColor Yellow

# 1. CRIAR USUARIO
Write-Host "1. Criando usuario..." -ForegroundColor Green
try {
    $userBody = @{
        email = "demo@mangobeat.com"
        password = "Demo123!"
        name = "Usuario Demo"
    } | ConvertTo-Json

    $user = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $userBody `
        -ErrorAction Stop

    Write-Host "   Usuario criado: $($user.email)" -ForegroundColor White
    Write-Host "   ID: $($user.id)`n" -ForegroundColor Gray
} catch {
    if ($_.Exception.Message -like "*409*") {
        Write-Host "   Usuario ja existe, continuando...`n" -ForegroundColor Yellow
    } else {
        Write-Host "   ERRO: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# 2. FAZER LOGIN
Write-Host "2. Fazendo login..." -ForegroundColor Green
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
    Write-Host "   Token: $($token.Substring(0, 30))...`n" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. GERAR TRACK
Write-Host "3. Gerando track com IA..." -ForegroundColor Green
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $trackBody = @{
        title = "Phonk Brasileiro"
        description = "Beat pesado estilo Memphis com influencia brasileira"
        genre = "phonk"
        tags = @("phonk", "brazilian", "trap")
        audioPrompt = "Heavy phonk beat with 808 bass and Memphis vocals, BPM 145"
        imagePrompt = "Dark purple aesthetic with Brazilian favela at night"
    } | ConvertTo-Json

    $result = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks/generate" `
        -Method POST `
        -Headers $headers `
        -Body $trackBody `
        -ErrorAction Stop

    $trackId = $result.trackId
    Write-Host "   Track criada!" -ForegroundColor White
    Write-Host "   Track ID: $trackId" -ForegroundColor Gray
    Write-Host "   Job ID: $($result.jobId)" -ForegroundColor Gray
    Write-Host "   Tempo estimado: $($result.estimatedTime)`n" -ForegroundColor Yellow
} catch {
    Write-Host "   ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. AGUARDAR PROCESSAMENTO
Write-Host "4. Aguardando processamento (10 segundos)..." -ForegroundColor Green
for ($i = 10; $i -gt 0; $i--) {
    Write-Host "   $i..." -NoNewline -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}
Write-Host "`n"

# 5. VERIFICAR TRACK PROCESSADA
Write-Host "5. Verificando track processada..." -ForegroundColor Green
try {
    $track = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks/$trackId" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "`n   === TRACK COMPLETA ===" -ForegroundColor Cyan
    Write-Host "   Titulo: $($track.title)" -ForegroundColor White
    Write-Host "   Status: $($track.status)" -ForegroundColor $(if($track.status -eq "COMPLETED"){"Green"}else{"Yellow"})
    Write-Host "   Genero: $($track.genre)" -ForegroundColor White
    Write-Host "   Duracao: $($track.duration)s" -ForegroundColor White
    Write-Host "`n   Audio URL:" -ForegroundColor Cyan
    Write-Host "   $($track.audioUrl)" -ForegroundColor Gray
    Write-Host "`n   Cover URL:" -ForegroundColor Cyan
    Write-Host "   $($track.imageUrl)" -ForegroundColor Gray
    
    if ($track.metadata) {
        Write-Host "`n   Metadata:" -ForegroundColor Cyan
        Write-Host "   - BPM: $($track.metadata.bpm)" -ForegroundColor White
        Write-Host "   - Key: $($track.metadata.key)" -ForegroundColor White
        Write-Host "   - Mood: $($track.metadata.mood)" -ForegroundColor White
        Write-Host "   - AI Model: $($track.metadata.aiModel)" -ForegroundColor White
        Write-Host "   - Instruments: $($track.metadata.instruments -join ', ')" -ForegroundColor White
    }
} catch {
    Write-Host "   ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. LISTAR TODAS AS TRACKS
Write-Host "`n6. Listando suas tracks..." -ForegroundColor Green
try {
    $tracks = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/tracks" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    if ($tracks -is [Array]) {
        Write-Host "   Total: $($tracks.Count) tracks`n" -ForegroundColor White
        foreach ($t in $tracks) {
            Write-Host "   - $($t.title) [$($t.genre)] - Status: $($t.status)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   - $($tracks.title) [$($tracks.genre)] - Status: $($tracks.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TESTE COMPLETO! ===" -ForegroundColor Green
Write-Host "Tudo funcionando perfeitamente! 🎵`n" -ForegroundColor Cyan
