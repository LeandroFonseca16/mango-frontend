import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Função principal de bootstrap da aplicação
 * Configura e inicializa o servidor NestJS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração global de validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas nos DTOs
      forbidNonWhitelisted: true, // Rejeita propriedades não permitidas
      transform: true, // Transforma automaticamente tipos
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Configuração de CORS - Suporta múltiplas origens
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permite requests sem origin (ex: mobile apps, Postman)
      if (!origin) return callback(null, true);
      
      // Permite origens configuradas
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} não permitida por CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 horas de cache do preflight
  });

  // Prefixo global da API
  app.setGlobalPrefix('api/v1');

  // Configuração da porta
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;
  const host = process.env.HOST || '0.0.0.0'; // Bind em todas as interfaces para Docker

  await app.listen(port, host);

  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`🚀 MangoBeat AI Backend rodando em ${nodeEnv.toUpperCase()}`);
  console.log(`📖 API disponível em: http://localhost:${port}/api/v1`);
  console.log(`🔗 Health check: http://localhost:${port}/api/v1/health`);
  
  if (allowedOrigins.length > 0) {
    console.log(`🌐 CORS habilitado para: ${allowedOrigins.join(', ')}`);
  }
  
  if (nodeEnv === 'development') {
    console.log(`🎯 Swagger UI: http://localhost:${port}/api/docs`);
  }
}

// Captura erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();