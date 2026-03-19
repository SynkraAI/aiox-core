# Legacy Patterns Knowledge Base

Padroes comuns encontrados em sistemas legados que indicam regras de negocio.

---

## Padroes COBOL

### 88-Level Conditions (Condition Names)
```cobol
01 WS-TIPO-CLIENTE    PIC X(01).
   88 CLIENTE-PF       VALUE 'F'.
   88 CLIENTE-PJ       VALUE 'J'.
   88 CLIENTE-GOV      VALUE 'G'.
```
**Significado:** Enumeracao de valores validos para um campo. Cada valor 88 e uma regra de dominio.

### EVALUATE TRUE (Decision Tables)
```cobol
EVALUATE TRUE
  WHEN WS-UF = 'SP' AND WS-TIPO = 'IMP'
    MOVE 18 TO WS-ALIQ
  WHEN WS-UF = 'SP' AND WS-TIPO = 'NAC'
    MOVE 12 TO WS-ALIQ
  WHEN OTHER
    MOVE 7 TO WS-ALIQ
END-EVALUATE
```
**Significado:** Tabela de decisao. Cada WHEN e uma regra de negocio distinta.

### COMPUTE ROUNDED
```cobol
COMPUTE WS-VL-IMPOSTO ROUNDED =
  WS-BASE-CALC * WS-ALIQUOTA / 100
```
**Significado:** Formula de calculo com regra de arredondamento. O ROUNDED indica regra de precisao.

### COPY Members
```cobol
COPY REGFISCAL.
```
**Significado:** Definicao compartilhada. Regras no COPY afetam todos os programas que o incluem.

### PERFORM VARYING (Loop Business Logic)
```cobol
PERFORM 2000-CALC-PARCELA
  VARYING WS-IX FROM 1 BY 1
  UNTIL WS-IX > WS-NUM-PARCELAS
```
**Significado:** Logica de processamento iterativo. Comum em calculos de parcelamento.

---

## Padroes PL/SQL

### RAISE_APPLICATION_ERROR
```sql
IF v_saldo < v_valor_debito THEN
  RAISE_APPLICATION_ERROR(-20100, 'Saldo insuficiente para debito');
END IF;
```
**Significado:** Validacao de negocio com codigo de erro e mensagem. O numero (-20xxx) identifica a regra.

### TRIGGER Business Logic
```sql
CREATE OR REPLACE TRIGGER trg_pedido_status
BEFORE UPDATE OF status ON pedidos
FOR EACH ROW
BEGIN
  IF :OLD.status = 'FATURADO' AND :NEW.status = 'PENDENTE' THEN
    RAISE_APPLICATION_ERROR(-20200, 'Pedido faturado nao pode voltar a pendente');
  END IF;
END;
```
**Significado:** Regra de transicao de estado implementada como trigger. Critica para mapeamento de workflow.

### NVL/DECODE Chains
```sql
v_desconto := DECODE(v_tipo_pgto,
  'AV', 0.10,      -- avista: 10%
  'CC', 0.05,      -- cartao: 5%
  'BO', 0.02,      -- boleto: 2%
  0);               -- default: 0%
```
**Significado:** Tabela de regras inline. Cada valor do DECODE e uma regra de negocio.

---

## Padroes Java Legado

### BigDecimal (Calculo Monetario)
```java
BigDecimal imposto = baseCalculo
  .multiply(aliquota)
  .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
```
**Significado:** Calculo financeiro com precisao controlada. O RoundingMode e uma regra de arredondamento.

### Calendar/Date (Regras Temporais)
```java
Calendar vencimento = Calendar.getInstance();
vencimento.add(Calendar.DAY_OF_MONTH, 30);
if (hoje.after(vencimento)) {
    aplicarMulta(valor, 0.02); // 2% de multa
    aplicarJuros(valor, diasAtraso, 0.001); // 0.1% ao dia
}
```
**Significado:** Regra de vencimento com penalidades. Contem regras de prazo, multa e juros.

### @Deprecated
```java
@Deprecated
public BigDecimal calcularICMSAntigo(BigDecimal base) {
    // Regra anterior a reforma de 2019
    return base.multiply(new BigDecimal("0.18"));
}
```
**Significado:** Regra desativada mas preservada. Pode indicar transicao entre versoes de uma regra.

---

## Padroes Visual Basic

### Select Case
```vb
Select Case TipoCliente
  Case "VIP"
    Desconto = 0.15
  Case "PREMIUM"
    Desconto = 0.10
  Case "REGULAR"
    Desconto = 0.05
  Case Else
    Desconto = 0
End Select
```
**Significado:** Classificacao de negocio com tratamento diferenciado por categoria.

### On Error (Error Handling as Business Rules)
```vb
On Error GoTo ErroValidacao
If IsNull(txtCPF.Text) Or Len(txtCPF.Text) <> 11 Then
    MsgBox "CPF invalido!", vbCritical
    Exit Sub
End If
```
**Significado:** Validacao de campo com feedback ao usuario. O MsgBox contem a regra em linguagem natural.

---

## Padroes RPG (AS/400)

### CHAIN + IF (Lookup Business Rules)
```rpg
CHAIN clienteKey CLIENTES;
IF %FOUND(CLIENTES);
  IF limiteCredito < valorPedido;
    *INLR = *ON;
    // Rejeita pedido por limite de credito
  ENDIF;
ENDIF;
```
**Significado:** Validacao de credito com lookup em tabela. Padrao classico de regra de negocio em RPG.

---

## Indicadores Universais de Regras de Negocio

### Palavras-chave em Comentarios
Comentarios contendo estas palavras quase sempre indicam regras de negocio:
- regra, rule, lei, norma, portaria, decreto
- validacao, validation, constraint
- calculo, formula, aliquota, taxa
- desconto, multa, juros, prazo
- obrigatorio, mandatory, required
- proibido, blocked, nao permitido
- TODO, FIXME, HACK (regras temporarias ou pendentes)

### Magic Numbers Comuns
| Valor | Possivel Significado |
|-------|---------------------|
| 0.01, 0.02, 0.05, 0.10 | Percentuais (1%, 2%, 5%, 10%) |
| 30, 60, 90, 120 | Prazos em dias |
| 11, 14 | Digitos de CPF, CNPJ |
| 8, 9 | Digitos de CEP |
| 365, 366 | Dias no ano |
| 12 | Meses |
| 22, 44 | Horas de trabalho (semanal, mensal) |
| 100, 1000, 10000 | Limites/faixas |

---

*Knowledge Base v1.0.0 — Legacy Rule Extractor*
