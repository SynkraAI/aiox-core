<!--
  翻译：zh-CN（简体中文）
  原文：/docs/meta-agent-commands.md
  最后同步：2026-02-22
-->

# 元代理命令参考

> 🌐 [EN](../meta-agent-commands.md) | [PT](../pt/meta-agent-commands.md) | [ES](../es/meta-agent-commands.md) | **ZH**

---

Synkra AIOX 所有元代理命令的完整参考指南。

## 目录

1. [命令语法](#命令语法)
2. [核心命令](#核心命令)
3. [代理管理](#代理管理)
4. [任务操作](#任务操作)
5. [工作流命令](#工作流命令)
6. [代码生成](#代码生成)
7. [分析与改进](#分析与改进)
8. [内存层](#内存层)
9. [自我修改](#自我修改)
10. [系统命令](#系统命令)
11. [高级命令](#高级命令)

## 命令语法

所有元代理命令遵循此模式：

```
*command-name [required-param] [--optional-flag value]
```

- 命令以 `*`（星号）开头
- `[]` 中的参数是必需的
- 标志以 `--` 开头，可能有值
- 可以组合多个标志

### 示例

```bash
*create-agent my-agent
*analyze-code src/app.js --depth full
*generate-tests --type unit --coverage 80
```

## 核心命令

### *help

显示所有可用命令或获取特定命令的帮助。

```bash
*help                    # 显示所有命令
*help create-agent       # 特定命令的帮助
*help --category agents  # 按类别显示命令
```

### *status

显示当前系统状态和活动代理。

```bash
*status                  # 基本状态
*status --detailed       # 详细系统信息
*status --health        # 健康检查结果
```

### *config

查看或修改配置。

```bash
*config                  # 查看当前配置
*config --set ai.model gpt-4      # 设置配置值
*config --reset         # 重置为默认值
*config --export        # 导出配置
```

### *version

显示版本信息。

```bash
*version                # 当前版本
*version --check-update # 检查更新
*version --changelog    # 显示更新日志
```

## 代理管理

### *create-agent

创建新的 AI 代理。

```bash
*create-agent <name> [options]

选项：
  --type <type>         代理类型：assistant、analyzer、generator、specialist
  --template <name>     使用模板：basic、advanced、custom
  --capabilities        交互式能力构建器
  --from-file <path>    从 YAML 定义创建

示例：
*create-agent code-reviewer --type analyzer
*create-agent api-builder --template advanced
*create-agent custom-bot --from-file agents/template.yaml
```

### *list-agents

列出所有可用代理。

```bash
*list-agents                      # 列出所有代理
*list-agents --active            # 仅活动代理
*list-agents --type analyzer     # 按类型过滤
*list-agents --detailed          # 显示完整详情
```

### *activate

激活代理以供使用。

```bash
*activate <agent-name>            # 激活单个代理
*activate agent1 agent2          # 激活多个
*activate --all                  # 激活所有代理
*activate --type assistant       # 按类型激活
```

### *deactivate

停用代理。

```bash
*deactivate <agent-name>         # 停用单个代理
*deactivate --all               # 停用所有代理
*deactivate --except agent1     # 停用除指定代理外的所有代理
```

### *modify-agent

修改现有代理配置。

```bash
*modify-agent <name> [options]

选项：
  --add-capability <name>        添加新能力
  --remove-capability <name>     移除能力
  --update-instructions         更新指令
  --version <version>           更新版本
  --interactive                 交互式修改

示例：
*modify-agent helper --add-capability translate
*modify-agent analyzer --update-instructions
*modify-agent bot --interactive
```

### *delete-agent

删除代理（需确认）。

```bash
*delete-agent <name>            # 删除单个代理
*delete-agent --force          # 跳过确认
*delete-agent --backup         # 删除前创建备份
```

### *clone-agent

创建现有代理的副本。

```bash
*clone-agent <source> <target>  # 基本克隆
*clone-agent bot bot-v2 --modify  # 克隆并修改
```

## 任务操作

### *create-task

创建新的可重用任务。

```bash
*create-task <name> [options]

选项：
  --type <type>           任务类型：command、automation、analysis
  --description <text>    任务描述
  --parameters           交互式定义参数
  --template <name>      使用任务模板

示例：
*create-task validate-input --type command
*create-task daily-backup --type automation
*create-task code-metrics --template analyzer
```

### *list-tasks

列出可用任务。

```bash
*list-tasks                     # 列出所有任务
*list-tasks --type automation  # 按类型过滤
*list-tasks --recent          # 最近使用的任务
*list-tasks --search <query>  # 搜索任务
```

### *run-task

执行特定任务。

```bash
*run-task <task-name> [params]

示例：
*run-task validate-input --data "user input"
*run-task generate-report --format pdf
*run-task backup-database --incremental
```

### *schedule-task

计划任务执行。

```bash
*schedule-task <task> <schedule>

计划格式：
  --cron "0 0 * * *"           Cron 表达式
  --every "1 hour"             间隔
  --at "14:30"                 特定时间
  --on "monday,friday"         特定日期

示例：
*schedule-task cleanup --cron "0 2 * * *"
*schedule-task report --every "6 hours"
*schedule-task backup --at "03:00" --on "sunday"
```

### *modify-task

更新任务配置。

```bash
*modify-task <name> [options]

选项：
  --add-param <name>           添加参数
  --update-logic              更新实现
  --change-type <type>        更改任务类型
  --rename <new-name>         重命名任务
```

## 工作流命令

### *create-workflow

创建自动化工作流。

```bash
*create-workflow <name> [options]

选项：
  --steps                交互式步骤构建器
  --trigger <type>      触发器类型：manual、schedule、event
  --template <name>     使用工作流模板
  --from-file <path>    从 YAML 导入

示例：
*create-workflow ci-pipeline --trigger push
*create-workflow daily-tasks --trigger "schedule:0 9 * * *"
*create-workflow deployment --template standard-deploy
```

### *list-workflows

显示可用工作流。

```bash
*list-workflows                 # 所有工作流
*list-workflows --active       # 当前运行中
*list-workflows --scheduled    # 已计划的工作流
*list-workflows --failed       # 失败的执行
```

### *run-workflow

执行工作流。

```bash
*run-workflow <name> [options]

选项：
  --params <json>             工作流参数
  --skip-steps <steps>        跳过特定步骤
  --dry-run                   预览而不执行
  --force                     即使正在运行也强制运行

示例：
*run-workflow deploy --params '{"env":"staging"}'
*run-workflow backup --skip-steps "upload"
*run-workflow test-suite --dry-run
```

### *stop-workflow

停止运行中的工作流。

```bash
*stop-workflow <name>          # 停止特定工作流
*stop-workflow --all          # 停止所有工作流
*stop-workflow --force        # 强制停止
```

### *workflow-status

检查工作流执行状态。

```bash
*workflow-status <name>        # 单个工作流状态
*workflow-status --all        # 所有工作流状态
*workflow-status --history    # 执行历史
```

## 代码生成

### *generate-component

使用 AI 辅助生成新组件。

```bash
*generate-component <name> [options]

选项：
  --type <type>              组件类型：react、vue、angular、web-component
  --features <list>          组件特性
  --style <type>             样式：css、scss、styled-components
  --tests                    生成测试
  --storybook               生成 Storybook 故事
  --template <name>         使用组件模板

示例：
*generate-component UserProfile --type react --features "avatar,bio,stats"
*generate-component DataTable --type vue --tests --storybook
*generate-component CustomButton --template material-ui
```

### *generate-api

生成 API 端点。

```bash
*generate-api <resource> [options]

选项：
  --operations <list>        CRUD 操作：create、read、update、delete
  --auth                     添加认证
  --validation              添加输入验证
  --docs                    生成 API 文档
  --tests                   生成 API 测试
  --database <type>         数据库类型：postgres、mongodb、mysql

示例：
*generate-api users --operations crud --auth --validation
*generate-api products --database mongodb --docs
*generate-api analytics --operations "read" --tests
```

### *generate-tests

生成测试套件。

```bash
*generate-tests [target] [options]

选项：
  --type <type>             测试类型：unit、integration、e2e
  --framework <name>        测试框架：jest、mocha、cypress
  --coverage <percent>      目标覆盖率百分比
  --mocks                   生成模拟数据
  --fixtures               生成测试夹具

示例：
*generate-tests src/utils/ --type unit --coverage 90
*generate-tests src/api/ --type integration --mocks
*generate-tests --type e2e --framework cypress
```

### *generate-documentation

生成文档。

```bash
*generate-documentation [target] [options]

选项：
  --format <type>           格式：markdown、html、pdf
  --type <type>            文档类型：api、user-guide、technical
  --include-examples       添加代码示例
  --diagrams              生成图表
  --toc                   生成目录

示例：
*generate-documentation src/ --type api --format markdown
*generate-documentation --type user-guide --include-examples
*generate-documentation components/ --diagrams --toc
```

## 分析与改进

### *analyze-framework

分析整个代码库。

```bash
*analyze-framework [options]

选项：
  --depth <level>          分析深度：surface、standard、deep
  --focus <areas>          关注领域：performance、security、quality
  --report-format <type>   格式：console、json、html
  --save-report <path>     保存分析报告
  --compare-previous      与之前的分析比较

示例：
*analyze-framework --depth deep
*analyze-framework --focus "performance,security"
*analyze-framework --save-report reports/analysis.json
```

### *analyze-code

分析特定代码文件。

```bash
*analyze-code <path> [options]

选项：
  --metrics               显示代码指标
  --complexity           分析复杂度
  --dependencies         分析依赖项
  --suggestions          获取改进建议
  --security             安全分析

示例：
*analyze-code src/app.js --metrics --complexity
*analyze-code src/api/ --security --suggestions
*analyze-code package.json --dependencies
```

### *improve-code-quality

使用 AI 辅助改进代码质量。

```bash
*improve-code-quality <path> [options]

选项：
  --focus <aspects>        关注点：readability、performance、maintainability
  --refactor-level <level> 级别：minor、moderate、major
  --preserve-logic        不改变功能
  --add-comments          添加解释性注释
  --fix-eslint           修复 linting 问题

示例：
*improve-code-quality src/utils.js --focus readability
*improve-code-quality src/legacy/ --refactor-level major
*improve-code-quality src/api.js --fix-eslint --add-comments
```

### *suggest-refactoring

获取重构建议。

```bash
*suggest-refactoring <path> [options]

选项：
  --type <type>           重构类型：extract、inline、rename
  --scope <level>         范围：function、class、module、project
  --impact-analysis      显示更改影响
  --preview              预览更改
  --auto-apply          自动应用建议

示例：
*suggest-refactoring src/helpers.js --type extract
*suggest-refactoring src/models/ --scope module
*suggest-refactoring src/app.js --preview --impact-analysis
```

### *detect-patterns

检测代码模式和反模式。

```bash
*detect-patterns [path] [options]

选项：
  --patterns <list>       要检测的特定模式
  --anti-patterns        关注反模式
  --suggest-fixes        建议模式改进
  --severity <level>     最低严重级别：low、medium、high

示例：
*detect-patterns --anti-patterns --suggest-fixes
*detect-patterns src/ --patterns "singleton,factory"
*detect-patterns --severity high
```

## 内存层

### *memory

内存层操作。

```bash
*memory <operation> [options]

操作：
  status                 显示内存层状态
  search <query>        语义搜索
  rebuild               重建内存索引
  clear-cache          清除内存缓存
  optimize             优化内存性能
  export <path>        导出内存数据
  import <path>        导入内存数据

示例：
*memory status
*memory search "authentication flow"
*memory rebuild --verbose
*memory optimize --aggressive
```

### *learn

从代码更改和模式中学习。

```bash
*learn [options]

选项：
  --from <source>         来源：recent-changes、commits、patterns
  --period <time>         时间段："1 week"、"1 month"
  --focus <areas>         学习关注领域
  --update-patterns      更新模式识别
  --save-insights        保存学习洞察

示例：
*learn --from recent-changes
*learn --from commits --period "1 week"
*learn --focus "error-handling,api-calls"
```

### *remember

在内存中存储重要信息。

```bash
*remember <key> <value> [options]

选项：
  --type <type>          信息类型：pattern、preference、rule
  --context <context>    内存的上下文
  --expires <time>       过期时间
  --priority <level>     优先级：low、normal、high

示例：
*remember coding-style "use-functional-components" --type preference
*remember api-pattern "always-validate-input" --context security
*remember temp-fix "skip-test-x" --expires "1 week"
```

### *forget

从内存中移除信息。

```bash
*forget <key>              # 忘记特定键
*forget --pattern <regex>  # 按模式忘记
*forget --older-than <time> # 忘记旧记忆
*forget --type <type>      # 按类型忘记
```

## 自我修改

### *improve-self

元代理自我改进。

```bash
*improve-self [options]

选项：
  --aspect <area>         改进领域：speed、accuracy、features
  --based-on <data>      基于：usage、feedback、analysis
  --preview              预览改进
  --backup              更改前创建备份
  --test-improvements   应用前测试改进

示例：
*improve-self --aspect accuracy --based-on feedback
*improve-self --preview --test-improvements
*improve-self --aspect features --backup
```

### *evolve

基于使用情况演化能力。

```bash
*evolve [options]

选项：
  --strategy <type>      演化策略：conservative、balanced、aggressive
  --focus <areas>        演化关注领域
  --generations <num>    演化周期数
  --fitness-metric      定义适应度指标
  --rollback-point     创建回滚点

示例：
*evolve --strategy balanced
*evolve --focus "code-generation,analysis" --generations 3
*evolve --fitness-metric "task-success-rate" --rollback-point
```

### *adapt

适应项目特定需求。

```bash
*adapt [options]

选项：
  --to <context>         适应目标：project-type、team-style、domain
  --learn-from <source>  学习来源：codebase、commits、reviews
  --adaptation-level     级别：minimal、moderate、full
  --preserve <aspects>   保留特定行为

示例：
*adapt --to project-type --learn-from codebase
*adapt --to team-style --adaptation-level moderate
*adapt --to domain --preserve "core-functions"
```

### *optimize-performance

优化元代理性能。

```bash
*optimize-performance [options]

选项：
  --target <metric>      目标：speed、memory、accuracy
  --profile             优化前分析
  --benchmark          运行基准测试
  --aggressive         激进优化
  --safe-mode         仅安全优化

示例：
*optimize-performance --target speed --profile
*optimize-performance --target memory --safe-mode
*optimize-performance --benchmark --aggressive
```

## 系统命令

### *backup

创建系统备份。

```bash
*backup [options]

选项：
  --include <items>      项目：config、agents、memory、all
  --exclude <items>     排除特定项目
  --destination <path>  备份目标位置
  --compress           压缩备份
  --encrypt           加密备份

示例：
*backup --include all --compress
*backup --include "agents,config" --destination backups/
*backup --exclude memory --encrypt
```

### *restore

从备份恢复。

```bash
*restore <backup-file> [options]

选项：
  --items <list>        要恢复的特定项目
  --preview            预览恢复操作
  --force             强制恢复而不确认
  --merge             与现有数据合并

示例：
*restore backups/backup-2024-01-01.zip
*restore backup.tar.gz --items "agents,config"
*restore latest-backup --preview
```

### *update

更新 Synkra AIOX。

```bash
*update [options]

选项：
  --check              仅检查更新
  --version <version>  更新到特定版本
  --beta              包含测试版
  --force            强制更新
  --backup          更新前创建备份

示例：
*update --check
*update --version 2.0.0 --backup
*update --beta --force
```

### *uninstall

卸载组件或整个系统。

```bash
*uninstall [component] [options]

选项：
  --keep-data         保留用户数据
  --keep-config      保留配置
  --complete         完全卸载
  --dry-run         预览卸载

示例：
*uninstall agent-name
*uninstall --complete --keep-data
*uninstall memory-layer --dry-run
```

### *doctor

系统诊断和修复。

```bash
*doctor [options]

选项：
  --fix              自动修复检测到的问题
  --deep            深度系统扫描
  --report <path>   保存诊断报告
  --component <name> 检查特定组件

示例：
*doctor
*doctor --fix
*doctor --deep --report diagnosis.json
*doctor --component memory-layer
```

## 高级命令

### *export

导出配置、代理或数据。

```bash
*export <type> [options]

类型：
  config              导出配置
  agents             导出代理
  workflows          导出工作流
  memory            导出内存数据
  all              导出所有内容

选项：
  --format <type>     格式：json、yaml、archive
  --destination <path> 导出目标位置
  --include-sensitive 包含敏感数据
  --pretty          美化格式

示例：
*export config --format yaml
*export agents --destination exports/agents/
*export all --format archive --destination backup.zip
```

### *import

导入配置、代理或数据。

```bash
*import <file> [options]

选项：
  --type <type>       导入类型：config、agents、workflows
  --merge            与现有合并
  --replace         替换现有
  --validate       导入前验证
  --dry-run       预览导入

示例：
*import agents.json --type agents --merge
*import config.yaml --replace --validate
*import backup.zip --dry-run
```

### *benchmark

运行性能基准测试。

```bash
*benchmark [suite] [options]

套件：
  all               运行所有基准测试
  generation       代码生成速度
  analysis        分析性能
  memory          内存操作
  e2e            端到端工作流

选项：
  --iterations <num>   迭代次数
  --compare <baseline> 与基线比较
  --save-results      保存基准结果
  --profile          包含分析数据

示例：
*benchmark all --iterations 10
*benchmark generation --compare v1.0.0
*benchmark memory --profile --save-results
```

### *debug

调试模式操作。

```bash
*debug <command> [options]

命令：
  enable              启用调试模式
  disable            禁用调试模式
  logs <level>       显示调试日志
  trace <operation>  跟踪特定操作
  breakpoint <location> 设置断点

选项：
  --verbose          详细输出
  --filter <pattern> 过滤调试输出
  --save <path>     保存调试会话

示例：
*debug enable --verbose
*debug logs error --filter "api"
*debug trace create-agent --save debug-session.log
```

### *plugin

插件管理。

```bash
*plugin <operation> [options]

操作：
  install <name>      安装插件
  remove <name>      移除插件
  list              列出已安装插件
  search <query>    搜索可用插件
  create <name>     创建新插件

选项：
  --version <ver>     插件版本
  --source <url>     插件来源
  --enable          安装后启用
  --dev            开发模式

示例：
*plugin install code-formatter --enable
*plugin create my-custom-plugin --dev
*plugin search "testing"
*plugin list --detailed
```

## 命令快捷方式

常用命令有快捷方式：

```bash
*h     → *help
*s     → *status
*la    → *list-agents
*lt    → *list-tasks
*lw    → *list-workflows
*ca    → *create-agent
*ct    → *create-task
*cw    → *create-workflow
*a     → *analyze-framework
*i     → *improve-code-quality
```

## 命令链接

链接多个命令：

```bash
# 使用 && 顺序执行
*analyze-framework && *suggest-improvements && *generate-report

# 使用管道传递数据流
*analyze-code src/ | *improve-code-quality | *generate-tests

# 使用 ; 独立执行
*backup ; *update ; *doctor --fix
```

## 交互模式

进入交互模式以连续执行命令：

```bash
*interactive

AIOX> create-agent helper
AIOX> activate helper
AIOX> helper translate "Hello" --to spanish
AIOX> exit
```

## 环境变量

使用环境变量控制行为：

```bash
AIOX_AI_PROVIDER=openai          # AI 提供商
AIOX_AI_MODEL=gpt-4             # AI 模型
AIOX_LOG_LEVEL=debug            # 日志级别
AIOX_TELEMETRY=disabled         # 遥测设置
AIOX_TIMEOUT=30000             # 命令超时（毫秒）
AIOX_MEMORY_CACHE=true         # 内存缓存
```

## 错误处理

常见错误响应和解决方案：

```bash
# 权限被拒绝
*sudo <command>                 # 以提升权限运行

# 命令未找到
*help <command>                # 检查正确的命令名称
*update                       # 更新到最新版本

# 超时错误
*config --set timeout 60000   # 增加超时
*<command> --async           # 异步运行

# 内存错误
*memory clear-cache          # 清除内存缓存
*optimize-performance --target memory
```

---

**专业提示：**

1. 多使用 `*help <command>` - 它提供详细示例
2. Tab 补全适用于命令和参数
3. 可以使用上/下箭头查看命令历史
4. 使用 `--dry-run` 预览危险操作
5. 结合管道和链接命令以实现强大的工作流

记住：元代理从您的使用模式中学习。您使用得越多，它就越能预测您的需求！
