'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, BookOpen, Trophy, Settings, Printer } from 'lucide-react'
import PracticeMode from '@/components/PracticeMode'
import SettingsPanel from '@/components/SettingsPanel'
import StatsPanel from '@/components/StatsPanel'
import PrintableWorksheet from '@/components/PrintableWorksheet'

export default function Home() {
  const [activeTab, setActiveTab] = useState('practice')

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
          <PracticeMode />
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