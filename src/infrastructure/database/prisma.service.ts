import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';

/**
 * Serviço Prisma para gerenciar conexão com o banco de dados
 * Implementa inicialização e finalização adequadas
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Conecta ao banco de dados quando o módulo é inicializado
   */
  async onModuleInit() {
    await this.$connect();
    console.log('Conectado ao banco de dados PostgreSQL via Prisma');
  }

  /**
   * Desconecta do banco de dados quando o módulo é destruído
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Desconectado do banco de dados');
  }

  /**
   * Método para executar transações de forma segura
   */
  async executeTransaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.$transaction(callback);
  }

  /**
   * Método para verificar a saúde da conexão
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Erro na verificação de saúde do banco:', error);
      return false;
    }
  }
}