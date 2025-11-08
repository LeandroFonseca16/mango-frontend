import { Trend, TrendMetadata } from '../entities/trend.entity';

/**
 * Dados para criação de tendência
 */
export interface CreateTrendData {
  hashtag: string;
  title: string;
  description?: string;
  videoCount?: number;
  viewCount?: bigint;
  category?: string;
  isActive?: boolean;
  metadata?: TrendMetadata;
}

/**
 * Interface do repositório de tendências
 * Define contratos para persistência de tendências do TikTok
 */
export interface ITrendRepository {
  /**
   * Cria uma nova tendência
   */
  create(trend: CreateTrendData): Promise<Trend>;

  /**
   * Busca tendência por ID
   */
  findById(id: string): Promise<Trend | null>;

  /**
   * Busca tendência por hashtag
   */
  findByHashtag(hashtag: string): Promise<Trend | null>;

  /**
   * Busca tendências ativas
   */
  findActive(skip?: number, take?: number): Promise<Trend[]>;

  /**
   * Busca tendências por categoria
   */
  findByCategory(category: string, skip?: number, take?: number): Promise<Trend[]>;

  /**
   * Busca tendências populares (ordenado por visualizações)
   */
  findPopular(limit?: number): Promise<Trend[]>;

  /**
   * Busca tendências recentes
   */
  findRecent(limit?: number): Promise<Trend[]>;

  /**
   * Busca tendências em ascensão (crescimento nas últimas 24h)
   */
  findTrending(limit?: number): Promise<Trend[]>;

  /**
   * Atualiza dados da tendência
   */
  update(id: string, data: Partial<Omit<Trend, 'id' | 'createdAt'>>): Promise<Trend>;

  /**
   * Atualiza estatísticas da tendência
   */
  updateStats(id: string, videoCount: number, viewCount: bigint): Promise<Trend>;

  /**
   * Remove tendência
   */
  delete(id: string): Promise<void>;

  /**
   * Desativa tendência
   */
  deactivate(id: string): Promise<void>;

  /**
   * Lista tendências com paginação
   */
  findMany(skip?: number, take?: number): Promise<Trend[]>;

  /**
   * Conta tendências ativas
   */
  countActive(): Promise<number>;

  /**
   * Busca por texto (título, descrição, hashtag)
   */
  search(query: string, skip?: number, take?: number): Promise<Trend[]>;
}