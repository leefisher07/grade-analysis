import type { SubjectConfig } from '../types';

/**
 * 默认科目配置
 */
export const DEFAULT_SUBJECTS: SubjectConfig[] = [
  { id: '1', name: '语文', fullScore: 100, isRequired: true, order: 1 },
  { id: '2', name: '数学', fullScore: 100, isRequired: true, order: 2 },
  { id: '3', name: '英语', fullScore: 100, isRequired: true, order: 3 },
  { id: '4', name: '物理', fullScore: 100, isRequired: false, order: 4 },
  { id: '5', name: '化学', fullScore: 100, isRequired: false, order: 5 },
  { id: '6', name: '生物', fullScore: 100, isRequired: false, order: 6 },
  { id: '7', name: '政治', fullScore: 100, isRequired: false, order: 7 },
  { id: '8', name: '历史', fullScore: 100, isRequired: false, order: 8 },
  { id: '9', name: '地理', fullScore: 100, isRequired: false, order: 9 },
];

/**
 * localStorage 存储的 key
 */
export const LOCALSTORAGE_KEY = 'grade-analysis-subject-template';
