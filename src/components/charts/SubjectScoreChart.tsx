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
import type { SubjectStat } from '../../types';

interface SubjectScoreChartProps {
  subjectStats: SubjectStat[];
  title?: string;
}

export default function SubjectScoreChart({
  subjectStats,
  title = '各科成绩统计',
}: SubjectScoreChartProps) {
  const data = subjectStats.map((stat) => ({
    科目: stat.subject,
    平均分: stat.avgScore,
    最高分: stat.maxScore,
    最低分: stat.minScore,
    及格线: stat.passScore,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="科目" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="平均分" fill="#3b82f6" />
          <Bar dataKey="最高分" fill="#10b981" />
          <Bar dataKey="最低分" fill="#ef4444" />
          <Bar dataKey="及格线" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
