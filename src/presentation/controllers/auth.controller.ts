import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/usecases/create-user.usecase';
import { AuthenticateUserUseCase } from '../../application/usecases/authenticate-user.usecase';
import {
  CreateUserDto,
  LoginUserDto,
  LoginResponseDto,
  RefreshTokenDto,
  UserResponseDto,
} from '../dto/auth.dto';

/**
 * Controlador para autenticação e gerenciamento de usuários
 * Implementa endpoints REST seguindo padrões RESTful
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  /**
   * Endpoint para registro de novo usuário
   * POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.createUserUseCase.execute(createUserDto);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt!,
        updatedAt: user.updatedAt!,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar usuário');
    }
  }

  /**
   * Endpoint para login de usuário
   * POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    try {
      const result = await this.authenticateUserUseCase.execute(loginUserDto);
      
      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          avatar: result.user.avatar,
          createdAt: result.user.createdAt!,
          updatedAt: result.user.updatedAt!,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  /**
   * Endpoint para renovar token de acesso
   * POST /auth/refresh
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      const result = await this.authenticateUserUseCase.refreshAccessToken(
        refreshTokenDto.refreshToken
      );
      
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao renovar token');
    }
  }

  /**
   * Endpoint para verificar token e obter dados do usuário
   * POST /auth/verify
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() body: { token: string }): Promise<{ userId: string; email: string }> {
    try {
      const result = this.authenticateUserUseCase.verifyAccessToken(body.token);
      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Token inválido');
    }
  }
}