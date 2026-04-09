# Frameworks — Como eu uso o Claude Code (Workflow Anti-Vibe Coding)

> **Speaker:** Deborah Folloni
> **Canal:** Deborah Folloni
> **Fonte:** https://www.youtube.com/watch?v=BcLtqQ3JlMU
> **Duração:** 29:55

---

## Framework Principal: Spec-Driven Development (SDD)

**Nome:** Spec-Driven Development (SDD)
**Descrição:** Metodologia em 3 etapas para gerar código com IA sem travar no meio do projeto. Cada etapa produz um artefato resumido que alimenta a próxima, limpando a janela de contexto entre elas.

**Quando aplicar:** Toda vez que precisar implementar qualquer funcionalidade com coding assistants (Claude Code, etc.).

### As 3 Etapas [01:27]

```
Pesquisa → PRD.md → /clear → Spec → spec.md → /clear → Implementação
```

1. **Pesquisa** — Buscar contexto na base de código, documentações externas e padrões de implementação. Output: `prd.md`
2. **Spec** — Transformar o PRD num plano tático: quais arquivos criar, quais modificar, o que fazer em cada um. Output: `spec.md`
3. **Implementação** — Executar a spec com janela de contexto limpa, usando a spec como prompt

**Regra crítica:** Dar `/clear` entre cada etapa para limpar a janela de contexto e começar conversa nova.

---

## Mental Models

### O Funil de Informação [20:41]

A fase de pesquisa funciona como um **grande funil**: entra tudo (útil e inútil), mas o PRD filtra só o que é relevante. Quando passa para a próxima conversa, "não vai lixo".

### IA como Multiplicador, não Transformador [08:00]

> "Quem transforma água em vinho é Jesus. A IA não transforma uma coisa na outra, ela multiplica o que você deu para ela."

Se o input é ruim, o output será ruim multiplicado. A IA amplifica a qualidade (ou a falta dela) do que recebe.

### A Analogia do Desenvolvedor 100 vs 2000 linhas [25:21]

Referenciando Reed Hastings (Netflix): um desenvolvedor excelente outperforma 20x não por digitar mais rápido, mas por resolver o mesmo problema em 100 linhas ao invés de 2000. Menos código = menos tokens consumidos = melhor manutenção pela IA.

### Velocidade Falsa do Vibe Coding [28:29]

Vibe coding dá resultados rápidos no início, mas você "bate na parede" logo. É como correr sem mapa — parece rápido até você se perder. O SDD parece mais lento no início, mas leva muito mais longe.

---

## Heurísticas e Regras Práticas

### Gestão da Janela de Contexto

- **Regra dos 40-50%:** Trabalhar com no máximo 40-50% da janela de contexto. Passou disso, dar `/clear` [19:29]
- **Cada operação consome contexto:** buscar arquivos, ler arquivos, editar, escrever, rodar MCP (retorna JSON blob enorme), seus próprios prompts — tudo soma [10:00]
- **Mais cheia a janela, pior o resultado.** Isso é consenso entre pesquisadores e confirmado na prática [10:56]

### Qualidade do Input [07:39]

Quatro coisas que destroem a qualidade do input:
1. **Informação incorreta** — arquivo errado, prompt ambíguo
2. **Informação incompleta** — não passou documentação necessária
3. **Informações inúteis** — enchem a janela sem agregar valor
4. **Informações demais** — mesmo sendo úteis, excesso degrada a performance

### Pesquisa na Base de Código [12:24]

Ao iniciar qualquer implementação, pedir para a IA:
1. Identificar arquivos da base que serão **afetados** pela nova feature
2. Encontrar **padrões de implementação** de coisas similares já feitas
3. Buscar **documentações externas** de tecnologias envolvidas
4. Buscar **padrões de implementação** fora da base (Stack Overflow, GitHub, docs oficiais)

### Hack do `.stamp` [14:34]

Importar um projeto do GitHub com o padrão desejado numa pasta `.stamp` temporária dentro do projeto. Pedir pro Claude Code analisar, extrair o padrão, e depois deletar a pasta. Útil para quem não é desenvolvedor e não tem referência do que é "bom".

### Spec Tática [17:40]

A spec DEVE seguir o padrão:
- **Path do arquivo** + **o que criar ou modificar naquele arquivo**
- Incluir code snippets/pseudocódigos quando relevante
- Sem isso, "ele vai implementar do jeito dele"

---

## Anti-Patterns (O que NÃO fazer)

### Vibe Coding Literal [00:26]

"Jogar um monte de prompt aleatório e fazer uma oração torcendo para dar certo." Não coloque isso em produção.

### Over-engineering pela IA [02:42]

A IA tem o hábito de complicar o que poderia ser simples. Acontece quando você não diz para ela que existe uma forma mais simples — porque essa informação não está na janela de contexto.

### Reinventar a Roda [02:58]

Exemplo real: a IA tentou criar um Markdown Editor do zero quando existiam soluções prontas (ProseMirror, TipTap). Acontece quando a IA não sabe que soluções prontas existem.

### Não Passar Documentação Externa [06:22]

"Ela não vai pesquisar sozinha muitas vezes." Se você não passa a documentação, ela vai implementar com base no que sabe (que pode estar desatualizado — knowledge cutoff).

### Fazer Tudo numa Conversa Só [19:16]

Se pesquisa + spec + implementação acontecem na mesma conversa, a janela de contexto estoura e a qualidade desaba.

### Código Duplicado pela IA [04:12]

A IA cria componentes duplicados (ex: dois botões) porque o original foi feito antes do contexto "estourar". Resulta em pesadelo de manutenção — dobro/triplo de trabalho.

### Juntar Responsabilidades Diferentes [04:47]

A IA junta códigos com responsabilidades diferentes no mesmo arquivo quando você não especifica a separação desejada.

---

## Ferramentas e Configurações

| Ferramenta | Uso |
|---|---|
| **Claude Code** | Coding assistant principal (CLI) |
| `/clear` | Limpar janela de contexto entre etapas |
| `prd.md` | Artefato da fase de pesquisa — resumo dos achados |
| `spec.md` | Artefato da fase de spec — plano tático de implementação |
| **TipTap** | Editor Markdown usado no Epic (ao invés de criar do zero) |
| **ProseMirror** | Alternativa de editor Markdown mencionada |
| **NextAuth** | Sistema de autenticação usado como exemplo |
| **Resend** | Serviço de envio de e-mails mencionado |
| **Stack Overflow** | Fonte de padrões de implementação |
| **GitHub** | Fonte de projetos-referência (hack do `.stamp`) |
| **Deb GPT (Substack)** | Newsletter com os prompts usados no workflow |

---

## Conhecimento Tácito

### Para não-desenvolvedores [15:06]

> "Se eu nunca vi um padrão comprovado, como que eu vou saber se o que ele fez é bom ou ruim, se eu não tenho nem referência do que é bom?"

Deborah não é desenvolvedora e construiu um app com 3000+ usuários. O segredo: **sempre buscar padrões documentados e comprovados** ao invés de confiar no que a IA inventa. Isso serve como auto-educação — ela aprende com quem sabe fazer.

### A IA não avisa que não sabe [03:52]

Se a documentação de uma tecnologia é de 2026 mas o treinamento parou em 2024, a IA vai tentar fazer o melhor — mas provavelmente vai errar. Ela não diz "eu não sei isso".

### O PRD como mecanismo de "amnésia controlada" [16:35]

O PRD não é só documentação — é um **dispositivo de compressão de contexto**. Ao resumir os achados e limpar a conversa, você "transfere conhecimento" entre conversas sem arrastar lixo. É como dar um briefing conciso para uma pessoa nova.

### Spec como contrato de implementação [17:40]

A spec funciona como um contrato entre você e a IA. Sem contrato, ela faz do jeito dela. Com contrato (paths + ações + snippets), ela faz do jeito que você quer. Quanto mais tático, menos surpresa.

### Produtividade real vs. percebida [28:29]

Deborah destaca que vem de uma época onde precisava de 15 engenheiros para começar uma empresa. Para ela, o SDD não é burocrático — é extraordinariamente eficiente comparado ao que existia antes. A percepção de "lentidão" é uma ilusão de quem nunca viveu sem IA.

### One-shot success rate [27:22]

Quando você fornece documentação externa correta, a chance de o código funcionar na primeira tentativa ("one shot") é dramaticamente maior. Sem documentação, a IA chuta. Com documentação, ela segue instruções.

---

## Resumo Executivo

O SDD de Deborah Folloni resolve os 5 principais problemas de código gerado por IA:

| Problema | Como o SDD resolve |
|---|---|
| Over-engineering | Padrões simples e comprovados na pesquisa |
| Reinventar a roda | Buscar soluções existentes antes de implementar |
| Código desatualizado | Documentações externas no contexto |
| Código duplicado | Pesquisa prévia identifica o que já existe |
| Responsabilidades misturadas | Spec tática com paths explícitos |

A chave é **comprimir informação em cada etapa** e **limpar contexto entre elas**, mantendo a janela de contexto abaixo de 50%.
