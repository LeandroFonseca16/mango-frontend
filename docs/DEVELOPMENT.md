# 🚀 Guia de Desenvolvimento - MangoBeat AI Backend

## 🎯 Início Rápido

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** 14+ ([Download](https://postgresql.org/))
- **Redis** 6+ ([Download](https://redis.io/))
- **VS Code** (recomendado) ([Download](https://code.visualstudio.com/))

### Setup Inicial

```bash
# 1. Clone o repositório
git clone <repo-url>
cd mangobeat-ai-backend

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Setup do banco
npm run db:generate
npm run db:migrate

# 5. Inicie os serviços
npm run start:dev
```

---

## 🛠️ Ambiente de Desenvolvimento

### Extensões VS Code Recomendadas

Instale o pack de extensões criando `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-jest",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-json",
    "humao.rest-client"
  ]
}
```

### Configuração VS Code

`.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "jest.autoRun": "off",
  "prisma.showPrismaDataPlatformNotification": false
}
```

### Scripts de Desenvolvimento

```json
{
  "scripts": {
    // Desenvolvimento
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    
    // Build e produção
    "build": "nest build",
    "start:prod": "node dist/main",
    
    // Banco de dados
    "db:generate": "prisma generate --schema=prisma/schema.prisma",
    "db:migrate": "prisma migrate dev --schema=prisma/schema.prisma",
    "db:reset": "prisma migrate reset --force --schema=prisma/schema.prisma",
    "db:studio": "prisma studio --schema=prisma/schema.prisma",
    "db:seed": "ts-node prisma/seed.ts",
    
    // Testes
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    
    // Linting e formatação
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    
    // Utilidades
    "logs": "tail -f logs/combined.log",
    "check": "npm run lint && npm run test && npm run build"
  }
}
```

---

## 📁 Estrutura do Projeto

### Organização de Pastas

```
src/
├── domain/                 # 🏛️ Camada de Domínio
│   ├── entities/          # Entidades de negócio
│   │   ├── user.entity.ts
│   │   ├── track.entity.ts
│   │   ├── job.entity.ts
│   │   └── trend.entity.ts
│   └── repositories/      # Interfaces dos repositórios
│       ├── user.repository.interface.ts
│       ├── track.repository.interface.ts
│       ├── job.repository.interface.ts
│       └── trend.repository.interface.ts
│
├── application/           # 🎯 Camada de Aplicação
│   ├── usecases/         # Casos de uso
│   │   ├── auth/
│   │   ├── tracks/
│   │   ├── jobs/
│   │   └── trends/
│   └── interfaces/       # Interfaces de serviços
│       ├── queue.service.interface.ts
│       └── tiktok.service.interface.ts
│
├── infrastructure/       # 🔧 Camada de Infraestrutura
│   ├── database/        # Implementações Prisma
│   │   ├── prisma/
│   │   └── repositories/
│   ├── queues/         # Implementação BullMQ
│   │   └── bullmq.service.ts
│   └── external-services/ # APIs externas
│       └── tiktok.service.ts
│
├── presentation/        # 🌐 Camada de Apresentação
│   ├── controllers/    # Controllers REST
│   │   ├── auth.controller.ts
│   │   ├── tracks.controller.ts
│   │   ├── trends.controller.ts
│   │   └── jobs.controller.ts
│   ├── dto/           # Data Transfer Objects
│   │   ├── auth/
│   │   ├── tracks/
│   │   ├── trends/
│   │   └── jobs/
│   └── guards/        # Guards de autenticação
│       └── jwt-auth.guard.ts
│
├── modules/           # 📦 Módulos NestJS
│   ├── auth/         # Módulo de autenticação
│   ├── tracks/       # Módulo de tracks
│   ├── trends/       # Módulo de tendências
│   ├── jobs/         # Módulo de jobs
│   └── app.module.ts # Módulo principal
│
├── common/           # 🛠️ Utilitários compartilhados
│   ├── decorators/  # Decoradores customizados
│   ├── filters/     # Exception filters
│   ├── interceptors/ # Interceptors
│   └── utils/       # Funções utilitárias
│
└── main.ts          # 🚀 Ponto de entrada
```

---

## 🏗️ Padrões de Desenvolvimento

### 1. Convenções de Nomenclatura

#### Arquivos e Classes

```typescript
// ✅ Correto
user.entity.ts              → UserEntity
create-user.dto.ts          → CreateUserDto
user.repository.ts          → UserRepository
create-user.usecase.ts      → CreateUserUseCase
auth.controller.ts          → AuthController
jwt-auth.guard.ts           → JwtAuthGuard

// ❌ Incorreto
User.ts                     → User (sem sufixo)
createUser.ts               → createUser (camelCase em arquivo)
userRepo.ts                 → UserRepo (abreviação)
```

#### Variáveis e Métodos

```typescript
// ✅ Correto - camelCase
const userRepository = new UserRepository();
const createUser = async (dto: CreateUserDto) => {};
const isValidEmail = (email: string) => boolean;

// ❌ Incorreto
const UserRepository = new UserRepository();  // PascalCase
const create_user = async () => {};           // snake_case
```

#### Constantes e Enums

```typescript
// ✅ Correto - UPPER_SNAKE_CASE para constantes
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_QUEUE_PRIORITY = 1;
const JWT_EXPIRATION_TIME = '15m';

// ✅ Correto - PascalCase para enums
enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
```

### 2. Estrutura de Arquivos

#### Template para Entidade

```typescript
// src/domain/entities/exemplo.entity.ts

/**
 * Entidade Exemplo - representa [descrição da entidade]
 * 
 * @author MangoBeat AI Team
 * @since 1.0.0
 */
export class ExemploEntity {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Valida se a entidade está em um estado válido
   * @returns true se válida, false caso contrário
   */
  public isValid(): boolean {
    return !!this.id && this.id.length > 0;
  }

  /**
   * Atualiza dados da entidade
   * @param data Dados para atualização
   */
  public update(data: Partial<ExemploEntity>): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
```

#### Template para Use Case

```typescript
// src/application/usecases/exemplo/criar-exemplo.usecase.ts

import { Injectable, Inject } from '@nestjs/common';

/**
 * Caso de uso para criar um novo exemplo
 * 
 * @author MangoBeat AI Team
 * @since 1.0.0
 */
@Injectable()
export class CriarExemploUseCase {
  constructor(
    @Inject('ExemploRepository')
    private readonly exemploRepository: IExemploRepository
  ) {}

  /**
   * Executa o caso de uso
   * @param dto Dados para criação
   * @returns Exemplo criado
   */
  async execute(dto: CreateExemploDto): Promise<ExemploEntity> {
    // 1. Validações de negócio
    this.validateInput(dto);

    // 2. Verificar regras de domínio
    await this.checkBusinessRules(dto);

    // 3. Criar entidade
    const exemplo = new ExemploEntity(
      generateId(),
      dto.nome,
      dto.descricao
    );

    // 4. Persistir
    return this.exemploRepository.create(exemplo);
  }

  private validateInput(dto: CreateExemploDto): void {
    if (!dto.nome || dto.nome.trim().length === 0) {
      throw new BadRequestException('Nome é obrigatório');
    }
  }

  private async checkBusinessRules(dto: CreateExemploDto): Promise<void> {
    // Implementar regras específicas
  }
}
```

#### Template para Controller

```typescript
// src/presentation/controllers/exemplo.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

/**
 * Controller para gerenciamento de exemplos
 * 
 * @author MangoBeat AI Team
 * @since 1.0.0
 */
@Controller('api/v1/exemplos')
@ApiTags('Exemplos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExemploController {
  constructor(
    private readonly criarExemploUseCase: CriarExemploUseCase,
    private readonly buscarExemploUseCase: BuscarExemploUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo exemplo' })
  async criar(
    @Body() dto: CreateExemploDto,
    @Request() req: any
  ): Promise<ExemploResponseDto> {
    const exemplo = await this.criarExemploUseCase.execute({
      ...dto,
      userId: req.user.id
    });
    
    return ExemploMapper.toResponseDto(exemplo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar exemplo por ID' })
  async buscarPorId(@Param('id') id: string): Promise<ExemploResponseDto> {
    const exemplo = await this.buscarExemploUseCase.execute(id);
    return ExemploMapper.toResponseDto(exemplo);
  }
}
```

### 3. Padrões de Commit

#### Conventional Commits

```bash
# Formato: <tipo>(<escopo>): <descrição>

# Tipos permitidos:
feat     # Nova funcionalidade
fix      # Correção de bug  
docs     # Documentação
style    # Formatação (sem mudança de lógica)
refactor # Refatoração de código
test     # Adição/modificação de testes
chore    # Tarefas de manutenção

# Exemplos:
git commit -m "feat(auth): adicionar autenticação JWT"
git commit -m "fix(tracks): corrigir validação de upload"
git commit -m "docs(api): atualizar documentação da API"
git commit -m "refactor(entities): melhorar estrutura das entidades"
git commit -m "test(usecases): adicionar testes para CreateUserUseCase"
```

### 4. Padrões de Testes

#### Estrutura de Testes Unitários

```typescript
// test/unit/usecases/create-user.usecase.spec.ts

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    // Arrange - Setup dos mocks
    mockUserRepository = createMockUserRepository();
    useCase = new CreateUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('deve criar usuário com dados válidos', async () => {
      // Arrange
      const dto = createValidUserDto();
      const expectedUser = createMockUser();
      
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          name: dto.name
        })
      );
    });

    it('deve lançar erro quando email já existe', async () => {
      // Arrange
      const dto = createValidUserDto();
      const existingUser = createMockUser();
      
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando dados inválidos', async () => {
      // Arrange
      const dto = createInvalidUserDto();

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });
  });
});

// Helpers para testes
function createMockUserRepository(): jest.Mocked<IUserRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function createValidUserDto(): CreateUserDto {
  return {
    email: 'test@mangobeat.com',
    password: 'password123',
    name: 'Test User'
  };
}
```

---

## 🔧 Ferramentas de Desenvolvimento

### 1. Debugging

#### VS Code Launch Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug NestJS",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@nestjs/cli/bin/nest.js",
      "args": ["start", "--debug", "--watch"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

#### Debug Commands

```bash
# Iniciar com debug
npm run start:debug

# Debug testes
npm run test:debug

# Logs detalhados
export DEBUG="*"
npm run start:dev
```

### 2. Linting e Formatação

#### ESLint Configuration

`.eslintrc.js`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    '@nestjs',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

#### Prettier Configuration

`.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 80,
  "endOfLine": "lf"
}
```

### 3. Git Hooks

#### Husky Configuration

```bash
# Instalar husky
npm install --save-dev husky lint-staged

# Configurar hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg 'npx commitlint --edit "$1"'
```

`package.json`:

```json
{
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
```

---

## 📊 Monitoramento e Logs

### 1. Estrutura de Logs

```typescript
// src/common/logger/logger.service.ts

import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log' 
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }
}
```

### 2. Health Checks

```typescript
// src/modules/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { 
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator 
} from '@nestjs/terminus';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memoryHealth: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database'),
      () => this.memoryHealth.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memoryHealth.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }
}
```

---

## 🚀 Deploy e CI/CD

### GitHub Actions

`.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Generate Prisma client
      run: npm run db:generate

    - name: Run migrations
      run: npm run db:migrate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

    - name: Run tests
      run: npm run test:cov
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_HOST: localhost

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_HOST: localhost

    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to production
      # Add deployment steps here
      run: echo "Deploy to production"
```

---

## 📋 Checklist de Desenvolvimento

### ✅ Antes de Commit

- [ ] Código passa no linting (`npm run lint`)
- [ ] Todos os testes passam (`npm test`)
- [ ] Cobertura de testes adequada (>80%)
- [ ] Documentação atualizada
- [ ] Variáveis sensíveis não commitadas
- [ ] Commits seguem conventional commits

### ✅ Antes de PR

- [ ] Branch atualizada com main/develop
- [ ] Testes E2E passando
- [ ] Performance testada
- [ ] Logs apropriados adicionados
- [ ] Documentação da API atualizada
- [ ] Validações de segurança feitas

### ✅ Antes de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Migrações de banco testadas
- [ ] Rollback plan definido
- [ ] Monitoramento configurado
- [ ] Health checks funcionando
- [ ] Backup realizado

---

**Happy Coding! 🥭🎵**

*MangoBeat AI Development Team*