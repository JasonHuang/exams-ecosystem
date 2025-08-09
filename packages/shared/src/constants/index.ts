import { Grade, Difficulty, ProblemType } from '../types';

// 年级配置
export const GRADE_CONFIG = {
  1: { name: '一年级', range: [1, 20] },
  2: { name: '二年级', range: [1, 100] },
  3: { name: '三年级', range: [1, 1000] },
  4: { name: '四年级', range: [1, 10000] },
  5: { name: '五年级', range: [1, 100000] },
  6: { name: '六年级', range: [1, 1000000] },
} as const;

// 难度配置
export const DIFFICULTY_CONFIG = {
  easy: { name: '简单', multiplier: 0.7 },
  medium: { name: '中等', multiplier: 1.0 },
  hard: { name: '困难', multiplier: 1.3 },
} as const;

// 题目类型配置
export const PROBLEM_TYPE_CONFIG = {
  addition: { name: '加法', symbol: '+' },
  subtraction: { name: '减法', symbol: '-' },
  multiplication: { name: '乘法', symbol: '×' },
  division: { name: '除法', symbol: '÷' },
  mixed: { name: '混合运算', symbol: '±×÷' },
  fraction: { name: '分数', symbol: '¼' },
  decimal: { name: '小数', symbol: '0.1' },
  geometry: { name: '几何', symbol: '△' },
  measurement: { name: '测量', symbol: '📏' },
  'word-problem': { name: '应用题', symbol: '📝' },
} as const;

// 默认设置
export const DEFAULT_SETTINGS = {
  problemCount: 20,
  difficulty: 'medium' as Difficulty,
  timeLimit: 1800, // 30分钟
  showAnswers: false,
  randomOrder: true,
  allowCalculator: false,
};

// 年级对应的题目类型
export const GRADE_PROBLEM_TYPES: Record<Grade, ProblemType[]> = {
  1: ['addition', 'subtraction'],
  2: ['addition', 'subtraction', 'multiplication'],
  3: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
  4: ['addition', 'subtraction', 'multiplication', 'division', 'mixed', 'fraction'],
  5: ['addition', 'subtraction', 'multiplication', 'division', 'mixed', 'fraction', 'decimal'],
  6: ['addition', 'subtraction', 'multiplication', 'division', 'mixed', 'fraction', 'decimal', 'geometry', 'measurement', 'word-problem'],
};

// API 端点
export const API_ENDPOINTS = {
  PROBLEMS: '/api/problems',
  EXERCISES: '/api/exercises',
  USERS: '/api/users',
  AUTH: '/api/auth',
  RECORDS: '/api/records',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  INVALID_GRADE: '无效的年级',
  INVALID_DIFFICULTY: '无效的难度',
  INVALID_PROBLEM_TYPE: '无效的题目类型',
  GENERATION_FAILED: '题目生成失败',
  NETWORK_ERROR: '网络错误',
  UNAUTHORIZED: '未授权访问',
  NOT_FOUND: '资源不存在',
} as const;