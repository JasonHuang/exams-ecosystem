import { Grade, Difficulty, Problem, ProblemType } from '../types';
import { GRADE_CONFIG, DIFFICULTY_CONFIG } from '../constants';

// 数学工具函数
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// 年级相关工具
export function getGradeRange(grade: Grade): [number, number] {
  const range = GRADE_CONFIG[grade].range;
  return [range[0], range[1]];
}

export function getGradeName(grade: Grade): string {
  return GRADE_CONFIG[grade].name;
}

// 难度相关工具
export function getDifficultyMultiplier(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIG[difficulty].multiplier;
}

export function getDifficultyName(difficulty: Difficulty): string {
  return DIFFICULTY_CONFIG[difficulty].name;
}

// 题目验证
export function validateProblem(problem: Problem): boolean {
  if (!problem.id || !problem.question || problem.answer === undefined) {
    return false;
  }
  
  if (!['addition', 'subtraction', 'multiplication', 'division', 'mixed', 'fraction', 'decimal', 'geometry', 'measurement', 'word-problem'].includes(problem.type)) {
    return false;
  }
  
  if (![1, 2, 3, 4, 5, 6].includes(problem.grade)) {
    return false;
  }
  
  if (!['easy', 'medium', 'hard'].includes(problem.difficulty)) {
    return false;
  }
  
  return true;
}

// 格式化工具
export function formatNumber(num: number, decimals?: number): string {
  if (decimals !== undefined) {
    return num.toFixed(decimals);
  }
  return num.toString();
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 分数工具
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function simplifyFraction(numerator: number, denominator: number): [number, number] {
  const divisor = gcd(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
}

// 数组工具
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomElement<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)];
}

// ID生成
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// 类型检查
export function isProblemType(value: string): value is ProblemType {
  return ['addition', 'subtraction', 'multiplication', 'division', 'mixed', 'fraction', 'decimal', 'geometry', 'measurement', 'word-problem'].includes(value);
}

export function isGrade(value: number): value is Grade {
  return [1, 2, 3, 4, 5, 6].includes(value);
}

export function isDifficulty(value: string): value is Difficulty {
  return ['easy', 'medium', 'hard'].includes(value);
}