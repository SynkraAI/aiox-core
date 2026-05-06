# Petition Structure Reference

## Brazilian Civil Petition Template (Peticao Inicial)

This reference provides the complete structure for Brazilian civil petitions following CPC (Codigo de Processo Civil) requirements.

---

## 1. Enderecamento (Court Address)

Format: `EXCELENTISSIMO(A) SENHOR(A) JUIZ(A) DE DIREITO DA [VARA] DA COMARCA DE [CIDADE] - ESTADO DE [ESTADO]`

### Jurisdiction Rules

| Case Type | Court |
|-----------|-------|
| Contract disputes up to 40 SM | Juizado Especial Civel |
| Contract disputes above 40 SM | Vara Civel |
| Consumer relations | Vara Civel (domicilio do consumidor) |
| Real estate disputes | Foro da situacao do imovel (Art. 47 CPC) |
| Contract with foro clause | Foro contratual (Art. 63 CPC) |

**SM = Salario Minimo** (update annually)

---

## 2. Qualificacao das Partes

### Pessoa Fisica (Individual)
```
**[NOME COMPLETO]**, [nacionalidade], [estado civil], [profissao],
portador(a) do RG n. [numero], inscrito(a) no CPF sob o n. [numero],
residente e domiciliado(a) na [endereco completo com CEP],
e-mail: [email], telefone: [telefone]
```

### Pessoa Juridica (Legal Entity)
```
**[RAZAO SOCIAL]** ("[NOME FANTASIA]"), pessoa juridica de direito privado,
inscrita no CNPJ sob o n. [numero], com sede na [endereco completo com CEP],
e-mail: [email], representada por seu socio-administrador **[NOME]**,
telefone: [telefone]
```

### Required Fields per Party Type

| Field | PF | PJ |
|-------|----|----|
| Nome completo / Razao social | Required | Required |
| CPF / CNPJ | Required | Required |
| RG | Required | N/A |
| Endereco completo | Required | Required |
| CEP | Required | Required |
| Estado civil | Required | N/A |
| Profissao | Required | N/A |
| Nacionalidade | Required | N/A |
| E-mail | Required (Art. 319 CPC) | Required |
| Representante legal | N/A | Required |

---

## 3. Tipo de Acao

Common action types and their formulations:

| Tipo | Formulacao |
|------|-----------|
| Rescisao + Cobranca + Danos | ACAO DE RESCISAO CONTRATUAL C/C COBRANCA E INDENIZACAO POR PERDAS E DANOS |
| Cobranca simples | ACAO DE COBRANCA |
| Indenizacao | ACAO DE INDENIZACAO POR DANOS MATERIAIS E MORAIS |
| Execucao de titulo | ACAO DE EXECUCAO DE TITULO EXTRAJUDICIAL |
| Obrigacao de fazer | ACAO DE OBRIGACAO DE FAZER C/C INDENIZACAO |
| Consignacao em pagamento | ACAO DE CONSIGNACAO EM PAGAMENTO |
| Revisional | ACAO REVISIONAL DE CONTRATO |

---

## 4. Dos Fatos (Section I)

### Structure Rules

- Numbered subsections (1, 2, 3...)
- Chronological order
- Each fact must reference its evidence
- Use bold for key terms, dates, values
- Use blockquote for direct citations from evidence
- Include exact dates whenever possible

### Recommended Subsection Sequence

1. Background / Property / Asset description
2. Contract celebration
3. Performance and breach timeline
4. Communications and demands
5. Partial payments (if any)
6. Formal notifications
7. Expert reports or valuations
8. Additional irregularities
9. Pattern of bad faith
10. Current status and silence

### Evidence Citation Format

Within the text: `(Doc. [N])` or `(conforme audio de [data])`

---

## 5. Do Direito (Section II)

### Structure Rules

- Numbered subsections by legal foundation
- Each foundation: article citation → legal text (blockquote) → application to case
- Use proper citation format for jurisprudence

### Jurisprudence Citation Format

```
(STJ, REsp [numero], Rel. Min. [nome], [turma], julgado em [data])
(TJSC, Apelacao Civel n. [numero], Rel. Des. [nome], [camara], julgado em [data])
```

---

## 6. Do Calculo do Debito (Section III)

### Required Elements

- Market value determination (laudo pericial or comparable data)
- Extraction/usage documentation with tables
- Payment history with tables
- Outstanding balance calculation
- Multiple damage scenarios (minimum/technical/maximum)
- Contractual penalty calculation
- Property depreciation (if applicable)
- Summary table (quadro resumo)

### Table Format for Calculations

```markdown
| Item | Calculo | Valor (R$) |
|------|---------|------------|
| [Description] | [Formula] | [Amount] |
| **TOTAL** | | **[Total]** |
```

### Monetary Correction and Interest

- Correcao monetaria: INPC/IBGE from date of each event
- Juros de mora: 1% per month from citation date (Art. 405 CC)
- Alternative: from date of event (Art. 398 CC for torts)

---

## 7. Das Provas (Section IV)

### Categories

a) **Prova documental** - All documents attached
b) **Prova oral** - Testimony, depositions, audio transcriptions
c) **Prova pericial** - Expert evaluations needed
d) **Exibicao de documentos** - Documents held by opponent (Arts. 396-404 CPC)

---

## 8. Dos Pedidos (Section V)

### Structure Rules

- Numbered sequentially
- Each pedido is self-contained
- Start with citation of defendant
- End with procedural requests (provas, honorarios)

### Standard Pedidos Sequence

1. Citacao da Re
2. Rescisao contratual (if applicable)
3. Indenizacao por perdas e danos (with value range)
4. Saldo devedor contratual
5. Multa contratual
6. Danos morais (if applicable)
7. Desvalorizacao (if applicable)
8. Exibicao de documentos
9. Honorarios advocaticios e custas
10. Producao de provas
11. Inversao do onus da prova (if applicable)

---

## 9. Do Valor da Causa (Section VI)

### Rules

- Must correspond to the economic benefit sought (Art. 292 CPC)
- Use the technical/recommended scenario
- Reference the calculation section
- Include extenso (written-out value)
- Mention that liquidation may reveal higher values

### Format
```
Da-se a causa o valor de **R$ [valor]** ([extenso]), correspondente a [description of calculation basis].
```

---

## 10. Encerramento

```
Nestes termos,
pede deferimento.

[Cidade]-[UF], _____ de _____________ de [ano].

---

**[NOME DO ADVOGADO]**
OAB/[UF] [numero]
```

---

## 11. Rol de Documentos

Numbered list of ALL documents attached, in logical order:

1. Procuracao ad judicia
2. [Contract or main document]
3. [Notifications]
4. [Payment records]
5. [Evidence by category]
...
N. Transcricoes de audios (em midia digital)
