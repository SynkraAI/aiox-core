# AIOS-Core 安装和故障排除指南

> [EN](../../guides/installation-troubleshooting.md) | [PT](../../pt/guides/installation-troubleshooting.md) | [ES](../../es/guides/installation-troubleshooting.md) | **ZH**

---

## 快速开始

```bash
npx aios-core@latest
```

此命令下载并运行最新版本的 AIOS-Core 安装程序。

## 系统要求

| 要求        | 最低版本     | 检查命令           |
| ----------- | ------------ | ------------------ |
| **Node.js** | v18.0.0+     | `node --version`   |
| **npm**     | v9.0.0+      | `npm --version`    |
| **npx**     | (npm 5.2+ 包含) | `npx --version` |
| **Git**     | 任何最近版本 (可选) | `git --version` |

### 下载链接

- **Node.js**: https://nodejs.org/ (下载 LTS 版本 - 包含 npm 和 npx)
- **Git**: https://git-scm.com/ (可选，但推荐)

---

## 安装方法

### 方法 1: npx (推荐)

```bash
# 在当前目录安装
npx aios-core@latest

# 安装特定版本
npx aios-core@2.2.0

# 显示版本
npx aios-core@latest --version

# 显示帮助
npx aios-core@latest --help
```

### 方法 2: 从 GitHub

```bash
npx github:SynkraAI/aios-core install
```

### 方法 3: 全局安装

```bash
npm install -g aios-core
aios-core
```

---

## 诊断工具

如果您遇到安装问题，运行我们的诊断工具:

### Windows (CMD)
```cmd
curl -o diagnose.cmd https://raw.githubusercontent.com/SynkraAI/aios-core/main/tools/quick-diagnose.cmd && diagnose.cmd
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/SynkraAI/aios-core/main/tools/quick-diagnose.ps1 | iex
```

### macOS/Linux
```bash
curl -fsSL https://raw.githubusercontent.com/SynkraAI/aios-core/main/tools/diagnose-installation.js | node
```

---

## 常见问题和解决方案

### 问题 1: "Node.js 版本太旧"

**错误:**
```
error engine Unsupported engine
error notsup Required: {"node":">=18.0.0"}
```

**解决方案:**
1. 从 https://nodejs.org/ 下载 Node.js LTS
2. 安装并重启终端
3. 验证: `node --version` (应显示 v18+ 或 v20+)

---

### 问题 2: "npm 版本太旧"

**错误:**
```
npm ERR! Required: {"npm":">=9.0.0"}
```

**解决方案:**
```bash
# 全局更新 npm
npm install -g npm@latest

# 验证
npm --version
```

---

### 问题 3: "npx 未找到" 或 "npx 命令未识别"

**原因:** npm bin 文件夹不在系统 PATH 中

**解决方案 (Windows):**
1. 查找 npm 前缀: `npm config get prefix`
2. 添加到 PATH:
   - 按 Win+X → 系统 → 高级系统设置 → 环境变量
   - 编辑用户变量下的 "Path"
   - 添加: `C:\Users\您的用户名\AppData\Roaming\npm`
3. 重启终端

**解决方案 (macOS/Linux):**
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export PATH="$PATH:$(npm config get prefix)/bin"

# 重新加载
source ~/.bashrc
```

---

### 问题 4: "EACCES: 权限被拒绝"

**解决方案 (Windows):**
以管理员身份运行终端

**解决方案 (macOS/Linux):**
```bash
# 修复 npm 权限 (推荐)
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# 或使用 nvm (最佳实践)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

---

### 问题 5: "ETIMEDOUT" 或 "ECONNREFUSED"

**原因:** 网络/防火墙阻止 npm 注册表

**解决方案:**

1. **检查 npm 注册表:**
   ```bash
   npm config get registry
   # 应该是: https://registry.npmjs.org/
   ```

2. **重置注册表:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

3. **测试连接:**
   ```bash
   npm ping
   ```

4. **在企业代理后面:**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

5. **使用镜像 (中国):**
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

---

### 问题 6: "PowerShell 执行策略" (Windows)

**错误:**
```
File cannot be loaded because running scripts is disabled on this system
```

**解决方案:**
```powershell
# 以管理员身份运行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### 问题 7: "找不到模块" 或 "缺少依赖"

**解决方案:**
```bash
# 清除 npm 缓存
npm cache clean --force

# 如果存在则删除 node_modules
rm -rf node_modules

# 重试
npx aios-core@latest
```

---

### 问题 8: "SSL/证书错误"

**解决方案:**
```bash
# 临时禁用严格 SSL (不推荐用于生产)
npm config set strict-ssl false

# 更好: 更新证书
npm config set cafile /path/to/certificate.pem
```

---

### 问题 9: 包显示旧版本

**原因:** npm 缓存提供旧版本

**解决方案:**
```bash
# 清除 npx 缓存
npx clear-npx-cache

# 或强制新下载
npx --ignore-existing aios-core@latest

# 或使用特定版本
npx aios-core@2.2.0
```

---

## 环境验证检查清单

运行这些命令验证您的环境:

```bash
# 1. 检查 Node.js (需要 v18+)
node --version

# 2. 检查 npm (需要 v9+)
npm --version

# 3. 检查 npx
npx --version

# 4. 检查 npm 注册表访问
npm view aios-core version

# 5. 测试安装
npx aios-core@latest --version
```

**预期输出:**
```
v22.x.x (或 v18+/v20+)
11.x.x (或 v9+)
11.x.x (与 npm 相同)
2.2.0
2.2.0
```

---

## 获取帮助

如果您仍然遇到问题:

1. **GitHub Issues**: https://github.com/SynkraAI/aios-core/issues
2. **运行诊断**: `npx aios-core@latest doctor`
3. **检查系统信息**: `npx aios-core@latest info`

报告问题时，请包含:
- 操作系统和版本
- Node.js 版本 (`node --version`)
- npm 版本 (`npm --version`)
- 完整错误消息
- 诊断工具输出

---

## 快速参考

| 命令                             | 描述                    |
| -------------------------------- | ----------------------- |
| `npx aios-core@latest`           | 安装/运行向导            |
| `npx aios-core@latest --version` | 显示版本                 |
| `npx aios-core@latest --help`    | 显示帮助                 |
| `npx aios-core@latest install`   | 在当前目录安装           |
| `npx aios-core@latest init <名称>` | 创建新项目             |
| `npx aios-core@latest doctor`    | 运行诊断                 |
| `npx aios-core@latest info`      | 显示系统信息             |

---

*最后更新: 2025年12月 | AIOS-Core v2.2.0*
