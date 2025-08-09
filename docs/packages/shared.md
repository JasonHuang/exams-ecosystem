# Shared包文档

`@exams/shared` 是整个生态系统的核心共享包，提供类型定义、工具函数、题目生成器和常量配置。

## 📦 包概述

### 职责
- 定义所有数据结构和接口类型
- 提供数学计算和工具函数
- 实现各种题目生成算法
- 管理系统常量和配置

### 依赖关系
```
@exams/web ────┐
               ├──→ @exams/shared
@exams/api ────┤
               │
@exams/miniprogram ──┘
```

## 🏗️ 目录结构

```
packages/shared/
├── src/
│   ├── types/          # 类型定义
│   │   └── index.ts
│   ├── utils/          # 工具函数
│   │   └── index.ts
│   ├── generators/     # 题目生成器
│   │   └── index.ts
│   ├── constants/      # 常量配置
│   │   └── index.ts
│   └── index.ts        # 主入口文件
├── dist/               # 构建输出 (自动生成)
├── package.json
└── tsconfig.json
```

## 🔧 核心模块

### 1. Types (类型定义)

#### 基础类型
```typescript
// 年级类型
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

// 难度类型
export type Difficulty = 'easy' | 'medium' | 'hard';

// 运算类型
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

// 题目类型
export type ProblemType = 
  | 'addition' 
  | 'subtraction' 
  | 'multiplication' 
  | 'division' 
  | 'mixed' 
  | 'fraction' 
  | 'decimal' 
  | 'geometry' 
  | 'measurement' 
  | 'word-problem';
```

#### 核心接口
```typescript
// 数学题目接口
export interface MathProblem {
  operand1: number;
  operand2: number;
  operator: OperationType;
  answer: number;
  steps?: string[];
}

// 通用题目接口
export interface Problem {
  id: string;
  type: ProblemType;
  question: string;
  answer: number | string;
  grade: Grade;
  difficulty: Difficulty;
  metadata?: ProblemMetadata;
}

// 题目元数据
export interface ProblemMetadata {
  timeLimit?: number;
  hints?: string[];
  explanation?: string;
  tags?: string[];
}
```

#### 配置接口
```typescript
// 生成器配置
export interface GeneratorConfig {
  grade: Grade;
  difficulty: Difficulty;
  operationType: OperationType[];
  problemCount: number;
  allowNegative?: boolean;
  maxNumber?: number;
}

// 练习设置
export interface PracticeSettings {
  timeLimit?: number;
  showHints: boolean;
  showSteps: boolean;
  randomOrder: boolean;
}
```

### 2. Utils (工具函数)

#### 数学工具
```typescript
// 生成指定范围的随机整数
export function getRandomInt(min: number, max: number): number;

// 生成指定范围的随机浮点数
export function getRandomFloat(min: number, max: number, decimals?: number): number;

// 随机选择数组元素
export function getRandomElement<T>(array: T[]): T;

// 打乱数组
export function shuffleArray<T>(array: T[]): T[];
```

#### 分数工具
```typescript
// 最大公约数
export function gcd(a: number, b: number): number;

// 最小公倍数
export function lcm(a: number, b: number): number;

// 化简分数
export function simplifyFraction(numerator: number, denominator: number): [number, number];
```

#### 格式化工具
```typescript
// 格式化数字
export function formatNumber(num: number, decimals?: number): string;

// 格式化时间
export function formatTime(seconds: number): string;
```

#### 验证工具
```typescript
// 验证题目数据
export function validateProblem(problem: Problem): boolean;

// 类型检查
export function isProblemType(value: string): value is ProblemType;
export function isGrade(value: number): value is Grade;
export function isDifficulty(value: string): value is Difficulty;
```

#### 年级和难度工具
```typescript
// 获取年级数值范围
export function getGradeRange(grade: Grade): [number, number];

// 获取年级名称
export function getGradeName(grade: Grade): string;

// 获取难度系数
export function getDifficultyMultiplier(difficulty: Difficulty): number;

// 获取难度名称
export function getDifficultyName(difficulty: Difficulty): string;
```

### 3. Generators (题目生成器)

#### 基础生成器接口
```typescript
export interface ProblemGenerator {
  generate(config: GeneratorConfig): Problem[];
}
```

#### 四则运算生成器
```typescript
// 加法题目生成
export function generateAdditionProblem(difficulty: Difficulty): MathProblem;

// 减法题目生成
export function generateSubtractionProblem(difficulty: Difficulty): MathProblem;

// 乘法题目生成
export function generateMultiplicationProblem(difficulty: Difficulty): MathProblem;

// 除法题目生成
export function generateDivisionProblem(difficulty: Difficulty): MathProblem;

// 通用数学题目生成
export function generateMathProblem(type: OperationType, difficulty: Difficulty): Problem;
```

#### 批量生成器
```typescript
// 生成练习题目集合
export function generatePracticeProblems(
  operationType: OperationType[],
  difficulty: Difficulty,
  problemCount: number
): Problem[];

// 生成可打印题目
export function generatePrintableProblem(
  operationTypes: OperationType[],
  difficulty: Difficulty
): PrintableProblem;
```

#### 生成算法特点

**加法生成器**:
- 简单: 1-20范围内的加法
- 中等: 1-100范围内的加法，可能包含进位
- 困难: 1-1000范围内的多位数加法

**减法生成器**:
- 确保结果为正数
- 根据难度调整数值范围
- 避免借位过于复杂

**乘法生成器**:
- 简单: 1-10的乘法表
- 中等: 两位数乘一位数
- 困难: 两位数乘两位数

**除法生成器**:
- 确保整除结果
- 避免除数为0
- 根据难度调整复杂度

### 4. Constants (常量配置)

#### 年级配置
```typescript
export const GRADE_CONFIG = {
  1: { name: '一年级', range: [1, 20] },
  2: { name: '二年级', range: [1, 100] },
  3: { name: '三年级', range: [1, 1000] },
  4: { name: '四年级', range: [1, 10000] },
  5: { name: '五年级', range: [1, 100000] },
  6: { name: '六年级', range: [1, 1000000] }
} as const;
```

#### 难度配置
```typescript
export const DIFFICULTY_CONFIG = {
  easy: { name: '简单', multiplier: 0.5 },
  medium: { name: '中等', multiplier: 1.0 },
  hard: { name: '困难', multiplier: 1.5 }
} as const;
```

#### 题目类型配置
```typescript
export const PROBLEM_TYPE_CONFIG = {
  addition: { name: '加法', symbol: '+' },
  subtraction: { name: '减法', symbol: '-' },
  multiplication: { name: '乘法', symbol: '×' },
  division: { name: '除法', symbol: '÷' }
} as const;
```

## 🚀 使用示例

### 基础使用
```typescript
import { 
  generateMathProblem, 
  generatePracticeProblems,
  getRandomInt,
  validateProblem 
} from '@exams/shared';

// 生成单个题目
const problem = generateMathProblem('addition', 'medium');

// 生成题目集合
const problems = generatePracticeProblems(
  ['addition', 'subtraction'], 
  'easy', 
  10
);

// 使用工具函数
const randomNum = getRandomInt(1, 100);
const isValid = validateProblem(problem);
```

### 在Web应用中使用
```typescript
// packages/web/src/components/ProblemGenerator.tsx
import { generatePracticeProblems, type Problem } from '@exams/shared';

function ProblemGenerator() {
  const [problems, setProblems] = useState<Problem[]>([]);
  
  const handleGenerate = () => {
    const newProblems = generatePracticeProblems(
      ['addition', 'multiplication'],
      'medium',
      20
    );
    setProblems(newProblems);
  };
  
  return (
    <div>
      <button onClick={handleGenerate}>生成题目</button>
      {problems.map(problem => (
        <div key={problem.id}>{problem.question}</div>
      ))}
    </div>
  );
}
```

### 在API中使用
```typescript
// packages/api/src/app/api/problems/route.ts
import { generatePracticeProblems, validateProblem } from '@exams/shared';

export async function POST(request: Request) {
  const { operationType, difficulty, count } = await request.json();
  
  const problems = generatePracticeProblems(operationType, difficulty, count);
  
  // 验证生成的题目
  const validProblems = problems.filter(validateProblem);
  
  return Response.json({ problems: validProblems });
}
```

## 🔧 开发指南

### 添加新的题目类型

1. **定义类型**:
```typescript
// src/types/index.ts
export type ProblemType = 
  | 'addition' 
  | 'subtraction' 
  | 'multiplication' 
  | 'division'
  | 'fraction'  // 新增分数类型
  | 'decimal';  // 新增小数类型
```

2. **实现生成器**:
```typescript
// src/generators/index.ts
export function generateFractionProblem(difficulty: Difficulty): Problem {
  // 实现分数题目生成逻辑
}
```

3. **添加常量配置**:
```typescript
// src/constants/index.ts
export const PROBLEM_TYPE_CONFIG = {
  // ... 现有配置
  fraction: { name: '分数', symbol: '/' },
  decimal: { name: '小数', symbol: '.' }
} as const;
```

### 添加新的工具函数

```typescript
// src/utils/index.ts
export function newUtilFunction(param: string): string {
  // 实现新的工具函数
  return result;
}
```

### 构建和发布

```bash
# 构建包
npm run build

# 类型检查
npm run type-check

# 清理构建文件
npm run clean
```

## 🧪 测试

### 单元测试示例
```typescript
// __tests__/generators.test.ts
import { generateMathProblem, validateProblem } from '../src';

describe('Math Problem Generator', () => {
  test('should generate valid addition problem', () => {
    const problem = generateMathProblem('addition', 'easy');
    
    expect(validateProblem(problem)).toBe(true);
    expect(problem.type).toBe('addition');
    expect(problem.difficulty).toBe('easy');
  });
});
```

### 运行测试
```bash
cd packages/shared
npm test
```

## 📝 最佳实践

1. **类型安全**: 充分利用TypeScript的类型系统
2. **纯函数**: 保持函数的纯净性，避免副作用
3. **文档注释**: 为公共API添加JSDoc注释
4. **错误处理**: 适当的错误处理和验证
5. **性能优化**: 避免不必要的计算和内存分配

## 🔄 版本管理

Shared包的版本更新会影响所有依赖包，因此需要谨慎处理：

1. **语义化版本**: 遵循semver规范
2. **向后兼容**: 尽量保持API的向后兼容性
3. **变更日志**: 详细记录每次变更
4. **测试覆盖**: 确保充分的测试覆盖率

这个共享包是整个生态系统的基础，保持其稳定性和可靠性至关重要。