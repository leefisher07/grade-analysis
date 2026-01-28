import { AlertTriangle, TrendingUp } from 'lucide-react';
import type { CriticalStudent } from '../../types';
import { cn } from '../../utils/helpers';

interface CriticalStudentsProps {
  passCritical: CriticalStudent[];
  excellentCritical: CriticalStudent[];
}

export default function CriticalStudents({
  passCritical,
  excellentCritical,
}: CriticalStudentsProps) {
  const renderStudentList = (
    students: CriticalStudent[],
    type: 'pass' | 'excellent'
  ) => {
    if (students.length === 0) {
      return (
        <div className="text-center py-6 text-gray-500 text-sm">
          本范围内暂无临界学生
        </div>
      );
    }

    const typeConfig = {
      pass: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        badgeColor: 'bg-yellow-100 text-yellow-800',
        gapText: '差',
        targetText: '及格',
      },
      excellent: {
        icon: TrendingUp,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        badgeColor: 'bg-blue-100 text-blue-800',
        gapText: '差',
        targetText: '优秀',
      },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
      <div className="space-y-2">
        {students.map((item) => (
          <div
            key={item.student.id}
            className={cn(
              'p-3 rounded-lg border flex items-center justify-between',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex items-center space-x-3">
              <Icon className={cn('h-4 w-4', config.textColor)} />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {item.student.name}
                  </span>
                  {item.student.className && (
                    <span className="text-xs text-gray-500">
                      {item.student.className}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  学号: {item.student.id}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  config.badgeColor
                )}
              >
                {config.gapText} {item.gap.toFixed(1)} 分{config.targetText}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                总分: {item.student.totalScore.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">临界生预警</h3>
        <p className="text-sm text-gray-500 mt-1">
          重点关注，助力提升
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {/* 及格临界生 */}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h4 className="text-sm font-medium text-gray-900">
              及格临界生 ({passCritical.length})
            </h4>
          </div>
          {renderStudentList(passCritical, 'pass')}
        </div>

        {/* 优秀临界生 */}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-900">
              优秀临界生 ({excellentCritical.length})
            </h4>
          </div>
          {renderStudentList(excellentCritical, 'excellent')}
        </div>
      </div>
    </div>
  );
}
