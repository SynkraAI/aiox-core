# Material Pedagógico - Método "Aplauda de Pé"

**Migrado de:** `~/CODE/Projects/knowledge-base-renner-silva/`
**Data da migração:** 2026-03-16
**Status:** Completo e autossuficiente

---

## 📂 Estrutura

```
squads/renner-silva/data/
├── pedagogical/           ← JSONs estruturados (92KB)
│   ├── concepts.json      (15 conceitos)
│   ├── exercises.json     (23 exercícios)
│   ├── taxonomy.json      (5 módulos)
│   ├── learning-paths.json (4 trilhas)
│   └── sources.json       (rastreabilidade)
│
├── curso/                 ← Planos de aula detalhados (284KB)
│   ├── modulo-1-*.md      (5 variações módulo 1)
│   ├── modulo-2-*.md      (5 variações módulo 2)
│   ├── modulo-3-*.md      (5 variações módulo 3)
│   ├── modulo-4-*.md      (5 variações módulo 4)
│   ├── modulo-5-*.md      (5 variações módulo 5)
│   └── CHECKPOINTS-PROGRESSO.md
│
├── obsidian-vault/        ← Ferramenta do instrutor (104KB)
│   ├── MOCs/              (Maps of Content)
│   ├── Conceitos/         (Concept notes)
│   ├── Modulos/           (Module notes)
│   ├── Templates/         (Reusable templates)
│   └── README.md
│
└── README.md              ← Índice dos 20 KBs
```

---

## 🔗 Integração com KB20

O conteúdo de `pedagogical/` é a **fonte canônica** para **KB20_MATERIAL_PEDAGOGICO.md**.

**Path do KB20:**
```
squads/squad-creator/data/minds/renner_silva/05_clone_final/knowledge_base/KB20_MATERIAL_PEDAGOGICO.md
```

**Sincronização:**
- KB20 v1.1 (2026-03-16) foi gerado a partir destes JSONs
- Se atualizar JSONs → recomenda-se atualizar KB20 também

---

## 📊 Conteúdo

### pedagogical/ (JSONs)
| Arquivo | Tamanho | Conteúdo |
|---------|---------|----------|
| concepts.json | 24KB | 15 conceitos estruturados com rastreabilidade |
| exercises.json | 29KB | 23 exercícios práticos progressivos |
| taxonomy.json | 16KB | 5 módulos pedagógicos |
| learning-paths.json | 6.7KB | 4 trilhas (iniciante → master) |
| sources.json | 9.6KB | Rastreabilidade 100% |

### curso/ (Planos de Aula)
- **25 planos de aula** (5 módulos × 5 fases)
- Formato: Markdown detalhado
- Checkpoints de progresso inclusos

### obsidian-vault/ (Instrutor)
- **MOCs:** 5 Maps of Content
- **Conceitos:** Notas detalhadas
- **Templates:** Reutilizáveis
- **Configuração:** .obsidian/ completa

---

## 🎯 Uso

### Para Alunos
1. Clone consulta **KB20** (via squad-creator KBs)
2. KB20 referencia exercícios por ID: `ex-mod1-01`
3. Clone recomenda learning paths: `trilha-iniciante`

### Para Instrutores
1. Abrir `obsidian-vault/` no Obsidian
2. Usar MOCs para navegar
3. Criar aulas a partir de `curso/`

### Para Manutenção
1. Editar JSONs em `pedagogical/`
2. (Futuro) Rodar `sync-kb20.sh` para atualizar KB20
3. Commit changes no squad

---

## 📜 Histórico

| Data | Ação | Detalhes |
|------|------|----------|
| 2026-02-13 | Criação original | Projeto knowledge-base-renner-silva |
| 2026-02-15 | Remoção do app | Next.js app removido (commit 888068b) |
| 2026-03-16 | Migração para squad | Material migrado para tornar clone autossuficiente |
| 2026-03-16 | KB20 criado | Integração com mind clone via KB20 |

---

**Mantido por:** Squad Renner Silva
**Clone Version:** v1.2
**KB20 Version:** v1.1
