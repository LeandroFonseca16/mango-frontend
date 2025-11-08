/**
 * Enums para Track
 */
export enum TrackStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Interface para metadados da track
 */
export interface TrackMetadata {
  bpm?: number;
  key?: string;
  mood?: string;
  instruments?: string[];
  aiModel?: string;
  generationParams?: Record<string, any>;
}

/**
 * Entidade Track do domínio
 * Representa uma música/track no sistema
 */
export class Track {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly userId: string,
    public readonly description?: string,
    public readonly audioUrl?: string,
    public readonly imageUrl?: string,
    public readonly genre?: string,
    public readonly tags: string[] = [],
    public readonly duration?: number,
    public readonly status: TrackStatus = TrackStatus.PROCESSING,
    public readonly metadata?: TrackMetadata,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Verifica se a track foi processada com sucesso
   */
  isCompleted(): boolean {
    return this.status === TrackStatus.COMPLETED;
  }

  /**
   * Verifica se a track falhou no processamento
   */
  hasFailed(): boolean {
    return this.status === TrackStatus.FAILED;
  }

  /**
   * Verifica se a track está sendo processada
   */
  isProcessing(): boolean {
    return this.status === TrackStatus.PROCESSING;
  }

  /**
   * Verifica se tem arquivo de áudio
   */
  hasAudio(): boolean {
    return !!this.audioUrl;
  }

  /**
   * Verifica se tem imagem de capa
   */
  hasImage(): boolean {
    return !!this.imageUrl;
  }

  /**
   * Retorna a duração formatada em mm:ss
   */
  getFormattedDuration(): string {
    if (!this.duration) return '00:00';
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}