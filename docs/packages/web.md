# @exams/web 包文档

`@exams/web` 是小学数学练习生成器生态系统的 Web 前端应用，基于 Next.js 14 构建，提供现代化的用户界面和交互体验。

## 📋 概述

### 主要功能
- 🎯 **题目练习**: 实时生成和练习数学题目
- 📊 **进度跟踪**: 学习进度和统计分析
- ⚙️ **个性化设置**: 难度、题型、数量等自定义配置
- 📱 **响应式设计**: 支持桌面端和移动端
- 🎨 **现代化 UI**: 基于 Tailwind CSS 的美观界面

### 技术栈
- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Modules
- **状态管理**: Zustand
- **UI 组件**: Radix UI + 自定义组件
- **图标**: Lucide React
- **动画**: Framer Motion
- **表单**: React Hook Form + Zod
- **HTTP 客户端**: Fetch API + SWR

## 🏗️ 项目结构

```
packages/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证相关页面
│   │   ├── practice/          # 练习页面
│   │   ├── profile/           # 用户资料页面
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页
│   ├── components/            # React 组件
│   │   ├── ui/               # 基础 UI 组件
│   │   ├── features/         # 功能组件
│   │   └── layout/           # 布局组件
│   ├── hooks/                # 自定义 Hooks
│   ├── lib/                  # 工具库
│   ├── stores/               # 状态管理
│   ├── styles/               # 样式文件
│   └── types/                # 类型定义
├── public/                   # 静态资源
├── next.config.js           # Next.js 配置
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 包配置
```

## 🎨 组件架构

### 基础 UI 组件 (`src/components/ui/`)

#### Button 组件
```typescript
// src/components/ui/button.tsx
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary'
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Input 组件
```typescript
// src/components/ui/input.tsx
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### 功能组件 (`src/components/features/`)

#### ProblemCard 组件
```typescript
// src/components/features/ProblemCard.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Problem, Answer } from '@exams/shared';

interface ProblemCardProps {
  problem: Problem;
  onAnswer: (answer: Answer) => void;
  showFeedback?: boolean;
  showHints?: boolean;
}

export function ProblemCard({ 
  problem, 
  onAnswer, 
  showFeedback = false,
  showHints = false 
}: ProblemCardProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const answer = parseInt(userAnswer);
    if (isNaN(answer)) return;

    const isCorrect = answer === problem.answer;
    const timeSpent = Date.now() - startTime;

    const answerData: Answer = {
      problemId: problem.id,
      userAnswer: answer,
      isCorrect,
      timeSpent
    };

    setSubmitted(true);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    onAnswer(answerData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          {problem.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入答案"
            disabled={submitted}
            className="text-center text-lg"
            autoFocus
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={submitted || !userAnswer}
          >
            {submitted ? '已提交' : '提交答案'}
          </Button>
        </form>

        {showFeedback && feedback && (
          <div className={cn(
            'p-3 rounded-md text-center',
            feedback === 'correct' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {feedback === 'correct' ? (
              <span>🎉 正确！</span>
            ) : (
              <span>❌ 错误，正确答案是 {problem.answer}</span>
            )}
          </div>
        )}

        {showHints && !submitted && (
          <Button variant="outline" size="sm" className="w-full">
            💡 显示提示
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

#### PracticeSession 组件
```typescript
// src/components/features/PracticeSession.tsx
import { useState, useEffect } from 'react';
import { ProblemCard } from './ProblemCard';
import { ProgressBar } from '@/components/ui/progress-bar';
import { usePracticeStore } from '@/stores/practiceStore';
import type { Problem, Answer, GeneratorConfig } from '@exams/shared';

interface PracticeSessionProps {
  config: GeneratorConfig;
  onComplete: (results: SessionResults) => void;
}

export function PracticeSession({ config, onComplete }: PracticeSessionProps) {
  const {
    problems,
    currentIndex,
    answers,
    setProblems,
    nextProblem,
    submitAnswer,
    reset
  } = usePracticeStore();

  const [loading, setLoading] = useState(true);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    generateProblems();
    return () => reset();
  }, [config]);

  const generateProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/problems/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      setProblems(data.problems);
    } catch (error) {
      console.error('Failed to generate problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: Answer) => {
    submitAnswer(answer);
    
    if (currentIndex < problems.length - 1) {
      setTimeout(() => nextProblem(), 1500);
    } else {
      // 练习完成
      const sessionResults = {
        totalProblems: problems.length,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        totalTime: Date.now() - sessionStartTime,
        answers
      };
      setTimeout(() => onComplete(sessionResults), 1500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>正在生成题目...</p>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="text-center py-8">
        <p>无法生成题目，请检查配置后重试。</p>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">
          题目 {currentIndex + 1} / {problems.length}
        </h2>
        <ProgressBar value={progress} className="w-full max-w-md mx-auto" />
      </div>

      <ProblemCard
        problem={currentProblem}
        onAnswer={handleAnswer}
        showFeedback={true}
        showHints={config.showHints}
      />

      <div className="text-center text-sm text-muted-foreground">
        <p>已完成: {answers.length} 题</p>
        <p>正确率: {answers.length > 0 ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100) : 0}%</p>
      </div>
    </div>
  );
}
```

## 🔄 状态管理

### Zustand Store
```typescript
// src/stores/practiceStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Problem, Answer } from '@exams/shared';

interface PracticeState {
  // 状态
  problems: Problem[];
  currentIndex: number;
  answers: Answer[];
  sessionId: string | null;
  
  // 动作
  setProblems: (problems: Problem[]) => void;
  nextProblem: () => void;
  previousProblem: () => void;
  submitAnswer: (answer: Answer) => void;
  reset: () => void;
  setSessionId: (id: string) => void;
}

export const usePracticeStore = create<PracticeState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      problems: [],
      currentIndex: 0,
      answers: [],
      sessionId: null,

      // 设置题目列表
      setProblems: (problems) => set({ 
        problems, 
        currentIndex: 0, 
        answers: [] 
      }),

      // 下一题
      nextProblem: () => set((state) => ({
        currentIndex: Math.min(state.currentIndex + 1, state.problems.length - 1)
      })),

      // 上一题
      previousProblem: () => set((state) => ({
        currentIndex: Math.max(state.currentIndex - 1, 0)
      })),

      // 提交答案
      submitAnswer: (answer) => set((state) => ({
        answers: [...state.answers, answer]
      })),

      // 重置状态
      reset: () => set({
        problems: [],
        currentIndex: 0,
        answers: [],
        sessionId: null
      }),

      // 设置会话ID
      setSessionId: (id) => set({ sessionId: id })
    }),
    { name: 'practice-store' }
  )
);
```

### 用户设置 Store
```typescript
// src/stores/settingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty, Grade, OperationType } from '@exams/shared';

interface SettingsState {
  // 用户偏好
  grade: Grade;
  difficulty: Difficulty;
  problemTypes: OperationType[];
  problemCount: number;
  showHints: boolean;
  showTimer: boolean;
  autoNext: boolean;
  
  // 动作
  updateGrade: (grade: Grade) => void;
  updateDifficulty: (difficulty: Difficulty) => void;
  updateProblemTypes: (types: OperationType[]) => void;
  updateProblemCount: (count: number) => void;
  toggleHints: () => void;
  toggleTimer: () => void;
  toggleAutoNext: () => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  grade: 2 as Grade,
  difficulty: 'easy' as Difficulty,
  problemTypes: ['addition', 'subtraction'] as OperationType[],
  problemCount: 10,
  showHints: true,
  showTimer: false,
  autoNext: false
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateGrade: (grade) => set({ grade }),
      updateDifficulty: (difficulty) => set({ difficulty }),
      updateProblemTypes: (problemTypes) => set({ problemTypes }),
      updateProblemCount: (problemCount) => set({ problemCount }),
      toggleHints: () => set((state) => ({ showHints: !state.showHints })),
      toggleTimer: () => set((state) => ({ showTimer: !state.showTimer })),
      toggleAutoNext: () => set((state) => ({ autoNext: !state.autoNext })),
      resetToDefaults: () => set(defaultSettings)
    }),
    {
      name: 'user-settings',
      version: 1
    }
  )
);
```

## 🎣 自定义 Hooks

### useProblemGenerator Hook
```typescript
// src/hooks/useProblemGenerator.ts
import { useState, useCallback } from 'react';
import type { Problem, GeneratorConfig } from '@exams/shared';

interface UseProblemGeneratorReturn {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  generateProblems: (config: GeneratorConfig) => Promise<void>;
  clearProblems: () => void;
}

export function useProblemGenerator(): UseProblemGeneratorReturn {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProblems = useCallback(async (config: GeneratorConfig) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/problems/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate problems');
      }

      setProblems(data.problems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Problem generation failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProblems = useCallback(() => {
    setProblems([]);
    setError(null);
  }, []);

  return {
    problems,
    loading,
    error,
    generateProblems,
    clearProblems
  };
}
```

### useLocalStorage Hook
```typescript
// src/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 获取初始值
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 设置值的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

## 🎨 样式系统

### Tailwind 配置
```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### CSS 变量
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer components {
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }
  
  .animate-bounce-in {
    animation: bounceIn 0.6s ease-out;
  }
}
```

## 🚀 性能优化

### 代码分割
```typescript
// 动态导入组件
import dynamic from 'next/dynamic';

const PracticeSession = dynamic(
  () => import('@/components/features/PracticeSession'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false
  }
);

const StatisticsChart = dynamic(
  () => import('@/components/features/StatisticsChart'),
  {
    loading: () => <div>Loading chart...</div>
  }
);
```

### 图片优化
```typescript
// 使用 Next.js Image 组件
import Image from 'next/image';

export function UserAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="rounded-full"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### 缓存策略
```typescript
// SWR 数据获取
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useUserStats(userId: string) {
  const { data, error, mutate } = useSWR(
    userId ? `/api/users/${userId}/stats` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // 30秒刷新一次
    }
  );

  return {
    stats: data,
    loading: !error && !data,
    error,
    refresh: mutate
  };
}
```

## 🧪 测试

### 组件测试示例
```typescript
// src/components/__tests__/ProblemCard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProblemCard } from '../features/ProblemCard';

const mockProblem = {
  id: '1',
  type: 'addition' as const,
  operand1: 5,
  operand2: 3,
  answer: 8,
  question: '5 + 3 = ?',
  difficulty: 'easy' as const,
  grade: 1
};

describe('ProblemCard', () => {
  test('renders problem question', () => {
    render(<ProblemCard problem={mockProblem} onAnswer={jest.fn()} />);
    expect(screen.getByText('5 + 3 = ?')).toBeInTheDocument();
  });

  test('submits correct answer', async () => {
    const user = userEvent.setup();
    const mockOnAnswer = jest.fn();
    
    render(<ProblemCard problem={mockProblem} onAnswer={mockOnAnswer} />);
    
    const input = screen.getByPlaceholderText('请输入答案');
    const submitButton = screen.getByText('提交答案');
    
    await user.type(input, '8');
    await user.click(submitButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith({
      problemId: '1',
      userAnswer: 8,
      isCorrect: true,
      timeSpent: expect.any(Number)
    });
  });
});
```

## 📱 响应式设计

### 断点系统
```css
/* Tailwind 断点 */
sm: 640px   /* 小屏幕 */
md: 768px   /* 中等屏幕 */
lg: 1024px  /* 大屏幕 */
xl: 1280px  /* 超大屏幕 */
2xl: 1536px /* 超超大屏幕 */
```

### 响应式组件示例
```typescript
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {children}
      </div>
    </div>
  );
}
```

## 🔧 开发工具

### VS Code 配置
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 调试配置
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "pwa-chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

## 📦 构建和部署

### 构建配置
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 部署脚本
```bash
#!/bin/bash
# scripts/deploy-web.sh

echo "Building web application..."
npm run build

echo "Running tests..."
npm run test:ci

echo "Deploying to Vercel..."
vercel --prod

echo "Deployment completed!"
```

这个 Web 包提供了完整的前端解决方案，具有现代化的架构、优秀的用户体验和良好的可维护性。