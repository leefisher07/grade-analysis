import { useState } from 'react';
import { Download, FileText, Printer, Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface ExportButtonProps {
  onExportPDF?: () => Promise<void>;
  onExportExcel?: () => Promise<void>;
  onPrint?: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function ExportButton({
  onExportPDF,
  onExportExcel,
  onPrint,
  label = '导出',
  variant = 'primary',
  size = 'md',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExportPDF = async () => {
    if (!onExportPDF) return;

    setIsExporting(true);
    setShowMenu(false);
    try {
      await onExportPDF();
    } catch (error) {
      alert(error instanceof Error ? error.message : '导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!onExportExcel) return;

    setIsExporting(true);
    setShowMenu(false);
    try {
      await onExportExcel();
    } catch (error) {
      alert(error instanceof Error ? error.message : '导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    if (!onPrint) return;
    setShowMenu(false);
    onPrint();
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
  };

  // 如果只有一个导出选项，直接显示按钮
  const hasMultipleOptions = [onExportPDF, onExportExcel, onPrint].filter(Boolean).length > 1;

  if (!hasMultipleOptions) {
    const singleHandler = onExportPDF || onExportExcel;
    if (!singleHandler && !onPrint) return null;

    return (
      <button
        onClick={onPrint || (singleHandler ? async () => {
          setIsExporting(true);
          try {
            await singleHandler();
          } catch (error) {
            alert(error instanceof Error ? error.message : '导出失败');
          } finally {
            setIsExporting(false);
          }
        } : undefined)}
        disabled={isExporting}
        className={cn(
          'inline-flex items-center space-x-2 rounded-lg font-medium transition-colors',
          sizeClasses[size],
          variantClasses[variant],
          isExporting && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{isExporting ? '导出中...' : label}</span>
      </button>
    );
  }

  // 多个选项时显示下拉菜单
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className={cn(
          'inline-flex items-center space-x-2 rounded-lg font-medium transition-colors',
          sizeClasses[size],
          variantClasses[variant],
          isExporting && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{isExporting ? '导出中...' : label}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {onExportPDF && (
              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>导出为 PDF</span>
              </button>
            )}
            {onExportExcel && (
              <button
                onClick={handleExportExcel}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>导出为 Excel</span>
              </button>
            )}
            {onPrint && (
              <button
                onClick={handlePrint}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Printer className="h-4 w-4" />
                <span>打印</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
