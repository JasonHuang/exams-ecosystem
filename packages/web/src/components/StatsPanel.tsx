'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function StatsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>学习统计</CardTitle>
        <CardDescription>
          查看你的学习进度和成绩
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500">统计功能正在开发中...</p>
        </div>
      </CardContent>
    </Card>
  )
}