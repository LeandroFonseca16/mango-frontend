/**
 * Interface para serviço de fila de jobs
 * Abstrai o sistema de filas (BullMQ) para processamento assíncrono
 */
export interface IQueueService {
  /**
   * Adiciona um job à fila
   */
  addJob<T = any>(
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
  ): Promise<string>; // Retorna ID do job

  /**
   * Remove um job da fila
   */
  removeJob(queueName: string, jobId: string): Promise<void>;

  /**
   * Obtém informações de um job
   */
  getJob(queueName: string, jobId: string): Promise<{
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
  } | null>;

  /**
   * Lista jobs de uma fila com filtros
   */
  getJobs(
    queueName: string,
    status?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed',
    skip?: number,
    take?: number
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
  }>>;

  /**
   * Obtém estatísticas da fila
   */
  getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
  }>;

  /**
   * Pausa uma fila
   */
  pauseQueue(queueName: string): Promise<void>;

  /**
   * Resume uma fila pausada
   */
  resumeQueue(queueName: string): Promise<void>;

  /**
   * Limpa jobs de uma fila
   */
  cleanQueue(
    queueName: string,
    grace: number, // ms
    status: 'completed' | 'failed'
  ): Promise<number>; // Retorna número de jobs removidos

  /**
   * Registra um processador de jobs
   */
  registerProcessor<T = any>(
    queueName: string,
    processor: (job: {
      id: string;
      name: string;
      data: T;
      updateProgress: (progress: number) => Promise<void>;
    }) => Promise<any>
  ): Promise<void>;

  /**
   * Para o processamento e fecha conexões
   */
  close(): Promise<void>;
}