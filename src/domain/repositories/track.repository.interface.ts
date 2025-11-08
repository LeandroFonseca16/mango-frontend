import { Track, TrackStatus, TrackMetadata } from '../entities/track.entity';

/**
 * Dados para criação de track
 */
export interface CreateTrackData {
  title: string;
  userId: string;
  description?: string;
  audioUrl?: string;
  imageUrl?: string;
  genre?: string;
  tags?: string[];
  duration?: number;
  status?: TrackStatus;
  metadata?: TrackMetadata;
}

/**
 * Interface do repositório de tracks
 * Define contratos para persistência de músicas/tracks
 */
export interface ITrackRepository {
  /**
   * Cria uma nova track
   */
  create(track: CreateTrackData): Promise<Track>;

  /**
   * Busca track por ID
   */
  findById(id: string): Promise<Track | null>;

  /**
   * Busca tracks por usuário
   */
  findByUserId(userId: string, skip?: number, take?: number): Promise<Track[]>;

  /**
   * Busca tracks por status
   */
  findByStatus(status: TrackStatus, skip?: number, take?: number): Promise<Track[]>;

  /**
   * Busca tracks por gênero
   */
  findByGenre(genre: string, skip?: number, take?: number): Promise<Track[]>;

  /**
   * Busca tracks por tags
   */
  findByTags(tags: string[], skip?: number, take?: number): Promise<Track[]>;

  /**
   * Atualiza dados da track
   */
  update(id: string, data: Partial<Omit<Track, 'id' | 'createdAt'>>): Promise<Track>;

  /**
   * Remove track
   */
  delete(id: string): Promise<void>;

  /**
   * Lista todas as tracks com paginação
   */
  findMany(skip?: number, take?: number): Promise<Track[]>;

  /**
   * Conta tracks por usuário
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Busca tracks recentes
   */
  findRecent(limit?: number): Promise<Track[]>;
}