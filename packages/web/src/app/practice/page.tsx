'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PracticeMode from '@/components/PracticeMode'
import PracticeHistory from '@/components/PracticeHistory'
import { PracticeSettings, OperationType } from '@exams/shared'

type ViewMode = 'home' | 'practice' | 'history'

export default function PracticePage() {
  const [currentView, setCurrentView] = useState<ViewMode>('home')
  const [practiceSettings, setPracticeSettings] = useState<PracticeSettings | undefined>(undefined)
  const [autoStart, setAutoStart] = useState(false)

  const startQuickPractice = (operationType: OperationType) => {
    const settings: PracticeSettings = {
      operationType: [operationType],
      difficulty: 'easy',
      problemCount: 10,
      numberRange: { min: 1, max: 10 },
      timeLimit: undefined
    }
    setPracticeSettings(settings)
    setAutoStart(true)
    setCurrentView('practice')
  }

  const backToHome = () => {
    setCurrentView('home')
    setPracticeSettings(undefined)
    setAutoStart(false)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'practice':
        return (
          <PracticeMode 
            initialSettings={practiceSettings} 
            autoStart={autoStart}
          />
        )
      case 'history':
        return <PracticeHistory onBackToHome={backToHome} />
      default:
        return (
          <div className="space-y-6">
            {/* 页面标题 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">数学练习</h1>
              <p className="text-gray-600">开始你的数学练习之旅</p>
            </div>

            {/* 功能特色 */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 text-white p-3 rounded-lg">
                    📚
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">功能特色：</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• 自定义练习设置</li>
                      <li>• 实时计时和进度</li>
                      <li>• 详细统计分析</li>
                      <li>• 错题回顾功能</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 功能选择 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎯 开始练习
                  </CardTitle>
                  <CardDescription>
                    自定义练习设置，开始数学题目练习
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 支持加减乘除四种运算</li>
                    <li>• 三种难度级别可选</li>
                    <li>• 自定义题目数量和数字范围</li>
                    <li>• 可设置时间限制</li>
                    <li>• 实时统计和错题回顾</li>
                  </ul>
                  <Button 
                    onClick={() => setCurrentView('practice')} 
                    className="w-full"
                    size="lg"
                  >
                    开始练习
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📊 练习历史
                  </CardTitle>
                  <CardDescription>
                    查看练习记录和学习统计
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 总体表现统计</li>
                    <li>• 运算类型分析</li>
                    <li>• 历史练习记录</li>
                    <li>• 学习进度追踪</li>
                    <li>• 强弱项识别</li>
                  </ul>
                  <Button 
                    onClick={() => setCurrentView('history')} 
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    查看历史
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 快速开始 */}
            <Card>
              <CardHeader>
                <CardTitle>快速开始</CardTitle>
                <CardDescription>
                  使用预设配置快速开始练习
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => startQuickPractice('addition')}
                  >
                    <span className="text-lg">➕</span>
                    <span className="text-sm">加法练习</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => startQuickPractice('subtraction')}
                  >
                    <span className="text-lg">➖</span>
                    <span className="text-sm">减法练习</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => startQuickPractice('multiplication')}
                  >
                    <span className="text-lg">✖️</span>
                    <span className="text-sm">乘法练习</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => startQuickPractice('division')}
                  >
                    <span className="text-lg">➗</span>
                    <span className="text-sm">除法练习</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {currentView !== 'home' && (
        <div className="mb-6">
          <Button 
            onClick={backToHome} 
            variant="outline"
            className="mb-4"
          >
            ← 返回首页
          </Button>
        </div>
      )}
      
      {renderContent()}
    </div>
  )
}