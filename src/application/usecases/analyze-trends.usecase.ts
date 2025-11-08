import { Trend } from '../../domain/entities/trend.entity';
import { ITrendRepository } from '../../domain/repositories/trend.repository.interface';
import { ITikTokService } from '../interfaces/tiktok.service.interface';
import { IJobRepository } from '../../domain/repositories/job.repository.interface';
import { IQueueService } from '../interfaces/queue.service.interface';
import { JobType } from '../../domain/entities/job.entity';

/**
 * Use case para analisar tendências do TikTok
 * Implementa a lógica para coletar e analisar dados de trending hashtags
 */
export class AnalyzeTrendsUseCase {
  constructor(
    private readonly trendRepository: ITrendRepository,
    private readonly tikTokService: ITikTokService,
    private readonly jobRepository: IJobRepository,
    private readonly queueService: IQueueService,
  ) {}

  /**
   * Inicia análise completa de tendências
   */
  async execute(region?: string): Promise<{ message: string; jobId: string }> {
    // Cria job para análise de tendências
    const jobData = {
      type: JobType.TREND_ANALYSIS,
      data: {
        region: region || 'global',
        analysisType: 'complete',
        timestamp: new Date().toISOString(),
      },
      priority: 3,
    };

    const job = await this.jobRepository.create(jobData);

    // Adiciona à fila de processamento
    const queueJobId = await this.queueService.addJob(
      'trend-analysis',
      'analyze-trends',
      {
        jobId: job.id,
        region: region || 'global',
      },
      {
        priority: 3,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
      }
    );

    return {
      message: 'Análise de tendências iniciada',
      jobId: job.id,
    };
  }

  /**
   * Processa a análise de tendências (chamado pelo worker da fila)
   */
  async processAnalysis(region: string): Promise<void> {
    try {
      // Obtém tendências atuais do TikTok
      const trendingData = await this.tikTokService.getTrendingHashtags(region, 50);

      // Processa cada hashtag
      for (const trendData of trendingData) {
        await this.processTrendHashtag(trendData, region);
      }

      // Remove tendências inativas há mais de 7 dias
      await this.cleanupInactiveTrends();

    } catch (error) {
      console.error('Erro na análise de tendências:', error);
      throw error;
    }
  }

  /**
   * Processa uma hashtag específica
   */
  private async processTrendHashtag(trendData: any, region: string): Promise<void> {
    // Verifica se já existe no banco
    const existingTrend = await this.trendRepository.findByHashtag(trendData.hashtag);

    if (existingTrend) {
      // Atualiza dados existentes
      await this.trendRepository.updateStats(
        existingTrend.id,
        trendData.videoCount,
        BigInt(trendData.viewCount)
      );

      // Atualiza outros dados se necessário
      if (trendData.title !== existingTrend.title || 
          trendData.description !== existingTrend.description) {
        await this.trendRepository.update(existingTrend.id, {
          title: trendData.title,
          description: trendData.description,
          category: trendData.category,
          isActive: true,
          metadata: {
            ...existingTrend.metadata,
            region,
            relatedHashtags: trendData.relatedHashtags,
            engagementRate: trendData.engagementRate,
            averageViews: trendData.averageViews,
          },
        });
      }
    } else {
      // Cria nova tendência
      await this.trendRepository.create({
        hashtag: trendData.hashtag,
        title: trendData.title,
        description: trendData.description,
        videoCount: trendData.videoCount,
        viewCount: BigInt(trendData.viewCount),
        category: trendData.category,
        isActive: true,
        metadata: {
          platform: 'tiktok',
          region,
          relatedHashtags: trendData.relatedHashtags,
          engagementRate: trendData.engagementRate,
          averageViews: trendData.averageViews,
          peakDate: trendData.peakDate,
        },
      });
    }
  }

  /**
   * Analisa uma hashtag específica
   */
  async analyzeSpecificHashtag(hashtag: string, region?: string): Promise<Trend> {
    // Remove # se presente
    const cleanHashtag = hashtag.replace(/^#/, '');

    // Busca dados no TikTok
    const trendData = await this.tikTokService.getHashtagData(cleanHashtag, region);
    
    if (!trendData) {
      throw new Error('Hashtag não encontrada ou sem dados disponíveis');
    }

    // Verifica se já existe
    let trend = await this.trendRepository.findByHashtag(cleanHashtag);

    if (trend) {
      // Atualiza dados
      await this.trendRepository.updateStats(
        trend.id,
        trendData.videoCount,
        BigInt(trendData.viewCount)
      );

      trend = await this.trendRepository.findById(trend.id);
    } else {
      // Cria nova
      trend = await this.trendRepository.create({
        hashtag: cleanHashtag,
        title: trendData.title,
        description: trendData.description,
        videoCount: trendData.videoCount,
        viewCount: BigInt(trendData.viewCount),
        category: trendData.category,
        metadata: {
          platform: 'tiktok',
          region: region || 'global',
          relatedHashtags: trendData.relatedHashtags,
          engagementRate: trendData.engagementRate,
          averageViews: trendData.averageViews,
        },
      });
    }

    return trend!;
  }

  /**
   * Obtém tendências populares
   */
  async getPopularTrends(limit: number = 20): Promise<Trend[]> {
    return this.trendRepository.findPopular(limit);
  }

  /**
   * Obtém tendências em alta (crescimento recente)
   */
  async getTrendingNow(limit: number = 10): Promise<Trend[]> {
    return this.trendRepository.findTrending(limit);
  }

  /**
   * Busca tendências por categoria
   */
  async getTrendsByCategory(category: string, limit: number = 20): Promise<Trend[]> {
    return this.trendRepository.findByCategory(category, 0, limit);
  }

  /**
   * Remove tendências inativas há mais de X dias
   */
  private async cleanupInactiveTrends(daysThreshold: number = 7): Promise<void> {
    const trends = await this.trendRepository.findActive();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    for (const trend of trends) {
      if (trend.updatedAt && trend.updatedAt < cutoffDate) {
        await this.trendRepository.deactivate(trend.id);
      }
    }
  }
}