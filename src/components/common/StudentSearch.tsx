import { useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Student } from '../../types';

interface StudentSearchProps {
  students: Student[];
  onSelect: (student: Student) => void;
  placeholder?: string;
}

export default function StudentSearch({
  students,
  onSelect,
  placeholder = '输入姓名或学号搜索...',
}: StudentSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // 搜索过滤
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (student: Student) => {
    onSelect(student);
    setQuery('');
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 搜索结果 */}
      {showResults && query && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowResults(false)}
          />

          {/* 结果列表 */}
          <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
            {filteredStudents.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <li key={student.id}>
                    <button
                      onClick={() => handleSelect(student)}
                      className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            学号: {student.id}
                            {student.className && ` • ${student.className}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {student.totalScore.toFixed(1)}
                          </p>
                          {student.rank && (
                            <p className="text-xs text-gray-500">
                              排名 {student.rank}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">未找到匹配的学生</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
