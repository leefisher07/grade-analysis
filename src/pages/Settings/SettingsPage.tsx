import { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Database,
  Shield,
} from 'lucide-react';
import { useExamStore } from '../../store/examStore';

export default function SettingsPage() {
  const examHistory = useExamStore((state) => state.examHistory);
  const importBackup = useExamStore((state) => state.importBackup);
  const clearAll = useExamStore((state) => state.clearAll);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 导出备份
  const handleExportBackup = () => {
    try {
      const backup = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        examHistory: examHistory,
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `成绩分析系统备份_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
      link.click();

      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: '备份导出成功！' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '备份导出失败，请重试' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 导入备份
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);

        if (!backup.examHistory || !Array.isArray(backup.examHistory)) {
          throw new Error('备份文件格式不正确');
        }

        importBackup(backup);

        setMessage({ type: 'success', text: '备份恢复成功！' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : '备份文件解析失败',
        });
        setTimeout(() => setMessage(null), 3000);
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // 重置input
  };

  // 清空所有数据
  const handleClearAll = () => {
    clearAll();
    setShowClearConfirm(false);
    setMessage({ type: 'success', text: '所有数据已清空' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理系统数据和配置
        </p>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* 数据管理 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">数据管理</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            备份和恢复您的考试数据
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* 导出备份 */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">导出备份</h3>
              <p className="mt-1 text-sm text-gray-500">
                将所有考试数据导出为备份文件，当前共有 {examHistory.length} 条考试记录
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              导出
            </button>
          </div>

          {/* 导入备份 */}
          <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">导入备份</h3>
              <p className="mt-1 text-sm text-gray-500">
                从备份文件恢复数据，这将添加到现有数据中
              </p>
            </div>
            <label className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              导入
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 危险操作 */}
      <div className="bg-white rounded-lg shadow border-2 border-red-200">
        <div className="p-6 border-b border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-medium text-red-900">危险操作</h2>
          </div>
          <p className="mt-1 text-sm text-red-700">
            以下操作不可恢复，请谨慎操作
          </p>
        </div>

        <div className="p-6">
          {!showClearConfirm ? (
            <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-900">清空所有数据</h3>
                <p className="mt-1 text-sm text-red-700">
                  删除所有考试记录和相关数据，此操作不可恢复
                </p>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="ml-4 inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                清空数据
              </button>
            </div>
          ) : (
            <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-900">
                    确认清空所有数据？
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    您即将删除 {examHistory.length} 条考试记录和所有相关数据。
                    此操作不可恢复，建议先导出备份。
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  确认清空
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 系统信息 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">系统信息</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">系统版本</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">考试记录数</span>
            <span className="font-medium text-gray-900">{examHistory.length} 条</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">数据存储</span>
            <span className="font-medium text-gray-900">浏览器本地存储</span>
          </div>
        </div>
      </div>
    </div>
  );
}
