import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { ITrackRepository } from '../../domain/repositories/track.repository.interface';
import { IJobRepository } from '../../domain/repositories/job.repository.interface';
import { Track, TrackStatus } from '../../domain/entities/track.entity';
import { JobStatus } from '../../domain/entities/job.entity';
import { MusicGenService } from '../external-services/musicgen.service';
import { StableDiffusionService } from '../external-services/stable-diffusion.service';
import { 
  TRACK_REPOSITORY, 
  JOB_REPOSITORY 
} from '../di-tokens';

/**
 * Dados do job de geração de track
 */
interface GenerateTrackJobData {
  trackId: string;
  userId: string;
  audioParams: {
    prompt: string;
    genre: string;
    bpm: number;
    duration: number;
    key: string;
    mood: string;
  };
  imageParams?: {
    prompt: string;
    style: string;
    aspectRatio: string;
    quality: string;
  } | null;
}

/**
 * Worker BullMQ para processamento de geração de tracks
 * Processa jobs de forma assíncrona em background
 */
@Processor('track-generation', { concurrency: 5 })
export class TrackGenerationWorker extends WorkerHost {
  private readonly logger = new Logger(TrackGenerationWorker.name);

  constructor(
    @Inject(TRACK_REPOSITORY)
    private readonly trackRepository: ITrackRepository,
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
    private readonly musicGenService: MusicGenService,
    private readonly stableDiffusionService: StableDiffusionService,
  ) {
    super();
  }

  /**
   * Processa job de geração de track
   */
  async process(job: Job<GenerateTrackJobData>): Promise<any> {
    const { trackId, userId, audioParams, imageParams } = job.data;

    this.logger.log(`Processing track generation job ${job.id} for track ${trackId}`);

    try {
      // Atualiza job para em processamento
      await this.updateJobStatus(job.id, JobStatus.PROCESSING, 0);

      // Busca a track no banco
      const track = await this.trackRepository.findById(trackId);
      if (!track) {
        throw new Error(`Track ${trackId} not found`);
      }

      // Atualiza progresso: iniciando geração de áudio
      await job.updateProgress(20);
      await this.updateJobStatus(job.id, JobStatus.PROCESSING, 20);

      // Gera o áudio
      this.logger.log(`Generating audio for track ${trackId}`);
      const audioResult = await this.musicGenService.generateMusic({
        prompt: audioParams.prompt,
        genre: audioParams.genre,
        bpm: audioParams.bpm,
        duration: audioParams.duration,
        key: audioParams.key,
        mood: audioParams.mood,
      });

      // Atualiza progresso: áudio gerado
      await job.updateProgress(60);
      await this.updateJobStatus(job.id, JobStatus.PROCESSING, 60);

      let imageUrl: string | undefined;
      
      // Gera imagem se foi solicitada
      if (imageParams) {
        this.logger.log(`Generating image for track ${trackId}`);
        
        // Se não foi fornecido prompt de imagem, gera um baseado na música
        let imagePrompt = imageParams.prompt;
        if (!imagePrompt) {
          imagePrompt = this.stableDiffusionService.generateMusicCoverPrompt(
            audioParams.genre,
            audioParams.mood,
            track.title
          );
        }

        const imageResult = await this.stableDiffusionService.generateImage({
          prompt: imagePrompt,
          style: imageParams.style as any,
          aspectRatio: imageParams.aspectRatio as any,
          quality: imageParams.quality as any,
        });

        imageUrl = imageResult.imageUrl;
      }

      // Atualiza progresso: finalizando
      await job.updateProgress(90);
      await this.updateJobStatus(job.id, JobStatus.PROCESSING, 90);

      // Atualiza a track com os resultados
      const updatedTrack = await this.trackRepository.update(trackId, {
        audioUrl: audioResult.audioUrl,
        imageUrl,
        duration: audioResult.metadata.duration,
        status: TrackStatus.COMPLETED,
        metadata: {
          ...audioResult.metadata,
          generationParams: {
            ...audioResult.metadata.generationParams,
            generatedAt: new Date().toISOString(),
            jobId: job.id?.toString(),
          },
        },
      });

      // Finaliza o job
      await job.updateProgress(100);
      await this.updateJobStatus(job.id, JobStatus.COMPLETED, 100, {
        trackId: updatedTrack.id,
        audioUrl: audioResult.audioUrl,
        imageUrl,
        completedAt: new Date().toISOString(),
      });

      this.logger.log(`Track generation completed for track ${trackId}`);

      return {
        success: true,
        trackId: updatedTrack.id,
        audioUrl: audioResult.audioUrl,
        imageUrl,
      };

    } catch (error: any) {
      this.logger.error(`Error processing track generation job ${job.id}:`, error);

      // Marca track como falhada
      await this.trackRepository.update(trackId, {
        status: TrackStatus.FAILED,
        metadata: {
          generationParams: {
            error: error.message,
            failedAt: new Date().toISOString(),
            jobId: job.id?.toString(),
          },
        },
      });

      // Marca job como falhado
      await this.updateJobStatus(job.id, JobStatus.FAILED, 0, null, error.message);

      throw error;
    }
  }

  /**
   * Event listeners para logs e monitoramento
   */
  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Job ${job.id} is now active`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed:`, error.message);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: number) {
    this.logger.debug(`Job ${job.id} progress: ${progress}%`);
  }

  /**
   * Atualiza status do job no banco de dados
   */
  private async updateJobStatus(
    jobId: string,
    status: JobStatus,
    progress: number,
    result?: any,
    error?: string
  ): Promise<void> {
    try {
      // Busca todos os jobs e filtra pelo jobId nos dados
      const jobs = await this.jobRepository.findMany(0, 100);
      const job = jobs.find(j => j.data && typeof j.data === 'object' && (j.data as any).jobId === jobId);

      if (job) {
        await this.jobRepository.update(job.id, {
          status,
          result: result || job.result,
          error: error || job.error,
          processedAt: status === JobStatus.COMPLETED || status === JobStatus.FAILED 
            ? new Date() : undefined,
        });
      }
    } catch (error) {
      this.logger.error(`Error updating job status:`, error);
    }
  }
}