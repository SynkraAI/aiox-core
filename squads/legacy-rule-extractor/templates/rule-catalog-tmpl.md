# Rule Catalog — {{SYSTEM_NAME}}

**Generated at:** {{DATE}}
**Source system:** {{SYSTEM_NAME}}
**Total rules:** {{TOTAL_RULES}}

---

## Executive Summary

| Metrica | Valor |
|---------|-------|
| Total de regras | {{TOTAL_RULES}} |
| Dominios cobertos | {{DOMAIN_COUNT}} |
| Regras criticas | {{CRITICAL_COUNT}} |
| Confianca alta | {{HIGH_CONFIDENCE_PCT}}% |
| Cobertura de arquivos | {{FILE_COVERAGE_PCT}}% |

### Distribuicao por Severidade

| Severidade | Quantidade | Percentual |
|------------|-----------|-----------|
| Critica | {{CRITICAL}} | {{CRITICAL_PCT}}% |
| Importante | {{IMPORTANT}} | {{IMPORTANT_PCT}}% |
| Informativa | {{INFO}} | {{INFO_PCT}}% |

### Distribuicao por Confianca

| Confianca | Quantidade | Percentual |
|-----------|-----------|-----------|
| Alta | {{ALTA}} | {{ALTA_PCT}}% |
| Media | {{MEDIA}} | {{MEDIA_PCT}}% |
| Baixa | {{BAIXA}} | {{BAIXA_PCT}}% |

---

## Regras por Dominio

### {{DOMAIN_NAME}} ({{DOMAIN_PREFIX}})

**Total:** {{DOMAIN_RULE_COUNT}} regras | **Criticas:** {{DOMAIN_CRITICAL}}

#### {{MODULE_NAME}} ({{MODULE_CODE}})

| ID | Titulo | Severidade | Confianca | Tipo |
|----|--------|-----------|-----------|------|
| {{RULE_ID}} | {{TITLE}} | {{SEVERITY}} | {{CONFIDENCE}} | {{TYPE}} |

##### {{RULE_ID}} — {{TITLE}}

**Severidade:** {{SEVERITY}} | **Confianca:** {{CONFIDENCE}} | **Tipo:** {{TYPE}}
**Fonte:** `{{SOURCE_FILE}}` linhas {{LINES}}

{{DESCRIPTION}}

**Logica:**
```
{{LOGIC}}
```

**Condicoes:**
{{CONDITIONS_LIST}}

**Excecoes:**
{{EXCEPTIONS_LIST}}

**Dependencias:** {{DEPENDENCIES_LIST}}
**Tags:** {{TAGS}}

---

## Indice de Referencia Cruzada

| Regra | Depende de | Dependentes |
|-------|-----------|-------------|
| {{RULE_ID}} | {{DEPENDS_ON}} | {{DEPENDED_BY}} |

---

*Catalogo gerado por Legacy Rule Extractor v1.0.0*
