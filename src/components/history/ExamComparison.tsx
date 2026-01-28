import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Award, Medal } from 'lucide-react';
import type { ExamRecord, Student } from '../../types';
import { calculateStatistics } from '../../utils/statistics';
import { cn } from '../../utils/helpers';

interface ExamComparisonProps {
  exam1: ExamRecord;
  exam2: ExamRecord;
}

export default function ExamComparison({ exam1, exam2 }: ExamComparisonProps) {
  const stats1 = calculateStatistics(exam1.students, exam1.configs);
  const stats2 = calculateStatistics(exam2.students, exam2.configs);

  const getDifference = (val1: number, val2: number) => {
    const diff = val2 - val1;
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
      isNeutral: diff === 0,
    };
  };

  const renderTrendIcon = (diff: ReturnType<typeof getDifference>) => {
    if (diff.isNeutral) {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    return diff.isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const avgScoreDiff = getDifference(stats1.avgScore, stats2.avgScore);
  const passRateDiff = getDifference(stats1.passRate, stats2.passRate);
  const excellentRateDiff = getDifference(stats1.excellentRate, stats2.excellentRate);

  // 准备图表数据
  const chartData = stats1.subjectStats.map((subject1) => {
    const subject2 = stats2.subjectStats.find(s => s.subject === subject1.subject);
    return {
      科目: subject1.subject,
      [exam1.name]: subject1.avgScore,
      [exam2.name]: subject2?.avgScore || 0,
    };
  });

  // 计算总分前10名学生
  const getTop10Students = (exam: ExamRecord): Student[] => {
    return [...exam.students]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);
  };

  const top10Exam1 = getTop10Students(exam1);
  const top10Exam2 = getTop10Students(exam2);

  // 计算各科前5名学生
  const getTop5BySubject = (exam: ExamRecord, subject: string): Student[] => {
    return [...exam.students]
      .map(student => {
        const subjectScore = student.scores.find(s => s.subject === subject);
        return {
          ...student,
          currentSubjectScore: subjectScore?.score ?? null,
        };
      })
      .filter(s => s.currentSubjectScore !== null)
      .sort((a, b) => (b.currentSubjectScore as number) - (a.currentSubjectScore as number))
      .slice(0, 5);
  };

  // 获取所有科目列表
  const allSubjects = stats1.subjectStats.map(s => s.subject);

  return (
    <div className="space-y-6">
      {/* 对比标题 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">考试对比</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">考试A</div>
            <div className="text-lg font-semibold text-blue-900">{exam1.name}</div>
            <div className="text-xs text-blue-600 mt-1">
              {new Date(exam1.date).toLocaleDateString('zh-CN')}
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">考试B</div>
            <div className="text-lg font-semibold text-purple-900">{exam2.name}</div>
            <div className="text-xs text-purple-600 mt-1">
              {new Date(exam2.date).toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>
      </div>

      {/* 关键指标对比 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">关键指标对比</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 平均分对比 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">平均分</div>
            <div className="flex items-baseline justify-between">
              <div className="space-y-1">
                <div className="text-sm text-blue-600">
                  {exam1.name}: {stats1.avgScore.toFixed(1)}
                </div>
                <div className="text-sm text-purple-600">
                  {exam2.name}: {stats2.avgScore.toFixed(1)}
                </div>
              </div>
              <div className={cn(
                'flex items-center space-x-1',
                avgScoreDiff.isNeutral ? 'text-gray-500' : avgScoreDiff.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {renderTrendIcon(avgScoreDiff)}
                <span className="text-sm font-medium">
                  {avgScoreDiff.value.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* 及格率对比 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">及格率</div>
            <div className="flex items-baseline justify-between">
              <div className="space-y-1">
                <div className="text-sm text-blue-600">
                  {exam1.name}: {stats1.passRate.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600">
                  {exam2.name}: {stats2.passRate.toFixed(1)}%
                </div>
              </div>
              <div className={cn(
                'flex items-center space-x-1',
                passRateDiff.isNeutral ? 'text-gray-500' : passRateDiff.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {renderTrendIcon(passRateDiff)}
                <span className="text-sm font-medium">
                  {passRateDiff.value.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* 优秀率对比 */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 mb-2">优秀率</div>
            <div className="flex items-baseline justify-between">
              <div className="space-y-1">
                <div className="text-sm text-blue-600">
                  {exam1.name}: {stats1.excellentRate.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600">
                  {exam2.name}: {stats2.excellentRate.toFixed(1)}%
                </div>
              </div>
              <div className={cn(
                'flex items-center space-x-1',
                excellentRateDiff.isNeutral ? 'text-gray-500' : excellentRateDiff.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {renderTrendIcon(excellentRateDiff)}
                <span className="text-sm font-medium">
                  {excellentRateDiff.value.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 各科成绩对比图表 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">各科平均分对比</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="科目" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={exam1.name} fill="#3b82f6" />
            <Bar dataKey={exam2.name} fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 总分前十名学生对比 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-5 w-5 text-amber-600" />
          <h4 className="text-base font-medium text-gray-900">总分前十名学生</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 考试A前十名 */}
          <div>
            <div className="text-sm font-medium text-blue-600 mb-3 pb-2 border-b border-blue-200">
              {exam1.name}
            </div>
            <div className="space-y-2">
              {top10Exam1.map((student, index) => (
                <div
                  key={student.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded',
                    index < 3 ? 'bg-amber-50' : 'bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        index === 0 ? 'bg-amber-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-200 text-gray-600'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {student.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {student.totalScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 考试B前十名 */}
          <div>
            <div className="text-sm font-medium text-purple-600 mb-3 pb-2 border-b border-purple-200">
              {exam2.name}
            </div>
            <div className="space-y-2">
              {top10Exam2.map((student, index) => (
                <div
                  key={student.id}
                  className={cn(
                    'flex items-center justify-between p-2 rounded',
                    index < 3 ? 'bg-amber-50' : 'bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        index === 0 ? 'bg-amber-400 text-white' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-200 text-gray-600'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {student.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-purple-600">
                    {student.totalScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 各科前五名学生对比 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Medal className="h-5 w-5 text-green-600" />
          <h4 className="text-base font-medium text-gray-900">各科前五名学生</h4>
        </div>
        <div className="space-y-6">
          {allSubjects.map((subject) => {
            const top5Exam1 = getTop5BySubject(exam1, subject);
            const top5Exam2 = getTop5BySubject(exam2, subject);

            return (
              <div key={subject} className="border border-gray-200 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">{subject}</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 考试A前五名 */}
                  <div>
                    <div className="text-xs font-medium text-blue-600 mb-2">
                      {exam1.name}
                    </div>
                    <div className="space-y-1.5">
                      {top5Exam1.map((student, index) => {
                        const subjectScore = student.scores.find(s => s.subject === subject);
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-1.5 rounded bg-blue-50"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 w-4">
                                {index + 1}.
                              </span>
                              <span className="text-xs text-gray-900">
                                {student.name}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-blue-600">
                              {subjectScore?.score?.toFixed(1) || '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 考试B前五名 */}
                  <div>
                    <div className="text-xs font-medium text-purple-600 mb-2">
                      {exam2.name}
                    </div>
                    <div className="space-y-1.5">
                      {top5Exam2.map((student, index) => {
                        const subjectScore = student.scores.find(s => s.subject === subject);
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-1.5 rounded bg-purple-50"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 w-4">
                                {index + 1}.
                              </span>
                              <span className="text-xs text-gray-900">
                                {student.name}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-purple-600">
                              {subjectScore?.score?.toFixed(1) || '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
