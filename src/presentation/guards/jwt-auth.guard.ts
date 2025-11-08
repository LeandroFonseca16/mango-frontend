import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticateUserUseCase } from '../../application/usecases/authenticate-user.usecase';

/**
 * Guard para proteger rotas que requerem autenticação JWT
 * Verifica e valida o token de acesso no header Authorization
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  /**
   * Verifica se a requisição pode prosseguir
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de acesso não fornecido');
    }

    try {
      // Verifica e decodifica o token
      const payload = this.authenticateUserUseCase.verifyAccessToken(token);
      
      // Adiciona dados do usuário à requisição
      (request as any).user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }
  }

  /**
   * Extrai o token do header Authorization
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}