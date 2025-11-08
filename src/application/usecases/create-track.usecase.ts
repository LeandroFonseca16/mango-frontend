import { Track } from '../../domain/entities/track.entity';
import { ITrackRepository, CreateTrackData } from '../../domain/repositories/track.repository.interface';
import { IJobRepository } from '../../domain/repositories/job.repository.interface';
import { IQueueService } from '../interfaces/queue.service.interface';
import { JobType } from '../../domain/entities/job.entity';

/**
 * DTO para criação de track
 */
export interface CreateTrackDto {
  title: string;
  userId: string;
  description?: string;
  genre?: string;
  tags?: string[];
  audioPrompt?: string; // Para geração de áudio via IA
  imagePrompt?: string; // Para geração de imagem via IA
}

/**
 * Use case para criar track
 * Implementa a lógica de negócio para criação de tracks
 */
export class CreateTrackUseCase {
  constructor(
    private readonly trackRepository: ITrackRepository,
    private readonly jobRepository: IJobRepository,
    private readonly queueService: IQueueService,
  ) {}

  /**
   * Executa a criação de uma nova track
   */
  async execute(createTrackDto: CreateTrackDto): Promise<Track> {
    const { 
      title, 
      userId, 
      description, 
      genre, 
      tags = [], 
      audioPrompt, 
      imagePrompt 
    } = createTrackDto;

    // Valida dados obrigatórios
    if (!title?.trim()) {
      throw new Error('Título é obrigatório');
    }

    if (!userId?.trim()) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Cria a track com status inicial de processamento
    const trackData: CreateTrackData = {
      title: title.trim(),
      userId,
      description: description?.trim(),
      genre: genre?.trim(),
      tags: tags.filter(tag => tag.trim()).map(tag => tag.trim()),
    };

    const track = await this.trackRepository.create(trackData);

    // Se há prompt de áudio, cria job para geração
    if (audioPrompt?.trim()) {
      await this.createAudioGenerationJob(track.id, audioPrompt.trim(), {
        genre,
        duration: 30, // duração padrão de 30 segundos
        mood: this.extractMoodFromDescription(description),
      });
    }

    // Se há prompt de imagem, cria job para geração
    if (imagePrompt?.trim()) {
      await this.createImageGenerationJob(track.id, imagePrompt.trim(), {
        style: 'artistic',
        aspectRatio: '1:1' as const,
      });
    }

    return track;
  }

  /**
   * Cria job para geração de áudio
   */
  private async createAudioGenerationJob(
    trackId: string,
    prompt: string,
    params: any
  ): Promise<void> {
    // Cria registro do job no banco
    const jobData = {
      type: JobType.AUDIO_GENERATION,
      data: {
        trackId,
        prompt,
        ...params,
      },
      priority: 1,
      trackId,
    };

    const job = await this.jobRepository.create(jobData);

    // Adiciona à fila de processamento
    await this.queueService.addJob(
      'audio-generation',
      'generate-audio',
      {
        jobId: job.id,
        trackId,
        prompt,
        ...params,
      },
      {
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      }
    );
  }

  /**
   * Cria job para geração de imagem
   */
  private async createImageGenerationJob(
    trackId: string,
    prompt: string,
    params: any
  ): Promise<void> {
    // Cria registro do job no banco
    const jobData = {
      type: JobType.IMAGE_GENERATION,
      data: {
        trackId,
        prompt,
        ...params,
      },
      priority: 2,
      trackId,
    };

    const job = await this.jobRepository.create(jobData);

    // Adiciona à fila de processamento
    await this.queueService.addJob(
      'image-generation',
      'generate-image',
      {
        jobId: job.id,
        trackId,
        prompt,
        ...params,
      },
      {
        priority: 2,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      }
    );
  }

  /**
   * Extrai humor/mood da descrição usando palavras-chave
   */
  private extractMoodFromDescription(description?: string): string | undefined {
    if (!description) return undefined;

    const moodKeywords = {
      energetic: ['energético', 'animado', 'vibrante', 'dinâmico'],
      calm: ['calmo', 'relaxante', 'tranquilo', 'suave'],
      dark: ['sombrio', 'dark', 'pesado', 'intenso'],
      happy: ['alegre', 'feliz', 'positivo', 'otimista'],
      sad: ['triste', 'melancólico', 'nostálgico'],
    };

    const lowerDesc = description.toLowerCase();

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        return mood;
      }
    }

    return undefined;
  }
}