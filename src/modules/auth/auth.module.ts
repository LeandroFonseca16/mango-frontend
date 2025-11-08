import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '../../presentation/controllers/auth.controller';
import { CreateUserUseCase } from '../../application/usecases/create-user.usecase';
import { AuthenticateUserUseCase } from '../../application/usecases/authenticate-user.usecase';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserRepository } from '../../infrastructure/database/user.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { JwtAuthGuard } from '../../presentation/guards/jwt-auth.guard';
import { USER_REPOSITORY } from '../../infrastructure/di-tokens';

/**
 * Módulo de autenticação
 * Agrupa controllers, use cases e dependências relacionadas à autenticação
 */
@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [
    // Services
    PrismaService,
    
    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    
    // Use Cases
    {
      provide: CreateUserUseCase,
      useFactory: (userRepository: IUserRepository) => {
        return new CreateUserUseCase(userRepository);
      },
      inject: [USER_REPOSITORY],
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: (userRepository: IUserRepository) => {
        return new AuthenticateUserUseCase(
          userRepository,
          process.env.JWT_SECRET || 'default-secret',
          process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        );
      },
      inject: [USER_REPOSITORY],
    },
    
    // Guards
    JwtAuthGuard,
  ],
  exports: [
    AuthenticateUserUseCase,
    JwtAuthGuard,
    USER_REPOSITORY,
  ],
})
export class AuthModule {}