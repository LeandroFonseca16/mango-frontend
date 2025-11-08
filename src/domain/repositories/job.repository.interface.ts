import { Job, JobStatus, JobType, JobData, JobResult } from '../entities/job.entity';

/**
 * Dados para criação de job
 */
export interface CreateJobData {
  type: JobType;
  data: JobData;
  status?: JobStatus;
  priority?: number;
  result?: JobResult;
  error?: string;
  attempts?: number;
  maxAttempts?: number;
  userId?: string;
  trackId?: string;
  processedAt?: Date;
}

/**
 * Interface do repositório de jobs
 * Define contratos para persistência de trabalhos assíncronos
 */
export interface IJobRepository {
  /**
   * Cria um novo job
   */
  create(job: CreateJobData): Promise<Job>;

  /**
   * Busca job por ID
   */
  findById(id: string): Promise<Job | null>;

  /**
   * Busca jobs por usuário
   */
  findByUserId(userId: string, skip?: number, take?: number): Promise<Job[]>;

  /**
   * Busca jobs por status
   */
  findByStatus(status: JobStatus, skip?: number, take?: number): Promise<Job[]>;

  /**
   * Busca jobs por tipo
   */
  findByType(type: JobType, skip?: number, take?: number): Promise<Job[]>;

  /**
   * Busca jobs por track
   */
  findByTrackId(trackId: string): Promise<Job[]>;

  /**
   * Busca próximos jobs na fila (ordenado por prioridade e data)
   */
  findNextJobs(limit?: number): Promise<Job[]>;

  /**
   * Atualiza dados do job
   */
  update(id: string, data: Partial<Omit<Job, 'id' | 'createdAt'>>): Promise<Job>;

  /**
   * Remove job
   */
  delete(id: string): Promise<void>;

  /**
   * Lista jobs com paginação
   */
  findMany(skip?: number, take?: number): Promise<Job[]>;

  /**
   * Conta jobs por status
   */
  countByStatus(status: JobStatus): Promise<number>;

  /**
   * Busca jobs falhos que podem ser reprocessados
   */
  findRetryableJobs(limit?: number): Promise<Job[]>;

  /**
   * Remove jobs antigos completados
   */
  cleanupOldJobs(olderThanDays: number): Promise<number>;
}