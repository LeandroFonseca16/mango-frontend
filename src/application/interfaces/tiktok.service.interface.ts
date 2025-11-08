/**
 * Interface para dados de tendência do TikTok
 */
export interface TikTokTrendData {
  hashtag: string;
  title: string;
  description?: string;
  videoCount: number;
  viewCount: number;
  category?: string;
  region?: string;
  relatedHashtags: string[];
  engagementRate: number;
  averageViews: number;
  peakDate?: Date;
}

/**
 * Interface para dados de vídeo do TikTok
 */
export interface TikTokVideoData {
  id: string;
  url: string;
  title: string;
  description: string;
  hashtags: string[];
  views: number;
  likes: number;
  shares: number;
  comments: number;
  author: {
    username: string;
    displayName: string;
    followersCount: number;
  };
  createdAt: Date;
}

/**
 * Interface para upload de vídeo no TikTok
 */
export interface TikTokUploadParams {
  videoUrl: string;
  title: string;
  description: string;
  hashtags: string[];
  privacy: 'public' | 'followers' | 'private';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
}

/**
 * Interface para resposta de upload
 */
export interface TikTokUploadResponse {
  videoId: string;
  url: string;
  status: 'uploaded' | 'processing' | 'published' | 'failed';
  message?: string;
}

/**
 * Interface para serviço de integração com TikTok
 * Abstrai a API do TikTok para análise de tendências e upload de conteúdo
 */
export interface ITikTokService {
  /**
   * Obtém tendências atuais do TikTok
   */
  getTrendingHashtags(region?: string, count?: number): Promise<TikTokTrendData[]>;

  /**
   * Busca dados de uma hashtag específica
   */
  getHashtagData(hashtag: string, region?: string): Promise<TikTokTrendData | null>;

  /**
   * Busca vídeos de uma hashtag
   */
  getHashtagVideos(
    hashtag: string, 
    count?: number, 
    offset?: number
  ): Promise<TikTokVideoData[]>;

  /**
   * Analisa o engajamento de uma hashtag
   */
  analyzeHashtagEngagement(hashtag: string): Promise<{
    totalViews: number;
    averageViews: number;
    totalVideos: number;
    engagementRate: number;
    growthRate: number;
    peakHours: number[];
  }>;

  /**
   * Sugere hashtags relacionadas
   */
  suggestRelatedHashtags(hashtag: string, count?: number): Promise<string[]>;

  /**
   * Faz upload de vídeo para o TikTok (requer autenticação do usuário)
   */
  uploadVideo(
    params: TikTokUploadParams, 
    accessToken: string
  ): Promise<TikTokUploadResponse>;

  /**
   * Verifica o status de um upload
   */
  checkUploadStatus(videoId: string, accessToken: string): Promise<{
    status: 'processing' | 'published' | 'failed';
    url?: string;
    error?: string;
  }>;

  /**
   * Obtém estatísticas de performance de um vídeo
   */
  getVideoStats(videoId: string, accessToken: string): Promise<{
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  }>;
}