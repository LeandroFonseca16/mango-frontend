import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

/**
 * Health Check Controller
 * Endpoint para verificação de saúde da aplicação
 * Usado por load balancers, monitoring tools e CI/CD
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Health check básico
   * GET /api/v1/health
   */
  @Get()
  async check() {
    const startTime = Date.now();
    
    // Verifica conexão com o banco
    let databaseStatus = 'disconnected';
    let databaseLatency = 0;
    
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - dbStart;
      databaseStatus = 'connected';
    } catch (error) {
      databaseStatus = 'error';
    }

    const uptime = process.uptime();
    const responseTime = Date.now() - startTime;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: databaseStatus,
          latency: `${databaseLatency}ms`,
        },
        api: {
          status: 'running',
          responseTime: `${responseTime}ms`,
        },
      },
      memory: {
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      },
    };
  }

  /**
   * Readiness probe
   * GET /api/v1/health/ready
   */
  @Get('ready')
  async ready() {
    try {
      // Verifica se o banco está acessível
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      };
    }
  }

  /**
   * Liveness probe
   * GET /api/v1/health/live
   */
  @Get('live')
  async live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
    };
  }
}
