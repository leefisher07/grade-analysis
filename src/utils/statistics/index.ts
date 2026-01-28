import type {
  Student,
  ExamConfig,
  Statistics,
  SubjectStat,
  ClassStatistics,
  CriticalStudent,
  ScoreDistribution,
} from '../../types';
import { StudentStatus } from '../../types';
import { toFixed } from '../helpers';

/**
 * 计算整体统计数据
 */
export function calculateStatistics(
  students: Student[],
  config: ExamConfig
): Statistics {
  // 过滤有效学生（排除缺考）
  const validStudents = students.filter((s) => s.status !== StudentStatus.ABSENT);

  const totalStudents = students.length;
  const attendedStudents = validStudents.length;
  const absentStudents = totalStudents - attendedStudents;

  if (attendedStudents === 0) {
    return getEmptyStatistics(config);
  }

  // 计算平均分
  const avgScore = toFixed(
    validStudents.reduce((sum, s) => sum + s.totalScore, 0) / attendedStudents
  );

  // 计算及格率、优秀率
  const passCount = validStudents.filter(
    (s) => s.totalScore >= config.totalPassScore
  ).length;
  const excellentCount = validStudents.filter(
    (s) => s.totalScore >= config.totalExcellentScore
  ).length;
  const failCount = validStudents.filter(
    (s) => s.totalScore < config.totalPassScore
  ).length;

  const passRate = toFixed((passCount / attendedStudents) * 100);
  const excellentRate = toFixed((excellentCount / attendedStudents) * 100);
  const failRate = toFixed((failCount / attendedStudents) * 100);

  // 满分人数
  const fullScoreCount = validStudents.filter(
    (s) => s.totalScore === config.totalFullScore
  ).length;

  // 最高分和最低分
  const scores = validStudents.map((s) => s.totalScore);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  // 计算各科统计
  const subjectStats = calculateSubjectStatistics(students, config);

  return {
    totalStudents,
    attendedStudents,
    absentStudents,
    avgScore,
    passRate,
    excellentRate,
    failRate,
    fullScoreCount,
    maxScore,
    minScore,
    subjectStats,
  };
}

/**
 * 计算各科统计
 */
export function calculateSubjectStatistics(
  students: Student[],
  config: ExamConfig
): SubjectStat[] {
  const validStudents = students.filter((s) => s.status !== StudentStatus.ABSENT);

  return config.subjects.map((subject, index) => {
    // 获取该科目的所有有效成绩
    const subjectScores = validStudents
      .map((s) => s.scores[index]?.score)
      .filter((score) => score !== null) as number[];

    if (subjectScores.length === 0) {
      return {
        subject,
        avgScore: 0,
        passRate: 0,
        excellentRate: 0,
        failRate: 0,
        fullScoreCount: 0,
        maxScore: 0,
        minScore: 0,
        passScore: config.fullScores[subject] * (config.passLine / 100),
        excellentScore: config.fullScores[subject] * (config.excellentLine / 100),
      };
    }

    const fullScore = config.fullScores[subject];
    const passScore = fullScore * (config.passLine / 100);
    const excellentScore = fullScore * (config.excellentLine / 100);

    const avgScore = toFixed(
      subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length
    );

    const passCount = subjectScores.filter((score) => score >= passScore).length;
    const excellentCount = subjectScores.filter((score) => score >= excellentScore).length;
    const failCount = subjectScores.filter((score) => score < passScore).length;

    const passRate = toFixed((passCount / subjectScores.length) * 100);
    const excellentRate = toFixed((excellentCount / subjectScores.length) * 100);
    const failRate = toFixed((failCount / subjectScores.length) * 100);

    const fullScoreCount = subjectScores.filter((score) => score === fullScore).length;

    const maxScore = Math.max(...subjectScores);
    const minScore = Math.min(...subjectScores);

    return {
      subject,
      avgScore,
      passRate,
      excellentRate,
      failRate,
      fullScoreCount,
      maxScore,
      minScore,
      passScore,
      excellentScore,
    };
  });
}

/**
 * 按班级计算统计
 */
export function calculateClassStatistics(
  students: Student[],
  config: ExamConfig
): ClassStatistics[] {
  // 按班级分组
  const classGroups = new Map<string, Student[]>();

  students.forEach((student) => {
    const className = student.className || '默认班级';
    if (!classGroups.has(className)) {
      classGroups.set(className, []);
    }
    classGroups.get(className)!.push(student);
  });

  // 计算每个班级的统计
  return Array.from(classGroups.entries()).map(([className, classStudents]) => {
    const stats = calculateStatistics(classStudents, config);
    return {
      ...stats,
      className,
      studentCount: classStudents.length,
    };
  });
}

/**
 * 查找临界生
 */
export function findCriticalStudents(
  students: Student[],
  config: ExamConfig
): {
  passCritical: CriticalStudent[];
  excellentCritical: CriticalStudent[];
} {
  const validStudents = students.filter((s) => s.status !== StudentStatus.ABSENT);

  const passCritical: CriticalStudent[] = [];
  const excellentCritical: CriticalStudent[] = [];

  validStudents.forEach((student) => {
    const { totalScore } = student;

    // 临界及格生（总分低于及格线但差距不大，如10分以内）
    if (
      totalScore < config.totalPassScore &&
      totalScore >= config.totalPassScore - 10
    ) {
      passCritical.push({
        student,
        gap: toFixed(config.totalPassScore - totalScore),
        type: 'pass',
      });
    }

    // 临界优秀生（总分低于优秀线但差距不大，如10分以内）
    if (
      totalScore >= config.totalPassScore &&
      totalScore < config.totalExcellentScore &&
      totalScore >= config.totalExcellentScore - 10
    ) {
      excellentCritical.push({
        student,
        gap: toFixed(config.totalExcellentScore - totalScore),
        type: 'excellent',
      });
    }
  });

  // 按差距排序（差距越小越靠前）
  passCritical.sort((a, b) => a.gap - b.gap);
  excellentCritical.sort((a, b) => a.gap - b.gap);

  return { passCritical, excellentCritical };
}

/**
 * 计算分数段分布
 */
export function calculateScoreDistribution(
  students: Student[],
  ranges: [number, number][] = [
    [90, 100],
    [80, 90],
    [70, 80],
    [60, 70],
    [0, 60],
  ]
): ScoreDistribution[] {
  const validStudents = students.filter((s) => s.status !== StudentStatus.ABSENT);
  const total = validStudents.length;

  if (total === 0) {
    return ranges.map(([min, max]) => ({
      range: `${min}-${max}`,
      count: 0,
      percentage: 0,
    }));
  }

  return ranges.map(([min, max]) => {
    const count = validStudents.filter(
      (s) => s.totalScore >= min && s.totalScore < max
    ).length;

    return {
      range: `${min}-${max}`,
      count,
      percentage: toFixed((count / total) * 100),
    };
  });
}

/**
 * 获取空统计数据
 */
function getEmptyStatistics(config: ExamConfig): Statistics {
  return {
    totalStudents: 0,
    attendedStudents: 0,
    absentStudents: 0,
    avgScore: 0,
    passRate: 0,
    excellentRate: 0,
    failRate: 0,
    fullScoreCount: 0,
    maxScore: 0,
    minScore: 0,
    subjectStats: config.subjects.map((subject) => ({
      subject,
      avgScore: 0,
      passRate: 0,
      excellentRate: 0,
      failRate: 0,
      fullScoreCount: 0,
      maxScore: 0,
      minScore: 0,
      passScore: config.fullScores[subject] * (config.passLine / 100),
      excellentScore: config.fullScores[subject] * (config.excellentLine / 100),
    })),
  };
}
