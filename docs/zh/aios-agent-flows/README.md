# AIOS 代理流程系统文档 (中文简体)

> 🌐 [PT](../../aios-agent-flows/README.md) | [EN](../../en/aios-agent-flows/README.md) | [ES](../../es/aios-agent-flows/README.md) | **ZH**

---

本目录包含AIOS框架的所有代理流程系统文档，翻译为中文简体(zh-CN)。

## 翻译文件

### 核心代理系统

1. **ux-design-expert-system.md** - UX设计专家(Uma)
   - 用户研究、线框、设计系统审计
   - 5阶段工作流：研究→审计→令牌→构建→质量
   - 原子设计方法论

2. **data-engineer-system.md** - 数据工程师(Dara)
   - 数据库架构、迁移、RLS安全
   - DBA操作、性能优化、安全审计
   - Supabase、PostgreSQL、MongoDB支持

3. **analyst-system.md** - 分析师(Atlas)
   - 市场研究、竞争分析
   - 头脑风暴促进、项目简报创建
   - 深度研究和可行洞察

4. **pm-system.md** - 产品经理(Morgan)
   - PRD创建(Greenfield和Brownfield)
   - Epic和Story规划、路线纠正
   - 战略规划和质量检查清单

## 翻译术语表

| 英文 | 中文 | 说明 |
|------|------|------|
| UX Design Expert | UX设计专家 | Uma角色 |
| Data Engineer | 数据工程师 | Dara角色，即数据库架构师 |
| Analyst | 分析师 | Atlas角色 |
| Product Manager | 产品经理 | Morgan角色 |
| Atomic Design | 原子设计 | Brad Frost的组件设计方法 |
| Design System | 设计系统 | UI组件库和设计令牌 |
| Design Tokens | 设计令牌 | 设计系统中的可重用值 |
| RLS | RLS(行级安全) | Row Level Security |
| WCAG | WCAG(网页无障碍指南) | Web Content Accessibility Guidelines |
| ROI | ROI(投资回报率) | Return on Investment |
| Epic | Epic | 大型功能的集合 |
| Story | Story | 单个用户故事或需求 |
| Greenfield | Greenfield | 全新项目 |
| Brownfield | Brownfield | 现有项目的增强 |
| DBA | DBA(数据库管理员) | Database Administrator |
| PRD | PRD(产品需求文档) | Product Requirements Document |

## 使用方式

这些文档是AIOS框架的参考资料。每个代理系统文档包括:

- **概览** - 代理的目的和特征
- **完整文件列表** - 所有相关任务、模板、检查清单
- **流程图和状态机** - 可视化工作流
- **命令映射** - 所有可用命令及其参数
- **代理集成** - 与其他代理的协作方式
- **最佳实践** - 如何高效使用代理
- **故障排除** - 常见问题和解决方案

## 文档结构

每个代理文档包含以下标准部分:

1. 标题和元数据(版本、创建日期、所有者)
2. 概览和核心原则
3. 完整文件清单(按类别)
4. 流程图和可视化
5. 命令映射表
6. 代理间集成
7. 最佳实践
8. 故障排除指南
9. 参考资料
10. 总结和变更日志

## 相关资源

- 原始英文文档: `docs/aios-agent-flows/`
- 产品模板: `.aios-core/product/templates/`
- 开发任务: `.aios-core/development/tasks/`
- AIOS工作流: `.aios-core/development/workflows/`

## 维护和更新

这些是官方翻译文档，与英文原版保持同步。如发现翻译错误或需要更新，请提交反馈。

---

**翻译日期:** 2026-02-22  
**翻译语言:** 中文简体(zh-CN)  
**术语标准化:** 根据AIOS官方术语表
