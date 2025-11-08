import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('deve registrar um novo usuário', async () => {
      const createUserDto = {
        email: 'test@mangobeat.com',
        password: 'password123',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@mangobeat.com');
          expect(res.body.name).toBe('Test User');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('deve falhar com dados inválidos', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '123',
      };

      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Primeiro registra um usuário
      const createUserDto = {
        email: 'login@mangobeat.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(createUserDto);

      // Depois faz login
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'login@mangobeat.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('login@mangobeat.com');
        });
    });

    it('deve falhar com credenciais inválidas', async () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@mangobeat.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});

describe('TracksController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Cria usuário e obtém token para testes autenticados
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'tracks@mangobeat.com',
        password: 'password123',
        name: 'Tracks Test User',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'tracks@mangobeat.com',
        password: 'password123',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/tracks (POST)', () => {
    it('deve criar uma nova track', async () => {
      const createTrackDto = {
        title: 'Test Track',
        description: 'A test track for e2e testing',
        genre: 'phonk',
        tags: ['test', 'phonk'],
        audioPrompt: 'Dark phonk beat with heavy bass',
      };

      return request(app.getHttpServer())
        .post('/api/v1/tracks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createTrackDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Track');
          expect(res.body.genre).toBe('phonk');
          expect(res.body.tags).toEqual(['test', 'phonk']);
        });
    });

    it('deve falhar sem autenticação', async () => {
      const createTrackDto = {
        title: 'Unauthorized Track',
      };

      return request(app.getHttpServer())
        .post('/api/v1/tracks')
        .send(createTrackDto)
        .expect(401);
    });
  });

  describe('/tracks/my (GET)', () => {
    it('deve listar tracks do usuário autenticado', async () => {
      return request(app.getHttpServer())
        .get('/api/v1/tracks/my')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});

// Helper para limpar banco de dados entre testes
async function cleanDatabase() {
  // Implementar limpeza do banco de teste quando necessário
  // Por enquanto skip - usar banco em memória ou containerizado para testes
}