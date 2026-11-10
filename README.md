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

# 快速提交（跳过 Git hooks）
qygit quickCommitNoVerify "feat: add new feature"
qygit qcn "fix: resolve bug"  # 使用别名
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
- 选择提交类型（feat、fix、docs 等）
- 输入作用域和描述
- 选择是否推送到远程

### 交互式创建 Tag (Interactive Tag)
```bash
# 交互式创建和发布 tag
qygit tag
qygit tg  # 使用别名
```
功能特点：
- 🏷️ **智能版本建议** - 自动解析最新 tag，建议语义化版本号
- 📝 **版本策略** - 支持 Major（破坏性更新）、Minor（新功能）、Patch（Bug 修复）
- 🎨 **Tag 类型** - 支持附注 tag（推荐）和轻量级 tag
- 🚀 **自动推送** - 可选择推送单个或所有 tag 到远程
- ✏️ **自定义版本** - 支持完全自定义的 tag 名称

使用流程：
1. 显示当前最新 tag
2. 选择版本策略（Major/Minor/Patch/自定义）
3. 确认或修改版本号
4. 选择 tag 类型
5. 输入 tag 描述
6. 预览并确认
7. 选择是否推送

示例：
```bash
# 启动交互式 tag 创建
qygit tg

# 假设当前最新 tag 是 v1.2.0
# 选择 Minor -> 建议版本 v1.3.0
# 选择附注 tag -> 输入描述 "Release v1.3.0"
# 确认后自动创建并可选推送到远程
```

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

### 一键合并到目标分支 (mergeTo)
```bash
# 交互式选择目标分支（预设 test / release，置顶展示）
qygit mergeTo
qygit mt  # 使用别名

# 直接指定目标分支
qygit mt test
qygit mt release

# 只本地合并，不推送
qygit mt release --no-push

# 完成后停留在目标分支
qygit mt test --no-back

# 跳过确认直接执行（适合脚本/自动化）
qygit mt test -y
```

执行流程（当前分支记为 a）：
1. 切到目标分支（本地不存在时自动基于 `origin/<目标分支>` 建立跟踪分支）
2. `git pull` 更新目标分支
3. 合并 a 到目标分支
4. 推送目标分支到远程（可用 `--no-push` 关闭）
5. 切回 a 分支（可用 `--no-back` 关闭）

安全设计：
- 🧷 **脏工作区自动 stash** - 检测到未提交改动时自动 `stash -u`，流程结束（含失败）自动恢复
- 🛡️ **同分支保护** - 目标分支与当前分支相同时直接提示，不执行任何操作
- ⚠️ **冲突保留现场** - 合并冲突时停在目标分支、列出冲突文件并给出后续命令，stash 内容保留待手动恢复
- 🔙 **失败自动回退** - 未发生合并的失败场景（如分支不存在）会恢复 stash 并回到原分支

### 同步功能 (Sync)
```bash
# 先 pull 再 push
qygit sync
```

### 获取最新代码 (Get Latest)
```bash
# 从 origin/master 获取并合并最新代码
qygit getLatest
qygit gl  # 使用别名
```

### Cherry-Pick 功能
```bash
# 单个 commit cherry-pick
qygit cherryPick abc123
qygit cp abc123  # 使用别名

# 多个 commit cherry-pick
qygit cp abc123 def456 ghi789

# Commit 区间 cherry-pick
qygit cp abc123..def456          # 不包含起始 commit
qygit cp abc123^..def456         # 包含起始 commit

# 区间并排除特定 commit
qygit cp abc123..def456 -e ghi789,jkl012

# 高级选项
qygit cp abc123 -n               # 不自动 commit，仅应用更改
qygit cp --continue              # 解决冲突后继续
qygit cp --abort                 # 中止当前 cherry-pick
qygit cp --skip                  # 跳过当前 commit
```

功能特点：
- 🍒 **多种方式** - 支持单个、多个、区间 cherry-pick
- 🚫 **排除功能** - 可以从区间中排除特定 commit
- 🔧 **冲突处理** - 提供继续、中止、跳过选项
- 📋 **预览功能** - 显示将要处理的 commit 列表
- ⚡ **批量操作** - 一次处理多个 commit

## 📋 命令列表

| 命令 | 别名 | 描述 |
|------|------|------|
| `quickCommit <message>` | `qc` | 快速添加、提交并推送 |
| `quickCommitNoVerify <message>` | `qcn` | 快速添加、提交（跳过 hooks）并推送 |
| `status` | `st` | 美化的状态显示 |
| `branch [options]` | `br` | 分支管理 |
| `switch <branch>` | `sw` | 切换分支 |
| `mergeTo [target]` | `mt` | 切到目标分支 → 更新 → 合并当前分支 → 推送 → 切回 |
| `log [options]` | `lg` | 美化的提交日志 |
| `commit` | `ci` | 交互式提交 |
| `tag` | `tg` | 交互式创建和发布 tag |
| `stash [options]` | - | Stash 管理 |
| `sync` | - | 同步（pull + push） |
| `sync-all [options]` | - | 智能同步所有分支 |
| `getLatest` | `gl` | 从 origin/master 获取最新代码 |
| `cherryPick [commits...]` | `cp` | 高级 cherry-pick 功能 |

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

### Cherry-Pick 使用场景
```bash
# 场景1: 将特定功能从开发分支移植到主分支
qygit sw main
qygit cp abc123 def456  # 选择性移植两个 commit

# 场景2: 移植一个功能的完整提交区间
qygit cp feature-start^..feature-end

# 场景3: 移植区间但排除某些不需要的 commit
qygit cp abc123..def456 -e bug-commit1,temp-commit2

# 场景4: 遇到冲突时的处理
qygit cp abc123  # 如果有冲突会提示
# 手动解决冲突后
qygit cp --continue  # 继续 cherry-pick
# 或者
qygit cp --abort     # 放弃 cherry-pick
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
---

**让 Git 操作更简单、更直观！** 🎉
