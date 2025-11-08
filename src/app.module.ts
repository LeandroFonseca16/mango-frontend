import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './modules/auth/auth.module';
import { TracksModule } from './modules/tracks/tracks.module';
import { TrendsModule } from './modules/trends/trends.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { HealthModule } from './modules/health/health.module';
import { SchedulersModule } from './modules/schedulers/schedulers.module';
import { PrismaService } from './infrastructure/database/prisma.service';

/**
 * Módulo principal da aplicação
 * Orquestra todos os módulos e configurações globais
 */
@Module({
  imports: [
    // Configuração global de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuração do BullMQ (Redis)
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0'),
        },
        defaultJobOptions: {
          removeOnComplete: 10, // Manter apenas os últimos 10 jobs completados
          removeOnFail: 50, // Manter os últimos 50 jobs que falharam
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
    }),

    // Módulos da aplicação
    HealthModule,
    AuthModule,
    TracksModule,
    TrendsModule,
    JobsModule,
    // SchedulersModule, // Temporariamente desabilitado para teste
  ],
  providers: [
    // Serviços globais
    PrismaService,
  ],
})
export class AppModule {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executa verificações de saúde quando a aplicação inicializa
   */
  async onModuleInit() {
    console.log('🔍 Verificando conexões...');
    
    // Verifica conexão com o banco
    const dbHealthy = await this.prisma.healthCheck();
    if (dbHealthy) {
      console.log('✅ Banco de dados conectado');
    } else {
      console.error('❌ Erro na conexão com o banco de dados');
    }

    console.log('🎵 MangoBeat AI Backend inicializado com sucesso!');
  }
}