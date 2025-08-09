# 开发环境搭建

本文档将指导你搭建小学数学练习生成器生态系统的本地开发环境。

## 📋 环境要求

### 必需软件
- **Node.js**: >= 18.0.0 (推荐使用 LTS 版本)
- **npm**: >= 9.0.0 (通常随 Node.js 安装)
- **Git**: 最新版本

### 可选软件
- **PostgreSQL**: >= 14 (用于API服务的数据库)
- **Redis**: >= 6.0 (用于缓存，可选)
- **Docker**: 最新版本 (用于容器化部署)

### 开发工具推荐
- **VS Code**: 推荐的代码编辑器
- **微信开发者工具**: 用于小程序开发

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd exams-ecosystem
```

### 2. 安装依赖
```bash
# 安装所有包的依赖
npm install
```

这个命令会自动安装根项目和所有子包的依赖。

### 3. 环境配置

#### 3.1 API服务配置 (可选)
如果需要完整的后端功能，需要配置数据库：

```bash
# 复制环境变量模板
cp packages/api/.env.example packages/api/.env.local

# 编辑环境变量
# packages/api/.env.local
DATABASE_URL="postgresql://username:password@localhost:5432/exams_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret-key"
```

#### 3.2 数据库初始化 (可选)
```bash
# 进入API包目录
cd packages/api

# 生成Prisma客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 填充初始数据 (可选)
npm run db:seed

# 返回根目录
cd ../..
```

### 4. 启动开发服务器

#### 4.1 启动所有服务
```bash
npm run dev
```

这会同时启动：
- Web应用: http://localhost:3000
- API服务: http://localhost:3001 (如果配置了数据库)
- Shared包: 监听模式

#### 4.2 单独启动服务
```bash
# 只启动Web应用
npm run dev:web

# 只启动API服务
npm run dev:api

# 只启动Shared包监听
npm run dev:shared
```

## 🛠️ VS Code 配置

### 推荐扩展
创建 `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### 工作区设置
创建 `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/package-lock.json": true
  }
}
```

### 调试配置
创建 `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Web App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/web/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/packages/web",
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    },
    {
      "name": "Debug API Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/packages/api/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}/packages/api",
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    }
  ]
}
```

## 🔧 开发工作流

### 1. 代码开发
```bash
# 创建新分支
git checkout -b feature/new-feature

# 开发代码...

# 运行代码检查
npm run lint

# 运行类型检查
npm run type-check

# 运行测试
npm run test
```

### 2. 提交代码
```bash
# 添加文件
git add .

# 提交 (会自动运行 pre-commit 钩子)
git commit -m "feat: add new feature"

# 推送到远程
git push origin feature/new-feature
```

### 3. 构建测试
```bash
# 构建所有包
npm run build

# 清理构建文件
npm run clean
```

## 📦 包开发指南

### Shared包开发
```bash
# 进入shared包目录
cd packages/shared

# 监听模式 (自动重新构建)
npm run dev

# 手动构建
npm run build

# 类型检查
npm run type-check
```

### Web应用开发
```bash
# 进入web包目录
cd packages/web

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

### API服务开发
```bash
# 进入api包目录
cd packages/api

# 启动开发服务器
npm run dev

# 数据库操作
npm run db:migrate    # 运行迁移
npm run db:generate   # 生成客户端
npm run db:studio     # 打开数据库管理界面
```

### 小程序开发
```bash
# 进入miniprogram包目录
cd packages/miniprogram

# 编译小程序
npm run build

# 监听模式
npm run watch

# 上传小程序
npm run upload
```

## 🧪 测试环境

### 单元测试
```bash
# 运行所有测试
npm run test

# 运行特定包的测试
npm run test:shared
npm run test:web
npm run test:api

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

### E2E测试
```bash
# 运行端到端测试
npm run test:e2e

# 在浏览器中运行
npm run test:e2e:ui
```

## 🐛 常见问题

### 1. 依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 2. TypeScript类型错误
```bash
# 重新生成类型
npm run type-check

# 重启TypeScript服务器 (VS Code)
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### 3. 端口冲突
```bash
# 查看端口占用
lsof -i :3000
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

### 4. 数据库连接问题
```bash
# 检查PostgreSQL状态
brew services list | grep postgresql

# 启动PostgreSQL
brew services start postgresql

# 检查连接
psql -h localhost -p 5432 -U username -d exams_db
```

## 🔄 更新依赖

### 检查过时依赖
```bash
npm outdated
```

### 更新依赖
```bash
# 更新所有依赖到最新版本
npm update

# 更新特定包
npm install package-name@latest

# 更新开发依赖
npm install --save-dev package-name@latest
```

## 📝 开发提示

1. **使用TypeScript**: 充分利用类型系统，避免运行时错误
2. **代码复用**: 优先使用shared包中的工具和类型
3. **组件化**: 保持组件小而专注，便于测试和维护
4. **性能优化**: 注意包大小和运行时性能
5. **文档更新**: 及时更新相关文档

现在你已经准备好开始开发了！🎉