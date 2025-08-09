# 部署指南

本文档描述了小学数学练习生成器生态系统的部署策略、环境配置和运维指南。

## 🏗️ 部署架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   API Backend   │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   Load Balancer │    │   Redis Cache   │
│   (Vercel/AWS)  │    │   (Nginx/ALB)   │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 微服务分布
- **Web应用**: 静态部署 + SSR
- **API服务**: 容器化部署
- **数据库**: 托管服务或自建
- **缓存**: Redis集群
- **文件存储**: 对象存储服务

## 🌍 环境配置

### 开发环境 (Development)
```bash
# 环境变量
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/exams_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
NEXT_PUBLIC_API_URL=http://localhost:3001

# 特性开关
ENABLE_DEBUG_LOGS=true
ENABLE_HOT_RELOAD=true
ENABLE_MOCK_DATA=true
```

### 测试环境 (Staging)
```bash
# 环境变量
NODE_ENV=staging
DATABASE_URL=postgresql://user:password@staging-db:5432/exams_staging
REDIS_URL=redis://staging-redis:6379
JWT_SECRET=staging-secret-key
NEXT_PUBLIC_API_URL=https://api-staging.example.com

# 特性开关
ENABLE_DEBUG_LOGS=true
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
```

### 生产环境 (Production)
```bash
# 环境变量
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db:5432/exams_prod
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=super-secure-production-key
NEXT_PUBLIC_API_URL=https://api.example.com

# 特性开关
ENABLE_DEBUG_LOGS=false
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_ERROR_TRACKING=true
ENABLE_RATE_LIMITING=true
```

## 🐳 Docker部署

### Dockerfile配置
```dockerfile
# packages/web/Dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 运行时镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```dockerfile
# packages/api/Dockerfile
FROM node:18-alpine AS base

# 安装依赖
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npx prisma generate

# 运行时镜像
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apiuser

COPY --from=builder --chown=apiuser:nodejs /app/dist ./dist
COPY --from=builder --chown=apiuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apiuser:nodejs /app/prisma ./prisma

USER apiuser

EXPOSE 3001
ENV PORT 3001

CMD ["node", "dist/index.js"]
```

### Docker Compose配置
```yaml
# docker-compose.yml
version: '3.8'

services:
  # 数据库
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: exams_db
      POSTGRES_USER: exams_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U exams_user -d exams_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # API服务
  api:
    build:
      context: ./packages/api
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://exams_user:${DB_PASSWORD}@postgres:5432/exams_db
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Web应用
  web:
    build:
      context: ./packages/web
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
    ports:
      - "3000:3000"
    depends_on:
      api:
        condition: service_healthy

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - web
      - api

volumes:
  postgres_data:
  redis_data:
```

## ☁️ 云平台部署

### Vercel部署 (推荐用于Web应用)
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.example.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "packages/web/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.example.com"
  },
  "functions": {
    "packages/web/pages/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### AWS ECS部署
```yaml
# aws-ecs-task-definition.json
{
  "family": "exams-ecosystem",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "your-registry/exams-api:latest",
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
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/exams-ecosystem",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "api"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3001/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### Kubernetes部署
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: exams-ecosystem

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: exams-ecosystem
data:
  NODE_ENV: "production"
  REDIS_URL: "redis://redis-service:6379"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: exams-ecosystem
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  JWT_SECRET: <base64-encoded-jwt-secret>

---
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: exams-ecosystem
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: your-registry/exams-api:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/api-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: exams-ecosystem
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: exams-ecosystem
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

## 🔄 CI/CD流水线

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run E2E tests
        run: npm run test:e2e:ci

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [web, api]
    
    steps:
      - uses: actions/checkout@v3
      
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
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.package }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./packages/${{ matrix.package }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          # 部署到测试环境的脚本
          echo "Deploying to staging environment"

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: |
          # 部署到生产环境的脚本
          echo "Deploying to production environment"
```

### 部署脚本
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "Deploying version $VERSION to $ENVIRONMENT environment..."

# 更新环境变量
kubectl create configmap app-config \
  --from-env-file=.env.$ENVIRONMENT \
  --dry-run=client -o yaml | kubectl apply -f -

# 更新镜像版本
kubectl set image deployment/api-deployment \
  api=ghcr.io/your-org/exams-ecosystem-api:$VERSION \
  -n exams-ecosystem

kubectl set image deployment/web-deployment \
  web=ghcr.io/your-org/exams-ecosystem-web:$VERSION \
  -n exams-ecosystem

# 等待部署完成
kubectl rollout status deployment/api-deployment -n exams-ecosystem
kubectl rollout status deployment/web-deployment -n exams-ecosystem

# 运行健康检查
kubectl get pods -n exams-ecosystem
kubectl get services -n exams-ecosystem

echo "Deployment completed successfully!"
```

## 📊 监控和日志

### 应用监控
```typescript
// src/lib/monitoring.ts
import { createPrometheusMetrics } from 'prom-client';

export const metrics = {
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
  }),
  
  problemGenerationCount: new Counter({
    name: 'problem_generation_total',
    help: 'Total number of problems generated',
    labelNames: ['type', 'difficulty', 'grade']
  }),
  
  activeUsers: new Gauge({
    name: 'active_users',
    help: 'Number of currently active users'
  }),
  
  databaseConnections: new Gauge({
    name: 'database_connections',
    help: 'Number of active database connections'
  })
};

// 中间件
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    metrics.httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
}
```

### 日志配置
```typescript
// src/lib/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'exams-api',
    version: process.env.APP_VERSION || 'unknown'
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

### Grafana仪表板配置
```json
{
  "dashboard": {
    "title": "Exams Ecosystem Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_request_duration_seconds_count[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Problem Generation Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(problem_generation_total[5m])",
            "legendFormat": "{{type}} - {{difficulty}}"
          }
        ]
      },
      {
        "title": "Active Users",
        "type": "singlestat",
        "targets": [
          {
            "expr": "active_users",
            "legendFormat": "Current Active Users"
          }
        ]
      }
    ]
  }
}
```

## 🔒 安全配置

### SSL/TLS配置
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    ssl_certificate /etc/ssl/certs/api.example.com.crt;
    ssl_certificate_key /etc/ssl/private/api.example.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    location / {
        proxy_pass http://api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 环境变量管理
```bash
# scripts/setup-secrets.sh
#!/bin/bash

# 创建Kubernetes secrets
kubectl create secret generic app-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=REDIS_URL="$REDIS_URL" \
  --namespace=exams-ecosystem

# 创建TLS证书
kubectl create secret tls api-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  --namespace=exams-ecosystem
```

## 🚀 性能优化

### 缓存策略
```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// 使用示例
export async function getCachedProblems(config: GeneratorConfig) {
  const cacheKey = `problems:${JSON.stringify(config)}`;
  
  let problems = await cache.get(cacheKey);
  if (!problems) {
    problems = await generatePracticeProblems(config);
    await cache.set(cacheKey, problems, 1800); // 30分钟缓存
  }
  
  return problems;
}
```

### 数据库优化
```sql
-- 数据库索引优化
CREATE INDEX CONCURRENTLY idx_problems_grade_difficulty 
ON problems(grade, difficulty);

CREATE INDEX CONCURRENTLY idx_practice_sessions_user_created 
ON practice_sessions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_answers_session_problem 
ON answers(session_id, problem_id);

-- 分区表（按时间分区）
CREATE TABLE practice_sessions_2024 PARTITION OF practice_sessions
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## 📋 运维检查清单

### 部署前检查
- [ ] 代码审查通过
- [ ] 所有测试通过
- [ ] 安全扫描通过
- [ ] 性能测试通过
- [ ] 数据库迁移脚本准备
- [ ] 环境变量配置正确
- [ ] 监控和告警配置
- [ ] 回滚计划准备

### 部署后检查
- [ ] 应用健康检查通过
- [ ] 数据库连接正常
- [ ] 缓存服务正常
- [ ] API端点响应正常
- [ ] 前端页面加载正常
- [ ] 监控指标正常
- [ ] 日志输出正常
- [ ] 用户功能测试通过

### 定期维护
- [ ] 数据库备份验证
- [ ] 日志轮转配置
- [ ] 证书到期检查
- [ ] 依赖包安全更新
- [ ] 性能指标分析
- [ ] 容量规划评估
- [ ] 灾难恢复演练

遵循这些部署指南将确保应用的稳定性、安全性和可扩展性。