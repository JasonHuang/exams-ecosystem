# 小学数学练习生成器生态系统

一个完整的小学数学练习生成解决方案，包含Web应用、微信小程序和API服务。

## 🏗️ 项目架构

本项目采用 **Monorepo** 架构，使用 npm workspaces 管理多个子项目：

```
exams-ecosystem/
├── packages/
│   ├── shared/          # 共享代码包（类型、工具、生成器）
│   ├── web/            # Web应用（Next.js）
│   ├── api/            # API服务端（Next.js API Routes）
│   └── miniprogram/    # 微信小程序
├── docs/               # 项目文档
├── scripts/            # 构建和部署脚本
└── package.json        # 根项目配置
```

## 📦 子项目说明

### 🔧 Shared Package (`@exams/shared`)
- **功能**: 共享的类型定义、工具函数、题目生成器
- **技术**: TypeScript
- **用途**: 被其他所有子项目引用，确保代码复用和类型一致性

### 🌐 Web Application (`@exams/web`)
- **功能**: 基于浏览器的数学练习生成器
- **技术**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **特色**: 响应式设计、打印功能、实时预览

### 🚀 API Service (`@exams/api`)
- **功能**: 后端API服务，支持用户管理、数据存储、练习记录
- **技术**: Next.js API Routes, Prisma, PostgreSQL, Redis
- **端口**: 3001

### 📱 Mini Program (`@exams/miniprogram`)
- **功能**: 微信小程序版本
- **技术**: 微信小程序原生开发 + TypeScript
- **特色**: 移动端优化、微信生态集成

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14 (用于API服务)
- Redis >= 6.0 (用于缓存，可选)

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd exams-ecosystem

# 安装所有依赖
npm install
```

### 开发模式
```bash
# 启动所有服务
npm run dev

# 或者单独启动某个服务
npm run dev:web        # Web应用 (http://localhost:3000)
npm run dev:api        # API服务 (http://localhost:3001)
npm run dev:shared     # Shared包监听模式
```

### 构建项目
```bash
# 构建所有项目
npm run build

# 构建特定项目
npm run build:web
npm run build:api
npm run build:shared
```

## 🛠️ 开发指南

### 代码结构
- **Shared**: 所有共享代码，包括类型定义、工具函数、题目生成逻辑
- **Web**: 前端界面和用户交互
- **API**: 后端服务和数据管理
- **MiniProgram**: 微信小程序特定代码

### 开发流程
1. 在 `shared` 包中定义类型和共享逻辑
2. 在 `api` 包中实现后端接口
3. 在 `web` 和 `miniprogram` 包中实现前端界面
4. 使用 TypeScript 确保类型安全

### 添加新功能
1. 在 `shared/src/types` 中定义相关类型
2. 在 `shared/src/generators` 中实现题目生成逻辑
3. 在 `api/src/app/api` 中添加API端点
4. 在前端项目中实现用户界面

## 📚 文档

- [项目规划文档](./docs/)
- [API文档](./packages/api/README.md)
- [Web应用文档](./packages/web/README.md)
- [小程序文档](./packages/miniprogram/README.md)
- [开发指南](./docs/开发指南.md)

## 🎯 功能特色

### 已实现功能
- ✅ 四则运算题目生成
- ✅ 年级分类（1-6年级）
- ✅ 难度调节（简单/中等/困难）
- ✅ 批量生成和打印
- ✅ TypeScript 类型安全

### 规划功能
- 🔄 分数和小数运算
- 🔄 几何图形计算
- 🔄 应用题生成
- 🔄 用户系统和进度跟踪
- 🔄 智能推荐和自适应难度
- 🔄 多端数据同步

## 🧪 测试

```bash
# 运行所有测试
npm run test

# 运行特定包的测试
npm run test:shared
npm run test:web
npm run test:api
```

## 📋 脚本命令

```bash
# 开发
npm run dev              # 启动所有服务
npm run dev:web          # 启动Web应用
npm run dev:api          # 启动API服务
npm run dev:shared       # 启动Shared包监听

# 构建
npm run build            # 构建所有项目
npm run build:web        # 构建Web应用
npm run build:api        # 构建API服务
npm run build:shared     # 构建Shared包

# 工具
npm run lint             # 代码检查
npm run type-check       # 类型检查
npm run clean            # 清理构建文件
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🎯 项目愿景

打造一个**全面覆盖**、**智能适配**、**使用便捷**、**效果显著**且**持续改进**的专业小学数学学习辅助工具，帮助学生提高数学能力，减轻教师和家长的负担。