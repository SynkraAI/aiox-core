# AIOS Skills Registry

Banco central de skills carregáveis em runtime.

## Ativação

Todas as skills podem ser ativadas via slash command:

```
/AIOS:skills:{skill-name}
```

Exemplo:
```
/AIOS:skills:pt-br-accentuation
/AIOS:skills:prd-generator
/AIOS:skills:tokenizacao
```

## Skills Disponíveis

| Skill | Tipo | Descrição |
|-------|------|-----------|
| `pt-br-accentuation` | Single-file | Protocolo de acentuação em português brasileiro |
| `prd-generator` | Multi-file | Gerador de PRDs completos |
| `tokenizacao` | Multi-file | Sistema de tokenização de conteúdo |
| `angular` | Single-file | Expertise em Angular |
| `angular-state-management` | Single-file | Gestão de estado em Angular |
| `criar-app-completo` | Single-file | Template para criar app completo |
| `obsidian-app-filler` | Single-file | Preenchedor automático de Obsidian |
| `obsidian-tag-manager` | Multi-file | Gerenciador de tags em Obsidian |
| `deep-search` | Single-file | Busca profunda em bases de conhecimento |
| `tech-search` | Single-file | Busca especializada em documentação técnica |
| `groq-transcriber` | Single-file | Transcrição batch de áudios via Groq Whisper API |
| `md-to-branded-pdf` | Multi-file | Converte Markdown em PDF com identidade visual customizada |

Para lista completa e detalhes, consulte os arquivos `SKILL.md` em cada diretório de skill.

## Estrutura

Cada skill segue a estrutura:

```
skills/{skill-name}/
├── SKILL.md                 # Definição da skill
├── README.md               # Documentação (opcional)
└── (arquivos internos)      # Conteúdo da skill
```

## Registry Auto-atualizado

Este README é mantido automaticamente. Para adicionar uma skill, coloque o diretório em `skills/` e execute:

```bash
npm run sync:skills
```

---

*Último update: 2026-03-04*
