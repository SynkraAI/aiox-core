<!-- 翻译：zh-CN 原文：/docs/troubleshooting.md 最后同步：2026-02-22 -->

# Synkra AIOS 故障排除指南

> 🌐 [EN](../troubleshooting.md) | [PT](../pt/troubleshooting.md) | [ES](../es/troubleshooting.md) | **ZH**

---

这份全面指南可帮助您诊断和解决 Synkra AIOS 的常见问题。

## 目录

1. [快速诊断](#快速诊断)
2. [安装问题](#安装问题)
3. [元代理问题](#元代理问题)
4. [内存层问题](#内存层问题)
5. [性能问题](#性能问题)
6. [API 和集成问题](#api-和集成问题)
7. [安全和权限错误](#安全和权限错误)
8. [平台特定问题](#平台特定问题)
9. [高级故障排除](#高级故障排除)
10. [获取帮助](#获取帮助)

## 快速诊断

### 运行系统医生

始终从内置诊断开始：

```bash
# 基本诊断
npx @synkra/aios-core doctor

# 自动修复常见问题
npx @synkra/aios-core doctor --fix

# 详细输出
npx @synkra/aios-core doctor --verbose

# 检查特定组件
npx @synkra/aios-core doctor --component memory-layer
```

### 常见快速修复

```bash
# 清除所有缓存
*memory clear-cache

# 重建内存索引
*memory rebuild

# 重置配置
*config --reset

# 更新到最新版本
npx @synkra/aios-core update
```

## 安装问题

### 问题：找不到 NPX 命令

**症状：**
```
bash: npx: command not found
```

**解决方案：**
```bash
# 检查 npm 版本
npm --version

# 如果 npm < 5.2，全局安装 npx
npm install -g npx

# 或直接使用 npm
npm exec @synkra/aios-core init my-project
```

### 问题：安装失败，权限错误

**症状：**
```
Error: EACCES: permission denied
```

**解决方案：**

**选项 1：修复 npm 权限（推荐）**
```bash
# 创建 npm 目录
mkdir ~/.npm-global

# 配置 npm
npm config set prefix '~/.npm-global'

# 添加到 PATH（添加到 ~/.bashrc 或 ~/.zshrc）
export PATH=~/.npm-global/bin:$PATH

# 重载 shell
source ~/.bashrc
```

**选项 2：使用不同的目录**
```bash
# 在用户目录中安装
cd ~
npx @synkra/aios-core init my-project
```

### 问题：Node.js 版本错误

**症状：**
```
Error: Node.js version 18.0.0 or higher required
```

**解决方案：**
```bash
# 检查当前版本
node --version

# 更新 Node.js
# macOS（使用 Homebrew）
brew upgrade node

# Windows（使用 Chocolatey）
choco upgrade nodejs

# Linux（使用 NodeSource）
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或使用 nvm（Node 版本管理器）
nvm install 18
nvm use 18
```

### 问题：安装挂起或超时

**症状：**
- 安装卡在"安装依赖..."
- 网络超时错误

**解决方案：**

```bash
# 使用不同的注册表
npm config set registry https://registry.npmjs.org/

# 清除 npm 缓存
npm cache clean --force

# 增加超时
npm config set fetch-timeout 60000

# 跳过依赖安装
npx @synkra/aios-core init my-project --skip-install

# 然后手动安装
cd my-project
npm install --verbose
```

### 问题：磁盘空间错误

**症状：**
```
Error: ENOSPC: no space left on device
```

**解决方案：**
```bash
# 检查可用空间
df -h

# 清除 npm 缓存
npm cache clean --force

# 删除旧的 node_modules
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# 清除临时文件
# macOS/Linux
rm -rf /tmp/npm-*

# Windows
rmdir /s %TEMP%\npm-*
```

## 元代理问题

### 问题：元代理无法启动

**症状：**
```
Error: Failed to initialize meta-agent
```

**解决方案：**

1. **检查配置：**
```bash
# 验证配置存在
ls -la .aios/config.json

# 验证配置
npx @synkra/aios-core doctor --component config

# 如果损坏则重置
rm .aios/config.json
npx @synkra/aios-core doctor --fix
```

2. **检查依赖：**
```bash
# 重新安装核心依赖
npm install

# 验证代理文件
ls -la agents/
```

3. **检查环境：**
```bash
# 验证环境变量
cat .env

# 确保设置了 API 密钥
echo "OPENAI_API_KEY=your-key" >> .env
```

### 问题：命令无法识别

**症状：**
```
Unknown command: *create-agent
```

**解决方案：**

1. **验证代理激活：**
```bash
# 列出活动代理
*list-agents --active

# 激活元代理
*activate meta-agent

# 验证命令可用性
*help
```

2. **检查命令语法：**
```bash
# 正确的语法使用星号
*create-agent my-agent  # ✓ 正确
create-agent my-agent   # ✗ 错误
```

3. **重载代理：**
```bash
# 重载所有代理
*reload-agents

# 或重启元代理
exit
npx @synkra/aios-core
```

### 问题：代理创建失败

**症状：**
```
Error: Failed to create agent
```

**解决方案：**

1. **检查权限：**
```bash
# 验证写入权限
ls -la agents/

# 修复权限
chmod 755 agents/
```

2. **验证代理名称：**
```bash
# 有效名称：小写、连字符
*create-agent my-agent      # ✓ 好
*create-agent MyAgent       # ✗ 坏（大写）
*create-agent my_agent      # ✗ 坏（下划线）
*create-agent my-agent-2    # ✓ 好
```

3. **检查重复：**
```bash
# 列出现有代理
*list-agents

# 删除重复的
rm agents/duplicate-agent.yaml
```

## 内存层问题

### 问题：内存搜索返回无结果

**症状：**
- 语义搜索找不到任何内容
- 模式识别失败

**解决方案：**

1. **重建内存索引：**
```bash
# 清除并重建
*memory clear-cache
*memory rebuild --verbose

# 等待索引
# 检查进度
*memory status
```

2. **验证内存配置：**
```bash
# 检查配置
cat .aios/memory-config.json

# 重置为默认值
*memory reset-config
```

3. **检查索引完整性：**
```bash
# 运行内存诊断
*memory diagnose

# 如果需要则修复
*memory repair
```

### 问题：内存层使用过多 RAM

**症状：**
- 高内存使用
- 系统减速

**解决方案：**

1. **调整内存设置：**
```javascript
// 编辑 .aios/memory-config.json
{
  "maxDocuments": 5000,      // 从 10000 减少
  "chunkSize": 256,          // 从 512 减少
  "cacheSize": 100,          // 从 1000 减少
  "enableCompression": true  // 启用压缩
}
```

2. **清除旧数据：**
```bash
# 删除旧条目
*memory prune --older-than "30 days"

# 优化存储
*memory optimize
```

3. **使用内存限制：**
```bash
# 设置内存限制
export NODE_OPTIONS="--max-old-space-size=1024"

# 以有限内存运行
npx @synkra/aios-core
```

### 问题：LlamaIndex 错误

**症状：**
```
Error: LlamaIndex initialization failed
```

**解决方案：**

1. **检查 API 密钥：**
```bash
# 验证嵌入的 OpenAI 密钥
echo $OPENAI_API_KEY

# 测试 API 访问
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

2. **使用本地嵌入：**
```javascript
// .aios/memory-config.json
{
  "embedModel": "local",
  "localModelPath": "./models/embeddings"
}
```

3. **重新安装 LlamaIndex：**
```bash
npm uninstall llamaindex
npm install llamaindex@latest
```

## 性能问题

### 问题：命令执行缓慢

**症状：**
- 命令耗时 > 5 秒
- UI 响应迟钝

**解决方案：**

1. **配置文件性能：**
```bash
# 启用分析
*debug enable --profile

# 运行缓慢的命令
*analyze-framework

# 查看配置文件
*debug show-profile
```

2. **优化配置：**
```javascript
// .aios/config.json
{
  "performance": {
    "enableCache": true,
    "parallelOperations": 4,
    "lazyLoading": true,
    "indexUpdateFrequency": "hourly"
  }
}
```

3. **清理资源：**
```bash
# 清除缓存
*cache clear --all

# 删除未使用的代理
*cleanup-agents

# 优化数据库
*optimize-db
```

### 问题：高 CPU 使用率

**症状：**
- 风扇噪音
- 系统滞后
- 任务管理器中 CPU 高

**解决方案：**

1. **限制并发操作：**
```bash
# 设置操作限制
*config --set performance.maxConcurrent 2
*config --set performance.cpuThreshold 80
```

2. **禁用实时功能：**
```bash
# 禁用实时索引
*config --set memory.realTimeIndex false

# 使用批处理
*config --set performance.batchMode true
```

3. **检查流氓进程：**
```bash
# 列出所有进程
*debug processes

# 杀死卡住的进程
*debug kill-process <pid>
```

## API 和集成问题

### 问题：API 密钥不工作

**症状：**
```
Error: Invalid API key
Error: 401 Unauthorized
```

**解决方案：**

1. **验证 API 密钥格式：**
```bash
# OpenAI
echo $OPENAI_API_KEY
# 应以 "sk-" 开头

# Anthropic
echo $ANTHROPIC_API_KEY
# 应以 "sk-ant-" 开头
```

2. **直接测试 API：**
```bash
# 测试 OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 测试 Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

3. **检查速率限制：**
```bash
# 查看当前使用情况
*api-status

# 切换到不同的提供商
*config --set ai.provider anthropic
```

### 问题：网络连接错误

**症状：**
```
Error: ECONNREFUSED
Error: getaddrinfo ENOTFOUND
```

**解决方案：**

1. **检查代理设置：**
```bash
# 企业代理
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# 测试连接
curl -I https://api.openai.com
```

2. **使用离线模式：**
```bash
# 启用离线模式
*config --set offline true

# 使用本地模型
*config --set ai.provider local
```

3. **配置超时：**
```bash
# 增加超时
*config --set network.timeout 30000
*config --set network.retries 3
```

## 安全和权限错误

### 问题：权限被拒绝错误

**症状：**
```
Error: EACCES: permission denied
Error: Cannot write to file
```

**解决方案：**

1. **修复文件权限：**
```bash
# 修复项目权限
chmod -R 755 .
chmod 600 .env

# 修复特定目录
chmod 755 agents/ tasks/ workflows/
```

2. **检查文件所有权：**
```bash
# 查看所有权
ls -la

# 修复所有权（Linux/macOS）
sudo chown -R $(whoami) .
```

3. **以正确的用户运行：**
```bash
# 不要对 npm 使用 sudo
npm install  # ✓ 好
sudo npm install  # ✗ 坏
```

### 问题：敏感数据泄露

**症状：**
- API 密钥在日志中可见
- 凭证在错误消息中

**解决方案：**

1. **保护环境变量：**
```bash
# 检查 .gitignore
cat .gitignore | grep .env

# 如果缺少则添加
echo ".env" >> .gitignore
echo ".aios/logs/" >> .gitignore
```

2. **启用安全模式：**
```bash
# 启用安全功能
*config --set security.maskSensitive true
*config --set security.secureLogging true
```

3. **轮换受损的密钥：**
```bash
# 从提供商生成新密钥
# 更新 .env 文件
# 清除日志
rm -rf .aios/logs/*
```

## 平台特定问题

### Windows 问题

#### 问题：路径太长错误
```
Error: ENAMETOOLONG
```

**解决方案：**
```powershell
# 启用长路径（以管理员身份运行）
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# 或使用更短的路径
cd C:\
npx @synkra/aios-core init myapp
```

#### 问题：脚本已禁用
```
Error: Scripts is disabled on this system
```

**解决方案：**
```powershell
# 以管理员身份运行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS 问题

#### 问题：命令行工具缺失
```
Error: xcrun: error: invalid active developer path
```

**解决方案：**
```bash
# 安装 Xcode 命令行工具
xcode-select --install
```

#### 问题：Gatekeeper 阻止执行
```
Error: "@synkra/aios-core" cannot be opened
```

**解决方案：**
```bash
# 允许执行
sudo spctl --master-disable

# 或删除隔离
xattr -d com.apple.quarantine /usr/local/bin/@synkra/aios-core
```

### Linux 问题

#### 问题：缺少依赖
```
Error: libssl.so.1.1: cannot open shared object file
```

**解决方案：**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install libssl-dev

# RHEL/CentOS
sudo yum install openssl-devel

# Arch
sudo pacman -S openssl
```

## 高级故障排除

### 启用调试模式

```bash
# 完整的调试输出
export DEBUG=aios:*
npx @synkra/aios-core

# 特定组件
export DEBUG=aios:memory,aios:agent
```

### 分析日志

```bash
# 查看最近的日志
tail -f .aios/logs/aios.log

# 搜索错误
grep -i error .aios/logs/*.log

# 查看结构化日志
*logs --format json --level error
```

### 创建诊断报告

```bash
# 生成完整诊断
npx @synkra/aios-core doctor --report diagnostic.json

# 包括系统信息
npx @synkra/aios-core info --detailed >> diagnostic.json

# 创建支持包
tar -czf aios-support.tar.gz .aios/logs diagnostic.json
```

### 性能分析

```javascript
// 在配置中启用分析
{
  "debug": {
    "profiling": true,
    "profileOutput": ".aios/profiles/"
  }
}
```

```bash
# 分析配置文件
*debug analyze-profile .aios/profiles/latest.cpuprofile
```

### 内存转储分析

```bash
# 创建堆快照
*debug heap-snapshot

# 分析内存使用
*debug memory-report

# 查找内存泄漏
*debug find-leaks
```

## 获取帮助

### 寻求帮助前

1. **运行诊断：**
   ```bash
   npx @synkra/aios-core doctor --verbose > diagnostic.log
   ```

2. **收集信息：**
   - Node.js 版本：`node --version`
   - NPM 版本：`npm --version`
   - OS 和版本：`uname -a` 或 `ver`
   - AIOS 版本：`npx @synkra/aios-core version`

3. **检查现有问题：**
   - [GitHub Issues](https://github.com/@synkra/aios-core/@synkra/aios-core/issues)
   - [讨论](https://github.com/@synkra/aios-core/@synkra/aios-core/discussions)

### 社区支持

- **Discord**：[加入我们的服务器](https://discord.gg/gk8jAdXWmj)
  - `#help` - 常规帮助
  - `#bugs` - 错误报告
  - `#meta-agent` - 元代理特定

- **GitHub 讨论**：技术问题和功能请求

- **Stack Overflow**：使用 `@synkra/aios-core` 标签提问

### 报告错误

创建详细的错误报告：

```markdown
## 环境
- OS: macOS 13.0
- Node: 18.17.0
- AIOS: 1.0.0

## 重现步骤
1. 运行 `npx @synkra/aios-core init test`
2. 选择"企业"模板
3. 安装过程中出错

## 预期行为
安装成功完成

## 实际行为
Error: Cannot find module 'inquirer'

## 日志
[附加 diagnostic.log]

## 其他上下文
使用企业代理
```

### 紧急恢复

如果一切都失败了：

```bash
# 备份当前状态
cp -r .aios .aios.backup

# 完全重置
rm -rf .aios node_modules package-lock.json
npm cache clean --force

# 新鲜安装
npm install
npx @synkra/aios-core doctor --fix

# 如果需要则恢复数据
cp .aios.backup/memory.db .aios/
```

---

**记住**：大多数问题可以通过以下方式解决：
1. `npx @synkra/aios-core doctor --fix`
2. 清除缓存
3. 更新到最新版本
4. 检查权限

有疑问时，社区在这里帮助您！
