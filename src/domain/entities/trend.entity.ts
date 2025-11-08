/**
 * Interface para metadados de tendência
 */
export interface TrendMetadata {
  platform?: string;
  region?: string;
  language?: string;
  relatedHashtags?: string[];
  engagementRate?: number;
  averageViews?: number;
  peakDate?: Date;
}

/**
 * Entidade Trend do domínio
 * Representa uma tendência do TikTok/redes sociais
 */
export class Trend {
  constructor(
    public readonly id: string,
    public readonly hashtag: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly videoCount: number = 0,
    public readonly viewCount: bigint = BigInt(0),
    public readonly category?: string,
    public readonly isActive: boolean = true,
    public readonly metadata?: TrendMetadata,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  /**
   * Verifica se a tendência está ativa
   */
  isActiveTrend(): boolean {
    return this.isActive;
  }

  /**
   * Calcula a média de visualizações por vídeo
   */
  getAverageViewsPerVideo(): number {
    if (this.videoCount === 0) return 0;
    return Number(this.viewCount) / this.videoCount;
  }

  /**
   * Formata o número de visualizações para exibição
   */
  getFormattedViewCount(): string {
    const views = Number(this.viewCount);
    
    if (views >= 1_000_000_000) {
      return `${(views / 1_000_000_000).toFixed(1)}B`;
    } else if (views >= 1_000_000) {
      return `${(views / 1_000_000).toFixed(1)}M`;
    } else if (views >= 1_000) {
      return `${(views / 1_000).toFixed(1)}K`;
    }
    
    return views.toString();
  }

  /**
   * Verifica se é uma tendência popular (mais de 1M de visualizações)
   */
  isPopular(): boolean {
    return Number(this.viewCount) >= 1_000_000;
  }

  /**
   * Verifica se é uma tendência viral (mais de 100M de visualizações)
   */
  isViral(): boolean {
    return Number(this.viewCount) >= 100_000_000;
  }

  /**
   * Calcula a idade da tendência em dias
   */
  getAgeInDays(): number {
    if (!this.createdAt) return 0;
    const now = new Date();
    const diffTime = now.getTime() - this.createdAt.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}