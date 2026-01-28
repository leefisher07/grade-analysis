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

interface PassRateChartProps {
  subjectStats: SubjectStat[];
  title?: string;
}

export default function PassRateChart({
  subjectStats,
  title = '各科通过率统计',
}: PassRateChartProps) {
  const data = subjectStats.map((stat) => ({
    科目: stat.subject,
    及格率: stat.passRate,
    优秀率: stat.excellentRate,
    不及格率: stat.failRate,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="科目" />
          <YAxis unit="%" />
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          <Legend />
          <Bar dataKey="优秀率" fill="#10b981" stackId="a" />
          <Bar dataKey="及格率" fill="#3b82f6" stackId="a" />
          <Bar dataKey="不及格率" fill="#ef4444" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
