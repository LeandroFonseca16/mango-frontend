#!/bin/bash

# ==================================================
# MangoBeat AI - Next.js Setup Script
# ==================================================

set -e  # Exit on error

echo "🎵 MangoBeat AI - Next.js Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Error: Node.js 20+ is required${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Setup environment
if [ ! -f .env ]; then
    echo "⚙️  Setting up environment..."
    cp .env.example .env
    
    # Generate NEXTAUTH_SECRET
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    sed -i "s/your-super-secret-key-change-this-in-production/$NEXTAUTH_SECRET/" .env
    
    echo -e "${YELLOW}⚠️  Please edit .env and add your API keys:${NC}"
    echo "   - DATABASE_URL"
    echo "   - OPENAI_API_KEY"
    echo "   - STRIPE_SECRET_KEY (optional)"
    echo ""
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
    echo ""
fi

# Prisma setup
echo "🗄️  Setting up database..."
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

echo "📊 Running database migrations..."
npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  No database connection. Run migrations manually:${NC}"
    echo "   npx prisma migrate deploy"
}
echo ""

# Build application
echo "🔨 Building application..."
npm run build
echo -e "${GREEN}✓ Application built${NC}"
echo ""

# Success message
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✨ Setup complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your API keys"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "For Docker deployment:"
echo "  docker-compose up -d"
echo ""
echo "For production deployment:"
echo "  vercel deploy"
echo ""
echo "📚 Documentation: ./README.md"
echo "🔄 Migration Guide: ./MIGRATION-GUIDE.md"
echo ""
