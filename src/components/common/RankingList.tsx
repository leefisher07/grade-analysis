import { Trophy, Medal, Award } from 'lucide-react';
import type { Student } from '../../types';
import { cn } from '../../utils/helpers';

interface RankingListProps {
  students: Student[];
  title?: string;
  maxCount?: number;
  showScore?: boolean;
  showClass?: boolean;
}

export default function RankingList({
  students,
  title = '排名榜单',
  maxCount = 10,
  showScore = true,
  showClass = false,
}: RankingListProps) {
  const displayStudents = students.slice(0, maxCount);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (displayStudents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {displayStudents.map((student, index) => {
          const rank = student.rank || index + 1;
          return (
            <div
              key={student.id}
              className={cn(
                'p-4 hover:bg-gray-50 transition-colors',
                rank <= 3 && 'bg-gradient-to-r from-gray-50 to-white'
              )}
            >
              <div className="flex items-center space-x-4">
                {/* 排名 */}
                <div className="flex-shrink-0 w-16">
                  {rank <= 3 ? (
                    <div className="flex items-center justify-center space-x-1">
                      {getRankIcon(rank)}
                      <span className="font-bold text-lg">{rank}</span>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full border-2',
                        getRankBadgeClass(rank)
                      )}
                    >
                      <span className="text-sm font-semibold">{rank}</span>
                    </div>
                  )}
                </div>

                {/* 学生信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.name}
                    </p>
                    {showClass && student.className && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.className}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    学号: {student.id}
                  </p>
                </div>

                {/* 成绩 */}
                {showScore && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {student.totalScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">总分</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
