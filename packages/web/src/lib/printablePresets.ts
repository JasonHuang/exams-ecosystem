import { PresetTemplate, GradeInfo, PrintableGrade } from '@exams/shared';

// 年级信息
export const gradeInfo: GradeInfo[] = [
  { value: 'grade1', label: '一年级', description: '基础加减法练习' },
  { value: 'grade2', label: '二年级', description: '进阶加减法和简单乘法' },
  { value: 'grade3', label: '三年级', description: '乘法表和除法入门' },
  { value: 'grade4', label: '四年级', description: '四则运算综合练习' },
  { value: 'grade5', label: '五年级', description: '大数运算和混合运算' },
  { value: 'grade6', label: '六年级', description: '复杂四则运算' }
];

// 预设模板
export const presetTemplates: PresetTemplate[] = [
  // 一年级模板
  {
    id: 'grade1-within-5-add',
    name: '5以内加法',
    grade: 'grade1',
    operationTypes: ['addition'],
    numberRange: { min: 1, max: 5 },
    problemsPerPage: 72,
    title: '一年级5以内加法练习'
  },
  {
    id: 'grade1-within-5-sub',
    name: '5以内减法',
    grade: 'grade1',
    operationTypes: ['subtraction'],
    numberRange: { min: 1, max: 5 },
    problemsPerPage: 72,
    title: '一年级5以内减法练习'
  },
  {
    id: 'grade1-within-10-add',
    name: '10以内加法',
    grade: 'grade1',
    operationTypes: ['addition'],
    numberRange: { min: 1, max: 10 },
    problemsPerPage: 72,
    title: '一年级10以内加法练习'
  },
  {
    id: 'grade1-within-10-sub',
    name: '10以内减法',
    grade: 'grade1',
    operationTypes: ['subtraction'],
    numberRange: { min: 1, max: 10 },
    problemsPerPage: 72,
    title: '一年级10以内减法练习'
  },
  {
    id: 'grade1-within-10-mixed',
    name: '10以内加减混合',
    grade: 'grade1',
    operationTypes: ['addition', 'subtraction'],
    numberRange: { min: 1, max: 10 },
    problemsPerPage: 72,
    title: '一年级10以内加减法练习'
  },
  {
    id: 'grade1-within-20-no-carry',
    name: '20以内不进位加法',
    grade: 'grade1',
    operationTypes: ['addition'],
    numberRange: { min: 10, max: 20 },
    problemsPerPage: 72,
    title: '一年级20以内不进位加法练习'
  },
  {
    id: 'grade1-within-20-no-borrow',
    name: '20以内不退位减法',
    grade: 'grade1',
    operationTypes: ['subtraction'],
    numberRange: { min: 10, max: 20 },
    problemsPerPage: 72,
    title: '一年级20以内不退位减法练习'
  },
  {
    id: 'grade1-within-20-carry',
    name: '20以内进位加法',
    grade: 'grade1',
    operationTypes: ['addition'],
    numberRange: { min: 1, max: 20 },
    problemsPerPage: 72,
    title: '一年级20以内进位加法练习'
  },
  {
    id: 'grade1-within-20-borrow',
    name: '20以内退位减法',
    grade: 'grade1',
    operationTypes: ['subtraction'],
    numberRange: { min: 1, max: 20 },
    problemsPerPage: 72,
    title: '一年级20以内退位减法练习'
  },

  // 二年级模板
  {
    id: 'grade2-within-100-no-carry',
    name: '100以内不进位加法',
    grade: 'grade2',
    operationTypes: ['addition'],
    numberRange: { min: 10, max: 100 },
    problemsPerPage: 72,
    title: '二年级100以内不进位加法练习'
  },
  {
    id: 'grade2-within-100-no-borrow',
    name: '100以内不退位减法',
    grade: 'grade2',
    operationTypes: ['subtraction'],
    numberRange: { min: 10, max: 100 },
    problemsPerPage: 72,
    title: '二年级100以内不退位减法练习'
  },
  {
    id: 'grade2-within-100-carry',
    name: '100以内进位加法',
    grade: 'grade2',
    operationTypes: ['addition'],
    numberRange: { min: 1, max: 100 },
    problemsPerPage: 72,
    title: '二年级100以内进位加法练习'
  },
  {
    id: 'grade2-within-100-borrow',
    name: '100以内退位减法',
    grade: 'grade2',
    operationTypes: ['subtraction'],
    numberRange: { min: 1, max: 100 },
    problemsPerPage: 72,
    title: '二年级100以内退位减法练习'
  },
  {
    id: 'grade2-mult-table-1-5',
    name: '乘法口诀(1-5)',
    grade: 'grade2',
    operationTypes: ['multiplication'],
    numberRange: { min: 1, max: 5 },
    problemsPerPage: 72,
    title: '二年级乘法口诀(1-5)练习'
  },
  {
    id: 'grade2-mult-table-6-9',
    name: '乘法口诀(6-9)',
    grade: 'grade2',
    operationTypes: ['multiplication'],
    numberRange: { min: 6, max: 9 },
    problemsPerPage: 72,
    title: '二年级乘法口诀(6-9)练习'
  },
  {
    id: 'grade2-mult-table-all',
    name: '乘法口诀综合',
    grade: 'grade2',
    operationTypes: ['multiplication'],
    numberRange: { min: 1, max: 9 },
    problemsPerPage: 72,
    title: '二年级乘法口诀综合练习'
  },
  {
    id: 'grade2-easy-div',
    name: '简单除法练习',
    grade: 'grade2',
    operationTypes: ['division'],
    numberRange: { min: 1, max: 9 },
    problemsPerPage: 72,
    title: '二年级简单除法练习'
  },
  {
    id: 'grade2-comprehensive',
    name: '综合练习',
    grade: 'grade2',
    operationTypes: ['addition', 'subtraction', 'multiplication'],
    numberRange: { min: 1, max: 50 },
    problemsPerPage: 72,
    title: '二年级数学综合练习'
  },

  // 三年级模板
  {
    id: 'grade3-mult-div-basic',
    name: '乘除法基础练习',
    grade: 'grade3',
    operationTypes: ['multiplication', 'division'],
    numberRange: { min: 1, max: 100 },
    problemsPerPage: 72,
    title: '三年级乘除法基础练习'
  },
  {
    id: 'grade3-four-operations',
    name: '四则运算混合',
    grade: 'grade3',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 1, max: 100 },
    problemsPerPage: 72,
    title: '三年级四则运算混合练习'
  },
  {
    id: 'grade3-multi-digit',
    name: '多位数运算',
    grade: 'grade3',
    operationTypes: ['addition', 'subtraction', 'multiplication'],
    numberRange: { min: 10, max: 1000 },
    problemsPerPage: 72,
    title: '三年级多位数运算练习'
  },
  {
    id: 'grade3-within-1000-add-sub',
    name: '万以内加减法',
    grade: 'grade3',
    operationTypes: ['addition', 'subtraction'],
    numberRange: { min: 100, max: 1000 },
    problemsPerPage: 72,
    title: '三年级万以内加减法练习'
  },
  {
    id: 'grade3-multi-digit-mult',
    name: '多位数乘一位数',
    grade: 'grade3',
    operationTypes: ['multiplication'],
    numberRange: { min: 10, max: 999 },
    problemsPerPage: 72,
    title: '三年级多位数乘一位数练习'
  },

  // 四年级模板
  {
    id: 'grade4-large-numbers',
    name: '大数运算',
    grade: 'grade4',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 100, max: 10000 },
    problemsPerPage: 72,
    title: '四年级大数运算练习'
  },
  {
    id: 'grade4-multi-digit-mult',
    name: '多位数乘法',
    grade: 'grade4',
    operationTypes: ['multiplication'],
    numberRange: { min: 10, max: 999 },
    problemsPerPage: 72,
    title: '四年级多位数乘法练习'
  },
  {
    id: 'grade4-multi-digit-div',
    name: '多位数除法',
    grade: 'grade4',
    operationTypes: ['division'],
    numberRange: { min: 10, max: 999 },
    problemsPerPage: 72,
    title: '四年级多位数除法练习'
  },
  {
    id: 'grade4-comprehensive',
    name: '四则运算综合',
    grade: 'grade4',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 1, max: 1000 },
    problemsPerPage: 72,
    title: '四年级四则运算综合练习'
  },
  {
    id: 'grade4-decimal-basic',
    name: '小数基础运算',
    grade: 'grade4',
    operationTypes: ['addition', 'subtraction'],
    numberRange: { min: 1, max: 100 },
    problemsPerPage: 72,
    title: '四年级小数基础运算练习'
  },

  // 五年级模板
  {
    id: 'grade5-decimal-advanced',
    name: '小数四则运算',
    grade: 'grade5',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 1, max: 1000 },
    problemsPerPage: 72,
    title: '五年级小数四则运算练习'
  },
  {
    id: 'grade5-fraction-basic',
    name: '分数基础运算',
    grade: 'grade5',
    operationTypes: ['addition', 'subtraction'],
    numberRange: { min: 1, max: 20 },
    problemsPerPage: 72,
    title: '五年级分数基础运算练习'
  },
  {
    id: 'grade5-large-numbers',
    name: '大数运算',
    grade: 'grade5',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 100, max: 100000 },
    problemsPerPage: 72,
    title: '五年级大数运算练习'
  },
  {
    id: 'grade5-mixed-advanced',
    name: '混合运算',
    grade: 'grade5',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 1, max: 10000 },
    problemsPerPage: 72,
    title: '五年级混合运算练习'
  },

  // 六年级模板
  {
    id: 'grade6-fraction-advanced',
    name: '分数四则运算',
    grade: 'grade6',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 1, max: 50 },
    problemsPerPage: 72,
    title: '六年级分数四则运算练习'
  },
  {
    id: 'grade6-percentage',
    name: '百分数运算',
    grade: 'grade6',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 1, max: 100 },
    problemsPerPage: 72,
    title: '六年级百分数运算练习'
  },
  {
    id: 'grade6-complex',
    name: '复杂运算',
    grade: 'grade6',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 1, max: 1000 },
    problemsPerPage: 72,
    title: '六年级复杂运算练习'
  },
  {
    id: 'grade6-comprehensive',
    name: '综合提高',
    grade: 'grade6',
    operationTypes: ['addition', 'subtraction', 'multiplication', 'division'],
    numberRange: { min: 10, max: 10000 },
    problemsPerPage: 72,
    title: '六年级综合提高练习'
  }
];

// 根据年级获取预设模板
export function getPresetsByGrade(grade: PrintableGrade): PresetTemplate[] {
  return presetTemplates.filter(preset => preset.grade === grade);
}

// 根据ID获取预设模板
export function getPresetById(id: string): PresetTemplate | undefined {
  return presetTemplates.find(preset => preset.id === id);
}