# Schedule Publication

**Task:** `schedule-publication`
**Agent:** @distribution-manager
**Type:** Distribution

---

## Description

Agendar publicacao de conteudo em Instagram ou LinkedIn.

---

## Input

```yaml
content: 'Conteudo a publicar (texto + imagem specs)'
plataforma: 'ig | li'
data_hora: 'YYYY-MM-DD HH:MM (opcional - senao usa best-time)'
```

---

## Process

1. Valida conteudo (quality gate)
2. Determina melhor horario (se nao especificado)
3. Formata para plataforma
4. Human approval (preview + Go/No-Go)
5. Agenda (via API se ativo, ou instrucao manual)
6. Registra no log

---

## Output

```
Confirmacao de agendamento:
- Plataforma: [IG/LI]
- Data/hora: [timestamp]
- Preview: [link ou texto]
- Status: Agendado | Instrucoes manuais
```

---

**Created:** 2026-02-05
**Version:** 1.0
