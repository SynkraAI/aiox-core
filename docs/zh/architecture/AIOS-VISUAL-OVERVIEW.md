# AIOS — 可视化概览与流程图

> 高级可视化指南，解释什么是 Synkra AIOS，
> Task-First 方法论，4 种执行器类型，
> 动态工作空间以及它们如何相互连接。

**版本:** 1.0.0
**日期:** 2026-02-12
**作者:** @architect (Aria)
**状态:** 持续更新文档

---

## 目录

1. [什么是 AIOS？](#1-什么是-aios)
2. [Task-First 理念](#2-task-first-理念)
3. [4 种执行器](#3-4-种执行器)
4. [决策树 — 使用哪种执行器？](#4-决策树--使用哪种执行器)
5. [动态工作空间](#5-动态工作空间)
6. [完整流程 — 从创意到部署](#6-完整流程--从创意到部署)
7. [对比总结](#7-对比总结)

---

## 1. 什么是 AIOS？

**Synkra AIOS** (AI Operating System) 是一个框架，它改变了团队构建软件的方式 — 将 **专业化 AI 代理** 与 **真实人类** 结合在一种独特的敏捷方法论中。

核心创新: **任务是主要单位，而非代理。**
代理只是执行任务的 4 种可能执行器类型之一。

```mermaid
flowchart TB
    subgraph AIOS["SYNKRA AIOS"]
        direction TB

        subgraph CORE["核心: Task-First 引擎"]
            TASK["已验证任务<br/>(主要单位)"]
            DECISION{"决策树:<br/>谁来执行?"}
        end

        subgraph EXECUTORS["4 种执行器类型"]
            direction LR
            AGENT["代理<br/>生成式 AI"]
            WORKER["工作器<br/>确定性脚本"]
            CLONE["克隆<br/>AI + 方法论"]
            HUMAN["人类<br/>关键判断"]
        end

        subgraph WORKSPACE["动态工作空间"]
            direction LR
            SQUADS["小队<br/>模块化团队"]
            CONFIG["自定义配置<br/>按企业"]
            COLLAB["人类 + AI<br/>协同工作"]
        end
    end

    subgraph PRINCIPLES["宪法原则"]
        CLI["CLI 优先"]
        STORY["故事驱动"]
        QUALITY["质量门禁"]
    end

    TASK --> DECISION
    DECISION --> AGENT
    DECISION --> WORKER
    DECISION --> CLONE
    DECISION --> HUMAN

    WORKSPACE --> TASK
    PRINCIPLES --> AIOS

    style CORE fill:#1a1a2e,color:#fff
    style EXECUTORS fill:#16213e,color:#fff
    style WORKSPACE fill:#0f3460,color:#fff
    style AGENT fill:#e94560,color:#fff
    style WORKER fill:#00b894,color:#fff
    style CLONE fill:#6c5ce7,color:#fff
    style HUMAN fill:#fdcb6e,color:#000
    style TASK fill:#00cec9,color:#000
```

### 一句话概括 AIOS

> **"一个用于软件开发的操作系统，其中已验证的任务由最理想的执行器执行 — 无论是 AI、脚本、认知克隆还是人类 — 在按企业定制的动态工作空间中运行。"**

### 优先级层次

```
CLI 优先  >  可观测性次之  >  UI 第三
(执行)       (监控)          (临时管理)
```

---

## 2. Task-First 理念

Pedro Valerio 的 **Task-First** 方法论颠覆了传统范式:

| 传统范式 | Task-First (AIOS) |
|-----------------------|-------------------|
| 代理是中心 | **任务** 是中心 |
| "我使用哪个代理？" | "我需要执行什么任务？" |
| 代理决定做什么 | 任务定义做什么，执行器定义谁来做 |
| 与执行器耦合 | 执行器是 **可互换的** |

### 核心原则

```mermaid
flowchart LR
    subgraph TRADITIONAL["传统范式"]
        direction TB
        A1["代理 A"] --> T1["任务 1"]
        A1 --> T2["任务 2"]
        A2["代理 B"] --> T3["任务 3"]
        NOTE1["代理决定<br/>执行什么"]
    end

    subgraph TASKFIRST["Task-First (AIOS)"]
        direction TB
        TK1["已验证任务"] --> DEC1{"执行器?"}
        DEC1 --> E1["代理"]
        DEC1 --> E2["工作器"]
        DEC1 --> E3["克隆"]
        DEC1 --> E4["人类"]
        NOTE2["任务定义工作。<br/>执行器可互换。"]
    end

    TRADITIONAL -.->|"演进为"| TASKFIRST

    style TRADITIONAL fill:#2d2d2d,color:#fff
    style TASKFIRST fill:#1a472a,color:#fff
    style TK1 fill:#00cec9,color:#000
    style NOTE1 fill:#444,color:#ccc
    style NOTE2 fill:#1a472a,color:#0f0
```

### 任务解剖

已验证的任务是 **法律** — 必须按照定义执行，无论谁（或什么）来执行它:

```mermaid
flowchart TB
    subgraph TASK_ANATOMY["任务解剖"]
        direction TB
        ID["ID + 名称"]
        DESC["清晰描述"]
        INPUTS["已定义输入"]
        OUTPUTS["预期输出"]
        PRE["前置条件"]
        POST["后置条件"]
        EXEC["执行器类型:<br/>代理 | 工作器 | 克隆 | 人类"]
        AC["验收标准"]
    end

    TASK_ANATOMY --> VALIDATE{"任务已验证?"}
    VALIDATE -->|"是"| EXECUTE["任何执行器<br/>都能保证执行"]
    VALIDATE -->|"否"| REJECT["拒绝:<br/>先完善任务"]

    style TASK_ANATOMY fill:#2c3e50,color:#fff
    style EXECUTE fill:#27ae60,color:#fff
    style REJECT fill:#c0392b,color:#fff
```

### 为什么选择 Task-First？

```
一个定义良好的任务可以由以下执行:
  - 凌晨3点的 AI 代理               (代理)
  - 在 CI/CD 中运行的脚本            (工作器)
  - Brad Frost 的克隆进行验证        (克隆)
  - 人类手动审核                     (人类)

结果是相同的。执行器是可互换的。
```

---

## 3. 4 种执行器

每种执行器都有独特的特性，使其适合特定类型的任务:

```mermaid
flowchart TB
    subgraph EXECUTORS["AIOS 的 4 种执行器"]
        direction TB

        subgraph AGENT_BOX["代理 — 生成式 AI"]
            AGENT_DESC["使用 LLM 处理创意、<br/>分析或生成任务"]
            AGENT_EX["例如: 分析简报、生成文案、<br/>选择模板、代码审查"]
        end

        subgraph WORKER_BOX["工作器 — 确定性脚本"]
            WORKER_DESC["使用预定义逻辑<br/>转换数据的代码/脚本"]
            WORKER_EX["例如: 加载 JSON 配置、<br/>验证 HTML、导出 PNG、<br/>计算间距"]
        end

        subgraph CLONE_BOX["克隆 — AI + 领域启发式"]
            CLONE_DESC["增强了特定人物的公理<br/>和方法论的 AI 代理"]
            CLONE_EX["例如: 验证原子设计 (Brad Frost)、<br/>审核文案 (Alex Hormozi)、<br/>评估用户体验 (Jakob Nielsen)"]
        end

        subgraph HUMAN_BOX["人类 — 人类操作员"]
            HUMAN_DESC["执行需要主观判断<br/>的任务的真人"]
            HUMAN_EX["例如: 批准 $10k 活动、<br/>法律合规、战略决策、<br/>关键边缘案例"]
        end
    end

    style AGENT_BOX fill:#e94560,color:#fff
    style WORKER_BOX fill:#00b894,color:#fff
    style CLONE_BOX fill:#6c5ce7,color:#fff
    style HUMAN_BOX fill:#fdcb6e,color:#000
```

### 快速对比

| | 代理 | 工作器 | 克隆 | 人类 |
|---|---|---|---|---|
| **成本** | $$$$ | $ | $$$$ | $$$ |
| **速度** | 3-10秒 | < 1秒 | 5-15秒 | 分钟-小时 |
| **确定性** | 否 | 是 | 部分 | 否 |
| **创造力** | 是 | 否 | 是 (有引导) | 是 |
| **法律责任** | 否 | 否 | 否 | 是 |
| **最适合** | 创意任务 | 转换 | 方法论验证 | 关键决策 |

---

## 4. 决策树 — 使用哪种执行器？

这是决定 AIOS 中每个任务应分配哪个执行器的主要流程图:

```mermaid
flowchart TD
    START(["新任务待执行"]) --> Q1{"需要<br/>创造力或<br/>主观性?"}

    Q1 -->|"否"| Q2{"确定性<br/>算法<br/>存在?"}
    Q1 -->|"是"| Q3{"必须<br/>人类判断?"}

    Q2 -->|"是"| Q4{"调用<br/>外部 API?"}
    Q2 -->|"否"| Q3

    Q3 -->|"是"| Q5{"关键决策<br/>有法律/财务<br/>影响?"}
    Q3 -->|"否"| Q6{"需要<br/>特定<br/>方法论?"}

    Q4 -->|"是 (非 AI)"| WORKER1["工作器<br/>带 API"]
    Q4 -->|"否"| WORKER2["工作器<br/>脚本"]

    Q5 -->|"是"| HUMAN["人类<br/>人类操作员"]
    Q5 -->|"否"| Q6

    Q6 -->|"是"| CLONE["克隆<br/>AI + 启发式"]
    Q6 -->|"否"| AGENT["代理<br/>生成式 AI"]

    WORKER1 --> EXEC(["执行任务"])
    WORKER2 --> EXEC
    HUMAN --> EXEC
    CLONE --> EXEC
    AGENT --> EXEC

    style START fill:#2c3e50,color:#fff
    style EXEC fill:#2c3e50,color:#fff
    style WORKER1 fill:#00b894,color:#fff
    style WORKER2 fill:#00b894,color:#fff
    style HUMAN fill:#fdcb6e,color:#000
    style CLONE fill:#6c5ce7,color:#fff
    style AGENT fill:#e94560,color:#fff
    style Q1 fill:#34495e,color:#fff
    style Q2 fill:#34495e,color:#fff
    style Q3 fill:#34495e,color:#fff
    style Q4 fill:#34495e,color:#fff
    style Q5 fill:#34495e,color:#fff
    style Q6 fill:#34495e,color:#fff
```

### 替换规则

随着系统演进，执行器可以随时间更换:

```mermaid
flowchart LR
    subgraph SUBSTITUTION["执行器替换规则"]
        direction TB

        R1["代理 -> 工作器<br/><i>当任务变得<br/>数据确定性</i>"]
        R2["人类 -> 代理<br/><i>当自动化达到<br/>可接受精度</i>"]
        R3["代理 -> 克隆<br/><i>当特定方法论<br/>提高质量</i>"]
        R4["克隆 -> 代理<br/><i>当方法论对<br/>结果不关键</i>"]
    end

    R1 -->|"节省: 100%"| SAVE1["$$$ -> $"]
    R2 -->|"节省: 99.8%"| SAVE2["$$$ -> $"]
    R3 -->|"质量: +25%"| QUAL1["+成本, +质量"]
    R4 -->|"节省: 67%"| SAVE3["$$$$ -> $$"]

    style R1 fill:#00b894,color:#fff
    style R2 fill:#e94560,color:#fff
    style R3 fill:#6c5ce7,color:#fff
    style R4 fill:#e94560,color:#fff
```

### 混合策略

在实践中，许多任务结合执行器以获得最佳结果:

```mermaid
flowchart LR
    subgraph H1["代理 + 工作器 (回退)"]
        A1["代理尝试"] -->|"失败"| W1["工作器接管<br/>(简单规则)"]
    end

    subgraph H2["代理 + 人类 (审核)"]
        A2["代理处理<br/>100% 的量"] -->|"得分 < 80%"| HU1["人类审核<br/>关键案例"]
    end

    subgraph H3["克隆 + 代理 (验证)"]
        A3["代理创建<br/>(创意)"] --> C1["克隆验证<br/>(方法论)"]
        C1 -->|"无效"| A3
    end

    style H1 fill:#1a1a2e,color:#fff
    style H2 fill:#1a1a2e,color:#fff
    style H3 fill:#1a1a2e,color:#fff
```

---

## 5. 动态工作空间

每个公司/团队使用其所需的组件组装自己的 **定制工作空间**。
AIOS 是模块化的 — 你像乐高积木一样组合小队、代理和配置。

### 工作空间架构

```mermaid
flowchart TB
    subgraph WS["公司动态工作空间"]
        direction TB

        subgraph FRAMEWORK[".aios-core/ — 框架 (不可变)"]
            AGENTS_CORE["11 个核心代理<br/>dev, qa, architect, pm,<br/>po, sm, analyst, devops,<br/>data-engineer, ux, aios-master"]
            TASKS_CORE["45+ 可执行<br/>任务"]
            WORKFLOWS["可编排<br/>工作流"]
            CONSTITUTION["宪法<br/>不可协商原则"]
        end

        subgraph SQUADS["squads/ — 模块化团队"]
            SQ1["营销小队<br/>文案, 设计师,<br/>流量经理"]
            SQ2["数据小队<br/>数据工程师, 分析师,<br/>ETL 专家"]
            SQ3["领域小队<br/>公司业务<br/>专业代理"]
        end

        subgraph MINDS["认知克隆"]
            M1["Pedro Valerio<br/>流程 & 系统"]
            M2["Brad Frost<br/>原子设计"]
            M3["Alex Hormozi<br/>文案写作"]
            M4["自定义克隆<br/>公司专家"]
        end

        subgraph CONFIG["按公司配置"]
            CS["编码标准"]
            TS["技术栈"]
            ST["源码树"]
            IDE["IDE 规则<br/>(Claude Code, Cursor,<br/>Copilot, Gemini)"]
        end
    end

    subgraph HUMANS["人类团队"]
        DEV_H["开发人员"]
        PM_H["产品经理"]
        DESIGN_H["设计师"]
        STAKEHOLDERS["利益相关者"]
    end

    HUMANS <-->|"协作<br/>人在环路中"| WS

    style FRAMEWORK fill:#1a1a2e,color:#fff
    style SQUADS fill:#0f3460,color:#fff
    style MINDS fill:#533483,color:#fff
    style CONFIG fill:#2c3e50,color:#fff
    style HUMANS fill:#d35400,color:#fff
    style SQ1 fill:#e94560,color:#fff
    style SQ2 fill:#00b894,color:#fff
    style SQ3 fill:#6c5ce7,color:#fff
```

### 公司如何组装其工作空间

```mermaid
flowchart LR
    INSTALL(["npx aios-core install"]) --> WIZARD["安装向导"]

    WIZARD --> CHOOSE_SQUADS["选择小队<br/>(初始小队)"]
    WIZARD --> CHOOSE_IDE["选择 IDE<br/>(Claude Code, Cursor...)"]
    WIZARD --> CHOOSE_CONFIG["配置<br/>偏好"]

    CHOOSE_SQUADS --> SQ_OPS["HybridOps<br/>(Pedro Valerio)"]
    CHOOSE_SQUADS --> SQ_CUSTOM["自定义小队<br/>(公司领域)"]
    CHOOSE_SQUADS --> SQ_MARKET["市场<br/>(现成小队)"]

    CHOOSE_IDE --> IDE1["Claude Code"]
    CHOOSE_IDE --> IDE2["Cursor"]
    CHOOSE_IDE --> IDE3["Copilot Chat"]
    CHOOSE_IDE --> IDE4["Gemini CLI"]

    SQ_OPS --> READY(["工作空间就绪!<br/>人类 + AI<br/>协同工作"])
    SQ_CUSTOM --> READY
    SQ_MARKET --> READY
    IDE1 --> READY
    IDE2 --> READY
    IDE3 --> READY
    IDE4 --> READY

    style INSTALL fill:#2c3e50,color:#fff
    style READY fill:#27ae60,color:#fff
    style WIZARD fill:#34495e,color:#fff
```

### 小队 + 人类: 真正的协作

AIOS 的差异化在于小队 **不会取代** 人类 — 它们 **一起** 工作:

```mermaid
flowchart TB
    subgraph COLLAB["小队 + 人类协作"]
        direction TB

        subgraph PLANNING["阶段 1: 规划"]
            H_PM["人类 PM"] <-->|"完善需求"| AI_PM["@pm (Morgan)<br/>代理"]
            H_PM <-->|"验证架构"| AI_ARCH["@architect (Aria)<br/>代理"]
            AI_PM --> PRD["完整 PRD"]
            AI_ARCH --> ARCH_DOC["架构<br/>文档"]
        end

        subgraph EXECUTION["阶段 2: 开发"]
            AI_SM["@sm (River)<br/>代理"] -->|"创建故事"| STORIES["超详细<br/>故事"]
            STORIES --> AI_DEV["@dev (Dex)<br/>代理"]
            AI_DEV -->|"实现"| CODE["代码"]
            CODE --> AI_QA["@qa (Quinn)<br/>代理"]
            H_DEV["人类开发者"] <-->|"结对编程"| AI_DEV
            H_DEV <-->|"代码审查"| AI_QA
        end

        subgraph REVIEW["阶段 3: 质量门禁"]
            AI_QA -->|"通过"| AI_DEVOPS["@devops (Gage)<br/>代理"]
            AI_QA -->|"失败"| AI_DEV
            H_LEAD["人类技术主管"] -->|"最终批准"| AI_DEVOPS
            AI_DEVOPS -->|"推送 + PR"| DEPLOYED(["已部署"])
        end
    end

    PLANNING --> EXECUTION --> REVIEW

    style PLANNING fill:#1a472a,color:#fff
    style EXECUTION fill:#1a1a2e,color:#fff
    style REVIEW fill:#2c1810,color:#fff
    style DEPLOYED fill:#27ae60,color:#fff
```

---

## 6. 完整流程 — 从创意到部署

此图显示了从创意到部署的完整路径，经过所有代理、门禁和决策点:

```mermaid
flowchart TD
    IDEA(["创意 / 需求"]) --> ANALYST["@analyst<br/>研究 & 分析"]
    ANALYST --> PM["@pm (Morgan)<br/>创建 PRD"]
    PM --> ARCH["@architect (Aria)<br/>架构设计"]

    ARCH --> SM["@sm (River)<br/>创建故事"]
    SM --> PO{"@po (Pax)<br/>验证故事?<br/>10点检查表"}

    PO -->|"通过 >= 7/10"| DEV["@dev (Dex)<br/>实现"]
    PO -->|"不通过 < 7/10"| SM

    DEV --> CODERABBIT{"CodeRabbit<br/>自愈<br/>最多 2 次迭代"}
    CODERABBIT -->|"严重"| DEV
    CODERABBIT -->|"通过"| QA{"@qa (Quinn)<br/>质量门禁<br/>7 项检查"}

    QA -->|"通过"| DEVOPS["@devops (Gage)<br/>推送 + PR"]
    QA -->|"顾虑"| DEVOPS
    QA -->|"失败"| DEV

    DEVOPS --> DEPLOYED(["已部署"])

    subgraph TASKS_FLOW["每一步都是一个任务"]
        direction LR
        NOTE["上面的每个框都是一个任务。<br/>每个任务定义输入、输出、<br/>前置/后置条件。<br/>执行器 (代理) 只是<br/>默认类型 — 也可以是<br/>工作器、克隆或人类。"]
    end

    style IDEA fill:#2c3e50,color:#fff
    style DEPLOYED fill:#27ae60,color:#fff
    style PO fill:#fdcb6e,color:#000
    style QA fill:#fdcb6e,color:#000
    style CODERABBIT fill:#e94560,color:#fff
    style TASKS_FLOW fill:#1a1a2e,color:#aaa
```

### 各阶段执行器映射

| 阶段 | 任务 | 默认执行器 | 可能替代 |
|------|------|-----------------|---------------------|
| 研究 | 市场分析 | 代理 (@analyst) | 人类 (研究员) |
| 规划 | 创建 PRD | 代理 (@pm) | 人类 (真实 PM) |
| 架构 | 系统设计 | 代理 (@architect) | 人类 (CTO) |
| 故事 | 创建故事 | 代理 (@sm) | 人类 (真实 SM) |
| 验证 | 验证故事 | 代理 (@po) | 人类 (真实 PO) |
| 实现 | 编码功能 | 代理 (@dev) | 人类 (真实开发者) |
| QA | 质量门禁 | 代理 (@qa) | 人类 (真实 QA) |
| 部署 | 推送 + PR | 代理 (@devops) | 人类 (真实 DevOps) |
| 代码检查 | 验证风格 | **工作器** (ESLint) | — |
| 类型检查 | 验证类型 | **工作器** (TypeScript) | — |
| 构建 | 编译项目 | **工作器** (npm build) | — |
| 设计审查 | 验证原子设计 | **克隆** (Brad Frost) | 人类 (高级设计师) |
| 文案审查 | 验证文案 | **克隆** (Hormozi) | 人类 (文案撰稿人) |
| 法律审批 | 合规检查 | **人类** (必须) | — |
| 财务审批 | 预算 > $10k | **人类** (必须) | — |

---

## 7. 对比总结

### AIOS vs 传统方法

```mermaid
flowchart LR
    subgraph TRAD["传统方法"]
        direction TB
        T1["人类做所有事"] --> T2["AI 作为聊天机器人<br/>(问答)"]
        T2 --> T3["无结构<br/>无质量门禁"]
        T3 --> T4["结果: 不一致"]
    end

    subgraph TASKMASTER["任务运行器 (Taskmaster 等)"]
        direction TB
        TM1["AI 生成任务列表"] --> TM2["AI 顺序<br/>执行任务"]
        TM2 --> TM3["无验证<br/>无不同角色"]
        TM3 --> TM4["结果: 脆弱"]
    end

    subgraph AIOS_WAY["Synkra AIOS (Task-First)"]
        direction TB
        A1["带验收标准的<br/>已验证任务"] --> A2["决策树选择<br/>理想执行器"]
        A2 --> A3["每次转换<br/>都有质量门禁"]
        A3 --> A4["结果: 可靠<br/>且可扩展"]
    end

    style TRAD fill:#c0392b,color:#fff
    style TASKMASTER fill:#d35400,color:#fff
    style AIOS_WAY fill:#27ae60,color:#fff
```

### 宪法原则

AIOS 在具有不可协商原则的 **正式宪法** 下运行:

| 条款 | 原则 | 严重性 | 含义 |
|--------|-----------|------------|-------------|
| I | CLI 优先 | 不可协商 | 所有功能在任何 UI 之前先通过 CLI 工作 |
| II | 代理权限 | 不可协商 | 每个代理拥有独占权限 |
| III | 故事驱动 | 必须 | 所有开发从故事开始 |
| IV | 禁止发明 | 必须 | 规格源自需求，从不发明 |
| V | 质量优先 | 必须 | 质量门禁阻止糟糕代码 |
| VI | 绝对导入 | 应该 | 始终使用绝对导入 |

---

## 如何查看这些图表

流程图使用 **Mermaid**，可在以下位置渲染:

1. **GitHub** — 自动在 `.md` 文件中渲染
2. **VS Code** — 扩展 "Markdown Preview Mermaid Support"
3. **Mermaid 在线编辑器** — [mermaid.live](https://mermaid.live)
4. **Obsidian** — 原生支持 Mermaid

---

## 相关文档

| 文档 | 内容 |
|-----------|----------|
| [EXECUTOR-DECISION-TREE.md](../../.aios-core/docs/standards/EXECUTOR-DECISION-TREE.md) | 带示例和成本效益分析的详细决策树 |
| [SYNAPSE-FLOWCHARTS.md](SYNAPSE/SYNAPSE-FLOWCHARTS.md) | SYNAPSE 上下文引擎的 12 个流程图 |
| [Constitution](../../.aios-core/constitution.md) | 框架的不可协商原则 |
| [User Guide](../../.aios-core/user-guide.md) | AIOS 使用完整指南 |
| [Squads Guide](../guides/squads-guide.md) | 如何创建和管理小队 |

---

*Synkra AIOS 可视化概览 v1.0.0*
*Task-First | 4 种执行器 | 动态工作空间*
*— Aria，架构未来*
