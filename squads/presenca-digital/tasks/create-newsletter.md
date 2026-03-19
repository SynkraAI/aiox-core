# create-newsletter

> Criar edição de newsletter no estilo Saturday Solopreneur — formato de valor denso, pessoal e acionável para lista de e-mail

---

## Task Definition

```yaml
task_name: "create-newsletter"
status: active
responsible_executor: justin-welsh
execution_type: agent
squad: presenca-digital
version: 1.0.0
```

---

## Input

- `content-pillars.json` (output de content-strategy)
- Brand Voice Guidelines
- Tema ou pilar da edição
- Número da edição (para manter consistência de série)
- Segmento da lista (quando houver segmentação)

## Output

- Edição de newsletter completa: assunto, preview text, corpo formatado
- Versão em texto puro (plain text fallback)
- Sugestão de horário e dia de envio

## Action Items

1. Escrever **linha de assunto** (subject line): curiosidade ou benefício específico, máximo 50 caracteres
2. Escrever **preview text**: complementa o assunto sem repeti-lo, máximo 90 caracteres
3. Abrir com **saudação personalizada** e frase de contexto (1-2 linhas)
4. Estruturar o corpo no formato Saturday Solopreneur:
   - **Seção 1 — Ideia da semana** (150-250 palavras): reflexão ou insight do pilar
   - **Seção 2 — O que estou usando/lendo/testando** (100-150 palavras): ferramenta, livro ou recurso
   - **Seção 3 — Ação de 5 minutos** (50-100 palavras): tarefa acionável que o leitor faz agora
   - **CTA final** (1-2 linhas): resposta à newsletter, link para oferta ou próximo passo
5. Escrever encerramento pessoal (assinatura com nome e frase curta)
6. Gerar versão plain text para fallback
7. Sugerir horário de envio baseado no dia da semana e público

## Acceptance Criteria

- [ ] Subject line até 50 caracteres com benefício ou curiosidade específica
- [ ] Preview text até 90 caracteres, complementar ao assunto
- [ ] 3 seções do formato Saturday Solopreneur presentes
- [ ] Seção "Ação de 5 minutos" é realmente executável em 5 minutos
- [ ] Tom pessoal e direto, alinhado com Brand Voice Guidelines
- [ ] CTA final presente e claro
- [ ] Versão plain text gerada
- [ ] Total: 500-800 palavras (denso mas rápido de ler)

## Veto Conditions

- Subject line genérica ("Newsletter #47" ou "Novidades de março")
- Ausência de qualquer seção acionável
- Tom corporativo ou impessoal (contradiz o formato)
- Extensão acima de 1.000 palavras (perda de retenção)
- CTA ausente ou com múltiplos links concorrentes (mais de 2 CTAs)

## Output Example

```
ASSUNTO: O único sistema que uso para não perder ideias
PREVIEW: Funciona offline, sem app, sem assinatura.

---

Oi [NOME],

Semana passada perdi uma ideia que teria virado 3 posts. Não anoto? Perco. Anoto errado? Não acho depois.

Então criei um sistema estúpido de simples. Te conto abaixo.

---

IDEIA DA SEMANA: O sistema de captura que realmente funciona

Eu já testei Notion, Obsidian, Apple Notes e papel. O problema não é a ferramenta. É o processo...

[150-250 palavras de desenvolvimento]

---

O QUE ESTOU USANDO AGORA

Readwise Reader para capturar highlights de artigos. A função de "Daily Review" sozinha já vale a assinatura...

[100-150 palavras]

---

AÇÃO DE 5 MINUTOS

Abra o bloco de notas agora e crie um arquivo chamado "ideias-brutas.txt". Toda vez que tiver uma ideia, vai lá. Sem formatação, sem organização. Só captura.

---

Até a próxima,
[NOME]
P.S.: Respondeu a newsletter? Eu leio tudo.
```
