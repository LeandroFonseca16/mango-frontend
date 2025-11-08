/**
 * Interface para parâmetros de geração de áudio
 */
export interface AudioGenerationParams {
  prompt: string;
  duration?: number; // em segundos
  genre?: string;
  mood?: string;
  tempo?: number; // BPM
  key?: string;
  instruments?: string[];
}

/**
 * Resposta da geração de áudio
 */
export interface AudioGenerationResponse {
  audioUrl: string;
  metadata: {
    duration: number;
    format: string;
    size: number;
    bpm?: number;
    key?: string;
  };
}

/**
 * Interface para serviço de geração de áudio com IA
 * Abstrai a integração com APIs de música (ex: Suno, MusicGen, etc.)
 */
export interface IAudioGenerationService {
  /**
   * Gera áudio a partir de prompt de texto
   */
  generateAudio(params: AudioGenerationParams): Promise<AudioGenerationResponse>;

  /**
   * Verifica o status de uma geração em andamento
   */
  checkGenerationStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: AudioGenerationResponse;
    error?: string;
  }>;

  /**
   * Cancela uma geração em andamento
   */
  cancelGeneration(jobId: string): Promise<void>;

  /**
   * Obtém informações sobre limites de uso
   */
  getUsageInfo(): Promise<{
    remainingCredits: number;
    monthlyLimit: number;
    resetDate: Date;
  }>;
}