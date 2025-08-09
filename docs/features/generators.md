# 题目生成器

题目生成器是系统的核心功能，负责根据不同的参数生成各种类型的数学题目。

## 🎯 设计目标

- **智能化**: 根据年级和难度自动调整题目复杂度
- **多样化**: 支持多种题目类型和运算方式
- **可扩展**: 易于添加新的题目类型和生成算法
- **高质量**: 确保生成的题目符合教学要求

## 🏗️ 架构设计

### 生成器层次结构

```
题目生成器
├── 基础生成器 (BaseGenerator)
│   ├── 四则运算生成器
│   │   ├── 加法生成器 (AdditionGenerator)
│   │   ├── 减法生成器 (SubtractionGenerator)
│   │   ├── 乘法生成器 (MultiplicationGenerator)
│   │   └── 除法生成器 (DivisionGenerator)
│   ├── 分数生成器 (FractionGenerator) [规划中]
│   ├── 小数生成器 (DecimalGenerator) [规划中]
│   └── 应用题生成器 (WordProblemGenerator) [规划中]
├── 复合生成器 (CompositeGenerator)
│   ├── 混合运算生成器
│   └── 综合练习生成器
└── 专用生成器 (SpecializedGenerator)
    ├── 打印版生成器
    └── 考试版生成器
```

### 核心接口

```typescript
interface ProblemGenerator {
  generate(config: GeneratorConfig): Problem[];
}

interface GeneratorConfig {
  grade: Grade;
  difficulty: Difficulty;
  operationType: OperationType[];
  problemCount: number;
  allowNegative?: boolean;
  maxNumber?: number;
}
```

## 🔢 四则运算生成器

### 加法生成器

#### 算法逻辑
```typescript
function generateAdditionProblem(difficulty: Difficulty): MathProblem {
  const ranges = {
    easy: { min: 1, max: 20 },
    medium: { min: 1, max: 100 },
    hard: { min: 1, max: 1000 }
  };
  
  const range = ranges[difficulty];
  const operand1 = getRandomInt(range.min, range.max);
  const operand2 = getRandomInt(range.min, range.max);
  
  return {
    operand1,
    operand2,
    operator: 'addition',
    answer: operand1 + operand2
  };
}
```

#### 特殊规则
- **进位控制**: 中等难度50%概率包含进位
- **数位限制**: 根据年级限制数位数
- **美观性**: 避免过于简单或复杂的组合

### 减法生成器

#### 算法逻辑
```typescript
function generateSubtractionProblem(difficulty: Difficulty): MathProblem {
  const ranges = {
    easy: { min: 1, max: 20 },
    medium: { min: 1, max: 100 },
    hard: { min: 1, max: 1000 }
  };
  
  const range = ranges[difficulty];
  let operand1 = getRandomInt(range.min, range.max);
  let operand2 = getRandomInt(range.min, range.max);
  
  // 确保结果为正数
  if (operand1 < operand2) {
    [operand1, operand2] = [operand2, operand1];
  }
  
  return {
    operand1,
    operand2,
    operator: 'subtraction',
    answer: operand1 - operand2
  };
}
```

#### 特殊规则
- **正数保证**: 确保结果始终为正数
- **借位控制**: 根据难度控制借位复杂度
- **零值避免**: 避免结果为零的情况

### 乘法生成器

#### 算法逻辑
```typescript
function generateMultiplicationProblem(difficulty: Difficulty): MathProblem {
  const configs = {
    easy: { 
      operand1: { min: 1, max: 10 },
      operand2: { min: 1, max: 10 }
    },
    medium: { 
      operand1: { min: 1, max: 99 },
      operand2: { min: 1, max: 9 }
    },
    hard: { 
      operand1: { min: 10, max: 99 },
      operand2: { min: 10, max: 99 }
    }
  };
  
  const config = configs[difficulty];
  const operand1 = getRandomInt(config.operand1.min, config.operand1.max);
  const operand2 = getRandomInt(config.operand2.min, config.operand2.max);
  
  return {
    operand1,
    operand2,
    operator: 'multiplication',
    answer: operand1 * operand2
  };
}
```

#### 特殊规则
- **乘法表优先**: 简单难度优先使用乘法表
- **位数控制**: 根据难度控制操作数位数
- **特殊数避免**: 避免乘以1或0的情况

### 除法生成器

#### 算法逻辑
```typescript
function generateDivisionProblem(difficulty: Difficulty): MathProblem {
  const ranges = {
    easy: { min: 1, max: 10 },
    medium: { min: 1, max: 100 },
    hard: { min: 1, max: 1000 }
  };
  
  const range = ranges[difficulty];
  const operand2 = getRandomInt(2, 10); // 除数
  const quotient = getRandomInt(range.min, range.max); // 商
  const operand1 = operand2 * quotient; // 被除数
  
  return {
    operand1,
    operand2,
    operator: 'division',
    answer: quotient
  };
}
```

#### 特殊规则
- **整除保证**: 确保结果为整数
- **除数限制**: 除数不为0且不为1
- **逆向生成**: 通过商和除数计算被除数

## 🎲 随机化策略

### 数值随机化
```typescript
// 基础随机整数
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 加权随机选择
function getWeightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}
```

### 题目类型随机化
```typescript
function getRandomElement<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)];
}

// 在批量生成中使用
function generatePracticeProblems(
  operationType: OperationType[],
  difficulty: Difficulty,
  problemCount: number
): Problem[] {
  const problems: Problem[] = [];
  
  for (let i = 0; i < problemCount; i++) {
    const randomType = getRandomElement(operationType);
    const problem = generateMathProblem(randomType, difficulty);
    problems.push(problem);
  }
  
  return problems;
}
```

## 🎯 难度控制

### 难度参数
```typescript
const DIFFICULTY_CONFIG = {
  easy: {
    name: '简单',
    multiplier: 0.5,
    maxDigits: 2,
    allowCarry: false,
    allowBorrow: false
  },
  medium: {
    name: '中等',
    multiplier: 1.0,
    maxDigits: 3,
    allowCarry: true,
    allowBorrow: true
  },
  hard: {
    name: '困难',
    multiplier: 1.5,
    maxDigits: 4,
    allowCarry: true,
    allowBorrow: true
  }
} as const;
```

### 自适应难度
```typescript
function getAdaptiveDifficulty(
  grade: Grade,
  baseDifficulty: Difficulty,
  userPerformance?: number
): Difficulty {
  // 根据年级调整基础难度
  const gradeAdjustment = {
    1: -0.5, 2: -0.3, 3: 0, 4: 0.2, 5: 0.4, 6: 0.5
  };
  
  // 根据用户表现调整
  const performanceAdjustment = userPerformance 
    ? (userPerformance - 0.7) * 0.5 
    : 0;
  
  const difficultyScore = 
    DIFFICULTY_CONFIG[baseDifficulty].multiplier +
    gradeAdjustment[grade] +
    performanceAdjustment;
  
  if (difficultyScore <= 0.6) return 'easy';
  if (difficultyScore <= 1.2) return 'medium';
  return 'hard';
}
```

## 🔧 质量控制

### 题目验证
```typescript
function validateProblem(problem: Problem): boolean {
  // 基础字段检查
  if (!problem.id || !problem.question || problem.answer === undefined) {
    return false;
  }
  
  // 类型检查
  if (!isProblemType(problem.type)) {
    return false;
  }
  
  // 年级检查
  if (!isGrade(problem.grade)) {
    return false;
  }
  
  // 难度检查
  if (!isDifficulty(problem.difficulty)) {
    return false;
  }
  
  // 数值合理性检查
  if (typeof problem.answer === 'number') {
    if (problem.answer < 0 || problem.answer > 1000000) {
      return false;
    }
  }
  
  return true;
}
```

### 重复检测
```typescript
function removeDuplicateProblems(problems: Problem[]): Problem[] {
  const seen = new Set<string>();
  return problems.filter(problem => {
    const key = `${problem.type}-${problem.question}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
```

### 平衡性检查
```typescript
function ensureBalance(problems: Problem[]): Problem[] {
  const typeCount = new Map<ProblemType, number>();
  
  // 统计各类型题目数量
  problems.forEach(problem => {
    const count = typeCount.get(problem.type) || 0;
    typeCount.set(problem.type, count + 1);
  });
  
  // 检查是否平衡
  const counts = Array.from(typeCount.values());
  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);
  
  // 如果差异过大，重新生成
  if (maxCount - minCount > 2) {
    return rebalanceProblems(problems);
  }
  
  return problems;
}
```

## 🎨 题目格式化

### 问题文本生成
```typescript
function formatQuestion(mathProblem: MathProblem): string {
  const { operand1, operand2, operator } = mathProblem;
  
  const symbols = {
    addition: '+',
    subtraction: '-',
    multiplication: '×',
    division: '÷'
  };
  
  return `${operand1} ${symbols[operator]} ${operand2} = ?`;
}
```

### 步骤解析生成
```typescript
function generateSteps(mathProblem: MathProblem): string[] {
  const { operand1, operand2, operator, answer } = mathProblem;
  
  switch (operator) {
    case 'addition':
      return [
        `计算 ${operand1} + ${operand2}`,
        `= ${answer}`
      ];
    
    case 'multiplication':
      if (operand1 <= 10 && operand2 <= 10) {
        return [
          `根据乘法表：${operand1} × ${operand2} = ${answer}`
        ];
      }
      return [
        `计算 ${operand1} × ${operand2}`,
        `= ${answer}`
      ];
    
    default:
      return [`${operand1} ${operator} ${operand2} = ${answer}`];
  }
}
```

## 🚀 性能优化

### 批量生成优化
```typescript
function generateBatch(
  config: GeneratorConfig,
  batchSize: number = 100
): Problem[] {
  const problems: Problem[] = [];
  const { operationType, difficulty, problemCount } = config;
  
  // 预计算随机序列
  const typeSequence = Array.from(
    { length: problemCount },
    () => getRandomElement(operationType)
  );
  
  // 批量生成
  for (let i = 0; i < problemCount; i += batchSize) {
    const batch = typeSequence
      .slice(i, i + batchSize)
      .map(type => generateMathProblem(type, difficulty));
    
    problems.push(...batch);
  }
  
  return problems;
}
```

### 缓存策略
```typescript
const generatorCache = new Map<string, Problem[]>();

function getCachedProblems(config: GeneratorConfig): Problem[] | null {
  const key = JSON.stringify(config);
  return generatorCache.get(key) || null;
}

function setCachedProblems(config: GeneratorConfig, problems: Problem[]): void {
  const key = JSON.stringify(config);
  generatorCache.set(key, problems);
  
  // 限制缓存大小
  if (generatorCache.size > 100) {
    const firstKey = generatorCache.keys().next().value;
    generatorCache.delete(firstKey);
  }
}
```

## 🧪 测试策略

### 单元测试
```typescript
describe('Addition Generator', () => {
  test('should generate valid addition problems', () => {
    const problem = generateAdditionProblem('easy');
    
    expect(problem.operator).toBe('addition');
    expect(problem.answer).toBe(problem.operand1 + problem.operand2);
    expect(problem.operand1).toBeGreaterThan(0);
    expect(problem.operand2).toBeGreaterThan(0);
  });
  
  test('should respect difficulty constraints', () => {
    const easyProblem = generateAdditionProblem('easy');
    const hardProblem = generateAdditionProblem('hard');
    
    expect(easyProblem.operand1).toBeLessThanOrEqual(20);
    expect(hardProblem.operand1).toBeLessThanOrEqual(1000);
  });
});
```

### 集成测试
```typescript
describe('Problem Generation Integration', () => {
  test('should generate balanced problem sets', () => {
    const problems = generatePracticeProblems(
      ['addition', 'subtraction'],
      'medium',
      20
    );
    
    const additionCount = problems.filter(p => p.type === 'addition').length;
    const subtractionCount = problems.filter(p => p.type === 'subtraction').length;
    
    expect(Math.abs(additionCount - subtractionCount)).toBeLessThanOrEqual(2);
  });
});
```

## 🔮 未来扩展

### 分数运算生成器
```typescript
interface FractionProblem extends Problem {
  numerator1: number;
  denominator1: number;
  numerator2: number;
  denominator2: number;
  resultNumerator: number;
  resultDenominator: number;
}

function generateFractionProblem(
  operation: 'add' | 'subtract' | 'multiply' | 'divide',
  difficulty: Difficulty
): FractionProblem {
  // 实现分数运算生成逻辑
}
```

### 应用题生成器
```typescript
interface WordProblem extends Problem {
  scenario: string;
  variables: Record<string, number>;
  template: string;
}

function generateWordProblem(
  scenario: 'shopping' | 'time' | 'distance',
  difficulty: Difficulty
): WordProblem {
  // 实现应用题生成逻辑
}
```

### AI辅助生成
```typescript
interface AIGeneratorConfig extends GeneratorConfig {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  weakAreas: ProblemType[];
  strengths: ProblemType[];
}

function generateAIProblems(config: AIGeneratorConfig): Problem[] {
  // 基于AI的个性化题目生成
}
```

题目生成器是整个系统的核心，通过精心设计的算法和严格的质量控制，确保生成高质量、多样化的数学题目，为学生提供优质的练习体验。