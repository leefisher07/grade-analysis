import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, AlertCircle, CheckCircle, Loader2, BarChart3, FileText } from 'lucide-react';
import FileUpload from '../../components/common/FileUpload';
import SubjectConfigModal from '../../components/common/SubjectConfigModal';
import { parseExcelFile, downloadTemplate } from '../../utils/excel';
import { calculateAllRanks } from '../../utils/ranking';
import { useExamStore } from '../../store/examStore';
import { generateId } from '../../utils/helpers';
import type { ExamRecord, SubjectConfig } from '../../types';

export default function ImportPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [examName, setExamName] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showNavigationGuide, setShowNavigationGuide] = useState(false);

  const addExam = useExamStore((state) => state.addExam);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setShowConfig(false);

    try {
      // 解析Excel文件
      const { students, config, isGradeMode } = await parseExcelFile(file);

      if (students.length === 0) {
        throw new Error('未找到有效的学生数据');
      }

      // 计算排名
      const rankedStudents = calculateAllRanks(students);

      // 显示配置界面
      setShowConfig(true);
      setSuccess(`成功解析 ${students.length} 名学生的成绩数据`);

      // 自动设置考试名称（从文件名提取）
      const fileName = file.name.replace(/\.(xlsx|xls)$/i, '');
      setExamName(fileName);

      // 临时保存数据
      (window as any).__tempExamData = {
        students: rankedStudents,
        config,
        isGradeMode,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!examName.trim()) {
      setError('请输入考试名称');
      return;
    }

    const tempData = (window as any).__tempExamData;
    if (!tempData) {
      setError('数据已丢失，请重新上传文件');
      return;
    }

    const { students, config, isGradeMode } = tempData;

    // 创建考试记录
    const examRecord: ExamRecord = {
      id: generateId(),
      name: examName.trim(),
      date: new Date().toISOString(),
      className: isGradeMode ? undefined : students[0]?.className,
      students,
      configs: config,
      isGradeMode,
    };

    // 保存到store
    addExam(examRecord);

    // 清理临时数据
    delete (window as any).__tempExamData;

    setSuccess(`成功导入 ${students.length} 名学生成绩，并已归档到历史记录`);
    setShowConfig(false);
    setExamName('');

    // 显示导航引导
    setShowNavigationGuide(true);
  };

  const handleDownloadTemplate = () => {
    setShowSubjectModal(true);
  };

  const handleConfirmSubjects = (subjects: SubjectConfig[]) => {
    downloadTemplate(subjects);
    setShowSubjectModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">导入成绩表</h1>
        <p className="mt-1 text-sm text-gray-500">
          上传Excel格式的成绩表，系统将自动解析并归档
        </p>
      </div>

      {/* 提示信息 */}
      {error && (
        <div className="flex items-start space-x-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">错误</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && !showConfig && (
        <div className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-4">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">成功</p>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">使用说明</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Excel表格必须包含"姓名"列</li>
          <li>可选包含"学号"和"班级"列</li>
          <li>请确保包含"班级"列，系统将自动开启年级分析模式</li>
          <li>成绩列会自动识别（除姓名、学号、班级外的所有列）</li>
          <li>缺考处理：缺考请留空，总分计算时将自动忽略，并标记为缺考</li>
        </ul>
      </div>

      {/* 下载模板 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">成绩表模板</h2>
        <p className="text-sm text-gray-600 mb-4">
          配置科目信息后下载模板，填写完成后上传系统
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          配置科目并下载模板
        </button>
      </div>

      {/* 文件上传 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">上传成绩表</h2>
        <FileUpload onFileSelect={handleFileSelect} disabled={loading} />
        {loading && (
          <div className="mt-4 flex items-center justify-center text-primary-600">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm">正在解析文件...</span>
          </div>
        )}
      </div>

      {/* 配置考试信息 */}
      {showConfig && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            配置考试信息
          </h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>

            <div>
              <label
                htmlFor="examName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                考试名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="examName"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="例如：期中考试、第一次月考"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleConfirmImport}
                disabled={!examName.trim()}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                确认导入
              </button>
              <button
                onClick={() => {
                  setShowConfig(false);
                  setSuccess('');
                  delete (window as any).__tempExamData;
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 科目配置模态框 */}
      <SubjectConfigModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onConfirm={handleConfirmSubjects}
      />

      {/* 导航引导弹窗 */}
      {showNavigationGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">导入成功！</h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              成绩数据已成功导入并保存。您可以选择接下来要查看的内容：
            </p>

            <div className="space-y-3">
              {/* 查看成绩分析 */}
              <button
                onClick={() => {
                  setShowNavigationGuide(false);
                  navigate('/analysis');
                }}
                className="w-full flex items-center justify-between p-4 bg-primary-50 border-2 border-primary-200 rounded-lg hover:bg-primary-100 hover:border-primary-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">查看成绩分析</p>
                    <p className="text-xs text-gray-600">查看整体统计、排名、图表分析</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 查看学生报告 */}
              <button
                onClick={() => {
                  setShowNavigationGuide(false);
                  navigate('/student');
                }}
                className="w-full flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">查看学生报告</p>
                    <p className="text-xs text-gray-600">查看单个学生的详细成绩报告</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* 稍后查看 */}
              <button
                onClick={() => setShowNavigationGuide(false)}
                className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                稍后查看
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
