# 卸载指南

> 🌐 [EN](../uninstallation.md) | [PT](../pt/uninstallation.md) | [ES](../es/uninstallation.md) | **ZH**

---

本指南提供了从您的系统中卸载 Synkra AIOX 的全面说明。

## 目录

1. [卸载前](#卸载前)
2. [快速卸载](#快速卸载)
3. [完全卸载](#完全卸载)
4. [选择性卸载](#选择性卸载)
5. [数据保留](#数据保留)
6. [清洁系统移除](#清洁系统移除)
7. [卸载故障排除](#卸载故障排除)
8. [卸载后清理](#卸载后清理)
9. [重新安装](#重新安装)

## 卸载前

### 重要考虑事项

⚠️ **警告**：卸载 Synkra AIOX 将：

- 删除所有框架文件
- 删除代理配置（除非保留）
- 清除内存层数据（除非备份）
- 删除所有自定义工作流
- 删除日志和临时文件

### 卸载前检查清单

- [ ] 备份重要数据
- [ ] 导出自定义代理和工作流
- [ ] 保存 API 密钥和配置
- [ ] 记录自定义修改
- [ ] 停止所有运行的进程
- [ ] 通知团队成员

### 备份您的数据

```bash
# 创建完整备份
npx @synkra/aiox-core backup --complete

# 或手动备份重要目录
tar -czf aiox-backup-$(date +%Y%m%d).tar.gz \
  .aiox/ \
  agents/ \
  workflows/ \
  tasks/ \
  --exclude=.aiox/logs \
  --exclude=.aiox/cache
```

## 快速卸载

### 使用内置卸载程序

卸载 Synkra AIOX 的最快方法：

```bash
# 基本卸载（保留用户数据）
npx @synkra/aiox-core uninstall

# 完全卸载（删除所有内容）
npx @synkra/aiox-core uninstall --complete

# 卸载并保留数据
npx @synkra/aiox-core uninstall --keep-data
```

### 交互式卸载

对于引导式卸载：

```bash
npx @synkra/aiox-core uninstall --interactive
```

这会提示您：

- 要保留/删除什么
- 备份选项
- 每一步的确认

## 完全卸载

### 步骤 1：停止所有服务

```bash
# 停止所有运行的代理
*deactivate --all

# 停止所有工作流
*stop-workflow --all

# 关闭元代理
*shutdown
```

### 步骤 2：导出重要数据

```bash
# 导出配置
*export config --destination backup/config.json

# 导出代理
*export agents --destination backup/agents/

# 导出工作流
*export workflows --destination backup/workflows/

# 导出内存数据
*export memory --destination backup/memory.zip
```

### 步骤 3：运行卸载程序

```bash
# 完全移除
npx @synkra/aiox-core uninstall --complete --no-backup
```

### 步骤 4：删除全局安装

```bash
# 删除全局 npm 包
npm uninstall -g @synkra/aiox-core

# 删除 npx 缓存
npm cache clean --force
```

### 步骤 5：清理系统文件

#### Windows

```powershell
# 删除 AppData 文件
Remove-Item -Recurse -Force "$env:APPDATA\@synkra/aiox-core"

# 删除临时文件
Remove-Item -Recurse -Force "$env:TEMP\aiox-*"

# 删除注册表条目（如果有）
Remove-Item -Path "HKCU:\Software\Synkra AIOX" -Recurse
```

#### macOS/Linux

```bash
# 删除配置文件
rm -rf ~/.aiox
rm -rf ~/.config/@synkra/aiox-core

# 删除缓存
rm -rf ~/.cache/@synkra/aiox-core

# 删除临时文件
rm -rf /tmp/aiox-*
```

## 选择性卸载

### 删除特定组件

```bash
# 仅删除代理
npx @synkra/aiox-core uninstall agents

# 仅删除工作流
npx @synkra/aiox-core uninstall workflows

# 删除内存层
npx @synkra/aiox-core uninstall memory-layer

# 删除特定代理
*uninstall agent-name
```

### 保留核心，删除扩展

```bash
# 删除所有插件
*plugin remove --all

# 删除 Squads
rm -rf Squads/

# 删除自定义模板
rm -rf templates/custom/
```

## 数据保留

### 要保留的内容

卸载前，确定要保留的内容：

1. **自定义代理**

   ```bash
   # 复制自定义代理
   cp -r agents/custom/ ~/aiox-backup/agents/
   ```

2. **工作流和任务**

   ```bash
   # 复制工作流
   cp -r workflows/ ~/aiox-backup/workflows/
   cp -r tasks/ ~/aiox-backup/tasks/
   ```

3. **内存数据**

   ```bash
   # 导出内存数据库
   *memory export --format sqlite \
     --destination ~/aiox-backup/memory.db
   ```

4. **配置**

   ```bash
   # 复制所有配置文件
   cp .aiox/config.json ~/aiox-backup/
   cp .env ~/aiox-backup/
   ```

5. **自定义代码**
   ```bash
   # 查找并备份自定义文件
   find . -name "*.custom.*" -exec cp {} ~/aiox-backup/custom/ \;
   ```

## 清洁系统移除

### 完整清理脚本

```bash
#!/bin/bash
echo "Synkra AIOX 完全卸载"
echo "================================="

# 确认
read -p "这将删除所有 Synkra AIOX 数据。继续吗？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# 停止所有进程
echo "停止所有进程..."
pkill -f "@synkra/aiox-core" || true
pkill -f "aiox-developer" || true

# 删除项目文件
echo "删除项目文件..."
rm -rf .aiox/
rm -rf agents/
rm -rf workflows/
rm -rf tasks/
rm -rf templates/
rm -rf Squads/
rm -rf node_modules/@synkra/aiox-core/

# 删除全局文件
echo "删除全局文件..."
npm uninstall -g @synkra/aiox-core

# 删除用户数据
echo "删除用户数据..."
rm -rf ~/.aiox
rm -rf ~/.config/@synkra/aiox-core
rm -rf ~/.cache/@synkra/aiox-core

# 清理 npm 缓存
echo "清理 npm 缓存..."
npm cache clean --force

# 从 package.json 中删除
echo "更新 package.json..."
npm uninstall @synkra/aiox-core/core
npm uninstall @synkra/aiox-core/memory
npm uninstall @synkra/aiox-core/meta-agent

echo "卸载完成！"
```

## 卸载故障排除

### 常见问题

#### 1. 权限被拒绝

```bash
# Linux/macOS
sudo npx @synkra/aiox-core uninstall --complete

# Windows（以管理员身份运行）
npx @synkra/aiox-core uninstall --complete
```

#### 2. 进程仍在运行

```bash
# 强制停止所有进程
# Linux/macOS
killall -9 node
killall -9 @synkra/aiox-core

# Windows
taskkill /F /IM node.exe
taskkill /F /IM @synkra/aiox-core.exe
```

## 卸载验证检查清单

- [ ] 所有 AIOX 进程已停止
- [ ] 项目文件已删除
- [ ] 全局 npm 包已卸载
- [ ] 用户配置文件已删除
- [ ] 缓存目录已清理
- [ ] 环境变量已删除
- [ ] 注册表条目已清理 (Windows)
- [ ] Git 存储库已更新
- [ ] 未找到剩余 AIOX 文件
- [ ] 系统 PATH 已更新

## 获取帮助

如果您在卸载期间遇到问题：

1. **检查文档**
   - [FAQ](https://github.com/SynkraAI/aiox-core/wiki/faq#uninstall)
   - [故障排除](https://github.com/SynkraAI/aiox-core/wiki/troubleshooting)

2. **社区支持**
   - Discord：#uninstall-help
   - GitHub Issues：标记为"uninstall"

---

**记住**：卸载前始终备份您的数据。卸载过程是不可逆的。
