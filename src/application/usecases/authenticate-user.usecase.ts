import { User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

/**
 * DTO para login de usuário
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * Resposta do login
 */
export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

/**
 * Use case para autenticar usuário
 * Implementa a lógica de negócio para login
 */
export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtSecret: string,
    private readonly refreshSecret: string,
  ) {}

  /**
   * Executa a autenticação do usuário
   */
  async execute(loginDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Busca o usuário pelo email
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gera tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: user.toPublic(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Gera token de acesso (JWT)
   */
  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign(
      { 
        sub: userId, 
        email,
        type: 'access'
      },
      this.jwtSecret,
      { 
        expiresIn: '15m',
        issuer: 'mangobeat-ai',
        audience: 'mangobeat-ai-app'
      }
    );
  }

  /**
   * Gera refresh token
   */
  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { 
        sub: userId,
        type: 'refresh'
      },
      this.refreshSecret,
      { 
        expiresIn: '7d',
        issuer: 'mangobeat-ai',
        audience: 'mangobeat-ai-app'
      }
    );
  }

  /**
   * Verifica e decodifica um token de acesso
   */
  verifyAccessToken(token: string): { userId: string; email: string } {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as any;
      if (payload.type !== 'access') {
        throw new Error('Token inválido');
      }
      return {
        userId: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  /**
   * Renova token de acesso usando refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.refreshSecret) as any;
      if (payload.type !== 'refresh') {
        throw new Error('Token inválido');
      }

      // Busca o usuário para verificar se ainda existe
      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Gera novo token de acesso
      const accessToken = this.generateAccessToken(user.id, user.email);

      return { accessToken };
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado');
    }
  }
}