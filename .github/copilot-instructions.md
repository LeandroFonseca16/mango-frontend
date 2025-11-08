# MangoBeat AI Backend - Copilot Instructions

## Architecture Overview

This is a **Clean Architecture** NestJS backend for AI music generation and TikTok trend analysis. The codebase follows strict layer separation:

```
src/
├── domain/           # Pure business entities and repository interfaces
├── application/      # Use cases and service interfaces  
├── infrastructure/   # Database, external APIs, queues implementation
├── presentation/     # Controllers, DTOs, guards
└── modules/          # NestJS dependency injection wiring
```

## Key Patterns & Conventions

### Dependency Injection with Symbols
- All dependencies use **Symbol tokens** defined in `src/infrastructure/di-tokens.ts`
- Repository interfaces are bound to concrete implementations in module files
- Example: `TRACK_REPOSITORY` symbol maps to `TrackRepository` class

### Use Case Pattern
- Business logic lives in **use cases** (`src/application/usecases/`)
- Each use case is a single-purpose class with an `execute()` method
- Controllers inject and orchestrate use cases, never contain business logic
- Example: `CreateTrackUseCase` handles track creation workflow

### Repository Pattern
- Domain defines repository **interfaces** (`src/domain/repositories/`)
- Infrastructure provides **concrete implementations** (`src/infrastructure/database/`)
- All database operations go through repositories, never direct Prisma calls in controllers

### Queue-Based Processing
- **BullMQ + Redis** for async jobs (audio generation, trend analysis)
- Queue service abstracted behind `IQueueService` interface
- Job entities track processing state with metadata in database

## Database & Prisma

- **PostgreSQL** with Prisma ORM
- Generated client in `generated/prisma/` (custom output path)
- Key commands:
  ```bash
  npm run db:generate    # Generate Prisma client
  npm run db:migrate     # Run migrations  
  npm run db:studio      # Open Prisma Studio
  ```

## Development Workflow

### Running the App
```bash
npm run start:dev      # Hot reload development
npm run start:debug    # Debug mode on port 9229
npm run db:studio      # Database GUI
```

### Testing
- **Unit tests**: Mock repositories using interfaces, test use cases in isolation
- Test files follow naming: `*.usecase.spec.ts`
- Example pattern in `test/unit/create-user.usecase.spec.ts`

### Module Structure
Each feature module (`src/modules/`) follows this pattern:
1. Import related controllers and use cases
2. Provide repository implementations using DI tokens
3. Wire dependencies with NestJS providers array

## External Integrations

- **TikTok API**: Trend analysis service (`src/infrastructure/external-services/`)
- **AI Services**: Audio/image generation (interfaces in `src/application/interfaces/`)
- **Redis**: Queue management and caching
- **JWT**: Authentication with Passport strategy

## Common Tasks

### Adding New Feature
1. Define entity in `src/domain/entities/`
2. Create repository interface in `src/domain/repositories/`
3. Implement use cases in `src/application/usecases/`
4. Add concrete repository in `src/infrastructure/database/`
5. Create module with proper DI wiring in `src/modules/`
6. Add controller in `src/presentation/controllers/`

### Working with Queues
- Add jobs via `IQueueService.addJob()`
- Job processing happens in background workers
- Job state tracked in database via `Job` entity

When adding features, always maintain the clean architecture boundaries and use the established DI patterns.