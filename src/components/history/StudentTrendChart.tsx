import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ExamRecord } from '../../types';

interface StudentTrendChartProps {
  studentName: string;
  exams: ExamRecord[];
}

export default function StudentTrendChart({ studentName, exams }: StudentTrendChartProps) {
  // 查找所有考试中该学生的数据
  const studentData = exams
    .map((exam) => {
      const student = exam.students.find((s) => s.name === studentName);
      if (!student) return null;

      return {
        examName: exam.name,
        date: new Date(exam.date).toLocaleDateString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
        }),
        总分: student.totalScore,
        排名: student.rank || 0,
        ...student.scores.reduce((acc, score) => {
          acc[score.subject] = score.score;
          return acc;
        }, {} as Record<string, number | null>),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const examA = exams.find(e => e.name === a!.examName)!;
      const examB = exams.find(e => e.name === b!.examName)!;
      return new Date(examA.date).getTime() - new Date(examB.date).getTime();
    });

  if (studentData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">该学生暂无历史成绩记录</p>
        </div>
      </div>
    );
  }

  // 获取所有科目
  const subjects = studentData.length > 0
    ? Object.keys(studentData[0]!).filter(
        (key) => !['examName', 'date', '总分', '排名'].includes(key)
      )
    : [];

  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* 总分趋势 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">总分趋势</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={studentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === '排名') return [`第${value}名`, name];
                return [value, name];
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="总分"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 各科成绩趋势 */}
      {subjects.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-base font-medium text-gray-900 mb-4">各科成绩趋势</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {subjects.map((subject, index) => (
                <Line
                  key={subject}
                  type="monotone"
                  dataKey={subject}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 排名趋势 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">排名变化</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={studentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis reversed domain={[1, 'dataMax']} />
            <Tooltip
              formatter={(value: number) => [`第${value}名`, '排名']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="排名"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-2 text-center">
          注：纵轴倒序，向下表示排名提升
        </p>
      </div>
    </div>
  );
}
