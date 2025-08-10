'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { PracticeSettings, OperationType, DifficultyLevel } from '@exams/shared'

interface PracticeSettingsProps {
  onStartPractice: (settings: PracticeSettings) => void
  onCancel?: () => void
}

export default function PracticeSettingsComponent({ onStartPractice, onCancel }: PracticeSettingsProps) {
  const [operationTypes, setOperationTypes] = useState<OperationType[]>(['addition'])
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy')
  const [problemCount, setProblemCount] = useState(10)
  const [numberRange, setNumberRange] = useState({ min: 1, max: 10 })
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined)

  const handleOperationChange = (operation: OperationType, checked: boolean) => {
    if (checked) {
      setOperationTypes([...operationTypes, operation])
    } else {
      setOperationTypes(operationTypes.filter(op => op !== operation))
    }
  }

  const handleStart = () => {
    if (operationTypes.length === 0) {
      alert('请至少选择一种运算类型')
      return
    }

    const settings: PracticeSettings = {
      operationType: operationTypes,
      difficulty,
      problemCount,
      numberRange,
      timeLimit
    }

    onStartPractice(settings)
  }

  const operationLabels = {
    addition: '加法 (+)',
    subtraction: '减法 (-)',
    multiplication: '乘法 (×)',
    division: '除法 (÷)'
  }

  const difficultyLabels = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>练习设置</CardTitle>
        <CardDescription>
          自定义你的数学练习参数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 运算类型选择 */}
        <div className="space-y-3">
          <Label className="text-base font-medium">运算类型</Label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(operationLabels) as OperationType[]).map((operation) => (
              <div key={operation} className="flex items-center space-x-2">
                <Checkbox
                  id={operation}
                  checked={operationTypes.includes(operation)}
                  onCheckedChange={(checked) => handleOperationChange(operation, checked as boolean)}
                />
                <Label htmlFor={operation} className="text-sm">
                  {operationLabels[operation]}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* 难度选择 */}
        <div className="space-y-3">
          <Label className="text-base font-medium">难度级别</Label>
          <Select value={difficulty} onValueChange={(value: string) => setDifficulty(value as DifficultyLevel)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(difficultyLabels) as DifficultyLevel[]).map((level) => (
                <SelectItem key={level} value={level}>
                  {difficultyLabels[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 题目数量 */}
        <div className="space-y-3">
          <Label className="text-base font-medium">题目数量: {problemCount}</Label>
          <Slider
            value={[problemCount]}
            onValueChange={(value: number[]) => setProblemCount(value[0])}
            min={5}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>5题</span>
            <span>50题</span>
          </div>
        </div>

        {/* 数字范围 */}
        <div className="space-y-3">
          <Label className="text-base font-medium">数字范围</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">最小值: {numberRange.min}</Label>
              <Slider
                value={[numberRange.min]}
                onValueChange={(value: number[]) => setNumberRange({ ...numberRange, min: value[0] })}
                min={1}
                max={numberRange.max - 1}
                step={1}
                className="w-full mt-2"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600">最大值: {numberRange.max}</Label>
              <Slider
                value={[numberRange.max]}
                onValueChange={(value: number[]) => setNumberRange({ ...numberRange, max: value[0] })}
                min={numberRange.min + 1}
                max={100}
                step={1}
                className="w-full mt-2"
              />
            </div>
          </div>
        </div>

        {/* 时间限制 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timeLimit"
              checked={timeLimit !== undefined}
              onCheckedChange={(checked) => setTimeLimit(checked ? 300 : undefined)}
            />
            <Label htmlFor="timeLimit" className="text-base font-medium">
              设置时间限制
            </Label>
          </div>
          {timeLimit !== undefined && (
            <div>
              <Label className="text-sm text-gray-600">时间限制: {Math.floor(timeLimit / 60)}分{timeLimit % 60}秒</Label>
              <Slider
                value={[timeLimit]}
                onValueChange={(value: number[]) => setTimeLimit(value[0])}
                min={60}
                max={1800}
                step={30}
                className="w-full mt-2"
              />
            </div>
          )}
        </div>

        {/* 按钮 */}
        <div className="flex gap-3 pt-4">
          <Button onClick={handleStart} className="flex-1" size="lg">
            开始练习
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline" size="lg">
              取消
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}