'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MathProblem, PracticeSettings } from '@exams/shared'
import { generatePracticeProblems, formatProblem } from '@exams/shared'

export default function PracticeMode() {
  const [problems, setProblems] = useState<MathProblem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isSessionActive, setIsSessionActive] = useState(false)

  const currentProblem = problems[currentIndex]

  const defaultSettings: PracticeSettings = {
    operationType: ['addition'],
    difficulty: 'easy',
    problemCount: 10,
    numberRange: { min: 1, max: 10 }
  }

  const startPractice = () => {
    const newProblems = generatePracticeProblems(defaultSettings)
    setProblems(newProblems)
    setCurrentIndex(0)
    setScore(0)
    setUserAnswer('')
    setShowResult(false)
    setIsSessionActive(true)
  }

  const submitAnswer = () => {
    if (!currentProblem) return

    const isCorrect = parseInt(userAnswer) === currentProblem.answer
    if (isCorrect) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const nextProblem = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setShowResult(false)
    } else {
      // 练习结束
      setIsSessionActive(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult) {
      submitAnswer()
    }
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
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              准备好开始练习了吗？点击下面的按钮开始！
            </p>
            <Button onClick={startPractice} size="lg">
              开始练习
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isSessionActive && currentProblem) {
    // 练习结束，显示结果
    return (
      <Card>
        <CardHeader>
          <CardTitle>练习完成！</CardTitle>
          <CardDescription>
            你的成绩
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {score} / {problems.length}
            </div>
            <p className="text-lg text-gray-600 mb-4">
              正确率: {Math.round((score / problems.length) * 100)}%
            </p>
            <Button onClick={startPractice} size="lg">
              再次练习
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>第 {currentIndex + 1} 题 / {problems.length}</CardTitle>
        <CardDescription>
          当前得分: {score} 分
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentProblem && (
          <div className="text-center">
            <div className="math-problem mb-6">
              {formatProblem(currentProblem)}
            </div>
            
            {!showResult ? (
              <div className="space-y-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="answer-input w-32 h-12 border-2 border-gray-300 rounded-lg text-center text-lg"
                  placeholder="答案"
                  autoFocus
                />
                <div>
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!userAnswer}
                    size="lg"
                  >
                    提交答案
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`text-2xl font-bold ${
                  parseInt(userAnswer) === currentProblem.answer 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {parseInt(userAnswer) === currentProblem.answer ? '正确！' : '错误！'}
                </div>
                {parseInt(userAnswer) !== currentProblem.answer && (
                  <div className="text-lg text-gray-600">
                    正确答案是: {currentProblem.answer}
                  </div>
                )}
                <Button onClick={nextProblem} size="lg">
                  {currentIndex < problems.length - 1 ? '下一题' : '完成练习'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}