# 🥭 MangoBeat AI Backend

Backend da aplicação **MangoBeat AI** - Plataforma de geração de música com IA e análise de tendências do TikTok.

## 🚀 Tecnologias

- **NestJS** - Framework Node.js
- **Prisma** - ORM para PostgreSQL
- **BullMQ** - Sistema de filas com Redis
- **JWT** - Autenticação
- **TypeScript** - Linguagem principal
- **Jest** - Testes unitários

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** e **SOLID**:

```
src/
├── domain/           # Entidades e regras de negócio
├── application/      # Use cases e interfaces
├── infrastructure/   # Implementações (DB, APIs externas)
├── presentation/     # Controllers, DTOs, Guards
└── modules/          # Módulos NestJS
```

## 📦 Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd mangobeat-ai-backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Configure o banco de dados
npm run db:generate
npm run db:migrate

# Inicie o servidor
npm run start:dev
```

## 🗃️ Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Reset do banco (cuidado!)
npm run db:reset

# Abrir Prisma Studio
npm run db:studio
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

## 📡 API Endpoints

### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Renovar token

### Tracks/Músicas
- `GET /api/v1/tracks` - Listar tracks públicas
- `POST /api/v1/tracks` - Criar nova track
- `GET /api/v1/tracks/my` - Minhas tracks
- `PUT /api/v1/tracks/:id` - Atualizar track
- `DELETE /api/v1/tracks/:id` - Deletar track

### Tendências TikTok
- `GET /api/v1/trends/popular` - Tendências populares
- `GET /api/v1/trends/trending` - Tendências em alta
- `GET /api/v1/trends/category/:category` - Por categoria
- `POST /api/v1/trends/analyze` - Iniciar análise

### Jobs/Processamento
- `GET /api/v1/jobs` - Listar jobs
- `GET /api/v1/jobs/:id` - Detalhes do job
- `POST /api/v1/jobs/:id/retry` - Tentar novamente

## 🔧 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/mangobeat"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# APIs Externas
OPENAI_API_KEY="your-openai-key"
TIKTOK_API_KEY="your-tiktok-key"

# Servidor
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## 🏃‍♂️ Scripts Disponíveis

- `npm run build` - Build para produção
- `npm run start` - Inicia em produção
- `npm run start:dev` - Desenvolvimento com hot reload
- `npm run start:debug` - Debug mode
- `npm run lint` - Lint do código
- `npm run test` - Executar testes

## 🌐 Deploy

```bash
# Build
npm run build

# Executar migrações em produção
npm run db:deploy

# Iniciar
npm run start:prod
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com 🥭 pelo time MangoBeat AI