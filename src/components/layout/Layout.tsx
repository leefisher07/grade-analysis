import { Outlet, NavLink } from 'react-router-dom';
import {
  Upload,
  BarChart3,
  Users,
  History,
  Settings
} from 'lucide-react';
import { cn } from '../../utils/helpers';

const navigation = [
  { name: '导入成绩表', path: '/import', icon: Upload },
  { name: '成绩分析', path: '/analysis', icon: BarChart3 },
  { name: '学生报告', path: '/student', icon: Users },
  { name: '历史记录', path: '/history', icon: History },
  { name: '系统设置', path: '/settings', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <BarChart3 className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  睿析成绩分析引擎
                </span>
              </div>

              {/* 导航菜单 */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'text-primary-700 bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 移动端导航 */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="flex overflow-x-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex-1 flex flex-col items-center px-3 py-2 text-xs font-medium',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )
                }
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="whitespace-nowrap">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
