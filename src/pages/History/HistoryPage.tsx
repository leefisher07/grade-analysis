import { useState, useMemo } from 'react';
import { AlertCircle, GitCompare, TrendingUp, Info } from 'lucide-react';
import { useExamStore } from '../../store/examStore';
import ExamHistoryList from '../../components/history/ExamHistoryList';
import ExamComparison from '../../components/history/ExamComparison';
import StudentTrendChart from '../../components/history/StudentTrendChart';
import StudentSearch from '../../components/common/StudentSearch';
import type { Student } from '../../types';

export default function HistoryPage() {
  const exams = useExamStore((state) => state.examHistory);
  const currentExamId = useExamStore((state) => state.currentExamId);
  const setCurrentExam = useExamStore((state) => state.setCurrentExam);
  const removeExam = useExamStore((state) => state.removeExam);

  // 从所有历史考试中收集所有学生（去重）
  const allStudents = useMemo(() => {
    const studentMap = new Map<string, Student>();
    exams.forEach(exam => {
      exam.students.forEach(student => {
        // 使用姓名作为唯一标识，如果已存在则使用最新的考试数据
        if (!studentMap.has(student.name)) {
          studentMap.set(student.name, student);
        }
      });
    });
    return Array.from(studentMap.values());
  }, [exams]);

  const [compareMode, setCompareMode] = useState(false);
  const [selectedExam1, setSelectedExam1] = useState<string>('');
  const [selectedExam2, setSelectedExam2] = useState<string>('');
  const [trendStudent, setTrendStudent] = useState<Student | null>(null);

  const handleSelectExam = (examId: string) => {
    if (compareMode) {
      if (!selectedExam1) {
        setSelectedExam1(examId);
      } else if (!selectedExam2 && examId !== selectedExam1) {
        setSelectedExam2(examId);
      }
    } else {
      setCurrentExam(examId);
    }
  };

  const handleDeleteExam = (examId: string) => {
    removeExam(examId);
    if (selectedExam1 === examId) setSelectedExam1('');
    if (selectedExam2 === examId) setSelectedExam2('');
  };

  const resetCompare = () => {
    setCompareMode(false);
    setSelectedExam1('');
    setSelectedExam2('');
  };

  const exam1 = exams.find(e => e.id === selectedExam1);
  const exam2 = exams.find(e => e.id === selectedExam2);

  // 验证两场考试是否可以对比
  const validateComparison = useMemo(() => {
    if (!exam1 || !exam2) return null;

    // 获取两场考试的科目列表
    const subjects1 = exam1.configs.subjects;
    const subjects2 = exam2.configs.subjects;

    // 找出共同科目
    const commonSubjects = subjects1.filter(s1 =>
      subjects2.some(s2 => s2 === s1)
    );

    // 找出共同学生
    const students2Names = new Set(exam2.students.map(s => s.name));
    const commonStudents = exam1.students.filter(s => students2Names.has(s.name));

    // 验证条件
    const hasCommonSubjects = commonSubjects.length > 0;
    const subjectOverlapRate = (commonSubjects.length / Math.max(subjects1.length, subjects2.length)) * 100;

    return {
      isValid: hasCommonSubjects,
      commonSubjects,
      commonStudentsCount: commonStudents.length,
      totalStudents1: exam1.students.length,
      totalStudents2: exam2.students.length,
      subjectOverlapRate: subjectOverlapRate.toFixed(0),
      missingInExam1: subjects2.filter(s => !subjects1.includes(s)),
      missingInExam2: subjects1.filter(s => !subjects2.includes(s)),
    };
  }, [exam1, exam2]);

  if (exams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
          <p className="mt-1 text-sm text-gray-500">
            查看和管理历史考试数据，对比多次考试
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                暂无历史记录
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                导入多次考试数据后，可以在此处查看历史记录并进行对比分析。
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
        <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
        <p className="mt-1 text-sm text-gray-500">
          查看和管理历史考试数据，对比多次考试
        </p>
      </div>

      {/* 功能切换 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                resetCompare();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !compareMode
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              历史记录
            </button>
            <button
              onClick={() => setCompareMode(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                compareMode
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <GitCompare className="h-4 w-4" />
              <span>考试对比</span>
            </button>
          </div>

          {compareMode && (
            <div className="text-sm text-gray-600">
              {!selectedExam1 && '请选择第一场考试'}
              {selectedExam1 && !selectedExam2 && '请选择第二场考试'}
              {selectedExam1 && selectedExam2 && (
                <button
                  onClick={resetCompare}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  重新选择
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 历史记录列表 */}
      {!compareMode && (
        <ExamHistoryList
          exams={exams}
          currentExamId={currentExamId ?? undefined}
          onSelect={handleSelectExam}
          onDelete={handleDeleteExam}
        />
      )}

      {/* 考试对比模式 */}
      {compareMode && (
        <div className="space-y-6">
          {/* 考试选择器 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">选择要对比的两场考试</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 选择考试A */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  考试A
                </label>
                <select
                  value={selectedExam1}
                  onChange={(e) => setSelectedExam1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">请选择考试</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id} disabled={exam.id === selectedExam2}>
                      {exam.name} ({new Date(exam.date).toLocaleDateString('zh-CN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* 选择考试B */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  考试B
                </label>
                <select
                  value={selectedExam2}
                  onChange={(e) => setSelectedExam2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">请选择考试</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id} disabled={exam.id === selectedExam1}>
                      {exam.name} ({new Date(exam.date).toLocaleDateString('zh-CN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 验证结果提示 */}
            {selectedExam1 && selectedExam2 && validateComparison && (
              <>
                {validateComparison.isValid ? (
                  <div className="mt-4 space-y-3">
                    {/* 对比可行提示 */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">
                        ✓ 两场考试可以进行对比
                      </p>
                    </div>

                    {/* 对比详情 */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">共同科目：</span>
                          <span className="text-blue-900">
                            {validateComparison.commonSubjects.length} 个
                            （{validateComparison.commonSubjects.join('、')}）
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">科目重叠度：</span>
                          <span className="text-blue-900">
                            {validateComparison.subjectOverlapRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">共同学生：</span>
                          <span className="text-blue-900">
                            {validateComparison.commonStudentsCount} 人
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">参考人数：</span>
                          <span className="text-blue-900">
                            {exam1?.name}: {validateComparison.totalStudents1} 人 / {exam2?.name}: {validateComparison.totalStudents2} 人
                          </span>
                        </div>
                      </div>

                      {/* 科目差异提示 */}
                      {(validateComparison.missingInExam1.length > 0 || validateComparison.missingInExam2.length > 0) && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">科目差异：</p>
                          {validateComparison.missingInExam1.length > 0 && (
                            <p className="text-xs text-blue-600">
                              • {exam1?.name} 缺少：{validateComparison.missingInExam1.join('、')}
                            </p>
                          )}
                          {validateComparison.missingInExam2.length > 0 && (
                            <p className="text-xs text-blue-600">
                              • {exam2?.name} 缺少：{validateComparison.missingInExam2.join('、')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 学生差异提示 */}
                      {validateComparison.commonStudentsCount === 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-xs text-blue-700">
                            ⚠️ 两场考试没有共同学生，将只能对比整体统计数据
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          无法进行对比
                        </h4>
                        <div className="mt-2 text-sm text-red-700 space-y-1">
                          <p>两场考试没有共同科目，无法进行对比分析。</p>
                          <p className="mt-2">
                            <span className="font-medium">{exam1?.name}</span> 的科目：
                            {exam1?.configs.subjects.join('、')}
                          </p>
                          <p>
                            <span className="font-medium">{exam2?.name}</span> 的科目：
                            {exam2?.configs.subjects.join('、')}
                          </p>
                          <p className="mt-3 text-xs">
                            请选择具有相同或部分相同科目的考试进行对比。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 对比结果 - 只在验证通过时显示 */}
          {exam1 && exam2 && validateComparison?.isValid && (
            <ExamComparison exam1={exam1} exam2={exam2} />
          )}
        </div>
      )}

      {/* 学生成绩趋势 */}
      {exams.length >= 2 && !compareMode && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">学生成绩趋势</h3>
            </div>
          </div>

          {/* 使用说明 */}
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">如何查看成绩趋势：</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>需要导入至少2次考试数据</li>
                  <li>确保不同考试中学生姓名完全一致（包括空格、标点）</li>
                  <li>在下方搜索框输入学生姓名即可查看趋势图表</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <StudentSearch
              students={allStudents}
              onSelect={setTrendStudent}
              placeholder="输入学生姓名查看成绩趋势..."
            />
          </div>

          {trendStudent ? (
            <StudentTrendChart
              studentName={trendStudent.name}
              exams={exams}
            />
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  请选择一个学生查看其成绩变化趋势
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
