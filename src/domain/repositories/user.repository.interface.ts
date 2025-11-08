import { User } from '../entities/user.entity';

/**
 * Dados para criação de usuário
 */
export interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
}

/**
 * Interface do repositório de usuários
 * Define contratos para persistência de usuários
 */
export interface IUserRepository {
  /**
   * Cria um novo usuário
   */
  create(user: CreateUserData): Promise<User>;

  /**
   * Busca usuário por ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca usuário por email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Atualiza dados do usuário
   */
  update(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User>;

  /**
   * Remove usuário
   */
  delete(id: string): Promise<void>;

  /**
   * Lista usuários com paginação
   */
  findMany(skip?: number, take?: number): Promise<User[]>;

  /**
   * Conta total de usuários
   */
  count(): Promise<number>;
}