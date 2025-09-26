# 🛠️ QYGit - Enhanced Git Wrapper

一个简单而强大的 Git 命令行包装工具，让 Git 操作更加直观和高效。

## ✨ 特性

- 🎨 **美化输出** - 彩色图标和清晰的状态显示
- 🚀 **快速操作** - 简化常用 Git 命令
- 🔄 **交互式界面** - 友好的用户交互体验
- 📦 **别名支持** - 每个命令都有简短别名
- 🛡️ **错误处理** - 完善的错误提示和处理
- 📋 **进度提示** - 清晰的操作进度反馈

## 📦 安装

### 全局安装
```bash
npm install -g qygit
```

### 本地开发
```bash
git clone <repository-url>
cd qygit
npm install
npm link
```

## 🚀 使用方法

### 快速提交 (Quick Commit)
```bash
# 添加所有文件、提交并推送
qygit quickCommit "feat: add new feature"
qygit qc "fix: resolve bug"  # 使用别名
```

### 状态查看 (Status)
```bash
# 美化的 git status
qygit status
qygit st  # 使用别名
```
显示效果：
```
📋 Repository Status:

  📝 src/index.js
  ➕ README.md
  🗑️ old-file.txt
  ❓ new-file.js
```

### 分支管理 (Branch Management)
```bash
# 列出所有分支
qygit branch
qygit br  # 使用别名

# 创建新分支
qygit br -c feature/new-feature

# 删除分支
qygit br -d old-branch

# 列出所有分支（包括远程）
qygit br -l
```

### 分支切换 (Switch Branch)
```bash
# 切换到指定分支
qygit switch main
qygit sw develop  # 使用别名
```

### 提交日志 (Log)
```bash
# 显示最近 10 条提交记录
qygit log
qygit lg  # 使用别名

# 显示指定数量的提交记录
qygit lg -n 20
```

### 交互式提交 (Interactive Commit)
```bash
# 交互式选择文件并提交
qygit commit
qygit ci  # 使用别名
```
功能包括：
- 选择要提交的文件
- 输入提交信息
- 选择是否推送到远程

### Stash 管理
```bash
# 保存当前更改到 stash
qygit stash -s "work in progress"
qygit stash -s  # 使用默认消息 "WIP"

# 应用并删除最新的 stash
qygit stash -p

# 列出所有 stash
qygit stash -l
qygit stash  # 默认列出

# 清空所有 stash
qygit stash -c
```

### 同步功能 (Sync)
```bash
# 先 pull 再 push
qygit sync
```

### 获取最新代码 (Get Latest)
```bash
# 从 origin/master 获取并合并最新代码
qygit getLatest
```

## 📋 命令列表

| 命令 | 别名 | 描述 |
|------|------|------|
| `quickCommit <message>` | `qc` | 快速添加、提交并推送 |
| `status` | `st` | 美化的状态显示 |
| `branch [options]` | `br` | 分支管理 |
| `switch <branch>` | `sw` | 切换分支 |
| `log [options]` | `lg` | 美化的提交日志 |
| `commit` | `ci` | 交互式提交 |
| `stash [options]` | - | Stash 管理 |
| `sync` | - | 同步（pull + push） |
| `getLatest` | - | 从 origin/master 获取最新代码 |

## 🎯 使用示例

### 日常开发流程
```bash
# 1. 查看当前状态
qygit st

# 2. 创建新功能分支
qygit br -c feature/user-login

# 3. 开发完成后交互式提交
qygit ci

# 4. 切换回主分支
qygit sw main

# 5. 获取最新代码
qygit getLatest

# 6. 合并功能分支（手动操作）
git merge feature/user-login

# 7. 推送到远程
qygit sync
```

### 快速修复流程
```bash
# 1. 保存当前工作
qygit stash -s "current work"

# 2. 切换到主分支
qygit sw main

# 3. 获取最新代码
qygit getLatest

# 4. 创建修复分支
qygit br -c hotfix/critical-bug

# 5. 修复完成后快速提交
qygit qc "fix: resolve critical bug"

# 6. 恢复之前的工作
qygit stash -p
```

## 🔧 技术栈

- **Node.js** - 运行环境
- **Commander.js** - 命令行参数解析
- **Execa** - 进程执行
- **Chalk** - 终端颜色输出
- **Inquirer.js** - 交互式命令行界面

## 📁 项目结构

```
qygit/
├── index.js          # 主程序文件
├── package.json       # 项目配置
├── README.md          # 项目文档
├── .gitignore         # Git 忽略文件
└── node_modules/      # 依赖包
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 如何查看所有可用命令？
A: 运行 `qygit --help` 或 `qygit -h`

### Q: 命令执行失败怎么办？
A: 检查是否在 Git 仓库目录中，确保有正确的 Git 配置

### Q: 如何卸载？
A: 运行 `npm uninstall -g qygit`

### Q: 支持哪些操作系统？
A: 支持 Windows、macOS 和 Linux

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件到 [your-email@example.com]

---

**让 Git 操作更简单、更直观！** 🎉
