import { Calendar, Users, Trash2, Eye } from 'lucide-react';
import type { ExamRecord } from '../../types';
import { cn } from '../../utils/helpers';

interface ExamHistoryListProps {
  exams: ExamRecord[];
  currentExamId?: string;
  onSelect: (examId: string) => void;
  onDelete: (examId: string) => void;
}

export default function ExamHistoryList({
  exams,
  currentExamId,
  onSelect,
  onDelete,
}: ExamHistoryListProps) {
  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">暂无历史记录</h3>
          <p className="mt-2 text-sm text-gray-500">
            导入考试数据后，历史记录将显示在这里
          </p>
        </div>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, examId: string) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条考试记录吗？')) {
      onDelete(examId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">历史考试记录</h3>
        <p className="text-sm text-gray-500 mt-1">共 {exams.length} 条记录</p>
      </div>

      <div className="divide-y divide-gray-200">
        {exams.map((exam) => {
          const isActive = exam.id === currentExamId;
          const attendedCount = exam.students.filter(s => s.status === 'normal').length;

          return (
            <div
              key={exam.id}
              className={cn(
                'p-6 transition-colors cursor-pointer hover:bg-gray-50',
                isActive && 'bg-primary-50 hover:bg-primary-50'
              )}
              onClick={() => onSelect(exam.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className={cn(
                      'text-lg font-medium',
                      isActive ? 'text-primary-900' : 'text-gray-900'
                    )}>
                      {exam.name}
                    </h4>
                    {isActive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                        当前
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(exam.date).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{attendedCount} 人参考</span>
                    </div>
                  </div>

                  {exam.students[0]?.className && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">
                        包含班级: {[...new Set(exam.students.map(s => s.className).filter(Boolean))].join('、')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => onSelect(exam.id)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isActive
                        ? 'text-primary-600 hover:bg-primary-100'
                        : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100'
                    )}
                    title="查看详情"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, exam.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="删除记录"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
