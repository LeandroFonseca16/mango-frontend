import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TrendController } from '../../presentation/controllers/trend.controller';
import { AnalyzeTrendsUseCase } from '../../application/usecases/analyze-trends.usecase';
import { TrendRepository } from '../../infrastructure/database/trend.repository';
import { JobRepository } from '../../infrastructure/database/job.repository';
import { BullMQService } from '../../infrastructure/queues/bullmq.service';
import { TikTokService } from '../../infrastructure/external-services/tiktok.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AuthModule } from '../auth/auth.module';
import {
  TREND_REPOSITORY,
  JOB_REPOSITORY,
  QUEUE_SERVICE,
  TIKTOK_SERVICE,
} from '../../infrastructure/di-tokens';

/**
 * Módulo de Tendências TikTok
 * Gerencia análise e coleta de tendências das redes sociais
 */
@Module({
  imports: [AuthModule, HttpModule],
  controllers: [TrendController],
  providers: [
    // Services
    PrismaService,
    
    // Repositories
    {
      provide: TREND_REPOSITORY,
      useClass: TrendRepository,
    },
    {
      provide: JOB_REPOSITORY,
      useClass: JobRepository,
    },
    
    // External Services
    {
      provide: QUEUE_SERVICE,
      useClass: BullMQService,
    },
    {
      provide: TIKTOK_SERVICE,
      useClass: TikTokService,
    },
    
    // Use Cases
    {
      provide: AnalyzeTrendsUseCase,
      useFactory: (
        trendRepository: TrendRepository,
        tikTokService: TikTokService,
        jobRepository: JobRepository,
        queueService: BullMQService,
      ) => {
        return new AnalyzeTrendsUseCase(
          trendRepository,
          tikTokService,
          jobRepository,
          queueService,
        );
      },
      inject: [TREND_REPOSITORY, TIKTOK_SERVICE, JOB_REPOSITORY, QUEUE_SERVICE],
    },
  ],
  exports: [
    TREND_REPOSITORY,
    AnalyzeTrendsUseCase,
  ],
})
export class TrendsModule {}