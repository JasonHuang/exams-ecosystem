# @exams/miniprogram 包文档

`@exams/miniprogram` 是小学数学练习生成器生态系统的微信小程序端，基于微信小程序原生框架构建，提供移动端的数学练习体验。

## 📋 概述

### 主要功能
- 🎯 **移动练习**: 适配移动端的数学题目练习
- 📱 **原生体验**: 基于微信小程序的流畅交互
- 🔄 **离线支持**: 支持离线练习和数据同步
- 👤 **微信登录**: 集成微信授权登录
- 📊 **进度同步**: 与 Web 端数据同步
- 🎨 **小程序 UI**: 符合小程序设计规范的界面

### 技术栈
- **框架**: 微信小程序原生框架
- **语言**: TypeScript + WXML + WXSS
- **状态管理**: MobX
- **UI 组件**: WeUI + 自定义组件
- **网络请求**: wx.request + 封装
- **存储**: wx.storage + 云存储
- **云服务**: 微信云开发（可选）

## 🏗️ 项目结构

```
packages/miniprogram/
├── miniprogram/                # 小程序源码
│   ├── pages/                 # 页面目录
│   │   ├── index/            # 首页
│   │   │   ├── index.ts
│   │   │   ├── index.wxml
│   │   │   ├── index.wxss
│   │   │   └── index.json
│   │   ├── practice/         # 练习页面
│   │   ├── profile/          # 个人中心
│   │   ├── settings/         # 设置页面
│   │   └── auth/             # 授权页面
│   ├── components/           # 自定义组件
│   │   ├── problem-card/     # 题目卡片组件
│   │   ├── progress-bar/     # 进度条组件
│   │   ├── result-modal/     # 结果弹窗组件
│   │   └── loading/          # 加载组件
│   ├── utils/                # 工具函数
│   │   ├── request.ts        # 网络请求封装
│   │   ├── storage.ts        # 存储封装
│   │   ├── auth.ts           # 认证工具
│   │   └── common.ts         # 通用工具
│   ├── stores/               # 状态管理
│   │   ├── user.store.ts     # 用户状态
│   │   ├── practice.store.ts # 练习状态
│   │   └── settings.store.ts # 设置状态
│   ├── services/             # 业务服务
│   │   ├── api.service.ts    # API 服务
│   │   ├── auth.service.ts   # 认证服务
│   │   └── sync.service.ts   # 同步服务
│   ├── types/                # 类型定义
│   │   ├── api.types.ts
│   │   ├── page.types.ts
│   │   └── component.types.ts
│   ├── styles/               # 全局样式
│   │   ├── common.wxss
│   │   └── theme.wxss
│   ├── app.ts                # 应用入口
│   ├── app.wxss              # 全局样式
│   └── app.json              # 应用配置
├── cloudfunctions/           # 云函数（可选）
│   ├── login/
│   ├── sync/
│   └── generate/
├── project.config.json       # 项目配置
├── sitemap.json             # 站点地图
├── package.json             # 包配置
└── tsconfig.json            # TypeScript 配置
```

## 📱 应用配置

### 应用配置 (`miniprogram/app.json`)
```json
{
  "pages": [
    "pages/index/index",
    "pages/practice/practice",
    "pages/profile/profile",
    "pages/settings/settings",
    "pages/auth/auth",
    "pages/result/result",
    "pages/history/history"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#4F46E5",
    "navigationBarTitleText": "数学练习",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#F8FAFC",
    "enablePullDownRefresh": true
  },
  "tabBar": {
    "color": "#6B7280",
    "selectedColor": "#4F46E5",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "assets/icons/home.png",
        "selectedIconPath": "assets/icons/home-active.png"
      },
      {
        "pagePath": "pages/practice/practice",
        "text": "练习",
        "iconPath": "assets/icons/practice.png",
        "selectedIconPath": "assets/icons/practice-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "assets/icons/profile.png",
        "selectedIconPath": "assets/icons/profile-active.png"
      }
    ]
  },
  "permission": {
    "scope.userInfo": {
      "desc": "用于完善用户资料"
    }
  },
  "requiredBackgroundModes": ["audio"],
  "networkTimeout": {
    "request": 10000,
    "downloadFile": 10000
  },
  "debug": false
}
```

### 应用入口 (`miniprogram/app.ts`)
```typescript
import { configure } from 'mobx';
import { userStore } from './stores/user.store';
import { practiceStore } from './stores/practice.store';
import { settingsStore } from './stores/settings.store';
import { AuthService } from './services/auth.service';
import { SyncService } from './services/sync.service';

// 配置 MobX
configure({
  enforceActions: 'never',
  computedRequiresReaction: false,
  reactionRequiresObservable: false,
  observableRequiresReaction: false,
  disableErrorBoundaries: true
});

interface AppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo;
    systemInfo?: WechatMiniprogram.SystemInfo;
    stores: {
      userStore: typeof userStore;
      practiceStore: typeof practiceStore;
      settingsStore: typeof settingsStore;
    };
    services: {
      authService: AuthService;
      syncService: SyncService;
    };
  };
}

App<AppOption>({
  globalData: {
    stores: {
      userStore,
      practiceStore,
      settingsStore
    },
    services: {
      authService: new AuthService(),
      syncService: new SyncService()
    }
  },

  onLaunch() {
    console.log('小程序启动');
    
    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        console.log('系统信息:', res);
      }
    });

    // 检查更新
    this.checkForUpdate();
    
    // 初始化用户状态
    this.initUserState();
    
    // 加载设置
    settingsStore.loadSettings();
  },

  onShow() {
    console.log('小程序显示');
    
    // 同步数据
    if (userStore.isLoggedIn) {
      this.globalData.services.syncService.syncUserData();
    }
  },

  onHide() {
    console.log('小程序隐藏');
    
    // 保存本地数据
    practiceStore.saveLocalData();
    settingsStore.saveSettings();
  },

  onError(error: string) {
    console.error('小程序错误:', error);
    
    // 错误上报
    wx.reportAnalytics('miniprogram_error', {
      error: error,
      timestamp: Date.now()
    });
  },

  /**
   * 检查小程序更新
   */
  checkForUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本');
        }
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.error('新版本下载失败');
      });
    }
  },

  /**
   * 初始化用户状态
   */
  async initUserState() {
    try {
      // 检查本地登录状态
      const token = wx.getStorageSync('token');
      if (token) {
        // 验证 token 有效性
        const isValid = await this.globalData.services.authService.validateToken(token);
        if (isValid) {
          await userStore.loadUserInfo();
        } else {
          // token 无效，清除本地数据
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
        }
      }
    } catch (error) {
      console.error('初始化用户状态失败:', error);
    }
  }
});
```

## 🎯 页面实现

### 首页 (`miniprogram/pages/index/index.ts`)
```typescript
import { userStore } from '../../stores/user.store';
import { practiceStore } from '../../stores/practice.store';
import { settingsStore } from '../../stores/settings.store';

interface IndexPageData {
  userInfo: any;
  isLoggedIn: boolean;
  recentSessions: any[];
  todayStats: {
    problemsCompleted: number;
    accuracy: number;
    timeSpent: number;
  };
  quickStartOptions: Array<{
    title: string;
    description: string;
    config: any;
    icon: string;
  }>;
}

Page<IndexPageData>({
  data: {
    userInfo: null,
    isLoggedIn: false,
    recentSessions: [],
    todayStats: {
      problemsCompleted: 0,
      accuracy: 0,
      timeSpent: 0
    },
    quickStartOptions: [
      {
        title: '加法练习',
        description: '1-2年级加法运算',
        config: {
          types: ['addition'],
          difficulty: 'easy',
          count: 10
        },
        icon: '➕'
      },
      {
        title: '减法练习',
        description: '1-2年级减法运算',
        config: {
          types: ['subtraction'],
          difficulty: 'easy',
          count: 10
        },
        icon: '➖'
      },
      {
        title: '混合练习',
        description: '加减法混合练习',
        config: {
          types: ['addition', 'subtraction'],
          difficulty: 'medium',
          count: 15
        },
        icon: '🔄'
      }
    ]
  },

  onLoad() {
    console.log('首页加载');
    this.initPage();
  },

  onShow() {
    console.log('首页显示');
    this.updatePageData();
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 初始化页面
   */
  initPage() {
    this.updatePageData();
    this.loadRecentSessions();
    this.loadTodayStats();
  },

  /**
   * 更新页面数据
   */
  updatePageData() {
    this.setData({
      userInfo: userStore.userInfo,
      isLoggedIn: userStore.isLoggedIn
    });
  },

  /**
   * 加载最近练习记录
   */
  async loadRecentSessions() {
    try {
      const sessions = await practiceStore.getRecentSessions(5);
      this.setData({
        recentSessions: sessions
      });
    } catch (error) {
      console.error('加载最近练习记录失败:', error);
    }
  },

  /**
   * 加载今日统计
   */
  async loadTodayStats() {
    try {
      const stats = await practiceStore.getTodayStats();
      this.setData({
        todayStats: stats
      });
    } catch (error) {
      console.error('加载今日统计失败:', error);
    }
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    try {
      await Promise.all([
        this.loadRecentSessions(),
        this.loadTodayStats()
      ]);
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      console.error('刷新数据失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'error',
        duration: 1500
      });
    }
  },

  /**
   * 快速开始练习
   */
  onQuickStart(event: WechatMiniprogram.BaseEvent) {
    const { config } = event.currentTarget.dataset;
    
    if (!userStore.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }

    // 合并用户设置
    const finalConfig = {
      ...config,
      grade: settingsStore.preferredGrade,
      showHints: settingsStore.showHints
    };

    wx.navigateTo({
      url: `/pages/practice/practice?config=${encodeURIComponent(JSON.stringify(finalConfig))}`
    });
  },

  /**
   * 继续上次练习
   */
  onContinuePractice() {
    const lastSession = practiceStore.getLastUnfinishedSession();
    
    if (lastSession) {
      wx.navigateTo({
        url: `/pages/practice/practice?sessionId=${lastSession.id}`
      });
    } else {
      wx.showToast({
        title: '没有未完成的练习',
        icon: 'none'
      });
    }
  },

  /**
   * 查看练习历史
   */
  onViewHistory() {
    if (!userStore.isLoggedIn) {
      this.showLoginPrompt();
      return;
    }

    wx.navigateTo({
      url: '/pages/history/history'
    });
  },

  /**
   * 前往设置页面
   */
  onGoToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  /**
   * 显示登录提示
   */
  showLoginPrompt() {
    wx.showModal({
      title: '登录提示',
      content: '请先登录以使用完整功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/auth/auth'
          });
        }
      }
    });
  },

  /**
   * 分享小程序
   */
  onShareAppMessage() {
    return {
      title: '小学数学练习 - 让学习更有趣',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-cover.png'
    };
  }
});
```

### 练习页面 (`miniprogram/pages/practice/practice.ts`)
```typescript
import { practiceStore } from '../../stores/practice.store';
import { userStore } from '../../stores/user.store';
import type { Problem, Answer, GeneratorConfig } from '@exams/shared';

interface PracticePageData {
  problems: Problem[];
  currentIndex: number;
  currentProblem: Problem | null;
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  sessionStats: {
    total: number;
    completed: number;
    correct: number;
    accuracy: number;
    timeSpent: number;
  };
  config: GeneratorConfig | null;
  loading: boolean;
  showHint: boolean;
  timeLeft: number;
  timerEnabled: boolean;
}

Page<PracticePageData>({
  data: {
    problems: [],
    currentIndex: 0,
    currentProblem: null,
    userAnswer: '',
    showResult: false,
    isCorrect: false,
    sessionStats: {
      total: 0,
      completed: 0,
      correct: 0,
      accuracy: 0,
      timeSpent: 0
    },
    config: null,
    loading: true,
    showHint: false,
    timeLeft: 0,
    timerEnabled: false
  },

  // 页面私有数据
  private: {
    sessionId: '',
    startTime: 0,
    problemStartTime: 0,
    timer: null as NodeJS.Timeout | null,
    answers: [] as Answer[]
  },

  onLoad(options) {
    console.log('练习页面加载', options);
    
    if (options.config) {
      // 新练习
      const config = JSON.parse(decodeURIComponent(options.config));
      this.startNewPractice(config);
    } else if (options.sessionId) {
      // 继续练习
      this.continuePractice(options.sessionId);
    } else {
      // 无效参数
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onUnload() {
    // 清理定时器
    if (this.private.timer) {
      clearInterval(this.private.timer);
    }
    
    // 保存进度
    this.saveProgress();
  },

  /**
   * 开始新练习
   */
  async startNewPractice(config: GeneratorConfig) {
    try {
      this.setData({ loading: true, config });
      
      // 生成题目
      const problems = await practiceStore.generateProblems(config);
      
      // 创建练习会话
      const sessionId = await practiceStore.createSession(config, problems);
      
      this.private.sessionId = sessionId;
      this.private.startTime = Date.now();
      this.private.answers = [];
      
      this.setData({
        problems,
        currentIndex: 0,
        currentProblem: problems[0],
        sessionStats: {
          total: problems.length,
          completed: 0,
          correct: 0,
          accuracy: 0,
          timeSpent: 0
        },
        loading: false,
        timerEnabled: config.timeLimit > 0
      });
      
      this.startProblemTimer();
      
      if (config.timeLimit > 0) {
        this.startSessionTimer(config.timeLimit);
      }
      
    } catch (error) {
      console.error('开始练习失败:', error);
      wx.showToast({
        title: '生成题目失败',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 继续练习
   */
  async continuePractice(sessionId: string) {
    try {
      this.setData({ loading: true });
      
      const session = await practiceStore.getSession(sessionId);
      
      if (!session) {
        throw new Error('练习会话不存在');
      }
      
      this.private.sessionId = sessionId;
      this.private.startTime = session.startTime;
      this.private.answers = session.answers || [];
      
      const currentIndex = this.private.answers.length;
      
      this.setData({
        problems: session.problems,
        currentIndex,
        currentProblem: session.problems[currentIndex],
        config: session.config,
        sessionStats: this.calculateStats(session.problems, this.private.answers),
        loading: false
      });
      
      this.startProblemTimer();
      
    } catch (error) {
      console.error('继续练习失败:', error);
      wx.showToast({
        title: '加载练习失败',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 输入答案
   */
  onAnswerInput(event: WechatMiniprogram.Input) {
    this.setData({
      userAnswer: event.detail.value
    });
  },

  /**
   * 提交答案
   */
  onSubmitAnswer() {
    const { userAnswer, currentProblem } = this.data;
    
    if (!userAnswer.trim() || !currentProblem) {
      wx.showToast({
        title: '请输入答案',
        icon: 'none'
      });
      return;
    }

    const answer = parseInt(userAnswer);
    if (isNaN(answer)) {
      wx.showToast({
        title: '请输入有效数字',
        icon: 'none'
      });
      return;
    }

    const isCorrect = answer === currentProblem.answer;
    const timeSpent = Date.now() - this.private.problemStartTime;

    const answerData: Answer = {
      problemId: currentProblem.id,
      userAnswer: answer,
      isCorrect,
      timeSpent,
      hintsUsed: this.data.showHint ? 1 : 0
    };

    this.private.answers.push(answerData);

    // 显示结果
    this.setData({
      showResult: true,
      isCorrect
    });

    // 播放音效
    if (isCorrect) {
      wx.playBackgroundAudio({
        dataUrl: '/assets/audio/correct.mp3'
      });
    } else {
      wx.playBackgroundAudio({
        dataUrl: '/assets/audio/incorrect.mp3'
      });
    }

    // 更新统计
    this.updateStats();

    // 自动进入下一题或结束
    setTimeout(() => {
      this.nextProblem();
    }, 2000);
  },

  /**
   * 下一题
   */
  nextProblem() {
    const { currentIndex, problems } = this.data;
    
    if (currentIndex < problems.length - 1) {
      // 还有题目
      const nextIndex = currentIndex + 1;
      this.setData({
        currentIndex: nextIndex,
        currentProblem: problems[nextIndex],
        userAnswer: '',
        showResult: false,
        showHint: false
      });
      
      this.startProblemTimer();
    } else {
      // 练习完成
      this.completePractice();
    }
  },

  /**
   * 显示提示
   */
  onShowHint() {
    this.setData({
      showHint: true
    });
  },

  /**
   * 跳过题目
   */
  onSkipProblem() {
    wx.showModal({
      title: '确认跳过',
      content: '确定要跳过这道题吗？',
      success: (res) => {
        if (res.confirm) {
          const { currentProblem } = this.data;
          
          const answerData: Answer = {
            problemId: currentProblem!.id,
            userAnswer: 0,
            isCorrect: false,
            timeSpent: Date.now() - this.private.problemStartTime,
            skipped: true
          };

          this.private.answers.push(answerData);
          this.updateStats();
          this.nextProblem();
        }
      }
    });
  },

  /**
   * 暂停练习
   */
  onPausePractice() {
    wx.showModal({
      title: '暂停练习',
      content: '练习进度将会保存，下次可以继续',
      confirmText: '确定暂停',
      cancelText: '继续练习',
      success: (res) => {
        if (res.confirm) {
          this.saveProgress();
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 完成练习
   */
  async completePractice() {
    try {
      // 保存练习结果
      await practiceStore.completeSession(
        this.private.sessionId,
        this.private.answers
      );

      // 更新用户统计
      if (userStore.isLoggedIn) {
        await userStore.updateStatistics(this.private.answers);
      }

      // 跳转到结果页面
      const stats = this.calculateStats(this.data.problems, this.private.answers);
      
      wx.redirectTo({
        url: `/pages/result/result?stats=${encodeURIComponent(JSON.stringify(stats))}`
      });
      
    } catch (error) {
      console.error('完成练习失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * 开始题目计时
   */
  startProblemTimer() {
    this.private.problemStartTime = Date.now();
  },

  /**
   * 开始会话计时
   */
  startSessionTimer(timeLimit: number) {
    this.setData({
      timeLeft: timeLimit
    });

    this.private.timer = setInterval(() => {
      const timeLeft = this.data.timeLeft - 1;
      
      if (timeLeft <= 0) {
        // 时间到
        this.completePractice();
      } else {
        this.setData({ timeLeft });
      }
    }, 1000);
  },

  /**
   * 更新统计
   */
  updateStats() {
    const stats = this.calculateStats(this.data.problems, this.private.answers);
    this.setData({
      sessionStats: stats
    });
  },

  /**
   * 计算统计数据
   */
  calculateStats(problems: Problem[], answers: Answer[]) {
    const total = problems.length;
    const completed = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;
    const timeSpent = Date.now() - this.private.startTime;

    return {
      total,
      completed,
      correct,
      accuracy,
      timeSpent
    };
  },

  /**
   * 保存进度
   */
  async saveProgress() {
    try {
      await practiceStore.saveSessionProgress(
        this.private.sessionId,
        this.private.answers,
        this.data.currentIndex
      );
    } catch (error) {
      console.error('保存进度失败:', error);
    }
  }
});
```

## 🧩 自定义组件

### 题目卡片组件 (`miniprogram/components/problem-card/problem-card.ts`)
```typescript
import type { Problem } from '@exams/shared';

interface ProblemCardData {
  problem: Problem | null;
  userAnswer: string;
  showResult: boolean;
  isCorrect: boolean;
  showHint: boolean;
  disabled: boolean;
}

Component<ProblemCardData>({
  properties: {
    problem: {
      type: Object,
      value: null
    },
    showResult: {
      type: Boolean,
      value: false
    },
    isCorrect: {
      type: Boolean,
      value: false
    },
    showHint: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  data: {
    userAnswer: ''
  },

  methods: {
    /**
     * 输入答案
     */
    onAnswerInput(event: WechatMiniprogram.Input) {
      const value = event.detail.value;
      this.setData({
        userAnswer: value
      });
      
      // 触发父组件事件
      this.triggerEvent('answerchange', {
        value: value
      });
    },

    /**
     * 提交答案
     */
    onSubmitAnswer() {
      const { userAnswer } = this.data;
      
      if (!userAnswer.trim()) {
        wx.showToast({
          title: '请输入答案',
          icon: 'none'
        });
        return;
      }

      this.triggerEvent('submit', {
        answer: userAnswer
      });
    },

    /**
     * 显示提示
     */
    onShowHint() {
      this.triggerEvent('showhint');
    },

    /**
     * 跳过题目
     */
    onSkip() {
      wx.showModal({
        title: '确认跳过',
        content: '确定要跳过这道题吗？',
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('skip');
          }
        }
      });
    },

    /**
     * 清空输入
     */
    clearAnswer() {
      this.setData({
        userAnswer: ''
      });
    },

    /**
     * 重置组件状态
     */
    reset() {
      this.setData({
        userAnswer: '',
        showResult: false,
        isCorrect: false,
        showHint: false
      });
    }
  },

  observers: {
    'problem': function(newProblem: Problem) {
      if (newProblem) {
        // 新题目时重置状态
        this.reset();
      }
    }
  }
});
```

### 进度条组件 (`miniprogram/components/progress-bar/progress-bar.ts`)
```typescript
interface ProgressBarData {
  current: number;
  total: number;
  percentage: number;
  showText: boolean;
  color: string;
  backgroundColor: string;
}

Component<ProgressBarData>({
  properties: {
    current: {
      type: Number,
      value: 0
    },
    total: {
      type: Number,
      value: 100
    },
    showText: {
      type: Boolean,
      value: true
    },
    color: {
      type: String,
      value: '#4F46E5'
    },
    backgroundColor: {
      type: String,
      value: '#E5E7EB'
    }
  },

  data: {
    percentage: 0
  },

  observers: {
    'current, total': function(current: number, total: number) {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      this.setData({
        percentage: Math.min(100, Math.max(0, percentage))
      });
    }
  },

  methods: {
    /**
     * 设置进度
     */
    setProgress(current: number, total?: number) {
      const newTotal = total || this.data.total;
      const percentage = newTotal > 0 ? Math.round((current / newTotal) * 100) : 0;
      
      this.setData({
        current,
        total: newTotal,
        percentage: Math.min(100, Math.max(0, percentage))
      });
    },

    /**
     * 增加进度
     */
    increment(step: number = 1) {
      const newCurrent = Math.min(this.data.current + step, this.data.total);
      this.setProgress(newCurrent);
    },

    /**
     * 重置进度
     */
    reset() {
      this.setData({
        current: 0,
        percentage: 0
      });
    }
  }
});
```

## 🔧 工具函数

### 网络请求封装 (`miniprogram/utils/request.ts`)
```typescript
interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  timeout?: number;
  showLoading?: boolean;
  loadingText?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class RequestManager {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = 'https://api.example.com';
    this.defaultTimeout = 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  /**
   * 发起请求
   */
  async request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      data,
      header = {},
      timeout = this.defaultTimeout,
      showLoading = false,
      loadingText = '加载中...'
    } = options;

    // 显示加载提示
    if (showLoading) {
      wx.showLoading({
        title: loadingText,
        mask: true
      });
    }

    try {
      // 获取 token
      const token = wx.getStorageSync('token');
      const headers = {
        ...this.defaultHeaders,
        ...header
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // 发起请求
      const response = await new Promise<WechatMiniprogram.RequestSuccessCallbackResult>((resolve, reject) => {
        wx.request({
          url: this.baseURL + url,
          method,
          data,
          header: headers,
          timeout,
          success: resolve,
          fail: reject
        });
      });

      // 处理响应
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data as ApiResponse<T>;
      } else {
        throw new Error(`HTTP ${response.statusCode}: ${response.data}`);
      }

    } catch (error) {
      console.error('请求失败:', error);
      
      // 处理网络错误
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('请求超时，请检查网络连接');
        } else if (error.message.includes('fail')) {
          throw new Error('网络连接失败，请检查网络设置');
        }
      }
      
      throw error;
    } finally {
      // 隐藏加载提示
      if (showLoading) {
        wx.hideLoading();
      }
    }
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, url, method: 'GET' });
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, url, method: 'POST', data });
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, url, method: 'PUT', data });
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, options?: Omit<RequestOptions, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...options, url, method: 'DELETE' });
  }

  /**
   * 设置基础 URL
   */
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * 设置默认头部
   */
  setDefaultHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

export const request = new RequestManager();
```

### 存储封装 (`miniprogram/utils/storage.ts`)
```typescript
class StorageManager {
  /**
   * 设置存储
   */
  set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key,
        data: value,
        success: () => resolve(),
        fail: reject
      });
    });
  }

  /**
   * 获取存储
   */
  get<T = any>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      wx.getStorage({
        key,
        success: (res) => resolve(res.data),
        fail: () => resolve(null)
      });
    });
  }

  /**
   * 同步设置存储
   */
  setSync(key: string, value: any): void {
    try {
      wx.setStorageSync(key, value);
    } catch (error) {
      console.error('设置存储失败:', error);
    }
  }

  /**
   * 同步获取存储
   */
  getSync<T = any>(key: string): T | null {
    try {
      return wx.getStorageSync(key);
    } catch (error) {
      console.error('获取存储失败:', error);
      return null;
    }
  }

  /**
   * 删除存储
   */
  remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key,
        success: () => resolve(),
        fail: reject
      });
    });
  }

  /**
   * 同步删除存储
   */
  removeSync(key: string): void {
    try {
      wx.removeStorageSync(key);
    } catch (error) {
      console.error('删除存储失败:', error);
    }
  }

  /**
   * 清空存储
   */
  clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      wx.clearStorage({
        success: () => resolve(),
        fail: reject
      });
    });
  }

  /**
   * 获取存储信息
   */
  getInfo(): Promise<WechatMiniprogram.GetStorageInfoSuccessCallbackOption> {
    return new Promise((resolve, reject) => {
      wx.getStorageInfo({
        success: resolve,
        fail: reject
      });
    });
  }

  /**
   * 批量设置
   */
  async setBatch(items: Record<string, any>): Promise<void> {
    const promises = Object.entries(items).map(([key, value]) => 
      this.set(key, value)
    );
    await Promise.all(promises);
  }

  /**
   * 批量获取
   */
  async getBatch<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    const promises = keys.map(async (key) => ({
      key,
      value: await this.get<T>(key)
    }));
    
    const results = await Promise.all(promises);
    
    return results.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, T | null>);
  }
}

export const storage = new StorageManager();
```

## 📊 状态管理

### 用户状态 (`miniprogram/stores/user.store.ts`)
```typescript
import { observable, action, computed } from 'mobx';
import { storage } from '../utils/storage';
import { request } from '../utils/request';

interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar: string;
  grade: number;
  email: string;
}

interface UserStatistics {
  totalSessions: number;
  totalProblems: number;
  correctAnswers: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
}

class UserStore {
  @observable userInfo: UserInfo | null = null;
  @observable statistics: UserStatistics | null = null;
  @observable loading = false;

  @computed get isLoggedIn(): boolean {
    return !!this.userInfo;
  }

  @computed get displayName(): string {
    return this.userInfo?.name || this.userInfo?.username || '未登录';
  }

  @action
  async loadUserInfo(): Promise<void> {
    try {
      this.loading = true;
      
      // 先从本地加载
      const localUserInfo = await storage.get<UserInfo>('userInfo');
      if (localUserInfo) {
        this.userInfo = localUserInfo;
      }

      // 从服务器同步
      const response = await request.get<UserInfo>('/user/profile');
      if (response.success && response.data) {
        this.userInfo = response.data;
        await storage.set('userInfo', response.data);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      this.loading = false;
    }
  }

  @action
  async updateUserInfo(updates: Partial<UserInfo>): Promise<void> {
    try {
      const response = await request.put('/user/profile', updates);
      if (response.success && response.data) {
        this.userInfo = { ...this.userInfo!, ...response.data };
        await storage.set('userInfo', this.userInfo);
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }

  @action
  async loadStatistics(): Promise<void> {
    try {
      const response = await request.get<UserStatistics>('/user/statistics');
      if (response.success && response.data) {
        this.statistics = response.data;
      }
    } catch (error) {
      console.error('加载统计信息失败:', error);
    }
  }

  @action
  async updateStatistics(answers: any[]): Promise<void> {
    try {
      const response = await request.post('/user/statistics', { answers });
      if (response.success && response.data) {
        this.statistics = response.data;
      }
    } catch (error) {
      console.error('更新统计信息失败:', error);
    }
  }

  @action
  async login(userInfo: UserInfo, token: string): Promise<void> {
    this.userInfo = userInfo;
    await storage.setBatch({
      userInfo,
      token
    });
  }

  @action
  async logout(): Promise<void> {
    this.userInfo = null;
    this.statistics = null;
    
    await storage.clear();
    
    // 清除微信授权
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('token');
  }
}

export const userStore = new UserStore();
```

## 🚀 构建和发布

### 项目配置 (`project.config.json`)
```json
{
  "description": "小学数学练习生成器小程序",
  "packOptions": {
    "ignore": [
      {
        "type": "file",
        "value": ".eslintrc.js"
      },
      {
        "type": "file", 
        "value": ".gitignore"
      },
      {
        "type": "file",
        "value": "README.md"
      },
      {
        "type": "folder",
        "value": "tests"
      }
    ]
  },
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": false,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "wx1234567890abcdef",
  "projectname": "exams-miniprogram",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
```

### 构建脚本
```bash
#!/bin/bash
# scripts/build-miniprogram.sh

echo "构建小程序..."

# 安装依赖
npm install

# TypeScript 编译
npx tsc

# 代码检查
npm run lint

# 压缩资源
npm run minify

# 生成版本信息
echo "生成版本信息..."
cat > miniprogram/version.json << EOF
{
  "version": "$(node -p "require('./package.json').version")",
  "buildTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "commit": "$(git rev-parse HEAD)"
}
EOF

echo "构建完成！"
```

这个小程序包提供了完整的移动端解决方案，具有原生的用户体验和良好的性能表现。