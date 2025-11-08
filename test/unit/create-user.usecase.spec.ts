import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../../src/application/usecases/create-user.usecase';
import { IUserRepository } from '../../src/domain/repositories/user.repository.interface';
import { User } from '../../src/domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    // Mock do repositório
    const mockUserRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get('IUserRepository');
  });

  describe('execute', () => {
    it('deve criar um usuário com dados válidos', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@mangobeat.com',
        password: 'password123',
        name: 'Test User',
      };

      const expectedUser = new User(
        'user-id',
        'test@mangobeat.com',
        'hashed-password',
        'Test User',
        undefined,
        new Date(),
        new Date()
      );

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await useCase.execute(createUserDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe('test@mangobeat.com');
      expect(result.name).toBe('Test User');
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@mangobeat.com');
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@mangobeat.com',
          name: 'Test User',
        })
      );
    });

    it('deve falhar se o email já existir', async () => {
      // Arrange
      const createUserDto = {
        email: 'existing@mangobeat.com',
        password: 'password123',
      };

      const existingUser = new User(
        'existing-id',
        'existing@mangobeat.com',
        'hashed-password'
      );

      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(createUserDto)).rejects.toThrow('Email já está em uso');
    });

    it('deve falhar com email inválido', async () => {
      // Arrange
      const createUserDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act & Assert
      await expect(useCase.execute(createUserDto)).rejects.toThrow('Formato de email inválido');
    });

    it('deve falhar com senha fraca', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@mangobeat.com',
        password: '123', // Senha muito fraca
      };

      userRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        'Senha deve ter pelo menos 8 caracteres, incluindo letras e números'
      );
    });
  });
});

/**
 * Teste de integração para o repositório de usuários
 */
describe('UserRepository Integration', () => {
  // Exemplo de teste de integração que seria executado com banco real
  it.skip('deve conectar ao banco e criar usuário', async () => {
    // Este teste seria executado apenas em ambiente de teste com banco configurado
    // Implementar quando necessário para testes E2E
  });
});