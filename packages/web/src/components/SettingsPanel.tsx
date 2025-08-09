'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>练习设置</CardTitle>
        <CardDescription>
          自定义你的练习偏好
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500">设置面板正在开发中...</p>
        </div>
      </CardContent>
    </Card>
  )
}