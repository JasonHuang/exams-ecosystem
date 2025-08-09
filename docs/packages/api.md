# @exams/api 包文档

`@exams/api` 是小学数学练习生成器生态系统的后端 API 服务，基于 Node.js 和 Express 构建，提供 RESTful API 接口和数据管理功能。

## 📋 概述

### 主要功能
- 🎯 **题目生成**: 基于配置生成数学练习题目
- 👤 **用户管理**: 用户注册、登录、资料管理
- 📊 **数据统计**: 学习进度、成绩分析、报告生成
- 🔐 **认证授权**: JWT 令牌、权限控制
- 💾 **数据持久化**: 数据库操作、缓存管理
- 📝 **日志记录**: 操作日志、错误追踪

### 技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **认证**: JWT + bcrypt
- **验证**: Joi / Zod
- **文档**: Swagger/OpenAPI
- **测试**: Jest + Supertest
- **监控**: Winston + Morgan

## 🏗️ 项目结构

```
packages/api/
├── src/
│   ├── controllers/           # 控制器层
│   │   ├── auth.controller.ts
│   │   ├── problems.controller.ts
│   │   ├── users.controller.ts
│   │   └── stats.controller.ts
│   ├── middleware/           # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logging.middleware.ts
│   ├── routes/              # 路由定义
│   │   ├── auth.routes.ts
│   │   ├── problems.routes.ts
│   │   ├── users.routes.ts
│   │   └── stats.routes.ts
│   ├── services/            # 业务逻辑层
│   │   ├── auth.service.ts
│   │   ├── problem.service.ts
│   │   ├── user.service.ts
│   │   └── stats.service.ts
│   ├── models/              # 数据模型
│   │   ├── user.model.ts
│   │   ├── problem.model.ts
│   │   └── session.model.ts
│   ├── utils/               # 工具函数
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   ├── validation.util.ts
│   │   └── logger.util.ts
│   ├── config/              # 配置文件
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── app.config.ts
│   ├── types/               # 类型定义
│   │   ├── auth.types.ts
│   │   ├── api.types.ts
│   │   └── database.types.ts
│   └── app.ts               # 应用入口
├── prisma/                  # Prisma 配置
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/                   # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                    # API 文档
│   └── swagger.yaml
├── Dockerfile              # Docker 配置
├── docker-compose.yml      # Docker Compose
├── package.json           # 包配置
└── tsconfig.json          # TypeScript 配置
```

## 🛠️ 核心架构

### 应用入口 (`src/app.ts`)
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { authRoutes } from './routes/auth.routes';
import { problemRoutes } from './routes/problems.routes';
import { userRoutes } from './routes/users.routes';
import { statsRoutes } from './routes/stats.routes';
import { logger } from './utils/logger.util';
import { config } from './config/app.config';

const app = express();

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true
}));

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// 基础中间件
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// 错误处理中间件
app.use(errorHandler);

const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
});

export default app;
```

### 数据库配置 (`prisma/schema.prisma`)
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  name      String?
  avatar    String?
  grade     Int      @default(1)
  role      Role     @default(STUDENT)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关联关系
  sessions    PracticeSession[]
  statistics  UserStatistics?
  preferences UserPreferences?

  @@map("users")
}

model Problem {
  id         String        @id @default(cuid())
  type       OperationType
  operand1   Int
  operand2   Int
  operator   String
  answer     Int
  question   String
  difficulty Difficulty
  grade      Int
  metadata   Json?
  createdAt  DateTime      @default(now())

  // 关联关系
  answers ProblemAnswer[]

  @@map("problems")
}

model PracticeSession {
  id          String    @id @default(cuid())
  userId      String
  config      Json      // GeneratorConfig
  startTime   DateTime  @default(now())
  endTime     DateTime?
  totalTime   Int?      // 毫秒
  isCompleted Boolean   @default(false)
  createdAt   DateTime  @default(now())

  // 关联关系
  user    User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers ProblemAnswer[]

  @@map("practice_sessions")
}

model ProblemAnswer {
  id          String   @id @default(cuid())
  sessionId   String
  problemId   String
  userAnswer  Int
  isCorrect   Boolean
  timeSpent   Int      // 毫秒
  hintsUsed   Int      @default(0)
  attempts    Int      @default(1)
  createdAt   DateTime @default(now())

  // 关联关系
  session PracticeSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  problem Problem         @relation(fields: [problemId], references: [id])

  @@map("problem_answers")
}

model UserStatistics {
  id                String   @id @default(cuid())
  userId            String   @unique
  totalSessions     Int      @default(0)
  totalProblems     Int      @default(0)
  correctAnswers    Int      @default(0)
  totalTime         Int      @default(0) // 毫秒
  averageAccuracy   Float    @default(0)
  averageSpeed      Float    @default(0) // 题/分钟
  currentStreak     Int      @default(0)
  longestStreak     Int      @default(0)
  lastPracticeDate  DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // 关联关系
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_statistics")
}

model UserPreferences {
  id              String          @id @default(cuid())
  userId          String          @unique
  preferredGrade  Int             @default(1)
  difficulty      Difficulty      @default(EASY)
  problemTypes    OperationType[]
  problemCount    Int             @default(10)
  showHints       Boolean         @default(true)
  showTimer       Boolean         @default(false)
  autoNext        Boolean         @default(false)
  soundEnabled    Boolean         @default(true)
  theme           String          @default("light")
  language        String          @default("zh-CN")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // 关联关系
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

enum Role {
  STUDENT
  TEACHER
  ADMIN
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum OperationType {
  ADDITION
  SUBTRACTION
  MULTIPLICATION
  DIVISION
}
```

## 🎯 控制器层

### 题目控制器 (`src/controllers/problems.controller.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { ProblemService } from '../services/problem.service';
import { GeneratorConfig } from '@exams/shared';
import { logger } from '../utils/logger.util';
import { ApiResponse } from '../types/api.types';

export class ProblemsController {
  private problemService: ProblemService;

  constructor() {
    this.problemService = new ProblemService();
  }

  /**
   * 生成题目
   */
  generateProblems = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const config: GeneratorConfig = req.body;
      
      // 验证配置
      if (!config || !config.count || !config.types || !config.difficulty) {
        return res.status(400).json({
          success: false,
          error: 'Invalid generator configuration'
        });
      }

      logger.info('Generating problems', { 
        config, 
        userId: req.user?.id 
      });

      const problems = await this.problemService.generateProblems(config);

      res.status(200).json({
        success: true,
        data: {
          problems,
          count: problems.length,
          config
        }
      });
    } catch (error) {
      logger.error('Failed to generate problems', error);
      next(error);
    }
  };

  /**
   * 获取题目详情
   */
  getProblem = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      
      const problem = await this.problemService.getProblemById(id);
      
      if (!problem) {
        return res.status(404).json({
          success: false,
          error: 'Problem not found'
        });
      }

      res.status(200).json({
        success: true,
        data: problem
      });
    } catch (error) {
      logger.error('Failed to get problem', error);
      next(error);
    }
  };

  /**
   * 批量生成并保存题目
   */
  batchGenerate = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const { configs } = req.body;
      
      if (!Array.isArray(configs)) {
        return res.status(400).json({
          success: false,
          error: 'Configs must be an array'
        });
      }

      logger.info('Batch generating problems', { 
        configCount: configs.length,
        userId: req.user?.id 
      });

      const results = await this.problemService.batchGenerateProblems(configs);

      res.status(200).json({
        success: true,
        data: {
          results,
          totalGenerated: results.reduce((sum, r) => sum + r.problems.length, 0)
        }
      });
    } catch (error) {
      logger.error('Failed to batch generate problems', error);
      next(error);
    }
  };

  /**
   * 获取题目统计
   */
  getStatistics = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const stats = await this.problemService.getProblemStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Failed to get problem statistics', error);
      next(error);
    }
  };
}
```

### 用户控制器 (`src/controllers/users.controller.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { logger } from '../utils/logger.util';
import { ApiResponse } from '../types/api.types';

export class UsersController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * 获取用户资料
   */
  getProfile = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      
      const user = await this.userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // 移除敏感信息
      const { password, ...userProfile } = user;

      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      logger.error('Failed to get user profile', error);
      next(error);
    }
  };

  /**
   * 更新用户资料
   */
  updateProfile = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      // 移除不允许更新的字段
      const { id, email, password, role, createdAt, updatedAt, ...allowedData } = updateData;

      const updatedUser = await this.userService.updateUser(userId, allowedData);

      const { password: _, ...userProfile } = updatedUser;

      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      logger.error('Failed to update user profile', error);
      next(error);
    }
  };

  /**
   * 获取用户偏好设置
   */
  getPreferences = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      
      const preferences = await this.userService.getUserPreferences(userId);

      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      logger.error('Failed to get user preferences', error);
      next(error);
    }
  };

  /**
   * 更新用户偏好设置
   */
  updatePreferences = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const preferencesData = req.body;

      const updatedPreferences = await this.userService.updateUserPreferences(
        userId, 
        preferencesData
      );

      res.status(200).json({
        success: true,
        data: updatedPreferences
      });
    } catch (error) {
      logger.error('Failed to update user preferences', error);
      next(error);
    }
  };

  /**
   * 删除用户账户
   */
  deleteAccount = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ) => {
    try {
      const userId = req.user!.id;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          error: 'Password is required for account deletion'
        });
      }

      await this.userService.deleteUser(userId, password);

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      logger.error('Failed to delete user account', error);
      next(error);
    }
  };
}
```

## 🔧 服务层

### 题目服务 (`src/services/problem.service.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
import { 
  GeneratorConfig, 
  Problem, 
  ArithmeticGenerator,
  getRandomElement 
} from '@exams/shared';
import { logger } from '../utils/logger.util';
import { RedisClient } from '../config/redis.config';

export class ProblemService {
  private prisma: PrismaClient;
  private redis: RedisClient;
  private generator: ArithmeticGenerator;

  constructor() {
    this.prisma = new PrismaClient();
    this.redis = new RedisClient();
    this.generator = new ArithmeticGenerator();
  }

  /**
   * 生成题目
   */
  async generateProblems(config: GeneratorConfig): Promise<Problem[]> {
    try {
      // 检查缓存
      const cacheKey = `problems:${JSON.stringify(config)}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        logger.info('Returning cached problems');
        return JSON.parse(cached);
      }

      // 生成新题目
      const problems: Problem[] = [];
      
      for (let i = 0; i < config.count; i++) {
        const type = getRandomElement(config.types);
        const problem = this.generator.generate({
          type,
          difficulty: config.difficulty,
          grade: config.grade || 2
        });
        
        problems.push(problem);
      }

      // 缓存结果（5分钟）
      await this.redis.setex(cacheKey, 300, JSON.stringify(problems));

      logger.info(`Generated ${problems.length} problems`, { config });
      
      return problems;
    } catch (error) {
      logger.error('Failed to generate problems', error);
      throw new Error('Problem generation failed');
    }
  }

  /**
   * 批量生成题目
   */
  async batchGenerateProblems(configs: GeneratorConfig[]) {
    const results = [];
    
    for (const config of configs) {
      try {
        const problems = await this.generateProblems(config);
        results.push({
          config,
          problems,
          success: true
        });
      } catch (error) {
        results.push({
          config,
          problems: [],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  /**
   * 保存题目到数据库
   */
  async saveProblem(problem: Problem) {
    try {
      const saved = await this.prisma.problem.create({
        data: {
          type: problem.type,
          operand1: problem.operand1,
          operand2: problem.operand2,
          operator: problem.operator,
          answer: problem.answer,
          question: problem.question,
          difficulty: problem.difficulty,
          grade: problem.grade,
          metadata: problem.metadata || {}
        }
      });

      return saved;
    } catch (error) {
      logger.error('Failed to save problem', error);
      throw new Error('Problem save failed');
    }
  }

  /**
   * 根据ID获取题目
   */
  async getProblemById(id: string) {
    try {
      const problem = await this.prisma.problem.findUnique({
        where: { id }
      });

      return problem;
    } catch (error) {
      logger.error('Failed to get problem by ID', error);
      throw new Error('Problem retrieval failed');
    }
  }

  /**
   * 获取题目统计信息
   */
  async getProblemStatistics() {
    try {
      const [
        totalProblems,
        problemsByType,
        problemsByDifficulty,
        problemsByGrade
      ] = await Promise.all([
        this.prisma.problem.count(),
        this.prisma.problem.groupBy({
          by: ['type'],
          _count: { type: true }
        }),
        this.prisma.problem.groupBy({
          by: ['difficulty'],
          _count: { difficulty: true }
        }),
        this.prisma.problem.groupBy({
          by: ['grade'],
          _count: { grade: true }
        })
      ]);

      return {
        total: totalProblems,
        byType: problemsByType,
        byDifficulty: problemsByDifficulty,
        byGrade: problemsByGrade
      };
    } catch (error) {
      logger.error('Failed to get problem statistics', error);
      throw new Error('Statistics retrieval failed');
    }
  }

  /**
   * 清理过期缓存
   */
  async clearExpiredCache() {
    try {
      const keys = await this.redis.keys('problems:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info(`Cleared ${keys.length} cached problem sets`);
      }
    } catch (error) {
      logger.error('Failed to clear problem cache', error);
    }
  }
}
```

### 认证服务 (`src/services/auth.service.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/app.config';
import { logger } from '../utils/logger.util';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  JwtPayload 
} from '../types/auth.types';

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // 检查用户是否已存在
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username }
          ]
        }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // 创建用户
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: hashedPassword,
          name: data.name,
          grade: data.grade || 1
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          grade: true,
          role: true,
          createdAt: true
        }
      });

      // 创建默认偏好设置
      await this.prisma.userPreferences.create({
        data: {
          userId: user.id,
          preferredGrade: user.grade
        }
      });

      // 创建统计记录
      await this.prisma.userStatistics.create({
        data: {
          userId: user.id
        }
      });

      // 生成 JWT
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      logger.info('User registered successfully', { userId: user.id });

      return {
        user,
        token,
        expiresIn: config.jwt.expiresIn
      };
    } catch (error) {
      logger.error('Registration failed', error);
      throw error;
    }
  }

  /**
   * 用户登录
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // 查找用户
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: data.identifier },
            { username: data.identifier }
          ]
        }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // 生成 JWT
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // 移除敏感信息
      const { password, ...userProfile } = user;

      logger.info('User logged in successfully', { userId: user.id });

      return {
        user: userProfile,
        token,
        expiresIn: config.jwt.expiresIn
      };
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          grade: true,
          role: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      const newToken = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      return {
        user,
        token: newToken,
        expiresIn: config.jwt.expiresIn
      };
    } catch (error) {
      logger.error('Token refresh failed', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * 验证令牌
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, isActive: true }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * 生成 JWT 令牌
   */
  private generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid current password');
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Password change failed', error);
      throw error;
    }
  }
}
```

## 🛡️ 中间件

### 认证中间件 (`src/middleware/auth.middleware.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '../utils/logger.util';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * 验证 JWT 令牌
   */
  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const token = authHeader.substring(7);
      const decoded = await this.authService.verifyToken(token);
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error) {
      logger.error('Authentication failed', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  };

  /**
   * 可选认证（不强制要求登录）
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = await this.authService.verifyToken(token);
        
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        };
      }

      next();
    } catch (error) {
      // 忽略认证错误，继续处理请求
      next();
    }
  };

  /**
   * 角色权限检查
   */
  authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  };
}

// 导出中间件实例
const authMiddleware = new AuthMiddleware();
export const { authenticate, optionalAuth, authorize } = authMiddleware;
```

### 错误处理中间件 (`src/middleware/error.middleware.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util';
import { config } from '../config/app.config';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Prisma 错误处理
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database operation failed';
  }

  // JWT 错误处理
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // 验证错误处理
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // 记录错误
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 响应错误
  const response: any = {
    success: false,
    error: message
  };

  // 开发环境下包含错误堆栈
  if (config.env === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: AppError = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## 🧪 测试

### 控制器测试示例
```typescript
// tests/unit/controllers/problems.controller.test.ts
import request from 'supertest';
import app from '../../../src/app';
import { ProblemService } from '../../../src/services/problem.service';

jest.mock('../../../src/services/problem.service');

describe('ProblemsController', () => {
  let mockProblemService: jest.Mocked<ProblemService>;

  beforeEach(() => {
    mockProblemService = new ProblemService() as jest.Mocked<ProblemService>;
  });

  describe('POST /api/problems/generate', () => {
    it('should generate problems successfully', async () => {
      const mockProblems = [
        {
          id: '1',
          type: 'addition',
          operand1: 5,
          operand2: 3,
          answer: 8,
          question: '5 + 3 = ?',
          difficulty: 'easy',
          grade: 1
        }
      ];

      mockProblemService.generateProblems.mockResolvedValue(mockProblems);

      const config = {
        count: 1,
        types: ['addition'],
        difficulty: 'easy',
        grade: 1
      };

      const response = await request(app)
        .post('/api/problems/generate')
        .send(config)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.problems).toHaveLength(1);
      expect(response.body.data.problems[0]).toMatchObject(mockProblems[0]);
    });

    it('should return 400 for invalid config', async () => {
      const response = await request(app)
        .post('/api/problems/generate')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid generator configuration');
    });
  });
});
```

### 集成测试示例
```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication Integration', () => {
  beforeEach(async () => {
    // 清理测试数据
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        grade: 2
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      // 第一次注册
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // 第二次注册相同邮箱
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 创建测试用户
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
```

## 📊 监控和日志

### 日志配置 (`src/utils/logger.util.ts`)
```typescript
import winston from 'winston';
import { config } from '../config/app.config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'exams-api' },
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

if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 请求日志中间件
export const requestLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({ filename: 'logs/requests.log' })
  ]
});
```

### 健康检查端点
```typescript
// src/routes/health.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { RedisClient } from '../config/redis.config';

const router = Router();
const prisma = new PrismaClient();
const redis = new RedisClient();

router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: 'unknown',
      redis: 'unknown'
    }
  };

  try {
    // 检查数据库连接
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    health.status = 'ERROR';
  }

  try {
    // 检查 Redis 连接
    await redis.ping();
    health.services.redis = 'healthy';
  } catch (error) {
    health.services.redis = 'unhealthy';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

export { router as healthRoutes };
```

这个 API 包提供了完整的后端服务，具有良好的架构设计、安全性和可扩展性。