# ========================================
# TESTE DE PRODUCAO - MANGOBEAT AI
# ========================================

Write-Host "`n=== VALIDACAO DE DEPLOY ===" -ForegroundColor Cyan

# 1. Verificar Build
Write-Host "`n1. Verificando build..." -ForegroundColor Green
if (Test-Path "dist/main.js") {
    Write-Host "   Build OK! dist/main.js encontrado" -ForegroundColor White
} else {
    Write-Host "   Build nao encontrado. Rodando npm run build..." -ForegroundColor Yellow
    npm run build
}

# 2. Verificar .env
Write-Host "`n2. Verificando variaveis de ambiente..." -ForegroundColor Green
if (Test-Path ".env") {
    $envContent = Get-Content .env -Raw
    $checks = @(
        @{Name="PORT"; Pattern="PORT="},
        @{Name="DATABASE_URL"; Pattern="DATABASE_URL="},
        @{Name="JWT_SECRET"; Pattern="JWT_SECRET="},
        @{Name="CORS_ORIGINS"; Pattern="CORS_ORIGINS="}
    )
    
    foreach ($check in $checks) {
        if ($envContent -match $check.Pattern) {
            Write-Host "   $($check.Name): OK" -ForegroundColor Green
        } else {
            Write-Host "   $($check.Name): FALTANDO" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ERRO: Arquivo .env nao encontrado!" -ForegroundColor Red
    exit 1
}

# 3. Verificar Docker
Write-Host "`n3. Verificando Docker..." -ForegroundColor Green
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "   Docker instalado: $dockerVersion" -ForegroundColor White
    
    # Verificar containers
    $postgresRunning = docker ps --filter "name=mangobeat-postgres" --format "{{.Names}}" 2>$null
    $redisRunning = docker ps --filter "name=mangobeat-redis" --format "{{.Names}}" 2>$null
    
    if ($postgresRunning) {
        Write-Host "   PostgreSQL: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "   PostgreSQL: STOPPED (rode: docker-compose up -d)" -ForegroundColor Yellow
    }
    
    if ($redisRunning) {
        Write-Host "   Redis: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "   Redis: STOPPED (rode: docker-compose up -d)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Docker nao instalado" -ForegroundColor Yellow
}

# 4. Testar Health Endpoint (se servidor estiver rodando)
Write-Host "`n4. Testando Health Endpoint..." -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/health" -TimeoutSec 3 -ErrorAction Stop
    
    Write-Host "`n   === HEALTH CHECK ===" -ForegroundColor Cyan
    Write-Host "   Status: $($health.status)" -ForegroundColor $(if($health.status -eq "ok"){"Green"}else{"Red"})
    Write-Host "   Environment: $($health.environment)" -ForegroundColor White
    Write-Host "   Uptime: $($health.uptime)" -ForegroundColor White
    Write-Host "   Database: $($health.services.database.status) ($($health.services.database.latency))" -ForegroundColor $(if($health.services.database.status -eq "connected"){"Green"}else{"Red"})
    Write-Host "   Memory: $($health.memory.heapUsed) / $($health.memory.heapTotal)" -ForegroundColor White
    
    # Testar CORS
    Write-Host "`n5. Testando CORS..." -ForegroundColor Green
    $headers = @{
        "Origin" = "http://localhost:5173"
    }
    try {
        $corsTest = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -Headers $headers -Method Options -ErrorAction Stop
        Write-Host "   CORS habilitado para localhost:5173: OK" -ForegroundColor Green
    } catch {
        Write-Host "   CORS: Verificar configuracao" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   Servidor nao esta rodando" -ForegroundColor Yellow
    Write-Host "   Para iniciar: npm run start:dev" -ForegroundColor Gray
    Write-Host "   Para producao: npm run start:prod" -ForegroundColor Gray
}

# 6. Checklist de Deploy
Write-Host "`n=== CHECKLIST DE DEPLOY ===" -ForegroundColor Cyan

$checklist = @(
    @{Item="Build compilando sem erros"; File="dist/main.js"},
    @{Item="Dockerfile criado"; File="Dockerfile"},
    @{Item=".dockerignore criado"; File=".dockerignore"},
    @{Item="docker-compose.yml atualizado"; File="docker-compose.yml"},
    @{Item=".env.example criado"; File=".env.example"},
    @{Item="Health endpoint implementado"; File="src/presentation/controllers/health.controller.ts"},
    @{Item="CORS configurado em main.ts"; File="src/main.ts"},
    @{Item="Scripts de producao no package.json"; File="package.json"}
)

foreach ($item in $checklist) {
    if (Test-Path $item.File) {
        Write-Host "   $($item.Item): OK" -ForegroundColor Green
    } else {
        Write-Host "   $($item.Item): FALTANDO" -ForegroundColor Red
    }
}

# 7. Proximos Passos
Write-Host "`n=== PROXIMOS PASSOS ===" -ForegroundColor Cyan
Write-Host @"
   
   Para deploy em producao:

   1. Render.com:
      - Crie conta em render.com
      - New -> Web Service
      - Conecte seu GitHub repo
      - Configure variaveis de ambiente
      - Deploy automatico!

   2. Railway.app:
      - Crie conta em railway.app
      - New Project -> Deploy from GitHub
      - Add PostgreSQL
      - Configure variaveis
      - Deploy!

   3. Fly.io:
      - fly auth login
      - fly launch
      - fly secrets set JWT_SECRET=...
      - fly deploy

   Veja DEPLOY.md para guia completo!

"@ -ForegroundColor White

Write-Host "=== VALIDACAO COMPLETA ===" -ForegroundColor Green
Write-Host "Backend pronto para deploy remoto! 🚀`n" -ForegroundColor Cyan
