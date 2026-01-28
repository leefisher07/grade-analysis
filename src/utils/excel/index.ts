import * as XLSX from 'xlsx';
import type { Student, Score, ExamConfig, SubjectConfig } from '../../types';
import { StudentStatus } from '../../types';
import { generateId } from '../helpers';
import { DEFAULT_SUBJECTS } from '../../constants/subjects';

/**
 * 解析Excel文件
 */
export async function parseExcelFile(file: File): Promise<{
  students: Student[];
  config: ExamConfig;
  isGradeMode: boolean;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];

        if (jsonData.length === 0) {
          throw new Error('Excel文件为空或格式不正确');
        }

        // 解析数据
        const result = parseStudentData(jsonData);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsBinaryString(file);
  });
}

/**
 * 解析学生数据
 */
function parseStudentData(data: Record<string, any>[]): {
  students: Student[];
  config: ExamConfig;
  isGradeMode: boolean;
} {
  if (data.length === 0) {
    throw new Error('数据为空');
  }

  // 获取第一行数据，用于识别列
  const firstRow = data[0];
  const columns = Object.keys(firstRow);

  // 识别必需列
  const nameColumn = findColumn(columns, ['姓名', '学生姓名', '名字', 'name']);
  if (!nameColumn) {
    throw new Error('未找到"姓名"列');
  }

  // 识别可选列
  const idColumn = findColumn(columns, ['学号', '学生学号', 'id', 'studentId']);
  const classColumn = findColumn(columns, ['班级', 'class', 'className']);

  // 识别成绩列（排除姓名、学号、班级、总分等）
  const excludeColumns = [nameColumn, idColumn, classColumn, '总分', '备注', '状态'].filter(Boolean);
  const subjectColumns = columns.filter(
    (col) => !excludeColumns.includes(col) && col.trim() !== ''
  );

  if (subjectColumns.length === 0) {
    throw new Error('未检测到有效成绩列。请检查表头是否包含姓名、班级以外的列。');
  }

  // 判断是否为年级模式
  const isGradeMode = !!classColumn;

  // 第一遍遍历：收集每个科目的所有分数，用于推断满分
  const subjectScoresMap: Record<string, number[]> = {};
  subjectColumns.forEach(subject => {
    subjectScoresMap[subject] = [];
  });

  data.forEach(row => {
    subjectColumns.forEach(subject => {
      const scoreValue = row[subject];
      if (scoreValue !== undefined && scoreValue !== null && scoreValue !== '') {
        const parsed = Number(scoreValue);
        if (!isNaN(parsed)) {
          subjectScoresMap[subject].push(parsed);
        }
      }
    });
  });

  // 推断每个科目的满分
  const inferredFullScores: Record<string, number> = {};
  subjectColumns.forEach(subject => {
    const scores = subjectScoresMap[subject];
    if (scores.length > 0) {
      const maxScore = Math.max(...scores);
      inferredFullScores[subject] = inferFullScore(maxScore);
    } else {
      inferredFullScores[subject] = 100; // 如果没有分数，默认100
    }
  });

  // 解析每个学生的数据
  const students: Student[] = data.map((row, index) => {
    const name = String(row[nameColumn] || '').trim();
    if (!name) {
      throw new Error(`第 ${index + 2} 行缺少姓名`);
    }

    const id = idColumn ? String(row[idColumn] || generateId()) : generateId();
    const className = classColumn ? String(row[classColumn] || '').trim() : undefined;

    // 解析各科成绩
    const scores: Score[] = subjectColumns.map((subject) => {
      const scoreValue = row[subject];
      let score: number | null = null;

      if (scoreValue !== undefined && scoreValue !== null && scoreValue !== '') {
        const parsed = Number(scoreValue);
        if (!isNaN(parsed)) {
          score = parsed;
        }
      }

      return {
        subject,
        score,
        fullScore: inferredFullScores[subject], // 使用推断的满分
      };
    });

    // 计算总分（忽略缺考科目）
    const validScores = scores.filter((s) => s.score !== null);
    const totalScore = validScores.reduce((sum, s) => sum + (s.score || 0), 0);

    // 判断状态
    let status: StudentStatus = StudentStatus.NORMAL;
    if (validScores.length === 0) {
      status = StudentStatus.ABSENT; // 所有科目都缺考
    } else if (validScores.length < scores.length) {
      // 部分科目缺考，状态仍为正常，但成绩为null的科目会在统计时被忽略
      status = StudentStatus.NORMAL;
    }

    return {
      id,
      name,
      className,
      scores,
      totalScore,
      status,
    };
  });

  // 生成配置（使用推断的满分）
  const config = generateConfig(subjectColumns, inferredFullScores);

  return {
    students,
    config,
    isGradeMode,
  };
}

/**
 * 推断科目满分
 * 根据该科目的最高分，智能推断可能的满分标准
 */
function inferFullScore(maxScore: number): number {
  // 如果最高分在某个标准满分的90%以上，认为是该满分
  const standardScores = [50, 100, 120, 150, 200, 300];

  for (const standard of standardScores) {
    if (maxScore >= standard * 0.9 && maxScore <= standard) {
      return standard;
    }
  }

  // 如果没有匹配到标准满分，向上取整到最近的10的倍数
  if (maxScore <= 50) {
    return 50;
  } else if (maxScore <= 100) {
    return 100;
  } else if (maxScore <= 150) {
    return 150;
  } else if (maxScore <= 200) {
    return 200;
  } else {
    // 向上取整到最近的50的倍数
    return Math.ceil(maxScore / 50) * 50;
  }
}

/**
 * 查找列名（支持多种可能的列名）
 */
function findColumn(columns: string[], possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    const found = columns.find(
      (col) => col.trim().toLowerCase() === name.toLowerCase()
    );
    if (found) return found;
  }
  return null;
}

/**
 * 生成考试配置
 */
function generateConfig(subjects: string[], fullScores: Record<string, number>): ExamConfig {
  // 计算总分满分
  const totalFullScore = Object.values(fullScores).reduce((sum, score) => sum + score, 0);

  return {
    subjects,
    fullScores,
    passLine: 60, // 60%及格
    excellentLine: 90, // 90%优秀
    totalFullScore,
    totalPassScore: totalFullScore * 0.6, // 总分及格线
    totalExcellentScore: totalFullScore * 0.9, // 总分优秀线
  };
}

/**
 * 导出为Excel
 */
export function exportToExcel(
  students: Student[],
  filename: string,
  includeRank: boolean = true
): void {
  const data = students.map((student) => {
    const row: Record<string, any> = {
      姓名: student.name,
      学号: student.id,
    };

    if (student.className) {
      row['班级'] = student.className;
    }

    // 添加各科成绩
    student.scores.forEach((score) => {
      row[score.subject] = score.score !== null ? score.score : '';
    });

    row['总分'] = student.totalScore;

    if (includeRank && student.rank) {
      row['排名'] = student.rank;
    }

    row['状态'] = getStatusText(student.status);

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '成绩单');

  XLSX.writeFile(workbook, filename);
}

/**
 * 获取状态文本
 */
function getStatusText(status: StudentStatus): string {
  switch (status) {
    case StudentStatus.NORMAL:
      return '正常';
    case StudentStatus.ABSENT:
      return '缺考';
    case StudentStatus.CHEATING:
      return '作弊';
    default:
      return '未知';
  }
}

/**
 * 下载模板（支持自定义科目配置）
 */
export function downloadTemplate(subjects?: SubjectConfig[]): void {
  // 如果没有传入科目配置，使用默认配置
  const subjectList = subjects || DEFAULT_SUBJECTS;

  // 按 order 排序
  const sortedSubjects = [...subjectList].sort((a, b) => a.order - b.order);

  // 构建模板数据（动态生成科目列）
  const templateData = [
    {
      姓名: '张三',
      学号: '001',
      班级: '一班',
      ...sortedSubjects.reduce((acc, subject) => {
        acc[subject.name] = Math.floor(Math.random() * 20) + 80;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      姓名: '李四',
      学号: '002',
      班级: '一班',
      ...sortedSubjects.reduce((acc, subject) => {
        acc[subject.name] = Math.floor(Math.random() * 20) + 70;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      姓名: '王五',
      学号: '003',
      班级: '二班',
      ...sortedSubjects.reduce((acc, subject) => {
        acc[subject.name] = Math.floor(Math.random() * 20) + 85;
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '成绩模板');

  XLSX.writeFile(workbook, '睿析成绩分析_成绩模板.xlsx');
}
