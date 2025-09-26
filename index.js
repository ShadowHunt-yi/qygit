#!/usr/bin/env node
import { Command } from 'commander';
import { execa } from 'execa';
import chalk from 'chalk';
import inquirer from 'inquirer';

const program = new Command();

program.name('qygit').description('A simple git wrapper for QY').version('0.1.0');
// 快速提交功能
program.command("quickCommit <message>")
    .alias("qc")
    .description("quick add files and commit and push")
    .action(async (message) => {
        try {
            console.log(chalk.blue('🚀 Starting quick commit...'));
            
            const files = await execa('git', ['add', '.']);
            console.log(chalk.green('✅ Files added'));
            
            const commit = await execa('git', ['commit', '-m', message]);
            console.log(chalk.green('✅ Committed successfully'));
            
            const push = await execa('git', ['push']);
            console.log(chalk.green('✅ Pushed to remote'));
            
            console.log(chalk.green.bold('🎉 Quick commit completed successfully!'));
        } catch (error) {
            console.error(chalk.red('❌ Error:'), error.message);
        }
    });

// 美化的 git status
program.command("status")
    .alias("st")
    .description("show git status with beautiful formatting")
    .action(async () => {
        try {
            const result = await execa('git', ['status', '--porcelain']);
            const status = result.stdout;
            
            if (!status) {
                console.log(chalk.green('✨ Working directory clean'));
                return;
            }
            
            console.log(chalk.blue.bold('📋 Repository Status:'));
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
            console.error(chalk.red('❌ Error getting status:'), error.message);
        }
    });

// 分支管理
program.command("branch")
    .alias("br")
    .description("branch management")
    .option('-c, --create <name>', 'create new branch')
    .option('-d, --delete <name>', 'delete branch')
    .option('-l, --list', 'list all branches')
    .action(async (options) => {
        try {
            if (options.create) {
                await execa('git', ['checkout', '-b', options.create]);
                console.log(chalk.green(`✅ Created and switched to branch: ${options.create}`));
            } else if (options.delete) {
                await execa('git', ['branch', '-d', options.delete]);
                console.log(chalk.green(`✅ Deleted branch: ${options.delete}`));
            } else if (options.list || Object.keys(options).length === 0) {
                const result = await execa('git', ['branch', '-a']);
                console.log(chalk.blue.bold('🌿 Branches:'));
                console.log(result.stdout.replace(/\*/g, chalk.green('*')));
            }
        } catch (error) {
            console.error(chalk.red('❌ Branch operation failed:'), error.message);
        }
    });

// 切换分支
program.command("switch <branch>")
    .alias("sw")
    .description("switch to branch")
    .action(async (branch) => {
        try {
            await execa('git', ['checkout', branch]);
            console.log(chalk.green(`✅ Switched to branch: ${branch}`));
        } catch (error) {
            console.error(chalk.red('❌ Failed to switch branch:'), error.message);
        }
    });

// 美化的 git log
program.command("log")
    .alias("lg")
    .description("show beautiful git log")
    .option('-n, --number <count>', 'number of commits to show', '10')
    .action(async (options) => {
        try {
            const result = await execa('git', ['log', '--oneline', '--graph', '--decorate', '--color=always', `-${options.number}`]);
            console.log(chalk.blue.bold('📜 Recent Commits:'));
            console.log('');
            console.log(result.stdout);
        } catch (error) {
            console.error(chalk.red('❌ Error getting log:'), error.message);
        }
    });

// 交互式提交
program.command("commit")
    .alias("ci")
    .description("interactive commit with file selection")
    .action(async () => {
        try {
            // 获取状态
            const statusResult = await execa('git', ['status', '--porcelain']);
            const files = statusResult.stdout.split('\n').filter(line => line.trim());
            
            if (files.length === 0) {
                console.log(chalk.yellow('⚠️  No changes to commit'));
                return;
            }
            
            // 选择要提交的文件
            const fileChoices = files.map(line => ({
                name: line.substring(3),
                value: line.substring(3),
                checked: true
            }));
            
            const { selectedFiles } = await inquirer.prompt([
                {
                    type: 'checkbox',
                    name: 'selectedFiles',
                    message: 'Select files to commit:',
                    choices: fileChoices
                }
            ]);
            
            if (selectedFiles.length === 0) {
                console.log(chalk.yellow('⚠️  No files selected'));
                return;
            }
            
            // 添加选中的文件
            for (const file of selectedFiles) {
                await execa('git', ['add', file]);
            }
            
            // 输入提交信息
            const { commitMessage } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'commitMessage',
                    message: 'Enter commit message:',
                    validate: (input) => input.trim() !== '' || 'Commit message cannot be empty'
                }
            ]);
            
            // 提交
            await execa('git', ['commit', '-m', commitMessage]);
            console.log(chalk.green('✅ Committed successfully!'));
            
            // 询问是否推送
            const { shouldPush } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'shouldPush',
                    message: 'Push to remote?',
                    default: true
                }
            ]);
            
            if (shouldPush) {
                await execa('git', ['push']);
                console.log(chalk.green('✅ Pushed to remote!'));
            }
            
        } catch (error) {
            console.error(chalk.red('❌ Commit failed:'), error.message);
        }
    });

// Stash 管理
program.command("stash")
    .description("stash management")
    .option('-s, --save [message]', 'save current changes to stash')
    .option('-p, --pop', 'apply and remove latest stash')
    .option('-l, --list', 'list all stashes')
    .option('-c, --clear', 'clear all stashes')
    .action(async (options) => {
        try {
            if (options.save !== undefined) {
                const message = options.save || 'WIP';
                await execa('git', ['stash', 'save', message]);
                console.log(chalk.green(`✅ Stashed changes: ${message}`));
            } else if (options.pop) {
                await execa('git', ['stash', 'pop']);
                console.log(chalk.green('✅ Applied and removed latest stash'));
            } else if (options.clear) {
                await execa('git', ['stash', 'clear']);
                console.log(chalk.green('✅ Cleared all stashes'));
            } else if (options.list || Object.keys(options).length === 0) {
                const result = await execa('git', ['stash', 'list']);
                if (result.stdout) {
                    console.log(chalk.blue.bold('📦 Stashes:'));
                    console.log(result.stdout);
                } else {
                    console.log(chalk.yellow('📦 No stashes found'));
                }
            }
        } catch (error) {
            console.error(chalk.red('❌ Stash operation failed:'), error.message);
        }
    });

// 同步功能 (pull + push)
program.command("sync")
    .description("sync with remote (pull then push)")
    .action(async () => {
        try {
            console.log(chalk.blue('🔄 Syncing with remote...'));
            
            // Pull first
            const pullResult = await execa('git', ['pull']);
            console.log(chalk.green('✅ Pulled from remote'));
            
            // Then push
            const pushResult = await execa('git', ['push']);
            console.log(chalk.green('✅ Pushed to remote'));
            
            console.log(chalk.green.bold('🎉 Sync completed successfully!'));
        } catch (error) {
            console.error(chalk.red('❌ Sync failed:'), error.message);
        }
    });

program.command("getLatest")
    .description("get merge form origin/master")
    .action(async () => {
        try {
            await execa('git', ['pull']);
            console.log(chalk.green('✅ Pulled'));
            await execa('git', ['merge', 'origin/master']);
            console.log(chalk.green('✅ Merged from origin/master'));
        } catch (error) {
            console.error(chalk.red('❌ Pull failed:'), error.message);
            console.error(chalk.red('❌ Merge failed:'), error.message);
        }
    });
// 显示帮助信息
program.on('--help', () => {
    console.log('');
    console.log(chalk.blue.bold('🛠️  QYGit - Enhanced Git Wrapper'));
    console.log('');
    console.log('Examples:');
    console.log('  $ qygit qc "feat: add new feature"    # Quick commit');
    console.log('  $ qygit st                            # Beautiful status');
    console.log('  $ qygit br -c feature/new             # Create branch');
    console.log('  $ qygit sw main                       # Switch branch');
    console.log('  $ qygit ci                            # Interactive commit');
    console.log('  $ qygit sync                          # Pull and push');
    console.log('  $ qygit getLatest                     # Get latest from origin/master');
    console.log('');
});

program.parse();