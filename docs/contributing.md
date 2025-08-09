# 贡献指南

欢迎为小学数学练习生成器生态系统做出贡献！本文档将指导您如何参与项目开发。

## 🎯 贡献方式

### 代码贡献
- 🐛 **Bug 修复**: 修复已知问题
- ✨ **新功能**: 实现新的功能特性
- 🚀 **性能优化**: 提升系统性能
- 📝 **文档改进**: 完善项目文档
- 🧪 **测试增强**: 增加测试覆盖率

### 非代码贡献
- 🎨 **设计改进**: UI/UX 设计优化
- 📊 **需求分析**: 用户需求调研
- 🔍 **问题报告**: 发现和报告 Bug
- 💡 **功能建议**: 提出新功能想法
- 📚 **教程编写**: 编写使用教程

## 🚀 快速开始

### 1. 环境准备
```bash
# 克隆仓库
git clone https://github.com/your-org/exams-ecosystem.git
cd exams-ecosystem

# 安装依赖
npm install

# 设置开发环境
cp .env.example .env.local
# 编辑 .env.local 文件，配置必要的环境变量

# 启动开发服务器
npm run dev
```

### 2. 分支策略
```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 创建修复分支
git checkout -b fix/issue-description

# 创建文档分支
git checkout -b docs/documentation-update
```

### 3. 开发流程
1. **Fork 仓库** 到您的 GitHub 账户
2. **克隆** Fork 的仓库到本地
3. **创建分支** 进行开发
4. **提交更改** 并推送到您的 Fork
5. **创建 Pull Request** 到主仓库

## 📋 开发规范

### 代码风格
我们使用 ESLint 和 Prettier 来保持代码风格一致：

```bash
# 检查代码风格
npm run lint

# 自动修复代码风格
npm run lint:fix

# 格式化代码
npm run format
```

### 提交规范
我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能提交
git commit -m "feat(generators): add fraction problem generator"

# 修复提交
git commit -m "fix(web): resolve problem display issue"

# 文档提交
git commit -m "docs(api): update authentication documentation"

# 样式提交
git commit -m "style(web): improve button component styling"

# 重构提交
git commit -m "refactor(shared): optimize random number generation"

# 测试提交
git commit -m "test(generators): add unit tests for math operations"

# 构建提交
git commit -m "build(deps): update next.js to v14"
```

### 提交消息格式
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### 类型 (type)
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `build`: 构建系统或依赖更新
- `ci`: CI 配置更新
- `perf`: 性能优化
- `chore`: 其他杂项

#### 范围 (scope)
- `web`: Web 应用
- `api`: API 服务
- `shared`: 共享包
- `miniprogram`: 小程序
- `generators`: 题目生成器
- `docs`: 文档

## 🧪 测试要求

### 测试覆盖率
- **新功能**: 必须包含单元测试，覆盖率 ≥ 90%
- **Bug 修复**: 必须包含回归测试
- **重构**: 确保现有测试通过

### 运行测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行 E2E 测试
npm run test:e2e

# 生成覆盖率报告
npm run test:coverage
```

### 测试编写指南
```typescript
// 好的测试示例
describe('MathProblemGenerator', () => {
  describe('generateAdditionProblem', () => {
    test('should generate valid addition problem for grade 1', () => {
      const problem = generateAdditionProblem(1, 'easy');
      
      expect(problem.type).toBe('addition');
      expect(problem.grade).toBe(1);
      expect(problem.operand1).toBeGreaterThanOrEqual(1);
      expect(problem.operand1).toBeLessThanOrEqual(10);
      expect(problem.operand2).toBeGreaterThanOrEqual(1);
      expect(problem.operand2).toBeLessThanOrEqual(10);
      expect(problem.answer).toBe(problem.operand1 + problem.operand2);
    });

    test('should generate problems within difficulty range', () => {
      const problems = Array.from({ length: 100 }, () => 
        generateAdditionProblem(2, 'medium')
      );
      
      problems.forEach(problem => {
        expect(problem.answer).toBeGreaterThanOrEqual(10);
        expect(problem.answer).toBeLessThanOrEqual(100);
      });
    });
  });
});
```

## 📝 文档贡献

### 文档类型
- **API 文档**: 接口说明和示例
- **用户指南**: 功能使用说明
- **开发文档**: 技术实现细节
- **教程**: 分步骤的学习指南

### 文档编写规范
```markdown
# 标题使用 H1
## 主要章节使用 H2
### 子章节使用 H3

<!-- 代码示例 -->
```typescript
// 提供完整的、可运行的代码示例
function example() {
  return 'Hello World';
}
```

<!-- 注意事项 -->
> ⚠️ **注意**: 重要的提醒信息

<!-- 提示信息 -->
> 💡 **提示**: 有用的建议

<!-- 链接引用 -->
详见 [API 文档](./api-design.md) 了解更多信息。
```

## 🐛 问题报告

### Bug 报告模板
```markdown
## Bug 描述
简要描述遇到的问题

## 复现步骤
1. 进入页面 '...'
2. 点击按钮 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为
描述您期望发生的情况

## 实际行为
描述实际发生的情况

## 截图
如果适用，添加截图来帮助解释您的问题

## 环境信息
- OS: [例如 iOS]
- 浏览器: [例如 Chrome, Safari]
- 版本: [例如 22]
- 设备: [例如 iPhone6]

## 附加信息
添加任何其他有关问题的信息
```

### 功能请求模板
```markdown
## 功能描述
简要描述您希望添加的功能

## 问题背景
这个功能解决了什么问题？

## 解决方案
描述您希望的解决方案

## 替代方案
描述您考虑过的任何替代解决方案

## 附加信息
添加任何其他信息或截图
```

## 🔍 代码审查

### Pull Request 要求
- **标题**: 清晰描述更改内容
- **描述**: 详细说明更改原因和实现方式
- **测试**: 包含相关测试
- **文档**: 更新相关文档
- **截图**: 如有 UI 更改，提供截图

### PR 模板
```markdown
## 更改类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化
- [ ] 其他

## 更改描述
简要描述此 PR 的更改内容

## 相关 Issue
关闭 #(issue 编号)

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] E2E 测试通过
- [ ] 手动测试完成

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自我审查了代码
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 没有引入新的警告
- [ ] 添加了测试用例
- [ ] 所有测试通过

## 截图 (如适用)
添加截图来展示更改效果
```

### 审查标准
- **功能性**: 代码是否正确实现了预期功能
- **可读性**: 代码是否易于理解和维护
- **性能**: 是否存在性能问题
- **安全性**: 是否存在安全隐患
- **测试**: 测试是否充分和有效

## 🏆 贡献者认可

### 贡献者等级
- **🌟 新手贡献者**: 首次贡献
- **⭐ 活跃贡献者**: 多次贡献
- **🌟 核心贡献者**: 长期活跃贡献
- **👑 维护者**: 项目维护权限

### 奖励机制
- **贡献徽章**: GitHub Profile 展示
- **感谢名单**: 项目文档中的致谢
- **技术分享**: 邀请参与技术分享
- **优先支持**: 优先获得技术支持

## 📞 获取帮助

### 沟通渠道
- **GitHub Issues**: 技术问题和 Bug 报告
- **GitHub Discussions**: 功能讨论和问答
- **微信群**: 实时交流 (扫码加入)
- **邮件**: dev@example.com

### 开发者会议
- **时间**: 每周三晚上 8:00-9:00
- **地点**: 腾讯会议 (会议号: 123-456-789)
- **内容**: 技术讨论、进度同步、问题解答

### 学习资源
- **技术博客**: https://blog.example.com
- **视频教程**: https://video.example.com
- **代码示例**: https://examples.example.com

## 📜 行为准则

### 我们的承诺
为了营造一个开放和友好的环境，我们承诺：
- 尊重所有参与者
- 接受建设性的批评
- 专注于对社区最有利的事情
- 对其他社区成员表示同理心

### 我们的标准
积极行为包括：
- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表示同理心

不当行为包括：
- 使用性化的语言或图像
- 恶意评论或人身攻击
- 公开或私下的骚扰
- 未经许可发布他人的私人信息
- 其他在专业环境中被认为不当的行为

### 执行
项目维护者有权删除、编辑或拒绝不符合行为准则的评论、提交、代码、wiki 编辑、问题和其他贡献。

## 🙏 致谢

感谢所有为项目做出贡献的开发者、设计师、测试人员和用户！

特别感谢：
- **开源社区**: 提供了优秀的工具和库
- **早期用户**: 提供了宝贵的反馈和建议
- **贡献者**: 投入时间和精力改进项目

---

*让我们一起构建更好的教育工具！* 🚀