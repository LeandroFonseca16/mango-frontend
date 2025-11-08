# 🧪 Teste Completo do Sistema MangoBeat AI

## 1. Criar Usuário
$createUserResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{
        email = "teste@mangobeat.com"
        password = "Senha123!"
        name = "Usuário Teste"
    } | ConvertTo-Json)

Write-Host "`n✅ Usuário criado:" -ForegroundColor Green
$createUserResponse | ConvertTo-Json

## 2. Login e obter Token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{
        email = "teste@mangobeat.com"
        password = "Senha123!"
    } | ConvertTo-Json)

$token = $loginResponse.accessToken
Write-Host "`n🔑 Token obtido: $($token.Substring(0, 20))..." -ForegroundColor Cyan

## 3. Gerar Track com IA
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$generateTrackResponse = Invoke-RestMethod -Uri "http://localhost:3001/tracks/generate" `
    -Method POST `
    -Headers $headers `
    -Body (@{
        title = "Phonk Brasileiro 2025"
        description = "Beat pesado com grave de 808 e vocal estilo Memphis"
        genre = "phonk"
        tags = @("phonk", "brazilian", "trap", "808")
        audioPrompt = "Create a hard phonk beat with heavy 808 bass, Memphis-style vocals, and Brazilian funk influences. BPM: 140-160"
        imagePrompt = "Dark aesthetic album cover with Brazilian favela at night, purple and pink neon lights, phonk style"
    } | ConvertTo-Json)

Write-Host "`n🎵 Track em processamento:" -ForegroundColor Magenta
$generateTrackResponse | ConvertTo-Json

$trackId = $generateTrackResponse.trackId
$jobId = $generateTrackResponse.jobId

Write-Host "`nTrack ID: $trackId" -ForegroundColor Yellow
Write-Host "Job ID: $jobId" -ForegroundColor Yellow
Write-Host "Tempo estimado: $($generateTrackResponse.estimatedTime)" -ForegroundColor Yellow

## 4. Verificar Status do Job
Write-Host "`n⏳ Aguardando 5 segundos para o worker processar..." -ForegroundColor Gray
Start-Sleep -Seconds 5

$jobStatus = Invoke-RestMethod -Uri "http://localhost:3001/jobs/$jobId" `
    -Method GET `
    -Headers $headers

Write-Host "`n📊 Status do Job:" -ForegroundColor Blue
$jobStatus | ConvertTo-Json

## 5. Buscar Track Processada
Write-Host "`n⏳ Aguardando mais 10 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 10

$trackStatus = Invoke-RestMethod -Uri "http://localhost:3001/tracks/$trackId" `
    -Method GET `
    -Headers $headers

Write-Host "`n🎧 Track Final:" -ForegroundColor Green
$trackStatus | ConvertTo-Json

Write-Host "`n✅ Teste completo finalizado!" -ForegroundColor Green
