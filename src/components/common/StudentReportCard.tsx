import type { Student, ExamConfig } from '../../types';
import { StudentStatus } from '../../types';
import { cn } from '../../utils/helpers';

interface StudentReportCardProps {
  student: Student;
  config: ExamConfig;
  examName?: string;
}

export default function StudentReportCard({
  student,
  config,
  examName,
}: StudentReportCardProps) {
  const getStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case StudentStatus.ABSENT:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            缺考
          </span>
        );
      case StudentStatus.CHEATING:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            作弊
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            正常
          </span>
        );
    }
  };

  const getScoreColor = (score: number, fullScore: number, passLine: number, excellentLine: number) => {
    const passScore = fullScore * (passLine / 100);
    const excellentScore = fullScore * (excellentLine / 100);

    if (score >= excellentScore) return 'text-green-600';
    if (score >= passScore) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" data-export="student-report">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <p className="text-primary-100 mt-1">
              学号: {student.id}
              {student.className && ` • ${student.className}`}
            </p>
          </div>
          {getStatusBadge(student.status)}
        </div>

        {/* 总分和排名 */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-primary-100 text-sm">总分</p>
            <p className="text-3xl font-bold text-white mt-1">
              {student.totalScore.toFixed(1)}
            </p>
            <p className="text-primary-200 text-xs mt-1">
              满分: {config.totalFullScore}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-primary-100 text-sm">
              {student.className ? '班级排名' : '排名'}
            </p>
            <p className="text-3xl font-bold text-white mt-1">
              {student.rank || '-'}
            </p>
            {student.gradeRank && (
              <p className="text-primary-200 text-xs mt-1">
                年级: {student.gradeRank}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 考试信息 */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-medium">考试名称:</span> {examName}
        </p>
      </div>

      {/* 各科成绩 */}
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">各科成绩</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  科目
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分数
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  得分率
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排名
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {student.scores.map((score, index) => {
                const passScore = score.fullScore * (config.passLine / 100);
                const excellentScore = score.fullScore * (config.excellentLine / 100);
                const scoreRate = score.score !== null
                  ? ((score.score / score.fullScore) * 100).toFixed(1)
                  : '-';

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {score.subject}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {score.score !== null ? (
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            getScoreColor(score.score, score.fullScore, config.passLine, config.excellentLine)
                          )}
                        >
                          {score.score.toFixed(1)} / {score.fullScore}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">缺考</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scoreRate !== '-' ? `${scoreRate}%` : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {score.rank || '-'}
                      {score.gradeRank && (
                        <span className="text-xs text-gray-500 ml-1">
                          (年级 {score.gradeRank})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {score.score !== null ? (
                        score.score >= excellentScore ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            优秀
                          </span>
                        ) : score.score >= passScore ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            及格
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            不及格
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          缺考
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 备注 */}
        <div className="mt-4 text-xs text-gray-500">
          <p>注：得分率 = (实得分/满分) × 100%</p>
        </div>
      </div>
    </div>
  );
}
