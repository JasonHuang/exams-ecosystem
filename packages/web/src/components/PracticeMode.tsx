'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MathProblem, PracticeSettings } from '@exams/shared'
import { generatePracticeProblems, formatProblem } from '@exams/shared'
import PracticeSettingsComponent from './PracticeSettings'

interface PracticeModeProps {
  initialSettings?: PracticeSettings
  autoStart?: boolean
}

export default function PracticeMode({ initialSettings, autoStart = false }: PracticeModeProps) {
  const [problems, setProblems] = useState<MathProblem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [currentSettings, setCurrentSettings] = useState<PracticeSettings | null>(null)
  const [problemStartTime, setProblemStartTime] = useState<Date | null>(null)
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentProblem = problems[currentIndex]

  // 计时器效果
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && isSessionActive) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      // 时间到，结束练习
      setIsSessionActive(false)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [timeRemaining, isSessionActive])

  // 自动聚焦输入框
  useEffect(() => {
    if (isSessionActive && !showResult && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentIndex, showResult, isSessionActive])

  // 自动开始练习
  useEffect(() => {
    if (autoStart && initialSettings && !isSessionActive && problems.length === 0) {
      startPracticeWithSettings(initialSettings)
    }
  }, [autoStart, initialSettings])

  // 倒计时效果
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0) {
      // 倒计时结束，自动进入下一题
      setCountdown(null)
      nextProblem()
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
      }
    }
  }, [countdown])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (countdownRef.current) {
        clearTimeout(countdownRef.current)
      }
    }
  }, [])

  // 默认练习设置
  const defaultSettings: PracticeSettings = {
    operationType: ['addition', 'subtraction'],
    difficulty: 'easy',
    problemCount: 10,
    numberRange: { min: 1, max: 10 },
    timeLimit: undefined
  }

  const startPracticeWithSettings = (settings: PracticeSettings) => {
    const newProblems = generatePracticeProblems(settings)
    setProblems(newProblems)
    setCurrentSettings(settings)
    setCurrentIndex(0)
    setScore(0)
    setUserAnswer('')
    setShowResult(false)
    setIsSessionActive(true)
    setShowSettings(false)
    setStartTime(new Date())
    setProblemStartTime(new Date())
    setIncorrectAnswers([])
    
    // 设置计时器
    if (settings.timeLimit) {
      setTimeRemaining(settings.timeLimit)
    } else {
      setTimeRemaining(null)
    }
  }

  const startPractice = () => {
    // 优先使用传入的初始设置，否则使用默认设置
    const settingsToUse = initialSettings || defaultSettings
    startPracticeWithSettings(settingsToUse)
  }

  const showCustomSettings = () => {
    setShowSettings(true)
  }

  const submitAnswer = () => {
    if (!currentProblem || !problemStartTime) return

    const isCorrect = parseInt(userAnswer) === currentProblem.answer
    const timeSpent = new Date().getTime() - problemStartTime.getTime()
    
    // 更新题目信息
    const updatedProblem = {
      ...currentProblem,
      userAnswer: parseInt(userAnswer),
      isCorrect,
      timeSpent: Math.round(timeSpent / 1000)
    }
    
    const updatedProblems = [...problems]
    updatedProblems[currentIndex] = updatedProblem
    setProblems(updatedProblems)
    
    if (isCorrect) {
      setScore(score + 1)
    } else {
      setIncorrectAnswers([...incorrectAnswers, currentIndex])
    }
    setShowResult(true)
    
    // 启动3秒倒计时
    setCountdown(3)
  }

  const nextProblem = () => {
    // 清除倒计时
    setCountdown(null)
    if (countdownRef.current) {
      clearTimeout(countdownRef.current)
    }
    
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setShowResult(false)
      setProblemStartTime(new Date())
    } else {
      // 练习结束
      setIsSessionActive(false)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      savePracticeSession()
    }
  }

  const savePracticeSession = () => {
    if (!startTime || !currentSettings) return

    const session = {
      id: `session_${Date.now()}`,
      startTime,
      endTime: new Date(),
      problems,
      score,
      totalTime: getTotalTime(),
      settings: currentSettings
    }

    try {
      const existingHistory = localStorage.getItem('practiceHistory')
      const history = existingHistory ? JSON.parse(existingHistory) : []
      history.push(session)
      
      // 只保留最近50次练习记录
      if (history.length > 50) {
        history.splice(0, history.length - 50)
      }
      
      localStorage.setItem('practiceHistory', JSON.stringify(history))
    } catch (error) {
      console.error('保存练习历史失败:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      submitAnswer()
    }
  }

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 计算总用时
  const getTotalTime = () => {
    if (!startTime) return 0
    return Math.round((new Date().getTime() - startTime.getTime()) / 1000)
  }

  // 显示设置界面
  if (showSettings) {
    return (
      <PracticeSettingsComponent
        onStartPractice={startPracticeWithSettings}
        onCancel={() => setShowSettings(false)}
      />
    )
  }

  if (!isSessionActive && !currentProblem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>数学练习</CardTitle>
          <CardDescription>
            开始你的数学练习之旅
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              准备好开始练习了吗？
            </p>
            
            {/* 快速开始 */}
            <div className="space-y-4">
              <Button onClick={startPractice} size="lg" className="w-full h-14 text-lg">
                🚀 快速开始练习
              </Button>
              <p className="text-sm text-gray-500">
                默认设置：加减法 | 简单难度 | 10题 | 1-10范围
              </p>
            </div>
            
            {/* 分隔线 */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-sm text-gray-500">或</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
            
            {/* 自定义设置 */}
            <Button onClick={showCustomSettings} variant="outline" size="lg" className="w-full">
              ⚙️ 自定义设置
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isSessionActive && currentProblem) {
    // 练习结束，显示结果
    const accuracy = Math.round((score / problems.length) * 100)
    const totalTime = getTotalTime()
    const averageTime = problems.length > 0 ? Math.round(totalTime / problems.length) : 0
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>练习完成！</CardTitle>
          <CardDescription>
            你的成绩统计
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {score} / {problems.length}
            </div>
            <p className="text-lg text-gray-600 mb-4">
              正确率: {accuracy}%
            </p>
          </div>

          {/* 详细统计 */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatTime(totalTime)}</div>
              <div className="text-sm text-gray-600">总用时</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{averageTime}秒</div>
              <div className="text-sm text-gray-600">平均每题</div>
            </div>
          </div>

          {/* 错题回顾 */}
          {incorrectAnswers.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">错题回顾:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {incorrectAnswers.map((index) => {
                  const problem = problems[index]
                  return (
                    <div key={index} className="bg-red-50 p-3 rounded-lg text-sm">
                      <div className="font-medium">第 {index + 1} 题: {formatProblem(problem)}</div>
                      <div className="text-red-600">
                        你的答案: {problem.userAnswer} | 正确答案: {problem.answer}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={startPractice} className="flex-1" size="lg">
              再次练习
            </Button>
            <Button 
              onClick={() => {
                setProblems([])
                setCurrentIndex(0)
                setScore(0)
                setIncorrectAnswers([])
              }} 
              variant="outline" 
              size="lg"
            >
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>第 {currentIndex + 1} 题 / {problems.length}</CardTitle>
            <CardDescription>
              当前得分: {score} 分
            </CardDescription>
          </div>
          {timeRemaining !== null && (
            <div className={`text-lg font-bold ${timeRemaining <= 30 ? 'text-red-600' : 'text-blue-600'}`}>
              ⏰ {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        
        {/* 进度条 */}
        <div className="mt-4">
          <Progress value={currentIndex + 1} max={problems.length} />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>进度</span>
            <span>{Math.round(((currentIndex + 1) / problems.length) * 100)}%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {currentProblem && (
          <div className="text-center">
            {/* 题目显示 */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {formatProblem(currentProblem)}
              </div>
              <div className="text-sm text-gray-500">
                难度: {currentSettings?.difficulty === 'easy' ? '简单' : 
                      currentSettings?.difficulty === 'medium' ? '中等' : '困难'}
              </div>
            </div>
            
            {!showResult ? (
              <div className="space-y-4">
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="answer-input w-40 h-14 border-2 border-gray-300 rounded-lg text-center text-xl font-bold focus:border-blue-500 focus:outline-none"
                  placeholder="输入答案"
                />
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!userAnswer}
                    size="lg"
                    className="px-8"
                  >
                    提交答案
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsSessionActive(false)
                      if (timerRef.current) {
                        clearTimeout(timerRef.current)
                      }
                    }}
                    variant="outline"
                    size="lg"
                  >
                    结束练习
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`text-3xl font-bold ${
                  parseInt(userAnswer) === currentProblem.answer 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {parseInt(userAnswer) === currentProblem.answer ? '✅ 正确！' : '❌ 错误！'}
                </div>
                {parseInt(userAnswer) !== currentProblem.answer && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-lg text-red-700 font-medium">
                      正确答案是: {currentProblem.answer}
                    </div>
                    <div className="text-sm text-red-600 mt-1">
                      你的答案: {userAnswer}
                    </div>
                  </div>
                )}
                {currentProblem.timeSpent && (
                  <div className="text-sm text-gray-600">
                    用时: {currentProblem.timeSpent} 秒
                  </div>
                )}
                
                {/* 倒计时显示 */}
                {countdown !== null && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-lg font-medium text-blue-700">
                      {countdown} 秒后自动进入下一题
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      或点击按钮立即继续
                    </div>
                  </div>
                )}
                
                <Button onClick={nextProblem} size="lg" className="px-8">
                  {currentIndex < problems.length - 1 ? '下一题 →' : '完成练习 🎉'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}