# 模板引擎 v2.0

> **[EN](../../guides/template-engine-v2.md)** | [PT](../../pt/guides/template-engine-v2.md) | [ES](../../es/guides/template-engine-v2.md) | **中文 (ZH)**

---

> 用于Synkra AIOS的文档生成和变量替换引擎。

**版本:** 2.0
**最后更新:** 2025-12-05

---

## 概述

模板引擎提供了一致的方式来生成文档（PRD、ADR、故事等），具有变量替换、条件和循环功能。它为AIOS中的所有文档生成任务提供支持。

### 关键功能

| 功能      | 语法                                  | 描述                     |
| ------------ | --------------------------------------- | ------------------------------- |
| 变量    | `{{VAR_NAME}}`                          | 简单变量替换    |
| 条件 | `{{#IF_CONDITION}}...{{/IF_CONDITION}}` | 条件块              |
| 循环        | `{{#EACH_ITEMS}}...{{/EACH_ITEMS}}`     | 遍历数组             |
| 嵌套路径 | `{{user.name}}`                         | 访问嵌套对象属性 |
| 转义     | `\{{literal}}`                          | 防止模板处理     |

---

## 快速开始

### 基本用法

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');

const engine = new TemplateEngine();

const template = `
# {{TITLE}}

创建者: {{AUTHOR}}
日期: {{DATE}}

## 摘要
{{SUMMARY}}
`;

const variables = {
  TITLE: '我的文档',
  AUTHOR: 'Dex (@dev)',
  DATE: '2025-12-05',
  SUMMARY: '这是一份生成的文档。',
};

const output = engine.process(template, variables);
console.log(output);
```

### 输出

```markdown
# 我的文档

创建者: Dex (@dev)
日期: 2025-12-05

## 摘要

这是一份生成的文档。
```

---

## API参考

### TemplateEngine类

```javascript
const TemplateEngine = require('./.aios-core/infrastructure/scripts/template-engine');
const engine = new TemplateEngine();
```

### 方法

#### `process(template, variables)`

使用给定的变量处理模板字符串。

**参数:**

- `template` (string) - 包含占位符的模板字符串
- `variables` (Object) - 替换的键值对

**返回:** `string` - 处理后的模板

```javascript
const result = engine.process('你好, {{NAME}}!', { NAME: '世界' });
// 返回: "你好, 世界!"
```

#### `loadAndProcess(templatePath, variables)`

加载模板文件并处理它。

**参数:**

- `templatePath` (string) - 模板文件路径
- `variables` (Object) - 要替换的变量

**返回:** `Promise<string>` - 处理后的模板

```javascript
const result = await engine.loadAndProcess('.aios-core/product/templates/story-tmpl.md', {
  STORY_ID: '3.12',
  TITLE: '文档',
});
```

#### `validateTemplate(template, requiredVars)`

验证模板是否包含所有必需的占位符。

**参数:**

- `template` (string) - 要验证的模板
- `requiredVars` (string[]) - 必需变量名列表

**返回:** `Object` - `{ valid: boolean, missing: string[], found: string[] }`

```javascript
const validation = engine.validateTemplate(template, ['TITLE', 'DATE']);
if (!validation.valid) {
  console.error('缺失变量:', validation.missing);
}
```

#### `getTemplateVariables(template)`

提取模板中使用的所有变量。

**参数:**

- `template` (string) - 要分析的模板

**返回:** `Object` - `{ simple: string[], conditionals: string[], loops: string[] }`

```javascript
const vars = engine.getTemplateVariables(template);
console.log('需要的变量:', vars.simple);
console.log('条件:', vars.conditionals);
console.log('循环变量:', vars.loops);
```

#### `escapeInput(input)`

转义用户输入中的特殊字符以防止注入。

**参数:**

- `input` (string) - 要转义的用户输入

**返回:** `string` - 转义后的输入

```javascript
const safeInput = engine.escapeInput(userProvidedValue);
```

---

## 模板语法

### 简单变量

```markdown
# {{TITLE}}

作者: {{AUTHOR}}
版本: {{VERSION}}
```

### 嵌套变量

使用点符号访问嵌套对象属性:

```markdown
项目: {{project.name}}
所有者: {{project.owner.name}}
邮箱: {{project.owner.email}}
```

```javascript
const variables = {
  project: {
    name: 'AIOS',
    owner: {
      name: '佩德罗',
      email: 'pedro@example.com',
    },
  },
};
```

### 条件

只有当变量为真值时才包含内容:

```markdown
{{#IF_HAS_DEPENDENCIES}}

## 依赖

此项目依赖于:
{{DEPENDENCIES}}
{{/IF_HAS_DEPENDENCIES}}
```

```javascript
const variables = {
  HAS_DEPENDENCIES: true,
  DEPENDENCIES: '- react\n- typescript',
};
```

### 循环

遍历数组:

```markdown
## 任务

{{#EACH_TASKS}}

- [ ] {{ITEM.title}} ({{ITEM.priority}})
      {{/EACH_TASKS}}
```

```javascript
const variables = {
  TASKS: [
    { title: '编写文档', priority: '高' },
    { title: '添加测试', priority: '中' },
    { title: '审查代码', priority: '低' },
  ],
};
```

**循环上下文变量:**

- `{{ITEM}}` - 当前项目
- `{{INDEX}}` - 当前索引（从0开始）
- `{{FIRST}}` - 布尔值，如果是第一项为真
- `{{LAST}}` - 布尔值，如果是最后一项为真

### 转义

使用反斜杠防止模板处理:

```markdown
要使用变量，请写 \{{VARIABLE_NAME}}。
```

输出: `要使用变量，请写 {{VARIABLE_NAME}}。`

---

## 支持的模板

### 文档模板

| 模板  | 位置                    | 用途                         |
| --------- | --------------------------- | ------------------------------- |
| **PRD**   | `templates/prd-tmpl.md`     | 产品需求文档   |
| **ADR**   | `templates/adr-tmpl.md`     | 架构决策记录    |
| **PMDR**  | `templates/pmdr-tmpl.md`    | 流程映射决策记录 |
| **DBDR**  | `templates/dbdr-tmpl.md`    | 数据库设计记录          |
| **故事** | `templates/story-tmpl.yaml` | 用户故事                      |
| **史诗**  | `templates/epic-tmpl.md`    | 史诗定义                 |
| **任务**  | `templates/task-tmpl.md`    | 任务定义                 |

### 模板位置

所有模板存储在:

```
.aios-core/product/templates/
```

---

## 创建自定义模板

### 第1步：创建模板文件

```markdown
# {{COMPONENT_NAME}}

**类型:** {{COMPONENT_TYPE}}
**创建时间:** {{DATE}}
**作者:** {{AUTHOR}}

## 描述

{{DESCRIPTION}}

{{#IF_HAS_PROPS}}

## 属性

| 名称 | 类型 | 默认 | 描述 |
| ---- | ---- | ------- | ----------- |

{{#EACH_PROPS}}
| {{ITEM.name}} | {{ITEM.type}} | {{ITEM.default}} | {{ITEM.description}} |
{{/EACH_PROPS}}
{{/IF_HAS_PROPS}}

{{#IF_HAS_EXAMPLES}}

## 示例

{{EXAMPLES}}
{{/IF_HAS_EXAMPLES}}
```

### 第2步：定义模板架构

创建架构文件（可选但推荐）:

```yaml
# my-template.schema.yaml
name: component-template
version: '1.0'
description: 组件文档模板

variables:
  required:
    - COMPONENT_NAME
    - COMPONENT_TYPE
    - DATE
    - AUTHOR
    - DESCRIPTION
  optional:
    - HAS_PROPS
    - PROPS
    - HAS_EXAMPLES
    - EXAMPLES

validation:
  COMPONENT_TYPE:
    enum: [React, Vue, Angular, Vanilla]
  DATE:
    format: date
```

### 第3步：在任务中使用

```javascript
const engine = new TemplateEngine();

// 加载模板
const template = await fs.readFile('templates/component-tmpl.md', 'utf8');

// 验证必需变量
const validation = engine.validateTemplate(template, ['COMPONENT_NAME', 'DATE']);
if (!validation.valid) {
  throw new Error(`缺失变量: ${validation.missing.join(', ')}`);
}

// 处理
const output = engine.process(template, {
  COMPONENT_NAME: '按钮',
  COMPONENT_TYPE: 'React',
  DATE: new Date().toISOString().split('T')[0],
  AUTHOR: 'Dex',
  DESCRIPTION: '一个可重用的按钮组件',
  HAS_PROPS: true,
  PROPS: [
    { name: 'variant', type: 'string', default: 'primary', description: '按钮样式' },
    { name: 'size', type: 'string', default: 'medium', description: '按钮大小' },
  ],
  HAS_EXAMPLES: false,
});
```

---

## 最佳实践

### 1. 使用有意义的变量名

```markdown
<!-- 好的 -->

{{STORY_TITLE}}
{{ACCEPTANCE_CRITERIA}}
{{AUTHOR_NAME}}

<!-- 不好的 -->

{{T}}
{{AC}}
{{N}}
```

### 2. 提供合理的默认值

```javascript
const variables = {
  TITLE: title || '未命名',
  DATE: date || new Date().toISOString().split('T')[0],
  VERSION: version || '1.0',
};
```

### 3. 处理前验证

```javascript
const validation = engine.validateTemplate(template, requiredVars);
if (!validation.valid) {
  console.error('缺失:', validation.missing);
  return; // 不处理无效模板
}
```

### 4. 转义用户输入

```javascript
// 总是转义用户提供的内容
const safeInput = engine.escapeInput(userInput);
const output = engine.process(template, { USER_CONTENT: safeInput });
```

### 5. 对可选部分使用条件

```markdown
{{#IF_HAS_NOTES}}

## 注释

{{NOTES}}
{{/IF_HAS_NOTES}}
```

---

## 故障排除

### 常见问题

| 问题                      | 解决方案                                           |
| -------------------------- | -------------------------------------------------- |
| 变量未被替换      | 检查拼写是否完全匹配（区分大小写）    |
| 循环产生空输出 | 确保变量是数组，而不是未定义         |
| 条件总是假   | 检查变量是否为真值（不是空字符串/0/null） |
| 模板注入         | 对用户提供的值使用 `escapeInput()`       |

### 调试模式

```javascript
// 获取模板中的所有变量
const vars = engine.getTemplateVariables(template);
console.log('预期变量:', vars);

// 验证您的数据
const validation = engine.validateTemplate(template, Object.keys(yourVariables));
console.log('验证结果:', validation);
```

---

## 相关文档

- [质量门禁指南](./quality-gates.md)

---

_Synkra AIOS模板引擎 v2.0_
