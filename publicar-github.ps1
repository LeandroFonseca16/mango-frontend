# 🚀 Script para Publicar no GitHub

Write-Host "🥭 MangoBeat AI Backend - Publicação no GitHub" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git detectado: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado! Instale em: https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Verificar status do repositório
Write-Host "📊 Status do Repositório:" -ForegroundColor Yellow
git status --short

Write-Host "`n📝 Últimos commits:" -ForegroundColor Yellow
git log --oneline -3

Write-Host "`n"
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "==================`n" -ForegroundColor Cyan

Write-Host "1️⃣  Crie um repositório no GitHub:" -ForegroundColor White
Write-Host "   👉 https://github.com/new" -ForegroundColor Gray
Write-Host "   - Name: mangobeat-ai-backend" -ForegroundColor Gray
Write-Host "   - Description: AI Music Generation Backend with TikTok Trends" -ForegroundColor Gray
Write-Host "   - ✅ Public ou Private (sua escolha)" -ForegroundColor Gray
Write-Host "   - ❌ NÃO adicione README, .gitignore ou License (já temos)`n" -ForegroundColor Gray

Write-Host "2️⃣  Configure o remote e faça push:" -ForegroundColor White
Write-Host "   Substitua SEU-USUARIO pelo seu username do GitHub:`n" -ForegroundColor Gray

$username = Read-Host "Digite seu username do GitHub"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "`n❌ Username não pode ser vazio!" -ForegroundColor Red
    exit 1
}

$repoUrl = "https://github.com/$username/mangobeat-ai-backend.git"

Write-Host "`n🔗 URL do repositório: $repoUrl" -ForegroundColor Cyan

Write-Host "`n3️⃣  Executar comandos de publicação?" -ForegroundColor White
$confirm = Read-Host "Deseja continuar? (s/n)"

if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "`n⏸️  Publicação cancelada." -ForegroundColor Yellow
    Write-Host "Execute manualmente quando estiver pronto:" -ForegroundColor Gray
    Write-Host "  git remote add origin $repoUrl" -ForegroundColor Gray
    Write-Host "  git branch -M main" -ForegroundColor Gray
    Write-Host "  git push -u origin main`n" -ForegroundColor Gray
    exit 0
}

Write-Host "`n🚀 Publicando no GitHub..." -ForegroundColor Green

try {
    # Verificar se já existe remote
    $existingRemote = git remote get-url origin 2>$null
    
    if ($existingRemote) {
        Write-Host "⚠️  Remote 'origin' já existe: $existingRemote" -ForegroundColor Yellow
        $replaceRemote = Read-Host "Deseja substituir? (s/n)"
        
        if ($replaceRemote -eq "s" -or $replaceRemote -eq "S") {
            Write-Host "🔄 Removendo remote antigo..." -ForegroundColor Yellow
            git remote remove origin
            
            Write-Host "➕ Adicionando novo remote..." -ForegroundColor Yellow
            git remote add origin $repoUrl
        } else {
            Write-Host "`n⏸️  Mantendo remote existente." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "➕ Adicionando remote origin..." -ForegroundColor Yellow
        git remote add origin $repoUrl
    }
    
    Write-Host "🌿 Renomeando branch para main..." -ForegroundColor Yellow
    git branch -M main
    
    Write-Host "📤 Fazendo push para GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host "`n✅ SUCESSO! Repositório publicado com sucesso! 🎉" -ForegroundColor Green
    Write-Host "`n🔗 Acesse em: https://github.com/$username/mangobeat-ai-backend" -ForegroundColor Cyan
    
    Write-Host "`n📋 PRÓXIMO PASSO: Deploy no Render.com" -ForegroundColor Magenta
    Write-Host "Leia o arquivo README-DEPLOY.md para continuar.`n" -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ ERRO ao publicar!" -ForegroundColor Red
    Write-Host "Detalhes: $_" -ForegroundColor Red
    Write-Host "`n💡 Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique se o repositório foi criado no GitHub" -ForegroundColor Gray
    Write-Host "2. Verifique suas credenciais do GitHub" -ForegroundColor Gray
    Write-Host "3. Execute manualmente:" -ForegroundColor Gray
    Write-Host "   git remote add origin $repoUrl" -ForegroundColor Gray
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main`n" -ForegroundColor Gray
    exit 1
}
