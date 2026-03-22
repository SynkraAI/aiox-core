---
paths:
  - "skills/dashboard-generator/"
lazy_load: true
context_budget: 2123
---

# Dashboard Generator - Interactive Web Dashboards

**Version:** 1.0.0
**Type:** Skill
**Category:** Design & Development
**Runtime:** Claude Code

---

## 📋 Description

Generates production-ready interactive dashboards and websites with professional design, animations, and data visualizations. Uses modern web technologies with Chart.js for interactive charts, CSS animations, and responsive layouts.

---

## 🎯 When to Use

Use this skill when you need to:
- Create interactive dashboards for data presentation
- Build before/after comparison sites
- Generate project reports with visualizations
- Create presentation-ready web interfaces
- Build stakeholder communication dashboards
- Transform data/reports into visual websites

---

## ⚙️ How It Works

### Input Required

1. **Data Source**
   - Path to reports/data files (markdown, JSON, CSV)
   - OR structured data directly

2. **Dashboard Type** (choose one)
   - `analytics` - Metrics and KPIs dashboard
   - `comparison` - Before/After comparison
   - `project-report` - Project status and deliverables
   - `timeline` - Chronological progress view
   - `portfolio` - Showcase of work/projects
   - `custom` - Specify your own structure

3. **Customization** (optional)
   - Color scheme (default: purple/blue gradient)
   - Logo/branding
   - Custom sections/tabs
   - Chart types preference

### Output Generated

- **Single HTML file** (standalone, no dependencies)
- **Embedded CSS** (modern design system)
- **Interactive JavaScript** (Chart.js via CDN)
- **Responsive layout** (mobile to desktop)
- **Professional animations** (smooth transitions)
- **Usage guide** (markdown instructions)

---

## 🚀 Usage Examples

### Example 1: Analytics Dashboard

```
@claude usando /AIOS:skills:dashboard-generator

Crie um dashboard analytics com os seguintes dados:
- Receita mensal: [Jan: 50k, Fev: 65k, Mar: 78k]
- Usuários ativos: [Jan: 1200, Fev: 1450, Mar: 1680]
- Taxa de conversão: [Jan: 2.3%, Fev: 2.8%, Mar: 3.1%]

Quero:
- 4 KPI cards no topo
- Gráfico de linha para receita
- Gráfico de barras para usuários
- Tema azul/verde
```

### Example 2: Before/After Comparison

```
@claude usando /AIOS:skills:dashboard-generator

Preciso de um site de comparação Before/After para apresentar melhorias:

BEFORE:
- Performance: 2.5s load time
- Bugs: 45 issues
- Coverage: 12%
- Score: 6.2/10

AFTER:
- Performance: 0.8s load time
- Bugs: 3 issues
- Coverage: 85%
- Score: 9.1/10

Tipo: comparison
Seções: Overview, Metrics, Technical Details, Impact
```

### Example 3: Project Report

```
@claude usando /AIOS:skills:dashboard-generator

Gere dashboard de projeto a partir dos relatórios em:
/path/to/reports/*.md

Tipo: project-report
Estrutura:
- Executive Summary
- Sprint 1, 2, 3 (tabs)
- Deliverables table
- Team metrics
- Timeline visualization

Tema: roxo/azul (como o Ensinio)
```

### Example 4: Portfolio Site

```
@claude usando /AIOS:skills:dashboard-generator

Crie portfolio site com meus projetos:

Projetos:
1. E-commerce Platform (React, Node.js) - 2025
2. Mobile App (React Native) - 2025
3. Dashboard System (Vue.js) - 2024

Tipo: portfolio
Seções: Projects, Skills, Timeline, Contact
Tema: dark mode com gradientes
```

---

## 🎨 Design System

### Color Schemes Available

| Scheme | Primary | Secondary | Use Case |
|--------|---------|-----------|----------|
| `purple-blue` | #6366f1 | #8b5cf6 | Default, modern tech |
| `blue-cyan` | #3b82f6 | #06b6d4 | Corporate, professional |
| `green-teal` | #10b981 | #14b8a6 | Growth, finance |
| `orange-red` | #f97316 | #ef4444 | Energy, urgency |
| `pink-purple` | #ec4899 | #a855f7 | Creative, design |
| `dark-mono` | #1e293b | #334155 | Minimalist, elegant |

### Layout Patterns

1. **Header + Tabs**
   - Sticky gradient header
   - Horizontal tab navigation
   - Smooth tab transitions

2. **Cards Grid**
   - Responsive grid (1-4 columns)
   - Hover animations
   - Icon + value + label

3. **Chart Sections**
   - Full-width or 2-column
   - Interactive Chart.js charts
   - Legend controls

4. **Tables**
   - Striped rows
   - Hover highlight
   - Responsive scroll

### Chart Types Supported

- **Line** - Trends over time
- **Bar** - Comparisons, categories
- **Horizontal Bar** - Rankings, ordered data
- **Doughnut** - Proportions, percentages
- **Pie** - Simple distributions
- **Radar** - Multi-dimensional data
- **Scatter** - Correlations
- **Mixed** - Multiple datasets

---

## 📦 Components Library

### Pre-built Components

```html
<!-- KPI Card -->
<div class="stat-card">
  <div class="stat-icon">📈</div>
  <div class="stat-value">254+</div>
  <div class="stat-label">Tests Created</div>
  <div class="stat-change success">+254 from baseline</div>
</div>

<!-- Comparison Card -->
<div class="comparison-card">
  <h3>Code Coverage</h3>
  <div class="comparison-values">
    <div class="before">
      <span class="label">Before</span>
      <span class="value">&lt;0.1%</span>
    </div>
    <div class="arrow">→</div>
    <div class="after">
      <span class="label">After</span>
      <span class="value">15%+</span>
    </div>
  </div>
  <div class="impact">+150x improvement</div>
</div>

<!-- Progress Bar -->
<div class="progress-bar-container">
  <div class="progress-info">
    <span>Sprint 1</span>
    <span>100%</span>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: 100%"></div>
  </div>
</div>

<!-- Timeline Item -->
<div class="timeline-item">
  <div class="timeline-marker"></div>
  <div class="timeline-content">
    <h3>Sprint 1 - Infrastructure</h3>
    <p class="timeline-date">Completed</p>
    <p>140 tests, CI/CD, Security fixes</p>
  </div>
</div>
```

---

## 🔧 Customization Options

### Basic Customization

```javascript
// Change colors
:root {
  --primary: #YOUR_COLOR;
  --secondary: #YOUR_COLOR;
}

// Change fonts
body {
  font-family: 'Your Font', sans-serif;
}

// Add logo
<img src="logo.png" alt="Logo" class="logo">
```

### Advanced Features

1. **Dark/Light Mode Toggle**
2. **Export to PDF** (via print stylesheet)
3. **Data Refresh** (via API integration)
4. **Animations Control** (enable/disable)
5. **Print-Friendly** (automatic optimization)

---

## 📊 Data Format Guide

### JSON Format

```json
{
  "title": "Dashboard Title",
  "tabs": [
    {
      "id": "overview",
      "name": "Overview",
      "sections": [
        {
          "type": "kpi-cards",
          "data": [
            { "icon": "📈", "value": "254+", "label": "Tests" }
          ]
        },
        {
          "type": "chart",
          "chartType": "line",
          "data": { "labels": [...], "datasets": [...] }
        }
      ]
    }
  ]
}
```

### Markdown Format

```markdown
# Dashboard Title

## Tab: Overview

### KPIs
- Tests: 254+ (+254 from baseline)
- Coverage: 15% (+15% from baseline)

### Chart: Trend Over Time
| Month | Value |
|-------|-------|
| Jan   | 100   |
| Feb   | 200   |
```

---

## 🎯 Best Practices

### DO ✅

- Use clear, descriptive titles
- Provide context for numbers (% change, trend)
- Choose appropriate chart types
- Use consistent color coding
- Add interactive elements (hover, click)
- Include a usage guide
- Make it responsive
- Test on different browsers

### DON'T ❌

- Overcrowd with too many charts
- Use more than 3-4 colors
- Mix too many chart types
- Forget mobile optimization
- Skip loading states
- Use tiny fonts
- Ignore accessibility

---

## 🚨 Common Issues

**Charts not showing?**
- Check internet connection (Chart.js loads via CDN)
- Verify data format is correct
- Check browser console for errors

**Slow animations?**
- Reduce number of animated elements
- Disable animations on slow devices
- Use CSS `will-change` property

**Colors not matching?**
- Check CSS variables in `:root`
- Verify hex color format
- Clear browser cache

---

## 📚 Examples Gallery

### 1. Ensinio Dashboard
- Type: project-report
- Features: 6 tabs, multiple charts, timeline
- Colors: purple-blue gradient
- **Location:** `/Users/luizfosc/Dropbox/Downloads/Ensinio-Analysis/dashboard.html`

*(More examples will be added as you generate dashboards)*

---

## 🔄 Version History

- **1.0.0** (2026-02-11): Initial release with Ensinio dashboard as reference

---

## 🤝 Support

For issues or feature requests, mention:
- Dashboard type you're creating
- Data source/format
- Desired customizations
- Screenshots of issues (if any)

---

**Created:** 2026-02-11
**Author:** AIOS Framework
**License:** Internal Use
