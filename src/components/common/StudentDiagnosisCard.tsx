import {
  CheckCircle,
  XCircle,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import type { StudentDiagnosis } from '../../utils/diagnosis';
import { cn } from '../../utils/helpers';

interface StudentDiagnosisCardProps {
  diagnosis: StudentDiagnosis;
}

export default function StudentDiagnosisCard({ diagnosis }: StudentDiagnosisCardProps) {
  const getLevelBadge = (level: StudentDiagnosis['totalScoreLevel']) => {
    switch (level) {
      case 'excellent':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            优秀
          </span>
        );
      case 'good':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            良好
          </span>
        );
      case 'pass':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            及格
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            不及格
          </span>
        );
    }
  };

  const getBalanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">诊断分析</h3>
        <p className="text-sm text-gray-500 mt-1">
          基于本次考试的综合表现分析
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* 总体水平 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h4 className="text-sm font-medium text-gray-900">总体水平</h4>
          </div>
          <div className="flex items-center space-x-3">
            {getLevelBadge(diagnosis.totalScoreLevel)}
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">均衡度</span>
                <span className={cn('font-semibold', getBalanceColor(diagnosis.balanceScore))}>
                  {diagnosis.balanceScore.toFixed(1)}分
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    diagnosis.balanceScore >= 80
                      ? 'bg-green-500'
                      : diagnosis.balanceScore >= 60
                      ? 'bg-blue-500'
                      : diagnosis.balanceScore >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  )}
                  style={{ width: `${diagnosis.balanceScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 优势科目 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="text-sm font-medium text-gray-900">优势科目</h4>
          </div>
          {diagnosis.strengths.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {diagnosis.strengths.map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200"
                >
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">暂无明显优势科目</p>
          )}
        </div>

        {/* 薄弱科目 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <h4 className="text-sm font-medium text-gray-900">薄弱科目</h4>
          </div>
          {diagnosis.weaknesses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {diagnosis.weaknesses.map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-50 text-red-700 border border-red-200"
                >
                  {subject}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">无明显薄弱科目</p>
          )}
        </div>

        {/* 学习建议 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h4 className="text-sm font-medium text-gray-900">学习建议</h4>
          </div>
          <div className="space-y-3">
            {diagnosis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  {index + 1}
                </div>
                <p className="text-sm text-blue-900 flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
