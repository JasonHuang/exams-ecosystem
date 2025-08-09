# API设计文档

本文档描述了小学数学练习生成器生态系统的RESTful API设计规范。

## 🏗️ API架构

### 基础信息
- **基础URL**: `https://api.exams.example.com/v1`
- **协议**: HTTPS
- **格式**: JSON
- **认证**: JWT Bearer Token
- **版本控制**: URL路径版本控制

### 响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}
```

## 🔐 认证授权

### JWT Token结构
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  permissions: string[];
  exp: number;
  iat: number;
}
```

### 认证流程
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

响应:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "student"
    }
  }
}
```

## 📚 核心API端点

### 1. 题目生成 API

#### 生成练习题目
```http
POST /problems/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "grade": 3,
  "difficulty": "medium",
  "operationType": ["addition", "subtraction"],
  "problemCount": 20,
  "allowNegative": false,
  "maxNumber": 100
}
```

响应:
```json
{
  "success": true,
  "data": {
    "problems": [
      {
        "id": "prob_123",
        "type": "addition",
        "question": "25 + 37 = ?",
        "answer": 62,
        "grade": 3,
        "difficulty": "medium",
        "metadata": {
          "timeLimit": 60,
          "hints": ["可以先算 25 + 30，再加 7"],
          "tags": ["进位加法"]
        }
      }
    ],
    "generatedAt": "2024-12-19T10:30:00Z",
    "config": {
      "grade": 3,
      "difficulty": "medium",
      "operationType": ["addition", "subtraction"],
      "problemCount": 20
    }
  }
}
```

#### 生成打印版题目
```http
POST /problems/printable
Authorization: Bearer <token>
Content-Type: application/json

{
  "grade": "grade3",
  "operationTypes": ["addition", "multiplication"],
  "difficulty": "medium",
  "layout": {
    "problemsPerPage": 20,
    "columns": 2,
    "showAnswers": false
  }
}
```

#### 获取题目详情
```http
GET /problems/{problemId}
Authorization: Bearer <token>
```

#### 验证答案
```http
POST /problems/{problemId}/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "answer": 62,
  "timeSpent": 45
}
```

### 2. 用户管理 API

#### 用户注册
```http
POST /users/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "name": "张小明",
  "role": "student",
  "grade": 3
}
```

#### 获取用户信息
```http
GET /users/profile
Authorization: Bearer <token>
```

#### 更新用户信息
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "张小明",
  "grade": 4,
  "preferences": {
    "difficulty": "medium",
    "favoriteOperations": ["multiplication", "division"]
  }
}
```

### 3. 练习会话 API

#### 开始练习会话
```http
POST /sessions/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "problemIds": ["prob_123", "prob_124", "prob_125"],
  "timeLimit": 1800,
  "settings": {
    "showHints": true,
    "showSteps": false,
    "randomOrder": true
  }
}
```

#### 提交答案
```http
POST /sessions/{sessionId}/answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "problemId": "prob_123",
  "answer": 62,
  "timeSpent": 45,
  "hintsUsed": 1
}
```

#### 结束练习会话
```http
POST /sessions/{sessionId}/finish
Authorization: Bearer <token>
```

#### 获取会话结果
```http
GET /sessions/{sessionId}/results
Authorization: Bearer <token>
```

### 4. 统计分析 API

#### 获取用户统计
```http
GET /stats/user
Authorization: Bearer <token>
Query Parameters:
- period: daily|weekly|monthly
- startDate: 2024-01-01
- endDate: 2024-12-31
```

#### 获取学习进度
```http
GET /stats/progress
Authorization: Bearer <token>
Query Parameters:
- subject: math
- grade: 3
```

#### 获取错题统计
```http
GET /stats/mistakes
Authorization: Bearer <token>
Query Parameters:
- operationType: addition|subtraction|multiplication|division
- limit: 10
```

### 5. 内容管理 API

#### 获取年级配置
```http
GET /config/grades
```

#### 获取难度配置
```http
GET /config/difficulties
```

#### 获取题目类型
```http
GET /config/problem-types
```

## 📊 数据模型

### 用户模型
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  grade?: number;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
  stats: UserStats;
}

interface UserPreferences {
  difficulty: Difficulty;
  favoriteOperations: OperationType[];
  showHints: boolean;
  showSteps: boolean;
  timeLimit: number;
}

interface UserStats {
  totalProblems: number;
  correctAnswers: number;
  averageTime: number;
  streakDays: number;
  lastActiveAt: string;
}
```

### 题目模型
```typescript
interface Problem {
  id: string;
  type: ProblemType;
  question: string;
  answer: number | string;
  grade: Grade;
  difficulty: Difficulty;
  metadata: ProblemMetadata;
  createdAt: string;
}

interface ProblemMetadata {
  timeLimit?: number;
  hints?: string[];
  explanation?: string;
  tags?: string[];
  operands?: number[];
  operator?: string;
}
```

### 练习会话模型
```typescript
interface PracticeSession {
  id: string;
  userId: string;
  problemIds: string[];
  startedAt: string;
  finishedAt?: string;
  timeLimit: number;
  settings: PracticeSettings;
  answers: Answer[];
  results?: SessionResults;
}

interface Answer {
  problemId: string;
  userAnswer: number | string;
  correctAnswer: number | string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  submittedAt: string;
}

interface SessionResults {
  totalProblems: number;
  correctAnswers: number;
  accuracy: number;
  totalTime: number;
  averageTime: number;
  score: number;
}
```

## 🚨 错误处理

### 错误代码规范
```typescript
enum ErrorCode {
  // 认证错误 (1000-1099)
  UNAUTHORIZED = 'AUTH_001',
  INVALID_TOKEN = 'AUTH_002',
  TOKEN_EXPIRED = 'AUTH_003',
  INSUFFICIENT_PERMISSIONS = 'AUTH_004',
  
  // 验证错误 (1100-1199)
  VALIDATION_ERROR = 'VAL_001',
  INVALID_GRADE = 'VAL_002',
  INVALID_DIFFICULTY = 'VAL_003',
  INVALID_OPERATION_TYPE = 'VAL_004',
  
  // 业务错误 (1200-1299)
  PROBLEM_NOT_FOUND = 'BIZ_001',
  SESSION_NOT_FOUND = 'BIZ_002',
  SESSION_ALREADY_FINISHED = 'BIZ_003',
  GENERATION_FAILED = 'BIZ_004',
  
  // 系统错误 (1300-1399)
  INTERNAL_ERROR = 'SYS_001',
  DATABASE_ERROR = 'SYS_002',
  EXTERNAL_SERVICE_ERROR = 'SYS_003'
}
```

### 错误响应示例
```json
{
  "success": false,
  "error": {
    "code": "VAL_002",
    "message": "Invalid grade value",
    "details": {
      "field": "grade",
      "value": 7,
      "allowedValues": [1, 2, 3, 4, 5, 6]
    }
  },
  "meta": {
    "timestamp": "2024-12-19T10:30:00Z",
    "requestId": "req_123456",
    "version": "1.0.0"
  }
}
```

## 🔄 分页和过滤

### 分页参数
```http
GET /problems?page=1&limit=20&sort=createdAt&order=desc
```

### 过滤参数
```http
GET /problems?grade=3&difficulty=medium&type=addition&search=进位
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 🚀 性能优化

### 缓存策略
- **Redis缓存**: 热点数据缓存
- **CDN缓存**: 静态资源缓存
- **浏览器缓存**: 客户端缓存

### 限流策略
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### 批量操作
```http
POST /problems/batch-generate
Content-Type: application/json

{
  "requests": [
    {
      "grade": 3,
      "difficulty": "easy",
      "operationType": ["addition"],
      "problemCount": 10
    },
    {
      "grade": 3,
      "difficulty": "medium",
      "operationType": ["subtraction"],
      "problemCount": 10
    }
  ]
}
```

## 📝 API文档

### OpenAPI规范
API文档遵循OpenAPI 3.0规范，提供：
- 交互式API文档
- 自动代码生成
- 测试工具集成

### 文档访问
- **Swagger UI**: `https://api.exams.example.com/docs`
- **ReDoc**: `https://api.exams.example.com/redoc`
- **OpenAPI JSON**: `https://api.exams.example.com/openapi.json`

## 🧪 测试

### API测试策略
- **单元测试**: 业务逻辑测试
- **集成测试**: API端点测试
- **性能测试**: 负载和压力测试
- **安全测试**: 认证和授权测试

### 测试环境
- **开发环境**: `https://dev-api.exams.example.com`
- **测试环境**: `https://test-api.exams.example.com`
- **生产环境**: `https://api.exams.example.com`

这个API设计确保了系统的可扩展性、安全性和易用性，为前端应用和第三方集成提供了强大的支持。