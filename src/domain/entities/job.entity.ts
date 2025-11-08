/**
 * Enums para Job
 */
export enum JobType {
  AUDIO_GENERATION = 'AUDIO_GENERATION',
  IMAGE_GENERATION = 'IMAGE_GENERATION',
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  TIKTOK_UPLOAD = 'TIKTOK_UPLOAD',
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Interface para dados do job
 */
export interface JobData {
  [key: string]: any;
}

/**
 * Interface para resultado do job
 */
export interface JobResult {
  [key: string]: any;
}

/**
 * Entidade Job do domínio
 * Representa um trabalho assíncrono no sistema
 */
export class Job {
  constructor(
    public readonly id: string,
    public readonly type: JobType,
    public readonly data: JobData,
    public readonly status: JobStatus = JobStatus.PENDING,
    public readonly priority: number = 0,
    public readonly result?: JobResult,
    public readonly error?: string,
    public readonly attempts: number = 0,
    public readonly maxAttempts: number = 3,
    public readonly userId?: string,
    public readonly trackId?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly processedAt?: Date,
  ) {}

  /**
   * Verifica se o job está pendente
   */
  isPending(): boolean {
    return this.status === JobStatus.PENDING;
  }

  /**
   * Verifica se o job está sendo processado
   */
  isProcessing(): boolean {
    return this.status === JobStatus.PROCESSING;
  }

  /**
   * Verifica se o job foi completado
   */
  isCompleted(): boolean {
    return this.status === JobStatus.COMPLETED;
  }

  /**
   * Verifica se o job falhou
   */
  hasFailed(): boolean {
    return this.status === JobStatus.FAILED;
  }

  /**
   * Verifica se o job foi cancelado
   */
  isCancelled(): boolean {
    return this.status === JobStatus.CANCELLED;
  }

  /**
   * Verifica se pode tentar novamente
   */
  canRetry(): boolean {
    return this.attempts < this.maxAttempts && this.hasFailed();
  }

  /**
   * Verifica se atingiu o limite máximo de tentativas
   */
  hasReachedMaxAttempts(): boolean {
    return this.attempts >= this.maxAttempts;
  }

  /**
   * Calcula o tempo de processamento em milissegundos
   */
  getProcessingTime(): number | null {
    if (!this.processedAt || !this.createdAt) return null;
    return this.processedAt.getTime() - this.createdAt.getTime();
  }
}