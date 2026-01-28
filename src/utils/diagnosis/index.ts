import type { Student, ExamConfig, Statistics } from '../../types';
import { toFixed } from '../helpers';

/**
 * 学生诊断结果接口
 */
export interface StudentDiagnosis {
  strengths: string[];      // 优势科目
  weaknesses: string[];     // 薄弱科目
  suggestions: string[];    // 学习建议
  totalScoreLevel: 'excellent' | 'good' | 'pass' | 'fail'; // 总分水平
  balanceScore: number;     // 均衡度分数 (0-100)
}

/**
 * 诊断学生学习情况
 */
export function diagnoseStudent(
  student: Student,
  config: ExamConfig,
  _statistics?: Statistics
): StudentDiagnosis {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // 计算总分水平
  let totalScoreLevel: StudentDiagnosis['totalScoreLevel'] = 'fail';
  if (student.totalScore >= config.totalExcellentScore) {
    totalScoreLevel = 'excellent';
  } else if (student.totalScore >= config.totalPassScore) {
    const midPoint = (config.totalExcellentScore + config.totalPassScore) / 2;
    totalScoreLevel = student.totalScore >= midPoint ? 'good' : 'pass';
  }

  // 分析各科成绩
  student.scores.forEach((score) => {
    if (score.score === null) return; // 跳过缺考科目

    const fullScore = score.fullScore;
    const passScore = fullScore * (config.passLine / 100);
    const excellentScore = fullScore * (config.excellentLine / 100);
    const scoreRate = (score.score / fullScore) * 100;

    // 识别优势科目（优秀或接近优秀）
    if (score.score >= excellentScore) {
      strengths.push(score.subject);
    } else if (scoreRate >= 85) {
      // 85分以上也算优势
      strengths.push(score.subject);
    }

    // 识别薄弱科目（不及格或勉强及格）
    if (score.score < passScore) {
      weaknesses.push(score.subject);
    } else if (scoreRate < 65) {
      // 低于65分算薄弱
      weaknesses.push(score.subject);
    }
  });

  // 计算均衡度（标准差）
  const validScores = student.scores
    .filter(s => s.score !== null)
    .map(s => (s.score! / s.fullScore) * 100);

  const balanceScore = calculateBalanceScore(validScores);

  // 生成学习建议
  suggestions.push(...generateSuggestions(
    student,
    config,
    strengths,
    weaknesses,
    balanceScore,
    totalScoreLevel
  ));

  return {
    strengths,
    weaknesses,
    suggestions,
    totalScoreLevel,
    balanceScore,
  };
}

/**
 * 计算均衡度分数
 * 返回 0-100 的分数，100 表示完全均衡
 */
function calculateBalanceScore(scores: number[]): number {
  if (scores.length === 0) return 0;

  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // 标准差越小，均衡度越高
  // 标准差为0时，均衡度为100
  // 标准差为20时，均衡度约为0
  const balanceScore = Math.max(0, 100 - (stdDev * 5));

  return toFixed(balanceScore);
}

/**
 * 生成学习建议
 */
function generateSuggestions(
  student: Student,
  _config: ExamConfig,
  strengths: string[],
  weaknesses: string[],
  balanceScore: number,
  totalScoreLevel: StudentDiagnosis['totalScoreLevel']
): string[] {
  const suggestions: string[] = [];

  // 根据总分水平给建议
  if (totalScoreLevel === 'excellent') {
    suggestions.push(
      '总体成绩优秀！建议继续保持当前的学习状态，在优势学科上追求更深入的理解和拓展。'
    );
  } else if (totalScoreLevel === 'good') {
    suggestions.push(
      '总体成绩良好，距离优秀还有一定距离。建议在保持现有水平的基础上，重点突破薄弱环节。'
    );
  } else if (totalScoreLevel === 'pass') {
    suggestions.push(
      '成绩已达到及格标准，但仍有较大提升空间。建议制定详细的学习计划，逐步提高各科成绩。'
    );
  } else {
    suggestions.push(
      '总分未达到及格线，需要引起重视。建议寻求老师和同学的帮助，制定针对性的补习计划。'
    );
  }

  // 根据优势科目给建议
  if (strengths.length > 0) {
    if (strengths.length === student.scores.length) {
      suggestions.push(
        `该生各科成绩均在优秀水平，发展非常全面。建议继续保持，并在感兴趣的学科上尝试拓展更深层次的知识。`
      );
    } else {
      suggestions.push(
        `在${strengths.join('、')}等学科表现突出。建议将优势学科的学习方法和习惯迁移到其他学科。`
      );
    }
  }

  // 根据薄弱科目给建议
  if (weaknesses.length > 0) {
    if (weaknesses.length === 1) {
      suggestions.push(
        `${weaknesses[0]}是当前的薄弱环节。建议增加该科目的学习时间，重点攻克基础知识，必要时可寻求老师一对一辅导。`
      );
    } else if (weaknesses.length === 2) {
      suggestions.push(
        `${weaknesses.join('、')}需要重点关注。建议制定专项提升计划，每天固定时间练习这两个学科的基础题型。`
      );
    } else {
      suggestions.push(
        `多个学科成绩偏弱（${weaknesses.join('、')}）。建议优先从最薄弱的1-2科入手，打好基础后再全面提升。`
      );
    }
  }

  // 根据均衡度给建议
  if (balanceScore >= 80) {
    suggestions.push(
      '各科发展较为均衡，这是一个很好的学习状态。建议保持这种均衡，避免偏科。'
    );
  } else if (balanceScore < 60) {
    suggestions.push(
      '各科成绩差异较大，存在明显的偏科现象。建议合理分配各科学习时间，注重薄弱学科的提升。'
    );
  }

  // 如果没有薄弱科目，给鼓励性建议
  if (weaknesses.length === 0 && totalScoreLevel !== 'excellent') {
    suggestions.push(
      '没有明显的薄弱学科，各科均衡发展。建议在此基础上进一步提高，争取更多学科达到优秀水平。'
    );
  }

  return suggestions;
}

/**
 * 比较两次考试的成绩，生成进步分析
 */
export function compareExamProgress(
  currentStudent: Student,
  previousStudent: Student
): {
  totalScoreChange: number;
  rankChange?: number;
  improvedSubjects: string[];
  declinedSubjects: string[];
  suggestions: string[];
} {
  const totalScoreChange = currentStudent.totalScore - previousStudent.totalScore;

  const rankChange = currentStudent.rank && previousStudent.rank
    ? previousStudent.rank - currentStudent.rank // 排名下降是进步
    : undefined;

  const improvedSubjects: string[] = [];
  const declinedSubjects: string[] = [];

  currentStudent.scores.forEach((currentScore, index) => {
    const previousScore = previousStudent.scores[index];
    if (currentScore.score !== null && previousScore.score !== null) {
      const change = currentScore.score - previousScore.score;
      if (change > 0) {
        improvedSubjects.push(`${currentScore.subject}(+${change.toFixed(1)})`);
      } else if (change < 0) {
        declinedSubjects.push(`${currentScore.subject}(${change.toFixed(1)})`);
      }
    }
  });

  const suggestions: string[] = [];

  if (totalScoreChange > 0) {
    suggestions.push(`总分提高了${totalScoreChange.toFixed(1)}分，继续保持！`);
  } else if (totalScoreChange < 0) {
    suggestions.push(`总分下降了${Math.abs(totalScoreChange).toFixed(1)}分，需要分析原因并及时调整学习方法。`);
  }

  if (rankChange && rankChange > 0) {
    suggestions.push(`排名上升了${rankChange}位，进步明显！`);
  } else if (rankChange && rankChange < 0) {
    suggestions.push(`排名下降了${Math.abs(rankChange)}位，需要加倍努力。`);
  }

  return {
    totalScoreChange,
    rankChange,
    improvedSubjects,
    declinedSubjects,
    suggestions,
  };
}
