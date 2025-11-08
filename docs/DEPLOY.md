# 🚀 Guia de Deploy - MangoBeat AI Backend

## 📋 Visão Geral

Este guia cobre diferentes estratégias de deploy para o **MangoBeat AI Backend**, desde desenvolvimento local até produção em cloud.

---

## 🐳 Docker Deploy

### 1. Dockerfile

```dockerfile
# Multi-stage build para otimização
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Gerar cliente Prisma
RUN npm run db:generate

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dependências do sistema
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --chown=nestjs:nodejs package*.json ./

# Criar diretórios necessários
RUN mkdir -p logs && chown nestjs:nodejs logs

# Mudar para usuário não-root
USER nestjs

# Expor porta
EXPOSE 3001

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### 2. Docker Compose (Desenvolvimento)

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build: 
      context: .
      target: builder
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/mangobeat_dev
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=dev-jwt-secret
      - JWT_REFRESH_SECRET=dev-refresh-secret
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
    command: npm run start:dev

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=mangobeat_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev:/var/lib/postgresql/data
      - ./prisma/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_dev:/data

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_dev:
  redis_dev:
```

### 3. Docker Compose (Produção)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: mangobeat/backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TIKTOK_API_KEY=${TIKTOK_API_KEY}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_prod:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_prod:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_prod:
  redis_prod:
```

### 4. Comandos Docker

```bash
# Build da imagem
docker build -t mangobeat/backend:latest .

# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose logs -f app

# Executar migrações
docker-compose exec app npm run db:migrate

# Backup do banco
docker-compose exec db pg_dump -U postgres mangobeat > backup.sql

# Limpar containers
docker-compose down -v
```

---

## ☁️ Cloud Deploy

### 1. AWS ECS (Elastic Container Service)

#### task-definition.json

```json
{
  "family": "mangobeat-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "mangobeat-backend",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/mangobeat/backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT:parameter/mangobeat/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT:parameter/mangobeat/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/mangobeat-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3001/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### Deploy Script

```bash
#!/bin/bash
# deploy-aws.sh

set -e

# Variáveis
AWS_REGION="us-east-1"
ECR_REGISTRY="ACCOUNT.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_NAME="mangobeat/backend"
CLUSTER_NAME="mangobeat-cluster"
SERVICE_NAME="mangobeat-backend-service"

echo "🚀 Iniciando deploy no AWS ECS..."

# 1. Build e push da imagem
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:latest .

# 2. Tag para ECR
docker tag ${IMAGE_NAME}:latest ${ECR_REGISTRY}/${IMAGE_NAME}:latest
docker tag ${IMAGE_NAME}:latest ${ECR_REGISTRY}/${IMAGE_NAME}:$(git rev-parse --short HEAD)

# 3. Login no ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# 4. Push das imagens
echo "⬆️ Pushing to ECR..."
docker push ${ECR_REGISTRY}/${IMAGE_NAME}:latest
docker push ${ECR_REGISTRY}/${IMAGE_NAME}:$(git rev-parse --short HEAD)

# 5. Update task definition
echo "📝 Updating task definition..."
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 6. Update service
echo "🔄 Updating ECS service..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --task-definition mangobeat-backend \
  --force-new-deployment

# 7. Wait for deployment
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME}

echo "✅ Deploy completed successfully!"
```

### 2. Google Cloud Run

#### cloudbuild.yaml

```yaml
steps:
  # Build da imagem
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/mangobeat-backend:$COMMIT_SHA', '.']
  
  # Push da imagem
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/mangobeat-backend:$COMMIT_SHA']
  
  # Deploy no Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args: 
    - 'run'
    - 'deploy'
    - 'mangobeat-backend'
    - '--image'
    - 'gcr.io/$PROJECT_ID/mangobeat-backend:$COMMIT_SHA'
    - '--region'
    - 'us-central1'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
    - '--set-env-vars'
    - 'NODE_ENV=production'
    - '--set-secrets'
    - 'DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest'

options:
  logging: CLOUD_LOGGING_ONLY
```

#### Deploy Script

```bash
#!/bin/bash
# deploy-gcp.sh

set -e

PROJECT_ID="mangobeat-production"
REGION="us-central1"
SERVICE_NAME="mangobeat-backend"

echo "🚀 Deploying to Google Cloud Run..."

# 1. Build e deploy
gcloud builds submit --config cloudbuild.yaml

# 2. Configure traffic
gcloud run services update-traffic ${SERVICE_NAME} \
  --to-latest \
  --region=${REGION}

# 3. Verificar deploy
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
  --region=${REGION} \
  --format='value(status.url)')

echo "✅ Deploy completed!"
echo "🌐 Service URL: ${SERVICE_URL}"
echo "🏥 Health check: ${SERVICE_URL}/health"
```

### 3. Heroku Deploy

#### Procfile

```
web: node dist/main.js
release: npm run db:migrate
```

#### app.json

```json
{
  "name": "mangobeat-ai-backend",
  "description": "AI-powered music generation backend",
  "repository": "https://github.com/mangobeat/backend",
  "keywords": ["nodejs", "nestjs", "ai", "music"],
  "image": "heroku/nodejs",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "formation": {
    "web": {
      "quantity": 1,
      "size": "standard-1x"
    }
  },
  "addons": [
    {
      "plan": "heroku-postgresql:standard-0"
    },
    {
      "plan": "heroku-redis:premium-0"
    }
  ],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "NPM_CONFIG_PRODUCTION": {
      "value": "false"
    }
  },
  "scripts": {
    "postdeploy": "npm run db:migrate"
  }
}
```

#### Deploy Commands

```bash
# Login no Heroku
heroku login

# Criar app
heroku create mangobeat-backend

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret

# Adicionar addons
heroku addons:create heroku-postgresql:standard-0
heroku addons:create heroku-redis:premium-0

# Deploy
git push heroku main

# Executar migrações
heroku run npm run db:migrate

# Ver logs
heroku logs --tail
```

---

## 🚀 Railway Deploy

### railway.json

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Deploy Commands

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Iniciar projeto
railway init

# Deploy
railway up

# Configurar variáveis
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret

# Adicionar banco
railway add postgresql
railway add redis

# Ver logs
railway logs
```

---

## 🔧 Configuração de Infraestrutura

### 1. Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server app:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    server {
        listen 80;
        server_name api.mangobeat.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name api.mangobeat.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!SHA1:!WEAK;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

        # API routes
        location /api/v1/auth {
            limit_req zone=auth burst=10 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/v1 {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }

        # Documentation
        location /docs {
            proxy_pass http://backend;
        }
    }
}
```

### 2. SSL com Let's Encrypt

```bash
#!/bin/bash
# setup-ssl.sh

# Instalar certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Obter certificado
certbot --nginx -d api.mangobeat.com

# Configurar renovação automática
crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Monitoring com Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mangobeat-backend'
    static_configs:
      - targets: ['app:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres_exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis_exporter:9121']
```

### 4. Logging com ELK Stack

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

---

## 📊 Monitoramento e Observabilidade

### 1. Health Checks Avançados

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database'),
      () => this.redisHealth.pingCheck('redis'),
      () => this.memoryHealth.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.diskHealth.checkStorage('storage', { threshold: 250 * 1024 * 1024 * 1024 }),
      () => this.httpHealth.pingCheck('external_api', 'https://api.openai.com/v1'),
    ]);
  }

  @Get('detailed')
  async detailedHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        queues: await this.checkQueues(),
      }
    };
  }
}
```

### 2. Métricas Customizadas

```typescript
// src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  private readonly jobsCounter = new Counter({
    name: 'jobs_total',
    help: 'Total number of jobs processed',
    labelNames: ['type', 'status'],
  });

  recordHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestsCounter.inc({ method, route, status_code: statusCode });
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  recordJob(type: string, status: string) {
    this.jobsCounter.inc({ type, status });
  }

  getMetrics() {
    return register.metrics();
  }
}
```

---

## 🔄 CI/CD Pipelines

### GitHub Actions (Completo)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Lint code
      run: npm run lint

    - name: Type check
      run: npm run build

    - name: Generate Prisma client
      run: npm run db:generate

    - name: Run database migrations
      run: npm run db:migrate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

    - name: Run unit tests
      run: npm run test:cov
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_HOST: localhost

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        REDIS_HOST: localhost

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=sha,prefix=main-

    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to production
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.PRODUCTION_HOST }}
        username: ${{ secrets.PRODUCTION_USER }}
        key: ${{ secrets.PRODUCTION_SSH_KEY }}
        script: |
          cd /opt/mangobeat
          docker-compose pull
          docker-compose up -d --no-deps app
          docker image prune -f

    - name: Health check
      run: |
        sleep 30
        curl -f https://api.mangobeat.com/health || exit 1

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

---

## 📋 Checklist de Deploy

### ✅ Pré-Deploy

- [ ] Testes passando (unit, integration, e2e)
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets configurados
- [ ] Banco de dados migrado
- [ ] SSL configurado
- [ ] Monitoramento configurado
- [ ] Backup realizado

### ✅ Durante Deploy

- [ ] Zero downtime deployment
- [ ] Health checks passando
- [ ] Logs sendo coletados
- [ ] Métricas sendo coletadas
- [ ] Rollback plan pronto

### ✅ Pós-Deploy

- [ ] Smoke tests executados
- [ ] Performance verificada
- [ ] Alertas configurados
- [ ] Documentação atualizada
- [ ] Equipe notificada

---

## 🚨 Troubleshooting de Deploy

### Problemas Comuns

1. **Porta já em uso**: Verificar se existe outro processo
2. **Variáveis não carregadas**: Verificar arquivo .env
3. **Banco não conecta**: Verificar network/firewall
4. **Redis timeout**: Verificar configuração de rede
5. **SSL não funciona**: Verificar certificados

### Logs Úteis

```bash
# Docker logs
docker-compose logs -f app

# System logs
journalctl -u docker

# Application logs
tail -f /var/log/mangobeat/app.log

# Database logs
tail -f /var/lib/postgresql/14/main/pg_log/postgresql.log
```

---

**Deploy com confiança! 🚀🥭**