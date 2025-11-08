import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { AnalyzeTrendsUseCase } from '../../application/usecases/analyze-trends.usecase';
import { ITrendRepository } from '../../domain/repositories/trend.repository.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Trend } from '../../domain/entities/trend.entity';
import { TREND_REPOSITORY } from '../../infrastructure/di-tokens';

/**
 * DTO para resposta de tendência
 */
export class TrendResponseDto {
  id: string;
  hashtag: string;
  title: string;
  description?: string;
  videoCount: number;
  viewCount: string; // Como string para evitar problemas com BigInt
  category?: string;
  isActive: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Controlador para gerenciamento de tendências do TikTok
 */
@Controller('trends')
export class TrendController {
  constructor(
    private readonly analyzeTrendsUseCase: AnalyzeTrendsUseCase,
    @Inject(TREND_REPOSITORY)
    private readonly trendRepository: ITrendRepository,
  ) {}

  /**
   * Obtém tendências populares
   * GET /trends/popular
   */
  @Get('popular')
  async getPopular(
    @Query('limit') limit: number = 20,
  ): Promise<TrendResponseDto[]> {
    try {
      const trends = await this.analyzeTrendsUseCase.getPopularTrends(Number(limit));
      return trends.map(trend => this.mapToResponseDto(trend));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar tendências populares');
    }
  }

  /**
   * Obtém tendências em alta no momento
   * GET /trends/trending
   */
  @Get('trending')
  async getTrending(
    @Query('limit') limit: number = 10,
  ): Promise<TrendResponseDto[]> {
    try {
      const trends = await this.analyzeTrendsUseCase.getTrendingNow(Number(limit));
      return trends.map(trend => this.mapToResponseDto(trend));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar tendências em alta');
    }
  }

  /**
   * Busca tendências por categoria
   * GET /trends/category/:category
   */
  @Get('category/:category')
  async getByCategory(
    @Param('category') category: string,
    @Query('limit') limit: number = 20,
  ): Promise<TrendResponseDto[]> {
    try {
      const trends = await this.analyzeTrendsUseCase.getTrendsByCategory(
        category,
        Number(limit),
      );
      return trends.map(trend => this.mapToResponseDto(trend));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar tendências por categoria');
    }
  }

  /**
   * Busca uma hashtag específica
   * GET /trends/hashtag/:hashtag
   */
  @Get('hashtag/:hashtag')
  async getByHashtag(@Param('hashtag') hashtag: string): Promise<TrendResponseDto> {
    try {
      const trend = await this.analyzeTrendsUseCase.analyzeSpecificHashtag(hashtag);
      return this.mapToResponseDto(trend);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao analisar hashtag');
    }
  }

  /**
   * Busca tendências (com filtros de texto)
   * GET /trends/search
   */
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<TrendResponseDto[]> {
    try {
      if (!query?.trim()) {
        throw new Error('Parâmetro de busca é obrigatório');
      }

      const trends = await this.trendRepository.search(
        query.trim(),
        Number(skip),
        Number(take),
      );
      
      return trends.map(trend => this.mapToResponseDto(trend));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar tendências');
    }
  }

  /**
   * Lista todas as tendências ativas
   * GET /trends
   */
  @Get()
  async getActive(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ): Promise<TrendResponseDto[]> {
    try {
      const trends = await this.trendRepository.findActive(
        Number(skip),
        Number(take),
      );
      
      return trends.map(trend => this.mapToResponseDto(trend));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar tendências');
    }
  }

  /**
   * Inicia análise de tendências (requer autenticação)
   * POST /trends/analyze
   */
  @Post('analyze')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async analyze(
    @Query('region') region?: string,
  ): Promise<{ message: string; jobId: string }> {
    try {
      const result = await this.analyzeTrendsUseCase.execute(region);
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao iniciar análise de tendências');
    }
  }

  /**
   * Obtém estatísticas gerais das tendências
   * GET /trends/stats
   */
  @Get('stats')
  async getStats(): Promise<{
    totalActive: number;
    totalTrends: number;
    categoriesCount: Record<string, number>;
  }> {
    try {
      const totalActive = await this.trendRepository.countActive();
      const allTrends = await this.trendRepository.findMany(0, 1000); // Busca muitas para estatísticas
      
      // Conta por categoria
      const categoriesCount: Record<string, number> = {};
      allTrends.forEach(trend => {
        if (trend.category) {
          categoriesCount[trend.category] = (categoriesCount[trend.category] || 0) + 1;
        }
      });

      return {
        totalActive,
        totalTrends: allTrends.length,
        categoriesCount,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao obter estatísticas');
    }
  }

  /**
   * Mapeia entidade Trend para DTO de resposta
   */
  private mapToResponseDto(trend: Trend): TrendResponseDto {
    return {
      id: trend.id,
      hashtag: trend.hashtag,
      title: trend.title,
      description: trend.description,
      videoCount: trend.videoCount,
      viewCount: trend.viewCount.toString(), // Converte BigInt para string
      category: trend.category,
      isActive: trend.isActive,
      metadata: trend.metadata,
      createdAt: trend.createdAt!,
      updatedAt: trend.updatedAt!,
    };
  }
}