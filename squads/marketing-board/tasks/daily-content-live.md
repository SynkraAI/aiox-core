# Task: Daily Content LIVE — OPES Big Brother Mode

**Task ID**: daily-content-live
**Agent**: @marketing-ideation → @marketing-cmo → @marketing-production → @marketing-designer → @marketing-distribution → @auto-publish
**Version**: 1.0.0

---

## Purpose

Executar o pipeline `daily-content` com emissão de eventos em tempo real para o **OPES Big Brother** — a visualização espacial dos agentes trabalhando.

Antes de iniciar, abre `outputs/hubs/marketing/opes-big-brother.html` no browser e clica em **LIVE**.

---

## Pre-requisitos

1. HTTP server rodando: `python3 -m http.server 8080` (no dir `outputs/hubs/marketing/`)
2. Browser aberto em `http://localhost:8080/opes-big-brother.html` com modo **LIVE** ativado

---

## Como Funciona

Esta task é um wrapper do `daily-content` que adiciona chamadas ao `emit_event.py` em cada etapa. O pipeline real roda normalmente, mas cada passo emite eventos que a UI consome via polling.

---

## Emit Helper

```bash
E=".aios-core/expansion-packs/marketing-opes/scripts/emit_event.py"
```

---

## Workflow (mesmo do daily-content, com emissões)

### Inicialização

```bash
python3 "$E" --clear
```

### Step 2: Ideação

```bash
python3 "$E" ideation start "Consultando Content Map..." step=2
```

> Executar ideação normalmente. A cada pensamento relevante:

```bash
python3 "$E" ideation think "Descrição do que está pensando"
```

> Ao terminar, apresentar ao CMO:

```bash
python3 "$E" ideation say "Resumo dos ângulos" to=cmo
```

### Step 2.5: CMO Gate

```bash
python3 "$E" cmo think "Avaliando Big Idea..."
```

> Se aprovado:

```bash
python3 "$E" cmo gate "Purple Cow X/5 — Aprovado" step=2.5 result=approved from=ideation
python3 "$E" ideation walk_from_gate "Aprovado" nextAgent=production
```

> Se reprovado:

```bash
python3 "$E" cmo gate "Motivo da reprovação" step=2.5 result=vetoed from=ideation
```

### Step 3: Produção

```bash
python3 "$E" production start "Escrevendo post..." step=3
python3 "$E" production think "Descrição do processo"
python3 "$E" production say "Post pronto" to=designer
```

### Step 3.5: Designer

```bash
python3 "$E" designer start "Avaliando formato visual..." step=3.5
python3 "$E" designer think "Decisão de formato"
python3 "$E" designer say "Visual Brief pronto" to=distribution
```

### Step 4: Distribuição

```bash
python3 "$E" distribution start "Adaptando para plataformas..." step=4
python3 "$E" distribution think "Adaptação IG/LinkedIn"
python3 "$E" distribution walk_to_gate "Pedindo autorizacao de publish" gate=6
```

### Step 6: Gate 6 (Publish)

```bash
python3 "$E" gate6 think "Verificando compliance..."
python3 "$E" gate6 gate "Publish autorizado" step=6 result=approved from=distribution
python3 "$E" distribution walk_from_gate "Seguindo pro Metrics" nextAgent=metrics
```

### Step 7: Metrics

```bash
python3 "$E" metrics start "Registrando dados..." step=7
python3 "$E" metrics think "IDs registrados"
```

### Complete

```bash
python3 "$E" system complete "Pipeline completo."
```

---

## Uso

```
/daily-content-live
/daily-content-live auto=true
/daily-content-live contexto="algo que aconteceu hoje"
```

Aceita os mesmos parâmetros do `/daily-content`. A diferença é que emite eventos pro Big Brother em cada etapa.

---

## Regras de Emissão

1. **Sempre limpar** eventos no início (`--clear`)
2. **Um `start`** por agente quando ele entra em cena
3. **`think`** para cada raciocínio interno relevante (typing dots na UI)
4. **`say`** quando entrega trabalho para o próximo (agente caminha até o destino)
5. **`gate`** com `result=approved` ou `result=vetoed` nos gates
6. **`walk_to_gate`** quando agente vai até um gate
7. **`walk_from_gate`** após aprovação, com `nextAgent=` destino
8. **`complete`** quando pipeline termina (todos voltam às salas)

---

*Task v1.0.0 — OPES Big Brother Live Mode*
