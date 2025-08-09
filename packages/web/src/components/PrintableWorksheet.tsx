'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PrintableSettings, 
  PrintablePage, 
  generatePrintablePages, 
  getDefaultPrintableSettings 
} from '@exams/shared';
import { gradeInfo, presetTemplates, getPresetsByGrade, getPresetById } from '@/lib/printablePresets';
import { Download, Eye, Printer } from 'lucide-react';

export default function PrintableWorksheet() {
  const [settings, setSettings] = useState<PrintableSettings>(getDefaultPrintableSettings());
  const [pages, setPages] = useState<PrintablePage[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>('grade2');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null);

  // 生成习题页面
  const generatePages = () => {
    const newPages = generatePrintablePages(settings);
    setPages(newPages);
    setShowPreview(true);
  };

  // 下载PDF
  const downloadPDF = async () => {
    if (!printRef.current || pages.length === 0) return;

    try {
      // 动态导入库以减少初始包大小
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4宽度
      const pageHeight = 297; // A4高度

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        // 为每一页创建单独的元素进行截图
        const pageElement = printRef.current.children[i] as HTMLElement;
        if (pageElement) {
          const canvas = await html2canvas(pageElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
        }
      }

      pdf.save(`${settings.title || '数学练习题'}.pdf`);
    } catch (error) {
      console.error('生成PDF时出错:', error);
      alert('生成PDF时出错，请重试');
    }
  };

  // 打印
  const handlePrint = () => {
    if (pages.length === 0) {
      alert('请先生成习题');
      return;
    }
    window.print();
  };

  // 更新设置
  const updateSettings = (newSettings: Partial<PrintableSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // 处理年级变化
  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedPreset(''); // 重置预设选择
  };

  // 处理预设变化
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = getPresetById(presetId);
    if (preset) {
      updateSettings({
        operationTypes: preset.operationTypes,
        numberRange: preset.numberRange,
        problemsPerPage: preset.problemsPerPage,
        title: preset.title
      });
    }
  };

  // 处理运算类型变化
  const handleOperationTypeChange = (operationType: string, checked: boolean) => {
    const newOperationTypes = checked
      ? [...settings.operationTypes, operationType as any]
      : settings.operationTypes.filter(type => type !== operationType);
    
    updateSettings({ operationTypes: newOperationTypes });
  };

  const currentGradePresets = getPresetsByGrade(selectedGrade as any);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Printer className="h-5 w-5" />
            可打印习题生成器
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 年级和预设模板 - 合并到一行 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">选择年级</Label>
              <Select value={selectedGrade} onValueChange={handleGradeChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="选择年级" />
                </SelectTrigger>
                <SelectContent>
                  {gradeInfo.map(grade => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label} - {grade.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">预设模板</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="选择预设模板（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {currentGradePresets.map(preset => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 运算类型 - 使用4列布局 */}
          <div className="space-y-1">
            <Label className="text-sm">运算类型</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'addition', label: '加法 (+)' },
                { value: 'subtraction', label: '减法 (-)' },
                { value: 'multiplication', label: '乘法 (×)' },
                { value: 'division', label: '除法 (÷)' }
              ].map(operation => (
                <div key={operation.value} className="flex items-center space-x-1">
                  <Checkbox
                    id={operation.value}
                    checked={settings.operationTypes.includes(operation.value as any)}
                    onCheckedChange={(checked) => 
                      handleOperationTypeChange(operation.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={operation.value} className="text-sm">{operation.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* 习题标题 */}
          <div className="space-y-1">
            <Label htmlFor="title" className="text-sm">习题标题</Label>
            <Input
              id="title"
              value={settings.title || ''}
              onChange={(e) => updateSettings({ title: e.target.value })}
              placeholder="输入习题标题"
              className="h-9"
            />
          </div>

          {/* 数字范围、每页题数和页数 - 合并到一行 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="minRange" className="text-sm">最小值</Label>
              <Input
                id="minRange"
                type="number"
                value={settings.numberRange.min}
                onChange={(e) => updateSettings({
                  numberRange: { ...settings.numberRange, min: parseInt(e.target.value) || 1 }
                })}
                min="1"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxRange" className="text-sm">最大值</Label>
              <Input
                id="maxRange"
                type="number"
                value={settings.numberRange.max}
                onChange={(e) => updateSettings({
                  numberRange: { ...settings.numberRange, max: parseInt(e.target.value) || 10 }
                })}
                min="1"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="problemsPerPage" className="text-sm">每页题数</Label>
              <Input
                id="problemsPerPage"
                type="number"
                value={settings.problemsPerPage}
                onChange={(e) => updateSettings({ problemsPerPage: parseInt(e.target.value) || 20 })}
                min="1"
                max="100"
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pageCount" className="text-sm">页数</Label>
              <Input
                id="pageCount"
                type="number"
                value={settings.pageCount}
                onChange={(e) => updateSettings({ pageCount: parseInt(e.target.value) || 1 })}
                min="1"
                max="10"
                className="h-9"
              />
            </div>
          </div>

          {/* 预览信息 */}
          {pages.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                已生成 {pages.length} 页习题，共 {pages.reduce((total, page) => total + page.problems.length, 0)} 道题目
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button onClick={generatePages} className="flex-1 h-9">
              <Eye className="h-4 w-4 mr-2" />
              生成预览
            </Button>
            <Button 
              onClick={downloadPDF} 
              disabled={pages.length === 0}
              variant="outline"
              className="h-9"
            >
              <Download className="h-4 w-4 mr-2" />
              下载PDF
            </Button>
            <Button 
              onClick={handlePrint} 
              disabled={pages.length === 0}
              variant="outline"
              className="h-9"
            >
              <Printer className="h-4 w-4 mr-2" />
              打印
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 可打印内容 */}
      {showPreview && pages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">预览</h3>
          <div ref={printRef} className="print-content">
            {pages.map((page, pageIndex) => (
              <div key={pageIndex} className="print-page">
                {/* 页面标题 */}
                <div className="print-header">
                  <h1 className="print-title">{page.title}</h1>
                  <div className="print-info">
                    <span>姓名：_______________</span>
                    <span>班级：_______________</span>
                    <span>日期：_______________</span>
                  </div>
                </div>

                {/* 题目网格 */}
                <div className="print-problems">
                  {page.problems.map((problem, problemIndex) => (
                    <div key={problem.id} className="print-problem">
                      <span className="problem-text">
                        {problem.operand1} {problem.operation} {problem.operand2} = 
                      </span>
                    </div>
                  ))}
                </div>

                {/* 页脚 */}
                <div className="print-footer">
                  <span>第 {page.pageNumber} 页</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }

        .print-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 20px;
          padding: 20mm;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          page-break-after: always;
        }

        .print-page:last-child {
          page-break-after: avoid;
        }

        .print-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .print-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }

        .print-info {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #666;
        }

        .print-problems {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 40px;
        }

        .print-problem {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1.5;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #fafafa;
        }

        .problem-text {
          font-family: 'Courier New', monospace;
          font-weight: bold;
          text-align: center;
        }

        .print-footer {
          position: absolute;
          bottom: 20mm;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          color: #666;
        }

        @media print {
          .print-page {
            box-shadow: none;
            margin: 0;
            page-break-after: always;
          }
          
          .print-footer {
            position: fixed;
            bottom: 10mm;
          }
        }
      `}</style>
    </div>
  );
}