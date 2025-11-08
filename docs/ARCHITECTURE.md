# 🏗️ Arquitetura do Sistema - MangoBeat AI Backend

## 📋 Visão Geral da Arquitetura

O **MangoBeat AI Backend** implementa **Clean Architecture** (Arquitetura Limpa) seguindo os princípios **SOLID**, garantindo:

- ✅ **Independência de frameworks**
- ✅ **Testabilidade completa**
- ✅ **Flexibilidade de mudanças**
- ✅ **Baixo acoplamento**
- ✅ **Alta coesão**

---

## 🎯 Princípios Arquiteturais

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│             PRESENTATION                │  ← Controllers, DTOs, Guards
├─────────────────────────────────────────┤
│             APPLICATION                 │  ← Use Cases, Interfaces
├─────────────────────────────────────────┤
│               DOMAIN                    │  ← Entities, Business Rules
├─────────────────────────────────────────┤
│            INFRASTRUCTURE               │  ← Database, External APIs
└─────────────────────────────────────────┘
```

### Dependency Flow

```
Presentation → Application → Domain
     ↓              ↓         ↑
Infrastructure ←────────────────┘
```

**Regra de Dependência**: Camadas internas não conhecem camadas externas.

---

## 🏢 Estrutura Detalhada

### 1. Domain Layer (Camada de Domínio)

**Localização**: `src/domain/`  
**Responsabilidade**: Regras de negócio puras

#### Entities (Entidades)

```typescript
// src/domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    private password: string,
    public name?: string,
    public avatar?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  // Regras de negócio puras
  public validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  public updateProfile(name: string, avatar?: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }
    this.name = name;
    this.avatar = avatar;
    this.updatedAt = new Date();
  }
}
```

#### Repository Interfaces

```typescript
// src/domain/repositories/user.repository.interface.ts
export interface IUserRepository {
  create(user: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}
```

### 2. Application Layer (Camada de Aplicação)

**Localização**: `src/application/`  
**Responsabilidade**: Casos de uso e orquestração

#### Use Cases

```typescript
// src/application/usecases/create-user.usecase.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // 1. Validar regras de negócio
    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email e senha são obrigatórios');
    }

    // 2. Verificar se usuário já existe
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Usuário já existe');
    }

    // 3. Criar entidade
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new User(
      generateId(),
      dto.email,
      hashedPassword,
      dto.name
    );

    // 4. Validar entidade
    if (!user.validateEmail()) {
      throw new BadRequestException('Email inválido');
    }

    // 5. Persistir
    return this.userRepository.create(dto);
  }
}
```

#### Service Interfaces

```typescript
// src/application/interfaces/queue.service.interface.ts
export interface IQueueService {
  addJob<T>(queueName: string, data: T, options?: JobOptions): Promise<Job>;
  getJob(jobId: string): Promise<Job | null>;
  getQueueStats(queueName: string): Promise<QueueStats>;
}
```

### 3. Infrastructure Layer (Camada de Infraestrutura)

**Localização**: `src/infrastructure/`  
**Responsabilidade**: Implementações técnicas

#### Database Repositories

```typescript
// src/infrastructure/database/user.repository.ts
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    const userData = await this.prisma.user.create({
      data: {
        id: generateId(),
        email: dto.email,
        password: dto.password,
        name: dto.name,
      },
    });

    return this.mapToDomain(userData);
  }

  private mapToDomain(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name,
      prismaUser.avatar,
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }
}
```

#### External Services

```typescript
// src/infrastructure/external-services/tiktok.service.ts
@Injectable()
export class TikTokService implements ITikTokService {
  constructor(private httpService: HttpService) {}

  async getTrends(region?: string): Promise<TikTokTrend[]> {
    // Implementação real da API TikTok
    const response = await this.httpService.axiosRef.get(
      'https://api.tiktok.com/trends',
      { params: { region } }
    );
    
    return response.data.map(this.mapToTrend);
  }
}
```

### 4. Presentation Layer (Camada de Apresentação)

**Localização**: `src/presentation/`  
**Responsabilidade**: Interface HTTP/REST

#### Controllers

```typescript
// src/presentation/controllers/auth.controller.ts
@Controller('api/v1/auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private authenticateUserUseCase: AuthenticateUserUseCase
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return UserMapper.toResponseDto(user);
  }
}
```

#### DTOs (Data Transfer Objects)

```typescript
// src/presentation/dto/create-user.dto.ts
export class CreateUserDto {
  @ApiProperty({ example: 'user@mangobeat.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'João Silva', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
```

#### Guards

```typescript
// src/presentation/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

---

## 🔗 Dependency Injection

### Token-based DI

```typescript
// src/infrastructure/infrastructure.module.ts
@Module({
  providers: [
    {
      provide: 'UserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'QueueService',
      useClass: BullMQService,
    },
    {
      provide: 'TikTokService',
      useClass: TikTokService,
    },
  ],
  exports: ['UserRepository', 'QueueService', 'TikTokService'],
})
export class InfrastructureModule {}
```

### Interface Segregation

```typescript
// Interfaces específicas em vez de uma grande interface
export interface IUserReader {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface IUserWriter {
  create(user: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IUserRepository extends IUserReader, IUserWriter {}
```

---

## 🧪 Testabilidade

### Unit Tests (Testes Unitários)

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;

    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should create user successfully', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockUser);

    // Act
    const result = await useCase.execute(createUserDto);

    // Assert
    expect(result).toBeDefined();
    expect(mockUserRepository.create).toHaveBeenCalled();
  });
});
```

### Integration Tests (Testes de Integração)

```typescript
describe('UserRepository Integration', () => {
  let repository: UserRepository;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [UserRepository],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should save and retrieve user', async () => {
    // Test real database interaction
    const user = await repository.create(userData);
    const retrieved = await repository.findById(user.id);
    
    expect(retrieved).toEqual(user);
  });
});
```

---

## 📊 Fluxo de Dados

### Request Lifecycle

```
1. HTTP Request
   ↓
2. Controller
   ↓
3. DTO Validation
   ↓
4. Use Case
   ↓
5. Domain Logic
   ↓
6. Repository Interface
   ↓
7. Infrastructure Implementation
   ↓
8. External Service/Database
   ↓
9. Response Mapping
   ↓
10. HTTP Response
```

### Exemplo Completo: Criar Track

```typescript
// 1. Request chega no Controller
@Post()
async create(@Body() dto: CreateTrackDto, @Request() req) {

// 2. Controller chama Use Case
const track = await this.createTrackUseCase.execute({
  ...dto,
  userId: req.user.id
});

// 3. Use Case aplica regras de negócio
async execute(dto: CreateTrackWithUserDto): Promise<Track> {
  // Validações
  // Criação da entidade
  // Chamada do repositório
  // Adição de job assíncrono
}

// 4. Repository persiste no banco
async create(dto: CreateTrackDto): Promise<Track> {
  return this.prisma.track.create({ data: dto });
}

// 5. Queue Service adiciona job
async addJob(queueName: string, data: any): Promise<Job> {
  return this.audioQueue.add('generate', data);
}
```

---

## 🔄 Padrões Aplicados

### 1. Repository Pattern
- Abstrai acesso a dados
- Permite trocar implementação (Prisma ↔ TypeORM)
- Facilita testes com mocks

### 2. Dependency Inversion
- Depende de abstrações (interfaces)
- Inversão de controle via DI container
- Baixo acoplamento entre camadas

### 3. Single Responsibility
- Cada classe tem uma responsabilidade
- Use cases específicos
- Separação clara de concerns

### 4. Open/Closed Principle
- Extensível via interfaces
- Fechado para modificação
- Novos adapters sem alterar código existente

### 5. Interface Segregation
- Interfaces específicas e pequenas
- Clientes não dependem de métodos não utilizados
- Maior flexibilidade

---

## 🚀 Benefícios da Arquitetura

### ✅ Vantagens

1. **Testabilidade**: Testes unitários/integração fáceis
2. **Manutenibilidade**: Código organizado e limpo
3. **Flexibilidade**: Troca de tecnologias sem impacto
4. **Escalabilidade**: Adicionar funcionalidades é simples
5. **Independência**: Framework-agnostic
6. **Qualidade**: Código mais robusto e confiável

### 📈 Métricas de Qualidade

- **Cobertura de testes**: >90%
- **Complexidade ciclomática**: <10
- **Acoplamento**: Baixo (interfaces)
- **Coesão**: Alta (responsabilidade única)
- **Duplicação**: <5%

---

## 🔧 Ferramentas de Análise

### Code Quality

```bash
# Análise estática
npm run lint

# Cobertura de testes
npm run test:cov

# Análise de complexidade
npx madge --circular src/

# Verificar dependências
npm audit
```

### Architecture Testing

```typescript
// Testes de arquitetura com ArchUnit-like
describe('Architecture Rules', () => {
  it('Domain should not depend on Infrastructure', () => {
    const domainFiles = glob.sync('src/domain/**/*.ts');
    const infraImports = domainFiles.some(file => 
      fs.readFileSync(file, 'utf8').includes('infrastructure')
    );
    expect(infraImports).toBeFalsy();
  });
});
```

---

## 📚 Próximos Passos

### Possíveis Melhorias

1. **Event Sourcing**: Para auditoria completa
2. **CQRS**: Separar commands/queries
3. **Microservices**: Quando escalar
4. **GraphQL**: Para queries flexíveis
5. **Websockets**: Para real-time
6. **API Gateway**: Para múltiplos serviços

### Monitoramento

- **Logs estruturados** (Winston)
- **Métricas** (Prometheus)
- **Tracing** (Jaeger)
- **Health checks** (Terminus)

---

**Arquitetura é a base do sucesso! 🏗️**