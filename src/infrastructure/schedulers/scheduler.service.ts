import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ITikTokService } from '../../application/interfaces/tiktok.service.interface';
import { IQueueService } from '../../application/interfaces/queue.service.interface';
import { ITrendRepository } from '../../domain/repositories/trend.repository.interface';
import { ITrackRepository } from '../../domain/repositories/track.repository.interface';
import { TrackStatus } from '../../domain/entities/track.entity';
import { 
  TIKTOK_SERVICE, 
  QUEUE_SERVICE, 
  TREND_REPOSITORY,
  TRACK_REPOSITORY
} from '../di-tokens';

/**
 * Serviço de agendamento para tarefas automáticas
 * Executa tarefas em background de forma periódica
 */
@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @Inject(TIKTOK_SERVICE)
    private readonly tikTokService: ITikTokService,
    @Inject(QUEUE_SERVICE)
    private readonly queueService: IQueueService,
    @Inject(TREND_REPOSITORY)
    private readonly trendRepository: ITrendRepository,
    @Inject(TRACK_REPOSITORY)
    private readonly trackRepository: ITrackRepository,
  ) {}

  /**
   * Tarefa diária: Análise de tendências do TikTok
   * Executa todos os dias às 08:00 UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async analyzeDailyTrends(): Promise<void> {
    this.logger.log('Starting daily trends analysis...');

    try {
      // Busca as tendências atuais do TikTok
      const trendingHashtags = await this.tikTokService.getTrendingHashtags('global', 20);
      
      this.logger.log(`Found ${trendingHashtags.length} trending hashtags`);

      for (const trendData of trendingHashtags) {
        try {
          // Verifica se a tendência já existe no banco
          const existingTrend = await this.trendRepository.findByHashtag(trendData.hashtag);

          if (existingTrend) {
            // Atualiza dados da tendência existente
            await this.trendRepository.update(existingTrend.id, {
              videoCount: trendData.videoCount,
              viewCount: BigInt(trendData.viewCount),
              isActive: true,
              metadata: {
                ...existingTrend.metadata,
                engagementRate: trendData.engagementRate,
                averageViews: trendData.averageViews,
                relatedHashtags: trendData.relatedHashtags,
                region: trendData.region,
              },
            });

            this.logger.debug(`Updated trend: ${trendData.hashtag}`);
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
                engagementRate: trendData.engagementRate,
                averageViews: trendData.averageViews,
                relatedHashtags: trendData.relatedHashtags,
                peakDate: trendData.peakDate,
                region: trendData.region,
              },
            });

            this.logger.debug(`Created new trend: ${trendData.hashtag}`);
          }
        } catch (error) {
          this.logger.error(`Error processing trend ${trendData.hashtag}:`, error);
        }
      }

      this.logger.log('Daily trends analysis completed successfully');
    } catch (error) {
      this.logger.error('Error in daily trends analysis:', error);
    }
  }

  /**
   * Tarefa de limpeza: Remove jobs antigos completados
   * Executa todos os dias às 02:00 UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldData(): Promise<void> {
    this.logger.log('Starting daily cleanup...');

    try {
      // Remove jobs completados há mais de 7 dias
      const cleanedJobsCount = await this.cleanupOldJobs(7);
      
      // Desativa tendências antigas (sem atividade há mais de 30 dias)
      const deactivatedTrendsCount = await this.deactivateOldTrends(30);

      this.logger.log(`Cleanup completed: ${cleanedJobsCount} jobs removed, ${deactivatedTrendsCount} trends deactivated`);
    } catch (error) {
      this.logger.error('Error in daily cleanup:', error);
    }
  }

  /**
   * Tarefa de análise: Gera sugestões de tracks baseadas em tendências
   * Executa todos os dias às 12:00 UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async generateTrendBasedSuggestions(): Promise<void> {
    this.logger.log('Starting trend-based suggestions generation...');

    try {
      // Busca as top 5 tendências mais engajadas
      const topTrends = await this.trendRepository.findMany(0, 5);
      
      for (const trend of topTrends) {
        // Analisa engajamento da hashtag
        const engagement = await this.tikTokService.analyzeHashtagEngagement(trend.hashtag);
        
        // Se o engajamento for alto, adiciona job para gerar track sugerida
        if (engagement.engagementRate > 7.0 && engagement.growthRate > 20) {
          await this.queueService.addJob(
            'track-suggestions',
            'generate-trend-suggestion',
            {
              hashtag: trend.hashtag,
              category: trend.category,
              engagement,
              suggestedGenre: this.mapCategoryToGenre(trend.category),
            },
            {
              priority: 5, // Prioridade média
              delay: Math.random() * 3600000, // Delay aleatório até 1h
            }
          );

          this.logger.debug(`Added suggestion job for trend: ${trend.hashtag}`);
        }
      }

      this.logger.log('Trend-based suggestions generation completed');
    } catch (error) {
      this.logger.error('Error in trend suggestions generation:', error);
    }
  }

  /**
   * Tarefa de monitoramento: Verifica status de tracks em processamento
   * Executa a cada 15 minutos
   */
  @Cron('*/15 * * * *')
  async monitorProcessingTracks(): Promise<void> {
    try {
      // Busca tracks que estão em processamento há mais de 10 minutos
      const stuckTracks = await this.findStuckTracks(10);
      
      if (stuckTracks.length > 0) {
        this.logger.warn(`Found ${stuckTracks.length} potentially stuck tracks`);
        
        for (const track of stuckTracks) {
          // Marca como falhada tracks que estão presas há muito tempo
          if (this.isTrackStuckTooLong(track.createdAt, 30)) {
            await this.trackRepository.update(track.id, {
              status: TrackStatus.FAILED,
              metadata: {
                ...track.metadata,
                generationParams: {
                  ...track.metadata?.generationParams,
                  error: 'Processing timeout - track stuck for too long',
                  failedAt: new Date().toISOString(),
                },
              },
            });

            this.logger.warn(`Marked stuck track as failed: ${track.id}`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error monitoring processing tracks:', error);
    }
  }

  /**
   * Remove jobs antigos completados
   */
  private async cleanupOldJobs(olderThanDays: number): Promise<number> {
    // Esta implementação dependeria do método no repositório
    // Por enquanto, retorna 0 como mock
    this.logger.debug(`Cleanup jobs older than ${olderThanDays} days`);
    return 0;
  }

  /**
   * Desativa tendências antigas sem atividade
   */
  private async deactivateOldTrends(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    // Implementação mock - em produção seria uma query no banco
    this.logger.debug(`Deactivate trends older than ${olderThanDays} days`);
    return 0;
  }

  /**
   * Busca tracks que podem estar presas no processamento
   */
  private async findStuckTracks(minutesAgo: number): Promise<any[]> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutesAgo);
    
    // Mock implementation - retorna array vazio
    // Em produção, buscaria tracks com status PROCESSING criadas antes do cutoffTime
    return [];
  }

  /**
   * Verifica se uma track está presa há muito tempo
   */
  private isTrackStuckTooLong(createdAt: Date, minutesThreshold: number): boolean {
    const now = new Date();
    const diffMinutes = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60);
    return diffMinutes > minutesThreshold;
  }

  /**
   * Mapeia categoria de tendência para gênero musical
   */
  private mapCategoryToGenre(category?: string): string {
    const categoryMapping = {
      'music': 'trap',
      'dance': 'phonk',
      'gaming': 'drill',
      'lifestyle': 'lofi',
    };

    return categoryMapping[category?.toLowerCase() || 'music'] || 'trap';
  }

  /**
   * Método para teste - força execução da análise de tendências
   */
  async forceAnalyzeTrends(): Promise<void> {
    this.logger.log('Force executing trends analysis...');
    await this.analyzeDailyTrends();
  }

  /**
   * Método para teste - força limpeza de dados
   */
  async forceCleanup(): Promise<void> {
    this.logger.log('Force executing cleanup...');
    await this.cleanupOldData();
  }
}