#!/usr/bin/env node
import { Command } from 'commander';
import { execa } from 'execa';
import chalk from 'chalk';
import inquirer from 'inquirer';

const program = new Command();

program.name('qygit').description('QY 的简单 Git 包装工具').version('0.1.0');
// 快速提交功能
program.command("quickCommit <message>")
    .alias("qc")
    .description("快速添加文件、commit 并 push")
    .action(async (message) => {
        try {
            console.log(chalk.blue('🚀 开始快速 commit...'));
            
        const files = await execa('git', ['add', '.']);
            console.log(chalk.green('✅ 文件已添加'));
            
        const commit = await execa('git', ['commit', '-m', message]);
            console.log(chalk.green('✅ Commit 成功'));
            
        const push = await execa('git', ['push']);
            console.log(chalk.green('✅ 已 push 到远程'));
            
            console.log(chalk.green.bold('🎉 快速 commit 完成！'));
        } catch (error) {
            console.error(chalk.red('❌ 错误:'), error.message);
        }
    });

// 美化的 git status
program.command("status")
    .alias("st")
    .description("美化显示 Git 状态")
    .action(async () => {
        try {
            const result = await execa('git', ['status', '--porcelain']);
            const status = result.stdout;
            
            if (!status) {
                console.log(chalk.green('✨ 工作目录干净'));
                return;
            }
            
            console.log(chalk.blue.bold('📋 仓库状态:'));
            console.log('');
            
            const lines = status.split('\n').filter(line => line.trim());
            
            lines.forEach(line => {
                const statusCode = line.substring(0, 2);
                const fileName = line.substring(3);
                
                let icon = '';
                let color = chalk.white;
                
                if (statusCode.includes('M')) {
                    icon = '📝';
                    color = chalk.yellow;
                } else if (statusCode.includes('A')) {
                    icon = '➕';
                    color = chalk.green;
                } else if (statusCode.includes('D')) {
                    icon = '🗑️';
                    color = chalk.red;
                } else if (statusCode.includes('??')) {
                    icon = '❓';
                    color = chalk.cyan;
                } else if (statusCode.includes('R')) {
                    icon = '🔄';
                    color = chalk.magenta;
                }
                
                console.log(`  ${icon} ${color(fileName)}`);
            });
        } catch (error) {
            console.error(chalk.red('❌ 获取状态错误:'), error.message);
        }
    });

// 分支管理
program.command("branch")
    .alias("br")
    .description("分支管理")
    .option('-c, --create <name>', '创建新分支')
    .option('-d, --delete <name>', '删除分支')
    .option('-l, --list', '列出所有分支')
    .action(async (options) => {
        try {
            if (options.create) {
                await execa('git', ['checkout', '-b', options.create]);
                console.log(chalk.green(`✅ 已创建并切换到分支: ${options.create}`));
            } else if (options.delete) {
                await execa('git', ['branch', '-d', options.delete]);
                console.log(chalk.green(`✅ 已删除分支: ${options.delete}`));
            } else if (options.list || Object.keys(options).length === 0) {
                const result = await execa('git', ['branch', '-a']);
                console.log(chalk.blue.bold('🌿 分支列表:'));
                console.log(result.stdout.replace(/\*/g, chalk.green('*')));
            }
        } catch (error) {
            console.error(chalk.red('❌ 分支操作失败:'), error.message);
        }
    });

// 切换分支
program.command("switch <branch>")
    .alias("sw")
    .description("切换分支")
    .action(async (branch) => {
        try {
            await execa('git', ['checkout', branch]);
            console.log(chalk.green(`✅ 已切换到分支: ${branch}`));
        } catch (error) {
            console.error(chalk.red('❌ 切换分支失败:'), error.message);
        }
    });

// 美化的 git log
program.command("log")
    .alias("lg")
    .description("美化显示 Git 日志")
    .option('-n, --number <count>', '显示的 commit 数量', '10')
    .action(async (options) => {
        try {
            const result = await execa('git', ['log', '--oneline', '--graph', '--decorate', '--color=always', `-${options.number}`]);
            console.log(chalk.blue.bold('📜 最近的 Commit:'));
            console.log('');
            console.log(result.stdout);
        } catch (error) {
            console.error(chalk.red('❌ 获取日志错误:'), error.message);
        }
    });

// 交互式提交
program.command("commit")
    .alias("ci")
    .description("交互式 commit，支持文件选择和规范化格式")
    .action(async () => {
        try {
            // 获取状态
            const statusResult = await execa('git', ['status', '--porcelain']);
            const files = statusResult.stdout.split('\n').filter(line => line.trim());
            
            if (files.length === 0) {
                console.log(chalk.yellow('⚠️  没有需要 commit 的更改'));
                return;
            }
            
            console.log(chalk.blue.bold('📝 交互式 Commit'));
            console.log('');
            
            // 选择要提交的文件
            const fileChoices = files.map(line => {
                const statusCode = line.substring(0, 2);
                const fileName = line.substring(3);
                
                let icon = '';
                if (statusCode.includes('M')) {
                    icon = '📝';
                } else if (statusCode.includes('A')) {
                    icon = '➕';
                } else if (statusCode.includes('D')) {
                    icon = '🗑️';
                } else if (statusCode.includes('??')) {
                    icon = '❓';
                } else if (statusCode.includes('R')) {
                    icon = '🔄';
                }
                
                return {
                    name: `${icon} ${fileName}`,
                    value: fileName,
                    checked: true
                };
            });
            
            const { selectedFiles } = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'selectedFiles',
                    message: '选择要 commit 的文件:',
                    choices: fileChoices,
                    pageSize: 15
                }
            ]);
            
            if (selectedFiles.length === 0) {
                console.log(chalk.yellow('⚠️  未选择文件'));
                return;
            }
            
            // 添加选中的文件
            for (const file of selectedFiles) {
                await execa('git', ['add', file]);
            }
            
            // 选择提交类型
            const commitTypes = [
                {
                    name: '✨ feat:     新功能或特性',
                    value: 'feat',
                    short: 'feat'
                },
                {
                    name: '🐛 fix:      修复 bug',
                    value: 'fix',
                    short: 'fix'
                },
                {
                    name: '📚 docs:     修改文档',
                    value: 'docs',
                    short: 'docs'
                },
                {
                    name: '💎 style:    调整代码格式（不影响逻辑）',
                    value: 'style',
                    short: 'style'
                },
                {
                    name: '♻️  refactor: 代码重构（不新增功能或修复 bug）',
                    value: 'refactor',
                    short: 'refactor'
                },
                {
                    name: '🧪 test:     添加或修改测试',
                    value: 'test',
                    short: 'test'
                },
                {
                    name: '🔧 chore:    杂项（依赖更新、配置调整等）',
                    value: 'chore',
                    short: 'chore'
                },
                {
                    name: '⚡ perf:     性能优化',
                    value: 'perf',
                    short: 'perf'
                },
                {
                    name: '👷 ci:       持续集成相关更改',
                    value: 'ci',
                    short: 'ci'
                },
                {
                    name: '⏪ revert:   回退之前的提交',
                    value: 'revert',
                    short: 'revert'
                }
            ];
            
            const { commitType } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'commitType',
                    message: '选择变更类型:',
                    choices: commitTypes,
                    pageSize: 10
                }
            ]);
            
            // 输入作用域（可选）
            const { scope } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'scope',
                    message: '输入作用域 (可选，例如: auth, ui, api):',
                    validate: (input) => {
                        if (input && !/^[a-z0-9-]+$/.test(input)) {
                            return '作用域只能包含小写字母、数字和连字符';
                        }
                        return true;
                    }
                }
            ]);
            
            // 输入简短描述
            const { description } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'description',
                    message: '输入简短描述:',
                    validate: (input) => {
                        if (!input.trim()) {
                            return '描述不能为空';
                        }
                        if (input.length > 50) {
                            return '描述应在50个字符以内';
                        }
                        if (input.endsWith('.')) {
                            return '描述不应以句号结尾';
                        }
                        return true;
                    }
                }
            ]);
            
            // 输入详细描述（可选）
            const { body } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'body',
                    message: '输入详细描述 (可选):'
                }
            ]);
            
            // 输入破坏性变更（可选）
            const { breakingChange } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'breakingChange',
                    message: '输入破坏性变更描述 (可选):'
                }
            ]);
            
            // 构建提交信息
            let commitMessage = commitType;
            if (scope) {
                commitMessage += `(${scope})`;
            }
            commitMessage += `: ${description}`;
            
            if (body) {
                commitMessage += `\n\n${body}`;
            }
            
            if (breakingChange) {
                commitMessage += `\n\nBREAKING CHANGE: ${breakingChange}`;
            }
            
            // 显示最终的提交信息
            console.log('');
            console.log(chalk.blue.bold('📋 Commit 信息预览:'));
            console.log(chalk.gray('─'.repeat(50)));
            console.log(commitMessage);
            console.log(chalk.gray('─'.repeat(50)));
            console.log('');
            
            // 确认提交
            const { confirmCommit } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmCommit',
                    message: '确认执行此 commit?',
                    default: true
                }
            ]);
            
            if (!confirmCommit) {
                console.log(chalk.yellow('⚠️  Commit 已取消'));
                return;
            }
            
            // 提交
            await execa('git', ['commit', '-m', commitMessage]);
            console.log(chalk.green('✅ Commit 成功！'));
            
            // 询问是否推送
            const { shouldPush } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'shouldPush',
                    message: '是否 push 到远程?',
                    default: true
                }
            ]);
            
            if (shouldPush) {
                await execa('git', ['push']);
                console.log(chalk.green('✅ 已 push 到远程！'));
            }
            
        } catch (error) {
            console.error(chalk.red('❌ Commit 失败:'), error.message);
        }
    });

// Stash 管理
program.command("stash")
    .description("Stash 管理")
    .option('-s, --save [message]', '保存当前更改到 stash')
    .option('-p, --pop', '应用并删除最新的 stash')
    .option('-l, --list', '列出所有 stash')
    .option('-c, --clear', '清空所有 stash')
    .action(async (options) => {
        try {
            if (options.save !== undefined) {
                const message = options.save || 'WIP';
                await execa('git', ['stash', 'save', message]);
                console.log(chalk.green(`✅ 已保存更改到 stash: ${message}`));
            } else if (options.pop) {
                await execa('git', ['stash', 'pop']);
                console.log(chalk.green('✅ 已应用并删除最新的 stash'));
            } else if (options.clear) {
                await execa('git', ['stash', 'clear']);
                console.log(chalk.green('✅ 已清空所有 stash'));
            } else if (options.list || Object.keys(options).length === 0) {
                const result = await execa('git', ['stash', 'list']);
                if (result.stdout) {
                    console.log(chalk.blue.bold('📦 Stash 列表:'));
                    console.log(result.stdout);
                } else {
                    console.log(chalk.yellow('📦 未找到 stash'));
                }
            }
        } catch (error) {
            console.error(chalk.red('❌ Stash 操作失败:'), error.message);
        }
    });

// 同步功能 (pull + push)
program.command("sync")
    .description("与远程同步 (先 pull 后 push)")
    .action(async () => {
        try {
            console.log(chalk.blue('🔄 正在与远程同步...'));
            
            // Pull first
            const pullResult = await execa('git', ['pull']);
            console.log(chalk.green('✅ 已从远程 pull'));
            
            // Then push
            const pushResult = await execa('git', ['push']);
            console.log(chalk.green('✅ 已 push 到远程'));
            
            console.log(chalk.green.bold('🎉 同步完成！'));
        } catch (error) {
            console.error(chalk.red('❌ 同步失败:'), error.message);
        }
    });

program.command("getLatest")
    .description("从 origin/master 获取并 merge")
    .action(async () => {
        try {
            await execa('git', ['pull']);
            console.log(chalk.green('✅ 已 pull'));
            await execa('git', ['merge', 'origin/master']);
            console.log(chalk.green('✅ 已从 origin/master merge'));
    } catch (error) {
            console.error(chalk.red('❌ Pull 失败:'), error.message);
            console.error(chalk.red('❌ Merge 失败:'), error.message);
        }
    });
// 显示帮助信息
program.on('--help', () => {
    console.log('');
    console.log(chalk.blue.bold('🛠️  QYGit - 增强的 Git 包装工具'));
    console.log('');
    console.log('使用示例:');
    console.log('  $ qygit qc "feat: add new feature"    # 快速 commit');
    console.log('  $ qygit st                            # 美化状态显示');
    console.log('  $ qygit br -c feature/new             # 创建分支');
    console.log('  $ qygit sw main                       # 切换分支');
    console.log('  $ qygit ci                            # 交互式 commit');
    console.log('  $ qygit sync                          # Pull 和 push');
    console.log('  $ qygit getLatest                     # 从 origin/master 获取最新代码');
    console.log('');
});

program.parse();