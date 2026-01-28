import { useState, useMemo } from 'react';
import { AlertCircle, FileText, TrendingUp, Info, Download } from 'lucide-react';
import { useExamStore } from '../../store/examStore';
import { diagnoseStudent } from '../../utils/diagnosis';
import { calculateStatistics } from '../../utils/statistics';
import { exportStudentReportPDF } from '../../utils/export';
import StudentSearch from '../../components/common/StudentSearch';
import StudentReportCard from '../../components/common/StudentReportCard';
import StudentDiagnosisCard from '../../components/common/StudentDiagnosisCard';
import type { Student } from '../../types';

export default function StudentPage() {
  const students = useExamStore((state) => state.students);
  const configs = useExamStore((state) => state.configs);
  const examName = useExamStore((state) => state.examName);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);

  // 导出学生报告为PDF
  const handleExportPDF = async () => {
    if (!selectedStudent || !configs) return;

    setExportingPDF(true);
    try {
      await exportStudentReportPDF(selectedStudent, configs, examName || '成绩单');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setExportingPDF(false);
    }
  };

  // 计算统计数据（用于诊断分析）
  const statistics = useMemo(() => {
    if (!students.length || !configs) return null;
    return calculateStatistics(students, configs);
  }, [students, configs]);

  // 生成选中学生的诊断报告
  const diagnosis = useMemo(() => {
    if (!selectedStudent || !configs) return null;
    return diagnoseStudent(selectedStudent, configs, statistics || undefined);
  }, [selectedStudent, configs, statistics]);

  if (!students.length || !configs) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">学生报告</h1>
          <p className="mt-1 text-sm text-gray-500">
            查看单个学生的详细成绩报告和诊断分析
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
                请先在"导入成绩表"模块上传考试数据。上传后，您可以在此查看每位学生的详细报告。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">学生报告</h1>
        <p className="mt-1 text-sm text-gray-500">
          {examName ? `${examName} - ` : ''}查看单个学生的详细成绩报告和诊断分析
        </p>
      </div>

      {/* 学生搜索 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-medium text-gray-900">选择学生</h2>
        </div>
        <StudentSearch
          students={students}
          onSelect={setSelectedStudent}
          placeholder="输入学生姓名或学号搜索..."
        />
        {selectedStudent && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-primary-900">
                已选择：<span className="font-medium">{selectedStudent.name}</span>
                {selectedStudent.className && (
                  <span className="text-primary-700 ml-2">({selectedStudent.className})</span>
                )}
              </p>
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-700 bg-white border border-primary-300 rounded-md hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-1.5" />
                {exportingPDF ? '导出中...' : '导出PDF'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 学生报告内容 */}
      {selectedStudent ? (
        <div className="space-y-6">
          {/* 成绩单 */}
          <StudentReportCard
            student={selectedStudent}
            config={configs}
            examName={examName}
          />

          {/* 诊断分析 */}
          {diagnosis && (
            <StudentDiagnosisCard diagnosis={diagnosis} />
          )}

          {/* 成绩趋势 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">成绩趋势</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    如何查看成绩趋势？
                  </p>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      成绩趋势功能在<strong>「历史记录」</strong>模块中提供，使用前提：
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 ml-2">
                      <li>至少导入2次考试数据</li>
                      <li>确保不同考试中学生姓名完全一致（包括空格、标点符号）</li>
                      <li>在历史记录页面搜索学生即可查看趋势图表</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">未选择学生</h3>
            <p className="mt-2 text-sm text-gray-500">
              请使用上方搜索框选择一个学生以查看详细报告
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
