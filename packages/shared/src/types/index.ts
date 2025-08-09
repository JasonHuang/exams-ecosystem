// 基础类型定义 - 兼容原项目
export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type ProblemType = 
  | OperationType
  | 'mixed'
  | 'fraction'
  | 'decimal'
  | 'geometry'
  | 'measurement'
  | 'word-problem';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type DifficultyLevel = Difficulty; // 兼容原项目

// 原项目的MathProblem类型
export interface MathProblem {
  id: string;
  type: OperationType;
  operand1: number;
  operand2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
  difficulty: DifficultyLevel;
}

// 新的Problem类型（扩展版）
export interface Problem {
  id: string;
  question: string;
  answer: number | string;
  type: ProblemType;
  difficulty: Difficulty;
  grade: Grade;
  metadata?: ProblemMetadata;
}

export interface ProblemMetadata {
  operands?: number[];
  operation?: string;
  category?: string;
  tags?: string[];
  timeLimit?: number;
  hints?: string[];
}

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export interface ExerciseSet {
  id: string;
  title: string;
  description?: string;
  problems: Problem[];
  grade: Grade;
  type: ProblemType;
  createdAt: Date;
  settings: ExerciseSettings;
}

export interface ExerciseSettings {
  problemCount: number;
  difficulty: Difficulty;
  timeLimit?: number;
  showAnswers: boolean;
  randomOrder: boolean;
  allowCalculator: boolean;
}

// 生成器配置
export interface GeneratorConfig {
  type: ProblemType;
  grade: Grade;
  difficulty: Difficulty;
  count: number;
  settings?: Record<string, any>;
}

// 用户相关类型
export interface User {
  id: string;
  name: string;
  grade?: Grade;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  defaultGrade: Grade;
  defaultDifficulty: Difficulty;
  preferredTypes: ProblemType[];
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
}

// 原项目的练习设置和会话类型
export interface PracticeSettings {
  operationType: OperationType[];
  difficulty: DifficultyLevel;
  problemCount: number;
  timeLimit?: number;
  numberRange: {
    min: number;
    max: number;
  };
}

export interface PracticeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  problems: MathProblem[];
  score: number;
  totalTime: number;
  settings: PracticeSettings;
}

export interface UserStats {
  totalProblems: number;
  correctAnswers: number;
  averageTime: number;
  strongestOperation: OperationType;
  weakestOperation: OperationType;
  recentSessions: PracticeSession[];
}

// 练习记录
export interface ExerciseRecord {
  id: string;
  userId: string;
  exerciseSetId: string;
  startTime: Date;
  endTime?: Date;
  answers: Answer[];
  score?: number;
  completed: boolean;
}

export interface Answer {
  problemId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
}

// 可打印习题相关类型定义
export interface PrintableSettings {
  operationTypes: ('multiplication' | 'addition' | 'subtraction' | 'division')[]
  problemsPerPage: number
  pageCount: number
  numberRange: {
    min: number
    max: number
  }
  title?: string
  showAnswers?: boolean
}

// 年级类型
export type PrintableGrade = 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5' | 'grade6'

// 预设模板类型
export interface PresetTemplate {
  id: string
  name: string
  grade: PrintableGrade
  operationTypes: ('multiplication' | 'addition' | 'subtraction' | 'division')[]
  numberRange: {
    min: number
    max: number
  }
  problemsPerPage: number
  title: string
}

// 年级信息类型
export interface GradeInfo {
  value: PrintableGrade
  label: string
  description: string
}

export interface PrintableProblem {
  id: string
  operand1: number
  operand2: number
  answer: number
  operation: string
}

export interface PrintablePage {
  pageNumber: number
  problems: PrintableProblem[]
  title: string
}