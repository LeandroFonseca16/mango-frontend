import { Injectable } from '@nestjs/common';
import { 
  IAudioGenerationService, 
  AudioGenerationParams, 
  AudioGenerationResponse 
} from '../../application/interfaces/audio-generation.service.interface';

/**
 * Dados para geração de música (extensão da interface base)
 */
export interface GenerateMusicData extends AudioGenerationParams {
  bpm?: number;
}

/**
 * Resultado da geração de música (extensão da interface base)
 */
export interface MusicGenerationResult extends AudioGenerationResponse {
  metadata: AudioGenerationResponse['metadata'] & {
    bpm?: number;
    key?: string;
    mood?: string;
    instruments?: string[];
    aiModel?: string;
    generationParams?: Record<string, any>;
  };
}

/**
 * Serviço de geração de música com IA
 * Implementação inicial com beats fake para desenvolvimento
 */
@Injectable()
export class MusicGenService implements IAudioGenerationService {
  private activeJobs = new Map<string, any>();
  
  /**
   * Implementação da interface IAudioGenerationService
   */
  async generateAudio(params: AudioGenerationParams): Promise<AudioGenerationResponse> {
    const { prompt, duration = 60, genre = 'trap', tempo: bpm = 140, key = 'C', mood = 'energetic' } = params;
    
    // Simula processamento da IA
    await this.simulateProcessingTime();
    
    // URL fake para o áudio gerado
    const audioUrl = `https://mangobeat.s3.amazonaws.com/generated/${Date.now()}-${genre}-beat.mp3`;
    
    return {
      audioUrl,
      metadata: {
        duration,
        format: 'mp3',
        size: Math.floor(duration * 128 * 1024 / 8), // Aproximadamente 128kbps
        bpm,
        key,
      },
    };
  }

  /**
   * Verifica status de geração (mock implementation)
   */
  async checkGenerationStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: AudioGenerationResponse;
    error?: string;
  }> {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      return { status: 'failed', error: 'Job not found' };
    }
    return { status: 'completed', progress: 100, result: job.result };
  }

  /**
   * Cancela geração (mock implementation)
   */
  async cancelGeneration(jobId: string): Promise<void> {
    this.activeJobs.delete(jobId);
  }

  /**
   * Informações de uso (mock implementation)
   */
  async getUsageInfo(): Promise<{
    remainingCredits: number;
    monthlyLimit: number;
    resetDate: Date;
  }> {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    nextMonth.setHours(0, 0, 0, 0);
    
    return {
      remainingCredits: 50,
      monthlyLimit: 100,
      resetDate: nextMonth,
    };
  }

  /**
   * Gera uma música baseada no prompt (método específico do serviço)
   * Por enquanto retorna dados fake para desenvolvimento
   */
  async generateMusic(data: GenerateMusicData): Promise<MusicGenerationResult> {
    const audioResponse = await this.generateAudio(data);
    const { genre = 'trap', bpm = data.tempo || 140, mood = 'energetic' } = data;
    
    // Lista de instrumentos baseada no gênero
    const instruments = this.getInstrumentsForGenre(genre);
    
    return {
      ...audioResponse,
      metadata: {
        ...audioResponse.metadata,
        mood,
        instruments,
        aiModel: 'MusicGen-v1.5',
        generationParams: {
          prompt: data.prompt,
          genre,
          temperature: 0.8,
          top_k: 250,
          top_p: 0.95,
        },
      },
    };
  }

  /**
   * Simula tempo de processamento da IA
   */
  private async simulateProcessingTime(): Promise<void> {
    const processingTime = Math.random() * 3000 + 2000; // 2-5 segundos
    return new Promise(resolve => setTimeout(resolve, processingTime));
  }

  /**
   * Retorna instrumentos típicos para cada gênero
   */
  private getInstrumentsForGenre(genre: string): string[] {
    const genreInstruments = {
      trap: ['808 drums', 'hi-hats', 'snare', 'synth bass', 'lead synth'],
      phonk: ['808 drums', 'cowbell', 'vinyl crackle', 'distorted bass', 'dark synth'],
      drill: ['808 drums', 'hi-hats', 'snare rolls', 'dark piano', 'strings'],
      lofi: ['vinyl crackle', 'soft drums', 'jazz piano', 'bass guitar', 'ambient pads'],
      boombap: ['kick drum', 'snare', 'vinyl scratch', 'jazz samples', 'bass'],
      default: ['drums', 'bass', 'synth', 'pad'],
    };

    return genreInstruments[genre.toLowerCase()] || genreInstruments.default;
  }

  /**
   * Valida se o prompt é válido para geração
   */
  validatePrompt(prompt: string): boolean {
    if (!prompt || prompt.trim().length < 3) {
      return false;
    }
    
    // Lista de palavras proibidas (conteúdo ofensivo)
    const forbiddenWords = ['hate', 'violence', 'explicit'];
    const lowerPrompt = prompt.toLowerCase();
    
    return !forbiddenWords.some(word => lowerPrompt.includes(word));
  }

  /**
   * Gera sugestões de prompt baseado no gênero
   */
  generatePromptSuggestions(genre: string): string[] {
    const suggestions = {
      trap: [
        'Heavy 808 bass with sharp hi-hats and dark melody',
        'Aggressive trap beat with rolling snares',
        'Melodic trap with emotional piano and strings',
      ],
      phonk: [
        'Dark phonk beat with cowbell and vinyl crackle',
        'Memphis-style phonk with distorted vocals',
        'Aggressive phonk with heavy bass and dark atmosphere',
      ],
      drill: [
        'UK drill beat with sliding 808s and piano',
        'Chicago drill with heavy drums and dark melody',
        'Dark drill beat with string arrangements',
      ],
      lofi: [
        'Chill lofi beat with jazz piano and vinyl texture',
        'Relaxing lofi with soft drums and ambient sounds',
        'Study lofi beat with warm pads and guitar',
      ],
    };

    return suggestions[genre.toLowerCase()] || [
      'Create an energetic beat with modern sounds',
      'Generate a melodic instrumental track',
      'Produce a rhythm-focused composition',
    ];
  }
}