import { useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';
import { useExamStore } from '../../store/examStore';
import { calculateStatistics, findCriticalStudents, calculateScoreDistribution } from '../../utils/statistics';
import { getTopStudents } from '../../utils/ranking';
import StatCard from '../../components/common/StatCard';
import RankingList from '../../components/common/RankingList';
import CriticalStudents from '../../components/common/CriticalStudents';
import SubjectScoreChart from '../../components/charts/SubjectScoreChart';
import ScoreDistributionChart from '../../components/charts/ScoreDistributionChart';
import PassRateChart from '../../components/charts/PassRateChart';
import ExportButton from '../../components/common/ExportButton';
import { exportAnalysisReportPDF, exportAllStudentsToExcel, printCurrentPage } from '../../utils/export';

export default function AnalysisPage() {
  const students = useExamStore((state) => state.students);
  const configs = useExamStore((state) => state.configs);
  const examName = useExamStore((state) => state.examName);

  // 计算统计数据
  const statistics = useMemo(() => {
    if (!students.length || !configs) return null;
    return calculateStatistics(students, configs);
  }, [students, configs]);

  // 获取TOP10学生
  const topStudents = useMemo(() => {
    return getTopStudents(students, 10);
  }, [students]);

  // 查找临界生
  const criticalStudents = useMemo(() => {
    if (!students.length || !configs) {
      return { passCritical: [], excellentCritical: [] };
    }
    return findCriticalStudents(students, configs);
  }, [students, configs]);

  // 计算分数段分布
  const scoreDistribution = useMemo(() => {
    return calculateScoreDistribution(students);
  }, [students]);

  if (!students.length || !configs) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">成绩分析</h1>
          <p className="mt-1 text-sm text-gray-500">
            查看班级和年级的整体成绩分析
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                暂无数据
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                请先在"导入成绩表"模块上传考试数据。上传后，您将在此处看到详细的分析报告。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">成绩分析</h1>
          <p className="mt-1 text-sm text-gray-500">
            {examName ? `${examName} - ` : ''}查看班级和年级的整体成绩分析
          </p>
        </div>
        <ExportButton
          label="导出报告"
          onExportPDF={async () => await exportAnalysisReportPDF(examName || '成绩分析')}
          onExportExcel={async () => await exportAllStudentsToExcel(students, configs, examName || '成绩表')}
          onPrint={printCurrentPage}
        />
      </div>

      <div data-export="analysis">
      {/* 统计概览 */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">统计概览</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="学生总数"
            value={statistics.totalStudents}
            subtitle={`参考: ${statistics.attendedStudents} 人`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="参考人数"
            value={statistics.attendedStudents}
            subtitle={`缺考: ${statistics.absentStudents} 人`}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="平均分"
            value={statistics.avgScore.toFixed(1)}
            subtitle={`满分: ${configs.totalFullScore}`}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="及格率"
            value={`${statistics.passRate.toFixed(1)}%`}
            subtitle={`及格线: ${configs.totalPassScore}`}
            icon={Award}
            color="green"
          />
          <StatCard
            title="优秀率"
            value={`${statistics.excellentRate.toFixed(1)}%`}
            subtitle={`优秀线: ${configs.totalExcellentScore}`}
            icon={Award}
            color="yellow"
          />
          <StatCard
            title="不及格率"
            value={`${statistics.failRate.toFixed(1)}%`}
            subtitle={`不及格: ${Math.round((statistics.failRate / 100) * statistics.attendedStudents)} 人`}
            icon={UserX}
            color="red"
          />
        </div>
      </div>

      {/* 排名榜单 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingList
          students={topStudents}
          title="成绩排名 TOP 10"
          maxCount={10}
          showScore
          showClass={!!students[0]?.className}
        />

        {/* 临界生预警 */}
        <CriticalStudents
          passCritical={criticalStudents.passCritical}
          excellentCritical={criticalStudents.excellentCritical}
        />
      </div>

      {/* 图表分析 */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">数据可视化</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 各科成绩统计 */}
          <SubjectScoreChart subjectStats={statistics.subjectStats} />

          {/* 分数段分布 */}
          <ScoreDistributionChart distribution={scoreDistribution} />
        </div>

        {/* 通过率统计 */}
        <div className="mt-6">
          <PassRateChart subjectStats={statistics.subjectStats} />
        </div>
      </div>

      {/* 单科详细统计 */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">单科详细统计</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    科目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最高分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最低分
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    及格率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    优秀率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    满分人数
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.subjectStats.map((stat) => (
                  <tr key={stat.subject} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.avgScore.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {stat.maxScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {stat.minScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.passRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.excellentRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.fullScoreCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
