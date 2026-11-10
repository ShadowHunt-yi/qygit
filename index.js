#!/usr/bin/env node
import { Command } from 'commander';
import { execa } from 'execa';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import inquirer from 'inquirer';

const program = new Command();

program.name('qygit').description('QY 的简单 Git 包装工具').version('1.5.0');
// 快速提交功能
program.command("quickCommit <message>")
    .alias("qc")
    .description("快速添加文件、commit 并 push")
    .action(async (message) => {
        try {
            console.log(chalk.blue('🚀 开始快速 commit...'));

            // 检查暂存区
            const stagedFiles = await execa('git', ['diff', '--cached', '--name-only']);

            if (stagedFiles.stdout.trim()) {
                console.log(chalk.cyan('📋 使用暂存区已有文件'));
            } else {
                await execa('git', ['add', '.']);
                console.log(chalk.green('✅ 文件已添加'));
            }

            await execa('git', ['commit', '-m', message]);
            console.log(chalk.green('✅ Commit 成功'));

            await execa('git', ['push']);
            console.log(chalk.green('✅ 已 push 到远程'));

            console.log(chalk.green.bold('🎉 快速 commit 完成！'));
        } catch (error) {
            console.error(chalk.red('❌ 错误:'), error.message);
        }
    });

// 快速提交功能（跳过 hooks）
program.command("quickCommitNoVerify <message>")
    .alias("qcn")
    .description("快速添加文件、commit（跳过 hooks）并 push")
    .action(async (message) => {
        try {
            console.log(chalk.blue('🚀 开始快速 commit（跳过 hooks）...'));

            // 检查暂存区
            const stagedFiles = await execa('git', ['diff', '--cached', '--name-only']);

            if (stagedFiles.stdout.trim()) {
                console.log(chalk.cyan('📋 使用暂存区已有文件'));
            } else {
                await execa('git', ['add', '.']);
                console.log(chalk.green('✅ 文件已添加'));
            }

            await execa('git', ['commit', '-m', message, '-n']);
            console.log(chalk.green('✅ Commit 成功（已跳过 hooks）'));

            await execa('git', ['push']);
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

// 交互式创建 Tag
program.command("tag")
    .alias("tg")
    .description("交互式创建和发布 tag")
    .action(async () => {
        try {
            console.log(chalk.blue.bold('🏷️  交互式创建 Tag'));
            console.log('');

            // 获取最新的 tag
            let latestTag = '';
            try {
                const tagResult = await execa('git', ['describe', '--tags', '--abbrev=0']);
                latestTag = tagResult.stdout.trim();
                console.log(chalk.gray(`最新 tag: ${latestTag}`));
                console.log('');
            } catch (error) {
                console.log(chalk.gray('当前没有 tag'));
                console.log('');
            }

            // 解析版本号用于语义化版本建议
            let suggestedVersions = {
                major: 'v1.0.0',
                minor: 'v0.1.0',
                patch: 'v0.0.1'
            };

            if (latestTag) {
                const versionMatch = latestTag.match(/^v?(\d+)\.(\d+)\.(\d+)/);
                if (versionMatch) {
                    const [, major, minor, patch] = versionMatch;
                    const hasV = latestTag.startsWith('v');
                    const prefix = hasV ? 'v' : '';
                    suggestedVersions = {
                        major: `${prefix}${parseInt(major) + 1}.0.0`,
                        minor: `${prefix}${major}.${parseInt(minor) + 1}.0`,
                        patch: `${prefix}${major}.${minor}.${parseInt(patch) + 1}`
                    };
                }
            }

            // 选择版本策略
            const { versionStrategy } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'versionStrategy',
                    message: '选择版本策略:',
                    choices: [
                        {
                            name: `🔼 Major (破坏性更新) - ${suggestedVersions.major}`,
                            value: 'major',
                            short: 'Major'
                        },
                        {
                            name: `⬆️  Minor (新功能) - ${suggestedVersions.minor}`,
                            value: 'minor',
                            short: 'Minor'
                        },
                        {
                            name: `🔧 Patch (Bug 修复) - ${suggestedVersions.patch}`,
                            value: 'patch',
                            short: 'Patch'
                        },
                        {
                            name: '✏️  自定义版本号',
                            value: 'custom',
                            short: 'Custom'
                        }
                    ]
                }
            ]);

            // 输入 tag 名称
            let tagName = '';
            if (versionStrategy === 'custom') {
                const { customTag } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'customTag',
                        message: '输入 tag 名称:',
                        validate: (input) => {
                            if (!input.trim()) {
                                return 'Tag 名称不能为空';
                            }
                            return true;
                        }
                    }
                ]);
                tagName = customTag;
            } else {
                tagName = suggestedVersions[versionStrategy];

                // 允许用户修改建议的版本号
                const { confirmTag } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmTag',
                        message: `使用建议的版本号 ${chalk.cyan(tagName)}?`,
                        default: true
                    }
                ]);

                if (!confirmTag) {
                    const { customTag } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'customTag',
                            message: '输入自定义 tag 名称:',
                            default: tagName,
                            validate: (input) => {
                                if (!input.trim()) {
                                    return 'Tag 名称不能为空';
                                }
                                return true;
                            }
                        }
                    ]);
                    tagName = customTag;
                }
            }

            // 选择 tag 类型
            const { tagType } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'tagType',
                    message: '选择 tag 类型:',
                    choices: [
                        {
                            name: '📝 附注 tag (推荐，包含完整信息)',
                            value: 'annotated',
                            short: 'Annotated'
                        },
                        {
                            name: '🏷️  轻量级 tag (仅标记)',
                            value: 'lightweight',
                            short: 'Lightweight'
                        }
                    ],
                    default: 'annotated'
                }
            ]);

            let tagMessage = '';
            if (tagType === 'annotated') {
                // 输入 tag 消息
                const { message } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'message',
                        message: '输入 tag 描述:',
                        default: `Release ${tagName}`,
                        validate: (input) => {
                            if (!input.trim()) {
                                return 'Tag 描述不能为空';
                            }
                            return true;
                        }
                    }
                ]);
                tagMessage = message;
            }

            // 显示预览
            console.log('');
            console.log(chalk.blue.bold('📋 Tag 信息预览:'));
            console.log(chalk.gray('─'.repeat(50)));
            console.log(chalk.cyan(`Tag 名称: ${tagName}`));
            console.log(chalk.cyan(`Tag 类型: ${tagType === 'annotated' ? '附注 tag' : '轻量级 tag'}`));
            if (tagMessage) {
                console.log(chalk.cyan(`Tag 描述: ${tagMessage}`));
            }
            console.log(chalk.gray('─'.repeat(50)));
            console.log('');

            // 确认创建
            const { confirmCreate } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirmCreate',
                    message: '确认创建此 tag?',
                    default: true
                }
            ]);

            if (!confirmCreate) {
                console.log(chalk.yellow('⚠️  Tag 创建已取消'));
                return;
            }

            // 创建 tag
            if (tagType === 'annotated') {
                await execa('git', ['tag', '-a', tagName, '-m', tagMessage]);
            } else {
                await execa('git', ['tag', tagName]);
            }
            console.log(chalk.green(`✅ Tag ${tagName} 创建成功！`));

            // 询问是否推送到远程
            const { shouldPush } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'shouldPush',
                    message: '是否推送 tag 到远程?',
                    default: true
                }
            ]);

            if (shouldPush) {
                await execa('git', ['push', 'origin', tagName]);
                console.log(chalk.green(`✅ Tag ${tagName} 已推送到远程！`));

                // 询问是否推送所有 tags
                const { pushAllTags } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'pushAllTags',
                        message: '是否同时推送所有本地 tag?',
                        default: false
                    }
                ]);

                if (pushAllTags) {
                    await execa('git', ['push', '--tags']);
                    console.log(chalk.green('✅ 所有 tag 已推送到远程！'));
                }
            }

            console.log(chalk.green.bold('🎉 操作完成！'));

        } catch (error) {
            console.error(chalk.red('❌ Tag 操作失败:'), error.message);
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
    program.command("sync-all")
    .description("智能同步所有分支（可选择跳过某些分支）")
    .option('-s, --skip <branches>', '跳过指定分支（逗号分隔）')
    .option('-o, --only <branches>', '只同步指定分支（逗号分隔）')
    .option('-f, --force', '强制推送（使用 --force-with-lease）')
    .action(async (options) => {
        try {
            console.log(chalk.blue('🔄 智能同步全部分支...'));
            
            // 获取当前分支
            const currentBranch = (await execa('git', ['branch', '--show-current'])).stdout.trim();
            
            // 获取所有本地分支
            const branchesOutput = await execa('git', ['branch', '--format=%(refname:short)']);
            let localBranches = branchesOutput.stdout.split('\n').filter(b => b);
            
            // 应用过滤选项
            if (options.skip) {
                const skipList = options.skip.split(',').map(b => b.trim());
                localBranches = localBranches.filter(b => !skipList.includes(b));
            }
            
            if (options.only) {
                const onlyList = options.only.split(',').map(b => b.trim());
                localBranches = localBranches.filter(b => onlyList.includes(b));
            }
            
            console.log(chalk.cyan(`将同步 ${localBranches.length} 个分支`));
            
            // 创建进度条
            const progressBar = new cliProgress.SingleBar({
                format: '同步进度 |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total} 分支',
                barCompleteChar: '█',
                barIncompleteChar: '░',
                hideCursor: true
            });
            
            progressBar.start(localBranches.length, 0);
            
            const results = {
                success: [],
                failed: [],
                skipped: []
            };
            
            // 同步每个分支
            for (let i = 0; i < localBranches.length; i++) {
                const branch = localBranches[i];
                progressBar.update(i, { branch });
                
                try {
                    // 跳过当前分支（主循环处理）
                    if (branch === currentBranch) {
                        results.skipped.push({ branch, reason: '当前分支' });
                        continue;
                    }
                    
                    // 检查是否有未提交的修改
                    const status = await execa('git', ['status', '--porcelain'], { cwd: process.cwd() });
                    if (status.stdout.trim()) {
                        results.skipped.push({ branch, reason: '有未提交的修改' });
                        continue;
                    }
                    
                    // 切换到分支
                    await execa('git', ['checkout', branch]);
                    
                    // 尝试 pull
                    try {
                        await execa('git', ['pull', 'origin', branch]);
                    } catch (pullError) {
                        // 如果远程分支不存在，跳过 pull
                        if (!pullError.message.includes('Couldn\'t find remote ref')) {
                            throw pullError;
                        }
                    }
                    
                    // push
                    const pushArgs = options.force 
                        ? ['push', 'origin', branch, '--force-with-lease']
                        : ['push', 'origin', branch];
                    
                    await execa('git', pushArgs);
                    
                    results.success.push(branch);
                    
                } catch (error) {
                    results.failed.push({
                        branch,
                        error: error.message
                    });
                }
            }
            
            // 切回原始分支
            await execa('git', ['checkout', currentBranch]);
            
            progressBar.stop();
            
            // 显示详细结果
            console.log(chalk.cyan('\n' + '='.repeat(50)));
            console.log(chalk.bold('📊 同步结果详情:'));
            
            if (results.success.length > 0) {
                console.log(chalk.green('\n✅ 成功同步的分支:'));
                results.success.forEach(b => console.log(`  ${b}`));
            }
            
            if (results.skipped.length > 0) {
                console.log(chalk.yellow('\n⏭️  跳过的分支:'));
                results.skipped.forEach(({ branch, reason }) => 
                    console.log(`  ${branch} (${reason})`)
                );
            }
            
            if (results.failed.length > 0) {
                console.log(chalk.red('\n❌ 失败的分支:'));
                results.failed.forEach(({ branch, error }) => 
                    console.log(`  ${branch}: ${error}`)
                );
            }
            
            console.log(chalk.cyan('\n' + '='.repeat(50)));
            console.log(chalk.bold(`总计: ${localBranches.length} 分支 | 成功: ${results.success.length} | 跳过: ${results.skipped.length} | 失败: ${results.failed.length}`));
            
        } catch (error) {
            console.error(chalk.red('❌ 同步过程出错:'), error.message);
            process.exit(1);
        }
    });
program.command("getLatest").alias("gl")
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

// ============ mergeTo：切到目标分支 → 更新 → 合并当前分支 → 推送 → 切回 ============
const MERGE_TARGET_PRESETS = ['test', 'release'];

// 收集可选分支：本地分支 + 远程独有分支（用于给出候选）
async function collectBranchCandidates() {
    const local = (await execa('git', ['branch', '--format=%(refname:short)'])).stdout
        .split('\n').map(s => s.trim()).filter(Boolean);
    let remote = [];
    try {
        remote = (await execa('git', ['branch', '-r', '--format=%(refname:short)'])).stdout
            .split('\n').map(s => s.trim()).filter(Boolean)
            .filter(b => b.startsWith('origin/') && !b.endsWith('/HEAD'))
            .map(b => b.slice('origin/'.length));
    } catch {
        // 无远程仓库时忽略
    }
    return { local, remote };
}

// 判断仓库是否处于合并中状态（冲突、pull 产生的合并冲突等）
async function isMerging() {
    try {
        await execa('git', ['rev-parse', '-q', '--verify', 'MERGE_HEAD']);
        return true;
    } catch {
        return false;
    }
}

program.command("mergeTo [target]")
    .alias("mt")
    .description("切到目标分支（默认 test/release）→ 更新该分支 → 合并当前分支 → 推送 → 切回")
    .option('--no-push', '合并后不推送目标分支到远程')
    .option('--no-back', '完成后不切回原分支')
    .option('-y, --yes', '跳过确认，直接执行')
    .action(async (target, options) => {
        const shouldPush = options.push !== false;
        const shouldBack = options.back !== false;
        let originalBranch = '';
        let stashed = false;
        let merged = false;
        let leftOriginal = false;

        try {
            // 0. 前置检查：必须是 Git 仓库
            try {
                await execa('git', ['rev-parse', '--git-dir']);
            } catch {
                console.log(chalk.red('❌ 当前目录不是 Git 仓库'));
                process.exitCode = 1;
                return;
            }

            // 1. 当前分支即“源分支 a”
            originalBranch = (await execa('git', ['branch', '--show-current'])).stdout.trim();
            if (!originalBranch) {
                console.log(chalk.red('❌ 当前处于 detached HEAD 状态，请先切换到一个分支'));
                process.exitCode = 1;
                return;
            }

            // 2. 确定目标分支：优先命令行参数，否则交互选择（默认 test / release）
            if (!target) {
                const { local, remote } = await collectBranchCandidates();
                const all = [...local, ...remote.filter(b => !local.includes(b))]
                    .filter(b => b !== originalBranch);

                const presetHits = MERGE_TARGET_PRESETS.filter(b => all.includes(b));
                const others = all.filter(b => !presetHits.includes(b)).sort();

                const choices = [
                    ...presetHits.map(b => ({
                        name: `${local.includes(b) ? '🌿' : '☁️ '} ${b}`,
                        value: b,
                        short: b
                    })),
                    new inquirer.Separator('── 其他分支 ──'),
                    ...others.map(b => ({
                        name: `${local.includes(b) ? '🌿' : '☁️ '} ${b}`,
                        value: b,
                        short: b
                    })),
                    new inquirer.Separator('── 自定义 ──'),
                    { name: '✏️  手动输入分支名', value: '__custom__', short: '自定义' }
                ];

                const { picked } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'picked',
                        message: `把 ${chalk.cyan(originalBranch)} 合并到哪个分支?`,
                        choices,
                        default: presetHits[0],
                        pageSize: 15
                    }
                ]);

                if (picked === '__custom__') {
                    const { custom } = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'custom',
                            message: '输入目标分支名:',
                            validate: (input) => {
                                const name = input.trim();
                                if (!name) return '分支名不能为空';
                                if (name === originalBranch) return '目标分支不能与当前分支相同';
                                if (/\s/.test(name)) return '分支名不能包含空格';
                                return true;
                            }
                        }
                    ]);
                    target = custom.trim();
                } else {
                    target = picked;
                }
            }

            target = target.trim();
            if (target === originalBranch) {
                console.log(chalk.yellow(`⚠️  目标分支与当前分支相同（${target}），无需合并`));
                return;
            }

            // 3. 预览并确认
            console.log('');
            console.log(chalk.blue.bold('📋 mergeTo 执行计划:'));
            console.log(chalk.gray('─'.repeat(50)));
            console.log(`  源分支   : ${chalk.cyan(originalBranch)}`);
            console.log(`  目标分支 : ${chalk.cyan(target)}`);
            console.log(chalk.gray('  步骤: checkout → pull → merge → '
                + (shouldPush ? 'push → ' : '') + (shouldBack ? `切回 ${originalBranch}` : '停留目标分支')));
            console.log(chalk.gray('─'.repeat(50)));
            console.log('');

            if (!options.yes) {
                const { confirmed } = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirmed',
                        message: '确认执行?',
                        default: true
                    }
                ]);
                if (!confirmed) {
                    console.log(chalk.yellow('⚠️  已取消'));
                    return;
                }
            }

            // 4. 脏工作区自动 stash
            const dirty = (await execa('git', ['status', '--porcelain'])).stdout.trim();
            if (dirty) {
                console.log(chalk.yellow('📦 检测到未提交的修改，自动 stash...'));
                await execa('git', ['stash', 'push', '-u', '-m', `qygit-mergeTo(${originalBranch}→${target})`]);
                stashed = true;
                console.log(chalk.green('✅ 已 stash'));
            }

            // 5. 切换目标分支（不存在时尝试基于远程自动建立跟踪分支）
            try {
                await execa('git', ['checkout', target]);
            } catch {
                console.log(chalk.yellow(`⚠️  本地无 ${target}，尝试基于远程创建跟踪分支...`));
                try {
                    await execa('git', ['checkout', '-b', target, '--track', `origin/${target}`]);
                } catch {
                    console.log(chalk.red(`❌ 分支 ${target} 在本地和远程都不存在，请检查分支名`));
                    console.log(chalk.gray('   可先执行: git fetch origin'));
                    process.exitCode = 1;
                    return;
                }
            }
            console.log(chalk.green(`✅ 已切换到 ${target}`));
            leftOriginal = true;

            // 6. 更新目标分支
            try {
                await execa('git', ['pull'], { stdio: 'inherit' });
                console.log(chalk.green('✅ 目标分支已更新'));
            } catch (pullError) {
                const raw = `${pullError.stderr || ''} ${pullError.message || ''}`;
                if (/no tracking information/i.test(raw)) {
                    await execa('git', ['pull', 'origin', target], { stdio: 'inherit' });
                    console.log(chalk.green('✅ 目标分支已更新'));
                } else if (/couldn't find remote ref|Couldn't find remote ref/i.test(raw)) {
                    console.log(chalk.yellow(`⚠️  远程不存在 ${target}，跳过更新`));
                } else {
                    throw pullError;
                }
            }

            // 7. 合并源分支
            console.log(chalk.blue(`🔀 正在合并 ${originalBranch} → ${target}...`));
            try {
                await execa('git', ['merge', originalBranch, '--no-edit'], { stdio: 'inherit' });
            } catch (mergeError) {
                const conflicts = (await execa('git', ['diff', '--name-only', '--diff-filter=U'])
                    .catch(() => ({ stdout: '' }))).stdout.trim();
                console.log('');
                console.log(chalk.red(`❌ 合并 ${originalBranch} → ${target} 失败${conflicts ? '（存在冲突）' : ''}`));
                if (conflicts) {
                    console.log(chalk.yellow('冲突文件:'));
                    conflicts.split('\n').filter(Boolean).forEach(f => console.log(`  ⚠️  ${f}`));
                }
                console.log('');
                console.log(chalk.cyan('🔧 后续处理建议:'));
                console.log('  git status                      # 查看冲突详情');
                console.log('  # 解决冲突后:');
                console.log(`  git add . && git commit --no-edit`);
                if (shouldPush) console.log(`  git push origin ${target}`);
                process.exitCode = 1;
                return;
            }
            merged = true;
            console.log(chalk.green(`✅ 已合并 ${originalBranch} → ${target}`));

            // 8. 推送目标分支
            if (shouldPush) {
                try {
                    await execa('git', ['push', 'origin', target], { stdio: 'inherit' });
                    console.log(chalk.green(`✅ 已推送 ${target} 到远程`));
                } catch (pushError) {
                    console.log(chalk.yellow(`⚠️  推送 ${target} 失败，本地合并结果已保留`));
                    console.log(chalk.gray(`   可手动重试: git push origin ${target}`));
                    process.exitCode = 1;
                }
            }

        } catch (error) {
            // 用户在交互提示中取消（Ctrl+C 等）
            if (error && (error.name === 'ExitPromptError' || /force closed/i.test(error.message || ''))) {
                console.log(chalk.yellow('⚠️  操作已取消'));
                return;
            }
            console.error(chalk.red('❌ mergeTo 失败:'), (error.stderr || error.message || '').toString().trim());
            process.exitCode = 1;
        } finally {
            // 处于合并中（含冲突、pull 产生的合并冲突）时不做收尾，避免破坏现场
            const merging = await isMerging();

            // 9. 切回原分支
            if (shouldBack && leftOriginal && !merging) {
                try {
                    await execa('git', ['checkout', originalBranch]);
                    console.log(chalk.green(`✅ 已切回 ${originalBranch}`));
                } catch {
                    console.log(chalk.yellow(`⚠️  切回 ${originalBranch} 失败，请手动切换`));
                }
            }

            // 10. 恢复 stash
            if (stashed && !merging) {
                try {
                    await execa('git', ['stash', 'pop']);
                    console.log(chalk.green('✅ 已恢复 stash'));
                } catch {
                    console.log(chalk.yellow('⚠️  stash 恢复失败，请手动执行: qygit stash -p'));
                }
            } else if (stashed && merging) {
                console.log(chalk.yellow('📦 你的改动仍在 stash 中，处理完合并后执行: qygit stash -p'));
            }

            if (merged && process.exitCode !== 1) {
                console.log(chalk.green.bold('🎉 mergeTo 完成！'));
            }
        }
    });

program.command("cherryPick [commits...]")
    .alias("cp")
    .description("cherry pick 指定 commit(s)，支持多个 commit、区间和排除")
    .option('-e, --exclude <commits>', '排除的 commit 列表，用逗号分隔')
    .option('-n, --no-commit', '不自动 commit，仅应用更改')
    .option('--continue', '继续进行中的 cherry-pick')
    .option('--abort', '中止当前的 cherry-pick')
    .option('--skip', '跳过当前 commit 并继续')
    .action(async (commits, options) => {
        try {
            // 处理特殊操作
            if (options.continue) {
                await execa('git', ['cherry-pick', '--continue']);
                console.log(chalk.green('✅ 已继续 cherry-pick'));
                return;
            }
            
            if (options.abort) {
                await execa('git', ['cherry-pick', '--abort']);
                console.log(chalk.yellow('⚠️  已中止 cherry-pick'));
                return;
            }
            
            if (options.skip) {
                await execa('git', ['cherry-pick', '--skip']);
                console.log(chalk.yellow('⚠️  已跳过当前 commit'));
                return;
            }
            
            if (!commits || commits.length === 0) {
                console.log(chalk.red('❌ 请指定要 cherry-pick 的 commit'));
                console.log('');
                console.log(chalk.blue('使用示例:'));
                console.log('  qygit cp abc123                    # 单个 commit');
                console.log('  qygit cp abc123 def456 ghi789      # 多个 commit');
                console.log('  qygit cp abc123..def456            # commit 区间');
                console.log('  qygit cp abc123^..def456           # 包含起始 commit 的区间');
                console.log('  qygit cp abc123..def456 -e ghi789  # 区间并排除特定 commit');
                return;
            }
            
            console.log(chalk.blue('🍒 开始 cherry-pick...'));
            
            let commitsToProcess = [];
            
            // 处理每个参数
            for (const commitArg of commits) {
                if (commitArg.includes('..')) {
                    // 处理区间
                    const rangeCommits = await getCommitsInRange(commitArg);
                    commitsToProcess.push(...rangeCommits);
                } else {
                    // 单个 commit
                    commitsToProcess.push(commitArg);
                }
            }
            
            // 处理排除列表
            if (options.exclude) {
                const excludeCommits = options.exclude.split(',').map(c => c.trim());
                commitsToProcess = commitsToProcess.filter(commit => {
                    return !excludeCommits.some(exclude => commit.startsWith(exclude));
                });
                console.log(chalk.yellow(`⚠️  排除了 ${excludeCommits.length} 个 commit: ${excludeCommits.join(', ')}`));
            }
            
            if (commitsToProcess.length === 0) {
                console.log(chalk.yellow('⚠️  没有需要 cherry-pick 的 commit'));
                return;
            }
            
            console.log(chalk.blue(`📋 将要 cherry-pick ${commitsToProcess.length} 个 commit:`));
            commitsToProcess.forEach((commit, index) => {
                console.log(`  ${index + 1}. ${commit}`);
            });
            console.log('');
            
            // 构建 git cherry-pick 命令参数
            const gitArgs = ['cherry-pick'];
            if (options.noCommit) {
                gitArgs.push('--no-commit');
            }
            gitArgs.push(...commitsToProcess);
            
            // 执行 cherry-pick
            await execa('git', gitArgs);
            
            if (options.noCommit) {
                console.log(chalk.green('✅ 已应用更改但未 commit，请手动 commit'));
            } else {
                console.log(chalk.green(`✅ 已成功 cherry-pick ${commitsToProcess.length} 个 commit`));
            }
            
        } catch (error) {
            console.error(chalk.red('❌ Cherry-pick 失败:'), error.message);
            
            if (error.message.includes('conflict')) {
                console.log('');
                console.log(chalk.yellow('🔧 检测到冲突，请解决冲突后使用以下命令:'));
                console.log(chalk.cyan('  qygit cp --continue    # 解决冲突后继续'));
                console.log(chalk.cyan('  qygit cp --abort       # 中止 cherry-pick'));
                console.log(chalk.cyan('  qygit cp --skip        # 跳过当前 commit'));
            }
        }
    });

// 辅助函数：获取区间内的 commit 列表
async function getCommitsInRange(range) {
    try {
        const result = await execa('git', ['rev-list', '--reverse', range]);
        return result.stdout.split('\n').filter(line => line.trim());
    } catch (error) {
        throw new Error(`无法获取区间 ${range} 内的 commit: ${error.message}`);
    }
}
// 显示帮助信息
program.on('--help', () => {
    console.log('');
    console.log(chalk.blue.bold('🛠️  QYGit - 增强的 Git 包装工具 v1.4.0'));
    console.log('');
    console.log(chalk.yellow.bold('📋 基础命令:'));
    console.log('  $ qygit qc "feat: add new feature"    # 快速 commit 和 push');
    console.log('  $ qygit qcn "fix: bug"                # 快速 commit（跳过 hooks）和 push');
    console.log('  $ qygit st                            # 美化状态显示');
    console.log('  $ qygit ci                            # 交互式 commit');
    console.log('  $ qygit tg                            # 交互式创建和发布 tag');
    console.log('  $ qygit lg -n 20                      # 显示提交日志');
    console.log('');
    console.log(chalk.green.bold('🌿 分支管理:'));
    console.log('  $ qygit br -c feature/new             # 创建新分支');
    console.log('  $ qygit br -d old-branch              # 删除分支');
    console.log('  $ qygit sw main                       # 切换分支');
    console.log('  $ qygit br -l                         # 列出所有分支');
    console.log('');
    console.log(chalk.green.bold('🔀 一键合并到目标分支:'));
    console.log('  $ qygit mt                            # 交互选择 test/release 等目标分支');
    console.log('  $ qygit mt test                       # 直接指定目标分支');
    console.log('  $ qygit mt release --no-push          # 只本地合并，不推送');
    console.log('  $ qygit mt test -y                    # 跳过确认直接执行');
    console.log(chalk.gray('      流程: 切到目标分支 → pull → 合并当前分支 → push → 切回原分支'));
    console.log('');
    console.log(chalk.cyan.bold('🍒 Cherry-Pick 功能:'));
    console.log('  $ qygit cp abc123                     # 单个 commit');
    console.log('  $ qygit cp abc123 def456 ghi789       # 多个 commit');
    console.log('  $ qygit cp abc123..def456             # commit 区间');
    console.log('  $ qygit cp abc123^..def456            # 包含起始 commit 的区间');
    console.log('  $ qygit cp abc123..def456 -e ghi789   # 区间排除特定 commit');
    console.log('  $ qygit cp --continue                 # 解决冲突后继续');
    console.log('  $ qygit cp --abort                    # 中止 cherry-pick');
    console.log('');
    console.log(chalk.magenta.bold('🔄 同步功能:'));
    console.log('  $ qygit sync                          # 同步当前分支 (pull + push)');
    console.log('  $ qygit sync-all                      # 智能同步所有本地分支');
    console.log('  $ qygit sync-all -s dev,test          # 同步时跳过指定分支');
    console.log('  $ qygit sync-all -o main,feature      # 只同步指定分支');
    console.log('  $ qygit sync-all -f                   # 强制推送（有冲突时）');
    console.log('  $ qygit gl                            # 从 origin/master 获取最新');
    console.log('');
    console.log(chalk.blue.bold('📦 工作暂存:'));
    console.log('  $ qygit stash -s "work in progress"   # 保存工作到 stash');
    console.log('  $ qygit stash -p                      # 恢复最新 stash');
    console.log('  $ qygit stash -l                      # 列出所有 stash');
    console.log('  $ qygit stash -c                      # 清空所有 stash');
    console.log('');
    console.log(chalk.gray('💡 提示: 每个命令都有简短别名，使用 qygit <command> --help 查看详细选项'));
    console.log('');
});

program.parse();