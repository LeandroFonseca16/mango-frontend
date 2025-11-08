import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * DTO para criação de usuário
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  name?: string;
}

/**
 * DTO para login de usuário
 */
export class LoginUserDto {
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email: string;

  @IsString({ message: 'Senha é obrigatória' })
  password: string;
}

/**
 * DTO para resposta de usuário (sem dados sensíveis)
 */
export class UserResponseDto {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO para resposta de login
 */
export class LoginResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

/**
 * DTO para refresh token
 */
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token é obrigatório' })
  refreshToken: string;
}