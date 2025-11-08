import { Module } from '@nestjs/common';
import { JobController } from '../../presentation/controllers/job.controller';
import { JobRepository } from '../../infrastructure/database/job.repository';
import { BullMQService } from '../../infrastructure/queues/bullmq.service';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AuthModule } from '../auth/auth.module';
import {
  JOB_REPOSITORY,
  QUEUE_SERVICE,
  AUDIO_GENERATION_SERVICE,
  IMAGE_GENERATION_SERVICE,
} from '../../infrastructure/di-tokens';
import { MusicGenService } from '../../infrastructure/external-services/musicgen.service';
import { StableDiffusionService } from '../../infrastructure/external-services/stable-diffusion.service';

/**
 * Módulo de Jobs/Processamento
 * Gerencia processamento assíncrono e filas de trabalho
 */
@Module({
  imports: [AuthModule],
  controllers: [JobController],  providers: [
    // Services
    PrismaService,
    
    // Repositories
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
      provide: AUDIO_GENERATION_SERVICE,
      useClass: MusicGenService,
    },
    {
      provide: IMAGE_GENERATION_SERVICE,
      useClass: StableDiffusionService,
    },
  ],
  exports: [
    JOB_REPOSITORY,
    QUEUE_SERVICE,
  ],
})
export class JobsModule {}