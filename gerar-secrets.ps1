# ========================================
# GERAR SECRETS PARA PRODUCAO
# ========================================

Write-Host "`n=== GERANDO SECRETS FORTES PARA PRODUCAO ===" -ForegroundColor Cyan
Write-Host "Use estes valores nas variaveis de ambiente do Render`n" -ForegroundColor Yellow

# Gerar JWT_SECRET
Write-Host "JWT_SECRET:" -ForegroundColor Green
$jwtSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Write-Host $jwtSecret -ForegroundColor White
Write-Host ""

# Gerar JWT_REFRESH_SECRET
Write-Host "JWT_REFRESH_SECRET:" -ForegroundColor Green
$jwtRefreshSecret = node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
Write-Host $jwtRefreshSecret -ForegroundColor White
Write-Host ""

# Salvar em arquivo temporário
$secretsContent = @"
# ========================================
# SECRETS PARA RENDER.COM
# Gerados em: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ========================================

JWT_SECRET=$jwtSecret

JWT_REFRESH_SECRET=$jwtRefreshSecret

# ========================================
# COPIE E COLE NO RENDER:
# 1. Render Dashboard
# 2. Seu Web Service
# 3. Environment
# 4. Add Environment Variable
# ========================================
"@

$secretsContent | Out-File -FilePath "secrets-render.txt" -Encoding UTF8

Write-Host "Secrets salvos em: secrets-render.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== PROXIMOS PASSOS ===" -ForegroundColor Yellow
Write-Host "1. Abra: secrets-render.txt" -ForegroundColor White
Write-Host "2. Copie os valores" -ForegroundColor White
Write-Host "3. Cole no Render em Environment Variables" -ForegroundColor White
Write-Host "4. Adicione outras variaveis conforme PASSO-A-PASSO-DEPLOY.md" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: Nao commite secrets-render.txt no Git!" -ForegroundColor Red
Write-Host ""
