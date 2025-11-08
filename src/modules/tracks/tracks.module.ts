import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TrackController } from '../../presentation/controllers/track.controller';
import { CreateTrackUseCase } from '../../application/usecases/create-track.usecase';
import { TrackRepository } from '../../infrastructure/database/track.repository';
import { JobRepository } from '../../infrastructure/database/job.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { BullMQService } from '../../infrastructure/queues/bullmq.service';
import { MusicGenService } from '../../infrastructure/external-services/musicgen.service';
import { StableDiffusionService } from '../../infrastructure/external-services/stable-diffusion.service';
import { TrackGenerationWorker } from '../../infrastructure/workers/track-generation.worker';
import { 
  TRACK_REPOSITORY, 
  JOB_REPOSITORY, 
  QUEUE_SERVICE,
  AUDIO_GENERATION_SERVICE,
  IMAGE_GENERATION_SERVICE
} from '../../infrastructure/di-tokens';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de tracks/músicas
 * Gerencia criação, listagem e processamento de tracks
 */
@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'track-generation',
    }),
  ],
  controllers: [TrackController],
  providers: [
    // Services
    PrismaService,
    MusicGenService,
    StableDiffusionService,
    
    // Repositories
    {
      provide: TRACK_REPOSITORY,
      useClass: TrackRepository,
    },
    {
      provide: JOB_REPOSITORY,
      useClass: JobRepository,
    },
    
    // External Services
    {
      provide: AUDIO_GENERATION_SERVICE,
      useClass: MusicGenService,
    },
    {
      provide: IMAGE_GENERATION_SERVICE,
      useClass: StableDiffusionService,
    },
    
    // Queue Service
    {
      provide: QUEUE_SERVICE,
      useClass: BullMQService,
    },
    
    // Use Cases
    {
      provide: CreateTrackUseCase,
      useFactory: (trackRepository, jobRepository, queueService) => {
        return new CreateTrackUseCase(trackRepository, jobRepository, queueService);
      },
      inject: [TRACK_REPOSITORY, JOB_REPOSITORY, QUEUE_SERVICE],
    },
    
    // Workers
    TrackGenerationWorker,
  ],
  exports: [
    TRACK_REPOSITORY,
    CreateTrackUseCase,
  ],
})
export class TracksModule {}