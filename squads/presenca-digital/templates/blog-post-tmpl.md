# Template de Blog Post

> Define a estrutura de artigo para blog com otimização SEO. Title → Meta → Intro hook → Seções → Conclusão → CTA.

---

## Metadata

```yaml
template_id: blog-post-tmpl
format: blog-post
platform: [blog, linkedin-article, medium]
agent: nicolas-cole, justin-welsh
method: atomic-essay + content-os
word_count_target: 800-1500
```

---

## Structure

```
---
TÍTULO (H1):        {SEO_TITLE}              # inclui keyword principal, máx 60 chars
KEYWORD-PRINCIPAL:  {PRIMARY_KEYWORD}
KEYWORDS-SECUNDÁRIAS: [{SECONDARY_KW_1}, {SECONDARY_KW_2}]
META DESCRIPTION:   {META_DESCRIPTION}       # 120-155 chars, inclui keyword e CTA
SLUG:               {URL_SLUG}               # ex: como-criar-conteudo-consistente
PILAR:              {CONTENT_PILLAR}
---

# {SEO_TITLE}

{META_DESCRIPTION_EXPANDED}  ← parágrafo de intro que "rouba" a meta description

---

## [INTRO — HOOK E PROMESSA]
{HOOK_PARAGRAPH}     # 1 parágrafo: problema ou situação que o leitor reconhece

{PROMISE_PARAGRAPH}  # 1 parágrafo: o que ele vai aprender/ganhar ao ler

---

## {H2_SECTION_1_TITLE}   ← keyword secondary se possível

{SECTION_1_INTRO}

### {H3_SUBSECTION_1A}   ← opcional
{SUBSECTION_1A_CONTENT}

### {H3_SUBSECTION_1B}   ← opcional
{SUBSECTION_1B_CONTENT}

{SECTION_1_EXAMPLE_OR_DATA}   # dado, pesquisa, ou exemplo prático

---

## {H2_SECTION_2_TITLE}

{SECTION_2_CONTENT}

{SECTION_2_EXAMPLE_OR_DATA}

---

## {H2_SECTION_3_TITLE}

{SECTION_3_CONTENT}

{SECTION_3_EXAMPLE_OR_DATA}

---

## {H2_SECTION_4_TITLE}   ← adicionar seções conforme necessidade

{SECTION_4_CONTENT}

---

## Conclusão

{CONCLUSION_SUMMARY}    # 1-2 parágrafos resumindo o aprendizado principal

{CONCLUSION_INSIGHT}    # o "aha moment" final — a ideia que fica na cabeça

---

## {CTA_TITLE}

{CTA_PARAGRAPH}

**{CTA_ACTION}**   # ex: link para newsletter, produto, próximo artigo
```

---

## Usage Notes

- Keyword principal no H1, meta description, primeiro parágrafo e uma H2
- Parágrafos curtos (2-3 linhas) — leitura escaneada na web
- Uma ideia por seção (Atomic Essay aplicado ao formato longo)
- Dados e exemplos concretos aumentam credibilidade e tempo na página
- CTA único e claro no final — não dispersar atenção com múltiplos links

## Platform Adaptations

| Platform         | Adjustment                                                               |
|------------------|--------------------------------------------------------------------------|
| Blog             | SEO completo. Internal links. Schema markup. Featured image com alt text. |
| LinkedIn Article | Sem meta SEO (não indexado). Foco no hook e na estrutura visual.         |
| Medium           | Canonical tag apontando para o blog original se publicar nos dois.       |
```
