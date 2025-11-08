import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';

/**
 * DTO para criação de usuário
 */
export interface CreateUserDto {
  email: string;
  password: string;
  name?: string;
}

/**
 * Use case para criar usuário
 * Implementa a lógica de negócio para criação de usuários
 */
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Executa a criação de um novo usuário
   */
  async execute(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name } = createUserDto;

    // Verifica se o email já está em uso
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Valida o formato do email
    if (!this.isValidEmail(email)) {
      throw new Error('Formato de email inválido');
    }

    // Valida a força da senha
    if (!this.isValidPassword(password)) {
      throw new Error('Senha deve ter pelo menos 8 caracteres, incluindo letras e números');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Cria o usuário
    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name?.trim(),
    };

    const user = await this.userRepository.create(userData);
    return user;
  }

  /**
   * Valida formato do email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida força da senha
   */
  private isValidPassword(password: string): boolean {
    return password.length >= 8 && 
           /[a-zA-Z]/.test(password) && 
           /[0-9]/.test(password);
  }
}