import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ITrendRepository, CreateTrendData } from '../../domain/repositories/trend.repository.interface';
import { Trend, TrendMetadata } from '../../domain/entities/trend.entity';

/**
 * Implementação do repositório de tendências usando Prisma
 */
@Injectable()
export class TrendRepository implements ITrendRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova tendência
   */
  async create(trendData: CreateTrendData): Promise<Trend> {
    const prismaTrend = await this.prisma.trend.create({
      data: {
        ...trendData,
        videoCount: trendData.videoCount || 0,
        viewCount: trendData.viewCount || BigInt(0),
        isActive: trendData.isActive ?? true,
        metadata: trendData.metadata as any,
      },
    });

    return this.mapToEntity(prismaTrend);
  }

  /**
   * Busca tendência por ID
   */
  async findById(id: string): Promise<Trend | null> {
    const prismaTrend = await this.prisma.trend.findUnique({
      where: { id },
    });

    return prismaTrend ? this.mapToEntity(prismaTrend) : null;
  }

  /**
   * Busca tendência por hashtag
   */
  async findByHashtag(hashtag: string): Promise<Trend | null> {
    const prismaTrend = await this.prisma.trend.findUnique({
      where: { hashtag: hashtag.replace(/^#/, '') }, // Remove # se presente
    });

    return prismaTrend ? this.mapToEntity(prismaTrend) : null;
  }

  /**
   * Busca tendências ativas
   */
  async findActive(skip: number = 0, take: number = 20): Promise<Trend[]> {
    const prismaTrends = await this.prisma.trend.findMany({
      where: { isActive: true },
      skip,
      take,
      orderBy: { updatedAt: 'desc' },
    });

    return prismaTrends.map((trend: any) => this.mapToEntity(trend));
  }

  /**
   * Busca tendências por categoria
   */
  async findByCategory(category: string, skip: number = 0, take: number = 20): Promise<Trend[]> {
    const prismaTrends = await this.prisma.trend.findMany({
      where: { 
        category: {
          contains: category,
          mode: 'insensitive',
        },
        isActive: true,
      },
      skip,
      take,
      orderBy: { viewCount: 'desc' },
    });

    return prismaTrends.map((trend: any) => this.mapToEntity(trend));
  }

  /**
   * Busca tendências populares (ordenado por visualizações)
   */
  async findPopular(limit: number = 20): Promise<Trend[]> {
    const prismaTrends = await this.prisma.trend.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { viewCount: 'desc' },
    });

    return prismaTrends.map((trend: any) => this.mapToEntity(trend));
  }

  /**
   * Busca tendências recentes
   */
  async findRecent(limit: number = 10): Promise<Trend[]> {
    const prismaTrends = await this.prisma.trend.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return prismaTrends.map((trend: any) => this.mapToEntity(trend));
  }

  /**
   * Busca tendências em ascensão (crescimento nas últimas 24h)
   */
  async findTrending(limit: number = 10): Promise<Trend[]> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const prismaTrends = await this.prisma.trend.findMany({
      where: { 
        isActive: true,
        updatedAt: { gte: oneDayAgo },
      },
      take: limit,
      orderBy: [
        { videoCount: 'desc' },
        { viewCount: 'desc' },
      ],
    });

    return prismaTrends.map((trend: any) => this.mapToEntity(trend));
  }

  /**
   * Atualiza dados da tendência
   */
  async update(id: string, data: Partial<CreateTrendData>): Promise<Trend> {
    const updateData: any = { ...data };
    
    if (data.metadata) {
      updateData.metadata = data.metadata;
    }

    const prismaTrend = await this.prisma.trend.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(prismaTrend);
  }

  /**
   * Atualiza estatísticas da tendência
   */
  async updateStats(id: string, videoCount: number, viewCount: bigint): Promise<Trend> {
    const prismaTrend = await this.prisma.trend.update({
      where: { id },
      data: {
        videoCount,
        viewCount,
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(prismaTrend);
  }

  /**
   * Remove tendência
   */
  async delete(id: string): Promise<void> {
    await this.prisma.trend.delete({
      where: { id },
    });
  }

  /**
   * Desativa tendência
   */
  async deactivate(id: string): Promise<void> {
    await this.prisma.trend.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Lista tendências com paginação
   */
  async findMany(skip: number = 0, take: number = 20): Promise<Trend[]> {
    const prismaTrends = await this.prisma.trend.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaTrends.map((trend: any) => this.mapToEntity(trend));
  }

  /**
   * Conta tendências ativas
   */
  async countActive(): Promise<number> {
    return this.prisma.trend.count({
      where: { isActive: true },
    });
  }

  /**
   * Busca por texto (título, descrição, hashtag)
   */
  async search(query: string, skip: number = 0, take: number = 20): Promise<Trend[]> {
    const prismaTrends = await this.prisma.trend.findMany({
      where: {
        OR: [
          {
            hashtag: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        isActive: true,
      },
      skip,
      take,
      orderBy: { viewCount: 'desc' },
    });

    return prismaTrends.map((trend: any) => this.mapToEntity(trend));
  }

  /**
   * Mapeia dados do Prisma para entidade do domínio
   */
  private mapToEntity(prismaTrend: any): Trend {
    return new Trend(
      prismaTrend.id,
      prismaTrend.hashtag,
      prismaTrend.title,
      prismaTrend.description,
      prismaTrend.videoCount,
      prismaTrend.viewCount,
      prismaTrend.category,
      prismaTrend.isActive,
      prismaTrend.metadata as TrendMetadata,
      prismaTrend.createdAt,
      prismaTrend.updatedAt,
    );
  }
}