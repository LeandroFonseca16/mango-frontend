import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IUserRepository, CreateUserData } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

/**
 * Implementação do repositório de usuários usando Prisma
 * Implementa interface do domínio para persistência
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo usuário
   */
  async create(userData: CreateUserData): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: userData,
    });

    return this.mapToEntity(prismaUser);
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    return prismaUser ? this.mapToEntity(prismaUser) : null;
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return prismaUser ? this.mapToEntity(prismaUser) : null;
  }

  /**
   * Atualiza dados do usuário
   */
  async update(id: string, data: Partial<CreateUserData>): Promise<User> {
    const prismaUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return this.mapToEntity(prismaUser);
  }

  /**
   * Remove usuário
   */
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Lista usuários com paginação
   */
  async findMany(skip: number = 0, take: number = 10): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaUsers.map((user: any) => this.mapToEntity(user));
  }

  /**
   * Conta total de usuários
   */
  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  /**
   * Mapeia dados do Prisma para entidade do domínio
   */
  private mapToEntity(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name,
      prismaUser.avatar,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}