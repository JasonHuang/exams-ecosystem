# 代码规范

本文档定义了小学数学练习生成器生态系统的代码规范和最佳实践。

## 🎯 总体原则

### 代码质量原则
- **可读性优先**: 代码应该易于理解和维护
- **一致性**: 保持整个项目的代码风格一致
- **简洁性**: 避免过度复杂的设计和实现
- **可测试性**: 编写易于测试的代码
- **性能意识**: 在保证可读性的前提下优化性能

### 开发原则
- **DRY (Don't Repeat Yourself)**: 避免代码重复
- **SOLID原则**: 遵循面向对象设计原则
- **关注点分离**: 明确模块职责边界
- **渐进式增强**: 优先实现核心功能

## 📝 TypeScript规范

### 类型定义
```typescript
// ✅ 好的做法：明确的类型定义
interface User {
  readonly id: string;
  name: string;
  email: string;
  grade?: Grade;
  createdAt: Date;
}

// ❌ 避免：使用any类型
function processData(data: any): any {
  return data;
}

// ✅ 好的做法：具体的类型
function processUserData(data: User): UserProfile {
  return {
    displayName: data.name,
    contactEmail: data.email
  };
}
```

### 接口和类型别名
```typescript
// ✅ 接口用于对象结构
interface ProblemConfig {
  grade: Grade;
  difficulty: Difficulty;
  count: number;
}

// ✅ 类型别名用于联合类型和基础类型
type Grade = 1 | 2 | 3 | 4 | 5 | 6;
type Status = 'pending' | 'completed' | 'failed';

// ✅ 泛型约束
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}
```

### 函数定义
```typescript
// ✅ 明确的参数和返回类型
function generateProblem(
  type: OperationType,
  difficulty: Difficulty
): Problem {
  // 实现
}

// ✅ 可选参数放在最后
function createUser(
  name: string,
  email: string,
  grade?: Grade
): User {
  // 实现
}

// ✅ 使用函数重载处理复杂情况
function format(value: number): string;
function format(value: Date): string;
function format(value: number | Date): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value.toISOString();
}
```

### 枚举和常量
```typescript
// ✅ 使用const断言创建只读对象
export const DIFFICULTY_CONFIG = {
  easy: { name: '简单', multiplier: 0.5 },
  medium: { name: '中等', multiplier: 1.0 },
  hard: { name: '困难', multiplier: 1.5 }
} as const;

// ✅ 字符串枚举
enum ProblemType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication',
  DIVISION = 'division'
}

// ✅ 联合类型替代简单枚举
type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';
```

## ⚛️ React规范

### 组件定义
```typescript
// ✅ 函数组件使用箭头函数
interface ProblemCardProps {
  problem: Problem;
  onAnswer: (answer: number) => void;
  showHints?: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  onAnswer,
  showHints = false
}) => {
  // 组件实现
  return (
    <div className="problem-card">
      {/* JSX */}
    </div>
  );
};

// ✅ 默认导出用于页面组件
export default function HomePage() {
  return <div>Home Page</div>;
}
```

### Hooks使用
```typescript
// ✅ 自定义Hook
function useProblemGenerator(config: GeneratorConfig) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newProblems = await generatePracticeProblems(config);
      setProblems(newProblems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [config]);

  return { problems, loading, error, generateProblems };
}

// ✅ 使用useCallback优化性能
const handleSubmit = useCallback((answer: number) => {
  onAnswer(answer);
}, [onAnswer]);

// ✅ 使用useMemo缓存计算结果
const filteredProblems = useMemo(() => {
  return problems.filter(p => p.difficulty === selectedDifficulty);
}, [problems, selectedDifficulty]);
```

### 状态管理
```typescript
// ✅ Zustand store定义
interface PracticeStore {
  problems: Problem[];
  currentIndex: number;
  answers: Answer[];
  
  // Actions
  setProblems: (problems: Problem[]) => void;
  nextProblem: () => void;
  submitAnswer: (answer: Answer) => void;
  reset: () => void;
}

export const usePracticeStore = create<PracticeStore>((set, get) => ({
  problems: [],
  currentIndex: 0,
  answers: [],
  
  setProblems: (problems) => set({ problems, currentIndex: 0 }),
  
  nextProblem: () => set((state) => ({
    currentIndex: Math.min(state.currentIndex + 1, state.problems.length - 1)
  })),
  
  submitAnswer: (answer) => set((state) => ({
    answers: [...state.answers, answer]
  })),
  
  reset: () => set({
    problems: [],
    currentIndex: 0,
    answers: []
  })
}));
```

## 🎨 样式规范

### Tailwind CSS
```typescript
// ✅ 使用cn工具函数合并类名
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        // 变体样式
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
        },
        // 尺寸样式
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### CSS模块化
```typescript
// ✅ 使用CSS变量
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --spacing-unit: 0.25rem;
  --border-radius: 0.375rem;
}

// ✅ 语义化类名
.problem-card {
  @apply bg-white rounded-lg shadow-md p-6;
  border: 1px solid var(--color-secondary);
}

.problem-card__question {
  @apply text-lg font-semibold mb-4;
  color: var(--color-primary);
}
```

## 📁 文件和目录规范

### 目录结构
```
packages/
├── shared/
│   ├── src/
│   │   ├── types/           # 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── generators/      # 业务逻辑
│   │   ├── constants/       # 常量
│   │   └── index.ts         # 统一导出
│   └── package.json
├── web/
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React组件
│   │   │   ├── ui/          # 基础UI组件
│   │   │   └── features/    # 功能组件
│   │   ├── lib/             # 工具库
│   │   ├── hooks/           # 自定义Hooks
│   │   └── stores/          # 状态管理
│   └── package.json
└── api/
    ├── src/
    │   └── app/
    │       └── api/         # API路由
    ├── prisma/              # 数据库
    └── package.json
```

### 文件命名
```
// ✅ 组件文件：PascalCase
ProblemCard.tsx
UserProfile.tsx
SettingsPanel.tsx

// ✅ 工具文件：camelCase
mathUtils.ts
formatHelpers.ts
apiClient.ts

// ✅ 常量文件：camelCase
gradeConfig.ts
difficultyLevels.ts

// ✅ 类型文件：camelCase
userTypes.ts
problemTypes.ts

// ✅ Hook文件：camelCase (use前缀)
useProblemGenerator.ts
useLocalStorage.ts
```

### 导入导出规范
```typescript
// ✅ 命名导出用于工具函数和组件
export const generateProblem = () => {};
export const ProblemCard = () => {};

// ✅ 默认导出用于页面和主要组件
export default function HomePage() {}

// ✅ 统一导出文件
// src/components/index.ts
export { ProblemCard } from './ProblemCard';
export { UserProfile } from './UserProfile';
export { default as HomePage } from './HomePage';

// ✅ 导入顺序
import React from 'react';                    // 外部库
import { NextPage } from 'next';              // 框架相关

import { Button } from '@/components/ui';     // 内部组件
import { generateProblem } from '@/lib/utils'; // 内部工具

import type { Problem } from '@exams/shared'; // 类型导入
```

## 🧪 测试规范

### 测试文件结构
```
src/
├── components/
│   ├── ProblemCard.tsx
│   └── __tests__/
│       └── ProblemCard.test.tsx
├── utils/
│   ├── mathUtils.ts
│   └── __tests__/
│       └── mathUtils.test.ts
└── __tests__/
    └── integration/
        └── problemGeneration.test.ts
```

### 测试编写规范
```typescript
// ✅ 描述性测试名称
describe('ProblemCard Component', () => {
  test('should display problem question correctly', () => {
    const problem: Problem = {
      id: '1',
      type: 'addition',
      question: '2 + 3 = ?',
      answer: 5,
      grade: 1,
      difficulty: 'easy'
    };

    render(<ProblemCard problem={problem} onAnswer={jest.fn()} />);
    
    expect(screen.getByText('2 + 3 = ?')).toBeInTheDocument();
  });

  test('should call onAnswer when answer is submitted', () => {
    const mockOnAnswer = jest.fn();
    const problem: Problem = createMockProblem();

    render(<ProblemCard problem={problem} onAnswer={mockOnAnswer} />);
    
    fireEvent.click(screen.getByRole('button', { name: /提交/i }));
    
    expect(mockOnAnswer).toHaveBeenCalledWith(5);
  });
});

// ✅ 工具函数测试
describe('Math Utils', () => {
  describe('getRandomInt', () => {
    test('should return number within specified range', () => {
      const result = getRandomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(Number.isInteger(result)).toBe(true);
    });

    test('should handle edge cases', () => {
      expect(getRandomInt(5, 5)).toBe(5);
      expect(() => getRandomInt(10, 1)).toThrow();
    });
  });
});
```

## 📝 注释规范

### JSDoc注释
```typescript
/**
 * 生成指定类型和难度的数学题目
 * 
 * @param type - 运算类型
 * @param difficulty - 难度级别
 * @returns 生成的题目对象
 * 
 * @example
 * ```typescript
 * const problem = generateMathProblem('addition', 'easy');
 * console.log(problem.question); // "2 + 3 = ?"
 * ```
 */
export function generateMathProblem(
  type: OperationType,
  difficulty: Difficulty
): Problem {
  // 实现
}

/**
 * 用户配置接口
 */
interface UserConfig {
  /** 用户唯一标识符 */
  id: string;
  /** 用户显示名称 */
  name: string;
  /** 用户年级 (1-6) */
  grade: Grade;
  /** 用户偏好设置 */
  preferences?: {
    /** 默认难度级别 */
    defaultDifficulty: Difficulty;
    /** 是否显示提示 */
    showHints: boolean;
  };
}
```

### 代码注释
```typescript
// ✅ 解释复杂逻辑
function generateDivisionProblem(difficulty: Difficulty): MathProblem {
  // 除法题目采用逆向生成，先确定商和除数，再计算被除数
  // 这样可以确保结果为整数，避免小数运算
  const divisor = getRandomInt(2, 10);
  const quotient = getRandomInt(1, getDifficultyRange(difficulty));
  const dividend = divisor * quotient;
  
  return {
    operand1: dividend,
    operand2: divisor,
    operator: 'division',
    answer: quotient
  };
}

// ✅ 标记TODO和FIXME
function complexCalculation(data: number[]): number {
  // TODO: 优化算法性能，考虑使用缓存
  // FIXME: 处理空数组的边界情况
  
  return data.reduce((sum, num) => sum + num, 0);
}
```

## 🚨 错误处理规范

### 错误类型定义
```typescript
// ✅ 自定义错误类
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class GenerationError extends Error {
  constructor(
    message: string,
    public config: GeneratorConfig
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}
```

### 错误处理模式
```typescript
// ✅ Result模式
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export function safeGenerateProblem(
  type: OperationType,
  difficulty: Difficulty
): Result<Problem> {
  try {
    const problem = generateMathProblem(type, difficulty);
    return { success: true, data: problem };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ✅ 使用Result模式
const result = safeGenerateProblem('addition', 'easy');
if (result.success) {
  console.log(result.data.question);
} else {
  console.error(result.error.message);
}
```

## 🔧 工具配置

### ESLint配置
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Git提交规范
```bash
# 提交消息格式
<type>(<scope>): <description>

# 类型
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式调整
refactor: 重构
test:     测试相关
chore:    构建工具或辅助工具的变动

# 示例
feat(generators): add fraction problem generator
fix(web): resolve problem display issue
docs(api): update authentication documentation
```

遵循这些代码规范将确保项目的代码质量、可维护性和团队协作效率。