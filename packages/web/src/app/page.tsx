'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, BookOpen, Trophy, Settings, Printer } from 'lucide-react'
import Link from 'next/link'
import SettingsPanel from '@/components/SettingsPanel'
import StatsPanel from '@/components/StatsPanel'
import PrintableWorksheet from '@/components/PrintableWorksheet'
import PracticeMode from '@/components/PracticeMode'
import PracticeHistory from '@/components/PracticeHistory'
import { PracticeSettings, OperationType } from '@exams/shared'

type PracticeViewMode = 'home' | 'practice' | 'history'

export default function Home() {
  const [activeTab, setActiveTab] = useState('practice')
  const [practiceView, setPracticeView] = useState<PracticeViewMode>('home')
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
    setPracticeView('practice')
  }

  const backToPracticeHome = () => {
    setPracticeView('home')
    setPracticeSettings(undefined)
    setAutoStart(false)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🧮 小学数学练习题
        </h1>
        <p className="text-lg text-gray-600">
          让数学学习变得更有趣！
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="practice" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            练习
          </TabsTrigger>
          <TabsTrigger value="printable" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            打印
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            学习
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            统计
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            设置
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="mt-6">
          {practiceView === 'practice' && (
            <div className="mb-6">
              <Button 
                onClick={backToPracticeHome} 
                variant="outline"
                className="mb-4"
              >
                ← 返回练习首页
              </Button>
              <PracticeMode 
                initialSettings={practiceSettings} 
                autoStart={autoStart}
              />
            </div>
          )}
          
          {practiceView === 'history' && (
            <div className="mb-6">
              <Button 
                onClick={backToPracticeHome} 
                variant="outline"
                className="mb-4"
              >
                ← 返回练习首页
              </Button>
              <PracticeHistory onBackToHome={backToPracticeHome} />
            </div>
          )}
          
          {practiceView === 'home' && (
            <div className="space-y-6">




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
                      onClick={() => setPracticeView('practice')} 
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
                      onClick={() => setPracticeView('history')} 
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
          )}
        </TabsContent>

        <TabsContent value="printable" className="mt-6">
          <PrintableWorksheet />
        </TabsContent>

        <TabsContent value="learn" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>学习模式</CardTitle>
              <CardDescription>
                通过互动教学来学习数学概念
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500">学习模式正在开发中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <StatsPanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}