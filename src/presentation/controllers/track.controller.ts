import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { CreateTrackUseCase } from '../../application/usecases/create-track.usecase';
import { ITrackRepository } from '../../domain/repositories/track.repository.interface';
import { IQueueService } from '../../application/interfaces/queue.service.interface';
import { MusicGenService } from '../../infrastructure/external-services/musicgen.service';
import {
  CreateTrackDto,
  GenerateTrackDto,
  TrackResponseDto,
  UpdateTrackDto,
  TrackFiltersDto,
} from '../dto/track.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TRACK_REPOSITORY, QUEUE_SERVICE } from '../../infrastructure/di-tokens';

/**
 * Controlador para gerenciamento de tracks/músicas
 * Implementa CRUD completo com autenticação
 */
@Controller('tracks')
@UseGuards(JwtAuthGuard)
export class TrackController {
  constructor(
    private readonly createTrackUseCase: CreateTrackUseCase,
    @Inject(TRACK_REPOSITORY) 
    private readonly trackRepository: ITrackRepository,
    @Inject(QUEUE_SERVICE)
    private readonly queueService: IQueueService,
    private readonly musicGenService: MusicGenService,
  ) {}

  /**
   * Cria uma nova track
   * POST /tracks
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTrackDto: CreateTrackDto,
    @Request() req: any,
  ): Promise<TrackResponseDto> {
    try {
      const track = await this.createTrackUseCase.execute({
        ...createTrackDto,
        userId: req.user.userId,
      });

      return this.mapToResponseDto(track);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar track');
    }
  }

  /**
   * Gera uma nova track com IA
   * POST /tracks/generate
   */
  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generateTrack(
    @Body() generateTrackDto: GenerateTrackDto,
    @Request() req: any,
  ): Promise<{ 
    message: string; 
    trackId: string; 
    jobId?: string;
    estimatedTime: string;
  }> {
    try {
      const userId = req.user.userId;

      // Cria track inicial com status PROCESSING
      const track = await this.createTrackUseCase.execute({
        title: generateTrackDto.title,
        description: generateTrackDto.description,
        genre: generateTrackDto.genre,
        tags: generateTrackDto.tags,
        audioPrompt: generateTrackDto.audioPrompt,
        imagePrompt: generateTrackDto.imagePrompt,
        userId,
      });

      // Adiciona job de geração na fila
      const jobId = await this.queueService.addJob(
        'track-generation',
        'generate-track',
        {
          trackId: track.id,
          userId,
          audioParams: {
            prompt: generateTrackDto.audioPrompt,
            genre: generateTrackDto.genre || 'trap',
            bpm: generateTrackDto.bpm || 140,
            duration: generateTrackDto.duration || 60,
            key: generateTrackDto.key || 'C',
            mood: generateTrackDto.mood || 'energetic',
          },
          imageParams: generateTrackDto.imagePrompt ? {
            prompt: generateTrackDto.imagePrompt,
            style: 'artistic',
            aspectRatio: '1:1',
            quality: 'hd',
          } : null,
        },
        {
          priority: 10,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );

      return {
        message: 'Track generation started successfully',
        trackId: track.id,
        jobId,
        estimatedTime: '2-5 minutes',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao iniciar geração de track');
    }
  }

  /**
   * Lista tracks do usuário autenticado
   * GET /tracks/my
   */
  @Get('my')
  async getMyTracks(
    @Request() req: any,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<TrackResponseDto[]> {
    try {
      const tracks = await this.trackRepository.findByUserId(
        req.user.userId,
        Number(skip),
        Number(take),
      );

      return tracks.map(track => this.mapToResponseDto(track));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar tracks');
    }
  }

  /**
   * Busca track por ID
   * GET /tracks/:id
   */
  @Get(':id')
  async getById(@Param('id') id: string): Promise<TrackResponseDto> {
    try {
      const track = await this.trackRepository.findById(id);
      
      if (!track) {
        throw new Error('Track não encontrada');
      }

      return this.mapToResponseDto(track);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar track');
    }
  }

  /**
   * Lista tracks públicas/recentes
   * GET /tracks
   */
  @Get()
  async getPublicTracks(
    @Query() filters: TrackFiltersDto,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<TrackResponseDto[]> {
    try {
      let tracks;

      if (filters.genre) {
        tracks = await this.trackRepository.findByGenre(
          filters.genre,
          Number(skip),
          Number(take),
        );
      } else if (filters.tags?.length) {
        tracks = await this.trackRepository.findByTags(
          filters.tags,
          Number(skip),
          Number(take),
        );
      } else if (filters.status) {
        tracks = await this.trackRepository.findByStatus(
          filters.status,
          Number(skip),
          Number(take),
        );
      } else {
        tracks = await this.trackRepository.findRecent(Number(take));
      }

      return tracks.map(track => this.mapToResponseDto(track));
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao buscar tracks');
    }
  }

  /**
   * Atualiza uma track
   * PUT /tracks/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTrackDto: UpdateTrackDto,
    @Request() req: any,
  ): Promise<TrackResponseDto> {
    try {
      // Verifica se a track existe e pertence ao usuário
      const existingTrack = await this.trackRepository.findById(id);
      
      if (!existingTrack) {
        throw new Error('Track não encontrada');
      }

      if (existingTrack.userId !== req.user.userId) {
        throw new Error('Não autorizado a editar esta track');
      }

      const updatedTrack = await this.trackRepository.update(id, updateTrackDto);
      return this.mapToResponseDto(updatedTrack);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao atualizar track');
    }
  }

  /**
   * Remove uma track
   * DELETE /tracks/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: any): Promise<void> {
    try {
      // Verifica se a track existe e pertence ao usuário
      const existingTrack = await this.trackRepository.findById(id);
      
      if (!existingTrack) {
        throw new Error('Track não encontrada');
      }

      if (existingTrack.userId !== req.user.userId) {
        throw new Error('Não autorizado a remover esta track');
      }

      await this.trackRepository.delete(id);
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao remover track');
    }
  }

  /**
   * Mapeia entidade Track para DTO de resposta
   */
  private mapToResponseDto(track: any): TrackResponseDto {
    return {
      id: track.id,
      title: track.title,
      description: track.description,
      audioUrl: track.audioUrl,
      imageUrl: track.imageUrl,
      genre: track.genre,
      tags: track.tags || [],
      duration: track.duration,
      status: track.status,
      metadata: track.metadata,
      userId: track.userId,
      createdAt: track.createdAt!,
      updatedAt: track.updatedAt!,
    };
  }
}