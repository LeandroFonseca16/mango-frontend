import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { IJobRepository } from '../../domain/repositories/job.repository.interface';
import { IQueueService } from '../../application/interfaces/queue.service.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { JobStatus, JobType } from '../../domain/entities/job.entity';
import { JOB_REPOSITORY, QUEUE_SERVICE } from '../../infrastructure/di-tokens';

/**
 * DTO para resposta de job
 */
export class JobResponseDto {
  id: string;
  type: JobType;
  status: JobStatus;
  priority: number;
  data: any;
  result?: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
  userId?: string;
  trackId?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

/**
 * Controlador para gerenciamento de jobs/processamento
 */
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(
    @Inject(JOB_REPOSITORY)
    private readonly jobRepository: IJobRepository,
    @Inject(QUEUE_SERVICE)
    private readonly queueService: IQueueService,
  ) {}

  /**
   * Lista jobs do usuário autenticado
   * GET /jobs/my
   */
  @Get('my')
  async getMyJobs(
    @Request() req: any,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @Query('status') status?: JobStatus,
  ): Promise<JobResponseDto[]> {
    try {
      let jobs;

      if (status) {
        jobs = await this.jobRepository.findByStatus(status, Number(skip), Number(take));
        // Filtra apenas jobs do usuário
        jobs = jobs.filter(job => job.userId === req.user.userId);
      } else {
        jobs = await this.jobRepository.findByUserId(
          req.user.userId,
          Number(skip),
          Number(take),
        );
      }

      return jobs.map(job => this.mapToResponseDto(job));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar jobs');
    }
  }

  /**
   * Busca job por ID
   * GET /jobs/:id
   */
  @Get(':id')
  async getById(@Param('id') id: string, @Request() req: any): Promise<JobResponseDto> {
    try {
      const job = await this.jobRepository.findById(id);
      
      if (!job) {
        throw new Error('Job não encontrado');
      }

      // Verifica se o job pertence ao usuário
      if (job.userId !== req.user.userId) {
        throw new Error('Não autorizado a acessar este job');
      }

      return this.mapToResponseDto(job);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar job');
    }
  }

  /**
   * Lista jobs por tipo
   * GET /jobs/type/:type
   */
  @Get('type/:type')
  async getByType(
    @Param('type') type: JobType,
    @Request() req: any,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<JobResponseDto[]> {
    try {
      const jobs = await this.jobRepository.findByType(type, Number(skip), Number(take));
      
      // Filtra apenas jobs do usuário
      const userJobs = jobs.filter(job => job.userId === req.user.userId);
      
      return userJobs.map(job => this.mapToResponseDto(job));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar jobs por tipo');
    }
  }

  /**
   * Lista jobs por track
   * GET /jobs/track/:trackId
   */
  @Get('track/:trackId')
  async getByTrack(
    @Param('trackId') trackId: string,
    @Request() req: any,
  ): Promise<JobResponseDto[]> {
    try {
      const jobs = await this.jobRepository.findByTrackId(trackId);
      
      // Verifica se pelo menos um job pertence ao usuário (para autorizar acesso à track)
      const hasUserJob = jobs.some(job => job.userId === req.user.userId);
      if (!hasUserJob && jobs.length > 0) {
        throw new Error('Não autorizado a acessar jobs desta track');
      }

      return jobs.map(job => this.mapToResponseDto(job));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar jobs da track');
    }
  }

  /**
   * Reprocessa um job falho
   * POST /jobs/:id/retry
   */
  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  async retryJob(@Param('id') id: string, @Request() req: any): Promise<{ message: string }> {
    try {
      const job = await this.jobRepository.findById(id);
      
      if (!job) {
        throw new Error('Job não encontrado');
      }

      // Verifica se o job pertence ao usuário
      if (job.userId !== req.user.userId) {
        throw new Error('Não autorizado a reprocessar este job');
      }

      // Verifica se o job pode ser reprocessado
      if (!job.canRetry()) {
        throw new Error('Job não pode ser reprocessado (limite de tentativas atingido)');
      }

      // Atualiza status e adiciona novamente à fila
      await this.jobRepository.update(id, {
        status: JobStatus.PENDING,
        error: undefined,
      });

      // Determina qual fila usar baseado no tipo
      const queueName = this.getQueueNameByType(job.type);
      
      await this.queueService.addJob(
        queueName,
        `retry-${job.type.toLowerCase()}`,
        {
          jobId: job.id,
          ...job.data,
        },
        {
          priority: job.priority + 1, // Aumenta prioridade no retry
          attempts: job.maxAttempts - job.attempts,
        }
      );

      return { message: 'Job adicionado à fila para reprocessamento' };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao reprocessar job');
    }
  }

  /**
   * Obtém estatísticas dos jobs do usuário
   * GET /jobs/stats
   */
  @Get('stats')
  async getStats(@Request() req: any): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    try {
      const [pending, processing, completed, failed] = await Promise.all([
        this.jobRepository.countByStatus(JobStatus.PENDING),
        this.jobRepository.countByStatus(JobStatus.PROCESSING),
        this.jobRepository.countByStatus(JobStatus.COMPLETED),
        this.jobRepository.countByStatus(JobStatus.FAILED),
      ]);

      // Busca todos os jobs do usuário para filtrar estatísticas
      const userJobs = await this.jobRepository.findByUserId(req.user.userId, 0, 1000);
      const userStats = {
        pending: userJobs.filter(j => j.status === JobStatus.PENDING).length,
        processing: userJobs.filter(j => j.status === JobStatus.PROCESSING).length,
        completed: userJobs.filter(j => j.status === JobStatus.COMPLETED).length,
        failed: userJobs.filter(j => j.status === JobStatus.FAILED).length,
      };

      return {
        total: userJobs.length,
        ...userStats,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao obter estatísticas');
    }
  }

  /**
   * Mapeia entidade Job para DTO de resposta
   */
  private mapToResponseDto(job: any): JobResponseDto {
    return {
      id: job.id,
      type: job.type,
      status: job.status,
      priority: job.priority,
      data: job.data,
      result: job.result,
      error: job.error,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      userId: job.userId,
      trackId: job.trackId,
      createdAt: job.createdAt!,
      updatedAt: job.updatedAt!,
      processedAt: job.processedAt,
    };
  }

  /**
   * Mapeia tipo de job para nome da fila
   */
  private getQueueNameByType(type: JobType): string {
    switch (type) {
      case JobType.AUDIO_GENERATION:
        return 'audio-generation';
      case JobType.IMAGE_GENERATION:
        return 'image-generation';
      case JobType.TREND_ANALYSIS:
        return 'trend-analysis';
      case JobType.TIKTOK_UPLOAD:
        return 'tiktok-upload';
      default:
        return 'default';
    }
  }
}