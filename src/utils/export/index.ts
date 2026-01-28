import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Student, ExamConfig } from '../../types';
import { exportToExcel } from '../excel';

/**
 * 将DOM元素导出为PDF
 */
export async function exportElementToPDF(
  element: HTMLElement,
  filename: string,
  options?: {
    scale?: number;
    margin?: number;
  }
): Promise<void> {
  const scale = options?.scale || 2;
  const margin = options?.margin || 10;

  try {
    // 使用html2canvas将元素转换为canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210 - margin * 2; // A4宽度减去边距
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = imgHeight;
    let position = margin;

    // 添加第一页
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.height - margin * 2;

    // 如果内容超过一页，添加更多页面
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.height - margin * 2;
    }

    // 保存PDF
    pdf.save(filename);
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw new Error('PDF导出失败，请重试');
  }
}

/**
 * 导出学生成绩单为PDF
 */
export async function exportStudentReportPDF(
  student: Student,
  _config: ExamConfig,
  examName: string
): Promise<void> {
  const filename = `${examName}_${student.name}_成绩单.pdf`;

  // 查找包含学生报告卡的元素
  const reportElement = document.querySelector('[data-export="student-report"]') as HTMLElement;

  if (!reportElement) {
    throw new Error('未找到成绩单元素');
  }

  await exportElementToPDF(reportElement, filename);
}

/**
 * 批量导出所有学生成绩单为Excel
 */
export async function exportAllStudentsToExcel(
  students: Student[],
  _config: ExamConfig,
  examName: string
): Promise<void> {
  await exportToExcel(students, `${examName}_全部成绩.xlsx`);
}

/**
 * 导出分析报告为PDF
 */
export async function exportAnalysisReportPDF(examName: string): Promise<void> {
  const filename = `${examName}_分析报告.pdf`;

  // 查找分析页面的主内容区域
  const analysisElement = document.querySelector('[data-export="analysis"]') as HTMLElement;

  if (!analysisElement) {
    throw new Error('未找到分析报告元素');
  }

  await exportElementToPDF(analysisElement, filename, { scale: 1.5 });
}

/**
 * 打印当前页面
 */
export function printCurrentPage(): void {
  window.print();
}
