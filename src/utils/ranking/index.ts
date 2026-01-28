import type { Student } from '../../types';
import { StudentStatus } from '../../types';

/**
 * 计算所有排名
 */
export function calculateAllRanks(students: Student[]): Student[] {
  // 计算总分排名
  const rankedStudents = calculateTotalScoreRank(students);

  // 计算各科排名
  return calculateSubjectRanks(rankedStudents);
}

/**
 * 计算总分排名
 */
export function calculateTotalScoreRank(students: Student[]): Student[] {
  // 过滤有效学生（排除缺考）
  const validStudents = students.filter((s) => s.status !== StudentStatus.ABSENT);

  // 按总分降序排序
  const sorted = [...validStudents].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // 总分相同，按学号排序
    return a.id.localeCompare(b.id);
  });

  // 赋予排名（处理并列情况）
  let currentRank = 1;
  sorted.forEach((student, index) => {
    if (index > 0 && student.totalScore < sorted[index - 1].totalScore) {
      currentRank = index + 1;
    }
    student.rank = currentRank;
  });

  // 缺考学生不设置排名
  const absentStudents = students.filter((s) => s.status === StudentStatus.ABSENT);
  absentStudents.forEach((student) => {
    student.rank = undefined;
  });

  return [...sorted, ...absentStudents];
}

/**
 * 计算各科排名
 */
export function calculateSubjectRanks(students: Student[]): Student[] {
  if (students.length === 0) return students;

  const subjectCount = students[0].scores.length;

  // 为每一科计算排名
  for (let subjectIndex = 0; subjectIndex < subjectCount; subjectIndex++) {
    // 获取该科有成绩的学生
    const studentsWithScore = students.filter(
      (s) => s.scores[subjectIndex]?.score !== null
    );

    // 按该科成绩降序排序
    const sorted = [...studentsWithScore].sort((a, b) => {
      const scoreA = a.scores[subjectIndex].score || 0;
      const scoreB = b.scores[subjectIndex].score || 0;

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      // 成绩相同，按学号排序
      return a.id.localeCompare(b.id);
    });

    // 赋予排名
    let currentRank = 1;
    sorted.forEach((student, index) => {
      const currentScore = student.scores[subjectIndex].score || 0;
      const prevScore = index > 0 ? sorted[index - 1].scores[subjectIndex].score || 0 : 0;

      if (index > 0 && currentScore < prevScore) {
        currentRank = index + 1;
      }

      student.scores[subjectIndex].rank = currentRank;
    });

    // 缺考的学生该科不设置排名
    const absentStudents = students.filter(
      (s) => s.scores[subjectIndex]?.score === null
    );
    absentStudents.forEach((student) => {
      student.scores[subjectIndex].rank = undefined;
    });
  }

  return students;
}

/**
 * 按班级计算排名
 */
export function calculateClassRanks(students: Student[]): Student[] {
  // 按班级分组
  const classGroups = new Map<string, Student[]>();

  students.forEach((student) => {
    const className = student.className || '默认班级';
    if (!classGroups.has(className)) {
      classGroups.set(className, []);
    }
    classGroups.get(className)!.push(student);
  });

  // 为每个班级计算排名
  classGroups.forEach((classStudents) => {
    calculateTotalScoreRank(classStudents);
    calculateSubjectRanks(classStudents);
  });

  return students;
}

/**
 * 计算年级排名（用于多班级模式）
 */
export function calculateGradeRanks(students: Student[]): Student[] {
  // 先计算班级内排名
  const withClassRanks = calculateClassRanks(students);

  // 再计算年级排名
  const validStudents = withClassRanks.filter((s) => s.status !== StudentStatus.ABSENT);

  // 按总分降序排序
  const sorted = [...validStudents].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.id.localeCompare(b.id);
  });

  // 赋予年级排名
  let currentRank = 1;
  sorted.forEach((student, index) => {
    if (index > 0 && student.totalScore < sorted[index - 1].totalScore) {
      currentRank = index + 1;
    }
    student.gradeRank = currentRank;
  });

  // 计算各科年级排名
  if (sorted.length > 0) {
    const subjectCount = sorted[0].scores.length;

    for (let subjectIndex = 0; subjectIndex < subjectCount; subjectIndex++) {
      const studentsWithScore = sorted.filter(
        (s) => s.scores[subjectIndex]?.score !== null
      );

      const subjectSorted = [...studentsWithScore].sort((a, b) => {
        const scoreA = a.scores[subjectIndex].score || 0;
        const scoreB = b.scores[subjectIndex].score || 0;

        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return a.id.localeCompare(b.id);
      });

      let rankCounter = 1;
      subjectSorted.forEach((student, index) => {
        const currentScore = student.scores[subjectIndex].score || 0;
        const prevScore = index > 0 ? subjectSorted[index - 1].scores[subjectIndex].score || 0 : 0;

        if (index > 0 && currentScore < prevScore) {
          rankCounter = index + 1;
        }

        student.scores[subjectIndex].gradeRank = rankCounter;
      });
    }
  }

  return withClassRanks;
}

/**
 * 获取排名前N的学生
 */
export function getTopStudents(students: Student[], count: number = 10): Student[] {
  return students
    .filter((s) => s.status !== StudentStatus.ABSENT && s.rank !== undefined)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0))
    .slice(0, count);
}
