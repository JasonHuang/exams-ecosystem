# 测试指南

本文档描述了小学数学练习生成器生态系统的测试策略、工具和最佳实践。

## 🎯 测试策略

### 测试金字塔
```
    /\
   /  \     E2E Tests (少量)
  /____\    
 /      \   Integration Tests (适量)
/________\  Unit Tests (大量)
```

### 测试类型分布
- **单元测试 (70%)**: 测试独立的函数和组件
- **集成测试 (20%)**: 测试模块间的交互
- **端到端测试 (10%)**: 测试完整的用户流程

### 测试原则
- **快速反馈**: 单元测试应该在几秒内完成
- **可靠性**: 测试结果应该稳定可重复
- **可维护性**: 测试代码应该易于理解和修改
- **覆盖率**: 核心业务逻辑应达到90%以上覆盖率

## 🛠️ 测试工具栈

### 前端测试
- **Jest**: JavaScript测试框架
- **React Testing Library**: React组件测试
- **MSW**: API模拟
- **Playwright**: 端到端测试

### 后端测试
- **Jest**: 单元测试和集成测试
- **Supertest**: HTTP接口测试
- **Prisma**: 数据库测试工具

### 测试工具
- **Istanbul**: 代码覆盖率
- **Faker.js**: 测试数据生成
- **Testing Library**: 用户行为模拟

## 📋 单元测试

### 工具函数测试
```typescript
// src/utils/__tests__/mathUtils.test.ts
import { 
  getRandomInt, 
  getRandomFloat, 
  getRandomElement,
  shuffleArray 
} from '../mathUtils';

describe('Math Utils', () => {
  describe('getRandomInt', () => {
    test('should return integer within range', () => {
      const min = 1;
      const max = 10;
      const result = getRandomInt(min, max);
      
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });

    test('should handle edge cases', () => {
      expect(getRandomInt(5, 5)).toBe(5);
      expect(() => getRandomInt(10, 1)).toThrow('Invalid range');
    });

    test('should generate different values', () => {
      const results = Array.from({ length: 100 }, () => getRandomInt(1, 100));
      const uniqueResults = new Set(results);
      
      // 应该有足够的随机性
      expect(uniqueResults.size).toBeGreaterThan(10);
    });
  });

  describe('getRandomElement', () => {
    test('should return element from array', () => {
      const array = ['a', 'b', 'c', 'd'];
      const result = getRandomElement(array);
      
      expect(array).toContain(result);
    });

    test('should handle single element array', () => {
      const array = ['single'];
      const result = getRandomElement(array);
      
      expect(result).toBe('single');
    });

    test('should throw error for empty array', () => {
      expect(() => getRandomElement([])).toThrow('Array cannot be empty');
    });
  });

  describe('shuffleArray', () => {
    test('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray([...original]);
      
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    test('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      shuffleArray(original);
      
      expect(original).toEqual(copy);
    });
  });
});
```

### 题目生成器测试
```typescript
// src/generators/__tests__/mathProblemGenerator.test.ts
import { 
  generateMathProblem,
  generatePracticeProblems,
  validateProblem 
} from '../mathProblemGenerator';
import type { OperationType, Difficulty, Problem } from '@exams/shared';

describe('Math Problem Generator', () => {
  describe('generateMathProblem', () => {
    test.each([
      ['addition', 'easy'],
      ['subtraction', 'medium'],
      ['multiplication', 'hard'],
      ['division', 'easy']
    ] as [OperationType, Difficulty][])('should generate %s problem with %s difficulty', (type, difficulty) => {
      const problem = generateMathProblem(type, difficulty);
      
      expect(problem).toMatchObject({
        type,
        difficulty,
        question: expect.any(String),
        answer: expect.any(Number),
        operand1: expect.any(Number),
        operand2: expect.any(Number)
      });
      
      expect(validateProblem(problem)).toBe(true);
    });

    test('should generate addition problems correctly', () => {
      const problem = generateMathProblem('addition', 'easy');
      const expectedAnswer = problem.operand1 + problem.operand2;
      
      expect(problem.answer).toBe(expectedAnswer);
      expect(problem.question).toBe(`${problem.operand1} + ${problem.operand2} = ?`);
    });

    test('should generate subtraction problems with positive results', () => {
      const problem = generateMathProblem('subtraction', 'easy');
      
      expect(problem.answer).toBeGreaterThanOrEqual(0);
      expect(problem.operand1).toBeGreaterThanOrEqual(problem.operand2);
    });

    test('should generate division problems with integer results', () => {
      const problem = generateMathProblem('division', 'easy');
      
      expect(Number.isInteger(problem.answer)).toBe(true);
      expect(problem.operand1 % problem.operand2).toBe(0);
    });
  });

  describe('generatePracticeProblems', () => {
    test('should generate specified number of problems', () => {
      const config = {
        grade: 2,
        difficulty: 'medium' as Difficulty,
        types: ['addition', 'subtraction'] as OperationType[],
        count: 10
      };
      
      const problems = generatePracticeProblems(config);
      
      expect(problems).toHaveLength(10);
      problems.forEach(problem => {
        expect(['addition', 'subtraction']).toContain(problem.type);
        expect(problem.difficulty).toBe('medium');
      });
    });

    test('should distribute problem types evenly', () => {
      const config = {
        grade: 3,
        difficulty: 'easy' as Difficulty,
        types: ['addition', 'subtraction', 'multiplication'] as OperationType[],
        count: 30
      };
      
      const problems = generatePracticeProblems(config);
      const typeCounts = problems.reduce((counts, problem) => {
        counts[problem.type] = (counts[problem.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      // 每种类型应该有大约相等的数量
      Object.values(typeCounts).forEach(count => {
        expect(count).toBeGreaterThanOrEqual(8);
        expect(count).toBeLessThanOrEqual(12);
      });
    });
  });

  describe('validateProblem', () => {
    test('should validate correct problems', () => {
      const validProblem: Problem = {
        id: '1',
        type: 'addition',
        operand1: 5,
        operand2: 3,
        answer: 8,
        question: '5 + 3 = ?',
        difficulty: 'easy',
        grade: 1
      };
      
      expect(validateProblem(validProblem)).toBe(true);
    });

    test('should reject problems with incorrect answers', () => {
      const invalidProblem: Problem = {
        id: '1',
        type: 'addition',
        operand1: 5,
        operand2: 3,
        answer: 9, // 错误答案
        question: '5 + 3 = ?',
        difficulty: 'easy',
        grade: 1
      };
      
      expect(validateProblem(invalidProblem)).toBe(false);
    });
  });
});
```

## ⚛️ React组件测试

### 基础组件测试
```typescript
// src/components/__tests__/ProblemCard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProblemCard } from '../ProblemCard';
import type { Problem } from '@exams/shared';

const mockProblem: Problem = {
  id: '1',
  type: 'addition',
  operand1: 5,
  operand2: 3,
  answer: 8,
  question: '5 + 3 = ?',
  difficulty: 'easy',
  grade: 1
};

describe('ProblemCard', () => {
  test('should render problem question', () => {
    render(<ProblemCard problem={mockProblem} onAnswer={jest.fn()} />);
    
    expect(screen.getByText('5 + 3 = ?')).toBeInTheDocument();
  });

  test('should accept user input', async () => {
    const user = userEvent.setup();
    render(<ProblemCard problem={mockProblem} onAnswer={jest.fn()} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, '8');
    
    expect(input).toHaveValue('8');
  });

  test('should call onAnswer when form is submitted', async () => {
    const user = userEvent.setup();
    const mockOnAnswer = jest.fn();
    
    render(<ProblemCard problem={mockProblem} onAnswer={mockOnAnswer} />);
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /提交/i });
    
    await user.type(input, '8');
    await user.click(submitButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith({
      problemId: '1',
      userAnswer: 8,
      isCorrect: true,
      timeSpent: expect.any(Number)
    });
  });

  test('should show feedback for correct answer', async () => {
    const user = userEvent.setup();
    
    render(<ProblemCard problem={mockProblem} onAnswer={jest.fn()} showFeedback />);
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /提交/i });
    
    await user.type(input, '8');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/正确/i)).toBeInTheDocument();
    });
  });

  test('should show feedback for incorrect answer', async () => {
    const user = userEvent.setup();
    
    render(<ProblemCard problem={mockProblem} onAnswer={jest.fn()} showFeedback />);
    
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /提交/i });
    
    await user.type(input, '7');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/错误/i)).toBeInTheDocument();
      expect(screen.getByText(/正确答案是 8/i)).toBeInTheDocument();
    });
  });

  test('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    const mockOnAnswer = jest.fn();
    
    render(<ProblemCard problem={mockProblem} onAnswer={mockOnAnswer} />);
    
    const input = screen.getByRole('textbox');
    
    await user.type(input, '8');
    await user.keyboard('{Enter}');
    
    expect(mockOnAnswer).toHaveBeenCalled();
  });
});
```

### 自定义Hook测试
```typescript
// src/hooks/__tests__/useProblemGenerator.test.ts
import { renderHook, act } from '@testing-library/react';
import { useProblemGenerator } from '../useProblemGenerator';

// Mock the generator function
jest.mock('@exams/shared', () => ({
  generatePracticeProblems: jest.fn()
}));

import { generatePracticeProblems } from '@exams/shared';

const mockGenerateProblems = generatePracticeProblems as jest.MockedFunction<typeof generatePracticeProblems>;

describe('useProblemGenerator', () => {
  beforeEach(() => {
    mockGenerateProblems.mockClear();
  });

  test('should initialize with empty state', () => {
    const { result } = renderHook(() => useProblemGenerator());
    
    expect(result.current.problems).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should generate problems successfully', async () => {
    const mockProblems = [
      { id: '1', type: 'addition', question: '2 + 3 = ?', answer: 5 },
      { id: '2', type: 'subtraction', question: '5 - 2 = ?', answer: 3 }
    ];
    
    mockGenerateProblems.mockResolvedValue(mockProblems);
    
    const { result } = renderHook(() => useProblemGenerator());
    
    await act(async () => {
      await result.current.generateProblems({
        grade: 1,
        difficulty: 'easy',
        types: ['addition', 'subtraction'],
        count: 2
      });
    });
    
    expect(result.current.problems).toEqual(mockProblems);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle generation errors', async () => {
    const errorMessage = 'Generation failed';
    mockGenerateProblems.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useProblemGenerator());
    
    await act(async () => {
      await result.current.generateProblems({
        grade: 1,
        difficulty: 'easy',
        types: ['addition'],
        count: 1
      });
    });
    
    expect(result.current.problems).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  test('should set loading state during generation', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    mockGenerateProblems.mockReturnValue(promise);
    
    const { result } = renderHook(() => useProblemGenerator());
    
    act(() => {
      result.current.generateProblems({
        grade: 1,
        difficulty: 'easy',
        types: ['addition'],
        count: 1
      });
    });
    
    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      resolvePromise!([]);
      await promise;
    });
    
    expect(result.current.loading).toBe(false);
  });
});
```

## 🔗 集成测试

### API集成测试
```typescript
// src/__tests__/integration/problemGeneration.test.ts
import request from 'supertest';
import { app } from '../../app';
import { prisma } from '../../lib/prisma';

describe('Problem Generation API', () => {
  beforeEach(async () => {
    // 清理测试数据
    await prisma.problem.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should generate problems for authenticated user', async () => {
    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        grade: 2
      }
    });

    const response = await request(app)
      .post('/api/problems/generate')
      .set('Authorization', `Bearer ${generateTestToken(user.id)}`)
      .send({
        grade: 2,
        difficulty: 'easy',
        types: ['addition', 'subtraction'],
        count: 5
      })
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        problems: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            type: expect.stringMatching(/addition|subtraction/),
            question: expect.any(String),
            answer: expect.any(Number)
          })
        ])
      }
    });

    expect(response.body.data.problems).toHaveLength(5);
  });

  test('should save practice session', async () => {
    const user = await prisma.user.create({
      data: {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        grade: 2
      }
    });

    const problems = await generateTestProblems(5);
    
    const response = await request(app)
      .post('/api/practice/sessions')
      .set('Authorization', `Bearer ${generateTestToken(user.id)}`)
      .send({
        problems: problems.map(p => p.id),
        answers: [
          { problemId: problems[0].id, userAnswer: 5, isCorrect: true, timeSpent: 1000 },
          { problemId: problems[1].id, userAnswer: 3, isCorrect: false, timeSpent: 2000 }
        ]
      })
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        sessionId: expect.any(String),
        score: expect.any(Number),
        totalTime: expect.any(Number)
      }
    });

    // 验证数据库中的记录
    const session = await prisma.practiceSession.findUnique({
      where: { id: response.body.data.sessionId },
      include: { answers: true }
    });

    expect(session).toBeTruthy();
    expect(session!.answers).toHaveLength(2);
  });
});
```

### 数据库集成测试
```typescript
// src/__tests__/integration/database.test.ts
import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../../repositories/UserRepository';
import { ProblemRepository } from '../../repositories/ProblemRepository';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
});

describe('Database Integration', () => {
  let userRepo: UserRepository;
  let problemRepo: ProblemRepository;

  beforeAll(async () => {
    userRepo = new UserRepository(prisma);
    problemRepo = new ProblemRepository(prisma);
  });

  beforeEach(async () => {
    await prisma.answer.deleteMany();
    await prisma.practiceSession.deleteMany();
    await prisma.problem.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create and retrieve user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      grade: 3
    };

    const createdUser = await userRepo.create(userData);
    expect(createdUser).toMatchObject(userData);

    const retrievedUser = await userRepo.findById(createdUser.id);
    expect(retrievedUser).toEqual(createdUser);
  });

  test('should handle user preferences', async () => {
    const user = await userRepo.create({
      name: 'Test User',
      email: 'test@example.com',
      grade: 2
    });

    const preferences = {
      defaultDifficulty: 'medium' as const,
      showHints: true,
      problemsPerSession: 10
    };

    await userRepo.updatePreferences(user.id, preferences);
    
    const updatedUser = await userRepo.findById(user.id);
    expect(updatedUser!.preferences).toEqual(preferences);
  });

  test('should store and retrieve problems', async () => {
    const problemData = {
      type: 'addition' as const,
      operand1: 5,
      operand2: 3,
      answer: 8,
      question: '5 + 3 = ?',
      difficulty: 'easy' as const,
      grade: 1
    };

    const problem = await problemRepo.create(problemData);
    expect(problem).toMatchObject(problemData);

    const problems = await problemRepo.findByGradeAndDifficulty(1, 'easy');
    expect(problems).toContainEqual(problem);
  });
});
```

## 🎭 端到端测试

### Playwright配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E测试用例
```typescript
// e2e/practice-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Practice Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete a practice session', async ({ page }) => {
    // 设置练习参数
    await page.selectOption('[data-testid=grade-select]', '2');
    await page.selectOption('[data-testid=difficulty-select]', 'easy');
    await page.check('[data-testid=addition-checkbox]');
    await page.fill('[data-testid=problem-count]', '5');
    
    // 开始练习
    await page.click('[data-testid=start-practice]');
    
    // 等待题目加载
    await expect(page.locator('[data-testid=problem-question]')).toBeVisible();
    
    // 完成所有题目
    for (let i = 0; i < 5; i++) {
      const question = await page.locator('[data-testid=problem-question]').textContent();
      const answer = calculateAnswer(question!);
      
      await page.fill('[data-testid=answer-input]', answer.toString());
      await page.click('[data-testid=submit-answer]');
      
      if (i < 4) {
        await page.click('[data-testid=next-problem]');
      }
    }
    
    // 检查结果页面
    await expect(page.locator('[data-testid=results-page]')).toBeVisible();
    await expect(page.locator('[data-testid=score]')).toContainText(/\d+\/5/);
    await expect(page.locator('[data-testid=time-spent]')).toBeVisible();
  });

  test('should show hints when enabled', async ({ page }) => {
    await page.selectOption('[data-testid=grade-select]', '1');
    await page.check('[data-testid=show-hints]');
    await page.click('[data-testid=start-practice]');
    
    await expect(page.locator('[data-testid=problem-question]')).toBeVisible();
    
    // 点击提示按钮
    await page.click('[data-testid=hint-button]');
    await expect(page.locator('[data-testid=hint-content]')).toBeVisible();
  });

  test('should handle incorrect answers', async ({ page }) => {
    await page.selectOption('[data-testid=grade-select]', '1');
    await page.click('[data-testid=start-practice]');
    
    await expect(page.locator('[data-testid=problem-question]')).toBeVisible();
    
    // 输入错误答案
    await page.fill('[data-testid=answer-input]', '999');
    await page.click('[data-testid=submit-answer]');
    
    // 检查错误反馈
    await expect(page.locator('[data-testid=feedback]')).toContainText('错误');
    await expect(page.locator('[data-testid=correct-answer]')).toBeVisible();
  });
});

function calculateAnswer(question: string): number {
  const match = question.match(/(\d+)\s*([+\-×÷])\s*(\d+)/);
  if (!match) throw new Error('Invalid question format');
  
  const [, num1, operator, num2] = match;
  const a = parseInt(num1);
  const b = parseInt(num2);
  
  switch (operator) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return a / b;
    default: throw new Error('Unknown operator');
  }
}
```

## 📊 测试覆盖率

### 覆盖率配置
```json
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/generators/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### 覆盖率报告
```bash
# 生成覆盖率报告
npm run test:coverage

# 查看HTML报告
open coverage/lcov-report/index.html

# CI中的覆盖率检查
npm run test:coverage -- --watchAll=false --passWithNoTests
```

## 🚀 持续集成

### GitHub Actions配置
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 📝 测试最佳实践

### 测试命名
```typescript
// ✅ 描述性测试名称
describe('ProblemGenerator', () => {
  describe('when generating addition problems', () => {
    test('should create problems with positive operands for easy difficulty', () => {
      // 测试实现
    });
    
    test('should ensure result is within grade-appropriate range', () => {
      // 测试实现
    });
  });
});
```

### 测试数据管理
```typescript
// src/__tests__/fixtures/problems.ts
export const createMockProblem = (overrides: Partial<Problem> = {}): Problem => ({
  id: 'test-problem-1',
  type: 'addition',
  operand1: 5,
  operand2: 3,
  answer: 8,
  question: '5 + 3 = ?',
  difficulty: 'easy',
  grade: 1,
  ...overrides
});

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-1',
  name: 'Test User',
  email: 'test@example.com',
  grade: 2,
  createdAt: new Date(),
  ...overrides
});
```

### 异步测试
```typescript
// ✅ 正确处理异步操作
test('should handle async problem generation', async () => {
  const promise = generateProblemsAsync(config);
  
  // 测试loading状态
  expect(getLoadingState()).toBe(true);
  
  const result = await promise;
  
  // 测试完成状态
  expect(getLoadingState()).toBe(false);
  expect(result).toHaveLength(10);
});

// ✅ 使用waitFor处理异步UI更新
test('should show success message after submission', async () => {
  render(<ProblemForm onSubmit={mockSubmit} />);
  
  fireEvent.click(screen.getByRole('button', { name: /提交/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/提交成功/i)).toBeInTheDocument();
  });
});
```

### 错误测试
```typescript
// ✅ 测试错误情况
test('should handle network errors gracefully', async () => {
  const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
  global.fetch = mockFetch;
  
  const { result } = renderHook(() => useProblemGenerator());
  
  await act(async () => {
    await result.current.generateProblems(config);
  });
  
  expect(result.current.error).toBe('Network error');
  expect(result.current.problems).toEqual([]);
});
```

遵循这些测试指南将确保项目的代码质量和稳定性，提供可靠的用户体验。