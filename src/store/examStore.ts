import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamRecord, Student, ExamConfig } from '../types';

interface ExamStore {
  // 状态
  examHistory: ExamRecord[];          // 历史考试记录
  currentExamId: string | null;       // 当前选中的考试ID
  students: Student[];                // 当前考试的学生列表
  examName: string;                   // 当前考试名称
  className?: string;                 // 当前班级名称
  configs: ExamConfig | null;         // 当前考试配置

  // 方法
  addExam: (exam: ExamRecord) => void;
  removeExam: (examId: string) => void;
  setCurrentExam: (examId: string) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  updateConfig: (config: Partial<ExamConfig>) => void;
  clearAll: () => void;
  importBackup: (data: { examHistory: ExamRecord[] }) => void;
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      examHistory: [],
      currentExamId: null,
      students: [],
      examName: '',
      className: undefined,
      configs: null,

      // 添加考试记录
      addExam: (exam) => {
        set((state) => ({
          examHistory: [...state.examHistory, exam],
          currentExamId: exam.id,
          students: exam.students,
          examName: exam.name,
          className: exam.className,
          configs: exam.configs,
        }));
      },

      // 删除考试记录
      removeExam: (examId) => {
        set((state) => {
          const newHistory = state.examHistory.filter((e) => e.id !== examId);
          const isCurrentExam = state.currentExamId === examId;

          return {
            examHistory: newHistory,
            currentExamId: isCurrentExam ? (newHistory[0]?.id || null) : state.currentExamId,
            students: isCurrentExam ? (newHistory[0]?.students || []) : state.students,
            examName: isCurrentExam ? (newHistory[0]?.name || '') : state.examName,
            className: isCurrentExam ? newHistory[0]?.className : state.className,
            configs: isCurrentExam ? (newHistory[0]?.configs || null) : state.configs,
          };
        });
      },

      // 设置当前考试
      setCurrentExam: (examId) => {
        const exam = get().examHistory.find((e) => e.id === examId);
        if (exam) {
          set({
            currentExamId: examId,
            students: exam.students,
            examName: exam.name,
            className: exam.className,
            configs: exam.configs,
          });
        }
      },

      // 更新学生信息
      updateStudent: (studentId, updates) => {
        set((state) => {
          const updatedStudents = state.students.map((student) =>
            student.id === studentId ? { ...student, ...updates } : student
          );

          // 同时更新历史记录中的数据
          const updatedHistory = state.examHistory.map((exam) =>
            exam.id === state.currentExamId
              ? { ...exam, students: updatedStudents }
              : exam
          );

          return {
            students: updatedStudents,
            examHistory: updatedHistory,
          };
        });
      },

      // 更新配置
      updateConfig: (config) => {
        set((state) => {
          if (!state.configs) return state;

          const updatedConfig = { ...state.configs, ...config };

          // 同时更新历史记录中的配置
          const updatedHistory = state.examHistory.map((exam) =>
            exam.id === state.currentExamId
              ? { ...exam, configs: updatedConfig }
              : exam
          );

          return {
            configs: updatedConfig,
            examHistory: updatedHistory,
          };
        });
      },

      // 清空所有数据
      clearAll: () => {
        set({
          examHistory: [],
          currentExamId: null,
          students: [],
          examName: '',
          className: undefined,
          configs: null,
        });
      },

      // 导入备份数据
      importBackup: (data) => {
        set({
          examHistory: data.examHistory,
          currentExamId: data.examHistory[0]?.id || null,
          students: data.examHistory[0]?.students || [],
          examName: data.examHistory[0]?.name || '',
          className: data.examHistory[0]?.className,
          configs: data.examHistory[0]?.configs || null,
        });
      },
    }),
    {
      name: 'grade-analysis-storage', // localStorage的key名称
    }
  )
);
