import { IsString, IsOptional, IsArray, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { TrackStatus } from '../../domain/entities/track.entity';

/**
 * DTO para criação de track
 */
export class CreateTrackDto {
  @IsString({ message: 'Título é obrigatório' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Gênero deve ser uma string' })
  genre?: string;

  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array de strings' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];

  @IsOptional()
  @IsString({ message: 'Prompt de áudio deve ser uma string' })
  audioPrompt?: string;

  @IsOptional()
  @IsString({ message: 'Prompt de imagem deve ser uma string' })
  imagePrompt?: string;
}

/**
 * DTO para geração de track com IA
 */
export class GenerateTrackDto {
  @IsString({ message: 'Título é obrigatório' })
  title: string;

  @IsString({ message: 'Prompt é obrigatório para geração' })
  audioPrompt: string;

  @IsOptional()
  @IsString({ message: 'Prompt de imagem deve ser uma string' })
  imagePrompt?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Gênero deve ser uma string' })
  @IsEnum(['trap', 'phonk', 'drill', 'lofi', 'boombap'], { 
    message: 'Gênero deve ser: trap, phonk, drill, lofi ou boombap' 
  })
  genre?: string;

  @IsOptional()
  @IsNumber({}, { message: 'BPM deve ser um número' })
  @Min(60, { message: 'BPM mínimo é 60' })
  @Max(200, { message: 'BPM máximo é 200' })
  bpm?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Duração deve ser um número' })
  @Min(15, { message: 'Duração mínima é 15 segundos' })
  @Max(180, { message: 'Duração máxima é 180 segundos' })
  duration?: number;

  @IsOptional()
  @IsString({ message: 'Tom deve ser uma string' })
  key?: string;

  @IsOptional()
  @IsString({ message: 'Mood deve ser uma string' })
  mood?: string;

  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array de strings' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];
}

/**
 * DTO para resposta de track
 */
export class TrackResponseDto {
  id: string;
  title: string;
  description?: string;
  audioUrl?: string;
  imageUrl?: string;
  genre?: string;
  tags: string[];
  duration?: number;
  status: TrackStatus;
  metadata?: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para atualização de track
 */
export class UpdateTrackDto {
  @IsOptional()
  @IsString({ message: 'Título deve ser uma string' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'URL do áudio deve ser uma string' })
  audioUrl?: string;

  @IsOptional()
  @IsString({ message: 'URL da imagem deve ser uma string' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Gênero deve ser uma string' })
  genre?: string;

  @IsOptional()
  @IsArray({ message: 'Tags devem ser um array de strings' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string' })
  tags?: string[];

  @IsOptional()
  @IsEnum(TrackStatus, { message: 'Status deve ser um valor válido' })
  status?: TrackStatus;
}

/**
 * DTO para filtros de busca de tracks
 */
export class TrackFiltersDto {
  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(TrackStatus)
  status?: TrackStatus;

  @IsOptional()
  @IsString()
  userId?: string;
}