/**
 * Interface para parâmetros de geração de imagem
 */
export interface ImageGenerationParams {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'vintage';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'standard' | 'hd' | 'ultra';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Resposta da geração de imagem
 */
export interface ImageGenerationResponse {
  imageUrl: string;
  thumbnailUrl?: string;
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    aspectRatio: string;
  };
}

/**
 * Interface para serviço de geração de imagem com IA
 * Abstrai a integração com APIs de imagem (ex: DALL-E, Midjourney, Stable Diffusion, etc.)
 */
export interface IImageGenerationService {
  /**
   * Gera imagem a partir de prompt de texto
   */
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResponse>;

  /**
   * Verifica o status de uma geração em andamento
   */
  checkGenerationStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: ImageGenerationResponse;
    error?: string;
  }>;

  /**
   * Gera variações de uma imagem existente
   */
  generateVariations(imageUrl: string, count?: number): Promise<ImageGenerationResponse[]>;

  /**
   * Edita uma imagem existente com prompt
   */
  editImage(
    imageUrl: string, 
    prompt: string, 
    maskUrl?: string
  ): Promise<ImageGenerationResponse>;

  /**
   * Aumenta a resolução de uma imagem
   */
  upscaleImage(imageUrl: string, scale: 2 | 4): Promise<ImageGenerationResponse>;

  /**
   * Obtém informações sobre limites de uso
   */
  getUsageInfo(): Promise<{
    remainingCredits: number;
    monthlyLimit: number;
    resetDate: Date;
  }>;
}