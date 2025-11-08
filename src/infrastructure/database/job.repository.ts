import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IJobRepository, CreateJobData } from '../../domain/repositories/job.repository.interface';
import { Job, JobStatus, JobType, JobData, JobResult } from '../../domain/entities/job.entity';

/**
 * Implementação do repositório de jobs usando Prisma
 */
@Injectable()
export class JobRepository implements IJobRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo job
   */
  async create(jobData: CreateJobData): Promise<Job> {
    const prismaJob = await this.prisma.job.create({
      data: {
        ...jobData,
        status: jobData.status || JobStatus.PENDING,
        priority: jobData.priority || 0,
        attempts: jobData.attempts || 0,
        maxAttempts: jobData.maxAttempts || 3,
        data: jobData.data as any,
        result: jobData.result as any,
      },
    });

    return this.mapToEntity(prismaJob);
  }

  /**
   * Busca job por ID
   */
  async findById(id: string): Promise<Job | null> {
    const prismaJob = await this.prisma.job.findUnique({
      where: { id },
    });

    return prismaJob ? this.mapToEntity(prismaJob) : null;
  }

  /**
   * Busca jobs por usuário
   */
  async findByUserId(userId: string, skip: number = 0, take: number = 10): Promise<Job[]> {
    const prismaJobs = await this.prisma.job.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaJobs.map((job: any) => this.mapToEntity(job));
  }

  /**
   * Busca jobs por status
   */
  async findByStatus(status: JobStatus, skip: number = 0, take: number = 10): Promise<Job[]> {
    const prismaJobs = await this.prisma.job.findMany({
      where: { status },
      skip,
      take,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    return prismaJobs.map((job: any) => this.mapToEntity(job));
  }

  /**
   * Busca jobs por tipo
   */
  async findByType(type: JobType, skip: number = 0, take: number = 10): Promise<Job[]> {
    const prismaJobs = await this.prisma.job.findMany({
      where: { type },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaJobs.map((job: any) => this.mapToEntity(job));
  }

  /**
   * Busca jobs por track
   */
  async findByTrackId(trackId: string): Promise<Job[]> {
    const prismaJobs = await this.prisma.job.findMany({
      where: { trackId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaJobs.map((job: any) => this.mapToEntity(job));
  }

  /**
   * Busca próximos jobs na fila
   */
  async findNextJobs(limit: number = 10): Promise<Job[]> {
    const prismaJobs = await this.prisma.job.findMany({
      where: { status: JobStatus.PENDING },
      take: limit,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    return prismaJobs.map((job: any) => this.mapToEntity(job));
  }

  /**
   * Atualiza dados do job
   */
  async update(id: string, data: Partial<CreateJobData>): Promise<Job> {
    const updateData: any = { ...data };
    
    if (data.data) {
      updateData.data = data.data;
    }
    
    if (data.result) {
      updateData.result = data.result;
    }

    const prismaJob = await this.prisma.job.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(prismaJob);
  }

  /**
   * Remove job
   */
  async delete(id: string): Promise<void> {
    await this.prisma.job.delete({
      where: { id },
    });
  }

  /**
   * Lista jobs com paginação
   */
  async findMany(skip: number = 0, take: number = 10): Promise<Job[]> {
    const prismaJobs = await this.prisma.job.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaJobs.map((job: any) => this.mapToEntity(job));
  }

  /**
   * Conta jobs por status
   */
  async countByStatus(status: JobStatus): Promise<number> {
    return this.prisma.job.count({
      where: { status },
    });
  }

  /**
   * Busca jobs falhos que podem ser reprocessados
   */
  async findRetryableJobs(limit: number = 10): Promise<Job[]> {
    const prismaJobs = await this.prisma.job.findMany({
      where: {
        status: JobStatus.FAILED,
        attempts: {
          lt: 3, // Menor que maxAttempts padrão
        },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    return prismaJobs.map((job: any) => this.mapToEntity(job));
  }

  /**
   * Remove jobs antigos completados
   */
  async cleanupOldJobs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.job.deleteMany({
      where: {
        status: { in: [JobStatus.COMPLETED, JobStatus.FAILED] },
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  /**
   * Mapeia dados do Prisma para entidade do domínio
   */
  private mapToEntity(prismaJob: any): Job {
    return new Job(
      prismaJob.id,
      prismaJob.type as JobType,
      prismaJob.data as JobData,
      prismaJob.status as JobStatus,
      prismaJob.priority,
      prismaJob.result as JobResult,
      prismaJob.error,
      prismaJob.attempts,
      prismaJob.maxAttempts,
      prismaJob.userId,
      prismaJob.trackId,
      prismaJob.createdAt,
      prismaJob.updatedAt,
      prismaJob.processedAt,
    );
  }
}