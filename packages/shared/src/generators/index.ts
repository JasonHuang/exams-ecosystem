import { Problem, GeneratorConfig, Grade, Difficulty, ProblemType, MathProblem, OperationType, DifficultyLevel, PracticeSettings } from '../types';
import { getRandomInt, generateId, getGradeRange, getDifficultyMultiplier, getRandomElement } from '../utils';

// 基础生成器接口
export interface ProblemGenerator {
  generate(config: GeneratorConfig): Problem[];
}

// 加法生成器
export class AdditionGenerator implements ProblemGenerator {
  generate(config: GeneratorConfig): Problem[] {
    const problems: Problem[] = [];
    const [min, max] = getGradeRange(config.grade);
    const multiplier = getDifficultyMultiplier(config.difficulty);
    
    for (let i = 0; i < config.count; i++) {
      const a = getRandomInt(min, Math.floor(max * multiplier));
      const b = getRandomInt(min, Math.floor(max * multiplier));
      const answer = a + b;
      
      problems.push({
        id: generateId(),
        question: `${a} + ${b} = `,
        answer,
        type: 'addition',
        difficulty: config.difficulty,
        grade: config.grade,
        metadata: {
          operands: [a, b],
          operation: '+',
          category: 'arithmetic'
        }
      });
    }
    
    return problems;
  }
}

// 减法生成器
export class SubtractionGenerator implements ProblemGenerator {
  generate(config: GeneratorConfig): Problem[] {
    const problems: Problem[] = [];
    const [min, max] = getGradeRange(config.grade);
    const multiplier = getDifficultyMultiplier(config.difficulty);
    
    for (let i = 0; i < config.count; i++) {
      const a = getRandomInt(min, Math.floor(max * multiplier));
      const b = getRandomInt(min, Math.min(a, Math.floor(max * multiplier)));
      const answer = a - b;
      
      problems.push({
        id: generateId(),
        question: `${a} - ${b} = `,
        answer,
        type: 'subtraction',
        difficulty: config.difficulty,
        grade: config.grade,
        metadata: {
          operands: [a, b],
          operation: '-',
          category: 'arithmetic'
        }
      });
    }
    
    return problems;
  }
}

// 乘法生成器
export class MultiplicationGenerator implements ProblemGenerator {
  generate(config: GeneratorConfig): Problem[] {
    const problems: Problem[] = [];
    const multiplier = getDifficultyMultiplier(config.difficulty);
    
    for (let i = 0; i < config.count; i++) {
      let a: number, b: number;
      
      if (config.grade <= 2) {
        a = getRandomInt(1, Math.floor(10 * multiplier));
        b = getRandomInt(1, Math.floor(10 * multiplier));
      } else if (config.grade <= 4) {
        a = getRandomInt(1, Math.floor(100 * multiplier));
        b = getRandomInt(1, Math.floor(100 * multiplier));
      } else {
        a = getRandomInt(1, Math.floor(1000 * multiplier));
        b = getRandomInt(1, Math.floor(100 * multiplier));
      }
      
      const answer = a * b;
      
      problems.push({
        id: generateId(),
        question: `${a} × ${b} = `,
        answer,
        type: 'multiplication',
        difficulty: config.difficulty,
        grade: config.grade,
        metadata: {
          operands: [a, b],
          operation: '×',
          category: 'arithmetic'
        }
      });
    }
    
    return problems;
  }
}

// 除法生成器
export class DivisionGenerator implements ProblemGenerator {
  generate(config: GeneratorConfig): Problem[] {
    const problems: Problem[] = [];
    const multiplier = getDifficultyMultiplier(config.difficulty);
    
    for (let i = 0; i < config.count; i++) {
      let divisor: number, quotient: number;
      
      if (config.grade <= 3) {
        divisor = getRandomInt(2, Math.floor(10 * multiplier));
        quotient = getRandomInt(1, Math.floor(10 * multiplier));
      } else if (config.grade <= 5) {
        divisor = getRandomInt(2, Math.floor(100 * multiplier));
        quotient = getRandomInt(1, Math.floor(100 * multiplier));
      } else {
        divisor = getRandomInt(2, Math.floor(1000 * multiplier));
        quotient = getRandomInt(1, Math.floor(1000 * multiplier));
      }
      
      const dividend = divisor * quotient;
      
      problems.push({
        id: generateId(),
        question: `${dividend} ÷ ${divisor} = `,
        answer: quotient,
        type: 'division',
        difficulty: config.difficulty,
        grade: config.grade,
        metadata: {
          operands: [dividend, divisor],
          operation: '÷',
          category: 'arithmetic'
        }
      });
    }
    
    return problems;
  }
}

// 生成器工厂
export class ProblemGeneratorFactory {
  private static generators: Map<ProblemType, ProblemGenerator> = new Map([
    ['addition', new AdditionGenerator()],
    ['subtraction', new SubtractionGenerator()],
    ['multiplication', new MultiplicationGenerator()],
    ['division', new DivisionGenerator()],
  ]);
  
  static getGenerator(type: ProblemType): ProblemGenerator | undefined {
    return this.generators.get(type);
  }
  
  static generateProblems(config: GeneratorConfig): Problem[] {
    const generator = this.getGenerator(config.type);
    if (!generator) {
      throw new Error(`No generator found for type: ${config.type}`);
    }
    
    return generator.generate(config);
  }
}

// 导出便捷函数
export function generateProblems(config: GeneratorConfig): Problem[] {
  return ProblemGeneratorFactory.generateProblems(config);
}

// ===== 原项目兼容的生成器函数 =====

// 根据难度级别获取数字范围
function getNumberRange(difficulty: DifficultyLevel, operation: OperationType) {
  const ranges = {
    easy: {
      addition: { min: 1, max: 20 },
      subtraction: { min: 1, max: 20 },
      multiplication: { min: 1, max: 10 },
      division: { min: 1, max: 10 }
    },
    medium: {
      addition: { min: 10, max: 100 },
      subtraction: { min: 10, max: 100 },
      multiplication: { min: 2, max: 20 },
      division: { min: 2, max: 20 }
    },
    hard: {
      addition: { min: 50, max: 500 },
      subtraction: { min: 50, max: 500 },
      multiplication: { min: 10, max: 50 },
      division: { min: 5, max: 50 }
    }
  };
  
  return ranges[difficulty][operation];
}

// 生成加法题
function generateAdditionProblem(difficulty: DifficultyLevel): { operand1: number, operand2: number, answer: number } {
  const range = getNumberRange(difficulty, 'addition');
  const operand1 = getRandomInt(range.min, range.max);
  const operand2 = getRandomInt(range.min, range.max);
  return {
    operand1,
    operand2,
    answer: operand1 + operand2
  };
}

// 生成减法题
function generateSubtractionProblem(difficulty: DifficultyLevel): { operand1: number, operand2: number, answer: number } {
  const range = getNumberRange(difficulty, 'subtraction');
  let operand1 = getRandomInt(range.min, range.max);
  let operand2 = getRandomInt(range.min, range.max);
  
  // 确保结果为正数
  if (operand1 < operand2) {
    [operand1, operand2] = [operand2, operand1];
  }
  
  return {
    operand1,
    operand2,
    answer: operand1 - operand2
  };
}

// 生成乘法题
function generateMultiplicationProblem(difficulty: DifficultyLevel): { operand1: number, operand2: number, answer: number } {
  const range = getNumberRange(difficulty, 'multiplication');
  const operand1 = getRandomInt(range.min, range.max);
  const operand2 = getRandomInt(range.min, range.max);
  return {
    operand1,
    operand2,
    answer: operand1 * operand2
  };
}

// 生成除法题
function generateDivisionProblem(difficulty: DifficultyLevel): { operand1: number, operand2: number, answer: number } {
  const range = getNumberRange(difficulty, 'division');
  const operand2 = getRandomInt(range.min, range.max);
  const answer = getRandomInt(1, range.max);
  const operand1 = operand2 * answer; // 确保整除
  
  return {
    operand1,
    operand2,
    answer
  };
}

// 生成单个数学题（原项目兼容）
export function generateMathProblem(type: OperationType, difficulty: DifficultyLevel): MathProblem {
  let problem: { operand1: number, operand2: number, answer: number };
  
  switch (type) {
    case 'addition':
      problem = generateAdditionProblem(difficulty);
      break;
    case 'subtraction':
      problem = generateSubtractionProblem(difficulty);
      break;
    case 'multiplication':
      problem = generateMultiplicationProblem(difficulty);
      break;
    case 'division':
      problem = generateDivisionProblem(difficulty);
      break;
    default:
      problem = generateAdditionProblem(difficulty);
  }
  
  return {
    id: generateId(),
    type,
    difficulty,
    ...problem
  };
}

// 生成练习题集（原项目兼容）
export function generatePracticeProblems(settings: PracticeSettings): MathProblem[] {
  const problems: MathProblem[] = [];
  const { operationType, difficulty, problemCount } = settings;
  
  for (let i = 0; i < problemCount; i++) {
    // 随机选择运算类型
    const randomType = getRandomElement(operationType);
    const problem = generateMathProblem(randomType, difficulty);
    problems.push(problem);
  }
  
  return problems;
}

// 获取运算符号
export function getOperationSymbol(type: OperationType): string {
  const symbols = {
    addition: '+',
    subtraction: '-',
    multiplication: '×',
    division: '÷'
  };
  return symbols[type];
}

// 格式化数学题显示
export function formatProblem(problem: MathProblem): string {
  const symbol = getOperationSymbol(problem.type);
  return `${problem.operand1} ${symbol} ${problem.operand2} = ?`;
}

// 打印功能相关生成器
import { PrintableSettings, PrintableProblem, PrintablePage } from '../types';



// 获取运算符号（打印版本）
function getPrintOperationSymbol(operation: string): string {
  const symbols = {
    multiplication: '×',
    addition: '+',
    subtraction: '-',
    division: '÷'
  };
  return symbols[operation as keyof typeof symbols] || '+';
}

// 生成单个打印题目
function generatePrintableProblem(settings: PrintableSettings): PrintableProblem {
  const { operationTypes, numberRange } = settings;
  
  // 如果没有选择运算类型，默认使用加法
  const validOperationTypes = (!operationTypes || operationTypes.length === 0) 
    ? ['addition'] 
    : operationTypes;
  
  // 随机选择运算类型
  const operationType = getRandomElement(validOperationTypes);
  
  let operand1: number, operand2: number, answer: number;

  switch (operationType) {
    case 'multiplication':
      operand1 = getRandomInt(numberRange.min, numberRange.max);
      operand2 = getRandomInt(numberRange.min, numberRange.max);
      answer = operand1 * operand2;
      break;
    
    case 'addition':
      operand1 = getRandomInt(numberRange.min, numberRange.max);
      operand2 = getRandomInt(numberRange.min, numberRange.max);
      answer = operand1 + operand2;
      break;
    
    case 'subtraction':
      operand1 = getRandomInt(numberRange.min, numberRange.max);
      operand2 = getRandomInt(numberRange.min, Math.min(operand1, numberRange.max));
      answer = operand1 - operand2;
      break;
    
    case 'division':
      // 确保整除
      operand2 = getRandomInt(numberRange.min, numberRange.max);
      answer = getRandomInt(1, numberRange.max);
      operand1 = operand2 * answer;
      break;
    
    default:
      operand1 = getRandomInt(numberRange.min, numberRange.max);
      operand2 = getRandomInt(numberRange.min, numberRange.max);
      answer = operand1 + operand2;
  }

  return {
    id: generateId(),
    operand1,
    operand2,
    answer,
    operation: getPrintOperationSymbol(operationType)
  };
}

// 生成可打印的习题页面
export function generatePrintablePages(settings: PrintableSettings): PrintablePage[] {
  const pages: PrintablePage[] = [];
  
  for (let pageNum = 1; pageNum <= settings.pageCount; pageNum++) {
    const problems: PrintableProblem[] = [];
    
    for (let i = 0; i < settings.problemsPerPage; i++) {
      problems.push(generatePrintableProblem(settings));
    }
    
    const operationNames = {
      multiplication: '乘法',
      addition: '加法',
      subtraction: '减法',
      division: '除法'
    };
    
    // 生成标题，如果是多种运算类型，显示"混合运算"
    let defaultTitle = '数学练习题';
    if (settings.operationTypes && settings.operationTypes.length > 0) {
      if (settings.operationTypes.length === 1) {
        defaultTitle = `${operationNames[settings.operationTypes[0]]}练习题`;
      } else {
        const typeNames = settings.operationTypes.map(type => operationNames[type]).join('、');
        defaultTitle = `${typeNames}混合练习题`;
      }
    }
    
    const title = settings.title || defaultTitle;
    
    pages.push({
      pageNumber: pageNum,
      problems,
      title: `${title} (第${pageNum}页)`
    });
  }
  
  return pages;
}

// 获取默认打印设置
export function getDefaultPrintableSettings(): PrintableSettings {
  return {
    operationTypes: ['multiplication'],
    problemsPerPage: 72,
    pageCount: 1,
    numberRange: { min: 1, max: 9 },
    title: '数学练习题',
    showAnswers: false
  };
}