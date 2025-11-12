# ==================================================
# MangoBeat AI - Next.js Setup Script (Windows)
# ==================================================

Write-Host "🎵 MangoBeat AI - Next.js Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "📦 Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = (node -v).Substring(1).Split('.')[0]
if ([int]$nodeVersion -lt 20) {
    Write-Host "❌ Error: Node.js 20+ is required" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $(node -v) detected" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup environment
if (-not (Test-Path .env)) {
    Write-Host "⚙️  Setting up environment..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    
    # Generate NEXTAUTH_SECRET
    $bytes = New-Object Byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $NEXTAUTH_SECRET = [Convert]::ToBase64String($bytes)
    
    (Get-Content .env) -replace 'your-super-secret-key-change-this-in-production', $NEXTAUTH_SECRET | Set-Content .env
    
    Write-Host "⚠️  Please edit .env and add your API keys:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL"
    Write-Host "   - OPENAI_API_KEY"
    Write-Host "   - STRIPE_SECRET_KEY (optional)"
    Write-Host ""
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Prisma setup
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
npx prisma generate
Write-Host "✓ Prisma client generated" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Running database migrations..." -ForegroundColor Yellow
try {
    npx prisma migrate deploy
    Write-Host "✓ Migrations applied" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No database connection. Run migrations manually:" -ForegroundColor Yellow
    Write-Host "   npx prisma migrate deploy"
}
Write-Host ""

# Build application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build
Write-Host "✓ Application built" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "================================" -ForegroundColor Green
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit .env with your API keys"
Write-Host "  2. Run: npm run dev"
Write-Host "  3. Open: http://localhost:3000"
Write-Host ""
Write-Host "For Docker deployment:"
Write-Host "  docker-compose up -d"
Write-Host ""
Write-Host "For production deployment:"
Write-Host "  vercel deploy"
Write-Host ""
Write-Host "📚 Documentation: ./README.md"
Write-Host "🔄 Migration Guide: ./MIGRATION-GUIDE.md"
Write-Host ""
