import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { SchedulerService } from '../../infrastructure/schedulers/scheduler.service';
import { TikTokService } from '../../infrastructure/external-services/tiktok.service';
import { BullMQService } from '../../infrastructure/queues/bullmq.service';
import { TrendRepository } from '../../infrastructure/database/trend.repository';
import { TrackRepository } from '../../infrastructure/database/track.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { 
  TIKTOK_SERVICE,
  QUEUE_SERVICE,
  TREND_REPOSITORY,
  TRACK_REPOSITORY
} from '../../infrastructure/di-tokens';

/**
 * Módulo de agendamento
 * Gerencia tarefas automáticas executadas periodicamente
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
  ],
  providers: [
    // Services
    PrismaService,
    SchedulerService,
    
    // External Services
    {
      provide: TIKTOK_SERVICE,
      useClass: TikTokService,
    },
    
    // Queue Service
    {
      provide: QUEUE_SERVICE,
      useClass: BullMQService,
    },
    
    // Repositories
    {
      provide: TREND_REPOSITORY,
      useClass: TrendRepository,
    },
    {
      provide: TRACK_REPOSITORY,
      useClass: TrackRepository,
    },
  ],
  exports: [SchedulerService],
})
export class SchedulersModule {}