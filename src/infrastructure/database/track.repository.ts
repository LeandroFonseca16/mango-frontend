import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ITrackRepository, CreateTrackData } from '../../domain/repositories/track.repository.interface';
import { Track, TrackStatus, TrackMetadata } from '../../domain/entities/track.entity';

/**
 * Implementação do repositório de tracks usando Prisma
 */
@Injectable()
export class TrackRepository implements ITrackRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma nova track
   */
  async create(trackData: CreateTrackData): Promise<Track> {
    const prismaTrack = await this.prisma.track.create({
      data: {
        ...trackData,
        tags: trackData.tags || [],
        status: trackData.status || TrackStatus.PROCESSING,
        metadata: trackData.metadata as any,
      },
    });

    return this.mapToEntity(prismaTrack);
  }

  /**
   * Busca track por ID
   */
  async findById(id: string): Promise<Track | null> {
    const prismaTrack = await this.prisma.track.findUnique({
      where: { id },
    });

    return prismaTrack ? this.mapToEntity(prismaTrack) : null;
  }

  /**
   * Busca tracks por usuário
   */
  async findByUserId(userId: string, skip: number = 0, take: number = 10): Promise<Track[]> {
    const prismaTracks = await this.prisma.track.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaTracks.map((track: any) => this.mapToEntity(track));
  }

  /**
   * Busca tracks por status
   */
  async findByStatus(status: TrackStatus, skip: number = 0, take: number = 10): Promise<Track[]> {
    const prismaTracks = await this.prisma.track.findMany({
      where: { status },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaTracks.map((track: any) => this.mapToEntity(track));
  }

  /**
   * Busca tracks por gênero
   */
  async findByGenre(genre: string, skip: number = 0, take: number = 10): Promise<Track[]> {
    const prismaTracks = await this.prisma.track.findMany({
      where: { 
        genre: {
          contains: genre,
          mode: 'insensitive',
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaTracks.map((track: any) => this.mapToEntity(track));
  }

  /**
   * Busca tracks por tags
   */
  async findByTags(tags: string[], skip: number = 0, take: number = 10): Promise<Track[]> {
    const prismaTracks = await this.prisma.track.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaTracks.map((track: any) => this.mapToEntity(track));
  }

  /**
   * Atualiza dados da track
   */
  async update(id: string, data: Partial<CreateTrackData>): Promise<Track> {
    const updateData: any = { ...data };
    
    // Converte metadata para JSON se presente
    if (data.metadata) {
      updateData.metadata = data.metadata;
    }

    const prismaTrack = await this.prisma.track.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(prismaTrack);
  }

  /**
   * Remove track
   */
  async delete(id: string): Promise<void> {
    await this.prisma.track.delete({
      where: { id },
    });
  }

  /**
   * Lista todas as tracks com paginação
   */
  async findMany(skip: number = 0, take: number = 10): Promise<Track[]> {
    const prismaTracks = await this.prisma.track.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return prismaTracks.map((track: any) => this.mapToEntity(track));
  }

  /**
   * Conta tracks por usuário
   */
  async countByUserId(userId: string): Promise<number> {
    return this.prisma.track.count({
      where: { userId },
    });
  }

  /**
   * Busca tracks recentes
   */
  async findRecent(limit: number = 10): Promise<Track[]> {
    const prismaTracks = await this.prisma.track.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: {
        status: TrackStatus.COMPLETED,
      },
    });

    return prismaTracks.map((track: any) => this.mapToEntity(track));
  }

  /**
   * Mapeia dados do Prisma para entidade do domínio
   */
  private mapToEntity(prismaTrack: any): Track {
    return new Track(
      prismaTrack.id,
      prismaTrack.title,
      prismaTrack.userId,
      prismaTrack.description,
      prismaTrack.audioUrl,
      prismaTrack.imageUrl,
      prismaTrack.genre,
      prismaTrack.tags || [],
      prismaTrack.duration,
      prismaTrack.status as TrackStatus,
      prismaTrack.metadata as TrackMetadata,
      prismaTrack.createdAt,
      prismaTrack.updatedAt,
    );
  }
}