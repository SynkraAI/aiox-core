# 记忆系统 - 完整架构指南

<!--
  本文件由翻译工具生成
  源文件: docs/guides/MEMORY-SYSTEM.md
  翻译日期: 2026-02-22
-->

**版本:** 1.0
**最后更新:** 2026-02-09
**作者:** @architect (Aria)
**标签:** memory, session, persistence, context, gotchas, timeline, hooks

---

## 目录

1. [概述](#概述)
2. [完整架构图](#完整架构图)
3. [第一层: Claude Code 原生](#第一层-claude-code-原生)
4. [第二层: AIOS 框架](#第二层-aios-框架)
5. [代理激活流程 (记忆加载)](#代理激活流程-记忆加载)
6. [持久化流程 (记忆保存)](#持久化流程-记忆保存)
7. [会话生命周期流程](#会话生命周期流程)
8. [Gotchas 记忆 - 自动捕获流程](#gotchas-记忆---自动捕获流程)
9. [上下文快照与恢复](#上下文快照与恢复)
10. [Timeline Manager - 统一门面](#timeline-manager---统一门面)
11. [Hooks 系统 - 跨 CLI 抽象](#hooks-系统---跨-cli-抽象)
12. [完整文件映射](#完整文件映射)
13. [持久化存储映射](#持久化存储映射)
14. [已知缺口与限制](#已知缺口与限制)
15. [参考](#参考)

---

## 概述

AIOS 的记忆系统在**两个独立的层**上运行，它们共存但**彼此不通信**：

| 层 | 管理者 | 范围 |
|--------|---------------|--------|
| **第一层: Claude Code 原生** | Claude Code CLI | 自动记忆, CLAUDE.md, 会话转录 |
| **第二层: AIOS 框架** | `.aios-core/` 中的 JS 脚本 | Gotchas, 会话状态, 上下文快照, Timeline |

### 关键原则

- **没有自动 session-digest** — 当 Claude Code 会话关闭时，不会发生汇总
- **没有自动 memory-flush** — MEMORY.md 仅在会话期间由 Claude 更新
- **会话 hooks 存在于 Gemini** 但未在 Claude Code 中连接
- **每层独立持久化** — `.claude/` vs `.aios/`

---

## 完整架构图

### 两层视图

```mermaid
flowchart TB
    subgraph CLAUDE_NATIVE["第一层: Claude Code 原生"]
        direction TB
        CLAUDE_MD_G["CLAUDE.md 全局<br/>~/.claude/CLAUDE.md"]
        CLAUDE_MD_W["CLAUDE.md 工作区<br/>Workspaces/.claude/CLAUDE.md"]
        CLAUDE_MD_P["CLAUDE.md 项目<br/>aios-core/.claude/CLAUDE.md"]
        RULES["Rules/*.md<br/>5 个规则文件"]
        AUTO_MEM["自动记忆<br/>~/.claude/projects/.../memory/MEMORY.md<br/>前 200 行在 system prompt 中"]
        COMPOUND["复合分析<br/>memory/compound-analysis/<br/>11 个文件 (9 内容 + manifest + summary)"]
        AGENT_MEM["代理记忆<br/>.claude/agent-memory/{agent}/MEMORY.md<br/>6 个有记忆的代理"]
        TRANSCRIPTS["会话转录<br/>~/.claude/projects/.../{session}.jsonl"]
        SESSIONS_IDX["会话索引<br/>sessions-index.json"]
    end

    subgraph AIOS_FRAMEWORK["第二层: AIOS 框架"]
        direction TB
        GOTCHAS["Gotchas 记忆<br/>.aios-core/core/memory/gotchas-memory.js"]
        CTX_SNAP["上下文快照<br/>.aios-core/core/memory/context-snapshot.js"]
        FILE_EVO["文件演化追踪器<br/>.aios-core/core/memory/file-evolution-tracker.js"]
        TIMELINE["Timeline Manager<br/>.aios-core/core/memory/timeline-manager.js"]
        CTX_LOADER["会话上下文加载器<br/>.aios-core/core/session/context-loader.js"]
        CTX_DETECT["上下文检测器<br/>.aios-core/core/session/context-detector.js"]
        SESS_STATE["会话状态<br/>.aios-core/core/orchestration/session-state.js"]
        HOOKS_GEM["Gemini Hooks<br/>.aios-core/hooks/gemini/"]
        HOOKS_UNI["统一 Hooks<br/>.aios-core/hooks/unified/"]
    end

    subgraph STORAGE_CLAUDE["Claude Code 存储"]
        S_MEMORY["~/.claude/projects/.../memory/"]
        S_SESSIONS["~/.claude/projects/.../*.jsonl"]
        S_AGENT_MEM[".claude/agent-memory/"]
    end

    subgraph STORAGE_AIOS["AIOS 存储 (.aios/)"]
        S_GOTCHAS[".aios/gotchas.json + .md"]
        S_ERRORS[".aios/error-tracking.json"]
        S_SNAPSHOTS[".aios/snapshots/"]
        S_TIMELINE[".aios/timeline/"]
        S_FILE_EVO[".aios/file-evolution/"]
        S_SESSION[".aios/session-state.json"]
        S_EPIC_STATE["docs/stories/.session-state.yaml"]
    end

    AUTO_MEM --> S_MEMORY
    AGENT_MEM --> S_AGENT_MEM
    TRANSCRIPTS --> S_SESSIONS

    GOTCHAS --> S_GOTCHAS
    GOTCHAS --> S_ERRORS
    CTX_SNAP --> S_SNAPSHOTS
    FILE_EVO --> S_FILE_EVO
    TIMELINE --> S_TIMELINE
    CTX_LOADER --> S_SESSION
    SESS_STATE --> S_EPIC_STATE

    style CLAUDE_NATIVE fill:#E3F2FD,stroke:#1565C0
    style AIOS_FRAMEWORK fill:#FFF3E0,stroke:#E65100
    style STORAGE_CLAUDE fill:#E8F5E9,stroke:#2E7D32
    style STORAGE_AIOS fill:#FCE4EC,stroke:#C62828
```

### 脚本间关系

```mermaid
flowchart LR
    subgraph MEMORY_LAYER["记忆层 (.aios-core/core/memory/)"]
        TM["timeline-manager.js"]
        FET["file-evolution-tracker.js"]
        CS["context-snapshot.js"]
        GM["gotchas-memory.js"]
    end

    subgraph SESSION_LAYER["会话层 (.aios-core/core/session/)"]
        CL["context-loader.js"]
        CD["context-detector.js"]
    end

    subgraph ORCHESTRATION["编排 (.aios-core/core/orchestration/)"]
        SS["session-state.js"]
    end

    subgraph ACTIVATION["激活管道 (.aios-core/development/scripts/)"]
        UAP["unified-activation-pipeline.js"]
        GB["greeting-builder.js"]
    end

    subgraph HOOKS["Hooks 系统 (.aios-core/hooks/)"]
        HS["gemini/session-start.js"]
        HE["gemini/session-end.js"]
        HI["unified/hook-interface.js"]
        HR["unified/hook-registry.js"]
    end

    TM -->|"集成"| FET
    TM -->|"集成"| CS
    CL -->|"使用"| CD
    UAP -->|"Tier 3"| CL
    UAP -->|"调用"| GB
    GB -->|"读取"| SS
    HI -->|"抽象"| HS
    HI -->|"抽象"| HE
    HR -->|"注册"| HI

    style MEMORY_LAYER fill:#FFF9C4,stroke:#F9A825
    style SESSION_LAYER fill:#E1F5FE,stroke:#0277BD
    style ORCHESTRATION fill:#F3E5F5,stroke:#7B1FA2
    style ACTIVATION fill:#E8F5E9,stroke:#388E3C
    style HOOKS fill:#FFCCBC,stroke:#BF360C
```

---

## 第一层: Claude Code 原生

### 加载层次结构 (每个新会话)

```mermaid
flowchart TD
    START([Claude Code 会话启动]) --> LOAD_GLOBAL

    subgraph LOAD["自动加载 — 固定顺序"]
        LOAD_GLOBAL["1. ~/.claude/CLAUDE.md<br/>用户全局指令"]
        LOAD_WORKSPACE["2. Workspaces/.claude/CLAUDE.md<br/>工作区级指令"]
        LOAD_PROJECT["3. aios-core/.claude/CLAUDE.md<br/>项目级指令"]
        LOAD_RULES["4. aios-core/.claude/rules/*.md<br/>5 个详细规则文件"]
        LOAD_MEMORY["5. ~/.claude/projects/.../memory/MEMORY.md<br/>自动记忆 (前 200 行)"]
    end

    LOAD_GLOBAL --> LOAD_WORKSPACE
    LOAD_WORKSPACE --> LOAD_PROJECT
    LOAD_PROJECT --> LOAD_RULES
    LOAD_RULES --> LOAD_MEMORY

    LOAD_MEMORY --> READY([System Prompt 已构建])

    style LOAD fill:#E3F2FD,stroke:#1565C0
    style READY fill:#C8E6C9,stroke:#2E7D32
```

### 自动记忆 — 读写流程

```mermaid
flowchart TD
    subgraph READ_FLOW["读取 (自动 — 每个会话)"]
        R1([会话启动]) --> R2["Claude Code 读取 MEMORY.md"]
        R2 --> R3{"超过 200 行?"}
        R3 -->|"是"| R4["在限制处截断<br/>忽略第 201+ 行"]
        R3 -->|"否"| R5["完整加载"]
        R4 --> R6["注入 system prompt"]
        R5 --> R6
    end

    subgraph WRITE_FLOW["写入 (会话期间 — Claude 决定)"]
        W1["Claude 发现模式、<br/>错误或洞察"] --> W2{"Claude 决定<br/>保存到记忆?"}
        W2 -->|"是"| W3["使用 Write/Edit 工具<br/>更新 MEMORY.md"]
        W2 -->|"否"| W4["会话结束时<br/>知识丢失"]
        W3 --> W5["可选地在<br/>memory/compound-analysis/<br/>中创建主题文件"]
    end

    subgraph NO_FLUSH["会话结束"]
        E1([会话关闭]) --> E2["转录保存<br/>为 .jsonl"]
        E2 --> E3["没有其他事情发生"]
        E3 --> E4["没有 session-digest"]
        E4 --> E5["没有 memory-flush"]
        E5 --> E6["没有汇总"]
    end

    style READ_FLOW fill:#E8F5E9,stroke:#2E7D32
    style WRITE_FLOW fill:#FFF9C4,stroke:#F9A825
    style NO_FLUSH fill:#FFCDD2,stroke:#C62828
```

### 代理记忆 — 按代理

```mermaid
flowchart LR
    subgraph AGENT_MEM[".claude/agent-memory/"]
        AM1["aios-architect/MEMORY.md"]
        AM2["aios-dev/MEMORY.md"]
        AM3["oalanicolas/MEMORY.md"]
        AM4["pedro-valerio/MEMORY.md"]
        AM5["sop-extractor/MEMORY.md"]
        AM6["squad/MEMORY.md"]
    end

    SQUAD_AGENTS["Squad 代理<br/>(Claude Code Agents)"] -->|"frontmatter<br/>memory: project"| AGENT_MEM

    NOTE["注意: 只有定义在<br/>.claude/agents/ 中的代理<br/>使用此记忆。<br/>AIOS 代理 (.aios-core/<br/>development/agents/)<br/>不使用。"]

    style AGENT_MEM fill:#F3E5F5,stroke:#7B1FA2
    style NOTE fill:#FFF9C4,stroke:#F9A825
```

---

## 第二层: AIOS 框架

### 4 个记忆模块视图

```mermaid
flowchart TD
    subgraph GOTCHAS["gotchas-memory.js — Epic 9, Story 9.4"]
        G1["自动捕获: 错误 3x = gotcha"]
        G2["手动: *gotcha {desc}"]
        G3["查询: *gotchas"]
        G4["注入: getContextForTask()"]
        G5[("持久化到:<br/>.aios/gotchas.json<br/>.aios/gotchas.md<br/>.aios/error-tracking.json")]
    end

    subgraph SNAPSHOTS["context-snapshot.js — Story 12.6"]
        S1["capture(): 保存当前上下文"]
        S2["restore(): 恢复快照"]
        S3["list(): 列出快照"]
        S4["cleanup(): 最多 50 个, 7 天"]
        S5[("持久化到:<br/>.aios/snapshots/{id}.json")]
    end

    subgraph FILE_EVO["file-evolution-tracker.js"]
        F1["trackChange(): 记录变更"]
        F2["detectDrift(): 潜在冲突"]
        F3["getEvolution(): 文件历史"]
        F4[("持久化到:<br/>.aios/file-evolution/<br/>evolution-index.json")]
    end

    subgraph TIMELINE_MGR["timeline-manager.js — 统一门面"]
        T1["getUnifiedTimeline(): 所有来源"]
        T2["addEvent(): 手动事件"]
        T3["autoSync(): 定期同步 (60s)"]
        T4[("持久化到:<br/>.aios/timeline/<br/>unified-timeline.json")]
    end

    TIMELINE_MGR -->|"集成"| SNAPSHOTS
    TIMELINE_MGR -->|"集成"| FILE_EVO

    style GOTCHAS fill:#FFECB3,stroke:#FF8F00
    style SNAPSHOTS fill:#E1F5FE,stroke:#0277BD
    style FILE_EVO fill:#F1F8E9,stroke:#558B2F
    style TIMELINE_MGR fill:#F3E5F5,stroke:#7B1FA2
```

### 3 个会话模块视图

```mermaid
flowchart TD
    subgraph CTX_DETECT["context-detector.js"]
        CD1["detectSessionType()"]
        CD2{"有对话<br/>历史?"}
        CD3["分析最近命令"]
        CD4["读取 .aios/session-state.json"]
        CD5["返回: new | existing | workflow"]
        CD6{"TTL 过期?<br/>(1 小时)"}

        CD1 --> CD2
        CD2 -->|"是"| CD3
        CD2 -->|"否"| CD4
        CD3 --> CD5
        CD4 --> CD6
        CD6 -->|"是"| CD7["返回: new"]
        CD6 -->|"否"| CD5
    end

    subgraph CTX_LOADER["context-loader.js"]
        CL1["loadContext(agentId)"]
        CL2["通过 ContextDetector 检测会话"]
        CL3["读取 session-state.json"]
        CL4["getPreviousAgent()"]
        CL5["generateContextMessage()"]
        CL6["返回: 类型, 消息, 前一代理,<br/>命令, 活动工作流"]
        CL7["updateSessionState()"]
        CL8["onTaskComplete()"]
        CL9[("持久化到:<br/>.aios/session-state.json<br/>TTL: 1 小时")]

        CL1 --> CL2
        CL2 --> CL3
        CL3 --> CL4
        CL4 --> CL5
        CL5 --> CL6
        CL7 --> CL9
        CL8 --> CL9
    end

    subgraph SESS_STATE["session-state.js — Story 11.5"]
        SS1["createSessionState()"]
        SS2["loadSessionState()"]
        SS3["recordPhaseChange()"]
        SS4["recordStoryCompleted()"]
        SS5["detectCrash() — 30 分钟阈值"]
        SS6["getResumeSummary()"]
        SS7[("持久化到:<br/>docs/stories/<br/>.session-state.yaml<br/>无 TTL — 永久")]

        SS1 --> SS7
        SS2 --> SS7
        SS3 --> SS7
        SS4 --> SS7
    end

    CTX_DETECT -->|"被使用"| CTX_LOADER

    style CTX_DETECT fill:#E3F2FD,stroke:#1565C0
    style CTX_LOADER fill:#E8F5E9,stroke:#2E7D32
    style SESS_STATE fill:#FFF3E0,stroke:#E65100
```

---

## 代理激活流程 (记忆加载)

### 带分层加载的完整管道

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant UAP as UnifiedActivationPipeline
    participant ACL as AgentConfigLoader
    participant PM as PermissionMode
    participant GCD as GitConfigDetector
    participant SCL as SessionContextLoader
    participant PSL as ProjectStatusLoader
    participant CD as ContextDetector
    participant SS as SessionState
    participant GB as GreetingBuilder

    CC->>UAP: activate(agentId)
    UAP->>UAP: _loadCoreConfig()

    Note over UAP: 管道之前, Claude Code<br/>已加载: CLAUDE.md (3 级),<br/>rules/*.md, MEMORY.md (200 行)

    rect rgb(255, 200, 200)
        Note over UAP,ACL: Tier 1 — 关键 (80ms)
        UAP->>ACL: loadComplete(coreConfig)
        ACL-->>UAP: 代理定义, 命令, 人设
    end

    Note over UAP: 如果 Tier 1 失败 → 回退 greeting

    rect rgb(255, 230, 180)
        Note over UAP,GCD: Tier 2 — 高 (120ms, 并行)
        par
            UAP->>PM: load() + getBadge()
            PM-->>UAP: {mode, badge}
        and
            UAP->>GCD: get()
            GCD-->>UAP: {branch, type}
        end
    end

    rect rgb(200, 230, 255)
        Note over UAP,PSL: Tier 3 — 尽力 (180ms, 并行)
        par
            UAP->>SCL: loadContext(agentId)
            SCL->>CD: detectSessionType()
            CD-->>SCL: new | existing | workflow
            SCL-->>UAP: {sessionType, previousAgent, lastCommands, workflow}
        and
            UAP->>PSL: loadProjectStatus()
            PSL-->>UAP: {branch, modifiedFiles, activeStory}
        end
    end

    Note over UAP: 顺序阶段 (依赖数据)

    UAP->>UAP: _detectSessionType()
    UAP->>UAP: _detectWorkflowState()

    UAP->>GB: buildGreeting(agent, enrichedContext)
    GB->>SS: 查询 .session-state.yaml (如果 epic 活动)
    SS-->>GB: Epic/story 状态
    GB-->>UAP: 格式化的 greeting

    UAP-->>CC: {greeting, quality: full|partial|fallback}

    Note over CC: 没有 AIOS 记忆<br/>自动加载<br/>到 system prompt。<br/>仅会话上下文<br/>出现在 greeting 中。
```

---

## 持久化流程 (记忆保存)

### 每种记忆类型何时何处保存

```mermaid
flowchart TD
    subgraph TRIGGERS["触发保存的事件"]
        T1["代理激活"]
        T2["命令执行"]
        T3["任务完成"]
        T4["错误发生"]
        T5["错误重复 3 次"]
        T6["*gotcha {desc}"]
        T7["阶段变更"]
        T8["Story 完成"]
        T9["手动快照"]
        T10["文件修改"]
    end

    subgraph SAVES["保存的内容"]
        S1[".aios/session-state.json<br/>当前代理, 命令, 工作流"]
        S2[".aios/error-tracking.json<br/>错误发生"]
        S3[".aios/gotchas.json<br/>新自动捕获的 gotcha"]
        S4[".aios/gotchas.json<br/>添加的手动 gotcha"]
        S5["docs/stories/.session-state.yaml<br/>更新的阶段"]
        S6["docs/stories/.session-state.yaml<br/>Story 标记完成"]
        S7[".aios/snapshots/{id}.json<br/>捕获的上下文"]
        S8[".aios/file-evolution/<br/>记录的演化"]
    end

    T1 --> S1
    T2 --> S1
    T3 --> S1
    T4 --> S2
    T5 --> S3
    T6 --> S4
    T7 --> S5
    T8 --> S6
    T9 --> S7
    T10 --> S8

    style TRIGGERS fill:#E3F2FD,stroke:#1565C0
    style SAVES fill:#FFF3E0,stroke:#E65100
```

### 详细流程: context-loader 保存

```mermaid
sequenceDiagram
    participant Agent as 活动代理
    participant CL as context-loader.js
    participant FS as FileSystem

    Agent->>CL: updateSessionState(agentId, command)
    CL->>FS: 读取 .aios/session-state.json
    FS-->>CL: 当前状态 (或空)

    CL->>CL: 更新 lastActivity
    CL->>CL: 添加代理到 agentSequence (最多 20)
    CL->>CL: 添加命令到 lastCommands (最多 10)
    CL->>CL: 从命令推断 workflowState

    CL->>FS: 写入 .aios/session-state.json
    FS-->>CL: OK

    Note over Agent,FS: 工作流推断:<br/>36 个 task→state 映射<br/>例: validate-next-story →<br/>{workflow: story_development,<br/>state: validated}

    Agent->>CL: onTaskComplete(taskName, result)
    CL->>CL: 添加到 taskHistory (最多 20)
    CL->>CL: 更新 workflowState
    CL->>FS: 写入 .aios/session-state.json
```

---

## 会话生命周期流程

### 会话完整周期

```mermaid
stateDiagram-v2
    [*] --> SessionStart: Claude Code 打开

    state SessionStart {
        [*] --> LoadCLAUDE: 加载 CLAUDE.md (3 级)
        LoadCLAUDE --> LoadRules: 加载 rules/*.md
        LoadRules --> LoadMemory: 加载 MEMORY.md (200 行)
        LoadMemory --> Ready: System prompt 已构建
    }

    SessionStart --> AgentActivation: 用户激活 @代理

    state AgentActivation {
        [*] --> Tier1: AgentConfig (80ms)
        Tier1 --> Tier2: PermissionMode + Git (120ms)
        Tier2 --> Tier3: SessionContext + ProjectStatus (180ms)
        Tier3 --> Greeting: GreetingBuilder 构建问候
    }

    AgentActivation --> Working: 代理就绪

    state Working {
        [*] --> ExecuteTask
        ExecuteTask --> SaveSessionState: 更新 session-state.json
        ExecuteTask --> TrackError: 如果发生错误
        TrackError --> CheckRepeat: error-tracking.json
        CheckRepeat --> AutoGotcha: 同一错误 3 次
        ExecuteTask --> SavePhase: 如果阶段变更
        SavePhase --> UpdateYAML: .session-state.yaml
        ExecuteTask --> ClaudeMemory: Claude 决定保存
        ClaudeMemory --> WriteMEMORY: MEMORY.md 已更新
    }

    Working --> SessionEnd: 用户关闭终端

    state SessionEnd {
        [*] --> SaveTranscript: .jsonl 自动保存
        SaveTranscript --> Nothing: 没有其他事情发生
        Nothing --> NoDigest: 没有 session-digest
        NoDigest --> NoFlush: 没有 memory-flush
    }

    SessionEnd --> [*]

    note right of SessionEnd
        关键缺口:
        会话结束时
        没有自动汇总。
    end note
```

### 崩溃检测与恢复

```mermaid
flowchart TD
    START([代理激活]) --> LOAD["SessionState.loadSessionState()"]
    LOAD --> CHECK{"存在于<br/>.session-state.yaml?"}

    CHECK -->|"否"| FRESH["新会话<br/>无需恢复"]
    CHECK -->|"是"| DETECT["SessionState.detectCrash()"]

    DETECT --> THRESHOLD{"最后活动<br/>> 30 分钟前?"}
    THRESHOLD -->|"否"| NORMAL["正常会话<br/>从上次继续"]
    THRESHOLD -->|"是"| LAST_ACTION{"最后操作是<br/>PAUSE, COMPLETED,<br/>或 ABORT?"}

    LAST_ACTION -->|"是"| NORMAL_END["正常结束<br/>不是崩溃"]
    LAST_ACTION -->|"否"| CRASH["检测到崩溃"]

    CRASH --> RESUME_MENU["显示恢复选项"]

    subgraph RESUME_OPTIONS["恢复选项"]
        OPT1["CONTINUE<br/>从最后状态恢复"]
        OPT2["REVIEW<br/>显示进度摘要"]
        OPT3["RESTART<br/>重新开始当前 story"]
        OPT4["DISCARD<br/>丢弃会话"]
    end

    RESUME_MENU --> RESUME_OPTIONS

    style CRASH fill:#FFCDD2,stroke:#C62828
    style RESUME_OPTIONS fill:#E8F5E9,stroke:#2E7D32
```

---

## Gotchas 记忆 - 自动捕获流程

```mermaid
flowchart TD
    subgraph ERROR_FLOW["自动捕获流程"]
        ERR([错误发生]) --> TRACK["gotchasMemory.trackError()"]
        TRACK --> READ_ET["读取 .aios/error-tracking.json"]
        READ_ET --> NORMALIZE["规范化错误消息"]
        NORMALIZE --> HASH["生成消息哈希"]
        HASH --> INCREMENT["增加计数器"]
        INCREMENT --> CHECK{"计数器 >= 3?<br/>(repeatThreshold)"}

        CHECK -->|"否"| SAVE_ET["保存 error-tracking.json<br/>等待下次发生"]
        CHECK -->|"是"| WINDOW{"在 24 小时<br/>窗口内?"}

        WINDOW -->|"否"| RESET["重置计数器<br/>重新开始计数"]
        WINDOW -->|"是"| AUTO_CAPTURE["_autoCaptureGotcha()"]

        AUTO_CAPTURE --> CREATE["创建 gotcha:<br/>- id: gotcha-{hash}<br/>- source: auto_detected<br/>- category: 推断<br/>- severity: 推断"]

        CREATE --> SAVE_JSON["保存 .aios/gotchas.json"]
        SAVE_JSON --> SAVE_MD["生成 .aios/gotchas.md"]
        SAVE_MD --> EMIT["发出 'gotchaAdded' 事件"]
    end

    subgraph MANUAL_FLOW["手动流程"]
        CMD(["*gotcha {desc}"]) --> ADD["gotchasMemory.addGotcha()"]
        ADD --> CREATE
    end

    subgraph INJECTION_FLOW["任务注入流程"]
        TASK([任务启动]) --> QUERY["getContextForTask(taskDesc, files)"]
        QUERY --> MATCH["按以下条件过滤 gotchas:<br/>- taskDesc 关键词<br/>- 相关文件<br/>- 相关类别"]
        MATCH --> FORMAT["formatForPrompt(gotchas)"]
        FORMAT --> INJECT["作为警告注入<br/>任务上下文"]
    end

    style ERROR_FLOW fill:#FFF9C4,stroke:#F9A825
    style MANUAL_FLOW fill:#E8F5E9,stroke:#2E7D32
    style INJECTION_FLOW fill:#E3F2FD,stroke:#1565C0
```

### 存储格式 — gotchas.json

```mermaid
classDiagram
    class GotchasStore {
        +string schema = "aios-gotchas-memory-v1"
        +string version = "1.0.0"
        +string projectId
        +string lastUpdated
        +Statistics statistics
        +Gotcha[] gotchas
    }

    class Gotcha {
        +string id
        +string title
        +string description
        +GotchaCategory category
        +Severity severity
        +string workaround
        +string[] relatedFiles
        +Trigger trigger
        +Source source
        +boolean resolved
    }

    class Trigger {
        +string errorPattern
    }

    class Source {
        +string type : manual | auto_detected
        +number occurrences
        +string firstSeen
        +string lastSeen
    }

    GotchasStore --> Gotcha
    Gotcha --> Trigger
    Gotcha --> Source
```

---

## 上下文快照与恢复

```mermaid
flowchart TD
    subgraph CAPTURE["捕获 — context-snapshot.js"]
        C1(["snapshot.capture(context)"]) --> C2["生成唯一 ID (crypto)"]
        C2 --> C3["捕获 git 状态:<br/>分支, 提交, 脏文件"]
        C3 --> C4["记录:<br/>storyId, agent, subtask,<br/>工作目录"]
        C4 --> C5["保存 .aios/snapshots/{id}.json"]
        C5 --> C6{"autoCleanup?"}
        C6 -->|"是"| C7["移除快照:<br/>- > 50 个存在<br/>- > 7 天"]
    end

    subgraph RESTORE["恢复 — 恢复"]
        R1(["snapshot.restore(id)"]) --> R2["读取 .aios/snapshots/{id}.json"]
        R2 --> R3["返回完整上下文"]
        R3 --> R4["代理可以从<br/>上次位置恢复"]
    end

    subgraph LIST["列出 — 查询"]
        L1(["snapshot.list()"]) --> L2["列出 .aios/snapshots/ 中所有"]
        L2 --> L3["按时间戳排序"]
        L3 --> L4["返回元数据数组"]
    end

    style CAPTURE fill:#E3F2FD,stroke:#1565C0
    style RESTORE fill:#E8F5E9,stroke:#2E7D32
    style LIST fill:#FFF9C4,stroke:#F9A825
```

---

## Timeline Manager - 统一门面

```mermaid
flowchart TD
    subgraph SOURCES["数据源"]
        SRC1["FileEvolutionTracker<br/>.aios/file-evolution/"]
        SRC2["ContextSnapshot<br/>.aios/snapshots/"]
        SRC3["BuildStateManager<br/>(可选)"]
        SRC4["手动事件"]
    end

    subgraph TIMELINE["timeline-manager.js"]
        TM1["getUnifiedTimeline()"]
        TM2["从所有源收集事件"]
        TM3["规范化格式"]
        TM4["按时间排序"]
        TM5["应用限制:<br/>最多 5000 条<br/>最多 90 天"]
        TM6["autoSync (60s 间隔)"]
    end

    subgraph STORAGE["存储"]
        ST1[(".aios/timeline/<br/>unified-timeline.json")]
    end

    SRC1 --> TM2
    SRC2 --> TM2
    SRC3 --> TM2
    SRC4 --> TM2
    TM1 --> TM2
    TM2 --> TM3
    TM3 --> TM4
    TM4 --> TM5
    TM5 --> ST1
    TM6 -->|"定期"| TM2

    style SOURCES fill:#E3F2FD,stroke:#1565C0
    style TIMELINE fill:#F3E5F5,stroke:#7B1FA2
    style STORAGE fill:#FCE4EC,stroke:#C62828
```

---

## Hooks 系统 - 跨 CLI 抽象

### EVENT_MAPPING — CLI 间事件映射

```mermaid
flowchart LR
    subgraph AIOS_EVENTS["AIOS 事件"]
        E1["sessionStart"]
        E2["beforeAgent"]
        E3["beforeTool"]
        E4["afterTool"]
        E5["sessionEnd"]
    end

    subgraph CLAUDE_EVENTS["Claude Code 事件"]
        CE1["null — 无等效"]
        CE2["PreToolUse"]
        CE3["PreToolUse"]
        CE4["PostToolUse"]
        CE5["Stop"]
    end

    subgraph GEMINI_EVENTS["Gemini CLI 事件"]
        GE1["SessionStart"]
        GE2["BeforeAgent"]
        GE3["BeforeTool"]
        GE4["AfterTool"]
        GE5["SessionEnd"]
    end

    E1 -->|"claude: null"| CE1
    E1 -->|"gemini"| GE1
    E2 --> CE2
    E2 --> GE2
    E3 --> CE3
    E3 --> GE3
    E4 --> CE4
    E4 --> GE4
    E5 -->|"claude: Stop"| CE5
    E5 --> GE5

    style CE1 fill:#FFCDD2,stroke:#C62828
    style CE5 fill:#FFF9C4,stroke:#F9A825
```

### 各 CLI 的 Hooks 状态

| Hook | 文件 | Gemini | Claude Code | 状态 |
|------|---------|--------|-------------|--------|
| `session-start` | `hooks/gemini/session-start.js` | `SessionStart` | `null` (无事件) | **仅 Gemini** |
| `session-end` | `hooks/gemini/session-end.js` | `SessionEnd` | `Stop` (已映射但未连接) | **仅 Gemini** |
| `before-agent` | `hooks/gemini/before-agent.js` | `BeforeAgent` | `PreToolUse` | 两者都有 |
| `before-tool` | `hooks/gemini/before-tool.js` | `BeforeTool` | `PreToolUse` | 两者都有 |
| `after-tool` | `hooks/gemini/after-tool.js` | `AfterTool` | `PostToolUse` | 两者都有 |

### 关键缺口: Claude Code 中的 session-start

```mermaid
flowchart TD
    Q{"Claude Code 中<br/>sessionStart?"} -->|"否 — claude: null"| GAP["Claude Code 中<br/>没有原生<br/>session start 事件"]
    GAP --> WORKAROUND["当前变通方案:<br/>激活管道通过 Tier 3<br/>(SessionContextLoader)<br/>部分替代"]

    Q2{"Claude Code 中<br/>sessionEnd?"} -->|"映射到 Stop"| STOP["Stop 事件存在<br/>但 hook 未在<br/>.claude/settings.json<br/>中配置"]
    STOP --> NOT_WIRED["session-end.js 从未<br/>在 Claude Code 中执行"]

    style GAP fill:#FFCDD2,stroke:#C62828
    style NOT_WIRED fill:#FFCDD2,stroke:#C62828
```

---

## 完整文件映射

### 记忆系统脚本

| 文件 | 模块 | Story/Epic | 功能 |
|---------|--------|------------|--------|
| `.aios-core/core/memory/gotchas-memory.js` | 记忆 | Epic 9, Story 9.4 | 自动捕获重复错误, 手动 gotchas, 注入任务 |
| `.aios-core/core/memory/context-snapshot.js` | 记忆 | Story 12.6 | 捕获和恢复开发上下文 |
| `.aios-core/core/memory/file-evolution-tracker.js` | 记忆 | Gap impl | 追踪文件演化, 检测漂移 |
| `.aios-core/core/memory/timeline-manager.js` | 记忆 | Gap impl | 跨会话统一 timeline 门面 |
| `.aios-core/core/session/context-loader.js` | 会话 | Story 2.2, 6.1.2.5 | 代理间连续性, 上下文交接 |
| `.aios-core/core/session/context-detector.js` | 会话 | Story 2.2 | 混合会话类型检测 (new/existing/workflow) |
| `.aios-core/core/orchestration/session-state.js` | 编排 | Story 11.5 | Epic/story 持久状态, 崩溃恢复 |
| `.aios-core/core/orchestration/context-manager.js` | 编排 | Legacy | 阶段间工作流状态 (迁移到 session-state) |
| `.aios-core/core/elicitation/session-manager.js` | Elicitation | — | Elicitation 会话保存/加载 |

### 激活脚本 (消费记忆)

| 文件 | 功能 |
|---------|--------|
| `.aios-core/development/scripts/unified-activation-pipeline.js` | 主编排器 — 在 Tier 3 加载会话 |
| `.aios-core/development/scripts/greeting-builder.js` | 构建带会话/记忆上下文的 greeting |

### Hooks (会话持久化)

| 文件 | CLI | 功能 |
|---------|-----|--------|
| `.aios-core/hooks/gemini/session-start.js` | Gemini | 会话开始时加载 AIOS 上下文 |
| `.aios-core/hooks/gemini/session-end.js` | Gemini | 将会话摘要持久化到 `.aios/sessions/` |
| `.aios-core/hooks/gemini/before-agent.js` | Gemini | 代理前预处理 |
| `.aios-core/hooks/gemini/before-tool.js` | 两者 | 工具前预处理 |
| `.aios-core/hooks/gemini/after-tool.js` | 两者 | 工具后后处理 |
| `.aios-core/hooks/unified/hook-interface.js` | 两者 | UnifiedHook 基类 + EVENT_MAPPING |
| `.aios-core/hooks/unified/hook-registry.js` | 两者 | hooks 中央注册表 |
| `.aios-core/hooks/unified/index.js` | 两者 | 统一系统入口点 |

### Claude Code 文件 (原生记忆)

| 文件 | 功能 |
|---------|--------|
| `~/.claude/CLAUDE.md` | 全局指令 (始终加载) |
| `Workspaces/.claude/CLAUDE.md` | 工作区指令 (始终加载) |
| `aios-core/.claude/CLAUDE.md` | 项目指令 (始终加载) |
| `aios-core/.claude/rules/*.md` | 5 个规则文件 (始终加载) |
| `~/.claude/projects/.../memory/MEMORY.md` | 自动记忆 (前 200 行, 始终加载) |
| `~/.claude/projects/.../memory/compound-analysis/*.md` | 9 个合成分析文件 (从 MEMORY.md 引用) |
| `.claude/agent-memory/{agent}/MEMORY.md` | 每 squad 代理记忆 (6 个代理) |
| `~/.claude/settings.json` | 配置: language, thinking, plugins |

---

## 持久化存储映射

```
.aios/                                        # 运行时状态 (gitignored)
├── session-state.json                        # [context-loader] 代理间会话 (TTL: 1h)
├── gotchas.json                              # [gotchas-memory] 结构化 Gotchas
├── gotchas.md                                # [gotchas-memory] 可读 Gotchas
├── error-tracking.json                       # [gotchas-memory] 自动捕获追踪
├── snapshots/                                # [context-snapshot] 最多 50 个, 7 天
│   └── {id}.json                             #   单个快照
├── timeline/                                 # [timeline-manager]
│   └── unified-timeline.json                 #   统一 timeline (最多 5000, 90 天)
├── file-evolution/                           # [file-evolution-tracker]
│   └── evolution-index.json                  #   演化索引 (最多 1000, 30 天)
├── sessions/                                 # [hooks/gemini/session-end] 仅 Gemini
│   └── {sessionId}.json                      #   会话摘要
├── workflow-state/                           # [context-manager] LEGACY → 迁移到 session-state
├── cache/                                    # 摘要缓存
├── project-status.yaml                       # 项目状态
└── codebase-map.json                         # 代码库映射

docs/stories/
└── .session-state.yaml                       # [session-state] Epic 级持久 (无 TTL)

~/.claude/projects/.../
├── memory/
│   ├── MEMORY.md                             # [Claude Code] 自动记忆 (200 行在 prompt 中)
│   └── compound-analysis/                    # [外部] 9 个合成文件
│       ├── 00-manifest.json
│       ├── 01-learnings.md
│       ├── 02-frameworks.md
│       ├── 03-workflows.md
│       ├── 04-dos-and-donts.md
│       ├── 05-agent-patterns.md
│       ├── 06-heuristics.md
│       ├── 07-warnings.md
│       ├── 08-user-behavior.md
│       ├── 09-discrepancies.md
│       └── COMPOUND-SUMMARY.md
├── sessions-index.json                       # [Claude Code] 会话索引
└── {session-id}.jsonl                        # [Claude Code] 完整转录

.claude/agent-memory/                         # [Claude Code Agents] 每代理记忆
├── aios-architect/MEMORY.md
├── aios-dev/MEMORY.md
├── oalanicolas/MEMORY.md
├── pedro-valerio/MEMORY.md
├── sop-extractor/MEMORY.md
└── squad/MEMORY.md
```

---

## 已知缺口与限制

### 缺口 1: Claude Code 中没有 Session-Digest

```
影响: 高
```

当会话关闭时，上下文知识会**丢失**，除了：
- Claude 在会话**期间**写入 MEMORY.md 的内容
- `.jsonl` 中的原始转录 (未汇总)

**可能的缓解:** 通过 Claude Code 的 `Stop` 事件连接 `session-end.js` + 在 `.claude/settings.json` 中配置。

### 缺口 2: 没有自动 Memory-Flush

```
影响: 高
```

AIOS 模块 (gotchas, snapshots, timeline) 在会话结束时**不会自动 flush**。如果进程突然终止，内存中的数据可能丢失。

### 缺口 3: Gemini Hooks 未移植

```
影响: 中
```

`session-start.js` 在 Claude Code 中映射到 `null` (无原生事件)。`session-end.js` 映射到 `Stop` 但**未配置**。

### 缺口 4: 两层断开

```
影响: 中
```

Claude 自动记忆 (`MEMORY.md`) 和 AIOS 记忆 (`.aios/`) 从不同步。AIOS 捕获的 Gotchas 不会出现在 MEMORY.md 中，反之亦然。

### 缺口 5: compound-analysis 静态

```
影响: 低
```

`memory/compound-analysis/` 中的 9 个文件由外部工具生成，不会自动更新。

---

## 参考

| 资源 | 路径 |
|---------|---------|
| 激活管道指南 | `docs/guides/agents/traces/00-shared-activation-pipeline.md` |
| Gotchas 记忆脚本 | `.aios-core/core/memory/gotchas-memory.js` |
| 上下文快照脚本 | `.aios-core/core/memory/context-snapshot.js` |
| 文件演化追踪器 | `.aios-core/core/memory/file-evolution-tracker.js` |
| Timeline Manager | `.aios-core/core/memory/timeline-manager.js` |
| 会话上下文加载器 | `.aios-core/core/session/context-loader.js` |
| 上下文检测器 | `.aios-core/core/session/context-detector.js` |
| 会话状态 | `.aios-core/core/orchestration/session-state.js` |
| 统一 Hook 接口 | `.aios-core/hooks/unified/hook-interface.js` |
| Hook 注册表 | `.aios-core/hooks/unified/hook-registry.js` |
| Gemini Session Start | `.aios-core/hooks/gemini/session-start.js` |
| Gemini Session End | `.aios-core/hooks/gemini/session-end.js` |
| Core 配置 | `.aios-core/core-config.yaml` |
| Claude 设置 | `~/.claude/settings.json` |
| Story 开发周期 | `docs/guides/workflows/STORY-DEVELOPMENT-CYCLE-WORKFLOW.md` |

---

*AIOS 记忆系统架构指南 v1.0*
*从源代码追踪，而非文档。*
*@architect (Aria) — 架构未来*
