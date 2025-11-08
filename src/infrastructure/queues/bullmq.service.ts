import { Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { IQueueService } from '../../application/interfaces/queue.service.interface';
import Redis from 'ioredis';

/**
 * Implementação do serviço de filas usando BullMQ
 * Gerencia processamento assíncrono de jobs
 */
@Injectable()
export class BullMQService implements IQueueService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private connection: Redis;

  constructor() {
    // Configuração da conexão Redis
    this.connection = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
    });
  }

  /**
   * Adiciona um job à fila
   */
  async addJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    options?: {
      priority?: number;
      delay?: number;
      attempts?: number;
      backoff?: {
        type: 'fixed' | 'exponential';
        delay: number;
      };
    }
  ): Promise<string> {
    const queue = this.getOrCreateQueue(queueName);

    const job = await queue.add(jobName, data, {
      priority: options?.priority || 0,
      delay: options?.delay || 0,
      attempts: options?.attempts || 3,
      backoff: options?.backoff || {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 50,
    });

    return job.id!;
  }

  /**
   * Remove um job da fila
   */
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    const job = await queue.getJob(jobId);
    
    if (job) {
      await job.remove();
    }
  }

  /**
   * Obtém informações de um job
   */
  async getJob(queueName: string, jobId: string): Promise<{
    id: string;
    name: string;
    data: any;
    progress: number;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
    result?: any;
    error?: string;
    createdAt: Date;
    processedAt?: Date;
    finishedAt?: Date;
  } | null> {
    const queue = this.getOrCreateQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) return null;

    const state = await job.getState();
    
    return {
      id: job.id!,
      name: job.name,
      data: job.data,
      progress: typeof job.progress === 'number' ? job.progress : 0,
      status: this.mapBullStateToStatus(state),
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
    };
  }

  /**
   * Lista jobs de uma fila com filtros
   */
  async getJobs(
    queueName: string,
    status?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
    skip: number = 0,
    take: number = 10
  ): Promise<Array<{
    id: string;
    name: string;
    data: any;
    progress: number;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
    result?: any;
    error?: string;
    createdAt: Date;
    processedAt?: Date;
    finishedAt?: Date;
  }>> {
    const queue = this.getOrCreateQueue(queueName);
    
    const bullStatus = status ? this.mapStatusToBullState(status) : undefined;
    const jobs = await queue.getJobs(bullStatus ? [bullStatus as any] : undefined, skip, skip + take - 1);

    return Promise.all(jobs.map(async (job) => {
      const state = await job.getState();
      
      return {
        id: job.id!,
        name: job.name,
        data: job.data,
        progress: typeof job.progress === 'number' ? job.progress : 0,
        status: this.mapBullStateToStatus(state),
        result: job.returnvalue,
        error: job.failedReason,
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
        finishedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      };
    }));
  }

  /**
   * Obtém estatísticas da fila
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }> {
    const queue = this.getOrCreateQueue(queueName);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: await queue.isPaused(),
    };
  }

  /**
   * Pausa uma fila
   */
  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.pause();
  }

  /**
   * Resume uma fila pausada
   */
  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);
    await queue.resume();
  }

  /**
   * Limpa jobs de uma fila
   */
  async cleanQueue(
    queueName: string,
    grace: number,
    status: 'completed' | 'failed'
  ): Promise<number> {
    const queue = this.getOrCreateQueue(queueName);
    
    const jobs = await queue.clean(grace, 100, status);
    return jobs.length;
  }

  /**
   * Registra um processador de jobs
   */
  async registerProcessor<T = any>(
    queueName: string,
    processor: (job: {
      id: string;
      name: string;
      data: T;
      updateProgress: (progress: number) => Promise<void>;
    }) => Promise<any>
  ): Promise<void> {
    // Cria worker se não existir
    if (!this.workers.has(queueName)) {
      const worker = new Worker(
        queueName,
        async (job: Job) => {
          const wrappedJob = {
            id: job.id!,
            name: job.name,
            data: job.data as T,
            updateProgress: async (progress: number) => {
              await job.updateProgress(progress);
            },
          };

          return processor(wrappedJob);
        },
        {
          connection: this.connection,
          concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5'),
        }
      );

      // Event listeners
      worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed in queue ${queueName}`);
      });

      worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed in queue ${queueName}:`, err.message);
      });

      worker.on('error', (err) => {
        console.error(`🚨 Worker error in queue ${queueName}:`, err);
      });

      this.workers.set(queueName, worker);
    }
  }

  /**
   * Para o processamento e fecha conexões
   */
  async close(): Promise<void> {
    // Fecha todos os workers
    for (const [name, worker] of this.workers) {
      await worker.close();
      console.log(`🔌 Worker ${name} fechado`);
    }

    // Fecha todas as filas
    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`🔌 Queue ${name} fechada`);
    }

    // Fecha conexão Redis
    await this.connection.quit();
    console.log('🔌 Conexão Redis fechada');
  }

  /**
   * Obtém ou cria uma fila
   */
  private getOrCreateQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.connection,
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      this.queues.set(queueName, queue);
    }

    return this.queues.get(queueName)!;
  }

  /**
   * Mapeia status do Bull para nosso formato
   */
  private mapBullStateToStatus(state: string): 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' {
    switch (state) {
      case 'waiting': return 'waiting';
      case 'active': return 'active';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      case 'delayed': return 'delayed';
      default: return 'waiting';
    }
  }

  /**
   * Mapeia nosso status para estado do Bull
   */
  private mapStatusToBullState(status: string): string {
    switch (status) {
      case 'waiting': return 'waiting';
      case 'active': return 'active';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      case 'delayed': return 'delayed';
      default: return 'waiting';
    }
  }
}