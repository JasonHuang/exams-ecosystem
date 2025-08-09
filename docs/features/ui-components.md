# UI 组件设计文档

本文档详细描述了小学数学练习生成器生态系统中的 UI 组件设计规范、组件库架构和最佳实践。

## 🎨 设计系统概述

### 设计原则
- **一致性**: 统一的视觉语言和交互模式
- **可访问性**: 符合 WCAG 2.1 AA 标准
- **响应式**: 适配各种屏幕尺寸和设备
- **可用性**: 直观易用的用户界面
- **可维护性**: 模块化和可复用的组件设计

### 设计语言
- **色彩**: 温暖友好的教育主题色彩
- **字体**: 清晰易读的字体系统
- **间距**: 8px 基础网格系统
- **圆角**: 统一的圆角规范
- **阴影**: 层次分明的阴影系统

## 🎯 色彩系统

### 主色调
```css
:root {
  /* 主色 - 蓝色系 */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;  /* 主色 */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* 辅助色 - 绿色系（成功） */
  --success-50: #f0fdf4;
  --success-100: #dcfce7;
  --success-200: #bbf7d0;
  --success-300: #86efac;
  --success-400: #4ade80;
  --success-500: #22c55e;  /* 成功色 */
  --success-600: #16a34a;
  --success-700: #15803d;
  --success-800: #166534;
  --success-900: #14532d;

  /* 警告色 - 橙色系 */
  --warning-50: #fffbeb;
  --warning-100: #fef3c7;
  --warning-200: #fde68a;
  --warning-300: #fcd34d;
  --warning-400: #fbbf24;
  --warning-500: #f59e0b;  /* 警告色 */
  --warning-600: #d97706;
  --warning-700: #b45309;
  --warning-800: #92400e;
  --warning-900: #78350f;

  /* 错误色 - 红色系 */
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-200: #fecaca;
  --error-300: #fca5a5;
  --error-400: #f87171;
  --error-500: #ef4444;  /* 错误色 */
  --error-600: #dc2626;
  --error-700: #b91c1c;
  --error-800: #991b1b;
  --error-900: #7f1d1d;

  /* 中性色 - 灰色系 */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

### 语义化颜色
```css
:root {
  /* 文本颜色 */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-tertiary: var(--gray-400);
  --text-inverse: #ffffff;

  /* 背景颜色 */
  --bg-primary: #ffffff;
  --bg-secondary: var(--gray-50);
  --bg-tertiary: var(--gray-100);

  /* 边框颜色 */
  --border-primary: var(--gray-200);
  --border-secondary: var(--gray-300);
  --border-focus: var(--primary-500);

  /* 状态颜色 */
  --status-correct: var(--success-500);
  --status-incorrect: var(--error-500);
  --status-pending: var(--warning-500);
  --status-neutral: var(--gray-400);
}
```

## 📝 字体系统

### 字体族
```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-mono: 'Fira Code', 'Monaco', 'Cascadia Code', 'Segoe UI Mono', 'Roboto Mono', 'Oxygen Mono', 'Ubuntu Monospace', 'Source Code Pro', 'Fira Mono', 'Droid Sans Mono', 'Courier New', monospace;
  --font-math: 'KaTeX_Math', 'Times New Roman', serif;
}
```

### 字体大小
```css
:root {
  /* 字体大小 */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* 行高 */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* 字重 */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## 📏 间距系统

### 基础间距
```css
:root {
  /* 8px 基础网格 */
  --space-0: 0;
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
  --space-24: 6rem;    /* 96px */
}
```

### 组件间距
```css
:root {
  /* 组件内部间距 */
  --padding-xs: var(--space-2);
  --padding-sm: var(--space-3);
  --padding-md: var(--space-4);
  --padding-lg: var(--space-6);
  --padding-xl: var(--space-8);

  /* 组件外部间距 */
  --margin-xs: var(--space-2);
  --margin-sm: var(--space-4);
  --margin-md: var(--space-6);
  --margin-lg: var(--space-8);
  --margin-xl: var(--space-12);
}
```

## 🔘 基础组件

### Button 按钮组件

#### 设计规范
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### 实现示例
```tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
  ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500'
};

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const classes = cn(
    baseClasses,
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth && 'w-full',
    loading && 'cursor-wait'
  );

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};
```

### Input 输入框组件

#### 设计规范
```typescript
interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'flushed';
  state?: 'default' | 'error' | 'success';
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}
```

#### 实现示例
```tsx
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

const inputSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-4 py-3 text-lg'
};

const inputVariants = {
  default: 'border border-gray-300 bg-white',
  filled: 'border-0 bg-gray-100',
  flushed: 'border-0 border-b border-gray-300 bg-transparent rounded-none'
};

const inputStates = {
  default: 'focus:border-primary-500 focus:ring-primary-500',
  error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
  success: 'border-success-500 focus:border-success-500 focus:ring-success-500'
};

export const Input: React.FC<InputProps> = ({
  type = 'text',
  size = 'md',
  variant = 'default',
  state = 'default',
  placeholder,
  value,
  disabled = false,
  readOnly = false,
  required = false,
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  onChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const baseClasses = 'w-full rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const inputClasses = cn(
    baseClasses,
    inputSizes[size],
    inputVariants[variant],
    inputStates[state],
    leftIcon && 'pl-10',
    rightIcon && 'pr-10'
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleFocus = () => {
    setFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    setFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const showError = state === 'error' && errorMessage;
  const showHelper = helperText && !showError;
  const showSuccess = state === 'success';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{leftIcon}</span>
          </div>
        )}
        
        <input
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && !showError && !showSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{rightIcon}</span>
          </div>
        )}
        
        {showError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="w-5 h-5 text-error-500" />
          </div>
        )}
        
        {showSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircle className="w-5 h-5 text-success-500" />
          </div>
        )}
      </div>
      
      {showError && (
        <p className="mt-1 text-sm text-error-600">{errorMessage}</p>
      )}
      
      {showHelper && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
```

### Card 卡片组件

#### 设计规范
```typescript
interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

#### 实现示例
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

const cardVariants = {
  default: 'bg-white',
  outlined: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-md'
};

const cardPadding = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const cardRounded = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl'
};

const cardShadow = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl'
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  shadow = 'none',
  hover = false,
  clickable = false,
  children,
  onClick,
  ...props
}) => {
  const classes = cn(
    'transition-all duration-200',
    cardVariants[variant],
    cardPadding[padding],
    cardRounded[rounded],
    cardShadow[shadow],
    hover && 'hover:shadow-lg hover:-translate-y-1',
    clickable && 'cursor-pointer',
    clickable && 'hover:shadow-md'
  );

  const Component = clickable ? 'button' : 'div';

  return (
    <Component
      className={classes}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};
```

## 🎯 业务组件

### ProblemCard 题目卡片

#### 设计规范
```typescript
interface ProblemCardProps {
  problem: Problem;
  userAnswer?: number;
  showResult?: boolean;
  isCorrect?: boolean;
  showHint?: boolean;
  disabled?: boolean;
  onAnswerChange?: (answer: string) => void;
  onSubmit?: (answer: number) => void;
  onShowHint?: () => void;
  onSkip?: () => void;
}
```

#### 实现示例
```tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { Lightbulb, SkipForward, CheckCircle, XCircle } from 'lucide-react';
import type { Problem } from '@exams/shared';

export const ProblemCard: React.FC<ProblemCardProps> = ({
  problem,
  userAnswer,
  showResult = false,
  isCorrect = false,
  showHint = false,
  disabled = false,
  onAnswerChange,
  onSubmit,
  onShowHint,
  onSkip
}) => {
  const [answer, setAnswer] = useState(userAnswer?.toString() || '');

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    if (onAnswerChange) {
      onAnswerChange(value);
    }
  };

  const handleSubmit = () => {
    const numAnswer = parseInt(answer);
    if (!isNaN(numAnswer) && onSubmit) {
      onSubmit(numAnswer);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled && answer.trim()) {
      handleSubmit();
    }
  };

  return (
    <Card
      variant="outlined"
      padding="lg"
      className={cn(
        'max-w-md mx-auto transition-all duration-300',
        showResult && isCorrect && 'border-success-300 bg-success-50',
        showResult && !isCorrect && 'border-error-300 bg-error-50'
      )}
    >
      {/* 题目显示 */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {problem.question}
        </div>
        
        {problem.description && (
          <p className="text-gray-600 text-sm">
            {problem.description}
          </p>
        )}
      </div>

      {/* 提示信息 */}
      {showHint && problem.hint && (
        <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-warning-800 text-sm">{problem.hint}</p>
          </div>
        </div>
      )}

      {/* 答案输入 */}
      {!showResult && (
        <div className="mb-6">
          <Input
            type="number"
            size="lg"
            placeholder="输入答案"
            value={answer}
            disabled={disabled}
            onChange={handleAnswerChange}
            onKeyPress={handleKeyPress}
            className="text-center text-xl font-semibold"
          />
        </div>
      )}

      {/* 结果显示 */}
      {showResult && (
        <div className="mb-6 text-center">
          <div className={cn(
            'inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold',
            isCorrect ? 'bg-success-100 text-success-800' : 'bg-error-100 text-error-800'
          )}>
            {isCorrect ? (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                正确！
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 mr-2" />
                错误
              </>
            )}
          </div>
          
          {!isCorrect && (
            <p className="mt-2 text-gray-600">
              正确答案是: <span className="font-semibold text-gray-900">{problem.answer}</span>
            </p>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      {!showResult && (
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={disabled || !answer.trim()}
            onClick={handleSubmit}
          >
            提交答案
          </Button>
          
          {onShowHint && !showHint && (
            <Button
              variant="outline"
              size="lg"
              icon={<Lightbulb className="w-4 h-4" />}
              onClick={onShowHint}
            >
              提示
            </Button>
          )}
          
          {onSkip && (
            <Button
              variant="ghost"
              size="lg"
              icon={<SkipForward className="w-4 h-4" />}
              onClick={onSkip}
            >
              跳过
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
```

### ProgressBar 进度条

#### 设计规范
```typescript
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  showPercentage?: boolean;
  animated?: boolean;
  striped?: boolean;
  label?: string;
}
```

#### 实现示例
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

const progressSizes = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const progressVariants = {
  default: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500'
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showPercentage = false,
  animated = false,
  striped = false,
  label
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        progressSizes[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            progressVariants[variant],
            animated && 'animate-pulse',
            striped && 'bg-gradient-to-r from-transparent via-white to-transparent bg-[length:20px_20px] animate-[progress-stripes_1s_linear_infinite]'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
```

### Modal 模态框

#### 设计规范
```typescript
interface ModalProps {
  open: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  title?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
}
```

#### 实现示例
```tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

export const Modal: React.FC<ModalProps> = ({
  open,
  size = 'md',
  centered = true,
  closable = true,
  maskClosable = true,
  title,
  footer,
  children,
  onClose
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable && onClose) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, closable, onClose]);

  if (!open) return null;

  const handleMaskClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && maskClosable && onClose) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        centered ? 'items-center' : 'items-start pt-16'
      )}
      onClick={handleMaskClick}
    >
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* 模态框内容 */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-xl w-full transform transition-all',
          modalSizes[size]
        )}
      >
        {/* 头部 */}
        {(title || closable) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                icon={<X className="w-4 h-4" />}
                onClick={onClose}
                className="ml-auto"
              />
            )}
          </div>
        )}
        
        {/* 内容 */}
        <div className="p-6">
          {children}
        </div>
        
        {/* 底部 */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
```

## 📱 响应式设计

### 断点系统
```css
:root {
  /* 断点定义 */
  --breakpoint-sm: 640px;   /* 小屏幕 */
  --breakpoint-md: 768px;   /* 中等屏幕 */
  --breakpoint-lg: 1024px;  /* 大屏幕 */
  --breakpoint-xl: 1280px;  /* 超大屏幕 */
  --breakpoint-2xl: 1536px; /* 超超大屏幕 */
}

/* 媒体查询 */
@media (min-width: 640px) {
  .sm\:block { display: block; }
  .sm\:hidden { display: none; }
  /* ... 更多响应式类 */
}

@media (min-width: 768px) {
  .md\:block { display: block; }
  .md\:hidden { display: none; }
  /* ... 更多响应式类 */
}

@media (min-width: 1024px) {
  .lg\:block { display: block; }
  .lg\:hidden { display: none; }
  /* ... 更多响应式类 */
}
```

### 响应式组件示例
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4
}) => {
  const gridClasses = cn(
    'grid',
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};
```

## ♿ 可访问性

### ARIA 属性
```tsx
// 按钮可访问性
<button
  aria-label="提交答案"
  aria-describedby="answer-help"
  aria-pressed={isPressed}
  disabled={disabled}
>
  提交
</button>

// 输入框可访问性
<input
  aria-label="数学题答案"
  aria-describedby="answer-error"
  aria-invalid={hasError}
  aria-required={required}
/>

// 进度条可访问性
<div
  role="progressbar"
  aria-valuenow={current}
  aria-valuemin={0}
  aria-valuemax={total}
  aria-label="练习进度"
/>
```

### 键盘导航
```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      onClick();
      break;
    case 'Escape':
      onClose();
      break;
    case 'Tab':
      // 处理焦点管理
      break;
  }
};
```

### 颜色对比度
```css
/* 确保足够的颜色对比度 */
.text-primary {
  color: #111827; /* 对比度 > 7:1 */
}

.text-secondary {
  color: #4b5563; /* 对比度 > 4.5:1 */
}

.bg-primary {
  background-color: #3b82f6;
  color: #ffffff; /* 对比度 > 4.5:1 */
}
```

## 🎨 动画系统

### 基础动画
```css
/* 淡入淡出 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* 滑动动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放动画 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 弹跳动画 */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}
```

### 动画组件
```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'slideInUp' | 'slideInDown' | 'scaleIn' | 'bounce';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  className?: string;
}

const animationClasses = {
  fadeIn: 'animate-fadeIn',
  slideInUp: 'animate-slideInUp',
  slideInDown: 'animate-slideInDown',
  scaleIn: 'animate-scaleIn',
  bounce: 'animate-bounce'
};

const durationClasses = {
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500'
};

export const Animated: React.FC<AnimatedProps> = ({
  children,
  animation = 'fadeIn',
  duration = 'normal',
  delay = 0,
  className
}) => {
  return (
    <div
      className={cn(
        animationClasses[animation],
        durationClasses[duration],
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
```

## 🔧 工具函数

### 样式工具
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 生成响应式类名
 */
export function responsive(
  base: string,
  breakpoints: Record<string, string>
): string {
  const classes = [base];
  
  Object.entries(breakpoints).forEach(([breakpoint, value]) => {
    classes.push(`${breakpoint}:${value}`);
  });
  
  return classes.join(' ');
}

/**
 * 条件类名
 */
export function conditional(
  condition: boolean,
  trueClass: string,
  falseClass?: string
): string {
  return condition ? trueClass : (falseClass || '');
}
```

### 主题工具
```typescript
interface Theme {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
}

/**
 * 主题上下文
 */
export const ThemeContext = React.createContext<Theme | null>(null);

/**
 * 使用主题
 */
export function useTheme(): Theme {
  const theme = React.useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}

/**
 * 主题提供者
 */
export const ThemeProvider: React.FC<{
  theme: Theme;
  children: React.ReactNode;
}> = ({ theme, children }) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## 📚 最佳实践

### 组件设计原则
1. **单一职责**: 每个组件只负责一个功能
2. **可复用性**: 设计通用的、可配置的组件
3. **可组合性**: 组件可以灵活组合使用
4. **一致性**: 保持 API 和视觉的一致性
5. **可访问性**: 确保所有用户都能使用

### 性能优化
1. **懒加载**: 使用 React.lazy 和 Suspense
2. **记忆化**: 使用 React.memo 和 useMemo
3. **虚拟化**: 对长列表使用虚拟滚动
4. **代码分割**: 按需加载组件
5. **图片优化**: 使用 WebP 格式和响应式图片

### 测试策略
1. **单元测试**: 测试组件的基本功能
2. **集成测试**: 测试组件间的交互
3. **视觉回归测试**: 确保 UI 的一致性
4. **可访问性测试**: 验证无障碍功能
5. **性能测试**: 监控组件性能

这个 UI 组件设计文档提供了完整的设计系统和组件库实现指南，确保整个项目具有一致的用户体验和高质量的代码实现。