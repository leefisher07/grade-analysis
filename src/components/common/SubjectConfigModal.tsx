import { useState, useEffect } from 'react';
import { X, GripVertical, Plus, Trash2 } from 'lucide-react';
import { cn } from '../../utils/helpers';
import type { SubjectConfig, SubjectTemplateConfig } from '../../types';
import { DEFAULT_SUBJECTS, LOCALSTORAGE_KEY } from '../../constants/subjects';

interface SubjectConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (subjects: SubjectConfig[]) => void;
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 从 localStorage 加载科目配置
 */
function loadSubjectsFromStorage(): SubjectConfig[] {
  try {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    if (stored) {
      const config: SubjectTemplateConfig = JSON.parse(stored);
      return config.subjects;
    }
  } catch (error) {
    console.error('Failed to load subject config:', error);
  }

  // 返回默认配置
  return [...DEFAULT_SUBJECTS];
}

/**
 * 重新排序科目列表
 */
function reorderSubjects(
  subjects: SubjectConfig[],
  draggedId: string,
  targetId: string
): SubjectConfig[] {
  const draggedIndex = subjects.findIndex(s => s.id === draggedId);
  const targetIndex = subjects.findIndex(s => s.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) return subjects;

  const newSubjects = [...subjects];
  const [removed] = newSubjects.splice(draggedIndex, 1);
  newSubjects.splice(targetIndex, 0, removed);

  // 更新 order 字段
  return newSubjects.map((subject, index) => ({
    ...subject,
    order: index + 1,
  }));
}

export default function SubjectConfigModal({
  isOpen,
  onClose,
  onConfirm,
}: SubjectConfigModalProps) {
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddInput, setShowAddInput] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectScore, setNewSubjectScore] = useState('100');

  // 初始化：从 localStorage 加载配置
  useEffect(() => {
    if (isOpen) {
      setSubjects(loadSubjectsFromStorage());
      setErrors({});
      setShowAddInput(false);
      setNewSubjectName('');
      setNewSubjectScore('100');
    }
  }, [isOpen]);

  // 保存到 localStorage
  const saveToStorage = (subjects: SubjectConfig[]) => {
    const config: SubjectTemplateConfig = {
      subjects,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(config));
  };

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, subjectId: string) => {
    setDraggedItem(subjectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    // 重新排序逻辑
    const newSubjects = reorderSubjects(subjects, draggedItem, targetId);
    setSubjects(newSubjects);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // 科目操作
  const handleDelete = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
  };

  const handleScoreChange = (subjectId: string, value: string) => {
    // 验证：仅允许正整数
    if (!/^\d*$/.test(value)) return;

    const score = parseInt(value) || 0;
    if (score >= 0 && score <= 1000) {
      setSubjects(subjects.map(s =>
        s.id === subjectId ? { ...s, fullScore: score } : s
      ));
      // 清除该科目的错误
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[subjectId];
        return newErrors;
      });
    }
  };

  const handleAddSubject = () => {
    // 验证
    if (!newSubjectName.trim()) {
      setErrors({ ...errors, newSubject: '请输入科目名称' });
      return;
    }

    if (subjects.some(s => s.name === newSubjectName.trim())) {
      setErrors({ ...errors, newSubject: '科目名称已存在' });
      return;
    }

    const score = parseInt(newSubjectScore) || 100;
    if (score <= 0 || score > 1000) {
      setErrors({ ...errors, newSubjectScore: '满分必须在1-1000之间' });
      return;
    }

    // 添加新科目
    const newSubject: SubjectConfig = {
      id: generateId(),
      name: newSubjectName.trim(),
      fullScore: score,
      isRequired: false,
      order: subjects.length + 1,
    };

    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
    setNewSubjectScore('100');
    setShowAddInput(false);
    setErrors({});
  };

  // 确认处理
  const handleConfirm = () => {
    // 验证必修科目存在
    const requiredSubjects = ['语文', '数学', '英语'];
    const missingRequired = requiredSubjects.filter(
      name => !subjects.some(s => s.name === name)
    );

    if (missingRequired.length > 0) {
      setErrors({
        general: `缺少必修科目: ${missingRequired.join('、')}`
      });
      return;
    }

    // 验证所有科目满分都大于0
    const invalidScores = subjects.filter(s => s.fullScore <= 0);
    if (invalidScores.length > 0) {
      setErrors({
        general: '所有科目的满分必须大于0'
      });
      return;
    }

    // 保存到 localStorage
    saveToStorage(subjects);

    // 回调父组件
    onConfirm(subjects);
  };

  // 如果不显示，返回 null
  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* 模态框主体 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">配置考试科目</h2>
              <p className="text-sm text-gray-500 mt-1">
                拖拽调整顺序，点击删除按钮移除科目
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 主体内容区 - 可滚动 */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* 错误提示 */}
            {errors.general && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* 科目列表 */}
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, subject.id)}
                  onDragOver={(e) => handleDragOver(e, subject.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'flex items-center gap-3 p-3 bg-white border rounded-lg transition-all',
                    draggedItem === subject.id
                      ? 'opacity-50 border-primary-500'
                      : 'border-gray-300 hover:border-gray-400',
                    'cursor-move'
                  )}
                >
                  {/* 拖拽图标 */}
                  <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />

                  {/* 科目名称 */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900">
                      {subject.name}
                    </span>
                    {subject.isRequired && (
                      <span className="ml-2 text-xs text-red-500">(必修)</span>
                    )}
                  </div>

                  {/* 满分输入 */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">满分:</label>
                    <input
                      type="text"
                      value={subject.fullScore}
                      onChange={(e) => handleScoreChange(subject.id, e.target.value)}
                      className={cn(
                        'w-16 px-2 py-1 border rounded text-sm text-center',
                        errors[subject.id]
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-primary-500'
                      )}
                    />
                  </div>

                  {/* 删除按钮 */}
                  {!subject.isRequired && (
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}

                  {/* 必修科目占位，保持布局一致 */}
                  {subject.isRequired && (
                    <div className="w-6" />
                  )}
                </div>
              ))}
            </div>

            {/* 添加科目区域 */}
            <div className="mt-4">
              {showAddInput ? (
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="输入科目名称"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        autoFocus
                      />
                      {errors.newSubject && (
                        <p className="text-xs text-red-600 mt-1">
                          {errors.newSubject}
                        </p>
                      )}
                    </div>

                    <div className="w-24">
                      <input
                        type="text"
                        value={newSubjectScore}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            setNewSubjectScore(e.target.value);
                          }
                        }}
                        placeholder="满分"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-center"
                      />
                    </div>

                    <button
                      onClick={handleAddSubject}
                      className="px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                    >
                      添加
                    </button>

                    <button
                      onClick={() => {
                        setShowAddInput(false);
                        setNewSubjectName('');
                        setNewSubjectScore('100');
                        setErrors({});
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddInput(true)}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">添加自定义科目</span>
                </button>
              )}
            </div>

            {/* 提示信息 */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 语文、数学、英语为必修科目，不可删除</li>
                <li>• 拖拽科目可调整在Excel中的列顺序</li>
                <li>• 满分仅支持1-1000的正整数</li>
                <li>• 配置将自动保存，下次打开时自动加载</li>
              </ul>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              确认并下载模板
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
