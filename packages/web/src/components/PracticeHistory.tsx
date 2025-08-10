'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PracticeSession, UserStats, OperationType } from '@exams/shared'

interface PracticeHistoryProps {
  onBackToHome?: () => void
}

export default function PracticeHistory({ onBackToHome }: PracticeHistoryProps) {
  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    // 从 localStorage 加载练习历史
    loadPracticeHistory()
  }, [])

  const loadPracticeHistory = () => {
    try {
      const savedSessions = localStorage.getItem('practiceHistory')
      if (savedSessions) {
        const parsedSessions = JSON.parse(savedSessions)
        setSessions(parsedSessions)
        calculateStats(parsedSessions)
      }
    } catch (error) {
      console.error('加载练习历史失败:', error)
    }
  }

  const calculateStats = (sessions: PracticeSession[]) => {
    if (sessions.length === 0) {
      setStats(null)
      return
    }

    const totalProblems = sessions.reduce((sum, session) => sum + session.problems.length, 0)
    const correctAnswers = sessions.reduce((sum, session) => 
      sum + session.problems.filter(p => p.isCorrect).length, 0
    )
    const totalTime = sessions.reduce((sum, session) => sum + session.totalTime, 0)
    const averageTime = totalTime / totalProblems

    // 计算各运算类型的正确率
    const operationStats: Record<OperationType, { correct: number, total: number }> = {
      addition: { correct: 0, total: 0 },
      subtraction: { correct: 0, total: 0 },
      multiplication: { correct: 0, total: 0 },
      division: { correct: 0, total: 0 }
    }

    sessions.forEach(session => {
      session.problems.forEach(problem => {
        operationStats[problem.type].total++
        if (problem.isCorrect) {
          operationStats[problem.type].correct++
        }
      })
    })

    // 找出最强和最弱的运算类型
    let strongestOperation: OperationType = 'addition'
    let weakestOperation: OperationType = 'addition'
    let highestAccuracy = 0
    let lowestAccuracy = 100

    Object.entries(operationStats).forEach(([operation, stat]) => {
      if (stat.total > 0) {
        const accuracy = (stat.correct / stat.total) * 100
        if (accuracy > highestAccuracy) {
          highestAccuracy = accuracy
          strongestOperation = operation as OperationType
        }
        if (accuracy < lowestAccuracy) {
          lowestAccuracy = accuracy
          weakestOperation = operation as OperationType
        }
      }
    })

    setStats({
      totalProblems,
      correctAnswers,
      averageTime,
      strongestOperation,
      weakestOperation,
      recentSessions: sessions.slice(-5)
    })
  }

  const clearHistory = () => {
    if (confirm('确定要清除所有练习历史吗？此操作不可撤销。')) {
      localStorage.removeItem('practiceHistory')
      setSessions([])
      setStats(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getOperationName = (type: OperationType) => {
    const names = {
      addition: '加法',
      subtraction: '减法',
      multiplication: '乘法',
      division: '除法'
    }
    return names[type]
  }

  const getDifficultyName = (difficulty: string) => {
    const names = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return names[difficulty as keyof typeof names] || difficulty
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>练习历史</CardTitle>
              <CardDescription>
                查看你的练习记录和统计数据
              </CardDescription>
            </div>
            {onBackToHome && (
              <Button onClick={onBackToHome} variant="outline">
                返回首页
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">统计概览</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          {stats ? (
            <>
              {/* 总体统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>总体表现</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalProblems}</div>
                      <div className="text-sm text-gray-600">总题数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((stats.correctAnswers / stats.totalProblems) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">正确率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round(stats.averageTime)}秒
                      </div>
                      <div className="text-sm text-gray-600">平均用时</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{sessions.length}</div>
                      <div className="text-sm text-gray-600">练习次数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 运算类型分析 */}
              <Card>
                <CardHeader>
                  <CardTitle>运算类型分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">最擅长</span>
                      <span className="text-green-600 font-bold">
                        {getOperationName(stats.strongestOperation)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">需要加强</span>
                      <span className="text-red-600 font-bold">
                        {getOperationName(stats.weakestOperation)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">还没有练习记录，快去开始第一次练习吧！</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {sessions.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">最近的练习记录</h3>
                <Button onClick={clearHistory} variant="destructive" size="sm">
                  清除历史
                </Button>
              </div>
              
              <div className="space-y-3">
                {sessions.slice().reverse().map((session, index) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatDate(session.startTime)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {session.settings.operationType.map(getOperationName).join(', ')} • 
                            {getDifficultyName(session.settings.difficulty)} • 
                            {session.problems.length} 题
                          </div>
                          <div className="text-sm text-gray-500">
                            用时: {formatTime(session.totalTime)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {session.score} / {session.problems.length}
                          </div>
                          <div className="text-sm text-gray-600">
                            {Math.round((session.score / session.problems.length) * 100)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">还没有练习记录</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}