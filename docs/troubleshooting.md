# 故障排除指南

本文档提供了小学数学练习生成器生态系统常见问题的解决方案和调试指南。

## 🚨 常见问题

### 开发环境问题

#### 1. 依赖安装失败
```bash
# 问题：npm install 失败
Error: Cannot resolve dependency tree

# 解决方案
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 或者使用 yarn
rm -rf node_modules yarn.lock
yarn cache clean
yarn install
```

#### 2. TypeScript 编译错误
```bash
# 问题：类型检查失败
Type 'string' is not assignable to type 'number'

# 解决方案
# 1. 检查类型定义
npm run type-check

# 2. 重新生成类型
npm run build:types

# 3. 清理构建缓存
npm run clean
npm run build
```

#### 3. 端口占用问题
```bash
# 问题：端口 3000 已被占用
Error: listen EADDRINUSE: address already in use :::3000

# 解决方案
# 查找占用端口的进程
lsof -ti:3000

# 终止进程
kill -9 $(lsof -ti:3000)

# 或者使用不同端口
PORT=3001 npm run dev
```

#### 4. 数据库连接问题
```bash
# 问题：无法连接到数据库
Error: connect ECONNREFUSED 127.0.0.1:5432

# 解决方案
# 1. 检查数据库是否运行
pg_isready -h localhost -p 5432

# 2. 启动数据库服务
brew services start postgresql
# 或
sudo systemctl start postgresql

# 3. 检查连接字符串
echo $DATABASE_URL

# 4. 重置数据库
npm run db:reset
```

### 构建和部署问题

#### 1. Next.js 构建失败
```bash
# 问题：构建过程中内存不足
Error: JavaScript heap out of memory

# 解决方案
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 或在 package.json 中配置
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

#### 2. Docker 构建问题
```bash
# 问题：Docker 构建失败
Error: failed to solve with frontend dockerfile.v0

# 解决方案
# 1. 清理 Docker 缓存
docker system prune -a

# 2. 重新构建镜像
docker build --no-cache -t exams-web .

# 3. 检查 Dockerfile 语法
docker build --dry-run .
```

#### 3. 环境变量问题
```bash
# 问题：环境变量未加载
Error: process.env.DATABASE_URL is undefined

# 解决方案
# 1. 检查 .env 文件
cat .env.local

# 2. 验证变量名称
grep -r "DATABASE_URL" .env*

# 3. 重启开发服务器
npm run dev
```

### 运行时问题

#### 1. API 请求失败
```javascript
// 问题：API 请求返回 404
fetch('/api/problems/generate')
  .then(res => res.json())
  .catch(err => console.error(err));

// 解决方案
// 1. 检查 API 路由是否存在
// 2. 验证请求 URL
// 3. 检查服务器日志
```

#### 2. 题目生成错误
```typescript
// 问题：生成的题目答案不正确
const problem = generateMathProblem('division', 'easy');
console.log(problem); // answer 不匹配

// 解决方案
// 1. 检查生成算法
function validateProblem(problem: Problem): boolean {
  const { operand1, operand2, operator, answer } = problem;
  
  switch (operator) {
    case 'addition':
      return operand1 + operand2 === answer;
    case 'subtraction':
      return operand1 - operand2 === answer;
    case 'multiplication':
      return operand1 * operand2 === answer;
    case 'division':
      return operand1 / operand2 === answer;
    default:
      return false;
  }
}

// 2. 添加单元测试
test('should generate valid division problems', () => {
  const problem = generateMathProblem('division', 'easy');
  expect(validateProblem(problem)).toBe(true);
});
```

#### 3. 性能问题
```typescript
// 问题：题目生成速度慢
// 解决方案：添加缓存和优化

import { LRUCache } from 'lru-cache';

const problemCache = new LRUCache<string, Problem[]>({
  max: 1000,
  ttl: 1000 * 60 * 30 // 30分钟
});

export function generateCachedProblems(config: GeneratorConfig): Problem[] {
  const cacheKey = JSON.stringify(config);
  
  let problems = problemCache.get(cacheKey);
  if (!problems) {
    problems = generatePracticeProblems(config);
    problemCache.set(cacheKey, problems);
  }
  
  return problems;
}
```

## 🔍 调试技巧

### 1. 日志调试
```typescript
// 添加详细日志
import debug from 'debug';

const log = debug('exams:generator');

export function generateMathProblem(type: OperationType, difficulty: Difficulty): Problem {
  log('Generating problem: type=%s, difficulty=%s', type, difficulty);
  
  const problem = createProblem(type, difficulty);
  
  log('Generated problem: %O', problem);
  
  return problem;
}

// 启用调试日志
DEBUG=exams:* npm run dev
```

### 2. 性能分析
```typescript
// 性能监控
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  
  return result;
}

// 使用示例
const problems = measurePerformance('Problem Generation', () => {
  return generatePracticeProblems(config);
});
```

### 3. 内存泄漏检测
```bash
# 使用 Node.js 内存分析
node --inspect --inspect-brk server.js

# 或使用 clinic.js
npm install -g clinic
clinic doctor -- node server.js
clinic flame -- node server.js
```

## 🛠️ 开发工具

### VS Code 调试配置
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal",
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    },
    {
      "name": "Debug API Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/api/src/index.ts",
      "outFiles": ["${workspaceFolder}/packages/api/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Chrome DevTools 调试
```typescript
// 在代码中添加断点
function generateMathProblem(type: OperationType, difficulty: Difficulty): Problem {
  debugger; // 浏览器会在此处暂停
  
  const config = getDifficultyConfig(difficulty);
  // ... 其他代码
}

// 或使用 console 方法
console.trace('Problem generation trace');
console.time('generation');
// ... 代码执行
console.timeEnd('generation');
```

## 📊 监控和诊断

### 健康检查端点
```typescript
// src/pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    
    // 检查 Redis 连接
    await redis.ping();
    
    // 检查内存使用
    const memUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      services: {
        database: 'connected',
        redis: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
```

### 错误追踪
```typescript
// src/lib/errorTracking.ts
import * as Sentry from '@sentry/nextjs';

export function initErrorTracking() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
}

// 使用示例
try {
  const problems = generatePracticeProblems(config);
} catch (error) {
  captureError(error as Error, { config });
  throw error;
}
```

## 🔧 故障恢复

### 数据库恢复
```bash
# 1. 备份当前数据
pg_dump exams_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. 恢复到特定时间点
pg_restore --clean --if-exists --no-owner --no-privileges \
  --dbname=exams_db backup_20231201_120000.sql

# 3. 运行数据库迁移
npm run db:migrate

# 4. 验证数据完整性
npm run db:validate
```

### 服务恢复
```bash
# 1. 检查服务状态
kubectl get pods -n exams-ecosystem

# 2. 重启失败的服务
kubectl rollout restart deployment/api-deployment -n exams-ecosystem

# 3. 查看日志
kubectl logs -f deployment/api-deployment -n exams-ecosystem

# 4. 回滚到上一个版本
kubectl rollout undo deployment/api-deployment -n exams-ecosystem
```

### 缓存清理
```bash
# 1. 清理 Redis 缓存
redis-cli FLUSHALL

# 2. 清理应用缓存
curl -X POST http://localhost:3001/api/cache/clear

# 3. 清理 CDN 缓存
# (根据使用的 CDN 服务而定)
```

## 📞 获取帮助

### 日志收集
```bash
# 收集系统信息
echo "=== System Info ===" > debug.log
uname -a >> debug.log
node --version >> debug.log
npm --version >> debug.log

echo "=== Environment ===" >> debug.log
env | grep -E "(NODE_|DATABASE_|REDIS_)" >> debug.log

echo "=== Application Logs ===" >> debug.log
tail -n 100 logs/combined.log >> debug.log

echo "=== Error Logs ===" >> debug.log
tail -n 50 logs/error.log >> debug.log
```

### 问题报告模板
```markdown
## 问题描述
简要描述遇到的问题

## 复现步骤
1. 
2. 
3. 

## 预期行为
描述期望的正确行为

## 实际行为
描述实际发生的情况

## 环境信息
- OS: 
- Node.js: 
- npm: 
- 浏览器: 

## 错误日志
```
粘贴相关的错误日志
```

## 额外信息
其他可能有用的信息
```

### 联系方式
- **技术支持**: tech-support@example.com
- **Bug 报告**: https://github.com/your-org/exams-ecosystem/issues
- **文档问题**: docs@example.com
- **紧急联系**: +86-xxx-xxxx-xxxx

遵循这些故障排除指南可以帮助您快速定位和解决问题，确保系统的稳定运行。