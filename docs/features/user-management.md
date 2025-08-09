# 用户管理功能文档

本文档详细描述了小学数学练习生成器生态系统中的用户管理功能，包括用户认证、授权、个人资料管理、学习进度跟踪等核心功能。

## 🎯 功能概述

### 核心功能
- **用户注册与登录**: 支持多种注册登录方式
- **身份认证**: JWT 令牌认证机制
- **权限管理**: 基于角色的访问控制
- **个人资料**: 用户信息管理和设置
- **学习进度**: 练习记录和统计分析
- **家长监控**: 家长账户关联和监控功能
- **数据同步**: 跨设备数据同步

### 用户角色
- **学生**: 主要用户，进行数学练习
- **家长**: 监控孩子学习进度
- **教师**: 管理班级和学生（扩展功能）
- **管理员**: 系统管理和维护

## 🔐 认证系统

### 注册流程

#### 学生注册
```typescript
interface StudentRegistration {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  grade: number;
  birthDate: string;
  parentEmail?: string;
  schoolCode?: string;
}

class AuthService {
  /**
   * 学生注册
   */
  async registerStudent(data: StudentRegistration): Promise<AuthResult> {
    // 1. 验证输入数据
    const validation = this.validateStudentRegistration(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    // 2. 检查用户名唯一性
    const existingUser = await this.userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new ConflictError('用户名已存在');
    }

    // 3. 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // 4. 创建用户记录
    const user = await this.userRepository.create({
      username: data.username,
      password: hashedPassword,
      name: data.name,
      role: UserRole.STUDENT,
      grade: data.grade,
      birthDate: new Date(data.birthDate),
      status: UserStatus.ACTIVE,
      settings: this.getDefaultStudentSettings(data.grade)
    });

    // 5. 发送欢迎邮件（如果提供了家长邮箱）
    if (data.parentEmail) {
      await this.emailService.sendWelcomeEmail(data.parentEmail, user);
    }

    // 6. 生成访问令牌
    const tokens = await this.generateTokens(user);

    // 7. 记录注册事件
    await this.auditService.logEvent({
      type: 'USER_REGISTERED',
      userId: user.id,
      metadata: { grade: data.grade, hasParentEmail: !!data.parentEmail }
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
      isNewUser: true
    };
  }

  /**
   * 验证学生注册数据
   */
  private validateStudentRegistration(data: StudentRegistration): ValidationResult {
    const errors: string[] = [];

    // 用户名验证
    if (!data.username || data.username.length < 3) {
      errors.push('用户名至少需要3个字符');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push('用户名只能包含字母、数字和下划线');
    }

    // 密码验证
    if (!data.password || data.password.length < 6) {
      errors.push('密码至少需要6个字符');
    }
    if (data.password !== data.confirmPassword) {
      errors.push('两次输入的密码不一致');
    }

    // 姓名验证
    if (!data.name || data.name.trim().length < 2) {
      errors.push('姓名至少需要2个字符');
    }

    // 年级验证
    if (!data.grade || data.grade < 1 || data.grade > 6) {
      errors.push('年级必须在1-6之间');
    }

    // 生日验证
    const birthDate = new Date(data.birthDate);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    if (age < 5 || age > 15) {
      errors.push('年龄必须在5-15岁之间');
    }

    // 家长邮箱验证（可选）
    if (data.parentEmail && !this.isValidEmail(data.parentEmail)) {
      errors.push('家长邮箱格式不正确');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

#### 家长注册
```typescript
interface ParentRegistration {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  children: Array<{
    name: string;
    grade: number;
    birthDate: string;
  }>;
}

class AuthService {
  /**
   * 家长注册
   */
  async registerParent(data: ParentRegistration): Promise<AuthResult> {
    // 1. 验证输入数据
    const validation = this.validateParentRegistration(data);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    // 2. 检查邮箱唯一性
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('邮箱已被注册');
    }

    // 3. 开始数据库事务
    return await this.database.transaction(async (trx) => {
      // 4. 创建家长账户
      const parent = await this.userRepository.create({
        email: data.email,
        password: await bcrypt.hash(data.password, 12),
        name: data.name,
        phone: data.phone,
        role: UserRole.PARENT,
        status: UserStatus.ACTIVE
      }, trx);

      // 5. 创建子女账户
      const children = [];
      for (const childData of data.children) {
        const child = await this.userRepository.create({
          username: this.generateChildUsername(childData.name),
          password: await bcrypt.hash(this.generateRandomPassword(), 12),
          name: childData.name,
          role: UserRole.STUDENT,
          grade: childData.grade,
          birthDate: new Date(childData.birthDate),
          parentId: parent.id,
          status: UserStatus.ACTIVE,
          settings: this.getDefaultStudentSettings(childData.grade)
        }, trx);

        children.push(child);
      }

      // 6. 发送欢迎邮件
      await this.emailService.sendParentWelcomeEmail(parent, children);

      // 7. 生成访问令牌
      const tokens = await this.generateTokens(parent);

      return {
        user: this.sanitizeUser(parent),
        children: children.map(child => this.sanitizeUser(child)),
        tokens,
        isNewUser: true
      };
    });
  }
}
```

### 登录流程

#### 统一登录接口
```typescript
interface LoginCredentials {
  identifier: string; // 用户名或邮箱
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  deviceId: string;
  ipAddress: string;
}

class AuthService {
  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    // 1. 查找用户
    const user = await this.findUserByIdentifier(credentials.identifier);
    if (!user) {
      throw new AuthenticationError('用户名或密码错误');
    }

    // 2. 检查账户状态
    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthenticationError('账户已被暂停');
    }
    if (user.status === UserStatus.DELETED) {
      throw new AuthenticationError('账户不存在');
    }

    // 3. 验证密码
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      // 记录失败尝试
      await this.recordFailedLogin(user.id, credentials.deviceInfo);
      throw new AuthenticationError('用户名或密码错误');
    }

    // 4. 检查登录限制
    await this.checkLoginRestrictions(user, credentials.deviceInfo);

    // 5. 生成访问令牌
    const tokens = await this.generateTokens(user, {
      rememberMe: credentials.rememberMe,
      deviceInfo: credentials.deviceInfo
    });

    // 6. 更新最后登录时间
    await this.userRepository.updateLastLogin(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: credentials.deviceInfo?.ipAddress
    });

    // 7. 记录登录事件
    await this.auditService.logEvent({
      type: 'USER_LOGIN',
      userId: user.id,
      metadata: {
        deviceInfo: credentials.deviceInfo,
        rememberMe: credentials.rememberMe
      }
    });

    // 8. 加载用户关联数据
    const userData = await this.loadUserData(user);

    return {
      user: this.sanitizeUser(userData),
      tokens,
      isNewUser: false
    };
  }

  /**
   * 根据标识符查找用户
   */
  private async findUserByIdentifier(identifier: string): Promise<User | null> {
    // 判断是邮箱还是用户名
    if (this.isValidEmail(identifier)) {
      return await this.userRepository.findByEmail(identifier);
    } else {
      return await this.userRepository.findByUsername(identifier);
    }
  }

  /**
   * 检查登录限制
   */
  private async checkLoginRestrictions(user: User, deviceInfo?: DeviceInfo): Promise<void> {
    // 检查失败登录次数
    const failedAttempts = await this.getFailedLoginAttempts(user.id);
    if (failedAttempts >= 5) {
      const lockoutTime = await this.getLockoutTime(user.id);
      if (lockoutTime && Date.now() < lockoutTime) {
        throw new AuthenticationError('账户已被锁定，请稍后再试');
      }
    }

    // 检查设备限制（可选）
    if (user.role === UserRole.STUDENT && user.parentId) {
      const parentSettings = await this.getParentSettings(user.parentId);
      if (parentSettings.deviceRestriction && deviceInfo) {
        const isDeviceAllowed = await this.checkDevicePermission(user.id, deviceInfo);
        if (!isDeviceAllowed) {
          throw new AuthenticationError('此设备未被授权使用');
        }
      }
    }
  }
}
```

### JWT 令牌管理

#### 令牌生成
```typescript
interface TokenPayload {
  userId: string;
  role: UserRole;
  sessionId: string;
  deviceId?: string;
  iat: number;
  exp: number;
}

class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  /**
   * 生成访问令牌和刷新令牌
   */
  async generateTokens(user: User, options: {
    rememberMe?: boolean;
    deviceInfo?: DeviceInfo;
  } = {}): Promise<TokenPair> {
    const sessionId = this.generateSessionId();
    const now = Math.floor(Date.now() / 1000);

    // 访问令牌载荷
    const accessPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
      sessionId,
      deviceId: options.deviceInfo?.deviceId,
      iat: now,
      exp: now + this.getAccessTokenExpiry()
    };

    // 刷新令牌载荷
    const refreshPayload = {
      userId: user.id,
      sessionId,
      deviceId: options.deviceInfo?.deviceId,
      iat: now,
      exp: now + this.getRefreshTokenExpiry(options.rememberMe)
    };

    // 生成令牌
    const accessToken = jwt.sign(accessPayload, this.accessTokenSecret);
    const refreshToken = jwt.sign(refreshPayload, this.refreshTokenSecret);

    // 存储会话信息
    await this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      refreshToken: await this.hashToken(refreshToken),
      deviceInfo: options.deviceInfo,
      expiresAt: new Date((refreshPayload.exp) * 1000),
      isActive: true
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getAccessTokenExpiry()
    };
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    try {
      // 验证刷新令牌
      const payload = jwt.verify(refreshToken, this.refreshTokenSecret) as any;
      
      // 查找会话
      const session = await this.sessionRepository.findBySessionId(payload.sessionId);
      if (!session || !session.isActive) {
        throw new AuthenticationError('会话已失效');
      }

      // 验证刷新令牌哈希
      const isTokenValid = await bcrypt.compare(refreshToken, session.refreshToken);
      if (!isTokenValid) {
        throw new AuthenticationError('令牌无效');
      }

      // 检查会话是否过期
      if (session.expiresAt < new Date()) {
        await this.sessionRepository.deactivate(session.id);
        throw new AuthenticationError('会话已过期');
      }

      // 获取用户信息
      const user = await this.userRepository.findById(payload.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new AuthenticationError('用户状态异常');
      }

      // 生成新的访问令牌
      const now = Math.floor(Date.now() / 1000);
      const accessPayload: TokenPayload = {
        userId: user.id,
        role: user.role,
        sessionId: payload.sessionId,
        deviceId: payload.deviceId,
        iat: now,
        exp: now + this.getAccessTokenExpiry()
      };

      const newAccessToken = jwt.sign(accessPayload, this.accessTokenSecret);

      return {
        accessToken: newAccessToken,
        refreshToken, // 刷新令牌保持不变
        expiresIn: this.getAccessTokenExpiry()
      };

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('令牌格式错误');
      }
      throw error;
    }
  }

  /**
   * 撤销令牌
   */
  async revokeToken(refreshToken: string): Promise<void> {
    try {
      const payload = jwt.verify(refreshToken, this.refreshTokenSecret) as any;
      await this.sessionRepository.deactivate(payload.sessionId);
    } catch (error) {
      // 忽略无效令牌错误
      console.warn('撤销无效令牌:', error.message);
    }
  }

  /**
   * 撤销用户所有令牌
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.sessionRepository.deactivateAllUserSessions(userId);
  }
}
```

## 👤 用户资料管理

### 个人信息管理
```typescript
interface UserProfile {
  id: string;
  username: string;
  email?: string;
  name: string;
  avatar?: string;
  grade?: number;
  birthDate?: Date;
  phone?: string;
  bio?: string;
  preferences: UserPreferences;
  statistics: UserStatistics;
  createdAt: Date;
  updatedAt: Date;
}

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  hintsEnabled: boolean;
  timeLimit: number;
  problemTypes: string[];
  notifications: NotificationSettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  dailyReminder: boolean;
  weeklyReport: boolean;
  achievementAlerts: boolean;
}

class UserProfileService {
  /**
   * 获取用户资料
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 加载用户统计数据
    const statistics = await this.statisticsService.getUserStatistics(userId);
    
    // 加载用户偏好设置
    const preferences = await this.preferencesRepository.findByUserId(userId) 
      || this.getDefaultPreferences(user.role, user.grade);

    return {
      ...user,
      preferences,
      statistics
    };
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    // 验证更新数据
    const validation = this.validateProfileUpdates(updates);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }

    // 检查权限
    await this.checkUpdatePermissions(userId, updates);

    // 开始事务
    return await this.database.transaction(async (trx) => {
      // 更新基本信息
      if (updates.name || updates.email || updates.phone || updates.bio) {
        await this.userRepository.update(userId, {
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          bio: updates.bio,
          updatedAt: new Date()
        }, trx);
      }

      // 更新偏好设置
      if (updates.preferences) {
        await this.preferencesRepository.upsert(userId, updates.preferences, trx);
      }

      // 处理头像上传
      if (updates.avatar) {
        const avatarUrl = await this.uploadAvatar(userId, updates.avatar);
        await this.userRepository.update(userId, { avatar: avatarUrl }, trx);
      }

      // 记录更新事件
      await this.auditService.logEvent({
        type: 'PROFILE_UPDATED',
        userId,
        metadata: { updatedFields: Object.keys(updates) }
      }, trx);

      // 返回更新后的资料
      return await this.getUserProfile(userId);
    });
  }

  /**
   * 更改密码
   */
  async changePassword(userId: string, data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    // 验证新密码
    if (data.newPassword !== data.confirmPassword) {
      throw new ValidationError('两次输入的密码不一致');
    }

    if (data.newPassword.length < 6) {
      throw new ValidationError('密码至少需要6个字符');
    }

    // 获取用户信息
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('当前密码错误');
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(data.newPassword, user.password);
    if (isSamePassword) {
      throw new ValidationError('新密码不能与当前密码相同');
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(data.newPassword, 12);
    await this.userRepository.update(userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
      updatedAt: new Date()
    });

    // 撤销所有现有令牌
    await this.tokenService.revokeAllUserTokens(userId);

    // 记录密码更改事件
    await this.auditService.logEvent({
      type: 'PASSWORD_CHANGED',
      userId,
      metadata: { timestamp: new Date() }
    });

    // 发送通知邮件
    if (user.email) {
      await this.emailService.sendPasswordChangeNotification(user.email, user.name);
    }
  }

  /**
   * 上传头像
   */
  private async uploadAvatar(userId: string, avatarFile: File): Promise<string> {
    // 验证文件类型和大小
    if (!avatarFile.type.startsWith('image/')) {
      throw new ValidationError('只能上传图片文件');
    }

    if (avatarFile.size > 5 * 1024 * 1024) { // 5MB
      throw new ValidationError('图片大小不能超过5MB');
    }

    // 生成文件名
    const fileExtension = avatarFile.name.split('.').pop();
    const fileName = `avatar-${userId}-${Date.now()}.${fileExtension}`;

    // 上传到云存储
    const uploadResult = await this.storageService.upload({
      file: avatarFile,
      fileName,
      folder: 'avatars',
      options: {
        resize: { width: 200, height: 200 },
        format: 'webp',
        quality: 80
      }
    });

    return uploadResult.url;
  }
}
```

### 家长监控功能
```typescript
interface ParentDashboard {
  children: ChildSummary[];
  weeklyReport: WeeklyReport;
  recentActivities: Activity[];
  achievements: Achievement[];
  recommendations: Recommendation[];
}

interface ChildSummary {
  id: string;
  name: string;
  avatar?: string;
  grade: number;
  currentStreak: number;
  weeklyProgress: {
    sessionsCompleted: number;
    problemsSolved: number;
    accuracy: number;
    timeSpent: number;
  };
  lastActivity: Date;
  status: 'active' | 'inactive' | 'needs_attention';
}

class ParentService {
  /**
   * 获取家长仪表板
   */
  async getParentDashboard(parentId: string): Promise<ParentDashboard> {
    // 获取子女列表
    const children = await this.userRepository.findChildrenByParentId(parentId);
    
    // 并行获取各种数据
    const [
      childrenSummaries,
      weeklyReport,
      recentActivities,
      achievements,
      recommendations
    ] = await Promise.all([
      this.getChildrenSummaries(children),
      this.getWeeklyReport(children.map(c => c.id)),
      this.getRecentActivities(children.map(c => c.id)),
      this.getRecentAchievements(children.map(c => c.id)),
      this.getRecommendations(children)
    ]);

    return {
      children: childrenSummaries,
      weeklyReport,
      recentActivities,
      achievements,
      recommendations
    };
  }

  /**
   * 获取子女摘要信息
   */
  private async getChildrenSummaries(children: User[]): Promise<ChildSummary[]> {
    return await Promise.all(children.map(async (child) => {
      const [weeklyStats, lastActivity, currentStreak] = await Promise.all([
        this.statisticsService.getWeeklyStats(child.id),
        this.activityService.getLastActivity(child.id),
        this.streakService.getCurrentStreak(child.id)
      ]);

      // 判断状态
      let status: ChildSummary['status'] = 'active';
      if (!lastActivity || this.daysSince(lastActivity.createdAt) > 3) {
        status = 'inactive';
      } else if (weeklyStats.accuracy < 60 || weeklyStats.sessionsCompleted < 3) {
        status = 'needs_attention';
      }

      return {
        id: child.id,
        name: child.name,
        avatar: child.avatar,
        grade: child.grade!,
        currentStreak,
        weeklyProgress: weeklyStats,
        lastActivity: lastActivity?.createdAt || child.createdAt,
        status
      };
    }));
  }

  /**
   * 设置学习时间限制
   */
  async setStudyTimeLimit(parentId: string, childId: string, limits: {
    dailyMinutes: number;
    weeklyMinutes: number;
    allowedHours: { start: string; end: string; }[];
    blockedDays: number[];
  }): Promise<void> {
    // 验证权限
    await this.verifyParentChildRelation(parentId, childId);

    // 验证时间限制设置
    this.validateTimeLimit(limits);

    // 保存设置
    await this.parentControlRepository.upsert({
      parentId,
      childId,
      studyTimeLimit: limits,
      updatedAt: new Date()
    });

    // 记录事件
    await this.auditService.logEvent({
      type: 'STUDY_TIME_LIMIT_SET',
      userId: parentId,
      targetUserId: childId,
      metadata: limits
    });
  }

  /**
   * 获取学习报告
   */
  async getStudyReport(parentId: string, childId: string, period: {
    startDate: Date;
    endDate: Date;
  }): Promise<StudyReport> {
    // 验证权限
    await this.verifyParentChildRelation(parentId, childId);

    // 获取学习数据
    const [sessions, statistics, progress] = await Promise.all([
      this.sessionRepository.findByUserIdAndPeriod(childId, period),
      this.statisticsService.getStatisticsByPeriod(childId, period),
      this.progressService.getProgressByPeriod(childId, period)
    ]);

    // 分析数据
    const analysis = this.analyzeStudyData(sessions, statistics, progress);

    return {
      period,
      child: await this.userRepository.findById(childId),
      sessions,
      statistics,
      progress,
      analysis,
      recommendations: this.generateRecommendations(analysis)
    };
  }

  /**
   * 发送学习提醒
   */
  async sendStudyReminder(parentId: string, childId: string, message: string): Promise<void> {
    // 验证权限
    await this.verifyParentChildRelation(parentId, childId);

    // 获取子女信息
    const child = await this.userRepository.findById(childId);
    if (!child) {
      throw new NotFoundError('子女信息不存在');
    }

    // 发送应用内通知
    await this.notificationService.send({
      userId: childId,
      type: 'STUDY_REMINDER',
      title: '学习提醒',
      message,
      data: { fromParent: true }
    });

    // 记录提醒事件
    await this.auditService.logEvent({
      type: 'STUDY_REMINDER_SENT',
      userId: parentId,
      targetUserId: childId,
      metadata: { message }
    });
  }
}
```

## 📊 学习进度跟踪

### 统计数据模型
```typescript
interface UserStatistics {
  userId: string;
  totalSessions: number;
  totalProblems: number;
  correctAnswers: number;
  totalTimeSpent: number; // 秒
  averageAccuracy: number;
  averageSpeed: number; // 秒/题
  currentStreak: number;
  longestStreak: number;
  favoriteTopics: string[];
  weakTopics: string[];
  gradeLevel: number;
  lastUpdated: Date;
}

interface SessionStatistics {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  problemCount: number;
  correctCount: number;
  accuracy: number;
  averageTime: number;
  topicBreakdown: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
  difficultyBreakdown: Record<string, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
}

class StatisticsService {
  /**
   * 更新用户统计数据
   */
  async updateUserStatistics(userId: string, sessionData: SessionData): Promise<void> {
    const currentStats = await this.getUserStatistics(userId);
    
    // 计算新的统计数据
    const newStats: Partial<UserStatistics> = {
      totalSessions: currentStats.totalSessions + 1,
      totalProblems: currentStats.totalProblems + sessionData.problemCount,
      correctAnswers: currentStats.correctAnswers + sessionData.correctCount,
      totalTimeSpent: currentStats.totalTimeSpent + sessionData.duration,
      lastUpdated: new Date()
    };

    // 计算平均准确率
    newStats.averageAccuracy = (newStats.correctAnswers! / newStats.totalProblems!) * 100;

    // 计算平均速度
    newStats.averageSpeed = newStats.totalTimeSpent! / newStats.totalProblems!;

    // 更新连击记录
    if (sessionData.accuracy >= 80) {
      newStats.currentStreak = currentStats.currentStreak + 1;
      newStats.longestStreak = Math.max(currentStats.longestStreak, newStats.currentStreak);
    } else {
      newStats.currentStreak = 0;
    }

    // 分析强弱项
    const topicAnalysis = this.analyzeTopicPerformance(userId, sessionData);
    newStats.favoriteTopics = topicAnalysis.strong;
    newStats.weakTopics = topicAnalysis.weak;

    // 保存统计数据
    await this.statisticsRepository.upsert(userId, newStats);

    // 检查成就
    await this.achievementService.checkAchievements(userId, newStats);
  }

  /**
   * 获取学习趋势
   */
  async getLearningTrends(userId: string, period: number = 30): Promise<LearningTrends> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000);

    // 获取时间段内的会话数据
    const sessions = await this.sessionRepository.findByUserIdAndPeriod(userId, {
      startDate,
      endDate
    });

    // 按日期分组
    const dailyData = this.groupSessionsByDate(sessions);

    // 计算趋势
    const trends = {
      accuracy: this.calculateAccuracyTrend(dailyData),
      speed: this.calculateSpeedTrend(dailyData),
      volume: this.calculateVolumeTrend(dailyData),
      consistency: this.calculateConsistencyScore(dailyData),
      improvement: this.calculateImprovementRate(dailyData)
    };

    return trends;
  }

  /**
   * 生成学习报告
   */
  async generateLearningReport(userId: string, period: {
    startDate: Date;
    endDate: Date;
  }): Promise<LearningReport> {
    const [sessions, statistics, trends, achievements] = await Promise.all([
      this.sessionRepository.findByUserIdAndPeriod(userId, period),
      this.getUserStatistics(userId),
      this.getLearningTrends(userId, this.daysBetween(period.startDate, period.endDate)),
      this.achievementService.getAchievementsByPeriod(userId, period)
    ]);

    // 分析数据
    const analysis = {
      totalStudyTime: sessions.reduce((sum, s) => sum + s.duration, 0),
      averageSessionLength: sessions.length > 0 ? 
        sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0,
      mostActiveDay: this.findMostActiveDay(sessions),
      preferredStudyTime: this.findPreferredStudyTime(sessions),
      topicMastery: this.analyzeTopicMastery(sessions),
      difficultyProgression: this.analyzeDifficultyProgression(sessions),
      strengths: this.identifyStrengths(sessions),
      areasForImprovement: this.identifyWeaknesses(sessions)
    };

    return {
      period,
      user: await this.userRepository.findById(userId),
      summary: {
        sessionsCompleted: sessions.length,
        problemsSolved: sessions.reduce((sum, s) => sum + s.problemCount, 0),
        correctAnswers: sessions.reduce((sum, s) => sum + s.correctCount, 0),
        totalTime: analysis.totalStudyTime,
        averageAccuracy: sessions.length > 0 ? 
          sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length : 0
      },
      trends,
      analysis,
      achievements,
      recommendations: this.generateRecommendations(analysis, trends)
    };
  }
}
```

### 成就系统
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  type: AchievementType;
  criteria: AchievementCriteria;
  rewards: AchievementReward[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
  notified: boolean;
}

enum AchievementCategory {
  ACCURACY = 'accuracy',
  SPEED = 'speed',
  CONSISTENCY = 'consistency',
  VOLUME = 'volume',
  STREAK = 'streak',
  TOPIC_MASTERY = 'topic_mastery',
  SPECIAL = 'special'
}

enum AchievementType {
  MILESTONE = 'milestone',
  PROGRESSIVE = 'progressive',
  CONDITIONAL = 'conditional'
}

class AchievementService {
  private achievements: Achievement[] = [
    {
      id: 'first_session',
      name: '初次尝试',
      description: '完成第一次练习',
      icon: '🎯',
      category: AchievementCategory.VOLUME,
      type: AchievementType.MILESTONE,
      criteria: { sessionsCompleted: 1 },
      rewards: [{ type: 'points', value: 10 }],
      rarity: 'common',
      isActive: true
    },
    {
      id: 'perfect_session',
      name: '完美表现',
      description: '在一次练习中答对所有题目',
      icon: '💯',
      category: AchievementCategory.ACCURACY,
      type: AchievementType.CONDITIONAL,
      criteria: { sessionAccuracy: 100 },
      rewards: [{ type: 'points', value: 50 }],
      rarity: 'rare',
      isActive: true
    },
    {
      id: 'speed_demon',
      name: '速度之王',
      description: '平均每题用时少于10秒',
      icon: '⚡',
      category: AchievementCategory.SPEED,
      type: AchievementType.CONDITIONAL,
      criteria: { averageTimePerProblem: { max: 10 } },
      rewards: [{ type: 'points', value: 30 }],
      rarity: 'rare',
      isActive: true
    },
    {
      id: 'week_warrior',
      name: '一周战士',
      description: '连续7天完成练习',
      icon: '🔥',
      category: AchievementCategory.STREAK,
      type: AchievementType.MILESTONE,
      criteria: { dailyStreak: 7 },
      rewards: [{ type: 'points', value: 100 }],
      rarity: 'epic',
      isActive: true
    },
    {
      id: 'math_master',
      name: '数学大师',
      description: '累计解决1000道题目',
      icon: '👑',
      category: AchievementCategory.VOLUME,
      type: AchievementType.PROGRESSIVE,
      criteria: { totalProblems: 1000 },
      rewards: [{ type: 'points', value: 500 }, { type: 'badge', value: 'master' }],
      rarity: 'legendary',
      isActive: true
    }
  ];

  /**
   * 检查用户成就
   */
  async checkAchievements(userId: string, statistics: UserStatistics): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (!achievement.isActive) continue;

      // 检查用户是否已经获得此成就
      const userAchievement = await this.userAchievementRepository.findByUserAndAchievement(
        userId, 
        achievement.id
      );

      if (userAchievement?.isCompleted) continue;

      // 检查成就条件
      const isUnlocked = await this.checkAchievementCriteria(userId, achievement, statistics);
      
      if (isUnlocked) {
        // 解锁成就
        await this.unlockAchievement(userId, achievement);
        unlockedAchievements.push(achievement);
      } else if (achievement.type === AchievementType.PROGRESSIVE) {
        // 更新进度
        const progress = await this.calculateAchievementProgress(userId, achievement, statistics);
        await this.updateAchievementProgress(userId, achievement.id, progress);
      }
    }

    return unlockedAchievements;
  }

  /**
   * 检查成就条件
   */
  private async checkAchievementCriteria(
    userId: string, 
    achievement: Achievement, 
    statistics: UserStatistics
  ): Promise<boolean> {
    const criteria = achievement.criteria;

    // 检查会话数量
    if (criteria.sessionsCompleted && statistics.totalSessions < criteria.sessionsCompleted) {
      return false;
    }

    // 检查总题目数
    if (criteria.totalProblems && statistics.totalProblems < criteria.totalProblems) {
      return false;
    }

    // 检查准确率
    if (criteria.averageAccuracy && statistics.averageAccuracy < criteria.averageAccuracy) {
      return false;
    }

    // 检查连击数
    if (criteria.currentStreak && statistics.currentStreak < criteria.currentStreak) {
      return false;
    }

    // 检查每日连击
    if (criteria.dailyStreak) {
      const dailyStreak = await this.streakService.getDailyStreak(userId);
      if (dailyStreak < criteria.dailyStreak) {
        return false;
      }
    }

    // 检查单次会话条件
    if (criteria.sessionAccuracy || criteria.averageTimePerProblem) {
      const recentSession = await this.sessionRepository.findLatestByUserId(userId);
      if (!recentSession) return false;

      if (criteria.sessionAccuracy && recentSession.accuracy < criteria.sessionAccuracy) {
        return false;
      }

      if (criteria.averageTimePerProblem) {
        const avgTime = recentSession.duration / recentSession.problemCount;
        if (criteria.averageTimePerProblem.max && avgTime > criteria.averageTimePerProblem.max) {
          return false;
        }
        if (criteria.averageTimePerProblem.min && avgTime < criteria.averageTimePerProblem.min) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * 解锁成就
   */
  private async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    // 创建用户成就记录
    await this.userAchievementRepository.create({
      userId,
      achievementId: achievement.id,
      unlockedAt: new Date(),
      progress: 100,
      isCompleted: true,
      notified: false
    });

    // 发放奖励
    for (const reward of achievement.rewards) {
      await this.rewardService.grantReward(userId, reward);
    }

    // 发送通知
    await this.notificationService.send({
      userId,
      type: 'ACHIEVEMENT_UNLOCKED',
      title: '成就解锁！',
      message: `恭喜你获得成就：${achievement.name}`,
      data: {
        achievementId: achievement.id,
        achievementName: achievement.name,
        achievementIcon: achievement.icon
      }
    });

    // 记录事件
    await this.auditService.logEvent({
      type: 'ACHIEVEMENT_UNLOCKED',
      userId,
      metadata: {
        achievementId: achievement.id,
        achievementName: achievement.name,
        rarity: achievement.rarity
      }
    });
  }
}
```

## 🔒 权限管理

### 基于角色的访问控制 (RBAC)
```typescript
enum Permission {
  // 用户管理
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  
  // 练习管理
  PRACTICE_CREATE = 'practice:create',
  PRACTICE_READ = 'practice:read',
  PRACTICE_UPDATE = 'practice:update',
  PRACTICE_DELETE = 'practice:delete',
  
  // 统计数据
  STATS_READ_OWN = 'stats:read:own',
  STATS_READ_CHILDREN = 'stats:read:children',
  STATS_READ_ALL = 'stats:read:all',
  
  // 系统管理
  SYSTEM_ADMIN = 'system:admin',
  CONTENT_MANAGE = 'content:manage'
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
}

class PermissionService {
  private roles: Role[] = [
    {
      id: 'student',
      name: '学生',
      description: '普通学生用户',
      permissions: [
        Permission.USER_READ,
        Permission.PRACTICE_CREATE,
        Permission.PRACTICE_READ,
        Permission.PRACTICE_UPDATE,
        Permission.STATS_READ_OWN
      ],
      isSystem: true
    },
    {
      id: 'parent',
      name: '家长',
      description: '家长用户',
      permissions: [
        Permission.USER_READ,
        Permission.USER_WRITE,
        Permission.STATS_READ_OWN,
        Permission.STATS_READ_CHILDREN
      ],
      isSystem: true
    },
    {
      id: 'teacher',
      name: '教师',
      description: '教师用户',
      permissions: [
        Permission.USER_READ,
        Permission.USER_WRITE,
        Permission.PRACTICE_CREATE,
        Permission.PRACTICE_READ,
        Permission.PRACTICE_UPDATE,
        Permission.STATS_READ_ALL,
        Permission.CONTENT_MANAGE
      ],
      isSystem: true
    },
    {
      id: 'admin',
      name: '管理员',
      description: '系统管理员',
      permissions: Object.values(Permission),
      isSystem: true
    }
  ];

  /**
   * 检查用户权限
   */
  async checkPermission(userId: string, permission: Permission): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    const role = this.roles.find(r => r.id === user.role);
    if (!role) return false;

    return role.permissions.includes(permission);
  }

  /**
   * 检查资源访问权限
   */
  async checkResourceAccess(
    userId: string, 
    resourceType: string, 
    resourceId: string, 
    action: string
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) return false;

    // 管理员拥有所有权限
    if (user.role === 'admin') return true;

    switch (resourceType) {
      case 'user':
        return await this.checkUserAccess(user, resourceId, action);
      
      case 'practice':
        return await this.checkPracticeAccess(user, resourceId, action);
      
      case 'statistics':
        return await this.checkStatisticsAccess(user, resourceId, action);
      
      default:
        return false;
    }
  }

  /**
   * 检查用户访问权限
   */
  private async checkUserAccess(user: User, targetUserId: string, action: string): Promise<boolean> {
    // 用户可以访问自己的信息
    if (user.id === targetUserId) return true;

    // 家长可以访问子女信息
    if (user.role === 'parent') {
      const targetUser = await this.userRepository.findById(targetUserId);
      return targetUser?.parentId === user.id;
    }

    // 教师可以访问学生信息（如果在同一班级）
    if (user.role === 'teacher') {
      return await this.classService.areInSameClass(user.id, targetUserId);
    }

    return false;
  }

  /**
   * 检查练习访问权限
   */
  private async checkPracticeAccess(user: User, practiceId: string, action: string): Promise<boolean> {
    const practice = await this.practiceRepository.findById(practiceId);
    if (!practice) return false;

    // 用户可以访问自己的练习
    if (practice.userId === user.id) return true;

    // 家长可以查看子女的练习
    if (user.role === 'parent' && action === 'read') {
      const practiceUser = await this.userRepository.findById(practice.userId);
      return practiceUser?.parentId === user.id;
    }

    return false;
  }
}
```

### 中间件实现
```typescript
interface AuthenticatedRequest extends Request {
  user?: User;
  permissions?: Permission[];
}

/**
 * JWT 认证中间件
 */
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '缺少访问令牌' });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // 获取用户信息
    const user = await userRepository.findById(payload.userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      return res.status(401).json({ error: '用户状态异常' });
    }

    // 检查会话有效性
    const session = await sessionRepository.findBySessionId(payload.sessionId);
    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return res.status(401).json({ error: '会话已失效' });
    }

    // 获取用户权限
    const permissions = await permissionService.getUserPermissions(user.id);

    req.user = user;
    req.permissions = permissions;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: '无效的访问令牌' });
    }
    return res.status(500).json({ error: '认证失败' });
  }
};

/**
 * 权限检查中间件
 */
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.permissions) {
      return res.status(401).json({ error: '未认证' });
    }

    if (!req.permissions.includes(permission)) {
      return res.status(403).json({ error: '权限不足' });
    }

    next();
  };
};

/**
 * 资源访问检查中间件
 */
export const requireResourceAccess = (
  resourceType: string,
  resourceIdParam: string,
  action: string
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const resourceId = req.params[resourceIdParam];
    if (!resourceId) {
      return res.status(400).json({ error: '缺少资源ID' });
    }

    const hasAccess = await permissionService.checkResourceAccess(
      req.user.id,
      resourceType,
      resourceId,
      action
    );

    if (!hasAccess) {
      return res.status(403).json({ error: '无权访问此资源' });
    }

    next();
  };
};
```

这个用户管理功能文档提供了完整的用户认证、授权、资料管理和学习进度跟踪系统，确保用户数据的安全性和功能的完整性。